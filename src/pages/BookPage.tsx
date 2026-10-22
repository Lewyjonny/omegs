import { CalendarDays, CheckCircle2, Clock, MapPin } from 'lucide-react';
import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Alert } from '../components/ui/Alert';
import { Button, ButtonLink } from '../components/ui/Button';
import { SelectField, TextAreaField, TextField } from '../components/ui/FormField';
import { propertySizes, timeSlots } from '../data/content';
import { getServiceById, services } from '../data/services';
import { useAuth } from '../hooks/useAuth';
import { usePageMeta } from '../hooks/usePageMeta';
import { formatDate } from '../lib/format';
import { hasErrors, type Errors } from '../lib/validation';
import { BookingError, bookingService } from '../services/booking';
import type { Booking, BookingInput } from '../types';

const todayIso = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};


export default function BookPage() {
  usePageMeta('Book a Cleaning');
  const { user } = useAuth();
  const [params] = useSearchParams();
  const preselected = getServiceById(params.get('service') ?? undefined)?.id ?? '';

  const [form, setForm] = useState<BookingInput>({ serviceId: preselected, date: '', time: '', address: '', propertySize: '', notes: '' });
  const [errors, setErrors] = useState<Errors<BookingInput>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [confirmed, setConfirmed] = useState<Booking | null>(null);
  const minDate = useMemo(todayIso, []);
  const selected = getServiceById(form.serviceId);

  const update = (field: keyof BookingInput) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (v: BookingInput) => {
    const e: Errors<BookingInput> = {};
    if (!v.serviceId) e.serviceId = 'Please choose a service.';
    if (!v.date) e.date = 'Please choose a preferred date.';
    else if (v.date < minDate) e.date = 'Please choose a date from today onwards.';
    if (!v.time) e.time = 'Please choose a preferred time.';
    else if (v.date === minDate && new Date(`${v.date}T${v.time}`) <= new Date()) e.time = 'This time has already passed today. Please choose a later time.';
    if (v.address.trim().length < 5) e.address = 'Please enter the address for the cleaning.';
    if (!v.propertySize) e.propertySize = 'Please select the property size.';
    return e;
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitError('');
    const e = validate(form);
    setErrors(e);
    if (hasErrors(e) || !user) return;
    setLoading(true);
    try {
      const booking = await bookingService.create(user.id, { ...form, address: form.address.trim(), notes: form.notes?.trim() });
      setConfirmed(booking);
      window.scrollTo({ top: 0 });
    } catch (err) {
      setSubmitError(err instanceof BookingError ? err.message : 'We could not save your booking request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (confirmed) {
    const service = getServiceById(confirmed.serviceId);
    return (
      <section className="bg-surface py-16 lg:py-24">
        <div className="container-page max-w-2xl">
          <div className="card p-8 text-center sm:p-12">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-mint-100 text-mint-700">
              <CheckCircle2 className="h-8 w-8" aria-hidden />
            </span>
            <h1 className="mt-6 text-3xl font-bold">Booking request received</h1>
            <p className="mt-3 text-navy-600">Thanks, {user?.fullName.split(' ')[0]}. Here's a summary of your request.</p>
            <dl className="mt-8 space-y-4 rounded-2xl bg-surface p-6 text-left text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-navy-500">Service</dt>
                <dd className="font-semibold text-navy-900">{service?.name}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-navy-500">Date</dt>
                <dd className="font-semibold text-navy-900">{formatDate(confirmed.date)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-navy-500">Time</dt>
                <dd className="font-semibold text-navy-900">{confirmed.time}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-navy-500">Address</dt>
                <dd className="text-right font-semibold text-navy-900">{confirmed.address}</dd>
              </div>
            </dl>
            {bookingService.isDemo ? (
              <Alert tone="demo" title="Demo booking" className="mt-6 text-left">
                This request is saved only in your browser for demonstration. It has not been sent to Omegs or stored in a production database.
              </Alert>
            ) : (
              <Alert tone="info" title="What happens next" className="mt-6 text-left">
                Our team will review your request and confirm your booking. You can check its status or cancel it any time before the cleaning under My bookings.
              </Alert>
            )}
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <ButtonLink to="/account">View my bookings</ButtonLink>
              <Button
                variant="outline"
                onClick={() => {
                  setConfirmed(null);
                  setForm({ serviceId: '', date: '', time: '', address: '', propertySize: '', notes: '' });
                }}
              >
                Book another
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-surface py-12 lg:py-20">
      <div className="container-page grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <span className="eyebrow">Book a cleaning</span>
          <h1 className="mt-4 text-3xl font-bold sm:text-4xl">Tell us about your cleaning</h1>
          <p className="mt-3 text-navy-600">Choose a service and your preferred time. We'll use these details to confirm your booking.</p>
          {bookingService.isDemo && (
            <Alert tone="demo" title="Demo booking flow" className="mt-6">
              Bookings are saved only in this browser until a booking backend is connected. Nothing is sent to Omegs yet.
            </Alert>
          )}
          {submitError && (
            <Alert tone="error" className="mt-4">
              {submitError}
            </Alert>
          )}
          <form onSubmit={onSubmit} noValidate className="card mt-8 space-y-6 p-6 sm:p-8">
            <fieldset>
              <legend className="mb-3 text-sm font-medium text-navy-800">Service</legend>
              <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-describedby={errors.serviceId ? 'service-error' : undefined}>
                {services.map((s) => {
                  const active = form.serviceId === s.id;
                  return (
                    <label
                      key={s.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-2xl p-4 ring-1 ring-inset transition focus-within:ring-2 focus-within:ring-mint-500 ${
                        active ? 'bg-mint-50 ring-mint-400' : 'bg-white ring-navy-200 hover:ring-navy-300'
                      }`}
                    >
                      <input type="radio" name="serviceId" value={s.id} checked={active} onChange={update('serviceId')} className="sr-only" />
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${active ? 'bg-mint-400 text-navy-950' : 'bg-surface text-navy-600'}`}>
                        <s.icon className="h-5 w-5" aria-hidden />
                      </span>
                      <span className="text-sm font-semibold text-navy-900">{s.name}</span>
                    </label>
                  );
                })}
              </div>
              {errors.serviceId && (
                <p id="service-error" role="alert" className="mt-2 text-sm text-red-600">
                  {errors.serviceId}
                </p>
              )}
            </fieldset>

            <div className="grid gap-5 sm:grid-cols-2">
              <TextField label="Preferred date" type="date" name="date" min={minDate} value={form.date} onChange={update('date')} error={errors.date} />
              <SelectField label="Preferred time" name="time" value={form.time} onChange={update('time')} error={errors.time}>
                <option value="">Select a time</option>
                {timeSlots.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </SelectField>
            </div>
            <TextField label="Address" name="address" autoComplete="street-address" placeholder="Street, number, city" value={form.address} onChange={update('address')} error={errors.address} />
            <SelectField label="Property size" name="propertySize" value={form.propertySize} onChange={update('propertySize')} error={errors.propertySize}>
              <option value="">Select size</option>
              {propertySizes.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </SelectField>
            <TextAreaField
              label="Additional details"
              name="notes"
              optional
              placeholder="Access instructions, pets, areas to focus on…"
              value={form.notes}
              onChange={update('notes')}
            />
            <Button type="submit" size="lg" className="w-full" loading={loading}>
              {loading ? 'Submitting request…' : 'Request booking'}
            </Button>
          </form>
        </div>

        <aside className="lg:col-span-5">
          <div className="card sticky top-24 overflow-hidden">
            {selected ? (
              <>
                <img src={selected.image} alt="" className="aspect-[16/9] w-full object-cover" />
                <div className="p-7">
                  <p className="text-xs font-semibold uppercase tracking-wider text-mint-700">Your selection</p>
                  <h2 className="mt-2 text-2xl font-bold">{selected.name}</h2>
                  <p className="mt-2 text-sm text-navy-600">{selected.shortDescription}</p>
                  <ul className="mt-6 space-y-3 text-sm text-navy-700">
                    <li className="flex items-center gap-3">
                      <CalendarDays className="h-4 w-4 text-mint-600" aria-hidden />
                      {form.date ? formatDate(form.date) : 'Choose a date'}
                    </li>
                    <li className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-mint-600" aria-hidden />
                      {form.time || 'Choose a time'}
                    </li>
                    <li className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-mint-600" aria-hidden />
                      {form.address || 'Add your address'}
                    </li>
                  </ul>
                  <p className="mt-6 border-t border-navy-100 pt-5 text-sm text-navy-500">
                    Price: <span className="font-semibold text-navy-800">{selected.startingPrice !== null ? `From $${selected.startingPrice}` : 'Quoted before confirmation'}</span>
                  </p>
                  <Link to={`/services/${selected.id}`} className="mt-3 inline-block text-sm font-semibold text-mint-700 hover:underline">
                    What's included →
                  </Link>
                </div>
              </>
            ) : (
              <div className="p-10 text-center">
                <p className="text-lg font-semibold">No service selected</p>
                <p className="mt-2 text-sm text-navy-500">Choose a service to see a summary of your booking here.</p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
