import { appFeatures } from '../../data/content';
import { AppStoreButtons } from '../AppStoreButtons';
import { PhoneMockup } from '../PhoneMockup';
import { ButtonLink } from '../ui/Button';

export function AppPromo() {
  return (
    <section className="py-20 lg:py-28" aria-labelledby="app-heading">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-mint-50 ring-1 ring-mint-100">
          <div aria-hidden className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-mint-200/60 blur-3xl" />
          <div className="relative grid items-center gap-12 px-6 py-14 sm:px-12 lg:grid-cols-2 lg:px-16 lg:py-20">
            <div>
              <span className="eyebrow bg-white">Omegs mobile app</span>
              <h2 id="app-heading" className="mt-4 text-3xl font-bold sm:text-4xl lg:text-5xl lg:leading-[1.08]">
                Your Cleaning Service, One Tap Away.
              </h2>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-navy-600">
                The Omegs app is designed to put booking and managing your cleanings in your pocket — on iPhone and Android.
              </p>
              <ul className="mt-8 space-y-5">
                {appFeatures.map(({ title, description, icon: Icon }) => (
                  <li key={title} className="flex gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-mint-700 shadow-soft">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span>
                      <span className="block font-semibold text-navy-900">{title}</span>
                      <span className="block text-sm text-navy-600">{description}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <AppStoreButtons />
              </div>
              <ButtonLink to="/download" variant="ghost" size="sm" className="mt-4 -ml-3">
                Learn more about the app →
              </ButtonLink>
            </div>
            <div className="relative flex justify-center lg:justify-end lg:pr-8">
              <PhoneMockup />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
