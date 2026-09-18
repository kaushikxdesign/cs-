import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Select, Switch } from '@/design-system';
import { SettingRow, SettingsGroup } from '../primitives';
import type { BuilderProps } from './shared';

const PROVIDERS = [
  ['Clearbit', 'Contact enrichment and job-change webhooks'],
  ['Apollo.io', 'Contact database with change alerts'],
  ['UserGems', 'Purpose-built job-change tracking'],
] as const;

const WATCHES = [
  ['Champion leaves the company', true],
  ['Decision maker changes role', true],
  ['New executive joins a target account', false],
  ['Company headcount shifts', false],
  ['Enrich newly created contacts automatically', true],
] as const;

/** Contact monitoring, which runs through an enrichment provider. */
export function LinkedInBuilder({ dispatch }: BuilderProps) {
  const [cadence, setCadence] = React.useState('Daily');
  const [watch, setWatch] = React.useState<Record<string, boolean>>(
    Object.fromEntries(WATCHES.map(([k, v]) => [k, v])),
  );

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-xl border border-warning-border bg-warning-subtle px-4 py-3">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning-fg" strokeWidth={1.75} />
        <p className="max-w-prose text-body-sm leading-relaxed text-warning-fg">
          <span className="font-medium">Not connected.</span> LinkedIn has no public API for
          job-change monitoring, so this signal runs through an enrichment provider rather than
          LinkedIn directly. Connect one below.
        </p>
      </div>

      <SettingsGroup
        title="Enrichment provider"
        description="One provider supplies the job-change events; the rules below decide which of them matter."
      >
        <div className="grid gap-3 py-3.5 sm:grid-cols-3">
          {PROVIDERS.map(([name, note]) => (
            <button
              key={name}
              onClick={() =>
                dispatch({ type: 'ADD_TOAST', msg: `Connecting ${name}`, toastType: 'info' })
              }
              className="rounded-xl border border-border-default p-3 text-left transition-colors duration-[120ms] hover:border-border-strong hover:bg-hover"
            >
              <p className="text-body-sm font-medium text-on-surface">{name}</p>
              <p className="mt-0.5 text-caption leading-relaxed text-on-surface-subtle">{note}</p>
            </button>
          ))}
        </div>
      </SettingsGroup>

      <SettingsGroup title="What to monitor">
        {WATCHES.map(([label]) => (
          <SettingRow
            key={label}
            label={label}
            control={
              <Switch
                checked={!!watch[label]}
                aria-label={label}
                onCheckedChange={(v) => setWatch((w) => ({ ...w, [label]: v }))}
              />
            }
          />
        ))}
        <SettingRow
          label="Check cadence"
          description="How often the provider is polled for changes on monitored contacts."
          control={
            <Select
              value={cadence}
              onValueChange={setCadence}
              options={['Hourly', 'Daily', 'Weekly'].map((o) => ({ value: o, label: o }))}
            />
          }
        />
      </SettingsGroup>
    </div>
  );
}
