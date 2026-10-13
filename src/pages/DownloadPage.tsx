import { BellRing, CalendarCheck, FileText, RefreshCw, Smartphone, UserRound } from 'lucide-react';
import { AppStoreButtons } from '../components/AppStoreButtons';
import { PhoneMockup } from '../components/PhoneMockup';
import { Alert } from '../components/ui/Alert';
import { ButtonLink } from '../components/ui/Button';
import { SectionHeading } from '../components/ui/SectionHeading';
import { isAppPublished } from '../config/site';
import { usePageMeta } from '../hooks/usePageMeta';

const features = [
  { icon: CalendarCheck, title: 'Book in seconds', description: 'Choose a service, date and time in just a few taps.' },
  { icon: RefreshCw, title: 'Reschedule easily', description: 'Plans change. Request a new time without the back-and-forth.' },
  { icon: BellRing, title: 'Booking reminders', description: 'Stay on top of upcoming cleanings with timely notifications.' },
  { icon: FileText, title: 'Service details', description: "See exactly what's included in every service before you book." },
  { icon: UserRound, title: 'One account', description: 'Use the same Omegs account on the web and in the app.' },
  { icon: Smartphone, title: 'iOS & Android', description: 'Designed for iPhone and Android devices.' },
];

export default function DownloadPage() {
  usePageMeta('Download the App', 'Get the Omegs cleaning app for iOS and Android to book and manage cleanings on the go.');
  const published = isAppPublished('ios') || isAppPublished('android');
  return (
    <>
      <section className="relative overflow-hidden bg-navy-900 text-white">
        <div aria-hidden className="pointer-events-none absolute -left-24 top-10 h-96 w-96 rounded-full bg-mint-500/15 blur-3xl" />
        <div className="container-page relative grid items-center gap-14 py-16 lg:grid-cols-2 lg:py-24">
          <div className="animate-fade-up">
            <span className="eyebrow bg-white/10 text-mint-200 ring-white/20">Omegs mobile app</span>
            <h1 className="mt-5 text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl">Your Cleaning Service, One Tap Away.</h1>
            <p className="mt-5 max-w-lg text-lg text-navy-200">Book, manage and keep track of your cleanings from your phone with the Omegs app for iOS and Android.</p>
            <div className="mt-9">
              <AppStoreButtons variant="dark" />
            </div>
          </div>
          <div className="flex justify-center">
            <PhoneMockup />
          </div>
        </div>
      </section>
      <section className="py-16 lg:py-24">
        <div className="container-page">
          {!published && (
            <Alert tone="info" title="Launching soon" className="mx-auto mb-12 max-w-2xl">
              The Omegs app is not yet available on the App Store or Google Play. In the meantime, you can book directly on our website.
            </Alert>
          )}
          <SectionHeading eyebrow="Features" title="Everything you need to manage your cleanings" />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="card p-7">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mint-50 text-mint-700">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-600">{description}</p>
              </div>
            ))}
          </div>
          <div className="mt-14 text-center">
            <ButtonLink to="/book" size="lg">
              Book on the web now
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
