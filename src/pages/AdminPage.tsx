import { Check, Mail, Phone, RefreshCw, RotateCcw, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/StatusBadge';
import { getServiceById } from '../data/services';
import { useAuth } from '../hooks/useAuth';
import { usePageMeta } from '../hooks/usePageMeta';
import { formatDate, formatHours, formatMoney, localIsoDate } from '../lib/format';
import {
  AdminError,
  adminService,
  type AdminBooking,
  type AdminMessage,
  type AdminTimeEntry,
  type MessageStatus,
  type Person,
  type TimeEntryStatus,
} from '../services/admin';
import type { BookingStatus, UserRole } from '../types';

type Tab = 'bookings' | 'messages' | 'timesheets' | 'users';
type Notice = { tone: 'success' | 'error'; text: string } | null;

const tabs: { id: Tab; label: string }[] = [
  { id: 'bookings', label: 'Bookings' },
  { id: 'messages', label: 'Messages' },
  { id: 'timesheets', label: 'Timesheets' },
  { id: 'users', label: 'Users' },
];

const errorText = (err: unknown) => (err instanceof AdminError ? err.message : 'Something went wrong. Please try again.');

function useLoader<T>(load: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setData(await load());
    } catch (err) {
      setError(errorText(err));
    } finally {
      setLoading(false);
    }
  }, [load]);
  useEffect(() => {
    reload();
  }, [reload]);
  return { data, setData, error, loading, reload };
}

function Toolbar({ children, onRefresh, loading }: { children?: ReactNode; onRefresh: () => void; loading: boolean }) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      {children}
      <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading} className="ml-auto">
        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden />
        Refresh
      </Button>
    </div>
  );
}

function Filter<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <label className="grid gap-1 text-xs font-semibold text-navy-600">
      {label}
      <select className="input h-10 py-0 text-sm" value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-2xl bg-surface p-8 text-center text-navy-600">{children}</p>;
}

function NoticeBar({ notice }: { notice: Notice }) {
  if (!notice) return null;
  return <Alert tone={notice.tone}>{notice.text}</Alert>;
}

/* ------------------------------------------------------------------ Bookings */

