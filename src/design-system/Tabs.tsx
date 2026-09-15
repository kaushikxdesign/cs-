import React from 'react';
import { cn } from '@/lib/cn';

export interface TabItem {
  value: string;
  label: React.ReactNode;
  count?: number;
}

/** Underline tabs — the single sub-navigation pattern across the app. */
export function Tabs({
  value,
  onChange,
  items,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  items: TabItem[];
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-4 border-b border-border-default', className)} role="tablist">
      {items.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.value)}
            className={cn(
              'relative -mb-px flex items-center gap-1.5 whitespace-nowrap border-b-2 px-0.5 pb-2 pt-1',
              'text-body-sm transition-colors duration-[120ms]',
              active
                ? 'border-accent font-medium text-primary'
                : 'border-transparent text-secondary hover:text-primary',
            )}
          >
            {t.label}
            {t.count !== undefined && (
              <span className="text-caption text-tertiary tabular-nums">{t.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
