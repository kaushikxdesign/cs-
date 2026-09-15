import React from 'react';
import { PanelLeftClose, Search } from 'lucide-react';
import { cn } from '@/lib/cn';
import { IconButton } from '@/design-system';
import type { NavModule } from './nav';

/**
 * Per-module views and saved filters. Gives Admin, Customers and the inbox a
 * place to put their sub-navigation instead of each inventing its own tabs.
 */
export function SecondaryNav({
  module,
  currentPath,
  currentQuery,
  onNavigate,
  onOpenSearch,
  onCollapse,
}: {
  module?: NavModule;
  currentPath: string;
  currentQuery: Record<string, string>;
  onNavigate: (path: string) => void;
  onOpenSearch: () => void;
  onCollapse?: () => void;
}) {
  if (!module?.views?.length) return null;

  function isActive(viewPath: string) {
    const [path, qs] = viewPath.split('?');
    if (path !== currentPath) return false;
    if (!qs) return Object.keys(currentQuery).length === 0 || !module!.views!.some((v) => v.path.startsWith(path + '?'));
    return qs.split('&').every((pair) => {
      const [k, v] = pair.split('=');
      return currentQuery[k] === v;
    });
  }

  return (
    <div className="flex w-60 shrink-0 flex-col border-r border-border-default bg-surface">
      <div className="flex h-12 items-center gap-2 border-b border-border-default px-3">
        <button
          onClick={onOpenSearch}
          className={cn(
            'flex h-7 flex-1 items-center gap-2 rounded-md border border-border-default px-2',
            'text-caption text-tertiary transition-colors duration-[120ms] hover:bg-hover',
          )}
        >
          <Search className="size-3.5" strokeWidth={1.5} />
          Search
          <kbd className="ml-auto rounded-sm bg-subtle px-1 font-sans text-caption text-tertiary">⌘K</kbd>
        </button>
        {onCollapse && (
          <IconButton label="Collapse sidebar" size="sm" onClick={onCollapse}>
            <PanelLeftClose className="size-4" strokeWidth={1.5} />
          </IconButton>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        <p className="px-2 pb-1 pt-1 text-caption font-medium uppercase tracking-wide text-tertiary">
          {module.label}
        </p>
        <ul className="space-y-0.5">
          {module.views.map((v) => {
            const active = isActive(v.path);
            return (
              <li key={v.path}>
                <button
                  onClick={() => onNavigate(v.path)}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex h-8 w-full items-center rounded-md px-2 text-left text-body-sm',
                    'transition-colors duration-[120ms]',
                    active
                      ? 'bg-selected font-medium text-primary'
                      : 'text-secondary hover:bg-hover hover:text-primary',
                  )}
                >
                  {v.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
