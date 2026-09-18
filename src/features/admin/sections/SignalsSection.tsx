import React from 'react';
import { Badge, Button, Meter, MetricCard, MetricRow, Switch } from '@/design-system';
import { SIGNAL_SOURCES } from '@/data/admin';
import { FactRow, NavTile, SettingRow, SettingsGroup, StatusBadge, toneOf } from '../primitives';
import { SIGNAL_BUILDERS, BuilderTabs } from '../signals';
import type { SectionProps } from './types';

/** Signal sources feed the health engine and every trigger condition. */
export function SignalsSection({ dispatch, focus, onFocus }: SectionProps) {
  const [view, setView] = React.useState('builder');
  const [settings, setSettings] = React.useState<Record<string, boolean>>({});

  const source = SIGNAL_SOURCES.find((x: any) => x.id === focus);

  if (!source) {
    return (
      <div className="space-y-4">
        <p className="max-w-prose text-body-sm leading-relaxed text-on-surface-muted">
          Signal sources feed the health engine and trigger conditions. Each source can be tuned
          independently.
        </p>
        <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {SIGNAL_SOURCES.map((x: any) => (
            <NavTile
              key={x.id}
              icon={x.icon}
              title={x.label}
              description={x.desc}
              tone={toneOf(x.tone)}
              onClick={() => onFocus(x.id)}
              meta={
                <>
                  <StatusBadge status={x.status} />
                  <Badge tone="neutral">{x.freq}</Badge>
                  <Badge tone={x.coverage > 80 ? 'success' : x.coverage > 50 ? 'warning' : 'danger'}>
                    {x.coverage}% coverage
                  </Badge>
                </>
              }
            />
          ))}
        </div>
      </div>
    );
  }

  const builder = SIGNAL_BUILDERS[source.id];
  const Builder = builder?.Component;

  return (
    <div className="space-y-5">
      <MetricRow className={source.metrics.length === 3 ? 'lg:grid-cols-3' : undefined}>
        {source.metrics.map((m: [string, string]) => (
          <MetricCard key={m[0]} label={m[0]} value={m[1]} />
        ))}
      </MetricRow>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <BuilderTabs
          value={view}
          onChange={setView}
          items={[
            { value: 'builder', label: builder?.label ?? 'Builder' },
            { value: 'settings', label: 'Settings and source' },
          ]}
        />
        <div className="flex items-center gap-2">
          <StatusBadge status={source.status} />
          <Button
            size="sm"
            variant={source.status === 'inactive' ? 'primary' : 'secondary'}
            onClick={() =>
              dispatch({
                type: 'ADD_TOAST',
                msg: `${source.status === 'inactive' ? 'Connecting ' : 'Re-syncing '}${source.label}`,
                toastType: 'info',
              })
            }
          >
            {source.status === 'inactive' ? 'Connect source' : 'Re-sync now'}
          </Button>
        </div>
      </div>

      {view === 'builder' &&
        (Builder ? (
          <Builder dispatch={dispatch} />
        ) : (
          <SettingsGroup title="Builder">
            <p className="py-4 text-body-sm text-on-surface-subtle">
              No builder is configured for this source.
            </p>
          </SettingsGroup>
        ))}

      {view === 'settings' && (
        <div className="grid gap-5 lg:grid-cols-3">
          <SettingsGroup title="Configuration" className="lg:col-span-2">
            {source.settings.map((st: [string, boolean]) => {
              const key = `${source.id}:${st[0]}`;
              const on = settings[key] !== undefined ? settings[key] : st[1];
              return (
                <SettingRow
                  key={st[0]}
                  label={st[0]}
                  control={
                    <Switch
                      checked={on}
                      aria-label={st[0]}
                      onCheckedChange={(v) => setSettings((o) => ({ ...o, [key]: v }))}
                    />
                  }
                />
              );
            })}
          </SettingsGroup>

          <SettingsGroup title="Source detail">
            <FactRow label="Source" value={source.source} />
            <FactRow label="Frequency" value={source.freq} />
            <div className="border-b border-border-default py-3 last:border-0">
              <Meter label="Account coverage" value={source.coverage} display={`${source.coverage}%`} />
            </div>
            <p className="py-3 text-caption leading-relaxed text-on-surface-subtle">{source.desc}</p>
          </SettingsGroup>
        </div>
      )}
    </div>
  );
}
