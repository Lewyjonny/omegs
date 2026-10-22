import { supabase } from '../lib/supabase';
import type { BookingStatus } from '../types';
import type { TimeEntryStatus } from './admin';

/** Employee data access. Row level security limits employees to their own hours and assigned jobs. */

export class StaffError extends Error {}

export interface StaffJob {
  id: string;
  serviceId: string;
  date: string;
  time: string;
  address: string;
  propertySize: string;
  notes?: string;
  status: BookingStatus;
  customerName: string;
  customerPhone?: string;
}

export interface StaffEntry {
  id: string;
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

export interface EntryInput {
  bookingId: string | null;
  workDate: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  notes: string;
}

const client = () => {
  if (!supabase) throw new StaffError('The staff area needs the Supabase backend to be configured.');
  return supabase;
};

const friendly = (message: string) => {
  const m = message.toLowerCase();
  if (m.includes('future date')) return 'Hours can’t be logged for a future date.';
  if (m.includes('job assigned to you')) return 'You can only link hours to a job assigned to you.';
  if (m.includes('end_after_start')) return 'The end time must be after the start time.';
  if (m.includes('break_shorter')) return 'The break must be shorter than the shift.';
  if (m.includes('approved hours')) return 'Approved hours can no longer be changed.';
  if (m.includes('jwt') || m.includes('not authenticated')) return 'Your session has expired. Please log in again.';
  if (m.includes('permission') || m.includes('42501') || m.includes('row-level security')) return 'You do not have permission to do that.';
  return 'Something went wrong. Please try again.';
};

const check = <T>(result: { data: T | null; error: { message: string } | null }): T => {
  if (result.error) throw new StaffError(friendly(result.error.message));
  return result.data as T;
};

const checkChanged = (result: { data: unknown[] | null; error: { message: string } | null }) => {
  const rows = check(result);
  if (!rows || rows.length === 0) throw new StaffError('These hours can no longer be changed. Approved hours are locked.');
};

const time = (t: string) => t.slice(0, 5);
const num = (v: unknown) => (v === null || v === undefined ? 0 : Number(v));

const toRow = (input: EntryInput) => ({
  booking_id: input.bookingId,
  work_date: input.workDate,
  start_time: input.startTime,
  end_time: input.endTime,
  break_minutes: input.breakMinutes,
  notes: input.notes.trim() || null,
});

export const staffService = {
  async getHourlyRate(userId: string): Promise<number | null> {
    const row = check(await client().from('profiles').select('hourly_rate').eq('id', userId).maybeSingle()) as { hourly_rate: unknown } | null;
    return row?.hourly_rate === null || row?.hourly_rate === undefined ? null : Number(row.hourly_rate);
  },

  async listJobs(userId: string): Promise<StaffJob[]> {
    const rows = check(
      await client()
        .from('bookings')
        .select('id, customer_id, service_id, booking_date, time_slot, address, property_size, notes, status')
        .eq('assigned_employee_id', userId)
        .order('booking_date')
        .order('time_slot'),
    ) as Record<string, unknown>[];
    const customerIds = [...new Set(rows.map((r) => r.customer_id as string))];
    const customers = customerIds.length
      ? (check(await client().from('profiles').select('id, full_name, phone').in('id', customerIds)) as Record<string, unknown>[])
      : [];
    const byId = new Map(customers.map((c) => [c.id as string, c]));
    return rows.map((r) => {
      const c = byId.get(r.customer_id as string);
      return {
        id: r.id as string,
        serviceId: r.service_id as string,
        date: r.booking_date as string,
        time: time(r.time_slot as string),
        address: r.address as string,
        propertySize: r.property_size as string,
        notes: (r.notes as string | null) ?? undefined,
        status: r.status as BookingStatus,
        customerName: (c?.full_name as string | undefined) || 'Customer',
        customerPhone: (c?.phone as string | null | undefined) ?? undefined,
      };
    });
  },

  async listEntries(userId: string): Promise<StaffEntry[]> {
    const rows = check(
      await client()
        .from('time_entries')
        .select('id, booking_id, work_date, start_time, end_time, break_minutes, hours, hourly_rate, pay, notes, status, review_note')
        .eq('employee_id', userId)
        .order('work_date', { ascending: false })
        .order('start_time', { ascending: false }),
    ) as Record<string, unknown>[];
    return rows.map((r) => ({
      id: r.id as string,
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

  async addEntry(input: EntryInput) {
    checkChanged(await client().from('time_entries').insert(toRow(input)).select('id'));
  },

  async updateEntry(id: string, input: EntryInput) {
    checkChanged(await client().from('time_entries').update(toRow(input)).eq('id', id).select('id'));
  },

  async deleteEntry(id: string) {
    checkChanged(await client().from('time_entries').delete().eq('id', id).select('id'));
  },
};
