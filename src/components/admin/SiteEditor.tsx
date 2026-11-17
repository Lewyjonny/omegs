import { ArrowDown, ArrowUp, Eye, EyeOff, ImagePlus, Pencil, Plus, Trash2, Upload } from 'lucide-react';
import { useId, useState, type ReactNode } from 'react';
import { defaultContent, type ContentKey, type SiteContent } from '../../content/defaults';
import { serviceIcons } from '../../content/icons';
import { serviceCategories } from '../../data/services';
import { useSiteContent } from '../../hooks/useSiteContent';
import { imageSrc } from '../../lib/asset';
import { ContentError, contentService, IMAGE_TYPES, type ServiceRow } from '../../services/content';
import type { Service, ServiceCategory } from '../../types';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';

type Notice = { tone: 'success' | 'error'; text: string } | null;
type FieldDef<T> = { key: keyof T & string; label: string; type?: 'text' | 'textarea' | 'image' | 'email' | 'url' | 'tel'; hint?: string; max?: number };

const errorText = (err: unknown) => (err instanceof ContentError ? err.message : 'Something went wrong. Please try again.');
const lines = (text: string) => text.split('\n').map((l) => l.trim()).filter(Boolean);
const slugify = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);

function Field({ label, hint, children }: { label: string; hint?: string; children: (id: string) => ReactNode }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-navy-800">
        {label}
      </label>
      {children(id)}
      {hint && <p className="mt-1.5 text-xs text-navy-500">{hint}</p>}
    </div>
  );
}

function TextInput({ label, hint, value, onChange, multiline, type = 'text', max }: { label: string; hint?: string; value: string; onChange: (v: string) => void; multiline?: boolean; type?: string; max?: number }) {
  return (
    <Field label={label} hint={hint}>
      {(id) =>
        multiline ? (
          <textarea id={id} className="input min-h-28 py-3" value={value} maxLength={max} onChange={(e) => onChange(e.target.value)} />
        ) : (
          <input id={id} type={type} className="input" value={value} maxLength={max} onChange={(e) => onChange(e.target.value)} />
        )
      }
    </Field>
  );
}

/** Uploads to Supabase Storage and returns the public URL; "Remove" falls back to the original photo. */
function ImageInput({ label, value, fallback, onChange, onError }: { label: string; value: string; fallback?: string; onChange: (v: string) => void; onError: (text: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const shown = value || fallback;
  const upload = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      onChange(await contentService.uploadImage(file));
    } catch (err) {
      onError(errorText(err));
    } finally {
      setUploading(false);
    }
  };
  return (
    <Field label={label} hint="JPG, PNG or WebP, up to 5 MB. Landscape photos look best.">
      {(id) => (
        <div className="flex flex-wrap items-center gap-4">
          {shown ? (
            <img src={imageSrc(shown)} alt="" className="h-24 w-36 rounded-2xl object-cover ring-1 ring-navy-100" />
          ) : (
            <span className="flex h-24 w-36 items-center justify-center rounded-2xl bg-navy-50 text-navy-400">
              <ImagePlus className="h-6 w-6" aria-hidden />
            </span>
          )}
          <div className="flex flex-wrap gap-2">
            <label htmlFor={id} className={`inline-flex h-9 cursor-pointer items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-navy-900 ring-1 ring-inset ring-navy-200 hover:bg-navy-50 ${uploading ? 'pointer-events-none opacity-60' : ''}`}>
              <Upload className="h-4 w-4" aria-hidden /> {uploading ? 'Uploading…' : value ? 'Replace photo' : 'Upload photo'}
            </label>
            <input id={id} type="file" accept={IMAGE_TYPES.join(',')} className="sr-only" onChange={(e) => { void upload(e.target.files?.[0]); e.target.value = ''; }} />
            {value && value !== fallback && (
              <Button variant="ghost" size="sm" onClick={() => onChange(fallback ?? '')}>
                {fallback ? 'Use original photo' : 'Remove photo'}
              </Button>
            )}
          </div>
        </div>
      )}
    </Field>
  );
}

function useSaver() {
  const { reload } = useSiteContent();
  const [notice, setNotice] = useState<Notice>(null);
  const [busy, setBusy] = useState(false);
  const run = async (action: () => Promise<void>, success: string) => {
    setBusy(true);
    setNotice(null);
    try {
      await action();
      await reload();
      setNotice({ tone: 'success', text: success });
      return true;
    } catch (err) {
      setNotice({ tone: 'error', text: errorText(err) });
      return false;
    } finally {
      setBusy(false);
    }
  };
  return { notice, setNotice, busy, run };
}

