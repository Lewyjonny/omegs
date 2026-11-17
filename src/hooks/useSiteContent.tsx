import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { defaultContent, type ContentKey, type SiteContent } from '../content/defaults';
import { services as builtInServices } from '../data/services';
import { contentService, type LoadedContent } from '../services/content';
import type { Service } from '../types';

interface SiteContentValue {
  content: SiteContent;
  /** Services shown to visitors (hidden ones removed). */
  services: Service[];
  /** Every service the current user can read, including hidden ones for admins. */
  allServices: Service[];
  getService: (id: string | undefined) => Service | undefined;
  /** False until the content migration has run, so services cannot be edited yet. */
  servicesEditable: boolean;
  reload: () => Promise<void>;
}

const SiteContentContext = createContext<SiteContentValue | null>(null);

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Uses saved text where present and the built-in text for anything missing. */
const mergeObject = <T extends object>(base: T, saved: unknown): T => {
  if (!isObject(saved)) return base;
  const out = { ...base } as Record<string, unknown>;
  for (const k of Object.keys(base)) if (typeof saved[k] === 'string') out[k] = saved[k];
  return out as T;
};

const mergeList = <T,>(base: T[], saved: unknown): T[] => (Array.isArray(saved) ? (saved as T[]) : base);

const mergeContent = (sections: LoadedContent['sections']): SiteContent => ({
  business: mergeObject(defaultContent.business, sections.business),
  home: mergeObject(defaultContent.home, sections.home),
  about: mergeObject(defaultContent.about, sections.about),
  whyChoose: mergeList(defaultContent.whyChoose, sections.why_choose),
  faqs: mergeList(defaultContent.faqs, sections.faqs),
  testimonials: mergeList(defaultContent.testimonials, sections.testimonials),
  testimonialsAreSamples: !Array.isArray(sections.testimonials),
});

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [sections, setSections] = useState<Partial<Record<ContentKey, unknown>>>({});
  const [dbServices, setDbServices] = useState<Service[] | null>(null);

  const reload = useCallback(async () => {
    try {
      const loaded = await contentService.load();
      setSections(loaded.sections);
      setDbServices(loaded.services);
    } catch {
      // Network problems keep the built-in content on screen.
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const value = useMemo<SiteContentValue>(() => {
    const allServices = dbServices ?? builtInServices;
    const visible = allServices.filter((s) => s.isActive !== false);
    return {
      content: mergeContent(sections),
      services: visible,
      allServices,
      getService: (id) => (id ? allServices.find((s) => s.id === id) ?? builtInServices.find((s) => s.id === id) : undefined),
      servicesEditable: dbServices !== null,
      reload,
    };
  }, [sections, dbServices, reload]);

  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSiteContent() {
  const ctx = useContext(SiteContentContext);
  if (!ctx) throw new Error('useSiteContent must be used inside SiteContentProvider');
  return ctx;
}
