import { ArrowRight, CalendarClock, MousePointerClick, ShieldCheck, Sparkles } from 'lucide-react';
import { ButtonLink } from '../ui/Button';

const trust = [
  { icon: ShieldCheck, label: 'Professional service' },
  { icon: MousePointerClick, label: 'Convenient booking' },
  { icon: CalendarClock, label: 'Flexible scheduling' },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div aria-hidden className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-mint-100/60 blur-3xl" />
      <div className="container-page relative grid items-center gap-12 pb-20 pt-10 sm:pt-14 lg:grid-cols-12 lg:gap-10 lg:pb-28 lg:pt-16">
        <div className="animate-fade-up lg:col-span-6">
          <span className="eyebrow">
            <Sparkles className="h-3.5 w-3.5" aria-hidden /> Home & commercial cleaning
          </span>
          <h1 className="mt-6 text-[2.75rem] font-extrabold leading-[1.04] sm:text-6xl lg:text-[4.25rem]">
            A Cleaner Space.
            <br />
            <span className="text-mint-600">A Better Day.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-navy-600 sm:text-xl">
            Professional cleaning made simple. Discover trusted cleaning services and manage your bookings with the Omegs mobile app.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink to="/book" size="lg">
              Book a Cleaning <ArrowRight className="h-4 w-4" aria-hidden />
            </ButtonLink>
            <ButtonLink to="/services" size="lg" variant="outline">
              Explore Our Services
            </ButtonLink>
          </div>
          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
            {trust.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2 text-sm font-medium text-navy-700">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-mint-50 text-mint-700 ring-1 ring-mint-200">
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative lg:col-span-6">
          <div className="relative overflow-hidden rounded-4xl bg-navy-50 shadow-lift ring-1 ring-navy-900/5">
            <img
              src="/images/hero.webp"
              alt="Bright, freshly cleaned living room with a grey sofa, plants and wooden floors"
              width={1024}
              height={683}
              loading="eager"
              className="aspect-[4/3.4] w-full object-cover sm:aspect-[4/3]"
            />
          </div>
          <div className="absolute -bottom-6 left-4 right-4 flex items-center gap-4 rounded-3xl bg-white/95 p-4 shadow-lift ring-1 ring-navy-900/5 backdrop-blur sm:left-auto sm:right-8 sm:w-80">
            <img src="/images/surface.webp" alt="" className="h-14 w-14 rounded-2xl object-cover" />
            <div>
              <p className="text-sm font-semibold text-navy-900">Book in a few taps</p>
              <p className="text-xs text-navy-500">Choose a service, date and time — we handle the rest.</p>
            </div>
          </div>
          <div className="absolute -top-4 right-6 hidden rounded-2xl bg-navy-900 px-4 py-3 text-white shadow-lift sm:block">
            <p className="text-[11px] uppercase tracking-wider text-mint-300">Omegs app</p>
            <p className="text-sm font-semibold">Coming to iOS & Android</p>
          </div>
        </div>
      </div>
    </section>
  );
}
