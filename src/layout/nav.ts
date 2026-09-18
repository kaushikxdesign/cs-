import type { LucideIcon } from 'lucide-react';
import {
  Building2, FolderOpen, Gauge, Inbox, LayoutDashboard, ListTodo, Settings,
  ShieldAlert, TrendingUp, User, Users, Zap,
} from 'lucide-react';

/**
 * The single source of truth for navigation.
 *
 * The MVP had three divergent ones: a sidebar NAV of 8 items, a second NAV
 * inside Spotlight with 9 (it added Profile settings), and two buttons pinned
 * below the nav. They drifted apart because nothing forced them to agree.
 * The rail, the secondary nav and ⌘K all read this file.
 */

export interface NavView {
  /** Hash path, including any query the saved view implies. */
  path: string;
  label: string;
  /** Matched against location.pathname+query to decide the active view. */
  match?: (path: string, query: Record<string, string>) => boolean;
}

export interface NavModule {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  /** Secondary-nav entries: per-module views and saved filters. */
  views?: NavView[];
  /** Routes that belong to this module but are not themselves nav entries. */
  owns?: string[];
}

export const MODULES: NavModule[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
    /* The three role dashboards used to be secondary-nav views here. They are
       not views of a module — they are the same module seen as somebody else —
       so they moved to the role switcher in the rail, and the module keeps the
       one view it actually has. */
    views: [{ path: '/dashboard', label: 'My dashboard' }],
    owns: ['/manager', '/executive'],
  },
  {
    id: 'work',
    label: 'My Work',
    icon: ListTodo,
    path: '/work',
    views: [{ path: '/work', label: 'All work' }],
    owns: ['/goals'],
  },
  {
    id: 'inbox',
    label: 'Inbox',
    icon: Inbox,
    path: '/tickets',
    views: [
      { path: '/tickets', label: 'All tickets' },
      { path: '/tickets?filter=mine', label: 'Assigned to me' },
      { path: '/tickets?filter=sla_risk', label: 'SLA at risk' },
      { path: '/tickets?filter=sla_breached', label: 'SLA breached' },
      { path: '/tickets?filter=ageing', label: 'Ageing > 5 days' },
    ],
  },
  {
    id: 'customers',
    label: 'Customers',
    icon: Building2,
    path: '/customers',
    views: [
      { path: '/customers', label: 'All accounts' },
      { path: '/customers?owner=maya', label: 'My portfolio' },
      { path: '/health', label: 'Health board' },
      { path: '/renewals', label: 'Renewals' },
    ],
    owns: ['/customers/'],
  },
  {
    id: 'risks',
    label: 'Risks',
    icon: ShieldAlert,
    path: '/risks',
    views: [{ path: '/risks', label: 'All risks' }, { path: '/risks?owner=maya', label: 'My risks' }],
  },
  {
    id: 'expansion',
    label: 'Expansion',
    icon: TrendingUp,
    path: '/expansion',
    views: [
      { path: '/expansion', label: 'All opportunities' },
      { path: '/expansion?owner=maya', label: 'My opportunities' },
    ],
  },
  {
    id: 'actions',
    label: 'Actions',
    icon: Zap,
    path: '/actions',
    views: [{ path: '/actions', label: 'Action library' }],
  },
  {
    id: 'drive',
    label: 'Sia Drive',
    icon: FolderOpen,
    path: '/drive',
    views: [
      { path: '/drive', label: 'All files' },
      { path: '/qbrs', label: 'QBR templates' },
    ],
  },
];

/** Pinned to the bottom of the rail, above the avatar menu. */
export const ADMIN_MODULE: NavModule = {
  id: 'admin',
  label: 'Settings',
  icon: Settings,
  path: '/admin',
  views: [
    { path: '/admin', label: 'Overview' },
    { path: '/admin?section=fields', label: 'Field manager' },
    { path: '/admin?section=reqfields', label: 'Required fields' },
    { path: '/admin?section=users', label: 'Users' },
    { path: '/admin?section=roles', label: 'Roles' },
    { path: '/admin?section=assignment', label: 'Assignment' },
    { path: '/admin?section=sla', label: 'SLA' },
    { path: '/admin?section=signals', label: 'Signals' },
    { path: '/admin?section=notify', label: 'Notifications' },
    { path: '/admin?section=emailcfg', label: 'Email configuration' },
    { path: '/admin?section=automation', label: 'Automation' },
    { path: '/admin?section=actionsview', label: 'Actions overview' },
    { path: '/admin?section=drive', label: 'Drive' },
    { path: '/admin/connectors', label: 'Connectors' },
  ],
};

export const ALL_MODULES = [...MODULES, ADMIN_MODULE];

/** Roles the switcher offers, and where each one lands. */
export const ROLES = [
  { id: 'csm', userId: 'maya', label: 'CSM', viewLabel: 'My dashboard', icon: User, path: '/dashboard' },
  { id: 'manager', userId: 'daniel', label: 'Manager', viewLabel: 'Manager view', icon: Users, path: '/manager' },
  { id: 'executive', userId: 'priya', label: 'Executive', viewLabel: 'Executive view', icon: Gauge, path: '/executive' },
] as const;

export type Role = (typeof ROLES)[number];

export function roleForPath(path: string): Role | undefined {
  return ROLES.find((r) => r.path === path);
}

export function moduleForPath(path: string): NavModule | undefined {
  return ALL_MODULES.find(
    (m) =>
      path === m.path ||
      m.views?.some((v) => v.path.split('?')[0] === path) ||
      m.owns?.some((prefix) => path.startsWith(prefix)),
  );
}

export function pageTitle(path: string): string {
  const exact = ALL_MODULES.flatMap((m) => m.views ?? []).find((v) => v.path === path);
  if (exact) return exact.label;
  return moduleForPath(path)?.label ?? 'Sia';
}
