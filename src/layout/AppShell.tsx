import React from 'react';
import { useApp } from '@/state/AppContext';
import { useLocation, useNavigate } from '@/router';
import { CommandPalette, ToastViewport, TooltipProvider, useCommandPalette, type CommandItem } from '@/design-system';
import { TICKETS } from '@/data/core';
import { ALL_MODULES, moduleForPath } from './nav';
import { NavRail } from './NavRail';
import { SecondaryNav } from './SecondaryNav';

/**
 * Intercom-style shell: icon rail, per-module secondary nav, then the page.
 * The assistant is layout-coupled — it takes space from the content column
 * rather than floating over it — so it lives here, not in a screen.
 */
export function AppShell({
  children,
  assistant,
}: {
  children: React.ReactNode;
  assistant?: React.ReactNode;
}) {
  const { state, dispatch } = useApp();
  const { pathname, query } = useLocation();
  const navigate = useNavigate();
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [navCollapsed, setNavCollapsed] = React.useState(false);

  useCommandPalette(React.useCallback(() => setPaletteOpen(true), []));

  const activeModule = moduleForPath(pathname);

  // Counts shown in the rail and the secondary nav. Real numbers make the
  // nav a status surface rather than a list of links.
  const openTickets = TICKETS.filter((t: any) => t.status !== 'resolved').length;
  const railCounts = { inbox: openTickets };
  const viewCounts: Record<string, number> = {
    '/tickets': openTickets,
    '/customers': (state.customers ?? []).length,
    '/risks': Object.values(state.risks ?? {}).filter((r: any) => r.status !== 'resolved').length,
    '/expansion': Object.keys(state.expansionOpps ?? {}).length,
  };

  // ⌘K, the rail and the secondary nav all read the same nav definition.
  const commands: CommandItem[] = React.useMemo(
    () =>
      ALL_MODULES.flatMap((m) => {
        const Icon = m.icon;
        const icon = <Icon className="size-4 text-on-surface-subtle" strokeWidth={1.5} />;
        const own: CommandItem = {
          id: m.id,
          label: m.label,
          group: 'Navigate',
          icon,
          onSelect: () => navigate(m.path),
        };
        const views = (m.views ?? [])
          .filter((v) => v.path !== m.path)
          .map((v) => ({
            id: `${m.id}:${v.path}`,
            label: `${m.label} — ${v.label}`,
            group: 'Views',
            icon,
            onSelect: () => navigate(v.path),
          }));
        return [own, ...views];
      }),
    [navigate],
  );

  return (
    <TooltipProvider>
    <div className="flex h-screen overflow-hidden bg-canvas">
      <NavRail
        activeModuleId={activeModule?.id}
        activeRole={state.activeRole}
        counts={railCounts}
        onNavigate={navigate}
        onSwitchRole={(roleId, userId, path) => {
          dispatch({ type: 'SWITCH_ROLE', role: roleId, userId });
          navigate(path);
        }}
      />

      {!navCollapsed && (
        <SecondaryNav
          module={activeModule}
          currentPath={pathname}
          currentQuery={query}
          counts={viewCounts}
          onNavigate={navigate}
          onOpenSearch={() => setPaletteOpen(true)}
          onCollapse={() => setNavCollapsed(true)}
        />
      )}

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">{children}</main>

      {state.assistantOpen && assistant}

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} items={commands} />
      <ToastViewport
        toasts={(state.toasts ?? []).map((t: any) => ({
          id: t.id,
          message: t.msg,
          tone: t.type === 'success' ? 'success' : t.type === 'danger' ? 'danger' : 'info',
        }))}
        onDismiss={(id) => dispatch({ type: 'DISMISS_TOAST', id })}
      />
    </div>
    </TooltipProvider>
  );
}
