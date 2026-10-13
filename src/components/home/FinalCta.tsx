import { ArrowRight } from 'lucide-react';
import { ButtonLink } from '../ui/Button';
import { asset } from '../../lib/asset';

export function FinalCta() {
  return (
    <section className="pb-20 lg:pb-28">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-navy-900">
          <img src={asset('/images/kitchen.webp')} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-900/90 to-navy-900/40" />
          <div className="relative px-6 py-16 sm:px-12 lg:px-16 lg:py-24">
            <h2 className="max-w-2xl text-3xl font-bold text-white sm:text-4xl lg:text-5xl lg:leading-[1.08]">Ready for a cleaner space?</h2>
            <p className="mt-5 max-w-xl text-lg text-navy-200">Pick your service, choose a time that suits you, and let Omegs take care of the rest.</p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <ButtonLink to="/book" variant="accent" size="lg">
                Book a Cleaning <ArrowRight className="h-4 w-4" aria-hidden />
              </ButtonLink>
              <ButtonLink to="/download" variant="light" size="lg">
                Get the app
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
