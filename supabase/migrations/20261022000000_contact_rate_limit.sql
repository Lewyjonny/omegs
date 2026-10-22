-- Contact form: limit each email address to 3 messages per 10 minutes to curb spam.
create index contact_messages_email_recent_idx on public.contact_messages (lower(email), created_at desc);

create or replace function public.limit_contact_messages()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (
    select count(*) from public.contact_messages
    where lower(email) = lower(new.email) and created_at > now() - interval '10 minutes'
  ) >= 3 then
    raise exception 'Too many messages from this email address. Please wait a few minutes.' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

revoke execute on function public.limit_contact_messages() from public, anon, authenticated;

create trigger contact_messages_rate_limit
  before insert on public.contact_messages
  for each row execute function public.limit_contact_messages();
