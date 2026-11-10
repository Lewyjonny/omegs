// Sends Omegs notification emails through Resend. Called only by the database
// triggers in supabase/migrations/20261101000000_email_notifications.sql.
import { createClient } from 'npm:@supabase/supabase-js@2';

const env = (key: string) => Deno.env.get(key) ?? '';
const supabase = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'));
const from = env('EMAIL_FROM') || 'Omegs Cleaning <noreply@omegscleaning.co.uk>';
const businessEmail = env('BUSINESS_EMAIL') || 'info@omegscleaning.co.uk';
const siteUrl = (env('SITE_URL') || 'https://lewyjonny.github.io/omegs').replace(/\/$/, '');

type Row = Record<string, unknown>;
type Booking = Row & { customer: { full_name: string; email: string; phone: string | null } | null; service: { name: string } | null };

const escapeHtml = (value: unknown) =>
  String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const formatDate = (date: unknown) =>
  new Date(`${date}T12:00:00Z`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

function emailHtml(heading: string, intro: string, rows: [string, unknown][], link?: [string, string]) {
  const table = rows
    .filter(([, value]) => value !== null && value !== undefined && value !== '')
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#64748b;vertical-align:top;white-space:nowrap">${escapeHtml(label)}</td><td style="padding:6px 0;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`,
    )
    .join('');
  const button = link
    ? `<p style="margin:24px 0"><a href="${escapeHtml(link[1])}" style="background:#0f766e;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">${escapeHtml(link[0])}</a></p>`
    : '';
  return `<div style="font-family:Arial,sans-serif;font-size:15px;color:#0f172a;max-width:560px">
<h2 style="color:#0f766e">${escapeHtml(heading)}</h2><p>${escapeHtml(intro)}</p>
<table style="border-collapse:collapse">${table}</table>${button}
<p style="color:#64748b;font-size:13px;margin-top:32px">Omegs Cleaning Services · ${escapeHtml(businessEmail)} · +44 7565 666 871</p></div>`;
}

async function send(to: string, subject: string, html: string, replyTo?: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [to], subject, html, reply_to: replyTo }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status} sending "${subject}": ${await res.text()}`);
}

async function loadBooking(id: unknown): Promise<Booking> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, customer:profiles!customer_id(full_name, email, phone), service:services(name)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Booking;
}

const bookingRows = (b: Booking): [string, unknown][] => [
  ['Service', b.service?.name ?? b.service_id],
  ['Date', formatDate(b.booking_date)],
  ['Time', String(b.time_slot).slice(0, 5)],
  ['Address', b.address],
  ['Property size', b.property_size],
  ['Notes', b.notes],
];

async function onNewBooking(record: Row) {
  const b = await loadBooking(record.id);
  const customer = b.customer;
  await send(
    businessEmail,
    `New booking: ${b.service?.name ?? b.service_id} on ${formatDate(b.booking_date)}`,
    emailHtml('New booking request', 'A customer has requested a booking.', [
      ['Customer', customer?.full_name],
      ['Email', customer?.email],
      ['Phone', customer?.phone],
      ...bookingRows(b),
    ], ['Open admin page', `${siteUrl}/admin`]),
    customer?.email,
  );
  if (customer?.email) {
    await send(
      customer.email,
      'We have received your Omegs booking request',
      emailHtml(
        `Thanks${customer.full_name ? `, ${customer.full_name}` : ''}!`,
        'We have received your booking request. We will confirm it shortly. You can view or cancel it from your account.',
        bookingRows(b),
        ['View my bookings', `${siteUrl}/account`],
      ),
      businessEmail,
    );
  }
}

async function onStatusChange(record: Row) {
  const b = await loadBooking(record.id);
  const customer = b.customer;
  if (b.status === 'confirmed' && customer?.email) {
    await send(
      customer.email,
      `Your Omegs booking is confirmed: ${formatDate(b.booking_date)}`,
      emailHtml('Your booking is confirmed', 'Good news, your cleaning is booked in. See you then!', bookingRows(b), ['View my bookings', `${siteUrl}/account`]),
      businessEmail,
    );
  }
  if (b.status === 'cancelled') {
    await send(
      businessEmail,
      `Booking cancelled: ${b.service?.name ?? b.service_id} on ${formatDate(b.booking_date)}`,
      emailHtml('Booking cancelled', 'This booking has been cancelled.', [['Customer', customer?.full_name], ['Email', customer?.email], ...bookingRows(b)]),
      customer?.email,
    );
    if (customer?.email) {
      await send(
        customer.email,
        'Your Omegs booking has been cancelled',
        emailHtml('Booking cancelled', 'Your booking has been cancelled. If this was a mistake, just book again or reply to this email.', bookingRows(b), ['Book again', `${siteUrl}/book`]),
        businessEmail,
      );
    }
  }
}

async function onContactMessage(record: Row) {
  await send(
    businessEmail,
    `New message: ${record.subject}`,
    emailHtml('New contact message', 'Someone sent a message through the website. Reply to this email to answer them.', [
      ['Name', record.name],
      ['Email', record.email],
      ['Subject', record.subject],
      ['Message', record.message],
    ], ['Open admin page', `${siteUrl}/admin`]),
    String(record.email),
  );
}

Deno.serve(async (req) => {
  const secret = env('NOTIFY_WEBHOOK_SECRET');
  if (req.method !== 'POST' || !secret || req.headers.get('x-webhook-secret') !== secret) {
    return new Response('Unauthorized', { status: 401 });
  }
  const { type, table, record, old_record: oldRecord } = await req.json();
  try {
    if (table === 'bookings' && type === 'INSERT') await onNewBooking(record);
    else if (table === 'bookings' && type === 'UPDATE' && record.status !== oldRecord?.status) await onStatusChange(record);
    else if (table === 'contact_messages' && type === 'INSERT') await onContactMessage(record);
    return Response.json({ ok: true });
  } catch (error) {
    console.error(error);
    return Response.json({ ok: false, error: String(error) }, { status: 502 });
  }
});
