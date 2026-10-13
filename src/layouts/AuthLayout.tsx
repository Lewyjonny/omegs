import { ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/Logo';

interface Props {
  title: string;
  subtitle: ReactNode;
  children: ReactNode;
  image?: string;
  quote?: string;
}

export function AuthLayout({ title, subtitle, children, image = '/images/bedroom.webp', quote = 'A cleaner space. A better day.' }: Props) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col px-5 py-8 sm:px-10 lg:px-16">
        <div className="flex items-center justify-between">
          <Logo />
          <Link to="/" className="text-sm font-medium text-navy-500 hover:text-navy-900">
            ← Back to site
          </Link>
        </div>
        <main id="main" className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
          <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
          <div className="mt-3 text-navy-600">{subtitle}</div>
          <div className="mt-8">{children}</div>
        </main>
        <p className="text-center text-xs text-navy-400">© {new Date().getFullYear()} Omegs</p>
      </div>
      <div className="relative hidden overflow-hidden bg-navy-900 lg:block">
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-14 text-white">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium ring-1 ring-white/20 backdrop-blur">
            <ShieldCheck className="h-4 w-4 text-mint-300" aria-hidden /> Your account, your bookings
          </span>
          <p className="mt-5 max-w-md text-4xl font-bold leading-tight tracking-tight text-white">{quote}</p>
          <p className="mt-3 max-w-md text-navy-200">Book, reschedule and keep track of every cleaning in one place.</p>
        </div>
      </div>
    </div>
  );
}
