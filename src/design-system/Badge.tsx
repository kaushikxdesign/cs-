import React from 'react';
import { cn } from '@/lib/cn';

/**
 * The MVP used seven arbitrary hues as `tone` (slate, blue, amber, purple,
 * red, green, teal) with no consistent meaning — blue alone meant CSM role,
 * "action" source, "AI generated" and acquisition risk. These five tones
 * carry meaning instead; see docs/design-system.md for the mapping.
 */
export type Tone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

const TONES: Record<Tone, string> = {
  neutral: 'bg-subtle text-secondary border-border-default',
  accent: 'bg-accent-subtle text-accent-text border-accent-muted',
  success: 'bg-success-subtle text-success-text border-success-border',
  warning: 'bg-warning-subtle text-warning-text border-warning-border',
  danger: 'bg-danger-subtle text-danger-text border-danger-border',
  info: 'bg-info-subtle text-info-text border-info-border',
};

const DOTS: Record<Tone, string> = {
  neutral: 'bg-tertiary',
  accent: 'bg-accent',
  success: 'bg-success-solid',
  warning: 'bg-warning-solid',
  danger: 'bg-danger-solid',
  info: 'bg-info-solid',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  dot?: boolean;
}

export function Badge({ tone = 'neutral', dot, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm border px-1.5 py-0.5',
        'text-caption font-medium whitespace-nowrap',
        TONES[tone],
        className,
      )}
      {...props}
    >
      {dot && <span className={cn('size-1.5 rounded-full shrink-0', DOTS[tone])} />}
      {children}
    </span>
  );
}

/** Counts are the one badge that may be solid, so they read at a glance. */
export function CountBadge({ children, className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex min-w-4 items-center justify-center rounded-full px-1',
        'bg-accent text-on-accent text-caption font-medium tabular-nums',
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
