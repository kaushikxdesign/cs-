import React from 'react';
import { cn } from '@/lib/cn';

const SIZES = {
  xs: 'size-5 text-[0.625rem]',
  sm: 'size-6 text-caption',
  md: 'size-7 text-caption',
  lg: 'size-8 text-caption',
  xl: 'size-10 text-body-sm',
};

/**
 * Eight avatar hues, assigned deterministically from the name. Colour on
 * people is what makes a dense conversation list scannable — a column of
 * identical grey circles carries no signal at all, which is exactly what
 * the first pass got wrong.
 */
const HUES = [
  'var(--av-1)', 'var(--av-2)', 'var(--av-3)', 'var(--av-4)',
  'var(--av-5)', 'var(--av-6)', 'var(--av-7)', 'var(--av-8)',
];

function hueFor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return HUES[Math.abs(h) % HUES.length];
}

function initialsOf(name = '') {
  const parts = name.split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export interface AvatarProps {
  name?: string;
  initials?: string;
  size?: keyof typeof SIZES;
  /** Renders a presence dot on the lower-right. */
  online?: boolean;
  /** Neutral treatment, for places where colour would be noise. */
  muted?: boolean;
  className?: string;
}

export function Avatar({ name, initials, size = 'md', online, muted, className }: AvatarProps) {
  const text = initials || initialsOf(name);
  const single = text.length === 1;

  return (
    <span className={cn('relative inline-flex shrink-0', className)}>
      <span
        title={name}
        aria-hidden
        style={muted ? undefined : { backgroundColor: hueFor(name || text) }}
        className={cn(
          'inline-flex items-center justify-center rounded-full font-semibold select-none leading-none',
          muted
            ? 'bg-subtle text-on-surface-muted border border-border-default'
            : 'text-white',
          // A single letter reads better slightly larger in the same circle.
          single && 'tracking-normal',
          SIZES[size],
        )}
      >
        {text}
      </span>
      {online && (
        <span className="absolute -bottom-px -right-px size-2 rounded-full bg-success-solid ring-2 ring-surface" />
      )}
    </span>
  );
}

export function AvatarGroup({
  names,
  max = 3,
  size = 'md',
}: {
  names: string[];
  max?: number;
  size?: keyof typeof SIZES;
}) {
  const shown = names.slice(0, max);
  const rest = names.length - shown.length;
  return (
    <span className="inline-flex items-center">
      {shown.map((n, i) => (
        <Avatar key={i} name={n} size={size} className={cn(i > 0 && '-ml-2 ring-2 ring-surface rounded-full')} />
      ))}
      {rest > 0 && (
        <span className="ml-2 text-caption text-on-surface-subtle tabular-nums">+{rest}</span>
      )}
    </span>
  );
}
