import { supabase } from '../lib/supabase';
import { imageSrc } from '../lib/asset';
import { serviceIcon } from '../content/icons';
import type { ContentKey } from '../content/defaults';
import type { Service, ServiceCategory, ServiceFaq } from '../types';

/** Editable site content. Anyone can read it; row level security only lets admins change it. */

export class ContentError extends Error {}

export const IMAGE_BUCKET = 'site-images';
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export interface ServiceRow {
  id: string;
  name: string;
  category: ServiceCategory;
  is_active: boolean;
  starting_price: number | string | null;
  sort_order: number;
  short_description: string;
  description: string;
  icon: string;
  image_url: string | null;
  image_alt: string;
  benefits: string[];
  included: string[];
  ideal_for: string[];
  price_unit: string;
  faqs: ServiceFaq[];
}

const FALLBACK_IMAGE = 'images/home-cleaning.webp';

export const rowToService = (row: ServiceRow): Service => ({
  id: row.id,
  name: row.name,
  shortDescription: row.short_description,
  description: row.description,
  category: row.category,
  icon: serviceIcon(row.icon),
  iconName: row.icon,
  image: imageSrc(row.image_url || FALLBACK_IMAGE),
  imagePath: row.image_url ?? '',
  imageAlt: row.image_alt,
  benefits: row.benefits ?? [],
  included: row.included ?? [],
  idealFor: row.ideal_for ?? [],
  startingPrice: row.starting_price === null ? null : Number(row.starting_price),
  priceUnit: row.price_unit,
  faqs: Array.isArray(row.faqs) ? row.faqs : [],
  isActive: row.is_active,
  sortOrder: row.sort_order,
});

const client = () => {
  if (!supabase) throw new ContentError('Editing the site needs the Supabase backend to be configured.');
  return supabase;
};

const friendly = (message: string) => {
  if (/foreign key|violates.*bookings/i.test(message)) return 'This service has bookings, so it cannot be deleted. Hide it instead.';
  if (/duplicate key/i.test(message)) return 'A service with that ID already exists. Choose a different name or ID.';
  if (/row-level security|permission denied/i.test(message)) return 'You do not have permission to do that.';
  if (/check constraint/i.test(message)) return 'Some details are too long or in the wrong format. Please check and try again.';
  return message;
};

const changed = (result: { data: unknown[] | null; error: { message: string } | null }) => {
  if (result.error) throw new ContentError(friendly(result.error.message));
  if (!result.data || result.data.length === 0) throw new ContentError('You do not have permission to do that.');
};

export interface LoadedContent {
  sections: Partial<Record<ContentKey, unknown>>;
  /** Null when the database has no editable services yet (keep the built-in list). */
  services: Service[] | null;
}

export const contentService = {
  isConfigured: () => Boolean(supabase),

  async load(): Promise<LoadedContent> {
    if (!supabase) return { sections: {}, services: null };
    const [sections, services] = await Promise.all([
      supabase.from('site_content').select('key, value'),
      supabase.from('services').select('*').order('sort_order').order('name'),
    ]);
    const result: LoadedContent = { sections: {}, services: null };
    if (!sections.error) for (const row of sections.data ?? []) result.sections[row.key as ContentKey] = row.value;
    const rows = (services.data ?? []) as ServiceRow[];
    // Before the content migration runs, rows have no description columns: keep the built-in services.
    if (!services.error && rows.length > 0 && 'short_description' in rows[0]) result.services = rows.map(rowToService);
    return result;
  },

  async saveSection(key: ContentKey, value: unknown) {
    changed(await client().from('site_content').upsert({ key, value }).select('key'));
  },

  async saveService(row: Omit<ServiceRow, 'sort_order'> & { sort_order?: number }, isNew: boolean) {
    const db = client().from('services');
    if (isNew) changed(await db.insert(row).select('id'));
    else {
      const { id, ...rest } = row;
      changed(await db.update(rest).eq('id', id).select('id'));
    }
  },

  async setServiceActive(id: string, isActive: boolean) {
    changed(await client().from('services').update({ is_active: isActive }).eq('id', id).select('id'));
  },

  async swapServiceOrder(a: Service, b: Service) {
    const aSort = a.sortOrder ?? 0;
    const bSort = b.sortOrder ?? 0;
    // Equal values would not change the order, so nudge one of them.
    const [first, second] = aSort === bSort ? [bSort + 1, aSort] : [bSort, aSort];
    changed(await client().from('services').update({ sort_order: first }).eq('id', a.id).select('id'));
    changed(await client().from('services').update({ sort_order: second }).eq('id', b.id).select('id'));
  },

  async deleteService(id: string) {
    changed(await client().from('services').delete().eq('id', id).select('id'));
  },

  async uploadImage(file: File): Promise<string> {
    if (!IMAGE_TYPES.includes(file.type)) throw new ContentError('Please choose a JPG, PNG or WebP image.');
    if (file.size > MAX_IMAGE_BYTES) throw new ContentError('That image is over 5 MB. Please choose a smaller one.');
    const ext = file.type.split('/')[1].replace('jpeg', 'jpg');
    const path = `${crypto.randomUUID()}.${ext}`;
    const storage = client().storage.from(IMAGE_BUCKET);
    const { error } = await storage.upload(path, file, { contentType: file.type, cacheControl: '31536000' });
    if (error) throw new ContentError(friendly(error.message));
    return storage.getPublicUrl(path).data.publicUrl;
  },

  /** Removes a previously uploaded image. Built-in images are left alone. */
  async removeImage(url: string | undefined | null) {
    const marker = `/storage/v1/object/public/${IMAGE_BUCKET}/`;
    if (!url || !url.includes(marker)) return;
    await client().storage.from(IMAGE_BUCKET).remove([url.split(marker)[1]]);
  },
};
