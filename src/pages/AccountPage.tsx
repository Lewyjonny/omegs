import { CalendarDays, Clock, MapPin, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Alert } from '../components/ui/Alert';
import { Button, ButtonLink } from '../components/ui/Button';
import { getServiceById } from '../data/services';
import { useAuth } from '../hooks/useAuth';
import { usePageMeta } from '../hooks/usePageMeta';
import { bookingService } from '../services/booking';
import type { Booking } from '../types';
import { formatDate } from '../lib/format';

export default function AccountPage() {
  usePageMeta('My bookings');
  const { user, mode } = useAuth();
  const location = useLocation();
  const navState = location.state as { welcome?: boolean; passwordUpdated?: boolean } | null;
  const welcome = navState?.welcome;
  const passwordUpdated = navState?.passwordUpdated;
  const [bookings, setBookings] = useState<Booking[] | null>(null);

  const load = useCallback(async () => {
    if (user) setBookings(await bookingService.list(user.id));
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const cancel = async (id: string) => {
    if (!user) return;
    await bookingService.cancel(user.id, id);
    load();
  };

  return (
    <section className="bg-surface py-12 lg:py-20">
      <div className="container-page max-w-4xl">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <span className="eyebrow">Your account</span>
            <h1 className="mt-4 text-3xl font-bold sm:text-4xl">Hi, {user?.fullName.split(' ')[0]}</h1>
            <p className="mt-2 text-navy-600">{user?.email}</p>
          </div>
          <ButtonLink to="/book">Book a Cleaning</ButtonLink>
        </div>

        <div className="mt-6 space-y-3">
          {welcome && <Alert tone="success" title="Account created">Welcome to Omegs! You can now book your first cleaning.</Alert>}
          {passwordUpdated && <Alert tone="success" title="Password updated">Your new password is saved. Use it next time you log in.</Alert>}
          {mode === 'demo' && <Alert tone="demo">You're signed in with a demo account stored only in this browser.</Alert>}
        </div>

        <div className="mt-10">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">Booking requests</h2>
            {bookingService.isDemo && <span className="text-xs text-navy-500">(saved in this browser only)</span>}
          </div>
          {bookings === null ? (
            <div className="mt-6 space-y-4" aria-busy="true" aria-label="Loading bookings">
              {[0, 1].map((i) => (
                <div key={i} className="h-28 animate-pulse rounded-3xl bg-white" />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="card mt-6 p-10 text-center">
              <CalendarDays className="mx-auto h-10 w-10 text-navy-300" aria-hidden />
              <p className="mt-4 text-lg font-semibold">No bookings yet</p>
              <p className="mt-1 text-sm text-navy-500">When you request a cleaning, it will appear here.</p>
              <ButtonLink to="/services" variant="outline" className="mt-6">
                Explore services
              </ButtonLink>
            </div>
          ) : (
            <ul className="mt-6 space-y-4">
              {bookings.map((b) => {
                const service = getServiceById(b.serviceId);
                return (
                  <li key={b.id} className="card flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
                    {service && <img src={service.image} alt="" className="h-24 w-full rounded-2xl object-cover sm:w-32" />}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-navy-900">{service?.name ?? 'Service'}</p>
                        <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-200">Requested</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-navy-600">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays className="h-4 w-4" aria-hidden /> {formatDate(b.date)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4" aria-hidden /> {b.time}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" aria-hidden /> {b.address}
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => cancel(b.id)} aria-label={`Cancel ${service?.name} booking on ${b.date}`}>
                      <Trash2 className="h-4 w-4" aria-hidden /> Cancel
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