const NoticeLine = ({ notice }: { notice: Notice }) =>
  notice ? (
    <div role={notice.tone === 'error' ? 'alert' : 'status'}>
      <Alert tone={notice.tone}>{notice.text}</Alert>
    </div>
  ) : null;

/** Deletes uploaded photos that are no longer used after a save. */
const cleanupImages = async (before: string[], after: string[]) => {
  for (const url of before) if (url && !after.includes(url)) await contentService.removeImage(url).catch(() => undefined);
};

function ObjectSection<T extends object>({ sectionKey, title, value, defaults, fields }: { sectionKey: ContentKey; title: string; value: T; defaults: T; fields: FieldDef<T>[] }) {
  const [draft, setDraft] = useState<T>(value);
  const { notice, setNotice, busy, run } = useSaver();
  const get = (k: keyof T) => String(draft[k] ?? '');
  const set = (k: keyof T, v: string) => setDraft((d) => ({ ...d, [k]: v }));
  const images = (o: T) => fields.filter((f) => f.type === 'image').map((f) => String(o[f.key] ?? ''));
  const save = () => run(async () => {
    await contentService.saveSection(sectionKey, draft);
    await cleanupImages(images(value), images(draft));
  }, `${title} saved. The website now shows your changes.`);

  return (
    <form className="card grid gap-5 p-5 sm:p-6" onSubmit={(e) => { e.preventDefault(); void save(); }}>
      <h2 className="text-xl font-semibold">{title}</h2>
      {fields.map((f) =>
        f.type === 'image' ? (
          <ImageInput key={f.key} label={f.label} value={get(f.key)} fallback={String(defaults[f.key])} onChange={(v) => set(f.key, v)} onError={(text) => setNotice({ tone: 'error', text })} />
        ) : (
          <TextInput key={f.key} label={f.label} hint={f.hint} value={get(f.key)} max={f.max ?? (f.type === 'textarea' ? 4000 : 300)} multiline={f.type === 'textarea'} type={f.type} onChange={(v) => set(f.key, v)} />
        ),
      )}
      <NoticeLine notice={notice} />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" loading={busy}>Save changes</Button>
        <Button type="button" variant="outline" disabled={busy} onClick={() => setDraft(value)}>Undo unsaved changes</Button>
        <Button type="button" variant="ghost" disabled={busy} onClick={() => setDraft(defaults)}>Restore original text</Button>
      </div>
    </form>
  );
}

function ListSection<T extends object>({ sectionKey, title, intro, items, defaults, fields, blank, itemLabel }: { sectionKey: ContentKey; title: string; intro?: string; items: T[]; defaults: T[]; fields: FieldDef<T>[]; blank: T; itemLabel: (item: T, i: number) => string }) {
  const [draft, setDraft] = useState<T[]>(items);
  const { notice, busy, run } = useSaver();
  const update = (i: number, k: keyof T, v: string) => setDraft((d) => d.map((item, j) => (j === i ? { ...item, [k]: v } : item)));
  const move = (i: number, by: number) => setDraft((d) => { const n = [...d]; [n[i], n[i + by]] = [n[i + by], n[i]]; return n; });
  const save = () => {
    const clean = draft.filter((item) => fields.some((f) => String(item[f.key] ?? '').trim()));
    return run(() => contentService.saveSection(sectionKey, clean), `${title} saved. The website now shows your changes.`);
  };

  return (
    <form className="card grid gap-5 p-5 sm:p-6" onSubmit={(e) => { e.preventDefault(); void save(); }}>
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        {intro && <p className="mt-1 text-sm text-navy-600">{intro}</p>}
      </div>
      {draft.length === 0 && <p className="rounded-2xl bg-surface p-5 text-sm text-navy-600">Nothing here yet. This section is hidden on the website while it is empty.</p>}
      <ol className="grid gap-4">
        {draft.map((item, i) => (
          <li key={i} className="grid gap-4 rounded-2xl p-4 ring-1 ring-navy-100">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-navy-700">{itemLabel(item, i)}</p>
              <div className="flex gap-1">
                <Button type="button" variant="ghost" size="sm" disabled={i === 0} onClick={() => move(i, -1)} aria-label={`Move ${itemLabel(item, i)} up`}><ArrowUp className="h-4 w-4" /></Button>
                <Button type="button" variant="ghost" size="sm" disabled={i === draft.length - 1} onClick={() => move(i, 1)} aria-label={`Move ${itemLabel(item, i)} down`}><ArrowDown className="h-4 w-4" /></Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setDraft((d) => d.filter((_, j) => j !== i))} aria-label={`Delete ${itemLabel(item, i)}`}><Trash2 className="h-4 w-4 text-red-600" /></Button>
              </div>
            </div>
            {fields.map((f) => (
              <TextInput key={f.key} label={f.label} value={String(item[f.key] ?? '')} max={f.max ?? (f.type === 'textarea' ? 2000 : 200)} multiline={f.type === 'textarea'} onChange={(v) => update(i, f.key, v)} />
            ))}
          </li>
        ))}
      </ol>
      <div>
        <Button type="button" variant="secondary" size="sm" onClick={() => setDraft((d) => [...d, { ...blank }])}><Plus className="h-4 w-4" aria-hidden /> Add another</Button>
      </div>
      <NoticeLine notice={notice} />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" loading={busy}>Save changes</Button>
        <Button type="button" variant="outline" disabled={busy} onClick={() => setDraft(items)}>Undo unsaved changes</Button>
        <Button type="button" variant="ghost" disabled={busy} onClick={() => setDraft(defaults)}>Restore original text</Button>
      </div>
    </form>
  );
}

