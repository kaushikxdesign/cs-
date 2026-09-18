import React from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { cn } from '@/lib/cn';
import { CountBadge, Tooltip } from '@/design-system';
import { ADMIN_MODULE, MODULES, type NavModule } from './nav';

function RailLink({
  module,
  active,
  count,
  onNavigate,
}: {
  module: NavModule;
  active: boolean;
  count?: number;
  onNavigate: (path: string) => void;
}) {
  const Icon = module.icon;
  return (
    <Tooltip label={module.label} side="right">
      <button
        aria-label={module.label}
        aria-current={active ? 'page' : undefined}
        onClick={() => onNavigate(module.path)}
        className={cn(
          'relative flex size-10 items-center justify-center rounded-xl',
          'transition-colors duration-[120ms]',
          active
            ? 'bg-accent-subtle text-accent'
            : 'text-on-surface-subtle hover:bg-hover hover:text-on-surface',
        )}
      >
        <Icon className="size-5" strokeWidth={active ? 2 : 1.75} />
        {count ? (
          <CountBadge tone="danger" className="absolute -right-0.5 -top-0.5 ring-2 ring-sidebar">
            {count}
          </CountBadge>
        ) : null}
      </button>
    </Tooltip>
  );
}

/**
 * Icon-only module rail.
 *
 * The logo, the assistant, the theme switch and the account menu have all
 * moved to the top bar. What is left is one job — which module am I in —
 * which is why the active state can be a filled tile rather than a tile
 * plus an edge marker plus a colour change, and why the icons can breathe.
 */
export function NavRail({
  activeModuleId,
  counts = {},
  navCollapsed,
  onNavigate,
  onToggleNav,
}: {
  activeModuleId?: string;
  counts?: Record<string, number>;
  navCollapsed?: boolean;
  onNavigate: (path: string) => void;
  onToggleNav: () => void;
}) {
  return (
    <nav className="flex w-16 shrink-0 flex-col items-center gap-1.5 py-2.5">
      {MODULES.map((m) => (
        <RailLink
          key={m.id}
          module={m}
          active={m.id === activeModuleId}
          count={counts[m.id]}
          onNavigate={onNavigate}
        />
      ))}

      <div className="mt-auto flex flex-col items-center gap-1.5">
        <RailLink
          module={ADMIN_MODULE}
          active={ADMIN_MODULE.id === activeModuleId}
          onNavigate={onNavigate}
        />
        <Tooltip label={navCollapsed ? 'Show views' : 'Hide views'} side="right">
          <button
            aria-label={navCollapsed ? 'Show views' : 'Hide views'}
            aria-pressed={!navCollapsed}
            onClick={onToggleNav}
            className="flex size-10 items-center justify-center rounded-xl text-on-surface-faint transition-colors duration-[120ms] hover:bg-hover hover:text-on-surface"
          >
            {navCollapsed ? (
              <PanelLeftOpen className="size-5" strokeWidth={1.75} />
            ) : (
              <PanelLeftClose className="size-5" strokeWidth={1.75} />
            )}
          </button>
        </Tooltip>
      </div>
    </nav>
  );
}
