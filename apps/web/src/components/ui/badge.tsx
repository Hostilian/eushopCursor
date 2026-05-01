import * as React from 'react';
import { cn } from '../../lib/utils';

export function Badge({
  children,
  className,
  variant = 'soft',
}: {
  children: React.ReactNode;
  className?: string;
  variant?: 'soft' | 'outline' | 'solid' | 'accent';
}) {
  const variants: Record<string, string> = {
    soft: 'bg-ink/[0.06] text-ink',
    outline: 'border border-ink/15 text-ink',
    solid: 'bg-ink text-paper',
    accent: 'bg-saffron-100 text-saffron-800',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium tracking-wide',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
