import { ArrowRight } from 'lucide-react';
import { services } from '../../data/services';
import { ServiceCard } from '../ServiceCard';
import { ButtonLink } from '../ui/Button';
import { SectionHeading } from '../ui/SectionHeading';

export function ServicesPreview() {
  return (
    <section className="bg-surface py-20 lg:py-28" aria-labelledby="services-heading">
      <div className="container-page">
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <div id="services-heading">
            <SectionHeading
              align="left"
              eyebrow="Our services"
              title="Cleaning for every space"
              description="From weekly home upkeep to post-renovation detail, choose the service that fits your space and schedule."
            />
          </div>
          <ButtonLink to="/services" variant="outline">
            View all services <ArrowRight className="h-4 w-4" aria-hidden />
          </ButtonLink>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
}
