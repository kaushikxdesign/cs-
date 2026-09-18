import React from 'react';
import { Plus, Zap } from 'lucide-react';
import { Badge, Button, EmptyState, MetricCard, MetricRow, SearchInput, Switch } from '@/design-system';
import { AUTOMATIONS, AUTO_FIELDS, AUTO_PILLAR_META, actionMeta, fieldMeta } from '@/data/automations';
import { RuleLines, SettingsGroup, toneOf } from '../primitives';
import type { SectionProps } from './types';

const PILLAR = 'ticket';

/**
 * Ticket automations. Customer and contact behaviour is handled by Actions,
 * which CSMs build themselves against their own accounts — this screen is
 * the admin-owned half of that split.
 */
export function AutomationSection({ dispatch }: SectionProps) {
  const [items, setItems] = React.useState<any[]>(AUTOMATIONS);
  const [q, setQ] = React.useState('');

  const pm = (AUTO_PILLAR_META as any)[PILLAR];
  const mine = items.filter(
    (a) => a.pillar === PILLAR && (!q || a.name.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <div className="space-y-5">
      <MetricRow className="lg:grid-cols-3">
        <MetricCard
          label="Automations"
          value={items.filter((a) => a.pillar === PILLAR).length}
          hint="on tickets"
        />
        <MetricCard
          label="Enabled"
          value={items.filter((a) => a.pillar === PILLAR && a.enabled).length}
          hint="currently live"
        />
        <MetricCard
          label="Trigger attributes"
          value={(AUTO_FIELDS as any)[PILLAR].length}
          hint="can fire an event"
        />
      </MetricRow>

      <div className="rounded-xl border border-border-default bg-subtle px-4 py-3.5">
        <p className="max-w-prose text-body-sm leading-relaxed text-on-surface-muted">
          {pm.desc} Conditions and actions may span all three pillars, but only a ticket attribute
          can fire the event.
        </p>
      </div>

      <SettingsGroup
        title="Ticket automations"
        description={`${mine.length} shown.`}
        actions={
          <>
            <div className="w-52">
              <SearchInput
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search automations…"
              />
            </div>
            <Button
              size="sm"
              variant="secondary"
              icon={<Plus className="size-4" strokeWidth={1.75} />}
              onClick={() =>
                dispatch({
                  type: 'ADD_TOAST',
                  msg: 'The automation builder opens from an existing rule',
                  toastType: 'info',
                })
              }
            >
              New automation
            </Button>
          </>
        }
      >
        {mine.length === 0 ? (
          <EmptyState
            compact
            icon={<Zap className="size-5" strokeWidth={1.5} />}
            title={q ? 'No automations match that search' : 'No ticket automations yet'}
          />
        ) : (
          <div className="divide-y divide-border-default">
            {mine.map((a) => {
              const f = fieldMeta(a.pillar, a.event?.field);
              return (
                <div key={a.id} className="flex items-start gap-3.5 py-4">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent-subtle text-accent">
                    <Zap className="size-4" strokeWidth={1.75} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-body-sm font-medium text-on-surface">{a.name}</p>
                      <Badge tone={a.enabled ? 'success' : 'neutral'} dot>
                        {a.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>

                    <div className="mt-2.5 rounded-lg border border-border-default px-3 py-2.5">
                      <RuleLines action={a} />
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <Badge tone={toneOf(pm.tone)}>{f ? f.label : a.event?.field}</Badge>
                      {Array.from(new Set(a.conditions.map((c: any) => c.pillar))).map((p: any) => (
                        <Badge key={p} tone={toneOf((AUTO_PILLAR_META as any)[p]?.tone)}>
                          if {(AUTO_PILLAR_META as any)[p]?.label}
                        </Badge>
                      ))}
                      {a.actions.slice(0, 3).map((ac: any, i: number) => {
                        const m = actionMeta(ac.id);
                        return m ? (
                          <Badge key={i} tone="neutral">
                            {m.label}
                          </Badge>
                        ) : null;
                      })}
                      {a.actions.length > 3 && (
                        <Badge tone="neutral">+{a.actions.length - 3} more</Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <span className="text-caption tabular-nums text-on-surface-subtle">
                      {a.runs} runs · {a.last}
                    </span>
                    <Switch
                      checked={a.enabled}
                      aria-label={`${a.name} enabled`}
                      onCheckedChange={(v) =>
                        setItems((l) => l.map((x) => (x.id === a.id ? { ...x, enabled: v } : x)))
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SettingsGroup>
    </div>
  );
}
