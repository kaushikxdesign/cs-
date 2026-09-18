import React from 'react';
import { cn } from '@/lib/cn';

/**
 * A stat tile with a number and no shape beside it is a table cell in a
 * box. A sparkline costs 28px of height and turns the same number into a
 * direction — which is the whole reason anyone reads a metric strip.
 *
 * Deliberately axis-less and label-less: this is texture behind a figure,
 * not a chart. Anything worth interrogating belongs in a real one.
 */
export function Sparkline({
  values,
  tone = 'accent',
  className,
}: {
  values: number[];
  tone?: 'accent' | 'good' | 'watch' | 'risk';
  className?: string;
}) {
  const id = React.useId();
  if (values.length < 2) return null;

  const w = 96;
  const h = 28;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const step = w / (values.length - 1);

  const pts = values.map((v, i) => [i * step, h - 2 - ((v - min) / span) * (h - 4)] as const);
  const line = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} L${w},${h} L0,${h} Z`;

  const STROKE = {
    accent: 'stroke-accent',
    good: 'stroke-band-good',
    watch: 'stroke-band-watch',
    risk: 'stroke-band-risk',
  }[tone];
  const FILL = {
    accent: 'text-accent',
    good: 'text-band-good',
    watch: 'text-band-watch',
    risk: 'text-band-risk',
  }[tone];

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      aria-hidden
      className={cn('h-7 w-full', FILL, className)}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity={0.22} />
          <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" strokeWidth={1.75} strokeLinecap="round" className={STROKE} />
    </svg>
  );
}
