import { supabase } from '../lib/supabase';
import type { BookingStatus, UserRole } from '../types';

/** Admin-only data access. Row level security in Supabase enforces that only admins can read or change this data. */

export class AdminError extends Error {}

export type MessageStatus = 'new' | 'read' | 'archived';
export type TimeEntryStatus = 'submitted' | 'approved' | 'rejected';

export interface Person {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
  hourlyRate: number | null;
  createdAt: string;
}

export interface AdminBooking {
  id: string;
  customerId: string;
  serviceId: string;
  date: string;
  time: string;
  address: string;
  propertySize: string;
  notes?: string;
  status: BookingStatus;
  assignedEmployeeId: string | null;
  createdAt: string;
}

export interface AdminMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: MessageStatus;
  createdAt: string;
}

export interface AdminTimeEntry {
  id: string;
  employeeId: string;
  bookingId: string | null;
  workDate: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  hours: number;
  hourlyRate: number;
  pay: number;
  notes?: string;
  status: TimeEntryStatus;
  reviewNote?: string;
}

const client = () => {
  if (!supabase) throw new AdminError('The admin area needs the Supabase backend to be configured.');
  return supabase;
};

const friendly = (message: string) => {
  const m = message.toLowerCase();
  if (m.includes('last admin')) return 'You are the only admin, so this account must stay an admin. Make someone else an admin first.';
  if (m.includes('only be assigned to employees')) return 'Bookings can only be assigned to employees. Change their role to Employee first.';
  if (m.includes('hourly_rate')) return 'Please enter a valid hourly rate (0 or more).';
  if (m.includes('jwt') || m.includes('not authenticated')) return 'Your session has expired. Please log in again.';
  if (m.includes('permission') || m.includes('42501') || m.includes('row-level security')) return 'You do not have permission to do that.';
  return 'Something went wrong. Please try again.';
};

const check = <T>(result: { data: T | null; error: { message: string } | null }): T => {
  if (result.error) throw new AdminError(friendly(result.error.message));
  return result.data as T;
};

/** Updates must change exactly one row; RLS silently filters rows the user can't touch. */
const checkUpdated = (result: { data: unknown[] | null; error: { message: string } | null }) => {
  const rows = check(result);
  if (!rows || rows.length === 0) throw new AdminError('You do not have permission to do that.');
};

const time = (t: string) => t.slice(0, 5);
const num = (v: unknown) => (v === null || v === undefined ? 0 : Number(v));

export const adminService = {
  async listPeople(): Promise<Person[]> {
    const rows = check(
      await client().from('profiles').select('id, full_name, email, phone, role, hourly_rate, created_at').order('full_name'),
    ) as Record<string, unknown>[];
    return rows.map((r) => ({
      id: r.id as string,
      fullName: (r.full_name as string) || (r.email as string),
      email: r.email as string,
      phone: (r.phone as string | null) ?? undefined,
      role: r.role as UserRole,
      hourlyRate: r.hourly_rate === null ? null : Number(r.hourly_rate),
      createdAt: r.created_at as string,
    }));
  },

  async updatePerson(id: string, changes: { role?: UserRole; hourlyRate?: number | null }) {
    const patch: Record<string, unknown> = {};
    if (changes.role) patch.role = changes.role;
    if ('hourlyRate' in changes) patch.hourly_rate = changes.hourlyRate;
    checkUpdated(await client().from('profiles').update(patch).eq('id', id).select('id'));
  },

  async listBookings(): Promise<AdminBooking[]> {
    const rows = check(
      await client()
        .from('bookings')
        .select('id, customer_id, service_id, booking_date, time_slot, address, property_size, notes, status, assigned_employee_id, created_at')
        .order('booking_date', { ascending: false })
        .order('time_slot', { ascending: false }),
    ) as Record<string, unknown>[];
    return rows.map((r) => ({
      id: r.id as string,
      customerId: r.customer_id as string,
      serviceId: r.service_id as string,
      date: r.booking_date as string,
      time: time(r.time_slot as string),
      address: r.address as string,
      propertySize: r.property_size as string,
      notes: (r.notes as string | null) ?? undefined,
      status: r.status as BookingStatus,
      assignedEmployeeId: (r.assigned_employee_id as string | null) ?? null,
      createdAt: r.created_at as string,
    }));
  },

  async updateBooking(id: string, changes: { status?: BookingStatus; assignedEmployeeId?: string | null }) {
    const patch: Record<string, unknown> = {};
    if (changes.status) patch.status = changes.status;
    if ('assignedEmployeeId' in changes) patch.assigned_employee_id = changes.assignedEmployeeId;
    checkUpdated(await client().from('bookings').update(patch).eq('id', id).select('id'));
  },

  async listMessages(): Promise<AdminMessage[]> {
    const rows = check(
      await client().from('contact_messages').select('id, name, email, subject, message, status, created_at').order('created_at', { ascending: false }),
    ) as Record<string, unknown>[];
    return rows.map((r) => ({
      id: r.id as string,
      name: r.name as string,
      email: r.email as string,
      subject: r.subject as string,
      message: r.message as string,
      status: r.status as MessageStatus,
      createdAt: r.created_at as string,
    }));
  },

  async setMessageStatus(id: string, status: MessageStatus) {
    checkUpdated(await client().from('contact_messages').update({ status }).eq('id', id).select('id'));
  },

  async listTimeEntries(from: string, to: string): Promise<AdminTimeEntry[]> {
    const rows = check(
      await client()
        .from('time_entries')
        .select('id, employee_id, booking_id, work_date, start_time, end_time, break_minutes, hours, hourly_rate, pay, notes, status, review_note')
        .gte('work_date', from)
        .lte('work_date', to)
        .order('work_date', { ascending: false })
        .order('start_time', { ascending: false }),
    ) as Record<string, unknown>[];
    return rows.map((r) => ({
      id: r.id as string,
      employeeId: r.employee_id as string,
      bookingId: (r.booking_id as string | null) ?? null,
      workDate: r.work_date as string,
      startTime: time(r.start_time as string),
      endTime: time(r.end_time as string),
      breakMinutes: num(r.break_minutes),
      hours: num(r.hours),
      hourlyRate: num(r.hourly_rate),
      pay: num(r.pay),
      notes: (r.notes as string | null) ?? undefined,
      status: r.status as TimeEntryStatus,
      reviewNote: (r.review_note as string | null) ?? undefined,
    }));
  },

  async reviewTimeEntry(id: string, status: TimeEntryStatus, reviewNote?: string) {
    checkUpdated(
      await client().from('time_entries').update({ status, review_note: reviewNote?.trim() || null }).eq('id', id).select('id'),
    );
  },
};
