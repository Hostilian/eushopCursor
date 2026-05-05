import { describe, expect, it } from 'vitest';
import {
  PLATFORM_FEE_CAP_CENTS,
  PLATFORM_FEE_RATE,
  calculatePlatformFeeCents,
  reservationMonetaryFieldsFromAgreedEuros,
} from './index';

describe('calculatePlatformFeeCents', () => {
  it('returns 0 for a 0 fee', () => {
    expect(calculatePlatformFeeCents(0)).toBe(0);
  });

  it('applies the proportional rate below the cap', () => {
    // 100c × 12% = 12c
    expect(calculatePlatformFeeCents(100)).toBe(12);
    // 500c × 12% = 60c
    expect(calculatePlatformFeeCents(500)).toBe(60);
    // 1000c × 12% = 120c
    expect(calculatePlatformFeeCents(1000)).toBe(120);
  });

  it('caps at PLATFORM_FEE_CAP_CENTS', () => {
    // 1250c × 12% = 150c (exactly the cap)
    expect(calculatePlatformFeeCents(1250)).toBe(PLATFORM_FEE_CAP_CENTS);
    // 1500c × 12% = 180c → capped to 150c
    expect(calculatePlatformFeeCents(1500)).toBe(PLATFORM_FEE_CAP_CENTS);
    // 100_000c × 12% = 12000c → capped to 150c
    expect(calculatePlatformFeeCents(100_000)).toBe(PLATFORM_FEE_CAP_CENTS);
  });

  it('rounds to the nearest cent (banker-free Math.round)', () => {
    // 4c × 0.12 = 0.48 → 0
    expect(calculatePlatformFeeCents(4)).toBe(0);
    // 5c × 0.12 = 0.60 → 1
    expect(calculatePlatformFeeCents(5)).toBe(1);
    // 9c × 0.12 = 1.08 → 1
    expect(calculatePlatformFeeCents(9)).toBe(1);
    // 13c × 0.12 = 1.56 → 2
    expect(calculatePlatformFeeCents(13)).toBe(2);
  });

  it('uses the documented PLATFORM_FEE_RATE', () => {
    expect(PLATFORM_FEE_RATE).toBeCloseTo(0.12);
  });

  it('keeps the cap at 150 cents (€1.50)', () => {
    expect(PLATFORM_FEE_CAP_CENTS).toBe(150);
  });

  it('never exceeds the finder fee itself for tiny values', () => {
    for (let cents = 0; cents <= 50; cents++) {
      const fee = calculatePlatformFeeCents(cents);
      expect(fee).toBeLessThanOrEqual(cents);
      expect(fee).toBeGreaterThanOrEqual(0);
    }
  });

  it('is monotonically non-decreasing as the finder fee grows', () => {
    let last = -1;
    for (let cents = 0; cents <= 2000; cents += 17) {
      const fee = calculatePlatformFeeCents(cents);
      expect(fee).toBeGreaterThanOrEqual(last);
      last = fee;
    }
  });
});

describe('reservationMonetaryFieldsFromAgreedEuros', () => {
  it('matches cent math used on trip reserve', () => {
    const out = reservationMonetaryFieldsFromAgreedEuros(10);
    expect(out.finderFeeCents).toBe(1000);
    expect(out.platformFeeCents).toBe(calculatePlatformFeeCents(1000));
    expect(out.agreedFinderFee).toBe('10.00');
    expect(out.platformFee).toBe((out.platformFeeCents / 100).toFixed(2));
  });

  it('handles fractional euros with rounding', () => {
    const out = reservationMonetaryFieldsFromAgreedEuros(3.33);
    expect(out.finderFeeCents).toBe(333);
    expect(out.agreedFinderFee).toBe('3.33');
  });

  it('caps platform fee for large agreed fees', () => {
    const out = reservationMonetaryFieldsFromAgreedEuros(99.99);
    expect(out.finderFeeCents).toBe(9999);
    expect(out.platformFeeCents).toBe(PLATFORM_FEE_CAP_CENTS);
    expect(out.platformFee).toBe('1.50');
  });

  it('rounds half-cent finder fees upward before fee math', () => {
    const out = reservationMonetaryFieldsFromAgreedEuros(0.105);
    expect(out.finderFeeCents).toBe(11);
    expect(out.agreedFinderFee).toBe('0.11');
    expect(out.platformFeeCents).toBe(calculatePlatformFeeCents(11));
  });
});
