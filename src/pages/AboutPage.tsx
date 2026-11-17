import { Compass, Heart, Leaf, ShieldCheck } from 'lucide-react';
import { FinalCta } from '../components/home/FinalCta';
import { PageHeader } from '../components/ui/PageHeader';
import { SectionHeading } from '../components/ui/SectionHeading';
import { usePageMeta } from '../hooks/usePageMeta';
import { imageSrc } from '../lib/asset';
import { useSiteContent } from '../hooks/useSiteContent';

const values = [
  { icon: ShieldCheck, title: 'Trust', description: 'Inviting someone into your space requires trust. We aim to earn it with reliability, respect and clear communication.' },
  { icon: Heart, title: 'Care', description: 'We treat every home and workplace with the same care we would want for our own.' },
  { icon: Compass, title: 'Simplicity', description: 'Booking and managing a cleaning should be effortless — from the first click to the final sparkle.' },
  { icon: Leaf, title: 'Responsibility', description: 'We aim to use thoughtful products and practices that are kind to people and spaces.' },
];

export default function AboutPage() {
  usePageMeta('About Us', 'Learn about Omegs — our mission to make professional cleaning simple, trustworthy and convenient.');
  const { about } = useSiteContent().content;
  return (
    <>
      <PageHeader
        eyebrow="About Omegs"
        title={about.title}
        description={about.intro}
      />
      <section className="py-16 lg:py-24">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2">
          <div className="overflow-hidden rounded-4xl shadow-lift">
            <img src={imageSrc(about.image)} alt={about.imageAlt} loading="lazy" className="aspect-[4/3] w-full object-cover" />
          </div>
          <div>
            <SectionHeading align="left" eyebrow="Our mission" title={about.missionTitle} />
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-navy-600">
              {about.mission
                .split(/\n\s*\n/)
                .filter(Boolean)
                .map((p) => (
                  <p key={p}>{p}</p>
                ))}
            </div>
          </div>
        </div>
      </section>
      <section className="bg-surface py-16 lg:py-24">
        <div className="container-page">
          <SectionHeading eyebrow="Our values" title="What guides us" />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(({ icon: Icon, title, description }) => (
              <div key={title} className="card p-7">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mint-50 text-mint-700">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <div className="pt-20 lg:pt-28">
        <FinalCta />
      </div>
    </>
  );
}
