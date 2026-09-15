import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Avatar, DropdownMenu, Tooltip } from '@/design-system';
import { USERS } from '@/data/core';
import { ADMIN_MODULE, MODULES, ROLES, type NavModule } from './nav';

function RailLink({
  module,
  active,
  onNavigate,
}: {
  module: NavModule;
  active: boolean;
  onNavigate: (path: string) => void;
}) {
  const Icon = module.icon;
  return (
    <Tooltip label={module.label}>
      <button
        aria-label={module.label}
        aria-current={active ? 'page' : undefined}
        onClick={() => onNavigate(module.path)}
        className={cn(
          'flex size-8 items-center justify-center rounded-md transition-colors duration-[120ms]',
          // Active is a quiet selected background, not a saturated filled pill.
          active ? 'bg-selected text-primary' : 'text-secondary hover:bg-hover hover:text-primary',
        )}
      >
        <Icon className="size-4" strokeWidth={1.5} />
      </button>
    </Tooltip>
  );
}

export function NavRail({
  activeModuleId,
  activeRole,
  userName,
  onNavigate,
  onSwitchRole,
}: {
  activeModuleId?: string;
  activeRole: string;
  userName: string;
  onNavigate: (path: string) => void;
  onSwitchRole: (roleId: string, userId: string, path: string) => void;
}) {
  return (
    <nav className="flex w-14 shrink-0 flex-col items-center gap-1 border-r border-border-default bg-surface py-3">
      <button
        onClick={() => onNavigate('/dashboard')}
        aria-label="CX42 home"
        className="mb-2 flex size-8 items-center justify-center rounded-md bg-accent text-on-accent"
      >
        <span className="text-caption font-semibold tracking-tight">CX</span>
      </button>

      {MODULES.map((m) => (
        <RailLink key={m.id} module={m} active={m.id === activeModuleId} onNavigate={onNavigate} />
      ))}

      <div className="mt-auto flex flex-col items-center gap-1">
        <RailLink
          module={ADMIN_MODULE}
          active={ADMIN_MODULE.id === activeModuleId}
          onNavigate={onNavigate}
        />
        {/* Profile settings and the role switcher live here, not crammed
            under the nav as three separate pinned buttons. */}
        <DropdownMenu
          align="start"
          trigger={
            <button
              aria-label="Account menu"
              className="flex size-8 items-center justify-center rounded-md hover:bg-hover"
            >
              <Avatar name={userName} size="md" />
            </button>
          }
          items={[
            { label: 'Profile settings', onSelect: () => onNavigate('/profile') },
            ...ROLES.map((r) => ({
              label: `${r.label} — ${USERS[r.userId]?.name ?? r.userId}`,
              icon: <Check className={cn('size-4', r.id === activeRole ? 'text-accent' : 'opacity-0')} strokeWidth={1.5} />,
              onSelect: () => onSwitchRole(r.id, r.userId, r.path),
              separatorBefore: r.id === ROLES[0].id,
            })),
          ]}
        />
      </div>
    </nav>
  );
}
