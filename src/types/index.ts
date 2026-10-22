import type { LucideIcon } from 'lucide-react';

export type ServiceCategory = 'residential' | 'commercial' | 'specialty';

export interface ServiceFaq {
  question: string;
  answer: string;
}

export interface Service {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  category: ServiceCategory;
  icon: LucideIcon;
  image: string;
  imageAlt: string;
  benefits: string[];
  included: string[];
  idealFor: string[];
  /** Leave null until pricing is confirmed. Displayed as "Price on request". */
  startingPrice: number | null;
  priceUnit?: string;
  faqs: ServiceFaq[];
}

export interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface Faq {
  question: string;
  answer: string;
}

export type UserRole = 'customer' | 'employee' | 'admin';

export interface AppUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
}

export interface Booking {
  id: string;
  serviceId: string;
  date: string;
  time: string;
  address: string;
  propertySize: string;
  notes?: string;
  createdAt: string;
  status: BookingStatus;
  cancelledAt?: string;
}

export type BookingStatus = 'requested' | 'confirmed' | 'completed' | 'cancelled';

export type BookingInput = Omit<Booking, 'id' | 'createdAt' | 'status' | 'cancelledAt'>;
