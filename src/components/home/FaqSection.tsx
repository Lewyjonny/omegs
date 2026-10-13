import { generalFaqs } from '../../data/content';
import { FaqAccordion } from '../FaqAccordion';
import { ButtonLink } from '../ui/Button';
import { SectionHeading } from '../ui/SectionHeading';

export function FaqSection() {
  return (
    <section className="py-20 lg:py-28" aria-labelledby="faq-heading">
      <div className="container-page grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div id="faq-heading">
            <SectionHeading align="left" eyebrow="FAQ" title="Questions, answered" description="Can't find what you're looking for? Our team is happy to help." />
          </div>
          <ButtonLink to="/contact" variant="outline" className="mt-8">
            Contact support
          </ButtonLink>
        </div>
        <div className="lg:col-span-8">
          <FaqAccordion items={generalFaqs} />
        </div>
      </div>
    </section>
  );
}
