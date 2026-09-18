import React from 'react';
import { Check, Minus } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Badge, Button, MetricCard, MetricRow, Switch, Tooltip } from '@/design-system';
import { NOTIFY_CHANNELS, NOTIFY_EVENTS } from '@/data/admin';
import {
  AdminTable, NameCell, NavTile, Row, SettingRow, SettingsGroup, StatusBadge, toneOf,
} from '../primitives';
import type { SectionProps } from './types';

/** Delivery channels, and a matrix of which event goes where. */
export function NotificationsSection({ dispatch, focus, onFocus }: SectionProps) {
  const [matrix, setMatrix] = React.useState<any[]>(NOTIFY_EVENTS);
  const [settings, setSettings] = React.useState<Record<string, boolean>>({});

  const channel = NOTIFY_CHANNELS.find((x: any) => x.id === focus);

  if (channel) {
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <StatusBadge status={channel.status} />
          <Button
            variant={channel.status === 'connected' ? 'secondary' : 'primary'}
            onClick={() =>
              dispatch({
                type: 'ADD_TOAST',
                msg: `${channel.status === 'connected' ? 'Sending test to ' : 'Connecting '}${channel.label}`,
                toastType: 'info',
              })
            }
          >
            {channel.status === 'connected' ? 'Send test' : `Connect ${channel.label}`}
          </Button>
        </div>

        <MetricRow className="lg:grid-cols-3">
          {channel.stats.map((s: [string, string]) => (
            <MetricCard key={s[0]} label={s[0]} value={s[1]} />
          ))}
        </MetricRow>

        <div className="grid gap-5 lg:grid-cols-3">
          <SettingsGroup title={`${channel.label} settings`} className="lg:col-span-2">
            {channel.settings.map((st: [string, boolean]) => {
              const key = `${channel.id}:${st[0]}`;
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

          <SettingsGroup title="Connection">
            <div className="space-y-2 py-3.5">
              <p className="text-body-sm font-medium text-on-surface">{channel.detail}</p>
              <p className="text-caption leading-relaxed text-on-surface-subtle">{channel.desc}</p>
            </div>
          </SettingsGroup>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 lg:grid-cols-3">
        {NOTIFY_CHANNELS.map((x: any) => (
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
                <Badge tone="neutral">
                  {matrix.filter((e) => e[x.id]).length} events
                </Badge>
              </>
            }
          />
        ))}
      </div>

      <SettingsGroup
        flush
        title="Event routing"
        description="Click a cell to toggle delivery of that event on that channel."
      >
        <AdminTable
          columns={['Event', ...NOTIFY_CHANNELS.map((c: any) => c.label)]}
        >
          {matrix.map((e) => (
            <Row key={e.id}>
              <NameCell sub={e.audience}>{e.label}</NameCell>
              {NOTIFY_CHANNELS.map((ch: any, i: number) => (
                <td
                  key={ch.id}
                  className={cn(
                    'px-4 py-2.5 align-middle',
                    i === NOTIFY_CHANNELS.length - 1 ? 'text-right' : 'text-center',
                  )}
                >
                  <Tooltip
                    label={e[ch.id] ? `Delivering via ${ch.label}` : `Not delivering via ${ch.label}`}
                    side="top"
                  >
                    <button
                      onClick={() =>
                        setMatrix((m) =>
                          m.map((x) => (x.id === e.id ? { ...x, [ch.id]: !x[ch.id] } : x)),
                        )
                      }
                      aria-pressed={!!e[ch.id]}
                      aria-label={`${e.label} via ${ch.label}`}
                      className={cn(
                        'inline-flex size-6 items-center justify-center rounded-md border transition-colors duration-[120ms]',
                        e[ch.id]
                          ? 'border-success-border bg-success-subtle text-success-fg'
                          : 'border-border-default text-on-surface-faint hover:border-border-strong',
                      )}
                    >
                      {e[ch.id] ? (
                        <Check className="size-3.5" strokeWidth={2.5} />
                      ) : (
                        <Minus className="size-3.5" strokeWidth={2} />
                      )}
                    </button>
                  </Tooltip>
                </td>
              ))}
            </Row>
          ))}
        </AdminTable>
      </SettingsGroup>
    </div>
  );
}
