-- Email notifications: new bookings, booking status changes and contact messages
-- call the "notify" Edge Function, which sends the emails through Resend.
-- The shared secret lives in Vault as 'notify_webhook_secret' (and as the
-- function's NOTIFY_WEBHOOK_SECRET); without it no request is sent.
create extension if not exists pg_net with schema extensions;

create or replace function public.notify_email()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  secret text := (select decrypted_secret from vault.decrypted_secrets where name = 'notify_webhook_secret');
begin
  if secret is not null then
    perform net.http_post(
      url := 'https://xqirplrapdetueyftxvh.supabase.co/functions/v1/notify',
      headers := jsonb_build_object('Content-Type', 'application/json', 'x-webhook-secret', secret),
      body := jsonb_build_object(
        'type', tg_op,
        'table', tg_table_name,
        'record', to_jsonb(new),
        'old_record', case when tg_op = 'UPDATE' then to_jsonb(old) end
      ),
      timeout_milliseconds := 10000
    );
  end if;
  return null;
end $$;

revoke execute on function public.notify_email() from public, anon, authenticated;

create trigger bookings_notify_email
  after insert or update of status on public.bookings
  for each row execute function public.notify_email();

create trigger contact_messages_notify_email
  after insert on public.contact_messages
  for each row execute function public.notify_email();
