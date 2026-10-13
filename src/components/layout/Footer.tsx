import { Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { siteConfig } from '../../config/site';
import { services } from '../../data/services';
import { AppStoreButtons } from '../AppStoreButtons';
import { Logo } from '../Logo';

const companyLinks = [
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact' },
  { to: '/download', label: 'Download the App' },
  { to: '/login', label: 'Login' },
  { to: '/signup', label: 'Create an account' },
];

function FooterHeading({ children }: { children: string }) {
  return <h2 className="text-sm font-semibold uppercase tracking-wider text-white">{children}</h2>;
}

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-navy-950 text-navy-300">
      <div className="container-page py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo invert />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-navy-300">{siteConfig.description}</p>
            <div className="mt-6">
              <AppStoreButtons variant="dark" size="sm" />
            </div>
          </div>

          <nav className="lg:col-span-3" aria-label="Services">
            <FooterHeading>Services</FooterHeading>
            <ul className="mt-5 space-y-3 text-sm">
              {services.map((s) => (
                <li key={s.id}>
                  <Link to={`/services/${s.id}`} className="transition hover:text-white">
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="lg:col-span-2" aria-label="Company">
            <FooterHeading>Company</FooterHeading>
            <ul className="mt-5 space-y-3 text-sm">
              {companyLinks.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="transition hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <FooterHeading>Get in touch</FooterHeading>
            <ul className="mt-5 space-y-3 text-sm">
              <li className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-mint-400" aria-hidden />
                <a href={`mailto:${siteConfig.contact.email}`} className="hover:text-white">
                  {siteConfig.contact.email}
                </a>
              </li>
              <li className="flex gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-mint-400" aria-hidden />
                <span>{siteConfig.contact.phone}</span>
              </li>
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-mint-400" aria-hidden />
                <span>{siteConfig.contact.address}</span>
              </li>
            </ul>
            {siteConfig.contact.isPlaceholder && <p className="mt-3 text-xs text-navy-400">Contact details are placeholders.</p>}
            <div className="mt-6 flex flex-wrap gap-2" aria-label="Social media">
              {siteConfig.social.map((s) =>
                s.href ? (
                  <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-navy-700 hover:bg-navy-800 hover:text-white">
                    {s.label}
                  </a>
                ) : (
                  <span key={s.label} title="Social profile coming soon" className="cursor-default rounded-full px-3 py-1.5 text-xs font-medium text-navy-400 ring-1 ring-navy-800">
                    {s.label} <span className="sr-only">(coming soon)</span>
                  </span>
                ),
              )}
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-navy-800 pt-8 text-xs text-navy-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Omegs. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-white">
              Terms and Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
