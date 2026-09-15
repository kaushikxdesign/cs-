import React from 'react';
import { cn } from '@/lib/cn';

const SIZES = { sm: 'size-5 text-caption', md: 'size-6 text-caption', lg: 'size-8 text-body-sm' };

export interface AvatarProps {
  name?: string;
  initials?: string;
  size?: keyof typeof SIZES;
  className?: string;
}

function initialsOf(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

export function Avatar({ name, initials, size = 'md', className }: AvatarProps) {
  const text = initials || initialsOf(name);
  return (
    <span
      title={name}
      className={cn(
        'inline-flex items-center justify-center rounded-full shrink-0 font-medium select-none',
        'bg-subtle text-secondary border border-border-default',
        SIZES[size],
        className,
      )}
    >
      {text}
    </span>
  );
}

export function AvatarGroup({ names, max = 3, size = 'md' }: { names: string[]; max?: number; size?: keyof typeof SIZES }) {
  const shown = names.slice(0, max);
  const rest = names.length - shown.length;
  return (
    <span className="inline-flex items-center">
      {shown.map((n, i) => (
        <Avatar key={i} name={n} size={size} className={cn(i > 0 && '-ml-1.5 ring-2 ring-surface')} />
      ))}
      {rest > 0 && (
        <span className="ml-1.5 text-caption text-tertiary tabular-nums">+{rest}</span>
      )}
    </span>
  );
}
