import { CalendarDays, Clock, Lock, MapPin, Pencil, Phone, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/StatusBadge';
import { getServiceById } from '../data/services';
import { useAuth } from '../hooks/useAuth';
import { usePageMeta } from '../hooks/usePageMeta';
import { formatDate, formatHours, formatMoney, localIsoDate } from '../lib/format';
import { StaffError, staffService, type EntryInput, type StaffEntry, type StaffJob } from '../services/staff';

type Notice = { tone: 'success' | 'error'; text: string } | null;

const errorText = (err: unknown) => (err instanceof StaffError ? err.message : 'Something went wrong. Please try again.');
const serviceName = (id: string) => getServiceById(id)?.name ?? 'Cleaning job';

const minutes = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

/** Same formula as the database: (end - start - break) in hours, rounded to 2 decimals. */
const calcHours = (start: string, end: string, breakMinutes: number) =>
  start && end ? Math.round(((minutes(end) - minutes(start) - breakMinutes) / 60) * 100) / 100 : 0;

const startOfWeek = () => {
  const d = new Date();
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return localIsoDate(d);
};

function totalsFrom(entries: StaffEntry[], from?: string) {
  const t = { hours: 0, approvedHours: 0, approvedPay: 0, waitingHours: 0 };
  for (const e of entries) {
    if (e.status === 'rejected' || (from && e.workDate < from)) continue;
    t.hours += e.hours;
    if (e.status === 'approved') {
      t.approvedHours += e.hours;
      t.approvedPay += e.pay;
    } else t.waitingHours += e.hours;
  }
  return t;
}

function TotalCard({ label, entries, from }: { label: string; entries: StaffEntry[]; from?: string }) {
  const t = totalsFrom(entries, from);
  return (
    <div className="card p-5" aria-label={`Totals ${label}`}>
      <p className="text-sm font-semibold text-navy-600">{label}</p>
      <p className="mt-1 text-3xl font-bold text-navy-900">{formatHours(t.hours)}</p>
      <p className="mt-2 text-sm text-navy-700">
        Approved: <span className="font-semibold">{formatHours(t.approvedHours)}</span> · <span className="font-semibold">{formatMoney(t.approvedPay)}</span>
      </p>
      {t.waitingHours > 0 && <p className="text-sm text-amber-800">{formatHours(t.waitingHours)} waiting approval</p>}
    </div>
  );
}

const emptyForm = (job?: StaffJob): EntryInput => ({
  bookingId: job?.id ?? null,
  workDate: job?.date ?? localIsoDate(),
  startTime: job?.time ?? '',
  endTime: '',
  breakMinutes: 0,
  notes: '',
});

function HoursForm({
  jobs,
  rate,
  editing,
  prefill,
  onSaved,
  onCancel,
}: {
  jobs: StaffJob[];
  rate: number | null;
  editing: StaffEntry | null;
  prefill: StaffJob | null;
  onSaved: (text: string) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<EntryInput>(() =>
    editing
      ? { bookingId: editing.bookingId, workDate: editing.workDate, startTime: editing.startTime, endTime: editing.endTime, breakMinutes: editing.breakMinutes, notes: editing.notes ?? '' }
      : emptyForm(prefill ?? undefined),
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const today = localIsoDate();
  const linkable = jobs.filter((j) => (j.date <= today && j.status !== 'cancelled') || j.id === form.bookingId);
  const hours = calcHours(form.startTime, form.endTime, form.breakMinutes);
  const set = <K extends keyof EntryInput>(key: K, value: EntryInput[K]) => setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    if (!form.workDate) return 'Please choose the date you worked.';
    if (form.workDate > today) return 'Hours can’t be logged for a future date.';
    if (!form.startTime || !form.endTime) return 'Please enter your start and end times.';
    if (minutes(form.endTime) <= minutes(form.startTime)) return 'The end time must be after the start time.';
    if (!Number.isInteger(form.breakMinutes) || form.breakMinutes < 0) return 'Break must be 0 minutes or more.';
    if (form.breakMinutes >= minutes(form.endTime) - minutes(form.startTime)) return 'The break must be shorter than the shift.';
    if (form.notes.length > 1000) return 'Notes must be 1000 characters or fewer.';
    return '';
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const problem = validate();
    setError(problem);
    if (problem) return;
    setSaving(true);
    try {
      if (editing) {
        await staffService.updateEntry(editing.id, form);
        onSaved('Hours updated and sent for approval.');
      } else {
        await staffService.addEntry(form);
        onSaved('Hours saved and sent for approval.');
      }
    } catch (err) {
      setError(errorText(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="card space-y-4 p-5 sm:p-6" aria-label={editing ? 'Edit hours' : 'Add hours'}>
      <h2 className="text-xl font-bold">{editing ? 'Edit hours' : 'Add hours'}</h2>
      {editing?.status === 'rejected' && <p className="text-sm text-navy-600">Saving your changes sends these hours back for approval.</p>}
      <label className="grid gap-1 text-sm font-semibold text-navy-700">
        Job (optional)
        <select
          className="input"
          value={form.bookingId ?? ''}
          onChange={(e) => {
            const job = jobs.find((j) => j.id === e.target.value);
            setForm((f) => ({ ...f, bookingId: job?.id ?? null, workDate: job ? job.date : f.workDate }));
          }}
        >
          <option value="">Not linked to a job</option>
          {linkable.map((j) => (
            <option key={j.id} value={j.id}>
              {serviceName(j.serviceId)} · {j.date} · {j.customerName}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm font-semibold text-navy-700">
        Date
        <input type="date" className="input" value={form.workDate} max={today} onChange={(e) => set('workDate', e.target.value)} required />
      </label>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <label className="grid gap-1 text-sm font-semibold text-navy-700">
          Start
          <input type="time" className="input" value={form.startTime} onChange={(e) => set('startTime', e.target.value)} required />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-navy-700">
          End
          <input type="time" className="input" value={form.endTime} onChange={(e) => set('endTime', e.target.value)} required />
        </label>
        <label className="col-span-2 grid gap-1 text-sm font-semibold text-navy-700 sm:col-span-1">
          Break (minutes)
          <input
            type="number"
            inputMode="numeric"
            min={0}
            step={5}
            className="input"
            value={Number.isNaN(form.breakMinutes) ? '' : form.breakMinutes}
            onChange={(e) => set('breakMinutes', e.target.value === '' ? 0 : Number(e.target.value))}
          />
        </label>
      </div>
      <label className="grid gap-1 text-sm font-semibold text-navy-700">
        Notes (optional)
        <textarea className="input min-h-20" maxLength={1000} value={form.notes} onChange={(e) => set('notes', e.target.value)} />
      </label>
      <p className="rounded-2xl bg-surface p-3 text-sm text-navy-700" aria-live="polite">
        {hours > 0 ? (
          <>
            Total: <span className="font-semibold">{formatHours(hours)}</span>
            {rate !== null && (
              <>
                {' '}
                × {formatMoney(rate)}/h = <span className="font-semibold">{formatMoney(Math.round(hours * rate * 100) / 100)}</span>
              </>
            )}
          </>
        ) : (
          'Enter your start and end times to see your total.'
        )}
      </p>
      {error && <Alert tone="error">{error}</Alert>}
      <div className="flex flex-wrap gap-3">
        <Button type="submit" loading={saving}>
          {editing ? 'Save changes' : 'Save hours'}
        </Button>
        {(editing || prefill) && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

function JobCard({ job, onLog }: { job: StaffJob; onLog?: () => void }) {
  return (
    <li className="card p-5" aria-label={`Job: ${serviceName(job.serviceId)} on ${job.date}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="font-semibold text-navy-900">{serviceName(job.serviceId)}</p>
        <Badge value={job.status} />
      </div>
      <div className="mt-2 grid gap-1 text-sm text-navy-600">
        <span className="flex items-center gap-1.5">
          <CalendarDays className="h-4 w-4" aria-hidden /> {formatDate(job.date)}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" aria-hidden /> {job.time}
        </span>
        <span className="flex items-center gap-1.5">
          <MapPin className="h-4 w-4" aria-hidden /> {job.address}
        </span>
      </div>
      <p className="mt-3 text-sm text-navy-700">
        <span className="font-semibold">{job.customerName}</span>
        {job.customerPhone && (
          <a href={`tel:${job.customerPhone}`} className="ml-2 inline-flex items-center gap-1 text-mint-700 hover:underline">
            <Phone className="h-3.5 w-3.5" aria-hidden /> {job.customerPhone}
          </a>
        )}
      </p>
      <p className="text-sm text-navy-600">Size: {job.propertySize}</p>
      {job.notes && <p className="text-sm text-navy-600">Notes: {job.notes}</p>}
      {onLog && (
        <Button variant="secondary" size="sm" className="mt-4" onClick={onLog}>
          Log hours for this job
        </Button>
      )}
    </li>
  );
}

function EntryCard({ entry, job, onEdit, onDelete }: { entry: StaffEntry; job?: StaffJob; onEdit: () => void; onDelete: () => void }) {
  const locked = entry.status === 'approved';
  return (
    <li className="card p-5" aria-label={`Hours on ${entry.workDate} ${entry.startTime}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-navy-900">{formatDate(entry.workDate)}</p>
          <p className="text-sm text-navy-600">
            {entry.startTime}–{entry.endTime}
            {entry.breakMinutes > 0 && ` · ${entry.breakMinutes} min break`}
            {job && ` · ${serviceName(job.serviceId)} (${job.customerName})`}
          </p>
        </div>
        <Badge value={entry.status} />
      </div>
      <p className="mt-3 text-sm text-navy-700">
        <span className="font-semibold">{formatHours(entry.hours)}</span> × {formatMoney(entry.hourlyRate)}/h = <span className="font-semibold">{formatMoney(entry.pay)}</span>
      </p>
      {entry.notes && <p className="mt-1 text-sm text-navy-600">Notes: {entry.notes}</p>}
      {entry.reviewNote && <p className={`mt-1 text-sm ${entry.status === 'rejected' ? 'text-red-700' : 'text-navy-600'}`}>Admin note: {entry.reviewNote}</p>}
      <div className="mt-4 flex flex-wrap gap-2 border-t border-navy-100 pt-3">
        {locked ? (
          <p className="flex items-center gap-1.5 text-sm text-navy-500">
            <Lock className="h-4 w-4" aria-hidden /> Approved hours are locked
          </p>
        ) : (
          <>
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Pencil className="h-4 w-4" aria-hidden /> Edit
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4" aria-hidden /> Delete
            </Button>
          </>
        )}
      </div>
    </li>
  );
}

export default function StaffPage() {
  usePageMeta('Staff', 'Your Omegs jobs and hours.');
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const [jobs, setJobs] = useState<StaffJob[] | null>(null);
  const [entries, setEntries] = useState<StaffEntry[] | null>(null);
  const [rate, setRate] = useState<number | null>(null);
  const [loadError, setLoadError] = useState('');
  const [notice, setNotice] = useState<Notice>(null);
  const [editing, setEditing] = useState<StaffEntry | null>(null);
  const [prefill, setPrefill] = useState<StaffJob | null>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const noticeRef = useRef<HTMLDivElement>(null);

  const reload = useCallback(async () => {
    setLoadError('');
    try {
      const [j, e, r] = await Promise.all([staffService.listJobs(userId), staffService.listEntries(userId), staffService.getHourlyRate(userId)]);
      setJobs(j);
      setEntries(e);
      setRate(r);
    } catch (err) {
      setLoadError(errorText(err));
    }
  }, [userId]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    if (notice) noticeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [notice]);

  const openForm = (entry: StaffEntry | null, job: StaffJob | null) => {
    setNotice(null);
    setEditing(entry);
    setPrefill(job);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  };

  const remove = async (entry: StaffEntry) => {
    if (!window.confirm(`Delete your hours for ${formatDate(entry.workDate)}?`)) return;
    try {
      await staffService.deleteEntry(entry.id);
      setNotice({ tone: 'success', text: 'Hours deleted.' });
      if (editing?.id === entry.id) setEditing(null);
    } catch (err) {
      setNotice({ tone: 'error', text: errorText(err) });
    }
    reload();
  };

  const today = localIsoDate();
  const jobById = new Map((jobs ?? []).map((j) => [j.id, j]));
  const upcoming = (jobs ?? []).filter((j) => j.date >= today && (j.status === 'requested' || j.status === 'confirmed'));
  const recent = (jobs ?? [])
    .filter((j) => !upcoming.includes(j))
    .reverse()
    .slice(0, 10);
  const firstName = user?.fullName.split(' ')[0] || 'there';
  const list = entries ?? [];

  return (
    <section className="bg-surface/50 py-10 lg:py-14">
      <div className="container-page">
        <span className="eyebrow">Staff</span>
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Hi, {firstName}</h1>
        <p className="mt-2 text-navy-600">Your jobs and hours. Log your hours after each job and Omegs will approve them.</p>

        {loadError && (
          <Alert tone="error" className="mt-6">
            {loadError}
          </Alert>
        )}
        {!entries && !loadError && (
          <p className="py-10 text-center text-navy-600" role="status">
            Loading…
          </p>
        )}

        {entries && jobs && (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <TotalCard label="This week" entries={list} from={startOfWeek()} />
              <TotalCard label="This month" entries={list} from={`${today.slice(0, 8)}01`} />
              <TotalCard label="All time" entries={list} />
            </div>
            {rate === null && (
              <Alert tone="info" className="mt-4">
                Your hourly rate hasn’t been set yet, so pay shows as £0. Ask an Omegs admin to set it.
              </Alert>
            )}

            <div ref={noticeRef} className="mt-6">
              {notice && <Alert tone={notice.tone}>{notice.text}</Alert>}
            </div>

            <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
              <div ref={formRef} className="scroll-mt-24">
                <HoursForm
                  key={`${editing?.id ?? 'new'}-${prefill?.id ?? ''}`}
                  jobs={jobs}
                  rate={rate}
                  editing={editing}
                  prefill={prefill}
                  onSaved={(text) => {
                    setNotice({ tone: 'success', text });
                    setEditing(null);
                    setPrefill(null);
                    reload();
                  }}
                  onCancel={() => openForm(null, null)}
                />
              </div>

              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-bold">Upcoming jobs</h2>
                  {upcoming.length === 0 ? (
                    <p className="mt-3 rounded-2xl bg-surface p-6 text-center text-navy-600">No upcoming jobs assigned to you.</p>
                  ) : (
                    <ul className="mt-3 grid gap-4">
                      {upcoming.map((j) => (
                        <JobCard key={j.id} job={j} onLog={j.date <= today ? () => openForm(null, j) : undefined} />
                      ))}
                    </ul>
                  )}
                </div>
                {recent.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold">Recent jobs</h2>
                    <ul className="mt-3 grid gap-4">
                      {recent.map((j) => (
                        <JobCard key={j.id} job={j} onLog={j.status !== 'cancelled' ? () => openForm(null, j) : undefined} />
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-10">
              <h2 className="text-xl font-bold">My hours</h2>
              {list.length === 0 ? (
                <p className="mt-3 rounded-2xl bg-surface p-6 text-center text-navy-600">You haven’t logged any hours yet.</p>
              ) : (
                <ul className="mt-3 grid gap-4 md:grid-cols-2">
                  {list.map((e) => (
                    <EntryCard
                      key={e.id}
                      entry={e}
                      job={e.bookingId ? jobById.get(e.bookingId) : undefined}
                      onEdit={() => openForm(e, null)}
                      onDelete={() => remove(e)}
                    />
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
