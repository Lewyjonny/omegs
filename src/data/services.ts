import { Building2, Hammer, Home, PackageOpen, Sofa, Sparkles } from 'lucide-react';
import type { Service, ServiceCategory } from '../types';
import { asset } from '../lib/asset';

export const serviceCategories: { id: ServiceCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All services' },
  { id: 'residential', label: 'Residential' },
  { id: 'commercial', label: 'Commercial' },
  { id: 'specialty', label: 'Specialty' },
];

export const services: Service[] = [
  {
    id: 'home-cleaning',
    name: 'Home Cleaning',
    shortDescription: 'Regular upkeep that keeps every room fresh, tidy and comfortable to come home to.',
    description:
      'Our standard home cleaning covers the rooms you live in every day. It is ideal as a weekly, bi-weekly or one-off visit to keep your home consistently clean without giving up your free time.',
    category: 'residential',
    icon: Home,
    image: asset('/images/home-cleaning.webp'),
    imageAlt: 'Gloved hand scrubbing a kitchen counter with a sponge',
    benefits: [
      'More free time for the things you enjoy',
      'A consistently tidy, welcoming home',
      'Flexible one-off or recurring visits',
    ],
    included: [
      'Dusting of reachable surfaces and furniture',
      'Vacuuming and mopping of floors',
      'Kitchen counters, sink and exterior of appliances',
      'Bathroom sinks, toilets, showers and mirrors',
      'Emptying bins and tidying common areas',
    ],
    idealFor: ['Apartments and houses', 'Busy households', 'Recurring maintenance'],
    startingPrice: null,
    priceUnit: 'per visit',
    faqs: [
      {
        question: 'Do I need to provide cleaning supplies?',
        answer:
          'Supply arrangements can be confirmed when you book. Let us know in the booking notes if you prefer specific products to be used.',
      },
      {
        question: 'Can I set up recurring cleanings?',
        answer: 'Yes — you can request weekly, bi-weekly or monthly visits and manage them from the Omegs app.',
      },
    ],
  },
  {
    id: 'deep-cleaning',
    name: 'Deep Cleaning',
    shortDescription: 'A detailed top-to-bottom clean that reaches the corners everyday cleaning misses.',
    description:
      'Deep cleaning goes beyond routine upkeep to tackle built-up grime, hard-to-reach areas and detailed surfaces. It is a great reset before a special occasion, at the change of seasons, or before starting a regular cleaning plan.',
    category: 'residential',
    icon: Sparkles,
    image: asset('/images/deep-cleaning.webp'),
    imageAlt: 'Mop cleaning a polished hardwood floor',
    benefits: ['A full reset for your space', 'Attention to detail in every room', 'A cleaner baseline for regular upkeep'],
    included: [
      'Everything in Home Cleaning',
      'Baseboards, door frames and light switches',
      'Inside microwave and detailed kitchen degreasing',
      'Descaling of bathroom fixtures and tile grout',
      'Hard-to-reach dusting, vents and skirting',
    ],
    idealFor: ['Seasonal cleaning', 'First-time customers', 'Homes that need extra attention'],
    startingPrice: null,
    priceUnit: 'per visit',
    faqs: [
      {
        question: 'How long does a deep clean take?',
        answer: 'Duration depends on the size and condition of the property. An estimate is provided when your booking is confirmed.',
      },
      {
        question: 'How often should I book a deep clean?',
        answer: 'Many customers schedule a deep clean a few times a year, combined with regular home cleaning in between.',
      },
    ],
  },
  {
    id: 'office-cleaning',
    name: 'Office Cleaning',
    shortDescription: 'Clean, healthy workspaces that help your team focus and make a great impression.',
    description:
      'Office cleaning keeps desks, meeting rooms, kitchens and washrooms in great shape. Visits can be scheduled outside working hours to avoid disruption to your team.',
    category: 'commercial',
    icon: Building2,
    image: asset('/images/office-cleaning.webp'),
    imageAlt: 'Bright modern open-plan office with desks and plants',
    benefits: ['A professional environment for clients and staff', 'Scheduling around your business hours', 'Consistent standards every visit'],
    included: [
      'Desks, workstations and shared surfaces',
      'Meeting rooms and reception areas',
      'Office kitchen and break rooms',
      'Washroom cleaning and restocking on request',
      'Floor care and waste removal',
    ],
    idealFor: ['Small and mid-sized offices', 'Co-working spaces', 'Studios and clinics'],
    startingPrice: null,
    priceUnit: 'per visit',
    faqs: [
      {
        question: 'Can cleaning happen after business hours?',
        answer: 'Yes. You can request early-morning, evening or weekend time slots when booking.',
      },
      {
        question: 'Do you offer recurring commercial contracts?',
        answer: 'Recurring schedules can be arranged. Contact us with your requirements to discuss options.',
      },
    ],
  },
  {
    id: 'move-in-move-out',
    name: 'Move-In / Move-Out Cleaning',
    shortDescription: 'Start fresh in a new place, or leave your old one spotless for the next occupants.',
    description:
      'Moving is stressful enough. Our move-in and move-out cleaning prepares an empty property thoroughly — inside cabinets, appliances and every room — so you can hand over keys or settle in with confidence.',
    category: 'residential',
    icon: PackageOpen,
    image: asset('/images/move-in-out.webp'),
    imageAlt: 'Empty, sunlit living room with hardwood floors',
    benefits: ['Less stress on moving day', 'Helps with handover inspections', 'A truly fresh start in your new home'],
    included: [
      'Inside cabinets, drawers and closets',
      'Inside oven and refrigerator (when empty)',
      'Full bathroom and kitchen sanitising',
      'Walls spot-cleaning and skirting boards',
      'Floors vacuumed and mopped throughout',
    ],
    idealFor: ['Tenants and landlords', 'Home buyers and sellers', 'Property managers'],
    startingPrice: null,
    priceUnit: 'per property',
    faqs: [
      {
        question: 'Should the property be empty?',
        answer: 'For the best result, the property should be empty of furniture and belongings at the time of cleaning.',
      },
      {
        question: 'Can I book for a specific handover date?',
        answer: 'Yes — choose your preferred date when booking and we will work to confirm availability.',
      },
    ],
  },
  {
    id: 'sofa-upholstery',
    name: 'Sofa & Upholstery Cleaning',
    shortDescription: 'Refresh sofas, chairs and fabric furniture to look and feel like new again.',
    description:
      'Upholstered furniture collects dust, stains and odours over time. Our upholstery cleaning uses fabric-appropriate methods to lift dirt and refresh your sofas, armchairs, cushions and more.',
    category: 'specialty',
    icon: Sofa,
    image: asset('/images/sofa-upholstery.webp'),
    imageAlt: 'Light blue sofa with patterned cushions in a bright room',
    benefits: ['Fresher, cleaner-looking furniture', 'Fabric-appropriate cleaning methods', 'Helps extend the life of your upholstery'],
    included: [
      'Pre-inspection of fabric type and condition',
      'Vacuuming of seams and cushions',
      'Spot treatment for common stains',
      'Fabric-safe deep cleaning',
      'Guidance on drying time and aftercare',
    ],
    idealFor: ['Sofas and sectionals', 'Dining and accent chairs', 'Cushions and headboards'],
    startingPrice: null,
    priceUnit: 'per item',
    faqs: [
      {
        question: 'Can every stain be removed?',
        answer: 'Results depend on the fabric and the type and age of the stain. We will assess this before cleaning begins.',
      },
      {
        question: 'How long does upholstery take to dry?',
        answer: 'Drying time varies by fabric and ventilation. You will receive aftercare guidance on the day.',
      },
    ],
  },
  {
    id: 'post-construction',
    name: 'Post-Construction Cleaning',
    shortDescription: 'Remove dust and debris after renovations so your space is ready to enjoy.',
    description:
      'Renovations leave behind fine dust, residue and debris in places you would never expect. Post-construction cleaning prepares newly built or renovated spaces for move-in or handover.',
    category: 'specialty',
    icon: Hammer,
    image: asset('/images/post-construction.webp'),
    imageAlt: 'Newly renovated room with fresh walls and large windows',
    benefits: ['A move-in ready space after works', 'Removal of fine construction dust', 'Detailed finishing on new fixtures'],
    included: [
      'Removal of light debris and packaging',
      'Fine dust removal from surfaces, ledges and vents',
      'Window, frame and sill cleaning',
      'Cleaning of new fixtures and fittings',
      'Floor vacuuming and mopping',
    ],
    idealFor: ['Home renovations', 'New builds', 'Commercial fit-outs'],
    startingPrice: null,
    priceUnit: 'per project',
    faqs: [
      {
        question: 'When should I book post-construction cleaning?',
        answer: 'Book once major construction work is complete and contractors have left the site.',
      },
      {
        question: 'Do you remove large construction waste?',
        answer: 'Our service covers light debris and dust. Large waste removal should be arranged with your contractor.',
      },
    ],
  },
];

export const getServiceById = (id: string | undefined) => services.find((service) => service.id === id);
