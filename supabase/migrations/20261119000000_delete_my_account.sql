-- Self-service account deletion (required by the App Store and Google Play).
-- Customers only: staff/admin accounts hold payroll records and are removed by an admin.
-- Deleting the auth user cascades to the profile and the customer's bookings;
-- contact messages stay (user_id set to null) for complaint handling.
create or replace function public.delete_my_account()
returns void language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Please log in again.' using errcode = '42501';
  end if;
  if (select role from public.profiles where id = uid) is distinct from 'customer' then
    raise exception 'Staff and admin accounts can''t be deleted here. Please ask an Omegs admin to remove it.' using errcode = '42501';
  end if;
  if exists (
    select 1 from public.bookings
    where customer_id = uid and status in ('requested', 'confirmed')
      and booking_date >= (now() at time zone public.business_timezone())::date
  ) then
    raise exception 'Please cancel your upcoming bookings first, then delete your account.' using errcode = 'P0001';
  end if;
  delete from auth.users where id = uid;
end $$;

revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
