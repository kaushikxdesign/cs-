import React from 'react';
import { Check, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { cn } from '@/lib/cn';
import { BrandMark, CountBadge, DropdownMenu, Tooltip } from '@/design-system';
import { USERS } from '@/data/core';
import { ADMIN_MODULE, MODULES, ROLES, type NavModule } from './nav';

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
 * Whose dashboard am I looking at.
 *
 * This is a presentation control, not a permission one — nothing in the app
 * is gated by it. It was three entries in the Dashboard module's view list,
 * which read as "three dashboards" when it is really one dashboard seen from
 * three seats. In the rail it sits with the other whole-app controls, and the
 * icon shows the current seat without the menu having to be opened.
 */
function RoleSwitcher({
  activeRole,
  onSwitch,
}: {
  activeRole?: string;
  onSwitch: (roleId: string, userId: string, path: string) => void;
}) {
  const current = ROLES.find((r) => r.id === activeRole) ?? ROLES[0];
  const Icon = current.icon;

  return (
    <DropdownMenu
      side="right"
      align="end"
      trigger={
        <button
          aria-label={`Viewing as ${current.label} — change view`}
          className="flex size-10 items-center justify-center rounded-xl text-on-surface-subtle transition-colors duration-[120ms] hover:bg-hover hover:text-on-surface"
        >
          <Icon className="size-5" strokeWidth={1.75} />
        </button>
      }
      items={ROLES.map((r) => ({
        label: (
          <span className="flex min-w-0 flex-col">
            <span className="truncate">{r.viewLabel}</span>
            <span className="truncate text-caption text-on-surface-subtle">
              {USERS[r.userId]?.name ?? r.userId}
            </span>
          </span>
        ),
        icon: <r.icon className="size-4 text-on-surface-subtle" strokeWidth={1.75} />,
        trailing:
          r.id === current.id ? (
            <Check className="size-4 shrink-0 text-accent" strokeWidth={2} />
          ) : undefined,
        onSelect: () => onSwitch(r.id, r.userId, r.path),
      }))}
    />
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
  activeRole,
  counts = {},
  navCollapsed,
  onNavigate,
  onSwitchRole,
  onToggleNav,
}: {
  activeModuleId?: string;
  activeRole?: string;
  counts?: Record<string, number>;
  navCollapsed?: boolean;
  onNavigate: (path: string) => void;
  onSwitchRole: (roleId: string, userId: string, path: string) => void;
  onToggleNav: () => void;
}) {
  return (
    <nav className="flex w-16 shrink-0 flex-col items-center gap-1.5 pb-3 pt-3">
      <button
        onClick={() => onNavigate('/dashboard')}
        aria-label="Sia home"
        className="mb-2 flex size-9 items-center justify-center rounded-xl text-accent transition-colors duration-[120ms] hover:bg-hover"
      >
        <BrandMark className="size-6" />
      </button>

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
        {/* A rule, because what follows is not another module: the view you
            are in, the settings for the whole app, and the nav toggle. */}
        <span className="mb-1 h-px w-6 bg-border-default" aria-hidden />
        <RoleSwitcher activeRole={activeRole} onSwitch={onSwitchRole} />
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
