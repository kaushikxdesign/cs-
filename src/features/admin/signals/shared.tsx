import React from 'react';
import { cn } from '@/lib/cn';

export interface BuilderProps {
  dispatch: (action: any) => void;
}

/**
 * A segmented control rather than underlined tabs. Inside a settings screen
 * that already has a page-level tab row, a second underlined row reads as a
 * competing navigation instead of a filter on the panel below it.
 */
export function BuilderTabs({
  value,
  onChange,
  items,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  items: Array<{ value: string; label: string; count?: number }>;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn('inline-flex items-center gap-0.5 rounded-lg bg-subtle p-0.5', className)}
    >
      {items.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.value)}
            className={cn(
              'flex h-7 items-center gap-1.5 rounded-md px-2.5 text-body-sm transition-colors duration-[120ms]',
              active
                ? 'bg-surface font-medium text-on-surface shadow-sm'
                : 'text-on-surface-muted hover:text-on-surface',
            )}
          >
            {t.label}
            {t.count !== undefined && (
              <span
                className={cn(
                  'tabular-nums',
                  active ? 'text-on-surface-subtle' : 'text-on-surface-faint',
                )}
              >
                {t.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** A two-column builder: the editor on the left, a live preview at rest. */
export function BuilderSplit({
  children,
  aside,
}: {
  children: React.ReactNode;
  aside: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-3">
      <div className="space-y-5 xl:col-span-2">{children}</div>
      <div className="xl:sticky xl:top-0">{aside}</div>
    </div>
  );
}
