import React from 'react';
import { Badge, Meter, MetricCard, MetricRow } from '@/design-system';
import { HYGIENE_RULES } from '@/data/admin';
import { AdminTable, Cell, NameCell, Row, SettingsGroup } from '../primitives';
import type { BuilderProps } from './shared';

/** Weighted checks on how support work is being handled. */
export function HygieneBuilder(_props: BuilderProps) {
  const [rules, setRules] = React.useState<any[]>(HYGIENE_RULES);
  const allocated = rules.reduce((n, r) => n + r.weight, 0);
  const score = Math.round(rules.filter((r) => r.healthy).reduce((n, r) => n + r.weight, 0));

  return (
    <div className="space-y-5">
      <MetricRow className="lg:grid-cols-3">
        <MetricCard
          label="Hygiene score"
          value={`${score}/100`}
          hint={score >= 80 ? 'Healthy' : 'Needs attention'}
        />
        <MetricCard
          label="Rules passing"
          value={`${rules.filter((r) => r.healthy).length}/${rules.length}`}
          hint="against target"
        />
        <MetricCard
          label="Weight allocated"
          value={`${allocated}/100`}
          hint={allocated === 100 ? 'Balanced' : 'Must total 100'}
        />
      </MetricRow>

      <SettingsGroup
        flush
        title="Hygiene rules"
        description="The weights must total 100. A rule below its target contributes nothing to the score."
      >
        <AdminTable columns={['Rule', 'Target', 'Current', 'Weight', 'Status']}>
          {rules.map((r) => (
            <Row key={r.id}>
              <NameCell>{r.name}</NameCell>
              <Cell className="tabular-nums">{r.target}</Cell>
              <Cell>
                <span
                  className={`text-body-sm font-semibold tabular-nums ${
                    r.healthy ? 'text-success-fg' : 'text-warning-fg'
                  }`}
                >
                  {r.current}
                </span>
              </Cell>
              <Cell>
                <div className="flex items-center gap-2.5">
                  <input
                    type="range"
                    min={0}
                    max={40}
                    value={r.weight}
                    aria-label={`${r.name} weight`}
                    onChange={(e) =>
                      setRules((l) =>
                        l.map((x) => (x.id === r.id ? { ...x, weight: Number(e.target.value) } : x)),
                      )
                    }
                    className="w-24 accent-[var(--accent)]"
                  />
                  <span className="w-7 text-body-sm font-medium tabular-nums text-on-surface">
                    {r.weight}
                  </span>
                </div>
              </Cell>
              <Cell right>
                <Badge tone={r.healthy ? 'success' : 'warning'} dot>
                  {r.healthy ? 'Passing' : 'Below target'}
                </Badge>
              </Cell>
            </Row>
          ))}
        </AdminTable>
      </SettingsGroup>

      <SettingsGroup title="Weight distribution">
        <div className="space-y-3 py-3.5">
          {rules.map((r) => (
            <Meter
              key={r.id}
              label={r.name}
              value={r.weight}
              max={40}
              display={`${r.weight}%`}
              tone={r.healthy ? 'good' : 'watch'}
            />
          ))}
        </div>
      </SettingsGroup>
    </div>
  );
}
