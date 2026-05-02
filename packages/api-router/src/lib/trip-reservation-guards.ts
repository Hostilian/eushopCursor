/**
 * Pure guards for seller reservation actions (keeps messaging consistent and testable).
 */
export function confirmReservationBlockedReason(reservationStatus: string): string | undefined {
  if (reservationStatus === 'pending') return undefined;
  return `Reservation is already ${reservationStatus}`;
}
