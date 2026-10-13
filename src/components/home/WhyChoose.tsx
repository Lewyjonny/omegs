import { whyChooseUs } from '../../data/content';
import { SectionHeading } from '../ui/SectionHeading';
import { asset } from '../../lib/asset';

export function WhyChoose() {
  return (
    <section className="py-20 lg:py-28" aria-labelledby="why-heading">
      <div className="container-page grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div id="why-heading">
            <SectionHeading
              align="left"
              eyebrow="Why choose Omegs"
              title="Our promise to every customer"
              description="We are building Omegs around the things that matter most when you invite a cleaner into your home or workplace."
            />
          </div>
          <div className="relative mt-10 hidden overflow-hidden rounded-4xl lg:block">
            <img src={asset('/images/about-cleaner.webp')} alt="Cleaner carefully wiping a window frame" loading="lazy" className="aspect-[4/3] w-full object-cover" />
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:col-span-7">
          {whyChooseUs.map(({ title, description, icon: Icon }) => (
            <div key={title} className="card p-7 transition hover:shadow-lift">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-900 text-mint-300">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-5 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-600">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
