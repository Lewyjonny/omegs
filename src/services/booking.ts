import type { Booking, BookingInput } from '../types';

/**
 * Demo booking store kept in this browser's localStorage. Replace `bookingService`
 * with an API/Supabase implementation to persist bookings for real.
 */
export interface BookingService {
  isDemo: boolean;
  create(userId: string, input: BookingInput): Promise<Booking>;
  list(userId: string): Promise<Booking[]>;
  cancel(userId: string, bookingId: string): Promise<void>;
}

const key = (userId: string) => `omegs.demo.bookings.${userId}`;
const read = (userId: string): Booking[] => JSON.parse(localStorage.getItem(key(userId)) ?? '[]');
const write = (userId: string, bookings: Booking[]) => localStorage.setItem(key(userId), JSON.stringify(bookings));

export const bookingService: BookingService = {
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
      read(userId).filter((b) => b.id !== bookingId),
    );
  },
};
