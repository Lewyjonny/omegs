import {
  Bath,
  Brush,
  Building2,
  CalendarClock,
  Hammer,
  HeartHandshake,
  Home,
  Leaf,
  MousePointerClick,
  PackageOpen,
  Receipt,
  ShieldCheck,
  Smartphone,
  Sofa,
  Sparkles,
  SprayCan,
  Users,
  WashingMachine,
  type LucideIcon,
} from 'lucide-react';

/** Icons admins can choose for a service. Keys are stored in the database. */
export const serviceIcons: Record<string, LucideIcon> = {
  house: Home,
  sparkles: Sparkles,
  'building-complex': Building2,
  'package-open': PackageOpen,
  sofa: Sofa,
  hammer: Hammer,
  'spray-can': SprayCan,
  brush: Brush,
  bath: Bath,
  'washing-machine': WashingMachine,
  leaf: Leaf,
};

export const serviceIcon = (key: string) => serviceIcons[key] ?? Sparkles;

/** Icons for the "Why choose us" cards, used in order. */
export const featureIcons: LucideIcon[] = [MousePointerClick, Users, Receipt, CalendarClock, Smartphone, HeartHandshake, ShieldCheck, Sparkles];
