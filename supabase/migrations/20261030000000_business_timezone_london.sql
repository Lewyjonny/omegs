-- Omegs operates in the UK: "today" and booking start times follow UK time (GMT/BST).
create or replace function public.business_timezone()
returns text language sql immutable set search_path = '' as $$ select 'Europe/London'::text $$;
