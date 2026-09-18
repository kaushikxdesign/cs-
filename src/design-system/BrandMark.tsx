import React from 'react';
import { cn } from '@/lib/cn';

/**
 * The CX42 mark.
 *
 * An open ring reaching a solid point: the arc is the account's trajectory,
 * the dot is the outcome it is heading for. Drawn as filled paths rather
 * than strokes so it holds its weight at 20px in the rail, where a hairline
 * icon would thin out — and custom rather than borrowed, because a product's
 * own mark should not be a search result from an icon set.
 *
 * The gap sits on the right on purpose: it reads as forward motion, and it
 * gives the dot somewhere to be that is not on top of the ring.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={cn('size-5', className)}>
      {/* The C: a 270° annulus, open to the right. */}
      <path
        d="M18.36 5.64 A9 9 0 1 0 18.36 18.36 L16.07 16.07 A5.75 5.75 0 1 1 16.07 7.93 Z"
        fill="currentColor"
      />
      {/* The point it is reaching. */}
      <circle cx="19.1" cy="12" r="2.6" fill="currentColor" />
    </svg>
  );
}
