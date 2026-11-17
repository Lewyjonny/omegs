import { generalFaqs, sampleTestimonials, whyChooseUs, type Testimonial } from '../data/content';
import { siteConfig } from '../config/site';
import type { Faq } from '../types';

export interface BusinessContent {
  tagline: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  hours: string;
  tiktok: string;
}

export interface HomeContent {
  eyebrow: string;
  headline: string;
  headlineAccent: string;
  intro: string;
  heroImage: string;
  heroImageAlt: string;
}

export interface AboutContent {
  title: string;
  intro: string;
  missionTitle: string;
  mission: string;
  image: string;
  imageAlt: string;
}

export interface TextItem {
  title: string;
  description: string;
}

export interface SiteContent {
  business: BusinessContent;
  home: HomeContent;
  about: AboutContent;
  whyChoose: TextItem[];
  faqs: Faq[];
  testimonials: Testimonial[];
  /** True until an admin saves real reviews. */
  testimonialsAreSamples: boolean;
}

export type ContentKey = 'business' | 'home' | 'about' | 'why_choose' | 'faqs' | 'testimonials';

export const defaultContent: SiteContent = {
  business: {
    tagline: siteConfig.tagline,
    description: siteConfig.description,
    email: siteConfig.contact.email,
    phone: siteConfig.contact.phone,
    address: siteConfig.contact.address,
    hours: siteConfig.contact.hours,
    tiktok: siteConfig.social.find((s) => s.label === 'TikTok')?.href ?? '',
  },
  home: {
    eyebrow: 'Home & commercial cleaning',
    headline: 'A Cleaner Space.',
    headlineAccent: 'A Better Day.',
    intro: 'Professional cleaning made simple. Discover trusted cleaning services and manage your bookings with the Omegs mobile app.',
    heroImage: 'images/hero.webp',
    heroImageAlt: 'Bright, freshly cleaned living room with a grey sofa, plants and wooden floors',
  },
  about: {
    title: "We're making professional cleaning simple",
    intro:
      'Omegs was created with a straightforward idea: finding, booking and managing quality cleaning should be easy — so you can spend your time on what matters.',
    missionTitle: 'A cleaner space for a better day',
    mission:
      'A clean environment changes how you feel at home and at work. Our mission is to make that feeling accessible with professional cleaning services that are easy to book and dependable to receive.\n\nThrough the Omegs website and mobile app, we\'re building a service that puts you in control — choose your service, pick a time that works, and keep track of everything in one place.',
    image: 'images/about-cleaner.webp',
    imageAlt: 'Cleaner wiping a window frame in a bright room',
  },
  whyChoose: whyChooseUs.map(({ title, description }) => ({ title, description })),
  faqs: generalFaqs,
  testimonials: sampleTestimonials,
  testimonialsAreSamples: true,
};
