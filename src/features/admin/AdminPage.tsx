import React from 'react';
import { useApp } from '@/state/AppContext';
import { useLocation, useNavigate } from '@/router';
import { PageHeader } from '@/design-system';
import {
  ActionsOverviewAdmin, AssignmentAdmin, AutomationAdmin, ConnectorsAdmin, DriveAdmin,
  EmailConfigAdmin, FieldManagerAdmin, NotificationsAdmin, RequiredFieldsAdmin, RolesAdmin,
  SignalsAdmin, SlaAdmin, UserManagementAdmin,
} from '@/legacy/app';

interface Section {
  id: string;
  title: string;
  description: string;
  Component: React.ComponentType<any>;
}

/**
 * Every admin screen, including the seven the MVP left unreachable: they were
 * wired into AdminPage's if-chain but absent from the six-tile grid, so
 * nothing could open them. The grid is gone; the secondary nav lists them all.
 */
const SECTIONS: Section[] = [
  { id: 'fields', title: 'Field manager', description: 'Define company, contact, task and goal attributes.', Component: FieldManagerAdmin },
  { id: 'reqfields', title: 'Required fields', description: 'Fields an agent must capture before replying or resolving.', Component: RequiredFieldsAdmin },
  { id: 'users', title: 'User management', description: 'Invite CSMs and assign their role.', Component: UserManagementAdmin },
  { id: 'roles', title: 'Roles', description: 'Default roles and the privileges granted to each.', Component: RolesAdmin },
  { id: 'assignment', title: 'Assignment', description: 'How tickets and companies are routed to owners.', Component: AssignmentAdmin },
  { id: 'sla', title: 'SLA', description: 'Response and resolution targets, calendars and escalations.', Component: SlaAdmin },
  { id: 'signals', title: 'Signals', description: 'Sources that feed health scores — product usage and sentiment.', Component: SignalsAdmin },
  { id: 'notify', title: 'Notifications', description: 'Which events reach which channel.', Component: NotificationsAdmin },
  { id: 'emailcfg', title: 'Email configuration', description: 'Mailbox auth, forwarding addresses and domain routing.', Component: EmailConfigAdmin },
  { id: 'automation', title: 'Automation', description: 'Triggers that run without a person starting them.', Component: AutomationAdmin },
  { id: 'actionsview', title: 'Actions overview', description: 'Every action in the library and who authored it.', Component: ActionsOverviewAdmin },
  { id: 'drive', title: 'Drive', description: 'Templates available to QBRs, goals and plans.', Component: DriveAdmin },
  { id: 'connectors', title: 'Connectors', description: 'CRM, ticketing and product analytics integrations.', Component: ConnectorsAdmin },
];

export function AdminPage() {
  const { state, dispatch } = useApp();
  const { query } = useLocation();
  const navigate = useNavigate();

  const sectionId = query.section;
  const section = SECTIONS.find((s) => s.id === sectionId);

  if (!section) {
    return (
      <div className="flex h-full min-h-0 flex-col">
        <PageHeader
          title="Settings"
          meta={<span>Configure the data model, routing, service levels and integrations.</span>}
        />
        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          <div className="max-w-form divide-y divide-border-default rounded-lg border border-border-default bg-surface">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => navigate(`/admin?section=${s.id}`)}
                className="flex w-full flex-col items-start px-4 py-3 text-left transition-colors duration-[120ms] hover:bg-hover"
              >
                <span className="text-body-sm font-medium text-primary">{s.title}</span>
                <span className="mt-0.5 text-caption text-tertiary">{s.description}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const { Component } = section;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader
        breadcrumbs={[{ label: 'Settings', onClick: () => navigate('/admin') }, { label: section.title }]}
        title={section.title}
        meta={<span>{section.description}</span>}
      />
      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        {/* Section bodies are still legacy markup, so they keep the compat wrapper. */}
        <div className="cx-legacy max-w-form">
          <Component onBack={() => navigate('/admin')} dispatch={dispatch} state={state} />
        </div>
      </div>
    </div>
  );
}
