import React from 'react';
import { Bell, ChevronRight, Command, Search, Sparkles } from 'lucide-react';
import { cn } from '@/lib/cn';
import {
  Avatar, Badge, Button, CountBadge, DropdownMenu, IconButton, Popover, Tooltip,
} from '@/design-system';
import { useTheme } from '@/lib/theme';
import { Moon, Sun } from 'lucide-react';
import { USERS } from '@/data/core';
import { ROLES } from './nav';
import { buildNotices, type Notice } from './notifications';

const TONE_CLASS = {
  danger: 'bg-danger-subtle text-danger-fg',
  warning: 'bg-warning-subtle text-warning-fg',
  success: 'bg-success-subtle text-success-fg',
} as const;

function NoticeList({ notices, onGo }: { notices: Notice[]; onGo: (p: string) => void }) {
  if (!notices.length) {
    return (
      <p className="px-3 py-6 text-center text-body-sm text-on-surface-subtle">
        Nothing needs you right now.
      </p>
    );
  }
  return (
    <ul className="divide-y divide-border-default">
      {notices.map((n) => {
        const Icon = n.icon;
        return (
          <li key={n.id}>
            <button
              onClick={() => onGo(n.path)}
              className="flex w-full items-start gap-2.5 px-3 py-2.5 text-left transition-colors duration-[120ms] hover:bg-hover"
            >
              <span
                className={cn(
                  'mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md',
                  TONE_CLASS[n.tone],
                )}
              >
                <Icon className="size-3.5" strokeWidth={1.75} />
              </span>
              <span className="min-w-0">
                <span className="block text-body-sm font-medium text-on-surface">{n.title}</span>
                <span className="mt-0.5 block truncate text-caption text-on-surface-subtle">
                  {n.detail}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * The global bar. Everything that is true of the whole app rather than of
 * one screen lives here: where you are, how to search all of it, what needs
 * you, and the assistant.
 *
 * The assistant used to be a button on the rail, beneath nine module icons,
 * which made it read as a tenth module rather than as something that
 * follows you across all of them.
 */
export function TopBar({
  crumbs,
  activeRole,
  notices,
  assistantOpen,
  onNavigate,
  onOpenSearch,
  onToggleAssistant,
  onSwitchRole,
}: {
  crumbs: Array<{ label: string; path?: string }>;
  activeRole: string;
  notices: ReturnType<typeof buildNotices>;
  assistantOpen?: boolean;
  onNavigate: (path: string) => void;
  onOpenSearch: () => void;
  onToggleAssistant: () => void;
  onSwitchRole: (roleId: string, userId: string, path: string) => void;
}) {
  const { theme, setTheme } = useTheme();
  const userId = ROLES.find((r) => r.id === activeRole)?.userId ?? 'maya';
  const userName = USERS[userId]?.name ?? 'CX42';

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 px-3">
      <button
        onClick={() => onNavigate('/dashboard')}
        aria-label="CX42 home"
        className="flex size-8 shrink-0 items-center justify-center rounded-lg text-white shadow-glow"
        style={{ backgroundImage: 'var(--gradient-brand)' }}
      >
        <span className="text-caption font-bold tracking-tight">CX</span>
      </button>

      {/* Where you are. The last crumb is the page; the ones before it are
          links, which is the only reason to print them at all. */}
      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <React.Fragment key={i}>
              {i > 0 && (
                <ChevronRight className="size-3.5 shrink-0 text-on-surface-faint" strokeWidth={1.75} />
              )}
              {last || !c.path ? (
                <span className="truncate text-body font-semibold text-on-surface">{c.label}</span>
              ) : (
                <button
                  onClick={() => onNavigate(c.path!)}
                  className="truncate text-body font-medium text-accent transition-colors duration-[120ms] hover:text-accent-hover"
                >
                  {c.label}
                </button>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      <div className="ml-auto flex shrink-0 items-center gap-1.5">
        {/* Federated search: one field over accounts, tickets, risks, goals
            and every nav destination. It is the palette, given a resting
            shape so people can find it without knowing the shortcut. */}
        <button
          onClick={onOpenSearch}
          className={cn(
            'group flex h-8 w-56 items-center gap-2 rounded-lg border border-border-default bg-canvas px-2.5',
            'text-body-sm text-on-surface-subtle transition-colors duration-[120ms]',
            'hover:border-border-strong hover:bg-surface xl:w-72',
          )}
        >
          <Search className="size-4 shrink-0" strokeWidth={1.75} />
          <span className="flex-1 text-left">Search</span>
          <kbd className="flex shrink-0 items-center gap-0.5 rounded border border-border-default bg-surface px-1 py-px font-sans text-caption text-on-surface-faint">
            <Command className="size-3" strokeWidth={2} />K
          </kbd>
        </button>

        <Popover
          align="end"
          trigger={
            <span className="relative inline-flex">
              <IconButton label="Notifications" size="md">
                <Bell className="size-[1.125rem]" strokeWidth={1.75} />
              </IconButton>
              {notices.length > 0 && (
                <CountBadge
                  tone="danger"
                  className="pointer-events-none absolute -right-0.5 -top-0.5 ring-2 ring-sidebar"
                >
                  {notices.length}
                </CountBadge>
              )}
            </span>
          }
        >
          <div className="w-80">
            <div className="flex items-center justify-between gap-3 px-3 py-2.5">
              <p className="text-body-sm font-semibold text-on-surface">Notifications</p>
              {notices.length > 0 && <Badge tone="neutral">{notices.length}</Badge>}
            </div>
            <div className="border-t border-border-default">
              <NoticeList notices={notices} onGo={onNavigate} />
            </div>
          </div>
        </Popover>

        <Button
          variant={assistantOpen ? 'subtle' : 'secondary'}
          size="sm"
          aria-pressed={assistantOpen}
          className={cn(
            'border-accent-muted',
            assistantOpen && 'shadow-glow',
          )}
          icon={
            <Sparkles
              className="size-4"
              strokeWidth={1.75}
              style={{ color: 'var(--accent)' }}
            />
          }
          onClick={onToggleAssistant}
        >
          <span
            className="bg-clip-text font-semibold text-transparent"
            style={{ backgroundImage: 'var(--gradient-brand)' }}
          >
            Ask CX42
          </span>
        </Button>

        <span className="mx-0.5 h-5 w-px bg-border-default" aria-hidden />

        <Tooltip label={theme === 'dark' ? 'Switch to light' : 'Switch to dark'} side="bottom">
          <IconButton
            label="Toggle theme"
            size="md"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? (
              <Sun className="size-[1.125rem]" strokeWidth={1.75} />
            ) : (
              <Moon className="size-[1.125rem]" strokeWidth={1.75} />
            )}
          </IconButton>
        </Tooltip>

        <DropdownMenu
          align="end"
          trigger={
            <button
              aria-label="Account menu"
              className="flex size-8 items-center justify-center rounded-lg transition-colors duration-[120ms] hover:bg-hover"
            >
              <Avatar name={userName} size="md" online />
            </button>
          }
          items={[
            { label: 'Profile settings', onSelect: () => onNavigate('/profile') },
            ...ROLES.map((r) => ({
              label: `${r.label} — ${USERS[r.userId]?.name ?? r.userId}`,
              onSelect: () => onSwitchRole(r.id, r.userId, r.path),
              separatorBefore: r.id === ROLES[0].id,
            })),
          ]}
        />
      </div>
    </header>
  );
}
