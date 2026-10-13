import { AppPromo } from '../components/home/AppPromo';
import { FaqSection } from '../components/home/FaqSection';
import { FinalCta } from '../components/home/FinalCta';
import { Hero } from '../components/home/Hero';
import { HowItWorks } from '../components/home/HowItWorks';
import { ServicesPreview } from '../components/home/ServicesPreview';
import { Testimonials } from '../components/home/Testimonials';
import { WhyChoose } from '../components/home/WhyChoose';
import { usePageMeta } from '../hooks/usePageMeta';

export default function HomePage() {
  usePageMeta('');
  return (
    <>
      <Hero />
      <ServicesPreview />
      <WhyChoose />
      <HowItWorks />
      <AppPromo />
      <Testimonials />
      <FaqSection />
      <FinalCta />
    </>
  );
}
