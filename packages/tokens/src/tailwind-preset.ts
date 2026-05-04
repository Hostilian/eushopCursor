import { colors, motion, radius, shadow, spacing, typography } from './index';

const fontSize = Object.fromEntries(Object.entries(typography.size).map(([k, v]) => [k, `${v}px`]));

const spacingPx = Object.fromEntries(
  Object.entries(spacing).map(([k, v]) => [k, typeof v === 'number' ? `${v}px` : v]),
);

const radiusPx = Object.fromEntries(
  Object.entries(radius).map(([k, v]) => [k, typeof v === 'number' ? `${v}px` : v]),
);

const transitionDuration = Object.fromEntries(
  Object.entries(motion.duration).map(([k, v]) => [k, `${v}ms`]),
);

/**
 * Shared Tailwind preset consumed by both apps/web (Tailwind v4) and apps/mobile
 * (NativeWind v4). Keep this file framework-neutral.
 */
const preset = {
  theme: {
    extend: {
      colors: {
        paper: colors.paper,
        parchment: colors.parchment,
        bone: colors.bone,
        fog: colors.fog,
        ash: colors.ash,
        espresso: colors.espresso,
        ink: colors.ink,
        porcelain: colors.porcelain,
        burgundy: colors.burgundy,
        forest: colors.forest,
        oxide: colors.oxide,
        saffron: colors.saffron,
        success: colors.success,
        warning: colors.warning,
        danger: colors.danger,
        info: colors.info,
      },
      fontFamily: {
        serif: typography.fonts.serif.split(',').map((s) => s.trim().replace(/"/g, '')),
        sans: typography.fonts.sans.split(',').map((s) => s.trim().replace(/"/g, '')),
        mono: typography.fonts.mono.split(',').map((s) => s.trim().replace(/"/g, '')),
      },
      fontSize,
      spacing: spacingPx,
      borderRadius: radiusPx,
      boxShadow: {
        xs: shadow.xs,
        sm: shadow.sm,
        md: shadow.md,
        lg: shadow.lg,
        xl: shadow.xl,
        inner: shadow.inner,
      },
      transitionDuration,
      transitionTimingFunction: {
        editorial: motion.easing.editorial,
        standard: motion.easing.standard,
      },
      letterSpacing: {
        tighter: typography.tracking.tighter,
        tight: typography.tracking.tight,
        normal: typography.tracking.normal,
        wide: typography.tracking.wide,
        wider: typography.tracking.wider,
        widest: typography.tracking.widest,
      },
    },
  },
} as const;

export default preset;
