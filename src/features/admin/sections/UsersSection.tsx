import React from 'react';
import { Download, Plus } from 'lucide-react';
import { Avatar, Badge, Button, Field, Input, MetricCard, MetricRow, SearchInput } from '@/design-system';
import { USERS } from '@/data/core';
import { ADMIN_FIELDS, AGENT_AUDIT, AGENT_MAILBOXES, AGENT_META } from '@/data/admin';
import {
  AdminTable, Cell, Chevron, NoRows, Row, SettingsGroup,
} from '../primitives';
import type { SectionProps } from './types';

/** Agent directory, one agent's profile, and that agent's session log. */
export function UsersSection({ dispatch, focus, onFocus }: SectionProps) {
  const [q, setQ] = React.useState('');

  // `focus` is either an agent id, or "<id>:audit" for the session log.
  const [agentId, mode] = (focus ?? '').split(':');
  const user = agentId ? (USERS as any)[agentId] : undefined;

  // ── Session log ──
  if (user && mode === 'audit') {
    const trail = (AGENT_AUDIT as any)[agentId] ?? [];
    return (
      <div className="space-y-5">
        <SettingsGroup>
          <div className="flex items-center gap-3 py-3.5">
            <Avatar name={user.name} size="xl" />
            <div className="min-w-0 flex-1">
              <p className="text-body font-semibold text-on-surface">{user.name}</p>
              <p className="text-caption text-on-surface-subtle">
                {trail.length} session events recorded
              </p>
            </div>
            <Button
              variant="secondary"
              icon={<Download className="size-4" strokeWidth={1.75} />}
              onClick={() =>
                dispatch({ type: 'ADD_TOAST', msg: 'Audit log exported', toastType: 'success' })
              }
            >
              Export
            </Button>
          </div>
        </SettingsGroup>

        <SettingsGroup flush title="Session activity">
          <AdminTable columns={['When', 'Event', 'IP address', 'Device', 'Result']}>
            {trail.length === 0 ? (
              <NoRows colSpan={5} message="No session activity recorded" />
            ) : (
              trail.map((e: any, i: number) => (
                <Row key={i}>
                  <Cell>{e.at}</Cell>
                  <Cell>
                    <Badge tone={!e.ok ? 'danger' : e.event === 'Login' ? 'success' : 'neutral'}>
                      {e.event}
                    </Badge>
                  </Cell>
                  <Cell mono>{e.ip}</Cell>
                  <Cell>{e.device}</Cell>
                  <Cell right>
                    <span
                      className={`text-caption font-medium ${
                        e.ok ? 'text-success-fg' : 'text-danger-fg'
                      }`}
                    >
                      {e.ok ? 'Success' : 'Failed'}
                    </span>
                  </Cell>
                </Row>
              ))
            )}
          </AdminTable>
        </SettingsGroup>
      </div>
    );
  }

  // ── One agent's profile ──
  if (user) {
    const meta = (AGENT_META as any)[agentId] ?? {};
    const mailbox = (AGENT_MAILBOXES as any)[agentId] ?? {};
    const defs = (ADMIN_FIELDS as any).agent ?? [];
    const valueFor = (key: string) =>
      (
        {
          agent_name: user.name,
          role: meta.roleLabel,
          assigned_accounts: `${meta.accounts ?? 0} accounts`,
          workload_score: String(40 + (meta.accounts ?? 0) * 6),
          avg_nps: String(38 + (meta.accounts ?? 0)),
          response_sla: '4 hours',
        } as Record<string, string>
      )[key] ?? '—';

    return (
      <div className="space-y-5">
        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={() => onFocus(`${agentId}:audit`)}
          >
            Session log
          </Button>
          <Button
            variant="primary"
            onClick={() => dispatch({ type: 'ADD_TOAST', msg: 'Agent saved', toastType: 'success' })}
          >
            Save
          </Button>
        </div>

        <SettingsGroup>
          <div className="flex flex-wrap items-center gap-4 py-4">
            <Avatar name={user.name} size="xl" />
            <div className="min-w-0 flex-1">
              <p className="text-title-sm font-semibold text-on-surface">{user.name}</p>
              <p className="text-body-sm text-on-surface-subtle">
                {meta.roleLabel} · joined {meta.joined}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Badge tone={meta.status === 'active' ? 'success' : 'neutral'} dot>
                {meta.status === 'active' ? 'Active' : 'Inactive'}
              </Badge>
              <Badge tone="neutral">Last active {meta.lastActive}</Badge>
              <Badge tone={mailbox.connected ? 'success' : 'warning'}>
                {mailbox.connected ? 'Mailbox connected' : 'No mailbox'}
              </Badge>
            </div>
          </div>
        </SettingsGroup>

        <SettingsGroup
          title="Agent fields"
          description="Defined in Field manager › Agent fields. System fields are read-only here."
        >
          <div className="grid gap-3 py-3.5 sm:grid-cols-2">
            {defs.map((f: any) => (
              <Field
                key={f.key}
                label={
                  <span className="inline-flex items-center gap-2">
                    {f.label}
                    {f.req && <Badge tone="warning">Required</Badge>}
                    {f.system && <Badge tone="neutral">System</Badge>}
                  </span>
                }
                hint={`${f.type} · used in ${f.usage}`}
              >
                <Input defaultValue={valueFor(f.key)} readOnly={f.system} />
              </Field>
            ))}
          </div>
        </SettingsGroup>
      </div>
    );
  }

  // ── Directory ──
  const agents = Object.keys(USERS).filter(
    (id) =>
      !q ||
      (USERS as any)[id].name.toLowerCase().includes(q.toLowerCase()) ||
      ((AGENT_META as any)[id]?.roleLabel ?? '').toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="space-y-5">
      <MetricRow>
        <MetricCard label="Agents" value={Object.keys(USERS).length} hint="in this account" />
        <MetricCard
          label="Active"
          value={Object.values(AGENT_META).filter((m: any) => m.status === 'active').length}
          hint="signed in recently"
        />
        <MetricCard
          label="Mailboxes connected"
          value={Object.values(AGENT_MAILBOXES).filter((m: any) => m.connected).length}
          hint={`of ${Object.keys(USERS).length}`}
        />
        <MetricCard
          label="Roles in use"
          value={new Set(Object.values(AGENT_META).map((m: any) => m.roleLabel)).size}
          hint="see Roles"
        />
      </MetricRow>

      <SettingsGroup
        flush
        title="Directory"
        actions={
          <>
            <div className="w-52">
              <SearchInput
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search agents…"
              />
            </div>
            <Button
              size="sm"
              variant="secondary"
              icon={<Plus className="size-4" strokeWidth={1.75} />}
              onClick={() => dispatch({ type: 'ADD_TOAST', msg: 'Invite sent', toastType: 'success' })}
            >
              Invite agent
            </Button>
          </>
        }
      >
        <AdminTable minWidth="820px" columns={['Agent', 'Role', 'Mailbox', 'Last active', '']}>
          {agents.length === 0 ? (
            <NoRows colSpan={5} message="No agents match that search" />
          ) : (
            agents.map((id) => {
              const u = (USERS as any)[id];
              const meta = (AGENT_META as any)[id] ?? {};
              const mailbox = (AGENT_MAILBOXES as any)[id] ?? {};
              return (
                <Row key={id} onClick={() => onFocus(id)}>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={u.name} size="md" />
                      <div className="min-w-0">
                        <p className="text-body-sm font-medium text-on-surface">{u.name}</p>
                        <p className="font-mono text-caption text-on-surface-subtle">
                          {mailbox.address ?? '—'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <Cell>
                    <Badge tone="info">{meta.roleLabel}</Badge>
                  </Cell>
                  <Cell>
                    <Badge tone={mailbox.connected ? 'success' : 'neutral'} dot>
                      {mailbox.connected ? 'Connected' : 'Not connected'}
                    </Badge>
                  </Cell>
                  <Cell>{meta.lastActive}</Cell>
                  <Cell right>
                    <span
                      className="inline-flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button size="sm" variant="ghost" onClick={() => onFocus(`${id}:audit`)}>
                        Session log
                      </Button>
                      <Chevron />
                    </span>
                  </Cell>
                </Row>
              );
            })
          )}
        </AdminTable>
      </SettingsGroup>
    </div>
  );
}
