import React from 'react';
import * as RDialog from '@radix-ui/react-dialog';
import { ArrowDown, ArrowUp, CornerDownLeft, Search } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Kbd } from './Badge';

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
        <RDialog.Overlay className="fixed inset-0 z-40 bg-scrim" />
        <RDialog.Content
          aria-label="Command palette"
          className="fixed left-1/2 top-24 z-50 w-full max-w-xl -translate-x-1/2 overflow-hidden rounded-2xl border border-border-default bg-surface shadow-lg"
        >
          <RDialog.Title className="sr-only">Command palette</RDialog.Title>
          <div className="flex items-center gap-2 border-b border-border-default px-3">
            <Search className="size-4 shrink-0 text-on-surface-subtle" strokeWidth={1.5} />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={placeholder}
              className="h-12 w-full bg-transparent text-body-lg text-on-surface outline-none placeholder:text-on-surface-faint"
            />
          </div>
          <div className="max-h-80 overflow-y-auto p-1">
            {results.length === 0 && (
              <p className="px-3 py-6 text-center text-body-sm text-on-surface-subtle">No matches</p>
            )}
            {results.map((item, i) => {
              const showGroup = item.group && item.group !== lastGroup;
              lastGroup = item.group;
              return (
                <React.Fragment key={item.id}>
                  {showGroup && (
                    <p className="px-2 pb-1 pt-3 text-caption font-medium text-on-surface-subtle">
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
                      'flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-body-sm',
                      'transition-colors duration-[120ms]',
                      i === active ? 'bg-hover text-on-surface' : 'text-on-surface-muted',
                    )}
                  >
                    {item.icon}
                    <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
                    {item.hint && <Kbd className="shrink-0">{item.hint}</Kbd>}
                  </button>
                </React.Fragment>
              );
            })}
          </div>

          <div className="flex items-center gap-4 border-t border-border-default px-3 py-2">
            <span className="flex items-center gap-1.5 text-caption text-on-surface-subtle">
              <Kbd><ArrowUp className="size-3" strokeWidth={2} /></Kbd>
              <Kbd><ArrowDown className="size-3" strokeWidth={2} /></Kbd>
              to navigate
            </span>
            <span className="flex items-center gap-1.5 text-caption text-on-surface-subtle">
              <Kbd><CornerDownLeft className="size-3" strokeWidth={2} /></Kbd>
              to select
            </span>
            <span className="flex items-center gap-1.5 text-caption text-on-surface-subtle">
              <Kbd>Esc</Kbd>
              to close
            </span>
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
