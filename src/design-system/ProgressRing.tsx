import React from 'react';
import { cn } from '@/lib/cn';

const TONE_STROKE = {
  accent: 'stroke-accent',
  good: 'stroke-band-good',
  watch: 'stroke-band-watch',
  risk: 'stroke-band-risk',
} as const;

export type RingTone = keyof typeof TONE_STROKE;

export function ringToneForScore(score: number): RingTone {
  return score >= 70 ? 'good' : score >= 45 ? 'watch' : 'risk';
}

/**
 * A radial progress dial.
 *
 * A bar tells you a proportion; a ring tells you a proportion *and* reads as
 * a score you are moving, which is the difference between reporting a number
 * and making someone want to close it. Reserved for the handful of places
 * that represent real attainment — a goal, a health score, a playbook.
 */
export function ProgressRing({
  value,
  max = 100,
  size = 56,
  thickness = 5,
  tone = 'accent',
  label,
  sublabel,
  className,
}: {
  value: number;
  max?: number;
  size?: number;
  thickness?: number;
  tone?: RingTone;
  /** Defaults to the rounded percentage. */
  label?: React.ReactNode;
  sublabel?: React.ReactNode;
  className?: string;
}) {
  const pct = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
  const r = (size - thickness) / 2;
  const circumference = 2 * Math.PI * r;

  return (
    <div className={cn('relative inline-flex shrink-0 items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="meter"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        // The arc starts at twelve o'clock, which is where a dial is read from.
        className="-rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={thickness}
          className="stroke-track"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - pct)}
          className={cn(TONE_STROKE[tone], 'transition-[stroke-dashoffset] duration-500 ease-out')}
        />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="text-body-sm font-semibold tabular-nums text-on-surface">
          {label ?? `${Math.round(pct * 100)}%`}
        </span>
        {sublabel && (
          <span className="mt-0.5 text-caption text-on-surface-subtle">{sublabel}</span>
        )}
      </span>
    </div>
  );
}

/**
 * A run of pips, one per step. Where a ring shows how far along you are, a
 * pip row shows how many discrete things are left — a playbook of four steps
 * is four decisions, not 75%.
 */
export function StepPips({
  total,
  done,
  className,
}: {
  total: number;
  done: number;
  className?: string;
}) {
  return (
    <span className={cn('inline-flex items-center gap-1', className)} aria-label={`${done} of ${total} complete`}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={cn(
            'h-1.5 w-4 rounded-full transition-colors duration-[180ms]',
            i < done ? 'bg-accent' : 'bg-track',
          )}
        />
      ))}
    </span>
  );
}
