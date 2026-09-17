import React from 'react';
import { Command, PanelLeftClose, Plus, Search } from 'lucide-react';
import { cn } from '@/lib/cn';
import { IconButton, Kbd, Tooltip } from '@/design-system';
import type { NavModule } from './nav';

/**
 * Per-module views and saved filters. The pane is titled with the module
 * name at full weight — the reference anchors each pane with a real title
 * rather than a small uppercase label floating above a list.
 */
export function SecondaryNav({
  module,
  currentPath,
  currentQuery,
  counts = {},
  onNavigate,
  onOpenSearch,
  onCollapse,
}: {
  module?: NavModule;
  currentPath: string;
  currentQuery: Record<string, string>;
  counts?: Record<string, number>;
  onNavigate: (path: string) => void;
  onOpenSearch: () => void;
  onCollapse?: () => void;
}) {
  if (!module?.views?.length) return null;

  function isActive(viewPath: string) {
    const [path, qs] = viewPath.split('?');
    if (path !== currentPath) return false;
    if (!qs) {
      // The unqualified view is active only when no sibling query matches.
      return !module!.views!.some(
        (v) => v.path.startsWith(path + '?') && matchesQuery(v.path.split('?')[1]),
      );
    }
    return matchesQuery(qs);
  }

  function matchesQuery(qs?: string) {
    if (!qs) return false;
    return qs.split('&').every((pair) => {
      const [k, v] = pair.split('=');
      return currentQuery[k] === v;
    });
  }

  return (
    <div className="flex w-60 shrink-0 flex-col border-r border-border-default bg-sidebar">
      <div className="flex h-14 items-center gap-1 px-3">
        <h2 className="min-w-0 flex-1 truncate text-title-sm font-semibold text-on-surface">
          {module.label}
        </h2>
        <Tooltip label="Search" side="bottom">
          <IconButton label="Search" size="sm" onClick={onOpenSearch}>
            <Search className="size-4" strokeWidth={1.75} />
          </IconButton>
        </Tooltip>
        {onCollapse && (
          <Tooltip label="Collapse sidebar" side="bottom">
            <IconButton label="Collapse sidebar" size="sm" onClick={onCollapse}>
              <PanelLeftClose className="size-4" strokeWidth={1.75} />
            </IconButton>
          </Tooltip>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        <ul className="space-y-0.5">
          {module.views.map((v) => {
            const active = isActive(v.path);
            const count = counts[v.path];
            return (
              <li key={v.path}>
                <button
                  onClick={() => onNavigate(v.path)}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex h-8 w-full items-center gap-2 rounded-lg px-2 text-left text-body-sm',
                    'transition-colors duration-[120ms]',
                    active
                      ? 'bg-surface font-medium text-on-surface shadow-sm'
                      : 'text-on-surface-muted hover:bg-hover hover:text-on-surface',
                  )}
                >
                  <span className="min-w-0 flex-1 truncate">{v.label}</span>
                  {count !== undefined && (
                    <span className="shrink-0 text-caption tabular-nums text-on-surface-subtle">
                      {count}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="border-t border-border-default p-2">
        <button
          onClick={onOpenSearch}
          className={cn(
            'flex h-8 w-full items-center gap-2 rounded-lg px-2',
            'text-caption text-on-surface-subtle transition-colors duration-[120ms] hover:bg-hover',
          )}
        >
          <Plus className="size-3.5" strokeWidth={1.75} />
          Jump to…
          <Kbd className="ml-auto gap-0.5 px-1">
            <Command className="size-3" strokeWidth={2} />K
          </Kbd>
        </button>
      </div>
    </div>
  );
}
