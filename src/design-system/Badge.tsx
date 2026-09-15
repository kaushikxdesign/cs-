import React from 'react';
import { cn } from '@/lib/cn';

/**
 * Five tones that mean something, replacing the MVP's seven arbitrary hues.
 * See docs/design-system.md for the mapping.
 */
export type Tone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

const TONES: Record<Tone, string> = {
  neutral: 'bg-subtle text-on-surface-muted',
  accent: 'bg-accent-subtle text-accent-on-subtle',
  success: 'bg-success-subtle text-success-fg',
  warning: 'bg-warning-subtle text-warning-fg',
  danger: 'bg-danger-subtle text-danger-fg',
  info: 'bg-info-subtle text-info-fg',
};

const DOTS: Record<Tone, string> = {
  neutral: 'bg-on-surface-faint',
  accent: 'bg-accent',
  success: 'bg-success-solid',
  warning: 'bg-warning-solid',
  danger: 'bg-danger-solid',
  info: 'bg-info-solid',
};

/**
 * Labels come straight from mock data as raw enum values — `critical`,
 * `mid_market`, `at_risk`. Casing them here means no screen can leak a
 * database value into the interface, which is what shipped last time.
 */
export function humanize(value: React.ReactNode): React.ReactNode {
  if (typeof value !== 'string') return value;
  return value
    .replace(/_/g, ' ')
    .replace(/^\p{Ll}/u, (c) => c.toUpperCase());
}

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  dot?: boolean;
  /** Opt out of automatic Title Case for labels that are already prose. */
  raw?: boolean;
}

export function Badge({ tone = 'neutral', dot, raw, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5',
        'text-caption font-medium whitespace-nowrap',
        TONES[tone],
        className,
      )}
      {...props}
    >
      {dot && <span className={cn('size-1.5 rounded-full shrink-0', DOTS[tone])} />}
      {raw ? children : humanize(children)}
    </span>
  );
}

/** Counts may be solid so they read at a glance — the one exception. */
export function CountBadge({
  tone = 'accent',
  className,
  children,
  ...props
}: { tone?: 'accent' | 'danger' } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1',
        'text-[0.6875rem] font-semibold leading-none tabular-nums',
        tone === 'danger' ? 'bg-danger-solid text-white' : 'bg-accent text-on-accent',
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function StatusDot({ tone = 'neutral', className }: { tone?: Tone; className?: string }) {
  return <span className={cn('inline-block size-2 rounded-full shrink-0', DOTS[tone], className)} />;
}

/** Keyboard hint, as seen in the command palette and composer. */
export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        'inline-flex h-5 min-w-5 items-center justify-center rounded-sm border border-border-default',
        'bg-surface px-1 font-sans text-[0.6875rem] font-medium text-on-surface-subtle',
        className,
      )}
    >
      {children}
    </kbd>
  );
}
