import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { FaqAccordion } from '../components/FaqAccordion';
import { ServiceCard } from '../components/ServiceCard';
import { ButtonLink } from '../components/ui/Button';
import { getServiceById, services } from '../data/services';
import { usePageMeta } from '../hooks/usePageMeta';
import NotFoundPage from './NotFoundPage';

export default function ServiceDetailPage() {
  const { serviceId } = useParams();
  const service = getServiceById(serviceId);
  usePageMeta(service?.name ?? 'Service not found', service?.shortDescription);

  if (!service) return <NotFoundPage />;

  const Icon = service.icon;
  const related = services.filter((s) => s.id !== service.id).slice(0, 3);

  return (
    <>
      <section className="bg-surface">
        <div className="container-page grid items-center gap-12 py-12 lg:grid-cols-2 lg:py-20">
          <div className="animate-fade-up">
            <nav aria-label="Breadcrumb" className="text-sm text-navy-500">
              <ol className="flex items-center gap-2">
                <li>
                  <Link to="/" className="hover:text-navy-900">
                    Home
                  </Link>
                </li>
                <li aria-hidden>/</li>
                <li>
                  <Link to="/services" className="hover:text-navy-900">
                    Services
                  </Link>
                </li>
                <li aria-hidden>/</li>
                <li aria-current="page" className="font-medium text-navy-800">
                  {service.name}
                </li>
              </ol>
            </nav>
            <span className="mt-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-900 text-mint-300">
              <Icon className="h-6 w-6" aria-hidden />
            </span>
            <h1 className="mt-6 text-4xl font-bold sm:text-5xl">{service.name}</h1>
            <p className="mt-5 text-lg leading-relaxed text-navy-600">{service.description}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink to={`/book?service=${service.id}`} size="lg">
                Book {service.name} <ArrowRight className="h-4 w-4" aria-hidden />
              </ButtonLink>
              <ButtonLink to="/contact" size="lg" variant="outline">
                Ask a question
              </ButtonLink>
            </div>
          </div>
          <div className="overflow-hidden rounded-4xl shadow-lift">
            <img src={service.image} alt={service.imageAlt} width={1024} height={683} className="aspect-[4/3] w-full object-cover" />
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container-page grid gap-10 lg:grid-cols-12">
          <div className="space-y-10 lg:col-span-8">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">What's included</h2>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {service.included.map((item) => (
                  <li key={item} className="flex gap-3 rounded-2xl bg-surface p-4 text-sm text-navy-700">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-mint-600" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">Benefits</h2>
              <ul className="mt-6 grid gap-4 sm:grid-cols-3">
                {service.benefits.map((b) => (
                  <li key={b} className="card p-6">
                    <Sparkles className="h-5 w-5 text-mint-500" aria-hidden />
                    <p className="mt-3 text-sm font-medium leading-relaxed text-navy-800">{b}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">Frequently asked questions</h2>
              <div className="mt-6">
                <FaqAccordion items={service.faqs} />
              </div>
            </div>
          </div>

          <aside className="lg:col-span-4">
            <div className="card sticky top-24 p-7">
              <p className="text-sm font-medium text-navy-500">Pricing</p>
              {service.startingPrice !== null ? (
                <p className="mt-1 text-3xl font-bold">
                  From ${service.startingPrice}
                  <span className="text-base font-medium text-navy-500"> {service.priceUnit}</span>
                </p>
              ) : (
                <>
                  <p className="mt-1 text-2xl font-bold">Price on request</p>
                  <p className="mt-2 text-sm text-navy-500">
                    Pricing depends on property size and requirements. You'll see a clear quote before anything is confirmed.
                  </p>
                </>
              )}
              <div className="mt-6 border-t border-navy-100 pt-6">
                <p className="text-sm font-semibold text-navy-900">Ideal for</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {service.idealFor.map((i) => (
                    <li key={i} className="rounded-full bg-mint-50 px-3 py-1 text-xs font-medium text-mint-800 ring-1 ring-inset ring-mint-200">
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
              <ButtonLink to={`/book?service=${service.id}`} className="mt-7 w-full" size="lg">
                Book Now
              </ButtonLink>
              <Link to="/services" className="mt-4 flex items-center justify-center gap-1.5 text-sm font-medium text-navy-500 hover:text-navy-900">
                <ArrowLeft className="h-4 w-4" aria-hidden /> All services
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <section className="bg-surface py-16 lg:py-24">
        <div className="container-page">
          <h2 className="text-2xl font-bold sm:text-3xl">Other services</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
