import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type { Booking, BookingInput, BookingStatus } from '../types';

export interface BookingService {
  isDemo: boolean;
  create(userId: string, input: BookingInput): Promise<Booking>;
  list(userId: string): Promise<Booking[]>;
  cancel(userId: string, bookingId: string): Promise<void>;
}

export class BookingError extends Error {}

interface BookingRow {
  id: string;
  service_id: string;
  booking_date: string;
  time_slot: string;
  address: string;
  property_size: string;
  notes: string | null;
  status: BookingStatus;
  cancelled_at: string | null;
  created_at: string;
}

const COLUMNS = 'id, service_id, booking_date, time_slot, address, property_size, notes, status, cancelled_at, created_at';

const fromRow = (row: BookingRow): Booking => ({
  id: row.id,
  serviceId: row.service_id,
  date: row.booking_date,
  time: row.time_slot.slice(0, 5),
  address: row.address,
  propertySize: row.property_size,
  notes: row.notes ?? undefined,
  status: row.status,
  cancelledAt: row.cancelled_at ?? undefined,
  createdAt: row.created_at,
});

const friendlyError = (message: string, fallback: string) => {
  const m = message.toLowerCase();
  if (m.includes('future')) return 'Please choose a date and time in the future.';
  if (m.includes('not available')) return 'This service is not available for booking right now.';
  if (m.includes('already started')) return 'This booking has already started and can no longer be cancelled.';
  if (m.includes('jwt') || m.includes('not authenticated')) return 'Your session has expired. Please log in again.';
  return fallback;
};

const supabaseBookings = (): BookingService => {
  const client = supabase!;
  return {
    isDemo: false,
    async create(_userId, input) {
      const { data, error } = await client
        .from('bookings')
        .insert({
          service_id: input.serviceId,
          booking_date: input.date,
          time_slot: input.time,
          address: input.address,
          property_size: input.propertySize,
          notes: input.notes || null,
        })
        .select(COLUMNS)
        .single();
      if (error || !data) throw new BookingError(friendlyError(error?.message ?? '', 'We could not save your booking request. Please try again.'));
      return fromRow(data as BookingRow);
    },
    async list(userId) {
      const { data, error } = await client
        .from('bookings')
        .select(COLUMNS)
        .eq('customer_id', userId)
        .order('booking_date')
        .order('time_slot');
      if (error) throw new BookingError('We could not load your bookings. Please refresh the page.');
      return (data as BookingRow[]).map(fromRow);
    },
    async cancel(userId, bookingId) {
      const { data, error } = await client
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId)
        .eq('customer_id', userId)
        .select('id');
      if (error) throw new BookingError(friendlyError(error.message, 'We could not cancel this booking. Please try again.'));
      if (!data?.length) throw new BookingError('We could not find this booking. Please refresh the page.');
    },
  };
};

/** Demo booking store kept in this browser's localStorage, used when Supabase isn't configured. */
const demoBookings = (): BookingService => {
  const key = (userId: string) => `omegs.demo.bookings.${userId}`;
  const read = (userId: string): Booking[] => JSON.parse(localStorage.getItem(key(userId)) ?? '[]');
  const write = (userId: string, bookings: Booking[]) => localStorage.setItem(key(userId), JSON.stringify(bookings));
  return {
    isDemo: true,
    async create(userId, input) {
      await new Promise((resolve) => setTimeout(resolve, 900));
      const booking: Booking = { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString(), status: 'requested' };
      write(userId, [booking, ...read(userId)]);
      return booking;
    },
    async list(userId) {
      return read(userId).sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
    },
    async cancel(userId, bookingId) {
      write(
        userId,
        read(userId).map((b) => (b.id === bookingId ? { ...b, status: 'cancelled', cancelledAt: new Date().toISOString() } : b)),
      );
    },
  };
};

export const bookingService: BookingService = isSupabaseConfigured ? supabaseBookings() : demoBookings();
