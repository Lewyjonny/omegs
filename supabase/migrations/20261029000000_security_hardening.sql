-- Security hardening after the Supabase advisor review.

-- Visitors no longer need is_admin() to read services.
drop policy "Anyone reads active services" on public.services;
create policy "Visitors read active services" on public.services
  for select to anon using (is_active);
create policy "Users read active services" on public.services
  for select to authenticated using (is_active or (select public.is_admin()));

-- Role helpers: only signed-in users need them (RLS policies call them).
revoke execute on function public.is_admin(), public.is_staff() from public, anon;
grant execute on function public.is_admin(), public.is_staff() to authenticated, service_role;

-- Unused helper.
drop function if exists public.current_user_role();

-- Supabase's RLS auto-enable event trigger must not be callable through the API.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

-- The API never needs these table privileges (TRUNCATE also bypasses RLS).
revoke truncate, references, trigger
  on public.profiles, public.services, public.bookings, public.contact_messages, public.time_entries
  from anon, authenticated;

-- Indexes for foreign keys.
create index if not exists bookings_service_idx on public.bookings (service_id);
create index if not exists contact_messages_user_idx on public.contact_messages (user_id);
create index if not exists time_entries_booking_idx on public.time_entries (booking_id);
create index if not exists time_entries_reviewed_by_idx on public.time_entries (reviewed_by);
