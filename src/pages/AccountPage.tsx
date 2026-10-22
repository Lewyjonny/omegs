import { CalendarDays, Clock, MapPin, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Alert } from '../components/ui/Alert';
import { Button, ButtonLink } from '../components/ui/Button';
import { getServiceById } from '../data/services';
import { useAuth } from '../hooks/useAuth';
import { usePageMeta } from '../hooks/usePageMeta';
import { BookingError, bookingService } from '../services/booking';
import type { Booking, BookingStatus } from '../types';
import { formatDate } from '../lib/format';

const statusStyles: Record<BookingStatus, { label: string; className: string }> = {
  requested: { label: 'Requested', className: 'bg-amber-50 text-amber-800 ring-amber-200' },
  confirmed: { label: 'Confirmed', className: 'bg-mint-50 text-mint-800 ring-mint-200' },
  completed: { label: 'Completed', className: 'bg-navy-50 text-navy-700 ring-navy-200' },
  cancelled: { label: 'Cancelled', className: 'bg-red-50 text-red-700 ring-red-200' },
};

const hasStarted = (b: Booking) => new Date(`${b.date}T${b.time}`) <= new Date();
const isUpcoming = (b: Booking) => (b.status === 'requested' || b.status === 'confirmed') && !hasStarted(b);

function BookingCard({ booking, onCancel }: { booking: Booking; onCancel?: (id: string) => Promise<void> }) {
  const service = getServiceById(booking.serviceId);
  const status = statusStyles[booking.status];
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const cancel = async () => {
    if (!onCancel) return;
    setCancelling(true);
    try {
      await onCancel(booking.id);
    } finally {
      setCancelling(false);
      setConfirming(false);
    }
  };

  return (
    <li className={`card flex flex-col gap-5 p-5 sm:flex-row sm:items-center ${booking.status === 'cancelled' ? 'opacity-75' : ''}`}>
      {service && <img src={service.image} alt="" className="h-24 w-full rounded-2xl object-cover sm:w-32" />}
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-navy-900">{service?.name ?? 'Service'}</p>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${status.className}`}>{status.label}</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-navy-600">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4" aria-hidden /> {formatDate(booking.date)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" aria-hidden /> {booking.time}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4" aria-hidden /> {booking.address}
          </span>
        </div>
      </div>
      {onCancel &&
        (confirming ? (
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Confirm cancellation">
            <span className="text-sm text-navy-600">Cancel this booking?</span>
            <Button variant="outline" size="sm" onClick={cancel} loading={cancelling}>
              Yes, cancel
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirming(false)} disabled={cancelling}>
              Keep
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => setConfirming(true)} aria-label={`Cancel ${service?.name ?? ''} booking on ${booking.date}`}>
            <X className="h-4 w-4" aria-hidden /> Cancel
          </Button>
        ))}
    </li>
  );
}

export default function AccountPage() {
  usePageMeta('My bookings');
  const { user, mode } = useAuth();
  const location = useLocation();
  const navState = location.state as { welcome?: boolean; passwordUpdated?: boolean } | null;
  const welcome = navState?.welcome;
  const passwordUpdated = navState?.passwordUpdated;
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setBookings(await bookingService.list(user.id));
    } catch (err) {
      setBookings([]);
      setError(err instanceof BookingError ? err.message : 'We could not load your bookings. Please refresh the page.');
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const cancel = async (id: string) => {
    if (!user) return;
    setError('');
    setNotice('');
    try {
      await bookingService.cancel(user.id, id);
      setNotice('Your booking has been cancelled.');
    } catch (err) {
      setError(err instanceof BookingError ? err.message : 'We could not cancel this booking. Please try again.');
    }
    await load();
  };

  const upcoming = bookings?.filter(isUpcoming) ?? [];
  const past = bookings?.filter((b) => !isUpcoming(b)).reverse() ?? [];

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
          {notice && <Alert tone="success">{notice}</Alert>}
          {error && <Alert tone="error">{error}</Alert>}
        </div>

        <div className="mt-10">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">Upcoming bookings</h2>
            {bookingService.isDemo && <span className="text-xs text-navy-500">(saved in this browser only)</span>}
          </div>
          {bookings === null ? (
            <div className="mt-6 space-y-4" aria-busy="true" aria-label="Loading bookings">
              {[0, 1].map((i) => (
                <div key={i} className="h-28 animate-pulse rounded-3xl bg-white" />
              ))}
            </div>
          ) : upcoming.length === 0 ? (
            <div className="card mt-6 p-10 text-center">
              <CalendarDays className="mx-auto h-10 w-10 text-navy-300" aria-hidden />
              <p className="mt-4 text-lg font-semibold">No upcoming bookings</p>
              <p className="mt-1 text-sm text-navy-500">When you request a cleaning, it will appear here.</p>
              <ButtonLink to="/services" variant="outline" className="mt-6">
                Explore services
              </ButtonLink>
            </div>
          ) : (
            <ul className="mt-6 space-y-4">
              {upcoming.map((b) => (
                <BookingCard key={b.id} booking={b} onCancel={cancel} />
              ))}
            </ul>
          )}
        </div>

        {past.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold">Past and cancelled</h2>
            <ul className="mt-6 space-y-4">
              {past.map((b) => (
                <BookingCard key={b.id} booking={b} />
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
