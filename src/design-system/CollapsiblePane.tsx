import React from 'react';
import { cn } from '@/lib/cn';

/**
 * A docked, in-flow panel — shares the row with its siblings rather than
 * floating over them, so opening or closing it has to grow or shrink the
 * space it takes, not just fade its own content in place.
 *
 * `{open && <aside>…</aside>}` (the Ask Sia panel, the inbox list and
 * details panes) mounts and unmounts on a single frame: the width the
 * column takes appears or disappears instantly, and everything beside it
 * jumps to fill or make room. This animates the width instead, and keeps
 * the panel mounted for the closing transition's duration — there is no
 * Radix Presence to do that bookkeeping here, since this is a normal flow
 * element, not an overlay.
 *
 * The inner content stays a fixed `width` throughout so its own type never
 * reflows mid-animation; only the outer clip and its opacity move.
 */
export function CollapsiblePane({
  open,
  width = '24rem',
  side = 'right',
  className,
  children,
}: {
  open: boolean;
  /** Any CSS width, e.g. '24rem' (w-96) or '20rem'. */
  width?: string;
  /** Which edge the border sits on — the side it is docked against. */
  side?: 'left' | 'right';
  className?: string;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = React.useState(open);
  const [entered, setEntered] = React.useState(open);

  // Mounting has to land BEFORE the browser paints, or there is nothing for
  // the transition to start from. A passive effect (useEffect) runs after
  // paint, so a rAF chained off of it can end up scheduled for a frame the
  // browser has already committed both states into — mount and enter
  // collapse into the one paint this was meant to split apart. useLayoutEffect
  // runs synchronously in the same commit as the click that opened this, so
  // the width:0 render is guaranteed to paint on its own first.
  React.useLayoutEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  // Only once width:0 has actually painted (mounted is true and reflects
  // that guaranteed prior paint) does this — now safely after it — schedule
  // the one rAF that flips to the target width, giving the transition a
  // real starting frame to animate away from.
  React.useEffect(() => {
    if (!open) {
      setEntered(false);
      return;
    }
    if (!mounted) return;
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, [open, mounted]);

  if (!mounted) return null;

  return (
    <aside
      style={{ width: entered ? width : '0px' }}
      onTransitionEnd={(e) => {
        // Ignore the inner content's opacity transition — only the pane's
        // own width finishing means the collapse is actually done.
        if (e.target === e.currentTarget && !open) setMounted(false);
      }}
      className={cn(
        'shrink-0 overflow-hidden transition-[width] duration-200 ease-out',
        side === 'right' ? 'border-l border-border-default' : 'border-r border-border-default',
        className,
      )}
    >
      <div
        style={{ width }}
        className={cn(
          'h-full transition-opacity',
          entered ? 'opacity-100 duration-150 delay-100' : 'opacity-0 duration-100',
        )}
      >
        {children}
      </div>
    </aside>
  );
}
