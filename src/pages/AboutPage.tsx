import { Compass, Heart, Leaf, ShieldCheck } from 'lucide-react';
import { FinalCta } from '../components/home/FinalCta';
import { PageHeader } from '../components/ui/PageHeader';
import { SectionHeading } from '../components/ui/SectionHeading';
import { usePageMeta } from '../hooks/usePageMeta';

const values = [
  { icon: ShieldCheck, title: 'Trust', description: 'Inviting someone into your space requires trust. We aim to earn it with reliability, respect and clear communication.' },
  { icon: Heart, title: 'Care', description: 'We treat every home and workplace with the same care we would want for our own.' },
  { icon: Compass, title: 'Simplicity', description: 'Booking and managing a cleaning should be effortless — from the first click to the final sparkle.' },
  { icon: Leaf, title: 'Responsibility', description: 'We aim to use thoughtful products and practices that are kind to people and spaces.' },
];

export default function AboutPage() {
  usePageMeta('About Us', 'Learn about Omegs — our mission to make professional cleaning simple, trustworthy and convenient.');
  return (
    <>
      <PageHeader
        eyebrow="About Omegs"
        title="We're making professional cleaning simple"
        description="Omegs was created with a straightforward idea: finding, booking and managing quality cleaning should be easy — so you can spend your time on what matters."
      />
      <section className="py-16 lg:py-24">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2">
          <div className="overflow-hidden rounded-4xl shadow-lift">
            <img src="/images/about-cleaner.webp" alt="Cleaner wiping a window frame in a bright room" loading="lazy" className="aspect-[4/3] w-full object-cover" />
          </div>
          <div>
            <SectionHeading align="left" eyebrow="Our mission" title="A cleaner space for a better day" />
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-navy-600">
              <p>
                A clean environment changes how you feel at home and at work. Our mission is to make that feeling accessible with professional cleaning services
                that are easy to book and dependable to receive.
              </p>
              <p>
                Through the Omegs website and mobile app, we're building a service that puts you in control — choose your service, pick a time that works, and keep
                track of everything in one place.
              </p>
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
