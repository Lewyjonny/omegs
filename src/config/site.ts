const env = import.meta.env;

/**
 * Central, editable site configuration. Values marked as placeholders must be
 * replaced with verified business details before launch.
 */
export const siteConfig = {
  name: 'Omegs',
  tagline: 'A Cleaner Space. A Better Day.',
  description:
    'Omegs connects you with professional cleaning for homes and workplaces — simple to book, easy to manage from the Omegs mobile app.',
  contact: {
    email: 'hello@omegs.example',
    phone: '+1 (000) 000-0000',
    address: 'Your business address, City, Country',
    hours: 'Mon – Sat, 8:00 – 18:00',
    isPlaceholder: true,
  },
  appStores: {
    ios: env.VITE_APP_STORE_URL || '',
    android: env.VITE_GOOGLE_PLAY_URL || '',
  },
  social: [
    { label: 'Instagram', href: '' },
    { label: 'Facebook', href: '' },
    { label: 'LinkedIn', href: '' },
    { label: 'X', href: '' },
  ],
} as const;

export const isAppPublished = (platform: 'ios' | 'android') => Boolean(siteConfig.appStores[platform]);
