import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFee(value: number | string, currency = 'EUR') {
  const n = typeof value === 'string' ? Number.parseFloat(value) : value;
  if (Number.isNaN(n)) return '';
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
}

export function formatDistance(km: number) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

export function timeAgo(input: Date | string) {
  const date = typeof input === 'string' ? new Date(input) : input;
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const intervals: [number, string][] = [
    [60, 'just now'],
    [3600, 'min'],
    [86400, 'h'],
    [604800, 'd'],
  ];
  if (seconds < 60) return intervals[0][1];
  if (seconds < 3600) return `${Math.floor(seconds / 60)} ${intervals[1][1]}`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} ${intervals[2][1]}`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} ${intervals[3][1]}`;
  return date.toLocaleDateString();
}
