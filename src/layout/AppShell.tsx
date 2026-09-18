import React from 'react';
import { useApp } from '@/state/AppContext';
import { useLocation, useNavigate } from '@/router';
import {
  CommandPalette, ToastViewport, TooltipProvider, useCommandPalette, type CommandItem,
} from '@/design-system';
import { TICKETS } from '@/data/core';
import { ALL_MODULES, moduleForPath, roleForPath } from './nav';
import { NavRail } from './NavRail';
import { SecondaryNav } from './SecondaryNav';
import { TopBar } from './TopBar';
import { buildNotices } from './notifications';

/**
 * The shell: a global bar over an icon rail, a per-module view list and the
 * page. The assistant is layout-coupled — it takes space from the content
 * column rather than floating over it — so it lives here, not in a screen.
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

  // Counts shown in the rail and the view list. Real numbers make the nav a
  // status surface rather than a list of links.
  const openTickets = TICKETS.filter((t: any) => t.status !== 'resolved').length;
  const railCounts = { inbox: openTickets };
  const viewCounts: Record<string, number> = {
    '/tickets': openTickets,
    '/customers': (state.customers ?? []).length,
    '/risks': Object.values(state.risks ?? {}).filter((r: any) => r.status !== 'resolved').length,
    '/expansion': Object.keys(state.expansionOpps ?? {}).length,
  };

  const notices = React.useMemo(() => buildNotices(state), [state]);

  /** Module, then the active view within it. Two rungs at most. */
  const crumbs = React.useMemo(() => {
    if (!activeModule) return [{ label: 'Sia' }];
    const view = (activeModule.views ?? []).find((v) => {
      const [path, qs] = v.path.split('?');
      if (path !== pathname) return false;
      if (!qs) return true;
      return qs.split('&').every((pair) => {
        const [k, val] = pair.split('=');
        return query[k] === val;
      });
    });
    const role = roleForPath(pathname);
    if (role && role.path !== activeModule.path) {
      return [{ label: activeModule.label, path: activeModule.path }, { label: role.viewLabel }];
    }
    const isRoot = activeModule.path === pathname && !query.section;
    if (view && !isRoot) {
      return [{ label: activeModule.label, path: activeModule.path }, { label: view.label }];
    }
    return [{ label: activeModule.label, path: isRoot ? undefined : activeModule.path }];
  }, [activeModule, pathname, query]);

  // ⌘K, the rail and the view list all read the same nav definition.
  // Emitted in group order, not interleaved: the palette prints a header
  // whenever the group changes, so mixing modules and their views made the
  // same two headings repeat all the way down the list.
  const commands: CommandItem[] = React.useMemo(() => {
    const iconFor = (m: (typeof ALL_MODULES)[number]) => {
      const Icon = m.icon;
      return <Icon className="size-4 text-on-surface-subtle" strokeWidth={1.75} />;
    };

    const modules: CommandItem[] = ALL_MODULES.map((m) => ({
      id: m.id,
      label: m.label,
      group: 'Go to',
      icon: iconFor(m),
      onSelect: () => navigate(m.path),
    }));

    const views: CommandItem[] = ALL_MODULES.flatMap((m) =>
      (m.views ?? [])
        .filter((v) => v.path !== m.path)
        .map((v) => ({
          id: `${m.id}:${v.path}`,
          label: `${m.label} — ${v.label}`,
          group: 'Saved views',
          icon: iconFor(m),
          onSelect: () => navigate(v.path),
        })),
    );

    return [...modules, ...views];
  }, [navigate]);

  return (
    <TooltipProvider>
      {/* The rail owns the full height on the tinted ground. Everything to
          its right is a column: the bar, then the page. The page is the only
          thing that curves, at its top-left corner, so the one soft edge in
          the whole shell is the seam between the icons and what they open. */}
      <div className="flex h-screen overflow-hidden bg-sidebar">
        <NavRail
          activeModuleId={activeModule?.id}
          activeRole={state.activeRole}
          counts={railCounts}
          navCollapsed={navCollapsed}
          onNavigate={navigate}
          onSwitchRole={(roleId, userId, path) => {
            dispatch({ type: 'SWITCH_ROLE', role: roleId, userId });
            navigate(path);
          }}
          onToggleNav={() => setNavCollapsed((v) => !v)}
        />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar
          crumbs={crumbs}
          activeRole={state.activeRole}
          notices={notices}
          assistantOpen={state.assistantOpen}
          onNavigate={navigate}
          onOpenSearch={() => setPaletteOpen(true)}
          onToggleAssistant={() => dispatch({ type: 'TOGGLE_ASSISTANT' })}
        />

        <div className="flex min-h-0 flex-1 overflow-hidden rounded-tl-2xl border-l border-t border-border-default bg-surface">
          {!navCollapsed && (activeModule?.views?.length ?? 0) > 1 && (
            <SecondaryNav
              module={activeModule}
              currentPath={pathname}
              currentQuery={query}
              counts={viewCounts}
              onNavigate={navigate}
            />
          )}

          <main className="flex min-w-0 flex-1 flex-col overflow-hidden">{children}</main>

          {state.assistantOpen && (
            <aside className="w-96 shrink-0 overflow-hidden border-l border-border-default bg-assistant">
              {assistant}
            </aside>
          )}
        </div>
        </div>

        <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} items={commands} />
        <ToastViewport
          toasts={(state.toasts ?? []).map((t: any) => ({
            id: t.id,
            message: t.msg,
            tone: t.type === 'success' ? 'success' : t.type === 'danger' ? 'danger' : 'info',
            undoLabel: t.undo?.label,
          }))}
          onDismiss={(id) => dispatch({ type: 'DISMISS_TOAST', id })}
          onUndo={(id) => {
            const toast = (state.toasts ?? []).find((t: any) => t.id === id);
            if (toast?.undo?.action) dispatch(toast.undo.action);
            dispatch({ type: 'DISMISS_TOAST', id });
          }}
        />
      </div>
    </TooltipProvider>
  );
}
