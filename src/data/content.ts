import {
  CalendarCheck,
  CalendarClock,
  ClipboardList,
  HeartHandshake,
  ListChecks,
  MousePointerClick,
  Receipt,
  Smartphone,
  Users,
  BellRing,
  FileText,
} from 'lucide-react';
import type { Faq, Feature } from '../types';

export const whyChooseUs: Feature[] = [
  {
    title: 'Easy booking',
    description: 'Choose a service, pick a time and book in a few taps — on the web or in the Omegs app.',
    icon: MousePointerClick,
  },
  {
    title: 'Professional cleaning teams',
    description: 'We are committed to working with trained, respectful cleaners who take pride in their work.',
    icon: Users,
  },
  {
    title: 'Transparent pricing',
    description: 'Our goal is clear, upfront pricing before you confirm — no surprises when the job is done.',
    icon: Receipt,
  },
  {
    title: 'Flexible scheduling',
    description: 'Request the date and time that suit you, including recurring visits that fit your routine.',
    icon: CalendarClock,
  },
  {
    title: 'Convenient service management',
    description: 'Reschedule, review details and keep track of upcoming cleanings from one place.',
    icon: Smartphone,
  },
  {
    title: 'Customer-focused support',
    description: 'Questions or changes? Our support team is here to help you before and after every visit.',
    icon: HeartHandshake,
  },
];

export const howItWorks: Feature[] = [
  {
    title: 'Choose your cleaning service',
    description: 'Browse home, office, deep cleaning and specialty services to find the right fit for your space.',
    icon: ListChecks,
  },
  {
    title: 'Select your preferred date and details',
    description: 'Tell us when and where, plus any details that help our team prepare for your visit.',
    icon: CalendarCheck,
  },
  {
    title: 'Confirm and manage your booking',
    description: 'Review your request and manage upcoming cleanings anytime from the Omegs app.',
    icon: ClipboardList,
  },
];

export const appFeatures: Feature[] = [
  { title: 'Book in seconds', description: 'Pick a service, date and time in a few taps.', icon: CalendarCheck },
  { title: 'Manage appointments', description: 'Reschedule or review upcoming visits anytime.', icon: BellRing },
  { title: 'View service details', description: 'See what is included before you book.', icon: FileText },
];

export interface Testimonial {
  quote: string;
  name: string;
  context: string;
}

/** Sample content for layout only. Replace with genuine, consented customer feedback before launch. */
export const sampleTestimonials: Testimonial[] = [
  {
    quote:
      'Booking took less than a minute and I could see exactly what was included. Coming home to a fresh apartment made my whole week.',
    name: 'Sample Customer',
    context: 'Home Cleaning',
  },
  {
    quote:
      'We scheduled cleaning after office hours so the team was never disrupted. Managing visits from the app keeps things simple.',
    name: 'Sample Customer',
    context: 'Office Cleaning',
  },
  {
    quote:
      'The move-out clean took a huge task off my list during a stressful week. Clear communication from start to finish.',
    name: 'Sample Customer',
    context: 'Move-Out Cleaning',
  },
];

export const generalFaqs: Faq[] = [
  {
    question: 'What services does Omegs offer?',
    answer:
      'Omegs offers home cleaning, deep cleaning, office cleaning, move-in/move-out cleaning, sofa and upholstery cleaning, and post-construction cleaning. Visit our Services page for details on each.',
  },
  {
    question: 'How do I book a cleaning?',
    answer:
      'Click “Book a Cleaning”, sign in or create an account, then choose your service, preferred date and time, and add any details. You can also book from the Omegs mobile app once it is available.',
  },
  {
    question: 'Can I reschedule a booking?',
    answer:
      'Yes. You can request a new date or time for an upcoming booking. Please let us know as early as possible so we can accommodate your request.',
  },
  {
    question: 'How do I download the mobile app?',
    answer:
      'The Omegs app is coming to the App Store and Google Play. Visit our Download page for the latest availability and store links.',
  },
  {
    question: 'How can I contact support?',
    answer: 'Use the form on our Contact page, or reach us by email or phone using the details listed there.',
  },
];

export const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

export const propertySizes = ['Studio / 1 bedroom', '2 bedrooms', '3 bedrooms', '4+ bedrooms', 'Office / commercial space', 'Not sure'];
