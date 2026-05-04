/**
 * Eushop design tokens.
 *
 * Editorial, premium, "Goop-meets-deli-counter" visual language. Shared between
 * the Next.js web app and the Expo mobile app via Tailwind v4 / NativeWind v4.
 */

export const colors = {
  // Warm neutrals — paper, parchment, espresso, ink. Editorial restraint.
  paper: '#FAF7F2',
  parchment: '#F2ECE1',
  bone: '#E8E0D0',
  fog: '#D6CCBB',
  ash: '#9A9081',
  espresso: '#3B2F22',
  ink: '#1A1612',

  // The hero — saffron-amber inspired by EU traffic-light gold and Provençal sun.
  saffron: {
    50: '#FFF8EC',
    100: '#FFEFD0',
    200: '#FFDC9A',
    300: '#FFC55F',
    400: '#FFAE2E',
    500: '#F2960C',
    600: '#C97700',
    700: '#9C5C03',
    800: '#704208',
    900: '#4A2D08',
  },

  // Supporting palette — deep, mature, EU-passport burgundy and forest.
  burgundy: '#6B1F2A',
  forest: '#274D3A',
  porcelain: '#FFFEFB',
  oxide: '#B0432F',

  // Semantic
  success: '#2F7D5B',
  warning: '#D08214',
  danger: '#B0302C',
  info: '#365D8B',
} as const;

export const typography = {
  fonts: {
    serif: '"Fraunces", "EB Garamond", Georgia, serif',
    sans: '"Inter Variable", "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
  },
  size: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
    '7xl': 72,
    '8xl': 96,
    '9xl': 128,
  },
  leading: {
    tight: 1.1,
    snug: 1.25,
    normal: 1.5,
    relaxed: 1.65,
    loose: 1.85,
  },
  tracking: {
    tighter: '-0.04em',
    tight: '-0.02em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.18em',
  },
} as const;

export const spacing = {
  px: 1,
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
  32: 128,
  40: 160,
  48: 192,
  64: 256,
  80: 320,
} as const;

export const radius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 20,
  '2xl': 28,
  '3xl': 40,
  full: 9999,
} as const;

export const shadow = {
  none: 'none',
  xs: '0 1px 2px rgba(26,22,18,0.04)',
  sm: '0 2px 4px rgba(26,22,18,0.06), 0 1px 2px rgba(26,22,18,0.04)',
  md: '0 6px 16px rgba(26,22,18,0.08), 0 2px 4px rgba(26,22,18,0.04)',
  lg: '0 14px 32px rgba(26,22,18,0.10), 0 4px 8px rgba(26,22,18,0.05)',
  xl: '0 28px 56px rgba(26,22,18,0.14), 0 10px 20px rgba(26,22,18,0.08)',
  inner: 'inset 0 2px 4px rgba(26,22,18,0.06)',
} as const;

export const motion = {
  duration: {
    instant: 90,
    fast: 180,
    normal: 240,
    slow: 420,
    slower: 720,
    editorial: 1200,
  },
  easing: {
    standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
    decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
    editorial: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
} as const;

/**
 * Country accent palettes — sampled from EU national flags but desaturated and
 * paired with a paper neutral. Used on country landing pages and item detail
 * heroes. Keep premium, never gaudy.
 */
export const countryPalette: Record<string, { primary: string; accent: string; ink: string }> = {
  PL: { primary: '#B0302C', accent: '#FAF7F2', ink: '#3B0F0E' },
  DE: { primary: '#1A1612', accent: '#D9A441', ink: '#1A1612' },
  AT: { primary: '#9A2B2B', accent: '#FAF7F2', ink: '#3B0F0E' },
  NL: { primary: '#C45200', accent: '#1F4FA0', ink: '#1A1612' },
  BE: { primary: '#1A1612', accent: '#D9A441', ink: '#1A1612' },
  FR: { primary: '#1F4FA0', accent: '#B0302C', ink: '#0F1530' },
  IT: { primary: '#274D3A', accent: '#B0302C', ink: '#1A1612' },
  ES: { primary: '#B0302C', accent: '#D9A441', ink: '#3B0F0E' },
  PT: { primary: '#274D3A', accent: '#B0302C', ink: '#1A1612' },
  GR: { primary: '#1F4FA0', accent: '#FFFEFB', ink: '#0F1530' },
  CY: { primary: '#9C5C03', accent: '#274D3A', ink: '#3B2F22' },
  MT: { primary: '#B0302C', accent: '#FFFEFB', ink: '#3B0F0E' },
  CZ: { primary: '#1F4FA0', accent: '#B0302C', ink: '#0F1530' },
  SK: { primary: '#1F4FA0', accent: '#B0302C', ink: '#0F1530' },
  HU: { primary: '#274D3A', accent: '#B0302C', ink: '#1A1612' },
  RO: { primary: '#1F4FA0', accent: '#D9A441', ink: '#0F1530' },
  BG: { primary: '#274D3A', accent: '#B0302C', ink: '#1A1612' },
  HR: { primary: '#1F4FA0', accent: '#B0302C', ink: '#0F1530' },
  SI: { primary: '#1F4FA0', accent: '#B0302C', ink: '#0F1530' },
  EE: { primary: '#1F4FA0', accent: '#1A1612', ink: '#0F1530' },
  LV: { primary: '#6B1F2A', accent: '#FAF7F2', ink: '#3B0F0E' },
  LT: { primary: '#D9A441', accent: '#274D3A', ink: '#3B2F22' },
  SE: { primary: '#1F4FA0', accent: '#D9A441', ink: '#0F1530' },
  DK: { primary: '#B0302C', accent: '#FAF7F2', ink: '#3B0F0E' },
  FI: { primary: '#1F4FA0', accent: '#FAF7F2', ink: '#0F1530' },
  IE: { primary: '#274D3A', accent: '#C97700', ink: '#1A1612' },
  LU: { primary: '#B0302C', accent: '#1F4FA0', ink: '#3B0F0E' },
  NO: { primary: '#B0302C', accent: '#1F4FA0', ink: '#3B0F0E' },
  IS: { primary: '#1F4FA0', accent: '#B0302C', ink: '#0F1530' },
};

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type Tokens = {
  colors: typeof colors;
  typography: typeof typography;
  spacing: typeof spacing;
  radius: typeof radius;
  shadow: typeof shadow;
  motion: typeof motion;
  countryPalette: typeof countryPalette;
  breakpoints: typeof breakpoints;
};

export const tokens: Tokens = {
  colors,
  typography,
  spacing,
  radius,
  shadow,
  motion,
  countryPalette,
  breakpoints,
};

export default tokens;
