-- Omegs initial schema: profiles & roles, services, bookings, contact messages, employee time entries.
-- Every table has row level security (RLS). Privileged fields are guarded by triggers.

begin;

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------
create type public.user_role as enum ('customer', 'employee', 'admin');
create type public.booking_status as enum ('requested', 'confirmed', 'completed', 'cancelled');
create type public.time_entry_status as enum ('submitted', 'approved', 'rejected');
create type public.contact_status as enum ('new', 'read', 'archived');

-- ---------------------------------------------------------------------------
-- Settings
-- ---------------------------------------------------------------------------
-- Local time zone of the business, used to decide whether a booking has started.
create or replace function public.business_timezone()
returns text language sql immutable set search_path = '' as $$ select 'UTC'::text $$;

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null default '',
  full_name text not null default '' check (char_length(full_name) <= 120),
  phone text check (char_length(phone) <= 30),
  role public.user_role not null default 'customer',
  hourly_rate numeric(10, 2) check (hourly_rate >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_role_idx on public.profiles (role);

create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- Role helpers. SECURITY DEFINER so they can read profiles without recursing into RLS.
create or replace function public.current_user_role()
returns public.user_role language sql stable security definer set search_path = '' as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false)
$$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce((select role in ('employee', 'admin') from public.profiles where id = auth.uid()), false)
$$;

-- Create a profile for every new auth user. Everyone starts as a customer.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, full_name, phone)
  values (
    new.id,
    coalesce(new.email, ''),
    left(coalesce(new.raw_user_meta_data ->> 'full_name', ''), 120),
    nullif(left(coalesce(new.raw_user_meta_data ->> 'phone', ''), 30), '')
  );
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.handle_user_email_change()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  update public.profiles set email = coalesce(new.email, '') where id = new.id;
  return new;
end $$;

create trigger on_auth_user_email_changed after update of email on auth.users
  for each row when (old.email is distinct from new.email)
  execute function public.handle_user_email_change();

-- Only admins may change role, hourly rate or email; the last admin cannot be demoted.
-- Direct database access (no signed-in user, e.g. the SQL editor) is trusted.
create or replace function public.guard_profile_update()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.id is distinct from old.id then
    raise exception 'Profile id cannot be changed';
  end if;
  if auth.uid() is not null and not public.is_admin() then
    if new.role is distinct from old.role
       or new.hourly_rate is distinct from old.hourly_rate
       or new.email is distinct from old.email then
      raise exception 'Only an admin can change role, hourly rate or email' using errcode = '42501';
    end if;
  end if;
  if old.role = 'admin' and new.role <> 'admin'
     and (select count(*) from public.profiles where role = 'admin') <= 1 then
    raise exception 'The last admin cannot be demoted';
  end if;
  return new;
end $$;

create trigger profiles_guard_update before update on public.profiles
  for each row execute function public.guard_profile_update();

