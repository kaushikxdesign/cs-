import React from 'react';
import {
  Database, KeyRound, ListChecks, Mail, Radio, Route, ShieldCheck, Timer, Users, Zap,
  type LucideIcon,
} from 'lucide-react';
import { FolderOpen } from 'lucide-react';
import { useApp } from '@/state/AppContext';
import { useLocation, useNavigate } from '@/router';
import { PageHeader } from '@/design-system';
import { NavTile } from './primitives';
import { ActionsOverviewSection } from './sections/ActionsOverviewSection';
import { AssignmentSection } from './sections/AssignmentSection';
import { AutomationSection } from './sections/AutomationSection';
import { DriveSection } from './sections/DriveSection';
import { EmailConfigSection } from './sections/EmailConfigSection';
import { FieldManagerSection } from './sections/FieldManagerSection';
import { NotificationsSection } from './sections/NotificationsSection';
import { RequiredFieldsSection } from './sections/RequiredFieldsSection';
import { RolesSection } from './sections/RolesSection';
import { SignalsSection } from './sections/SignalsSection';
import { SlaSection } from './sections/SlaSection';
import { UsersSection } from './sections/UsersSection';
import type { SectionProps } from './sections/types';

interface Section {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  group: 'Data' | 'People' | 'Service' | 'Signals' | 'Content';
  Component: React.ComponentType<SectionProps>;
}

/**
 * Every admin screen, including the seven the MVP left unreachable: they
 * were wired into the page's if-chain but absent from its six-tile grid, so
 * nothing could open them. The grid is gone; the secondary nav lists them
 * all, and the overview below groups them by what they govern rather than
 * printing twelve identical tiles in one run.
 */
const SECTIONS: Section[] = [
  { id: 'fields', title: 'Field manager', description: 'Define company, contact, task and goal attributes.', icon: Database, group: 'Data', Component: FieldManagerSection },
  { id: 'reqfields', title: 'Required fields', description: 'Fields an agent must capture before replying or resolving.', icon: ListChecks, group: 'Data', Component: RequiredFieldsSection },
  { id: 'users', title: 'User management', description: 'Invite CSMs, assign their role and review session history.', icon: Users, group: 'People', Component: UsersSection },
  { id: 'roles', title: 'Roles', description: 'Default roles and the privileges granted to each.', icon: KeyRound, group: 'People', Component: RolesSection },
  { id: 'assignment', title: 'Assignment', description: 'How tickets and companies are routed to owners.', icon: Route, group: 'Service', Component: AssignmentSection },
  { id: 'sla', title: 'SLA', description: 'Response and resolution targets, calendars and escalations.', icon: Timer, group: 'Service', Component: SlaSection },
  { id: 'signals', title: 'Signals', description: 'Sources that feed health scores — usage, sentiment and surveys.', icon: Radio, group: 'Signals', Component: SignalsSection },
  { id: 'notify', title: 'Notifications', description: 'Which events reach which channel.', icon: ShieldCheck, group: 'Service', Component: NotificationsSection },
  { id: 'emailcfg', title: 'Email configuration', description: 'Mailbox auth, domain routing, threading and DKIM.', icon: Mail, group: 'Service', Component: EmailConfigSection },
  { id: 'automation', title: 'Automation', description: 'Triggers that run without a person starting them.', icon: Zap, group: 'Signals', Component: AutomationSection },
  { id: 'actionsview', title: 'Actions overview', description: 'Every action in the library and who authored it.', icon: Zap, group: 'Signals', Component: ActionsOverviewSection },
  { id: 'drive', title: 'Drive', description: 'Templates available to QBRs, goals and plans.', icon: FolderOpen, group: 'Content', Component: DriveSection },
];

const GROUPS = ['Data', 'People', 'Service', 'Signals', 'Content'] as const;

const GROUP_TONE: Record<string, 'info' | 'accent' | 'warning' | 'success' | 'neutral'> = {
  Data: 'info',
  People: 'accent',
  Service: 'warning',
  Signals: 'success',
  Content: 'neutral',
};

export function AdminPage() {
  const { state, dispatch } = useApp();
  const { query } = useLocation();
  const navigate = useNavigate();

  const section = SECTIONS.find((s) => s.id === query.section);
  // A section's drill-down lives in the URL, so the back crumb is a real
  // navigation and the browser's own back button works inside settings.
  const focus = query.focus || undefined;

  if (!section) {
    return (
      <div className="flex h-full min-h-0 flex-col">
        <PageHeader
          title="Settings"
          meta={<span>Configure the data model, routing, service levels and integrations.</span>}
        />
        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <div className="mx-auto max-w-5xl space-y-6">
            {GROUPS.map((g) => {
              const items = SECTIONS.filter((s) => s.group === g);
              if (!items.length) return null;
              return (
                <section key={g}>
                  <h2 className="mb-2.5 text-body font-semibold text-on-surface">{g}</h2>
                  <div className="grid gap-3 md:grid-cols-2">
                    {items.map((s) => (
                      <NavTile
                        key={s.id}
                        icon={s.icon}
                        title={s.title}
                        description={s.description}
                        tone={GROUP_TONE[g]}
                        onClick={() => navigate(`/admin?section=${s.id}`)}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const { Component } = section;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader
        breadcrumbs={[
          { label: 'Settings', onClick: () => navigate('/admin') },
          ...(focus
            ? [
                {
                  label: section.title,
                  onClick: () => navigate(`/admin?section=${section.id}`),
                },
              ]
            : [{ label: section.title }]),
        ]}
        title={section.title}
        meta={<span>{section.description}</span>}
      />
      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        <div className="mx-auto max-w-5xl pb-8">
          <Component
            state={state}
            dispatch={dispatch}
            focus={focus}
            onFocus={(id) =>
              navigate(
                id
                  ? `/admin?section=${section.id}&focus=${encodeURIComponent(id)}`
                  : `/admin?section=${section.id}`,
              )
            }
          />
        </div>
      </div>
    </div>
  );
}
