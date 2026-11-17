-- Admin-editable site content: service details, page text and images.

begin;

-- ---------------------------------------------------------------------------
-- Service details (shown on the services pages)
-- ---------------------------------------------------------------------------
alter table public.services
  add column short_description text not null default '' check (char_length(short_description) <= 300),
  add column description text not null default '' check (char_length(description) <= 4000),
  add column icon text not null default 'sparkles' check (icon ~ '^[a-z-]{1,40}$'),
  add column image_url text check (char_length(image_url) <= 1000),
  add column image_alt text not null default '' check (char_length(image_alt) <= 300),
  add column benefits text[] not null default '{}' check (cardinality(benefits) <= 20),
  add column included text[] not null default '{}' check (cardinality(included) <= 30),
  add column ideal_for text[] not null default '{}' check (cardinality(ideal_for) <= 20),
  add column price_unit text not null default 'per visit' check (char_length(price_unit) <= 40),
  add column faqs jsonb not null default '[]' check (jsonb_typeof(faqs) = 'array');

-- ---------------------------------------------------------------------------
-- Page content: one JSON document per section
-- ---------------------------------------------------------------------------
create table public.site_content (
  key text primary key check (key in ('business', 'home', 'about', 'why_choose', 'faqs', 'testimonials')),
  value jsonb not null check (jsonb_typeof(value) in ('object', 'array') and pg_column_size(value) <= 100000),
  updated_at timestamptz not null default now(),
  updated_by uuid default auth.uid() references public.profiles (id) on delete set null
);

create trigger site_content_set_updated_at before update on public.site_content
  for each row execute function public.set_updated_at();

create index site_content_updated_by_idx on public.site_content (updated_by);

alter table public.site_content enable row level security;

create policy "Visitors read site content" on public.site_content
  for select to anon using (true);
create policy "Users read site content" on public.site_content
  for select to authenticated using (true);
create policy "Admins add site content" on public.site_content
  for insert to authenticated with check ((select public.is_admin()));
create policy "Admins edit site content" on public.site_content
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins delete site content" on public.site_content
  for delete to authenticated using ((select public.is_admin()));

revoke all on public.site_content from anon, authenticated;
grant select on public.site_content to anon;
grant select, insert, update, delete on public.site_content to authenticated;

-- ---------------------------------------------------------------------------
-- Images: public to view, only admins can upload, replace or delete
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-images', 'site-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- Public URLs serve the images; listing and deleting needs this admin-only read rule.
create policy "Admins read site images" on storage.objects
  for select to authenticated
  using (bucket_id = 'site-images' and (select public.is_admin()));

create policy "Admins upload site images" on storage.objects
  for insert to authenticated with check (bucket_id = 'site-images' and (select public.is_admin()));
create policy "Admins update site images" on storage.objects
  for update to authenticated using (bucket_id = 'site-images' and (select public.is_admin()))
  with check (bucket_id = 'site-images' and (select public.is_admin()));
