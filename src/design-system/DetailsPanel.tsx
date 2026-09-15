import React from 'react';
import { ChevronDown, PanelRightClose } from 'lucide-react';
import { cn } from '@/lib/cn';
import { IconButton } from './Button';

/** Right-hand context panel. Collapsible sections, one border, no nesting of cards. */
export function DetailsPanel({
  title,
  onClose,
  children,
  className,
}: {
  title?: React.ReactNode;
  onClose?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <aside
      className={cn(
        'flex w-72 shrink-0 flex-col border-l border-border-default bg-surface 2xl:w-80',
        className,
      )}
    >
      {(title || onClose) && (
        <div className="flex h-12 items-center justify-between gap-2 border-b border-border-default px-4">
          <h2 className="text-title-sm font-semibold text-primary truncate">{title}</h2>
          {onClose && (
            <IconButton label="Close panel" onClick={onClose}>
              <PanelRightClose className="size-4" strokeWidth={1.5} />
            </IconButton>
          )}
        </div>
      )}
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </aside>
  );
}

export function PanelSection({
  title,
  defaultOpen = true,
  children,
  className,
}: {
  title: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <section className={cn('border-b border-border-default last:border-0', className)}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex h-10 w-full items-center justify-between gap-2 px-4 text-left"
      >
        <span className="text-caption font-medium uppercase tracking-wide text-tertiary">{title}</span>
        <ChevronDown
          className={cn('size-4 text-tertiary transition-transform duration-[180ms]', !open && '-rotate-90')}
          strokeWidth={1.5}
        />
      </button>
      {open && <div className="px-4 pb-3">{children}</div>}
    </section>
  );
}
