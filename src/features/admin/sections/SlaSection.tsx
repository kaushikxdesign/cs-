import React from 'react';
import { Plus } from 'lucide-react';
import { Badge, Button, Field, Input, Meter, Select, Switch } from '@/design-system';
import { SLA_CALENDARS, SLA_ESCALATIONS, SLA_PAUSE_CONDITIONS, SLA_PRIORITIES } from '@/data/admin';
import {
  AdminTable, Cell, Chevron, FactRow, Row, SettingRow, SettingsGroup, toneOf,
} from '../primitives';
import { BuilderTabs } from '../signals';
import type { SectionProps } from './types';

const SCOPES = [
  'All accounts', 'Enterprise only', 'Strategic accounts only', 'Premium support plan',
  'Mid-market and above',
];

/** First response and resolution targets, business hours, escalation, pauses. */
export function SlaSection({ dispatch, focus, onFocus }: SectionProps) {
  const [tab, setTab] = React.useState('targets');
  const [pauses, setPauses] = React.useState<Record<string, boolean>>({});
  const [scope, setScope] = React.useState(SCOPES[0]);

  const priority = SLA_PRIORITIES.find((x: any) => x.id === focus);

  // ── One priority's targets ──
  if (priority) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <Badge tone={toneOf(priority.tone)} dot>
            {priority.label}
          </Badge>
          <Button
            variant="primary"
            onClick={() =>
              dispatch({ type: 'ADD_TOAST', msg: 'SLA target saved', toastType: 'success' })
            }
          >
            Save target
          </Button>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <SettingsGroup title="Targets" className="lg:col-span-2">
            <div className="grid gap-3 py-3.5 sm:grid-cols-2">
              {[
                ['First response target', priority.respond],
                ['Resolution target', priority.resolve],
                ['Next-update cadence', '2 hours'],
                ['Operating clock', priority.clock],
              ].map(([label, value]) => (
                <Field key={label} label={label}>
                  <Input defaultValue={value} />
                </Field>
              ))}
              <Field label="Applies to" className="sm:col-span-2">
                <Select
                  value={scope}
                  onValueChange={setScope}
                  options={SCOPES.map((o) => ({ value: o, label: o }))}
                />
              </Field>
            </div>
          </SettingsGroup>

          <SettingsGroup title="Attainment, last 30 days">
            <div className="space-y-3 py-3.5">
              <div>
                <p
                  className={`text-display font-semibold tabular-nums ${
                    priority.met >= 95
                      ? 'text-success-fg'
                      : priority.met >= 90
                        ? 'text-warning-fg'
                        : 'text-danger-fg'
                  }`}
                >
                  {priority.met}%
                </p>
                <p className="text-caption text-on-surface-subtle">Target met</p>
              </div>
              <Meter value={priority.met} display={`${priority.met}%`} />
            </div>
            <FactRow
              label="Breaches"
              value={<span className="text-danger-fg">{priority.breach}</span>}
            />
          </SettingsGroup>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <BuilderTabs
        value={tab}
        onChange={setTab}
        items={[
          { value: 'targets', label: 'Targets' },
          { value: 'calendars', label: 'Business hours' },
          { value: 'escalation', label: 'Escalation' },
          { value: 'pause', label: 'Pause rules' },
        ]}
      />

      {tab === 'targets' && (
        <SettingsGroup
          flush
          title="Response and resolution targets"
          description="Open a priority to edit its targets and the accounts it applies to."
        >
          <AdminTable columns={['Priority', 'First response', 'Resolution', 'Clock', '']}>
            {SLA_PRIORITIES.map((x: any) => (
              <Row key={x.id} onClick={() => onFocus(x.id)}>
                <Cell>
                  <Badge tone={toneOf(x.tone)} dot>
                    {x.label}
                  </Badge>
                </Cell>
                <Cell className="font-medium text-on-surface">{x.respond}</Cell>
                <Cell className="font-medium text-on-surface">{x.resolve}</Cell>
                <Cell>{x.clock}</Cell>
                <Cell right>
                  <span className="flex justify-end">
                    <Chevron />
                  </span>
                </Cell>
              </Row>
            ))}
          </AdminTable>
        </SettingsGroup>
      )}

      {tab === 'calendars' && (
        <SettingsGroup
          title="Business-hour calendars"
          description="A calendar decides when the SLA clock runs at all."
          actions={
            <Button
              size="sm"
              variant="secondary"
              icon={<Plus className="size-4" strokeWidth={1.75} />}
              onClick={() => dispatch({ type: 'ADD_TOAST', msg: 'New calendar', toastType: 'info' })}
            >
              New calendar
            </Button>
          }
        >
          <div className="grid gap-3 py-3.5 lg:grid-cols-2">
            {SLA_CALENDARS.map((c: any) => (
              <div key={c.id} className="rounded-xl border border-border-default p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-body-sm font-medium text-on-surface">{c.name}</p>
                    <p className="mt-0.5 text-caption text-on-surface-subtle">{c.tz}</p>
                  </div>
                  <Badge tone={c.hours === 'All hours' ? 'success' : 'info'}>{c.hours}</Badge>
                </div>
                <div className="mt-3 border-t border-border-default pt-1">
                  <FactRow label="Holidays" value={c.holidays} />
                  <FactRow label="Applied to" value={c.teams} />
                </div>
              </div>
            ))}
          </div>
        </SettingsGroup>
      )}

      {tab === 'escalation' && (
        <SettingsGroup
          title="Escalation ladder"
          description="Who gets notified as a ticket approaches and passes its SLA target."
          actions={
            <Button
              size="sm"
              variant="secondary"
              icon={<Plus className="size-4" strokeWidth={1.75} />}
              onClick={() =>
                dispatch({ type: 'ADD_TOAST', msg: 'Escalation step added', toastType: 'info' })
              }
            >
              Add step
            </Button>
          }
        >
          <ol className="space-y-2 py-3.5">
            {SLA_ESCALATIONS.map((e: any, i: number) => (
              <li
                key={i}
                className="flex items-center gap-3 rounded-lg border border-border-default px-3 py-2.5"
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-subtle text-caption font-semibold tabular-nums text-on-surface-muted">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-body-sm font-medium text-on-surface">{e.at}</p>
                  <p className="mt-0.5 text-caption text-on-surface-subtle">Notify {e.who}</p>
                </div>
                <Badge tone={i === 3 ? 'danger' : i === 2 ? 'warning' : 'neutral'}>{e.how}</Badge>
              </li>
            ))}
          </ol>
        </SettingsGroup>
      )}

      {tab === 'pause' && (
        <SettingsGroup
          title="Pause the SLA clock when…"
          description="Time spent in these states is excluded from SLA measurement."
        >
          {SLA_PAUSE_CONDITIONS.map((c: [string, boolean]) => {
            const on = pauses[c[0]] !== undefined ? pauses[c[0]] : c[1];
            return (
              <SettingRow
                key={c[0]}
                label={c[0]}
                control={
                  <span className="inline-flex items-center gap-2">
                    <Switch
                      checked={on}
                      aria-label={c[0]}
                      onCheckedChange={(v) => setPauses((o) => ({ ...o, [c[0]]: v }))}
                    />
                    <span className="w-14 text-caption text-on-surface-subtle">
                      {on ? 'Paused' : 'Running'}
                    </span>
                  </span>
                }
              />
            );
          })}
        </SettingsGroup>
      )}
    </div>
  );
}
