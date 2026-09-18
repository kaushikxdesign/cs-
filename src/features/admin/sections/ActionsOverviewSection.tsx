import React from 'react';
import { Avatar, Badge, Button, MetricCard, MetricRow } from '@/design-system';
import { USERS } from '@/data/core';
import { AUTO_PILLAR_META, fieldMeta } from '@/data/automations';
import { titleCase } from '@/lib/format';
import {
  AdminTable, Cell, Chevron, FactRow, NameCell, NoRows, Row, RuleLines, SettingsGroup, toneOf,
} from '../primitives';
import type { SectionProps } from './types';

const pillarOf = (p?: string) => (AUTO_PILLAR_META as any)[p ?? ''] ?? (AUTO_PILLAR_META as any).customer;

/**
 * Read-only oversight. Every action runs only against the accounts its
 * author owns, so this is a place to see someone else's work, not edit it.
 */
export function ActionsOverviewSection({ state, focus, onFocus }: SectionProps) {
  const [owner, setOwner] = React.useState('all');

  const all = (state.actions ?? []) as any[];
  const owners = Array.from(new Set(all.map((a) => a.ownerId).filter(Boolean)));
  const shown = owner === 'all' ? all : all.filter((a) => a.ownerId === owner);
  const open = focus ? all.find((a) => a.id === focus) : null;

  const accountCount = (a: any) =>
    (state.customers ?? []).filter((c: any) => c.ownerId === a.ownerId).length;

  if (open) {
    const user = (USERS as any)[open.ownerId] ?? (USERS as any).maya;
    return (
      <div className="space-y-5">
        <SettingsGroup>
          <div className="flex flex-wrap items-center gap-3 py-3.5">
            <Avatar name={user?.name} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="text-body font-semibold text-on-surface">{open.name}</p>
              <p className="text-caption text-on-surface-subtle">Built by {user?.name}</p>
            </div>
            <Badge tone={open.enabled ? 'success' : 'neutral'} dot>
              {open.enabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
        </SettingsGroup>

        <SettingsGroup title="Rule">
          <div className="py-3.5">
            <RuleLines action={open} />
          </div>
        </SettingsGroup>

        <SettingsGroup title="Scope and history">
          <FactRow
            label="Runs against"
            value={
              open.scope === 'selected'
                ? `${(open.accountIds ?? []).length} selected accounts`
                : `All ${accountCount(open)} accounts owned by ${user?.name}`
            }
          />
          <FactRow label="Pillar" value={titleCase(open.pillar)} />
          <FactRow label="Runs" value={open.runs ?? 0} />
          <FactRow label="Last run" value={open.lastRun ?? 'Never run'} />
        </SettingsGroup>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <p className="max-w-prose text-body-sm leading-relaxed text-on-surface-muted">
        Every action built by a CSM. Each one runs only against the accounts its author owns — this
        view is oversight, not a place to edit someone else's work.
      </p>

      <MetricRow>
        <MetricCard label="Actions configured" value={all.length} hint="across the team" />
        <MetricCard label="Authors" value={owners.length} hint="CSMs building actions" />
        <MetricCard
          label="Enabled"
          value={all.filter((a) => a.enabled).length}
          hint="currently live"
        />
        <MetricCard
          label="Total runs"
          value={all.reduce((n, a) => n + (a.runs ?? 0), 0)}
          hint="lifetime"
        />
      </MetricRow>

      <SettingsGroup
        flush
        title="All actions"
        actions={
          <div className="flex flex-wrap gap-1">
            {[['all', 'All authors'] as [string, string]]
              .concat(owners.map((o) => [o, (USERS as any)[o]?.name ?? o] as [string, string]))
              .map(([id, label]) => (
                <Button
                  key={id}
                  size="sm"
                  variant={owner === id ? 'subtle' : 'ghost'}
                  onClick={() => setOwner(id)}
                >
                  {label}
                  <span className="tabular-nums text-on-surface-subtle">
                    {id === 'all' ? all.length : all.filter((a) => a.ownerId === id).length}
                  </span>
                </Button>
              ))}
          </div>
        }
      >
        <AdminTable
          minWidth="900px"
          columns={['Action', 'Built by', 'Trigger', 'Scope', 'Runs', 'Enabled', '']}
        >
          {shown.length === 0 ? (
            <NoRows colSpan={7} message="No actions configured" />
          ) : (
            shown.map((a) => {
              const f = fieldMeta(a.pillar, a.event?.field);
              const pm = pillarOf(a.pillar);
              const u = (USERS as any)[a.ownerId] ?? (USERS as any).maya;
              return (
                <Row key={a.id} onClick={() => onFocus(a.id)}>
                  <NameCell>{a.name}</NameCell>
                  <Cell>
                    <span className="inline-flex items-center gap-2">
                      <Avatar name={u?.name} size="sm" />
                      {u?.name}
                    </span>
                  </Cell>
                  <Cell>
                    <span className="inline-flex items-center gap-1.5">
                      <Badge tone={toneOf(pm.tone)}>{pm.label}</Badge>
                      {f ? f.label : a.event?.field}
                    </span>
                  </Cell>
                  <Cell>
                    {a.scope === 'selected'
                      ? `${(a.accountIds ?? []).length} selected`
                      : `${accountCount(a)} own accounts`}
                  </Cell>
                  <Cell className="tabular-nums">{a.runs ?? 0}</Cell>
                  <Cell>
                    <Badge tone={a.enabled ? 'success' : 'neutral'} dot>
                      {a.enabled ? 'Yes' : 'No'}
                    </Badge>
                  </Cell>
                  <Cell right>
                    <span className="flex justify-end">
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
