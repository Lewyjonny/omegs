import { Bell, CalendarDays, Home, Sparkles, User } from 'lucide-react';
import { services } from '../data/services';

/** Illustrative app UI preview — not a screenshot of a released app. */
export function PhoneMockup({ className = '' }: { className?: string }) {
  const upcoming = services.slice(0, 3);
  return (
    <div className={`relative mx-auto w-[280px] sm:w-[300px] ${className}`} role="img" aria-label="Preview of the Omegs mobile app showing upcoming bookings and services">
      <div className="relative rounded-[3rem] bg-navy-950 p-3 shadow-[0_40px_80px_-24px_rgba(11,22,38,0.55)] ring-1 ring-white/10">
        <div className="absolute left-1/2 top-5 z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-navy-950" aria-hidden />
        <div className="overflow-hidden rounded-[2.4rem] bg-surface" aria-hidden>
          <div className="bg-navy-900 px-5 pb-6 pt-12 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-navy-300">Good morning</p>
                <p className="text-base font-semibold">Welcome back</p>
              </div>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
                <Bell className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-5 rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
              <p className="text-[10px] uppercase tracking-wider text-mint-300">Next cleaning</p>
              <p className="mt-1 text-sm font-semibold">Deep Cleaning</p>
              <div className="mt-3 flex items-center gap-2 text-[11px] text-navy-200">
                <CalendarDays className="h-3.5 w-3.5" />
                Sat · 10:00 – 13:00
              </div>
              <div className="mt-3 flex gap-2">
                <span className="rounded-full bg-mint-400 px-3 py-1 text-[10px] font-semibold text-navy-950">Manage</span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold">Reschedule</span>
              </div>
            </div>
          </div>
          <div className="px-5 py-5">
            <p className="text-xs font-semibold text-navy-900">Book a service</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {upcoming.map((s) => (
                <div key={s.id} className="flex flex-col items-center gap-1.5 rounded-2xl bg-white p-3 shadow-soft">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-mint-50 text-mint-700">
                    <s.icon className="h-4 w-4" />
                  </span>
                  <span className="text-center text-[9px] font-medium leading-tight text-navy-700">{s.name.replace(' Cleaning', '')}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-soft">
              <img src="/images/sofa-upholstery.webp" alt="" className="h-11 w-11 rounded-xl object-cover" loading="lazy" />
              <div className="flex-1">
                <p className="text-[11px] font-semibold text-navy-900">Sofa & Upholstery</p>
                <p className="text-[10px] text-navy-500">View what's included</p>
              </div>
              <Sparkles className="h-4 w-4 text-mint-500" />
            </div>
          </div>
          <div className="flex items-center justify-around border-t border-navy-100 bg-white px-6 pb-6 pt-3 text-navy-400">
            <Home className="h-5 w-5 text-navy-900" />
            <CalendarDays className="h-5 w-5" />
            <User className="h-5 w-5" />
          </div>
        </div>
      </div>
    </div>
  );
}
