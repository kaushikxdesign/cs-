import React from 'react';
import { cn } from '@/lib/cn';

const TONES = {
  good: 'bg-band-good',
  watch: 'bg-band-watch',
  risk: 'bg-band-risk',
  accent: 'bg-accent',
  neutral: 'bg-on-surface-faint',
} as const;

export type MeterTone = keyof typeof TONES;

/** Score thresholds are the same everywhere a 0–100 health number appears. */
export function toneForScore(score: number): MeterTone {
  return score >= 70 ? 'good' : score >= 45 ? 'watch' : 'risk';
}

/**
 * A labelled meter: label, value, track.
 *
 * The track is the point. A bare 1px fill with no visible track reads as an
 * underline under the label — which is exactly how the account panel's
 * health breakdown ended up looking like three spelling errors.
 */
export function Meter({
  label,
  value,
  max = 100,
  display,
  tone,
  className,
}: {
  label?: React.ReactNode;
  value: number;
  max?: number;
  /** Overrides the printed value when it is not a bare number. */
  display?: React.ReactNode;
  tone?: MeterTone;
  className?: string;
}) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  const t = tone ?? toneForScore(max === 100 ? value : pct);

  return (
    <div className={className}>
      {(label || display !== undefined) && (
        <div className="mb-1.5 flex items-baseline justify-between gap-2">
          {label && <span className="truncate text-body-sm text-on-surface-muted">{label}</span>}
          <span className="shrink-0 text-body-sm font-medium tabular-nums text-on-surface">
            {display ?? value}
          </span>
        </div>
      )}
      <div
        role="meter"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={typeof label === 'string' ? label : undefined}
        className="h-1.5 w-full overflow-hidden rounded-full bg-track"
      >
        <div
          className={cn('h-full rounded-full transition-[width] duration-[180ms]', TONES[t])}
          style={{ width: `${Math.max(pct === 0 ? 0 : 3, pct)}%` }}
        />
      </div>
    </div>
  );
}
