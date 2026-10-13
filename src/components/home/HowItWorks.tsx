import { howItWorks } from '../../data/content';
import { ButtonLink } from '../ui/Button';
import { SectionHeading } from '../ui/SectionHeading';

export function HowItWorks() {
  return (
    <section className="relative overflow-hidden bg-navy-900 py-20 text-white lg:py-28" aria-labelledby="how-heading">
      <div aria-hidden className="pointer-events-none absolute -right-32 top-0 h-[28rem] w-[28rem] rounded-full bg-mint-500/10 blur-3xl" />
      <div className="container-page relative">
        <div id="how-heading">
          <SectionHeading invert eyebrow="How it works" title="Booking a clean in three simple steps" />
        </div>
        <ol className="relative mt-16 grid gap-8 md:grid-cols-3">
          <div aria-hidden className="absolute left-[16%] right-[16%] top-8 hidden border-t border-dashed border-white/20 md:block" />
          {howItWorks.map(({ title, description, icon: Icon }, i) => (
            <li key={title} className="relative text-center">
              <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-mint-400 text-navy-950 shadow-lg">
                <Icon className="h-7 w-7" aria-hidden />
                <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-bold text-navy-900 ring-4 ring-navy-900">
                  {i + 1}
                </span>
              </div>
              <h3 className="mx-auto mt-6 max-w-xs text-xl font-semibold text-white">{title}</h3>
              <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-navy-200">{description}</p>
            </li>
          ))}
        </ol>
        <div className="mt-14 text-center">
          <ButtonLink to="/book" variant="accent" size="lg">
            Start your booking
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
