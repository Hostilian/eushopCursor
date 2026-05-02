import { describe, expect, it } from 'vitest';
import { confirmReservationBlockedReason } from './trip-reservation-guards';

describe('confirmReservationBlockedReason', () => {
  it('allows pending', () => {
    expect(confirmReservationBlockedReason('pending')).toBeUndefined();
  });

  it('blocks when already confirmed', () => {
    expect(confirmReservationBlockedReason('confirmed')).toBe('Reservation is already confirmed');
  });

  it('blocks when already completed', () => {
    expect(confirmReservationBlockedReason('completed')).toBe('Reservation is already completed');
  });
});