interface ServiceDraft {
  id: string;
  name: string;
  category: ServiceCategory;
  icon: string;
  shortDescription: string;
  description: string;
  price: string;
  priceUnit: string;
  image: string;
  imageAlt: string;
  benefits: string;
  included: string;
  idealFor: string;
  faqs: { question: string; answer: string }[];
  isActive: boolean;
}

const toDraft = (s?: Service): ServiceDraft => ({
  id: s?.id ?? '',
  name: s?.name ?? '',
  category: s?.category ?? 'residential',
  icon: s?.iconName ?? 'sparkles',
  shortDescription: s?.shortDescription ?? '',
  description: s?.description ?? '',
  price: s?.startingPrice == null ? '' : String(s.startingPrice),
  priceUnit: s?.priceUnit ?? 'per visit',
  image: s?.imagePath ?? '',
  imageAlt: s?.imageAlt ?? '',
  benefits: (s?.benefits ?? []).join('\n'),
  included: (s?.included ?? []).join('\n'),
  idealFor: (s?.idealFor ?? []).join('\n'),
  faqs: s?.faqs ?? [],
  isActive: s?.isActive ?? true,
});

function ServiceForm({ service, nextSort, onDone }: { service?: Service; nextSort: number; onDone: (text: string) => void }) {
  const isNew = !service;
  const [d, setD] = useState<ServiceDraft>(toDraft(service));
  const { notice, setNotice, busy, run } = useSaver();
  const set = <K extends keyof ServiceDraft>(k: K, v: ServiceDraft[K]) => setD((x) => ({ ...x, [k]: v }));
  const id = isNew ? slugify(d.id || d.name) : d.id;

  const save = async () => {
    const price = d.price.trim() === '' ? null : Number(d.price);
    if (d.name.trim().length < 2) return setNotice({ tone: 'error', text: 'Please enter a service name (at least 2 characters).' });
    if (!id) return setNotice({ tone: 'error', text: 'Please enter a web address name using letters and numbers.' });
    if (price !== null && (!Number.isFinite(price) || price < 0)) return setNotice({ tone: 'error', text: 'Please enter a valid starting price, or leave it empty for "Free quote".' });
    const row: Omit<ServiceRow, 'sort_order'> & { sort_order?: number } = {
      id,
      name: d.name.trim(),
      category: d.category,
      icon: d.icon,
      is_active: d.isActive,
      starting_price: price === null ? null : Math.round(price * 100) / 100,
      short_description: d.shortDescription.trim(),
      description: d.description.trim(),
      price_unit: d.priceUnit.trim() || 'per visit',
      image_url: d.image || null,
      image_alt: d.imageAlt.trim(),
      benefits: lines(d.benefits),
      included: lines(d.included),
      ideal_for: lines(d.idealFor),
      faqs: d.faqs.filter((f) => f.question.trim() && f.answer.trim()),
      ...(isNew ? { sort_order: nextSort } : {}),
    };
    const ok = await run(async () => {
      await contentService.saveService(row, isNew);
      await cleanupImages([service?.imagePath ?? ''], [d.image]);
    }, '');
    if (ok) onDone(`${row.name} ${isNew ? 'added' : 'saved'}.`);
  };

  const faq = (i: number, k: 'question' | 'answer', v: string) => set('faqs', d.faqs.map((f, j) => (j === i ? { ...f, [k]: v } : f)));

  return (
    <form className="card grid gap-5 p-5 sm:p-6" onSubmit={(e) => { e.preventDefault(); void save(); }}>
      <h2 className="text-xl font-semibold">{isNew ? 'Add a service' : `Edit ${service.name}`}</h2>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextInput label="Service name" value={d.name} max={120} onChange={(v) => set('name', v)} />
        {isNew ? (
          <TextInput label="Web address name" hint={`Page address: /services/${id || 'your-service'}. Cannot be changed later.`} value={d.id} max={60} onChange={(v) => set('id', v)} />
        ) : (
          <TextInput label="Web address name" hint="Cannot be changed because bookings may use it." value={d.id} onChange={() => undefined} />
        )}
        <Field label="Category">
          {(fid) => (
            <select id={fid} className="input" value={d.category} onChange={(e) => set('category', e.target.value as ServiceCategory)}>
              {serviceCategories.filter((c) => c.id !== 'all').map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          )}
        </Field>
        <Field label="Icon">
          {(fid) => (
            <select id={fid} className="input" value={d.icon} onChange={(e) => set('icon', e.target.value)}>
              {Object.keys(serviceIcons).map((k) => <option key={k} value={k}>{k.replace(/-/g, ' ')}</option>)}
            </select>
          )}
        </Field>
        <TextInput label="Starting price (£)" hint='Leave empty to show "Free quote".' type="number" value={d.price} onChange={(v) => set('price', v)} />
        <TextInput label="Price unit" hint="For example: per visit, per hour, per project." value={d.priceUnit} max={40} onChange={(v) => set('priceUnit', v)} />
      </div>
      <TextInput label="Short description (shown on cards)" value={d.shortDescription} max={300} multiline onChange={(v) => set('shortDescription', v)} />
      <TextInput label="Full description (shown on the service page)" value={d.description} max={4000} multiline onChange={(v) => set('description', v)} />
      <ImageInput label="Photo" value={d.image} onChange={(v) => set('image', v)} onError={(text) => setNotice({ tone: 'error', text })} />
      <TextInput label="Photo description (for screen readers)" value={d.imageAlt} max={300} onChange={(v) => set('imageAlt', v)} />
      <div className="grid gap-5 lg:grid-cols-3">
        <TextInput label="What's included" hint="One item per line." value={d.included} multiline onChange={(v) => set('included', v)} />
        <TextInput label="Benefits" hint="One item per line." value={d.benefits} multiline onChange={(v) => set('benefits', v)} />
        <TextInput label="Ideal for" hint="One item per line." value={d.idealFor} multiline onChange={(v) => set('idealFor', v)} />
      </div>
      <fieldset className="grid gap-4">
        <legend className="mb-2 text-sm font-medium text-navy-800">Questions and answers</legend>
        {d.faqs.map((f, i) => (
          <div key={i} className="grid gap-3 rounded-2xl p-4 ring-1 ring-navy-100">
            <TextInput label={`Question ${i + 1}`} value={f.question} max={300} onChange={(v) => faq(i, 'question', v)} />
            <TextInput label="Answer" value={f.answer} max={2000} multiline onChange={(v) => faq(i, 'answer', v)} />
            <div><Button type="button" variant="ghost" size="sm" onClick={() => set('faqs', d.faqs.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4 text-red-600" aria-hidden /> Delete question</Button></div>
          </div>
        ))}
        <div><Button type="button" variant="secondary" size="sm" onClick={() => set('faqs', [...d.faqs, { question: '', answer: '' }])}><Plus className="h-4 w-4" aria-hidden /> Add question</Button></div>
      </fieldset>
      <label className="flex items-center gap-3 text-sm font-medium text-navy-800">
        <input type="checkbox" className="h-4 w-4 rounded border-navy-300" checked={d.isActive} onChange={(e) => set('isActive', e.target.checked)} />
        Show this service on the website and allow bookings
      </label>
      <NoticeLine notice={notice} />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" loading={busy}>{isNew ? 'Add service' : 'Save service'}</Button>
        <Button type="button" variant="outline" disabled={busy} onClick={() => onDone('')}>Cancel</Button>
      </div>
    </form>
  );
}

function ServicesSection() {
  const { allServices, servicesEditable } = useSiteContent();
  const [editing, setEditing] = useState<Service | 'new' | null>(null);
  const { notice, setNotice, busy, run } = useSaver();

  if (!servicesEditable) return <Alert tone="info">Service editing switches on once the website's database has been updated for site editing.</Alert>;
  if (editing) {
    return (
      <ServiceForm
        service={editing === 'new' ? undefined : editing}
        nextSort={Math.max(0, ...allServices.map((s) => s.sortOrder ?? 0)) + 10}
        onDone={(text) => { setEditing(null); setNotice(text ? { tone: 'success', text } : null); }}
      />
    );
  }

  const toggle = (s: Service) => run(() => contentService.setServiceActive(s.id, !s.isActive), s.isActive ? `${s.name} is now hidden from the website.` : `${s.name} is now shown on the website.`);
  const remove = (s: Service) => {
    if (!window.confirm(`Delete ${s.name} permanently? If it has bookings, hide it instead.`)) return;
    void run(async () => { await contentService.deleteService(s.id); await cleanupImages([s.imagePath ?? ''], []); }, `${s.name} deleted.`);
  };
  const move = (i: number, by: number) => {
    const a = allServices[i];
    const b = allServices[i + by];
    void run(() => contentService.swapServiceOrder(a, b), 'Order saved.');
  };

  return (
    <div className="card grid gap-5 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Services</h2>
          <p className="text-sm text-navy-600">Hidden services stay in old bookings but can't be booked.</p>
        </div>
        <Button size="sm" onClick={() => setEditing('new')}><Plus className="h-4 w-4" aria-hidden /> Add service</Button>
      </div>
      <NoticeLine notice={notice} />
      <ul className="grid gap-3">
        {allServices.map((s, i) => (
          <li key={s.id} className={`flex flex-wrap items-center gap-4 rounded-2xl p-3 ring-1 ring-navy-100 ${s.isActive === false ? 'bg-navy-50/60' : ''}`} aria-label={s.name}>
            <img src={s.image} alt="" className="h-14 w-20 rounded-xl object-cover" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{s.name} {s.isActive === false && <span className="ml-1 rounded-full bg-navy-200 px-2 py-0.5 text-xs font-medium text-navy-700">Hidden</span>}</p>
              <p className="text-sm text-navy-600">{s.startingPrice == null ? 'Free quote' : `From £${s.startingPrice} ${s.priceUnit ?? ''}`}</p>
            </div>
            <div className="flex flex-wrap gap-1">
              <Button variant="ghost" size="sm" disabled={busy || i === 0} onClick={() => move(i, -1)} aria-label={`Move ${s.name} up`}><ArrowUp className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm" disabled={busy || i === allServices.length - 1} onClick={() => move(i, 1)} aria-label={`Move ${s.name} down`}><ArrowDown className="h-4 w-4" /></Button>
              <Button variant="outline" size="sm" disabled={busy} onClick={() => setEditing(s)}><Pencil className="h-4 w-4" aria-hidden /> Edit</Button>
              <Button variant="outline" size="sm" disabled={busy} onClick={() => void toggle(s)}>
                {s.isActive === false ? <><Eye className="h-4 w-4" aria-hidden /> Show</> : <><EyeOff className="h-4 w-4" aria-hidden /> Hide</>}
              </Button>
              <Button variant="ghost" size="sm" disabled={busy} onClick={() => remove(s)} aria-label={`Delete ${s.name}`}><Trash2 className="h-4 w-4 text-red-600" /></Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

type Section = 'services' | 'business' | 'home' | 'about' | 'why' | 'faqs' | 'reviews';
const sections: { id: Section; label: string }[] = [
  { id: 'services', label: 'Services' },
  { id: 'business', label: 'Business details' },
  { id: 'home', label: 'Home page' },
  { id: 'about', label: 'About page' },
  { id: 'why', label: 'Why choose us' },
  { id: 'faqs', label: 'FAQs' },
  { id: 'reviews', label: 'Reviews' },
];

export function SiteEditor() {
  const { content } = useSiteContent();
  const [section, setSection] = useState<Section>('services');
  const c: SiteContent = content;
  const d = defaultContent;

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-2" aria-label="Parts of the site">
        {sections.map((s) => (
          <button key={s.id} type="button" aria-pressed={section === s.id} onClick={() => setSection(s.id)} className={`rounded-full px-4 py-2 text-sm font-medium transition ${section === s.id ? 'bg-mint-400 text-navy-950' : 'bg-white text-navy-700 ring-1 ring-inset ring-navy-200 hover:bg-navy-50'}`}>
            {s.label}
          </button>
        ))}
      </div>
      {section === 'services' && <ServicesSection />}
      {section === 'business' && (
        <ObjectSection key={JSON.stringify(c.business)} sectionKey="business" title="Business details" value={c.business} defaults={d.business} fields={[
          { key: 'phone', label: 'Phone (also used for WhatsApp)', type: 'tel', max: 40 },
          { key: 'email', label: 'Email', type: 'email', max: 120 },
          { key: 'address', label: 'Address' },
          { key: 'hours', label: 'Opening hours' },
          { key: 'tiktok', label: 'TikTok link', type: 'url', hint: 'Leave empty to hide the TikTok button.' },
          { key: 'description', label: 'Footer description', type: 'textarea', max: 500 },
        ]} />
      )}
      {section === 'home' && (
        <ObjectSection key={JSON.stringify(c.home)} sectionKey="home" title="Home page" value={c.home} defaults={d.home} fields={[
          { key: 'eyebrow', label: 'Small heading above the title', max: 80 },
          { key: 'headline', label: 'Headline (first line)', max: 80 },
          { key: 'headlineAccent', label: 'Headline (second line, in green)', max: 80 },
          { key: 'intro', label: 'Intro text', type: 'textarea', max: 400 },
          { key: 'heroImage', label: 'Main photo', type: 'image' },
          { key: 'heroImageAlt', label: 'Main photo description (for screen readers)' },
        ]} />
      )}
      {section === 'about' && (
        <ObjectSection key={JSON.stringify(c.about)} sectionKey="about" title="About page" value={c.about} defaults={d.about} fields={[
          { key: 'title', label: 'Page title', max: 120 },
          { key: 'intro', label: 'Intro text', type: 'textarea', max: 500 },
          { key: 'image', label: 'Photo', type: 'image' },
          { key: 'imageAlt', label: 'Photo description (for screen readers)' },
          { key: 'missionTitle', label: 'Mission heading', max: 120 },
          { key: 'mission', label: 'Mission text', type: 'textarea', hint: 'Leave an empty line between paragraphs.' },
        ]} />
      )}
      {section === 'why' && (
        <ListSection key={JSON.stringify(c.whyChoose)} sectionKey="why_choose" title="Why choose us" items={c.whyChoose} defaults={d.whyChoose} blank={{ title: '', description: '' }} itemLabel={(it, i) => it.title || `Point ${i + 1}`} fields={[
          { key: 'title', label: 'Title', max: 80 },
          { key: 'description', label: 'Description', type: 'textarea', max: 300 },
        ]} />
      )}
      {section === 'faqs' && (
        <ListSection key={JSON.stringify(c.faqs)} sectionKey="faqs" title="FAQs" intro="Shown on the home page. The contact page shows questions 2 to 5." items={c.faqs} defaults={d.faqs} blank={{ question: '', answer: '' }} itemLabel={(it, i) => it.question || `Question ${i + 1}`} fields={[
          { key: 'question', label: 'Question', max: 300 },
          { key: 'answer', label: 'Answer', type: 'textarea' },
        ]} />
      )}
      {section === 'reviews' && (
        <ListSection key={JSON.stringify(c.testimonials)} sectionKey="testimonials" title="Customer reviews" intro={c.testimonialsAreSamples ? 'The website is showing sample reviews. Saving here replaces them and removes the "Sample" labels, so only add genuine reviews you have permission to use.' : 'Only add genuine reviews you have permission to use.'} items={c.testimonialsAreSamples ? [] : c.testimonials} defaults={[]} blank={{ quote: '', name: '', context: '' }} itemLabel={(it, i) => it.name || `Review ${i + 1}`} fields={[
          { key: 'quote', label: 'Review', type: 'textarea', max: 1000 },
          { key: 'name', label: 'Customer name (e.g. Sarah K.)', max: 80 },
          { key: 'context', label: 'Service or area (e.g. Deep cleaning, Nottingham)', max: 80 },
        ]} />
      )}
    </div>
  );
}
