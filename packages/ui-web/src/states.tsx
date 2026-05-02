import * as React from 'react';
import { cn } from './cn';

type ToneClass = string;

interface BaseStateProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  /** Used as the section's accessible role. Defaults to "status". */
  role?: 'status' | 'alert' | 'note';
}

const baseShell =
  'flex flex-col items-center gap-6 rounded-3xl border px-6 py-16 text-center md:py-20';

function State({
  title,
  description,
  icon,
  actions,
  className,
  role = 'status',
  tone,
}: BaseStateProps & { tone: ToneClass }) {
  return (
    <div className={cn(baseShell, tone, className)} role={role} aria-live="polite">
      {icon ? <div className="text-3xl">{icon}</div> : null}
      <div className="max-w-xl">
        <h2 className="text-ink font-serif text-3xl">{title}</h2>
        {description ? <div className="text-ink/70 mt-3 text-base">{description}</div> : null}
      </div>
      {actions ? <div className="flex flex-wrap justify-center gap-3">{actions}</div> : null}
    </div>
  );
}

/** Use when there is nothing to show but the request itself succeeded. */
export function EmptyState(props: BaseStateProps) {
  return <State {...props} tone="border-ink/10 bg-porcelain" />;
}

/** Use when a request failed (network, 5xx, schema error, etc.). */
export function ErrorState(props: BaseStateProps) {
  return <State {...props} role={props.role ?? 'alert'} tone="border-danger/30 bg-danger/5" />;
}

/** Skeleton-style loading block. Mounts cheaply on the server, no client JS needed. */
export function LoadingState({
  label = 'Loading…',
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'border-ink/10 bg-porcelain rounded-3xl border px-6 py-16 text-center md:py-20',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <p className="text-ash text-sm">{label}</p>
    </div>
  );
}
