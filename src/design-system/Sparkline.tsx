import React from 'react';
import { cn } from '@/lib/cn';

/**
 * Monotone cubic interpolation (Fritsch–Carlson).
 *
 * Straight segments between points give a sparkline the hard kinks that
 * make it read as a fever chart. A plain Catmull–Rom spline smooths them
 * but overshoots past the data on a sharp turn, which invents peaks the
 * series never had — in a shape that stands in for a number, that is a lie.
 * This clamps the tangents so the curve never leaves the interval it
 * connects: smooth, and still honest about its extremes.
 */
function smoothPath(pts: ReadonlyArray<readonly [number, number]>) {
  const n = pts.length;
  if (n < 2) return '';

  const dx: number[] = [];
  const slope: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    dx.push(pts[i + 1][0] - pts[i][0]);
    slope.push((pts[i + 1][1] - pts[i][1]) / (pts[i + 1][0] - pts[i][0]));
  }

  // Tangent at each point: the average of its neighbouring slopes, zeroed
  // at a turning point so the curve flattens rather than loops past it.
  const m: number[] = [slope[0]];
  for (let i = 1; i < n - 1; i++) {
    m.push(slope[i - 1] * slope[i] <= 0 ? 0 : (slope[i - 1] + slope[i]) / 2);
  }
  m.push(slope[n - 2]);

  // Clamp to three times the adjacent slope — the Fritsch–Carlson bound
  // that guarantees no overshoot.
  for (let i = 0; i < n - 1; i++) {
    if (slope[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = m[i] / slope[i];
    const bTan = m[i + 1] / slope[i];
    const t = Math.hypot(a, bTan);
    if (t > 3) {
      m[i] = (3 / t) * a * slope[i];
      m[i + 1] = (3 / t) * bTan * slope[i];
    }
  }

  let d = `M${pts[0][0].toFixed(2)},${pts[0][1].toFixed(2)}`;
  for (let i = 0; i < n - 1; i++) {
    const c1x = pts[i][0] + dx[i] / 3;
    const c1y = pts[i][1] + (m[i] * dx[i]) / 3;
    const c2x = pts[i + 1][0] - dx[i] / 3;
    const c2y = pts[i + 1][1] - (m[i + 1] * dx[i]) / 3;
    d += ` C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${pts[i + 1][0].toFixed(2)},${pts[i + 1][1].toFixed(2)}`;
  }
  return d;
}

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
  // useId() emits colons (":r0:"), and a url(#...) reference containing one
  // is an invalid mask reference — which does not degrade to "no mask", it
  // makes the element not render at all. Strip them.
  const id = React.useId().replace(/[^a-zA-Z0-9-]/g, '');
  if (values.length < 2) return null;

  const w = 96;
  const h = 28;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const step = w / (values.length - 1);

  const pts = values.map((v, i) => [i * step, h - 3 - ((v - min) / span) * (h - 6)] as const);
  const line = smoothPath(pts);
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
        <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity={0.22} />
          <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
        </linearGradient>
        {/* The tile bleeds the line to its edges, so without this the curve
            is chopped mid-stroke by the card's corner. Fading the last few
            percent lets it leave the frame instead of being cut off in it. */}
        {/* A mask is read by luminance, so the visible part has to be WHITE.
            Black stops hide everything, whatever their opacity. */}
        <linearGradient id={`${id}-edge`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fff" stopOpacity={0} />
          <stop offset="8%" stopColor="#fff" stopOpacity={1} />
          <stop offset="92%" stopColor="#fff" stopOpacity={1} />
          <stop offset="100%" stopColor="#fff" stopOpacity={0} />
        </linearGradient>
        <mask id={`${id}-mask`}>
          <rect x="0" y="0" width={w} height={h} fill={`url(#${id}-edge)`} />
        </mask>
      </defs>
      <g mask={`url(#${id}-mask)`}>
      <path d={area} fill={`url(#${id}-fill)`} />
      <path
        d={line}
        fill="none"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        // The viewBox is stretched to the tile's width, so an unscaled
        // stroke keeps its weight instead of being squashed with the
        // geometry.
        vectorEffect="non-scaling-stroke"
        className={STROKE}
      />
      </g>
    </svg>
  );
}
