import React from 'react';
import { Check, Monitor, Moon, Sparkles, Sun } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Avatar, CountBadge, DropdownMenu, Tooltip } from '@/design-system';
import { useTheme } from '@/lib/theme';
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
          'relative flex size-9 items-center justify-center rounded-lg',
          'transition-colors duration-[120ms]',
          active
            ? 'bg-surface text-accent shadow-sm'
            : 'text-on-surface-muted hover:bg-hover hover:text-on-surface',
        )}
      >
        {/* Active gets a rail-edge marker as well as a raised tile, so the
            current module is legible even at a glance from the far side. */}
        {active && (
          <span className="absolute -left-2.5 h-5 w-[3px] rounded-r-full bg-accent" aria-hidden />
        )}
        <Icon className="size-[1.125rem]" strokeWidth={1.75} />
        {count ? (
          <CountBadge tone="danger" className="absolute -right-1 -top-1 ring-2 ring-rail">
            {count}
          </CountBadge>
        ) : null}
      </button>
    </Tooltip>
  );
}

export function NavRail({
  activeModuleId,
  activeRole,
  counts = {},
  onNavigate,
  onSwitchRole,
  onToggleAssistant,
  assistantOpen,
}: {
  activeModuleId?: string;
  activeRole: string;
  counts?: Record<string, number>;
  onNavigate: (path: string) => void;
  onSwitchRole: (roleId: string, userId: string, path: string) => void;
  onToggleAssistant: () => void;
  assistantOpen?: boolean;
}) {
  const { theme, setTheme } = useTheme();
  const userId = ROLES.find((r) => r.id === activeRole)?.userId ?? 'maya';
  const userName = USERS[userId]?.name ?? 'CX42';

  return (
    <nav className="flex w-14 shrink-0 flex-col items-center gap-1.5 border-r border-border-default bg-rail py-3">
      <button
        onClick={() => onNavigate('/dashboard')}
        aria-label="CX42 home"
        className="mb-1.5 flex size-8 items-center justify-center rounded-lg bg-solid text-on-solid"
      >
        <span className="text-caption font-bold tracking-tight">CX</span>
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
        <Tooltip label="CX42 Assistant" side="right">
          <button
            aria-label="CX42 Assistant"
            aria-pressed={assistantOpen}
            onClick={onToggleAssistant}
            className={cn(
              'flex size-9 items-center justify-center rounded-lg transition-colors duration-[120ms]',
              assistantOpen
                ? 'bg-surface text-accent shadow-sm'
                : 'text-on-surface-muted hover:bg-hover hover:text-on-surface',
            )}
          >
            <Sparkles className="size-[1.125rem]" strokeWidth={1.75} />
          </button>
        </Tooltip>

        <Tooltip label={theme === 'dark' ? 'Switch to light' : 'Switch to dark'} side="right">
          <button
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex size-9 items-center justify-center rounded-lg text-on-surface-muted transition-colors duration-[120ms] hover:bg-hover hover:text-on-surface"
          >
            {theme === 'dark' ? (
              <Sun className="size-[1.125rem]" strokeWidth={1.75} />
            ) : (
              <Moon className="size-[1.125rem]" strokeWidth={1.75} />
            )}
          </button>
        </Tooltip>

        <RailLink
          module={ADMIN_MODULE}
          active={ADMIN_MODULE.id === activeModuleId}
          onNavigate={onNavigate}
        />

        {/* Profile settings and the role switcher live here rather than as
            loose buttons under the nav, which is where the MVP put them. */}
        <DropdownMenu
          align="start"
          trigger={
            <button aria-label="Account menu" className="flex size-9 items-center justify-center rounded-lg hover:bg-hover">
              <Avatar name={userName} size="md" online />
            </button>
          }
          items={[
            { label: 'Profile settings', onSelect: () => onNavigate('/profile') },
            ...ROLES.map((r) => ({
              label: `${r.label} — ${USERS[r.userId]?.name ?? r.userId}`,
              icon: (
                <Check
                  className={cn('size-4 text-accent', r.id !== activeRole && 'opacity-0')}
                  strokeWidth={2}
                />
              ),
              onSelect: () => onSwitchRole(r.id, r.userId, r.path),
              separatorBefore: r.id === ROLES[0].id,
            })),
            {
              label: `Appearance — ${theme === 'dark' ? 'Dark' : 'Light'}`,
              icon: <Monitor className="size-4 text-on-surface-subtle" strokeWidth={1.75} />,
              separatorBefore: true,
              onSelect: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
            },
          ]}
        />
      </div>
    </nav>
  );
}
