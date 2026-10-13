import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Service } from '../types';
import { ButtonLink } from './ui/Button';

export function ServiceCard({ service }: { service: Service }) {
  const Icon = service.icon;
  return (
    <article className="group card flex flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-lift">
      <div className="relative aspect-[16/10] overflow-hidden bg-navy-50">
        <img
          src={service.image}
          alt={service.imageAlt}
          loading="lazy"
          decoding="async"
          width={640}
          height={400}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/95 text-mint-700 shadow-soft backdrop-blur">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-lg font-semibold">
          <Link to={`/services/${service.id}`} className="hover:text-mint-700">
            {service.name}
          </Link>
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-navy-600">{service.shortDescription}</p>
        <div className="mt-6 flex items-center justify-between gap-3">
          <Link
            to={`/services/${service.id}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-800 hover:text-mint-700"
            aria-label={`Learn more about ${service.name}`}
          >
            Learn More <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
          </Link>
          <ButtonLink to={`/book?service=${service.id}`} variant="secondary" size="sm" aria-label={`Book ${service.name} now`}>
            Book Now
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}
