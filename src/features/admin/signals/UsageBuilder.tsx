import React from 'react';
import { Plus } from 'lucide-react';
import {
  Badge, Button, Dialog, Field, Input, MetricCard, MetricRow, Select, Switch,
} from '@/design-system';
import { USAGE_EVENTS, USAGE_PAGE_RULES, USAGE_SNIPPET } from '@/data/admin';
import {
  AdminTable, Cell, CodeBlock, NameCell, NoRows, Row, SettingsGroup,
} from '../primitives';
import { BuilderTabs, type BuilderProps } from './shared';

const INTERACTIONS = ['Click', 'Page view', 'Form submit', 'Hover', 'Text input'];
const MATCHES = ['starts with', 'is exactly', 'contains', 'matches regex'];

/** Product usage: an autocapture listener, Pendo / Heap style. */
export function UsageBuilder({ dispatch }: BuilderProps) {
  const [tab, setTab] = React.useState('events');
  const [autocapture, setAutocapture] = React.useState(true);
  const [events, setEvents] = React.useState<any[]>(USAGE_EVENTS);
  const [rules, setRules] = React.useState<any[]>(USAGE_PAGE_RULES);
  const [showTag, setShowTag] = React.useState(false);
  const [draft, setDraft] = React.useState({ name: '', selector: '', page: '', type: 'Click' });

  const tagged = events.filter((e) => e.tagged);
  const raw = events.filter((e) => !e.tagged);

  function tagDraft() {
    setEvents((l) => [
      {
        id: 'ue_new' + (l.length + 1),
        name: draft.name,
        selector: draft.selector,
        page: draft.page || '(all)',
        type: draft.type,
        captured: 0,
        tagged: true,
      },
      ...l,
    ]);
    setShowTag(false);
    setDraft({ name: '', selector: '', page: '', type: 'Click' });
    dispatch({ type: 'ADD_TOAST', msg: 'Element tagged', toastType: 'success' });
  }

  return (
    <div className="space-y-5">
      <MetricRow>
        <MetricCard label="Tagged features" value={tagged.length} hint="named and tracked" />
        <MetricCard label="Autocaptured" value={raw.length} hint="awaiting a name" />
        <MetricCard
          label="Events, 30 days"
          value={`${(events.reduce((n, e) => n + e.captured, 0) / 1000).toFixed(1)}K`}
          hint="across all accounts"
        />
        <MetricCard
          label="Page rules"
          value={rules.length}
          hint={`${rules.filter((r) => r.exclude).length} excluded`}
        />
      </MetricRow>

      <SettingsGroup>
        <div className="flex items-start justify-between gap-6 py-3.5">
          <div className="min-w-0 flex-1">
            <p className="text-body-sm font-medium text-on-surface">
              Autocapture every interaction
            </p>
            <p className="mt-0.5 max-w-prose text-caption leading-relaxed text-on-surface-subtle">
              {autocapture
                ? 'The listener records every click, form submit and page view retroactively. Tag an element later and the historical data is already there — no need to have instrumented it in advance.'
                : 'Only explicitly tagged elements are recorded. Anything you tag later starts collecting from that point on.'}
            </p>
          </div>
          <Switch checked={autocapture} onCheckedChange={setAutocapture} aria-label="Autocapture" />
        </div>
      </SettingsGroup>

      <BuilderTabs
        value={tab}
        onChange={setTab}
        items={[
          { value: 'events', label: 'Tracked events', count: events.length },
          { value: 'pages', label: 'Page rules', count: rules.length },
          { value: 'install', label: 'Install' },
        ]}
      />

      {tab === 'events' && (
        <SettingsGroup
          flush
          title="Tracked events"
          description="Give an autocaptured element a name to turn it into a feature you can report on."
          actions={
            <Button
              size="sm"
              variant="secondary"
              icon={<Plus className="size-4" strokeWidth={1.75} />}
              onClick={() => setShowTag(true)}
            >
              Tag an element
            </Button>
          }
        >
          <AdminTable
            minWidth="820px"
            columns={['Feature or element', 'Selector', 'Page', 'Type', 'Events, 30d', 'Status', '']}
          >
            {events.map((e) => (
              <Row key={e.id}>
                {e.tagged ? (
                  <NameCell>{e.name}</NameCell>
                ) : (
                  <Cell mono className="max-w-[16rem] truncate text-on-surface-faint">
                    {e.name}
                  </Cell>
                )}
                <Cell mono className="max-w-[14rem] truncate">
                  {e.selector}
                </Cell>
                <Cell>{e.page}</Cell>
                <Cell>
                  <Badge tone="neutral">{e.type}</Badge>
                </Cell>
                <Cell className="tabular-nums">{e.captured.toLocaleString()}</Cell>
                <Cell>
                  <Badge tone={e.tagged ? 'success' : 'warning'} dot>
                    {e.tagged ? 'Tagged' : 'Autocaptured'}
                  </Badge>
                </Cell>
                <Cell right>
                  {e.tagged ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEvents((l) => l.filter((x) => x.id !== e.id))}
                    >
                      Remove
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setEvents((l) =>
                          l.map((x) =>
                            x.id === e.id ? { ...x, tagged: true, name: 'Untitled feature' } : x,
                          ),
                        );
                        dispatch({
                          type: 'ADD_TOAST',
                          msg: 'Element tagged — historical events backfilled',
                          toastType: 'success',
                        });
                      }}
                    >
                      Name it
                    </Button>
                  )}
                </Cell>
              </Row>
            ))}
          </AdminTable>
        </SettingsGroup>
      )}

      {tab === 'pages' && (
        <SettingsGroup
          flush
          title="Page rules"
          description="Group URLs into named pages, or exclude them from capture entirely."
          actions={
            <Button
              size="sm"
              variant="secondary"
              icon={<Plus className="size-4" strokeWidth={1.75} />}
              onClick={() =>
                setRules((r) => [
                  ...r,
                  { id: 'pr' + (r.length + 1), name: 'New page group', match: 'starts with', value: '/', events: 0 },
                ])
              }
            >
              Add rule
            </Button>
          }
        >
          <AdminTable columns={['Page group', 'Match', 'URL', 'Events', 'Capture', '']}>
            {rules.length === 0 ? (
              <NoRows colSpan={6} message="No page rules" />
            ) : (
              rules.map((r) => (
                <Row key={r.id}>
                  <Cell>
                    <Input
                      className="w-40"
                      value={r.name}
                      onChange={(e) =>
                        setRules((l) => l.map((x) => (x.id === r.id ? { ...x, name: e.target.value } : x)))
                      }
                    />
                  </Cell>
                  <Cell>
                    <Select
                      value={r.match}
                      onValueChange={(v) =>
                        setRules((l) => l.map((x) => (x.id === r.id ? { ...x, match: v } : x)))
                      }
                      options={MATCHES.map((m) => ({ value: m, label: m }))}
                    />
                  </Cell>
                  <Cell>
                    <Input
                      className="w-40 font-mono"
                      value={r.value}
                      onChange={(e) =>
                        setRules((l) => l.map((x) => (x.id === r.id ? { ...x, value: e.target.value } : x)))
                      }
                    />
                  </Cell>
                  <Cell className="tabular-nums">{r.events}</Cell>
                  <Cell>
                    <span className="inline-flex items-center gap-2">
                      <Switch
                        checked={!r.exclude}
                        aria-label="Capture this page group"
                        onCheckedChange={(v) =>
                          setRules((l) => l.map((x) => (x.id === r.id ? { ...x, exclude: !v } : x)))
                        }
                      />
                      <span className="text-caption text-on-surface-subtle">
                        {r.exclude ? 'Excluded' : 'Capturing'}
                      </span>
                    </span>
                  </Cell>
                  <Cell right>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setRules((l) => l.filter((x) => x.id !== r.id))}
                    >
                      Remove
                    </Button>
                  </Cell>
                </Row>
              ))
            )}
          </AdminTable>
        </SettingsGroup>
      )}

      {tab === 'install' && (
        <SettingsGroup title="Install the listener">
          <div className="space-y-3 py-3.5">
            <p className="max-w-prose text-body-sm leading-relaxed text-on-surface-muted">
              Add the listener once to your application shell. It captures interactions on every
              page automatically — there is no per-feature instrumentation to maintain.
            </p>
            <CodeBlock
              code={USAGE_SNIPPET}
              onCopy={() =>
                dispatch({ type: 'ADD_TOAST', msg: 'Snippet copied to clipboard', toastType: 'success' })
              }
            />
            <div className="grid gap-2 pt-1 sm:grid-cols-3">
              {[
                ['Identify call', 'Ties events to an account and user'],
                ['Retroactive', 'Tag an element later and history is already captured'],
                ['SPA routing', 'Route changes are treated as page views'],
              ].map(([t, d]) => (
                <div key={t} className="rounded-lg bg-subtle p-2.5">
                  <p className="text-caption font-medium text-on-surface">{t}</p>
                  <p className="mt-0.5 text-caption leading-relaxed text-on-surface-subtle">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </SettingsGroup>
      )}

      <Dialog
        open={showTag}
        onOpenChange={setShowTag}
        title="Tag an element"
        description="Name an element so it becomes a reportable feature. With autocapture on, past interactions are backfilled."
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowTag(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={!draft.name.trim() || !draft.selector.trim()}
              onClick={tagDraft}
            >
              Tag element
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Field label="Feature name">
            <Input
              value={draft.name}
              placeholder="e.g. Export report clicked"
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            />
          </Field>
          <Field label="CSS selector">
            <Input
              className="font-mono"
              value={draft.selector}
              placeholder='button[data-cx="export"]'
              onChange={(e) => setDraft((d) => ({ ...d, selector: e.target.value }))}
            />
          </Field>
          <Field label="Page">
            <Input
              value={draft.page}
              placeholder="/reports"
              onChange={(e) => setDraft((d) => ({ ...d, page: e.target.value }))}
            />
          </Field>
          <Field label="Interaction type">
            <Select
              value={draft.type}
              onValueChange={(v) => setDraft((d) => ({ ...d, type: v }))}
              options={INTERACTIONS.map((o) => ({ value: o, label: o }))}
            />
          </Field>
        </div>
      </Dialog>
    </div>
  );
}
