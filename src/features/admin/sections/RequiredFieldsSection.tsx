import React from 'react';
import { Badge, MetricCard, MetricRow, Switch } from '@/design-system';
import { TICKET_FIELD_DEFS, TICKET_GATE_DEFAULTS } from '@/data/tickets';
import {
  AdminTable, Cell, NameCell, NoRows, Row, SettingRow, SettingsGroup,
} from '../primitives';
import { BuilderTabs } from '../signals';
import type { SectionProps } from './types';

const defFor = (key: string) =>
  (TICKET_FIELD_DEFS as any[]).find((f) => f.key === key) ?? { key, type: 'text' };

/**
 * Two moments in a ticket's life where fields are captured before the agent
 * can continue. Asking at the moment of the action is deliberate.
 */
export function RequiredFieldsSection({ state, dispatch }: SectionProps) {
  const [phase, setPhase] = React.useState('firstResponse');

  const cfg = state.gateConfig ?? TICKET_GATE_DEFAULTS;
  const conf = (cfg as any)[phase] ?? {};
  const defs = conf.fields ?? [];
  const captured = state.ticketGates ?? {};
  const capturedCount = Object.values(captured).filter((g: any) => g[phase]).length;

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border-default bg-subtle px-4 py-3.5">
        <p className="max-w-prose text-body-sm leading-relaxed text-on-surface-muted">
          A field marked required on a form gets filled with whatever is first in the list. A field
          asked for at the point of sending is answered while the agent still has the answer in
          mind — which is why these two gates exist rather than a longer ticket form.
        </p>
      </div>

      <BuilderTabs
        value={phase}
        onChange={setPhase}
        items={[
          { value: 'firstResponse', label: 'On first response' },
          { value: 'resolution', label: 'On resolve or close' },
        ]}
      />

      <MetricRow className="lg:grid-cols-3">
        <MetricCard
          label="Fields in this set"
          value={defs.length}
          hint={`${defs.filter((f: any) => f.required).length} mandatory`}
        />
        <MetricCard
          label="Enforcement"
          value={conf.blocking ? 'Blocking' : 'Warn only'}
          hint={conf.blocking ? 'agent cannot continue' : 'agent may continue'}
        />
        <MetricCard label="Tickets captured" value={capturedCount} hint="this session" />
      </MetricRow>

      <SettingsGroup title="When this fires">
        <SettingRow
          label={conf.enabled ? 'Enabled' : 'Disabled'}
          description={
            phase === 'firstResponse'
              ? 'Fires once per ticket, on the first customer-facing reply. Internal notes and forwards to a third party do not trigger it — neither is a first response.'
              : `Fires once per ticket, when the status is moved to ${(conf.triggerStatuses ?? ['Resolved', 'Closed']).join(' or ')}.`
          }
          control={
            <Switch
              checked={!!conf.enabled}
              aria-label="Gate enabled"
              onCheckedChange={() =>
                dispatch({
                  type: 'UPDATE_GATE_CONFIG',
                  phase,
                  patch: { enabled: !conf.enabled },
                  msg: `${conf.enabled ? 'Disabled' : 'Enabled'} the ${
                    phase === 'resolution' ? 'resolution' : 'first response'
                  } gate`,
                })
              }
            />
          }
        />
        <SettingRow
          label="Block the action until mandatory fields are complete"
          description="Off means the agent sees the prompt and can continue anyway; the ticket is flagged as incomplete instead."
          control={
            <Switch
              checked={!!conf.blocking}
              aria-label="Blocking"
              onCheckedChange={() =>
                dispatch({
                  type: 'UPDATE_GATE_CONFIG',
                  phase,
                  patch: { blocking: !conf.blocking },
                  msg: conf.blocking
                    ? 'Agents can now continue without completing the set'
                    : 'Mandatory fields are now enforced',
                })
              }
            />
          }
        />
      </SettingsGroup>

      <SettingsGroup
        flush
        title="Fields in this set"
        description="Mandatory fields gate the action. Optional fields appear in the same prompt but never block it."
      >
        <AdminTable
          minWidth="760px"
          columns={['Field', 'Type', 'Guidance shown to the agent', 'Mandatory']}
        >
          {defs.length === 0 ? (
            <NoRows colSpan={4} message="No fields in this set" />
          ) : (
            defs.map((f: any) => {
              const def = defFor(f.key);
              return (
                <Row key={f.key}>
                  <NameCell>{f.key}</NameCell>
                  <Cell>
                    <Badge tone="neutral">{def.type}</Badge>
                    {def.options && (
                      <p className="mt-1 text-caption text-on-surface-faint">
                        {def.options.length} options
                      </p>
                    )}
                  </Cell>
                  <Cell className="max-w-md leading-relaxed">{f.help ?? '—'}</Cell>
                  <Cell right>
                    <span className="inline-flex items-center gap-2">
                      <Switch
                        checked={!!f.required}
                        aria-label={`${f.key} mandatory`}
                        onCheckedChange={() =>
                          dispatch({
                            type: 'SET_GATE_FIELD_REQUIRED',
                            phase,
                            key: f.key,
                            required: !f.required,
                          })
                        }
                      />
                      <span className="w-16 text-left text-caption text-on-surface-subtle">
                        {f.required ? 'Mandatory' : 'Optional'}
                      </span>
                    </span>
                  </Cell>
                </Row>
              );
            })
          )}
        </AdminTable>
      </SettingsGroup>

      <SettingsGroup title="What the agent sees">
        <p className="max-w-prose py-3.5 text-body-sm leading-relaxed text-on-surface-muted">
          {phase === 'firstResponse'
            ? 'On pressing Send reply for the first time on a ticket, a review prompt appears listing these fields, prefilled from the ticket and the AI suggestions. The agent confirms or corrects, and the reply then sends. On every later reply the prompt does not appear.'
            : 'On moving the status to Resolved or Closed, the status change is held until this set is complete. Cancelling leaves the ticket in its previous status.'}
        </p>
      </SettingsGroup>
    </div>
  );
}