function BookingsTab({ people }: { people: Person[] }) {
  const load = useCallback(() => adminService.listBookings(), []);
  const { data, setData, error, loading, reload } = useLoader(load);
  const [filter, setFilter] = useState<'upcoming' | 'requested' | 'past' | 'all'>('upcoming');
  const [notice, setNotice] = useState<Notice>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const byId = useMemo(() => new Map(people.map((p) => [p.id, p])), [people]);
  const staff = people.filter((p) => p.role === 'employee' || p.role === 'admin');
  const today = localIsoDate();

  const shown = (data ?? []).filter((b) => {
    const open = b.status === 'requested' || b.status === 'confirmed';
    if (filter === 'requested') return b.status === 'requested';
    if (filter === 'upcoming') return open && b.date >= today;
    if (filter === 'past') return !open || b.date < today;
    return true;
  });
  if (filter === 'upcoming' || filter === 'requested') shown.reverse();

  const update = async (b: AdminBooking, changes: { status?: BookingStatus; assignedEmployeeId?: string | null }, success: string) => {
    setBusy(b.id);
    setNotice(null);
    try {
      await adminService.updateBooking(b.id, changes);
      setData((list) => (list ?? []).map((x) => (x.id === b.id ? { ...x, ...changes } : x)));
      setNotice({ tone: 'success', text: success });
    } catch (err) {
      setNotice({ tone: 'error', text: errorText(err) });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-5">
      <Toolbar onRefresh={reload} loading={loading}>
        <Filter
          label="Show"
          value={filter}
          onChange={setFilter}
          options={[
            ['upcoming', 'Upcoming'],
            ['requested', 'Needs confirming'],
            ['past', 'Past and cancelled'],
            ['all', 'All bookings'],
          ]}
        />
      </Toolbar>
      <NoticeBar notice={notice} />
      {error && <Alert tone="error">{error}</Alert>}
      {data && shown.length === 0 && <Empty>No bookings to show.</Empty>}
      <ul className="grid gap-4">
        {shown.map((b) => {
          const customer = byId.get(b.customerId);
          const service = getServiceById(b.serviceId);
          return (
            <li key={b.id} className="card p-5 sm:p-6" aria-label={`${service?.name ?? b.serviceId} on ${b.date}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">{service?.name ?? b.serviceId}</h3>
                  <p className="text-sm text-navy-600">
                    {formatDate(b.date)} at {b.time}
                  </p>
                </div>
                <Badge value={b.status} />
              </div>
              <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="font-semibold">{customer?.fullName ?? 'Unknown customer'}</p>
                  {customer?.email && (
                    <a className="flex items-center gap-2 text-mint-700 hover:underline" href={`mailto:${customer.email}`}>
                      <Mail className="h-4 w-4" aria-hidden /> {customer.email}
                    </a>
                  )}
                  {customer?.phone && (
                    <a className="flex items-center gap-2 text-mint-700 hover:underline" href={`tel:${customer.phone}`}>
                      <Phone className="h-4 w-4" aria-hidden /> {customer.phone}
                    </a>
                  )}
                </div>
                <div className="space-y-1 text-navy-700">
                  <p>{b.address}</p>
                  <p>Size: {b.propertySize}</p>
                  {b.notes && <p className="whitespace-pre-wrap">Notes: {b.notes}</p>}
                </div>
              </div>
              <div className="mt-5 grid gap-3 border-t border-navy-100 pt-4 sm:grid-cols-2">
                <label className="grid gap-1 text-xs font-semibold text-navy-600">
                  Status
                  <select
                    className="input h-10 py-0 text-sm"
                    value={b.status}
                    disabled={busy === b.id}
                    onChange={(e) => {
                      const status = e.target.value as BookingStatus;
                      update(b, { status }, `Booking marked as ${status}.`);
                    }}
                  >
                    <option value="requested">Requested</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </label>
                <label className="grid gap-1 text-xs font-semibold text-navy-600">
                  Assigned employee
                  <select
                    className="input h-10 py-0 text-sm"
                    value={b.assignedEmployeeId ?? ''}
                    disabled={busy === b.id}
                    onChange={(e) => {
                      const id = e.target.value || null;
                      update(b, { assignedEmployeeId: id }, id ? `Assigned to ${byId.get(id)?.fullName ?? 'employee'}.` : 'Employee removed from booking.');
                    }}
                  >
                    <option value="">Not assigned</option>
                    {staff.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fullName}
                        {p.role === 'admin' ? ' (admin)' : ''}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ Messages */

function MessagesTab() {
  const load = useCallback(() => adminService.listMessages(), []);
  const { data, setData, error, loading, reload } = useLoader(load);
  const [filter, setFilter] = useState<MessageStatus | 'all'>('new');
  const [notice, setNotice] = useState<Notice>(null);
  const shown = (data ?? []).filter((m) => filter === 'all' || m.status === filter);

  const setStatus = async (m: AdminMessage, status: MessageStatus) => {
    setNotice(null);
    try {
      await adminService.setMessageStatus(m.id, status);
      setData((list) => (list ?? []).map((x) => (x.id === m.id ? { ...x, status } : x)));
      setNotice({ tone: 'success', text: `Message marked as ${status}.` });
    } catch (err) {
      setNotice({ tone: 'error', text: errorText(err) });
    }
  };

  return (
    <div className="space-y-5">
      <Toolbar onRefresh={reload} loading={loading}>
        <Filter
          label="Show"
          value={filter}
          onChange={setFilter}
          options={[
            ['new', `New (${(data ?? []).filter((m) => m.status === 'new').length})`],
            ['read', 'Read'],
            ['archived', 'Archived'],
            ['all', 'All messages'],
          ]}
        />
      </Toolbar>
      <NoticeBar notice={notice} />
      {error && <Alert tone="error">{error}</Alert>}
      {data && shown.length === 0 && <Empty>No messages to show.</Empty>}
      <ul className="grid gap-4">
        {shown.map((m) => (
          <li key={m.id} className="card p-5 sm:p-6" aria-label={`Message: ${m.subject}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="break-words text-lg font-semibold">{m.subject}</h3>
                <p className="break-all text-sm text-navy-600">
                  {m.name} · {m.email} · {new Date(m.createdAt).toLocaleString()}
                </p>
              </div>
              <Badge value={m.status} />
            </div>
            <p className="mt-4 whitespace-pre-wrap break-words text-navy-800">{m.message}</p>
            <div className="mt-5 flex flex-wrap gap-2 border-t border-navy-100 pt-4">
              <a
                className="inline-flex h-9 items-center gap-2 rounded-full bg-navy-900 px-4 text-sm font-semibold text-white hover:bg-navy-800"
                href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject}`)}`}
                onClick={() => m.status === 'new' && setStatus(m, 'read')}
              >
                <Mail className="h-4 w-4" aria-hidden /> Reply by email
              </a>
              {m.status !== 'read' && (
                <Button variant="outline" size="sm" onClick={() => setStatus(m, 'read')}>
                  Mark as read
                </Button>
              )}
              {m.status !== 'new' && (
                <Button variant="outline" size="sm" onClick={() => setStatus(m, 'new')}>
                  Mark as new
                </Button>
              )}
              {m.status !== 'archived' && (
                <Button variant="ghost" size="sm" onClick={() => setStatus(m, 'archived')}>
                  Archive
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------------------------------------------------------- Timesheets */

function TimeEntryCard({ entry, person, onReview }: { entry: AdminTimeEntry; person?: Person; onReview: (e: AdminTimeEntry, s: TimeEntryStatus, note?: string) => Promise<void> }) {
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const run = async (status: TimeEntryStatus, reviewNote?: string) => {
    setBusy(true);
    await onReview(entry, status, reviewNote);
    setBusy(false);
    setRejecting(false);
  };
  return (
    <li className="card p-5" aria-label={`Hours for ${person?.fullName ?? 'employee'} on ${entry.workDate}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{person?.fullName ?? 'Unknown employee'}</h3>
          <p className="text-sm text-navy-600">
            {formatDate(entry.workDate)} · {entry.startTime}–{entry.endTime}
            {entry.breakMinutes > 0 && ` · ${entry.breakMinutes} min break`}
          </p>
        </div>
        <Badge value={entry.status} />
      </div>
      <p className="mt-3 text-sm">
        <span className="font-semibold">{formatHours(entry.hours)}</span> × {formatMoney(entry.hourlyRate)}/h ={' '}
        <span className="font-semibold">{formatMoney(entry.pay)}</span>
      </p>
      {entry.notes && <p className="mt-2 whitespace-pre-wrap text-sm text-navy-700">Notes: {entry.notes}</p>}
      {entry.reviewNote && <p className="mt-2 text-sm text-red-700">Review note: {entry.reviewNote}</p>}
      <div className="mt-4 flex flex-wrap items-end gap-2 border-t border-navy-100 pt-4">
        {entry.status === 'submitted' && !rejecting && (
          <>
            <Button size="sm" onClick={() => run('approved')} loading={busy}>
              <Check className="h-4 w-4" aria-hidden /> Approve
            </Button>
            <Button variant="outline" size="sm" onClick={() => setRejecting(true)} disabled={busy}>
              <X className="h-4 w-4" aria-hidden /> Reject
            </Button>
          </>
        )}
        {rejecting && (
          <>
            <label className="grid min-w-[14rem] flex-1 gap-1 text-xs font-semibold text-navy-600">
              Reason (shown to the employee)
              <input className="input h-10 text-sm" value={note} maxLength={500} onChange={(e) => setNote(e.target.value)} />
            </label>
            <Button variant="primary" size="sm" onClick={() => run('rejected', note)} loading={busy}>
              Confirm reject
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setRejecting(false)} disabled={busy}>
              Back
            </Button>
          </>
        )}
        {entry.status !== 'submitted' && (
          <Button variant="ghost" size="sm" onClick={() => run('submitted')} loading={busy}>
            <RotateCcw className="h-4 w-4" aria-hidden /> Move back to waiting
          </Button>
        )}
      </div>
    </li>
  );
}

function TimesheetsTab({ people }: { people: Person[] }) {
  const now = new Date();
  const [from, setFrom] = useState(localIsoDate(new Date(now.getFullYear(), now.getMonth(), 1)));
  const [to, setTo] = useState(localIsoDate(now));
  const [employee, setEmployee] = useState('all');
  const [status, setStatus] = useState<TimeEntryStatus | 'all'>('all');
  const [notice, setNotice] = useState<Notice>(null);
  const load = useCallback(() => adminService.listTimeEntries(from, to), [from, to]);
  const { data, setData, error, loading, reload } = useLoader(load);
  const byId = useMemo(() => new Map(people.map((p) => [p.id, p])), [people]);

  const inScope = (data ?? []).filter((e) => employee === 'all' || e.employeeId === employee);
  const shown = inScope.filter((e) => status === 'all' || e.status === status);
  const totals = useMemo(() => {
    const map = new Map<string, { hours: number; approvedHours: number; approvedPay: number; waiting: number }>();
    for (const e of inScope) {
      const t = map.get(e.employeeId) ?? { hours: 0, approvedHours: 0, approvedPay: 0, waiting: 0 };
      if (e.status !== 'rejected') t.hours += e.hours;
      if (e.status === 'approved') {
        t.approvedHours += e.hours;
        t.approvedPay += e.pay;
      }
      if (e.status === 'submitted') t.waiting += 1;
      map.set(e.employeeId, t);
    }
    return [...map.entries()].sort((a, b) => (byId.get(a[0])?.fullName ?? '').localeCompare(byId.get(b[0])?.fullName ?? ''));
  }, [inScope, byId]);

  const review = async (entry: AdminTimeEntry, next: TimeEntryStatus, note?: string) => {
    setNotice(null);
    try {
      await adminService.reviewTimeEntry(entry.id, next, note);
      setData((list) => (list ?? []).map((x) => (x.id === entry.id ? { ...x, status: next, reviewNote: note?.trim() || undefined } : x)));
      setNotice({ tone: 'success', text: next === 'approved' ? 'Hours approved.' : next === 'rejected' ? 'Hours rejected.' : 'Hours moved back to waiting approval.' });
    } catch (err) {
      setNotice({ tone: 'error', text: errorText(err) });
    }
  };

  const employees = people.filter((p) => p.role !== 'customer' || (data ?? []).some((e) => e.employeeId === p.id));

  return (
    <div className="space-y-5">
      <Toolbar onRefresh={reload} loading={loading}>
        <label className="grid gap-1 text-xs font-semibold text-navy-600">
          From
          <input type="date" className="input h-10 text-sm" value={from} max={to} onChange={(e) => e.target.value && setFrom(e.target.value)} />
        </label>
        <label className="grid gap-1 text-xs font-semibold text-navy-600">
          To
          <input type="date" className="input h-10 text-sm" value={to} min={from} onChange={(e) => e.target.value && setTo(e.target.value)} />
        </label>
        <Filter label="Employee" value={employee} onChange={setEmployee} options={[['all', 'All employees'], ...employees.map((p): [string, string] => [p.id, p.fullName])]} />
        <Filter
          label="Status"
          value={status}
          onChange={setStatus}
          options={[
            ['all', 'All'],
            ['submitted', 'Waiting approval'],
            ['approved', 'Approved'],
            ['rejected', 'Rejected'],
          ]}
        />
      </Toolbar>
      <NoticeBar notice={notice} />
      {error && <Alert tone="error">{error}</Alert>}
      {totals.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {totals.map(([id, t]) => (
            <div key={id} className="rounded-2xl bg-surface p-4 text-sm" aria-label={`Totals for ${byId.get(id)?.fullName ?? 'employee'}`}>
              <p className="font-semibold text-navy-900">{byId.get(id)?.fullName ?? 'Unknown employee'}</p>
              <p className="mt-1 text-navy-700">
                Approved: <span className="font-semibold">{formatHours(t.approvedHours)}</span> · <span className="font-semibold">{formatMoney(t.approvedPay)}</span>
              </p>
              <p className="text-navy-600">
                All logged: {formatHours(t.hours)}
                {t.waiting > 0 && ` · ${t.waiting} waiting approval`}
              </p>
            </div>
          ))}
        </div>
      )}
      {data && shown.length === 0 && <Empty>No hours logged for these dates.</Empty>}
      <ul className="grid gap-4">
        {shown.map((e) => (
          <TimeEntryCard key={`${e.id}-${e.status}`} entry={e} person={byId.get(e.employeeId)} onReview={review} />
        ))}
      </ul>
    </div>
  );
}

/* --------------------------------------------------------------------- Users */

function PersonCard({ person, isSelf, onSaved }: { person: Person; isSelf: boolean; onSaved: (text: string, error?: boolean) => void }) {
  const [rate, setRate] = useState(person.hourlyRate === null ? '' : String(person.hourlyRate));
  const [busy, setBusy] = useState(false);

  const save = async (changes: { role?: UserRole; hourlyRate?: number | null }, text: string) => {
    setBusy(true);
    try {
      await adminService.updatePerson(person.id, changes);
      onSaved(text);
    } catch (err) {
      onSaved(errorText(err), true);
    } finally {
      setBusy(false);
    }
  };

  const changeRole = (role: UserRole) => {
    if (role === 'admin' && !window.confirm(`Make ${person.fullName} an admin? Admins can see and change everything.`)) return;
    save({ role }, `${person.fullName} is now ${role === 'admin' ? 'an admin' : `an ${role === 'employee' ? 'employee' : 'customer'}`}.`.replace('an customer', 'a customer'));
  };

  const saveRate = () => {
    const trimmed = rate.trim();
    const value = trimmed === '' ? null : Number(trimmed);
    if (value !== null && (!Number.isFinite(value) || value < 0)) {
      onSaved('Please enter a valid hourly rate (0 or more).', true);
      return;
    }
    save({ hourlyRate: value === null ? null : Math.round(value * 100) / 100 }, `Hourly rate saved for ${person.fullName}.`);
  };

  return (
    <li className="card p-5" aria-label={person.fullName}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold">
            {person.fullName} {isSelf && <span className="text-sm font-normal text-navy-500">(you)</span>}
          </h3>
          <p className="break-all text-sm text-navy-600">{person.email}</p>
          {person.phone && <p className="text-sm text-navy-600">{person.phone}</p>}
        </div>
        <Badge value={person.role} />
      </div>
      <div className="mt-4 grid gap-3 border-t border-navy-100 pt-4 sm:grid-cols-2">
        <label className="grid gap-1 text-xs font-semibold text-navy-600">
          Role
          <select className="input h-10 py-0 text-sm" value={person.role} disabled={busy} onChange={(e) => changeRole(e.target.value as UserRole)}>
            <option value="customer">Customer</option>
            <option value="employee">Employee</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <div className="flex items-end gap-2">
          <label className="grid flex-1 gap-1 text-xs font-semibold text-navy-600">
            Hourly rate
            <input type="number" min="0" step="0.01" inputMode="decimal" className="input h-10 text-sm" value={rate} placeholder="Not set" onChange={(e) => setRate(e.target.value)} />
          </label>
          <Button variant="outline" size="sm" className="h-10" onClick={saveRate} disabled={busy}>
            Save rate
          </Button>
        </div>
      </div>
    </li>
  );
}

function UsersTab({ people, error, loading, reload }: { people: Person[]; error: string; loading: boolean; reload: () => Promise<void> }) {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<UserRole | 'all'>('all');
  const [notice, setNotice] = useState<Notice>(null);
  const q = search.trim().toLowerCase();
  const shown = people.filter(
    (p) => (role === 'all' || p.role === role) && (!q || p.fullName.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)),
  );

  return (
    <div className="space-y-5">
      <Toolbar onRefresh={reload} loading={loading}>
        <label className="grid flex-1 gap-1 text-xs font-semibold text-navy-600 sm:max-w-xs">
          Search
          <input className="input h-10 text-sm" placeholder="Name or email" value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>
        <Filter
          label="Role"
          value={role}
          onChange={setRole}
          options={[
            ['all', 'Everyone'],
            ['customer', 'Customers'],
            ['employee', 'Employees'],
            ['admin', 'Admins'],
          ]}
        />
      </Toolbar>
      <NoticeBar notice={notice} />
      {error && <Alert tone="error">{error}</Alert>}
      {!loading && shown.length === 0 && <Empty>No users found.</Empty>}
      <ul className="grid gap-4 lg:grid-cols-2">
        {shown.map((p) => (
          <PersonCard
            key={`${p.id}-${p.role}-${p.hourlyRate}`}
            person={p}
            isSelf={p.id === user?.id}
            onSaved={(text, isError) => {
              setNotice({ tone: isError ? 'error' : 'success', text });
              reload();
            }}
          />
        ))}
      </ul>
    </div>
  );
}

/* ---------------------------------------------------------------------- Page */

export default function AdminPage() {
  usePageMeta('Admin', 'Manage Omegs bookings, messages, timesheets and users.');
  const [tab, setTab] = useState<Tab>('bookings');
  const loadPeople = useCallback(() => adminService.listPeople(), []);
  const people = useLoader(loadPeople);
  const list = people.data ?? [];

  return (
    <section className="bg-surface/50 py-10 lg:py-14">
      <div className="container-page">
        <span className="eyebrow">Admin</span>
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Omegs admin</h1>
        <p className="mt-2 text-navy-600">Bookings, messages, employee hours and user roles.</p>

        <div role="tablist" aria-label="Admin sections" className="mt-8 flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls={`panel-${t.id}`}
              onClick={() => setTab(t.id)}
              className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                tab === t.id ? 'bg-navy-900 text-white' : 'bg-white text-navy-700 ring-1 ring-inset ring-navy-200 hover:bg-navy-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="mt-6">
          {!people.data ? (
            people.error ? (
              <Alert tone="error">{people.error}</Alert>
            ) : (
              <p className="py-10 text-center text-navy-600" role="status">
                Loading…
              </p>
            )
          ) : (
            <>
          {tab === 'bookings' && <BookingsTab people={list} />}
          {tab === 'messages' && <MessagesTab />}
          {tab === 'timesheets' && <TimesheetsTab people={list} />}
          {tab === 'users' && <UsersTab people={list} error={people.error} loading={people.loading} reload={people.reload} />}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