create policy "Admins delete site images" on storage.objects
  for delete to authenticated using (bucket_id = 'site-images' and (select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Current service details
-- ---------------------------------------------------------------------------
update public.services set
  short_description = 'Regular upkeep that keeps every room fresh, tidy and comfortable to come home to.',
  description = 'Our standard home cleaning covers the rooms you live in every day. It is ideal as a weekly, bi-weekly or one-off visit to keep your home consistently clean without giving up your free time.',
  icon = 'house',
  image_url = 'images/home-cleaning.webp',
  image_alt = 'Gloved hand scrubbing a kitchen counter with a sponge',
  benefits = array['More free time for the things you enjoy', 'A consistently tidy, welcoming home', 'Flexible one-off or recurring visits']::text[],
  included = array['Dusting of reachable surfaces and furniture', 'Vacuuming and mopping of floors', 'Kitchen counters, sink and exterior of appliances', 'Bathroom sinks, toilets, showers and mirrors', 'Emptying bins and tidying common areas']::text[],
  ideal_for = array['Apartments and houses', 'Busy households', 'Recurring maintenance']::text[],
  price_unit = 'per visit',
  faqs = '[{"question":"Do I need to provide cleaning supplies?","answer":"Supply arrangements can be confirmed when you book. Let us know in the booking notes if you prefer specific products to be used."},{"question":"Can I set up recurring cleanings?","answer":"Yes — you can request weekly, bi-weekly or monthly visits and manage them from the Omegs app."}]'::jsonb
where id = 'home-cleaning';

update public.services set
  short_description = 'A detailed top-to-bottom clean that reaches the corners everyday cleaning misses.',
  description = 'Deep cleaning goes beyond routine upkeep to tackle built-up grime, hard-to-reach areas and detailed surfaces. It is a great reset before a special occasion, at the change of seasons, or before starting a regular cleaning plan.',
  icon = 'sparkles',
  image_url = 'images/deep-cleaning.webp',
  image_alt = 'Mop cleaning a polished hardwood floor',
  benefits = array['A full reset for your space', 'Attention to detail in every room', 'A cleaner baseline for regular upkeep']::text[],
  included = array['Everything in Home Cleaning', 'Baseboards, door frames and light switches', 'Inside microwave and detailed kitchen degreasing', 'Descaling of bathroom fixtures and tile grout', 'Hard-to-reach dusting, vents and skirting']::text[],
  ideal_for = array['Seasonal cleaning', 'First-time customers', 'Homes that need extra attention']::text[],
  price_unit = 'per visit',
  faqs = '[{"question":"How long does a deep clean take?","answer":"Duration depends on the size and condition of the property. An estimate is provided when your booking is confirmed."},{"question":"How often should I book a deep clean?","answer":"Many customers schedule a deep clean a few times a year, combined with regular home cleaning in between."}]'::jsonb
where id = 'deep-cleaning';

update public.services set
  short_description = 'Clean, healthy workspaces that help your team focus and make a great impression.',
  description = 'Office cleaning keeps desks, meeting rooms, kitchens and washrooms in great shape. Visits can be scheduled outside working hours to avoid disruption to your team.',
  icon = 'building-complex',
  image_url = 'images/office-cleaning.webp',
  image_alt = 'Bright modern open-plan office with desks and plants',
  benefits = array['A professional environment for clients and staff', 'Scheduling around your business hours', 'Consistent standards every visit']::text[],
  included = array['Desks, workstations and shared surfaces', 'Meeting rooms and reception areas', 'Office kitchen and break rooms', 'Washroom cleaning and restocking on request', 'Floor care and waste removal']::text[],
  ideal_for = array['Small and mid-sized offices', 'Co-working spaces', 'Studios and clinics']::text[],
  price_unit = 'per visit',
  faqs = '[{"question":"Can cleaning happen after business hours?","answer":"Yes. You can request early-morning, evening or weekend time slots when booking."},{"question":"Do you offer recurring commercial contracts?","answer":"Recurring schedules can be arranged. Contact us with your requirements to discuss options."}]'::jsonb
where id = 'office-cleaning';

update public.services set
  short_description = 'Start fresh in a new place, or leave your old one spotless for the next occupants.',
  description = 'Moving is stressful enough. Our move-in and move-out cleaning prepares an empty property thoroughly — inside cabinets, appliances and every room — so you can hand over keys or settle in with confidence.',
  icon = 'package-open',
  image_url = 'images/move-in-out.webp',
  image_alt = 'Empty, sunlit living room with hardwood floors',
  benefits = array['Less stress on moving day', 'Helps with handover inspections', 'A truly fresh start in your new home']::text[],
  included = array['Inside cabinets, drawers and closets', 'Inside oven and refrigerator (when empty)', 'Full bathroom and kitchen sanitising', 'Walls spot-cleaning and skirting boards', 'Floors vacuumed and mopped throughout']::text[],
  ideal_for = array['Tenants and landlords', 'Home buyers and sellers', 'Property managers']::text[],
  price_unit = 'per property',
  faqs = '[{"question":"Should the property be empty?","answer":"For the best result, the property should be empty of furniture and belongings at the time of cleaning."},{"question":"Can I book for a specific handover date?","answer":"Yes — choose your preferred date when booking and we will work to confirm availability."}]'::jsonb
where id = 'move-in-move-out';

update public.services set
  short_description = 'Refresh sofas, chairs and fabric furniture to look and feel like new again.',
  description = 'Upholstered furniture collects dust, stains and odours over time. Our upholstery cleaning uses fabric-appropriate methods to lift dirt and refresh your sofas, armchairs, cushions and more.',
  icon = 'sofa',
  image_url = 'images/sofa-upholstery.webp',
  image_alt = 'Light blue sofa with patterned cushions in a bright room',
  benefits = array['Fresher, cleaner-looking furniture', 'Fabric-appropriate cleaning methods', 'Helps extend the life of your upholstery']::text[],
  included = array['Pre-inspection of fabric type and condition', 'Vacuuming of seams and cushions', 'Spot treatment for common stains', 'Fabric-safe deep cleaning', 'Guidance on drying time and aftercare']::text[],
  ideal_for = array['Sofas and sectionals', 'Dining and accent chairs', 'Cushions and headboards']::text[],
  price_unit = 'per item',
  faqs = '[{"question":"Can every stain be removed?","answer":"Results depend on the fabric and the type and age of the stain. We will assess this before cleaning begins."},{"question":"How long does upholstery take to dry?","answer":"Drying time varies by fabric and ventilation. You will receive aftercare guidance on the day."}]'::jsonb
where id = 'sofa-upholstery';

update public.services set
  short_description = 'Remove dust and debris after renovations so your space is ready to enjoy.',
  description = 'Renovations leave behind fine dust, residue and debris in places you would never expect. Post-construction cleaning prepares newly built or renovated spaces for move-in or handover.',
  icon = 'hammer',
  image_url = 'images/post-construction.webp',
  image_alt = 'Newly renovated room with fresh walls and large windows',
  benefits = array['A move-in ready space after works', 'Removal of fine construction dust', 'Detailed finishing on new fixtures']::text[],
  included = array['Removal of light debris and packaging', 'Fine dust removal from surfaces, ledges and vents', 'Window, frame and sill cleaning', 'Cleaning of new fixtures and fittings', 'Floor vacuuming and mopping']::text[],
  ideal_for = array['Home renovations', 'New builds', 'Commercial fit-outs']::text[],
  price_unit = 'per project',
  faqs = '[{"question":"When should I book post-construction cleaning?","answer":"Book once major construction work is complete and contractors have left the site."},{"question":"Do you remove large construction waste?","answer":"Our service covers light debris and dust. Large waste removal should be arranged with your contractor."}]'::jsonb
where id = 'post-construction';

commit;