-- ---------------------------------------------------------------------------
-- Services (descriptions and images live in the frontend; this is the bookable list)
-- ---------------------------------------------------------------------------
create table public.services (
  id text primary key check (id ~ '^[a-z0-9-]+$'),
  name text not null check (char_length(name) between 2 and 120),
  category text not null check (category in ('residential', 'commercial', 'specialty')),
  is_active boolean not null default true,
  starting_price numeric(10, 2) check (starting_price >= 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger services_set_updated_at before update on public.services
  for each row execute function public.set_updated_at();

insert into public.services (id, name, category, sort_order) values
  ('home-cleaning', 'Home Cleaning', 'residential', 1),
  ('deep-cleaning', 'Deep Cleaning', 'residential', 2),
  ('office-cleaning', 'Office Cleaning', 'commercial', 3),
  ('move-in-move-out', 'Move-In / Move-Out Cleaning', 'residential', 4),
  ('sofa-upholstery', 'Sofa & Upholstery Cleaning', 'specialty', 5),
  ('post-construction', 'Post-Construction Cleaning', 'specialty', 6);

-- ---------------------------------------------------------------------------
-- Bookings
-- ---------------------------------------------------------------------------
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  service_id text not null references public.services (id),
  booking_date date not null,
  time_slot time not null check (time_slot between '08:00' and '17:00'),
  address text not null check (char_length(address) between 5 and 300),
  property_size text not null check (char_length(property_size) between 1 and 60),
  notes text check (char_length(notes) <= 1000),
  status public.booking_status not null default 'requested',
  assigned_employee_id uuid references public.profiles (id) on delete set null,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index bookings_customer_idx on public.bookings (customer_id, booking_date);
create index bookings_employee_idx on public.bookings (assigned_employee_id, booking_date);
create index bookings_date_idx on public.bookings (booking_date);

create trigger bookings_set_updated_at before update on public.bookings
  for each row execute function public.set_updated_at();

create or replace function public.booking_has_started(d date, t time)
returns boolean language sql stable set search_path = '' as $$
  select (d + t) <= (now() at time zone public.business_timezone())
$$;

-- Customers create requests for the future and may only cancel before the booking starts.
create or replace function public.guard_booking()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or public.is_admin() then
    if tg_op = 'UPDATE' and new.status = 'cancelled' and old.status <> 'cancelled' then
      new.cancelled_at := now();
    end if;
    if new.assigned_employee_id is not null and not exists (
      select 1 from public.profiles where id = new.assigned_employee_id and role in ('employee', 'admin')
    ) then
      raise exception 'Bookings can only be assigned to employees';
    end if;
    return new;
  end if;

  if tg_op = 'INSERT' then
    if public.booking_has_started(new.booking_date, new.time_slot) then
      raise exception 'Please choose a date and time in the future';
    end if;
    if not exists (select 1 from public.services where id = new.service_id and is_active) then
      raise exception 'This service is not available';
    end if;
    new.customer_id := auth.uid();
    new.status := 'requested';
    new.assigned_employee_id := null;
    new.cancelled_at := null;
    return new;
  end if;

  -- UPDATE by a non-admin: only cancelling their own upcoming booking is allowed.
  if new.status <> 'cancelled' or old.status not in ('requested', 'confirmed')
     or (new.customer_id, new.service_id, new.booking_date, new.time_slot, new.address,
         new.property_size, new.notes, new.assigned_employee_id, new.created_at)
        is distinct from
        (old.customer_id, old.service_id, old.booking_date, old.time_slot, old.address,
         old.property_size, old.notes, old.assigned_employee_id, old.created_at) then
    raise exception 'You can only cancel an upcoming booking' using errcode = '42501';
  end if;
  if public.booking_has_started(old.booking_date, old.time_slot) then
    raise exception 'This booking has already started and can no longer be cancelled';
  end if;
  new.cancelled_at := now();
  return new;
end $$;

create trigger bookings_guard before insert or update on public.bookings
  for each row execute function public.guard_booking();

-- ---------------------------------------------------------------------------
-- Contact messages
-- ---------------------------------------------------------------------------
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid default auth.uid() references public.profiles (id) on delete set null,
  name text not null check (char_length(btrim(name)) between 2 and 120),
  email text not null check (char_length(email) <= 254 and email ~* '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$'),
  subject text not null check (char_length(btrim(subject)) between 3 and 150),
  message text not null check (char_length(btrim(message)) between 10 and 5000),
  status public.contact_status not null default 'new',
  created_at timestamptz not null default now()
);

create index contact_messages_created_idx on public.contact_messages (created_at desc);

-- ---------------------------------------------------------------------------
-- Time entries (employee timesheets)
-- ---------------------------------------------------------------------------
create table public.time_entries (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  booking_id uuid references public.bookings (id) on delete set null,
  work_date date not null,
  start_time time not null,
  end_time time not null,
  break_minutes integer not null default 0 check (break_minutes between 0 and 600),
  hours numeric(6, 2) generated always as (
    round(((extract(epoch from (end_time - start_time)) / 60 - break_minutes) / 60)::numeric, 2)
  ) stored,
  hourly_rate numeric(10, 2) not null default 0 check (hourly_rate >= 0),
  pay numeric(12, 2) generated always as (
    round(((extract(epoch from (end_time - start_time)) / 60 - break_minutes) / 60)::numeric * hourly_rate, 2)
  ) stored,
  notes text check (char_length(notes) <= 1000),
  status public.time_entry_status not null default 'submitted',
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  review_note text check (char_length(review_note) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint time_entries_end_after_start check (end_time > start_time),
  constraint time_entries_break_shorter_than_shift
    check (break_minutes * 60 < extract(epoch from (end_time - start_time)))
);

create index time_entries_employee_idx on public.time_entries (employee_id, work_date desc);
create index time_entries_status_idx on public.time_entries (status, work_date desc);

create trigger time_entries_set_updated_at before update on public.time_entries
  for each row execute function public.set_updated_at();

-- Employees log their own hours at their current rate; approval is admin-only and locks the entry.
create or replace function public.guard_time_entry()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or public.is_admin() then
    if tg_op = 'INSERT' and new.hourly_rate = 0 then
      new.hourly_rate := coalesce((select hourly_rate from public.profiles where id = new.employee_id), 0);
    end if;
    if tg_op = 'UPDATE' and new.status is distinct from old.status then
      new.reviewed_by := auth.uid();
      new.reviewed_at := case when new.status = 'submitted' then null else now() end;
    end if;
    return new;
  end if;

  if new.work_date > (now() at time zone public.business_timezone())::date then
    raise exception 'Hours cannot be logged for a future date';
  end if;
  if new.booking_id is not null and not exists (
    select 1 from public.bookings where id = new.booking_id and assigned_employee_id = auth.uid()
  ) then
    raise exception 'You can only link hours to a job assigned to you';
  end if;

  if tg_op = 'INSERT' then
    new.employee_id := auth.uid();
    new.hourly_rate := coalesce((select hourly_rate from public.profiles where id = auth.uid()), 0);
  else
    if old.status = 'approved' then
      raise exception 'Approved hours can no longer be edited' using errcode = '42501';
    end if;
    new.employee_id := old.employee_id;
    new.hourly_rate := old.hourly_rate;
    new.created_at := old.created_at;
  end if;
  -- Any employee change (re)submits the entry for review.
  new.status := 'submitted';
  new.reviewed_by := null;
  new.reviewed_at := null;
  new.review_note := null;
  return new;
end $$;

create trigger time_entries_guard before insert or update on public.time_entries
  for each row execute function public.guard_time_entry();

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.bookings enable row level security;
alter table public.contact_messages enable row level security;
alter table public.time_entries enable row level security;

-- profiles
create policy "Users read own profile" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "Admins read all profiles" on public.profiles
  for select to authenticated using ((select public.is_admin()));
create policy "Employees read customers of their assigned jobs" on public.profiles
  for select to authenticated using (
    exists (select 1 from public.bookings b
            where b.customer_id = profiles.id and b.assigned_employee_id = (select auth.uid()))
  );
create policy "Users update own profile" on public.profiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy "Admins update profiles" on public.profiles
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- services
create policy "Anyone reads active services" on public.services
  for select to anon, authenticated using (is_active or (select public.is_admin()));
create policy "Admins manage services" on public.services
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- bookings
create policy "Customers read own bookings" on public.bookings
  for select to authenticated using (customer_id = (select auth.uid()));
create policy "Employees read assigned bookings" on public.bookings
  for select to authenticated using (assigned_employee_id = (select auth.uid()));
create policy "Admins read all bookings" on public.bookings
  for select to authenticated using ((select public.is_admin()));
create policy "Customers create own bookings" on public.bookings
  for insert to authenticated with check (customer_id = (select auth.uid()));
create policy "Customers cancel own bookings" on public.bookings
  for update to authenticated using (customer_id = (select auth.uid())) with check (customer_id = (select auth.uid()));
create policy "Admins update bookings" on public.bookings
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins delete bookings" on public.bookings
  for delete to authenticated using ((select public.is_admin()));

-- contact messages
create policy "Visitors send contact messages" on public.contact_messages
  for insert to anon with check (user_id is null and status = 'new');
create policy "Users send contact messages" on public.contact_messages
  for insert to authenticated with check ((user_id is null or user_id = (select auth.uid())) and status = 'new');
create policy "Admins read contact messages" on public.contact_messages
  for select to authenticated using ((select public.is_admin()));
create policy "Admins update contact messages" on public.contact_messages
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins delete contact messages" on public.contact_messages
  for delete to authenticated using ((select public.is_admin()));

-- time entries
create policy "Employees read own time entries" on public.time_entries
  for select to authenticated using (employee_id = (select auth.uid()));
create policy "Admins read all time entries" on public.time_entries
  for select to authenticated using ((select public.is_admin()));
create policy "Employees log own hours" on public.time_entries
  for insert to authenticated with check (employee_id = (select auth.uid()) and (select public.is_staff()));
create policy "Employees edit own unapproved hours" on public.time_entries
  for update to authenticated
  using (employee_id = (select auth.uid()) and status <> 'approved')
  with check (employee_id = (select auth.uid()));
create policy "Employees delete own unapproved hours" on public.time_entries
  for delete to authenticated using (employee_id = (select auth.uid()) and status <> 'approved');
create policy "Admins manage time entries" on public.time_entries
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Privileges: visitors may only read services and send contact messages.
-- ---------------------------------------------------------------------------
revoke all on public.profiles, public.bookings, public.time_entries from anon;
revoke all on public.contact_messages from anon;
grant insert on public.contact_messages to anon;
revoke all on public.services from anon;
grant select on public.services to anon;

revoke execute on function public.handle_new_user(), public.handle_user_email_change(),
  public.guard_profile_update(), public.guard_booking(), public.guard_time_entry()
  from public, anon, authenticated;

commit;
