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

  it('blocks when already cancelled', () => {
    expect(confirmReservationBlockedReason('cancelled')).toBe('Reservation is already cancelled');
  });

  it('blocks when seller already rejected', () => {
    expect(confirmReservationBlockedReason('seller-rejected')).toBe(
      'Reservation is already seller-rejected',
    );
  });

  it('blocks when already refunded', () => {
    expect(confirmReservationBlockedReason('refunded')).toBe('Reservation is already refunded');
  });
});
