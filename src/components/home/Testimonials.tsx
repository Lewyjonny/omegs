import { Quote } from 'lucide-react';
import { sampleTestimonials } from '../../data/content';
import { DemoBadge } from '../DemoBadge';
import { SectionHeading } from '../ui/SectionHeading';

export function Testimonials() {
  return (
    <section className="bg-surface py-20 lg:py-28" aria-labelledby="testimonials-heading">
      <div className="container-page">
        <div id="testimonials-heading">
          <SectionHeading
            eyebrow="Customer stories"
            title="What a better day can feel like"
            description="These are sample testimonials for illustration only. Verified customer reviews will appear here once available."
          />
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {sampleTestimonials.map((t) => (
            <figure key={t.context} className="card flex flex-col p-8">
              <div className="flex items-center justify-between">
                <Quote className="h-8 w-8 text-mint-300" aria-hidden />
                <DemoBadge>Sample</DemoBadge>
              </div>
              <blockquote className="mt-6 flex-1 text-base leading-relaxed text-navy-700">“{t.quote}”</blockquote>
              <figcaption className="mt-8 flex items-center gap-3 border-t border-navy-100 pt-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-navy-100 text-sm font-semibold text-navy-600" aria-hidden>
                  SC
                </span>
                <span>
                  <span className="block text-sm font-semibold text-navy-900">{t.name}</span>
                  <span className="block text-xs text-navy-500">{t.context} · illustrative example</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
