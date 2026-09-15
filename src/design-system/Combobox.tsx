import React from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Popover } from './Overlay';

export interface ComboboxOption {
  value: string;
  label: string;
}

/** Filterable single-select for long lists, where a plain Select would be unusable. */
export function Combobox({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  className,
}: {
  value?: string;
  onChange: (v: string) => void;
  options: ComboboxOption[];
  placeholder?: string;
  className?: string;
}) {
  const [q, setQ] = React.useState('');
  const selected = options.find((o) => o.value === value);
  const filtered = q
    ? options.filter((o) => o.label.toLowerCase().includes(q.toLowerCase()))
    : options;

  return (
    <Popover
      className="w-56 p-1"
      trigger={
        <button
          className={cn(
            'inline-flex h-8 w-full items-center justify-between gap-2 rounded-md border',
            'border-border-default bg-surface px-2.5 text-body-sm hover:border-border-strong',
            selected ? 'text-on-surface' : 'text-on-surface-faint',
            className,
          )}
        >
          {selected?.label ?? placeholder}
          <ChevronDown className="size-4 shrink-0 text-on-surface-subtle" strokeWidth={1.5} />
        </button>
      }
    >
      <input
        autoFocus
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Filter…"
        className="mb-1 h-8 w-full rounded-md border border-border-default bg-surface px-2 text-body-sm text-on-surface outline-none placeholder:text-on-surface-faint"
      />
      <div className="max-h-56 overflow-y-auto">
        {filtered.length === 0 && (
          <p className="px-2 py-3 text-center text-caption text-on-surface-subtle">No matches</p>
        )}
        {filtered.map((o) => (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-body-sm text-on-surface hover:bg-hover"
          >
            <Check
              className={cn('size-4 shrink-0 text-accent', o.value !== value && 'opacity-0')}
              strokeWidth={1.5}
            />
            <span className="truncate">{o.label}</span>
          </button>
        ))}
      </div>
    </Popover>
  );
}
