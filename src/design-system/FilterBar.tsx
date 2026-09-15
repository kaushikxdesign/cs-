import React from 'react';
import { Plus, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { SearchInput } from './Form';
import { Popover } from './Overlay';
import { Button } from './Button';

export interface FilterChip {
  id: string;
  label: string;
  value: string;
}

export function FilterBar({
  chips = [],
  onRemove,
  onAdd,
  addOptions = [],
  search,
  onSearchChange,
  searchPlaceholder = 'Search…',
  actions,
  className,
}: {
  chips?: FilterChip[];
  onRemove?: (id: string) => void;
  onAdd?: (id: string) => void;
  addOptions?: Array<{ id: string; label: string }>;
  search?: string;
  onSearchChange?: (v: string) => void;
  searchPlaceholder?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {onSearchChange && (
        <div className="w-56">
          <SearchInput
            value={search}
            placeholder={searchPlaceholder}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      )}

      {chips.map((c) => (
        <span
          key={c.id}
          className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border-default bg-surface pl-2 pr-1 text-caption text-on-surface"
        >
          <span className="text-on-surface-subtle">{c.label}</span>
          {c.value}
          {onRemove && (
            <button
              onClick={() => onRemove(c.id)}
              aria-label={`Remove ${c.label} filter`}
              className="rounded-sm p-0.5 text-on-surface-subtle hover:bg-hover hover:text-on-surface"
            >
              <X className="size-3" strokeWidth={1.5} />
            </button>
          )}
        </span>
      ))}

      {onAdd && addOptions.length > 0 && (
        <Popover
          trigger={
            <Button size="sm" variant="ghost" icon={<Plus className="size-4" strokeWidth={1.5} />}>
              Add filter
            </Button>
          }
        >
          <div className="space-y-0.5">
            {addOptions.map((o) => (
              <button
                key={o.id}
                onClick={() => onAdd(o.id)}
                className="flex h-8 w-full items-center rounded-md px-2 text-body-sm text-on-surface hover:bg-hover"
              >
                {o.label}
              </button>
            ))}
          </div>
        </Popover>
      )}

      {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
    </div>
  );
}
