import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FinalCta } from '../components/home/FinalCta';
import { PageHeader } from '../components/ui/PageHeader';
import { ServiceCard } from '../components/ServiceCard';
import { serviceCategories, services } from '../data/services';
import { usePageMeta } from '../hooks/usePageMeta';
import type { ServiceCategory } from '../types';

export default function ServicesPage() {
  usePageMeta('Cleaning Services', 'Explore Omegs home, deep, office, move-in/move-out, upholstery and post-construction cleaning services.');
  const [params, setParams] = useSearchParams();
  const active = (params.get('category') as ServiceCategory | null) ?? 'all';
  const filtered = useMemo(() => (active === 'all' ? services : services.filter((s) => s.category === active)), [active]);

  return (
    <>
      <PageHeader
        eyebrow="Services"
        title="Professional cleaning, tailored to your space"
        description="Whether it's a weekly refresh at home or a detailed clean after renovations, explore what each Omegs service includes and book in minutes."
      />
      <section className="py-16 lg:py-20">
        <div className="container-page">
          <div role="group" aria-label="Filter services by category" className="flex flex-wrap gap-2">
            {serviceCategories.map((c) => {
              const isActive = active === c.id;
              const count = c.id === 'all' ? services.length : services.filter((s) => s.category === c.id).length;
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setParams(c.id === 'all' ? {} : { category: c.id }, { replace: true })}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isActive ? 'bg-navy-900 text-white shadow-sm' : 'bg-white text-navy-700 ring-1 ring-inset ring-navy-200 hover:bg-navy-50'
                  }`}
                >
                  {c.label} <span className={isActive ? 'text-navy-300' : 'text-navy-400'}>({count})</span>
                </button>
              );
            })}
          </div>
          <p className="sr-only" aria-live="polite">
            Showing {filtered.length} services
          </p>
          {filtered.length === 0 ? (
            <p className="mt-12 rounded-3xl bg-surface p-10 text-center text-navy-600">No services in this category yet.</p>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((s) => (
                <ServiceCard key={s.id} service={s} />
              ))}
            </div>
          )}
        </div>
      </section>
      <FinalCta />
    </>
  );
}
