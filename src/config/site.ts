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
    email: 'info@omegscleaning.co.uk',
    phone: '+44 7565 666 871',
    address: 'Sherwood Business Centre, 616a–620a Mansfield Road, Nottingham NG5 2GA',
    hours: 'Mon – Sat, 8:00 – 18:00 (Sunday closed)',
    isPlaceholder: false,
  },
  /** Public web address, used for email links sent from the mobile apps. */
  webUrl: env.VITE_PUBLIC_SITE_URL || 'https://lewyjonny.github.io/omegs/',
  appStores: {
    ios: env.VITE_APP_STORE_URL || '',
    android: env.VITE_GOOGLE_PLAY_URL || '',
  },
  social: [{ label: 'TikTok', href: 'https://www.tiktok.com/@omegscleaningservicesltd' }],
} as const;

export const whatsappLink = (text = `Hi ${siteConfig.name}, I'd like to book a cleaning.`, phone: string = siteConfig.contact.phone) =>
  `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;

export const isAppPublished = (platform: 'ios' | 'android') => Boolean(siteConfig.appStores[platform]);
