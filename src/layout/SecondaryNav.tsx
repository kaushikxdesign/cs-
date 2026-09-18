import React from 'react';
import { cn } from '@/lib/cn';
import type { NavModule } from './nav';

/**
 * Per-module views and saved filters.
 *
 * The header row is gone: it repeated the module name that the top bar now
 * prints two hundred pixels to its left, and carried a search button that
 * the top bar's field replaces. What is left is the list, which is all this
 * pane was ever for.
 */
export function SecondaryNav({
  module,
  currentPath,
  currentQuery,
  counts = {},
  onNavigate,
}: {
  module?: NavModule;
  currentPath: string;
  currentQuery: Record<string, string>;
  counts?: Record<string, number>;
  onNavigate: (path: string) => void;
}) {
  if (!module?.views?.length) return null;

  function matchesQuery(qs?: string) {
    if (!qs) return false;
    return qs.split('&').every((pair) => {
      const [k, v] = pair.split('=');
      return currentQuery[k] === v;
    });
  }

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

  return (
    <div className="flex w-56 shrink-0 flex-col border-r border-border-default">
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
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
                    'flex h-8 w-full items-center gap-2 rounded-lg px-2.5 text-left text-body-sm',
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
    </div>
  );
}
