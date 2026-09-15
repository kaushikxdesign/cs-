import React from 'react';
import * as RDialog from '@radix-ui/react-dialog';
import { Search } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface CommandItem {
  id: string;
  label: string;
  group?: string;
  icon?: React.ReactNode;
  hint?: string;
  onSelect: () => void;
}

/** ⌘K palette. Replaces the MVP's Spotlight, and shares one nav source with the rail. */
export function CommandPalette({
  open,
  onOpenChange,
  items,
  placeholder = 'Search or jump to…',
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  items: CommandItem[];
  placeholder?: string;
}) {
  const [q, setQ] = React.useState('');
  const [active, setActive] = React.useState(0);

  const results = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((i) => i.label.toLowerCase().includes(needle));
  }, [items, q]);

  React.useEffect(() => setActive(0), [q]);
  React.useEffect(() => {
    if (!open) setQ('');
  }, [open]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = results[active];
      if (item) {
        item.onSelect();
        onOpenChange(false);
      }
    }
  }

  let lastGroup: string | undefined;

  return (
    <RDialog.Root open={open} onOpenChange={onOpenChange}>
      <RDialog.Portal>
        <RDialog.Overlay className="fixed inset-0 z-40 bg-inverse/20" />
        <RDialog.Content
          aria-label="Command palette"
          className="fixed left-1/2 top-24 z-50 w-full max-w-lg -translate-x-1/2 overflow-hidden rounded-xl border border-border-default bg-surface shadow-lg"
        >
          <RDialog.Title className="sr-only">Command palette</RDialog.Title>
          <div className="flex items-center gap-2 border-b border-border-default px-3">
            <Search className="size-4 shrink-0 text-tertiary" strokeWidth={1.5} />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={placeholder}
              className="h-11 w-full bg-transparent text-body text-primary outline-none placeholder:text-disabled"
            />
          </div>
          <div className="max-h-80 overflow-y-auto p-1">
            {results.length === 0 && (
              <p className="px-3 py-6 text-center text-body-sm text-tertiary">No matches</p>
            )}
            {results.map((item, i) => {
              const showGroup = item.group && item.group !== lastGroup;
              lastGroup = item.group;
              return (
                <React.Fragment key={item.id}>
                  {showGroup && (
                    <p className="px-2 pb-1 pt-3 text-caption font-medium uppercase tracking-wide text-tertiary">
                      {item.group}
                    </p>
                  )}
                  <button
                    onMouseEnter={() => setActive(i)}
                    onClick={() => {
                      item.onSelect();
                      onOpenChange(false);
                    }}
                    className={cn(
                      'flex h-8 w-full items-center gap-2 rounded-md px-2 text-body-sm',
                      i === active ? 'bg-hover text-primary' : 'text-secondary',
                    )}
                  >
                    {item.icon}
                    <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
                    {item.hint && <span className="shrink-0 text-caption text-tertiary">{item.hint}</span>}
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        </RDialog.Content>
      </RDialog.Portal>
    </RDialog.Root>
  );
}

/** Binds ⌘K / Ctrl-K to a setter. */
export function useCommandPalette(onOpen: () => void) {
  React.useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpen();
      }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onOpen]);
}
