import React from 'react';
import {
  Activity, AlertTriangle, ArrowUpRight, CalendarDays, Crosshair, Mail, ShieldCheck, Ticket,
  TrendingUp, Users,
} from 'lucide-react';
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis,
} from 'recharts';
import { cn } from '@/lib/cn';
import { customerOverview } from '@/lib/copilot';
import { NextBestActions } from '@/features/assistant/AiOverview';
import { useApp } from '@/state/AppContext';
import { useNavigate, useParams } from '@/router';
import {
  AXIS_PROPS, Avatar, Badge, Button, Card, EmptyState, GRID_PROPS, MetricRow, PageHeader,
  TOOLTIP_PROPS, Tabs,
} from '@/design-system';
import { CONTACTS, GOALS, HEALTH_SIGNALS, MEETINGS, TICKETS, USERS } from '@/data/core';
import { formatCurrency, formatDate, healthTone, severityTone, titleCase } from '@/lib/format';
import { AccountPanel } from './AccountPanel';

type TabId = 'overview' | 'health' | 'goals' | 'contacts' | 'activity';

/** A titled block of content. One pattern, used by every tab. */
function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-border-default bg-surface">
      <div className="flex h-11 items-center justify-between gap-3 px-4">
        <h3 className="truncate text-body font-semibold text-on-surface">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

const BAND_LABEL: Record<string, string> = { green: 'Healthy', yellow: 'Needs attention', red: 'At risk' };
const bandLabel = (b?: string) => BAND_LABEL[b ?? ''] ?? 'Not scored';

function Stat({
  label, value, hint, tone,
}: { label: string; value: React.ReactNode; hint?: string; tone?: string }) {
  return (
    <Card className="px-4 py-3.5">
      <p className="text-caption font-medium text-on-surface-muted">{label}</p>
      <p
        className={cn(
          'mt-1.5 text-title-lg font-semibold tracking-tight tabular-nums',
          tone === 'danger' ? 'text-danger-fg' : 'text-on-surface',
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-1 truncate text-caption text-on-surface-subtle">{hint}</p>}
    </Card>
  );
}

export function Customer360Page() {
  const { state } = useApp();
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = React.useState<TabId>('overview');

  const customer = (state.customers ?? []).find((c: any) => c.id === customerId);
  // Above the not-found return, so the hook order never changes.
  const copilot = React.useMemo(
    () => (customerId ? customerOverview(state, customerId) : null),
    [state, customerId],
  );

  if (!customer) {
    return (
      <EmptyState
        icon={<AlertTriangle className="size-6" strokeWidth={1.5} />}
        title="Account not found"
        description="That account does not exist, or is not in your portfolio."
        action={{ label: 'Back to accounts', onClick: () => navigate('/customers') }}
      />
    );
  }

  const health = HEALTH_SIGNALS[customer.healthId];
  const risks = Object.values(state.risks ?? {}).filter(
    (r: any) => r.customerId === customer.id && r.status !== 'resolved',
  ) as any[];
  const opps = Object.values(state.expansionOpps ?? {}).filter(
    (o: any) => o.customerId === customer.id,
  ) as any[];
  const goals = Object.values(state.goals ?? GOALS).filter(
    (g: any) => g.customerId === customer.id,
  ) as any[];
  const contacts = Object.values(CONTACTS).filter(
    (c: any) => c.customerId === customer.id,
  ) as any[];
  const tickets = TICKETS.filter((t: any) => t.customerId === customer.id);
  const meetings = MEETINGS.filter((m: any) => m.customerId === customer.id);
  const openTickets = tickets.filter((t: any) => t.status !== 'resolved');
  const owner = USERS[customer.ownerId];

  const history = (health?.history ?? []).map((h: any) => ({
    date: new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: h.score,
  }));

  return (
    <div className="flex h-full min-h-0">
      <div className="flex min-w-0 flex-1 flex-col">
        <PageHeader
          breadcrumbs={[
            { label: 'Customers', onClick: () => navigate('/customers') },
            { label: customer.name },
          ]}
          title={
            <span className="flex items-center gap-2.5">
              <Avatar name={customer.name} size="lg" />
              {customer.name}
            </span>
          }
          meta={
            <>
              {health && (
                <Badge tone={healthTone(health.band)} dot>
                  {health.compositeScore}
                </Badge>
              )}
              <span>{formatCurrency(customer.arr)} ARR</span>
              <span aria-hidden>·</span>
              <span>Renews {formatDate(customer.renewalDate)}</span>
              {owner && (
                <>
                  <span aria-hidden>·</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Avatar name={owner.name} size="xs" />
                    {owner.name}
                  </span>
                </>
              )}
            </>
          }
          actions={
            <Button
              variant="solid"
              size="sm"
              icon={<ArrowUpRight className="size-4" strokeWidth={1.75} />}
              onClick={() => navigate(`/portal-preview/${customer.id}`)}
            >
              Customer portal
            </Button>
          }
          tabs={
            <Tabs
              value={tab}
              onChange={(v) => setTab(v as TabId)}
              items={[
                { value: 'overview', label: 'Overview' },
                { value: 'health', label: 'Health' },
                { value: 'goals', label: 'Goals', count: goals.length },
                { value: 'contacts', label: 'Contacts', count: contacts.length },
                { value: 'activity', label: 'Activity', count: tickets.length + meetings.length },
              ]}
            />
          }
        />

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {tab === 'overview' && (
            <div className="space-y-4">
              {/* One label per number. The first pass wrapped each of these in
                  a titled panel as well, so "Health / Composite / 30" spent
                  three lines saying one thing. */}
              {copilot && copilot.actions.length > 0 && (
                <NextBestActions actions={copilot.actions} onNavigate={navigate} />
              )}

              <MetricRow>
                <Stat
                  label="Health score"
                  value={health ? health.compositeScore : '—'}
                  hint={health ? bandLabel(health.band) : 'Not scored'}
                  tone={health?.band === 'red' ? 'danger' : undefined}
                />
                <Stat
                  label="Risk exposure"
                  value={formatCurrency(risks.reduce((n, r) => n + (r.amountAtRisk ?? 0), 0))}
                  hint={risks.length ? `${risks.length} open` : 'None open'}
                  tone={risks.length ? 'danger' : undefined}
                />
                <Stat
                  label="Expansion potential"
                  value={formatCurrency(opps.reduce((n, o) => n + (o.estimatedArr ?? 0), 0))}
                  hint={opps.length ? `${opps.length} signal${opps.length === 1 ? '' : 's'}` : 'No signals'}
                />
                <Stat
                  label="Open tickets"
                  value={tickets.filter((t: any) => t.status !== 'resolved').length}
                  hint={`${tickets.length} all time`}
                />
              </MetricRow>

              <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-3">
                <div className="space-y-4 xl:col-span-2">
                  <Section title="Open risks">
                    {risks.length === 0 ? (
                      <EmptyState compact icon={<ShieldCheck className="size-5" strokeWidth={1.5} />} title="No open risks" description="Nothing is flagged on this account." />
                    ) : (
                      <ul className="divide-y divide-border-default">
                        {risks.map((r) => (
                          <li key={r.id} className="flex items-center gap-3 px-4 py-2.5">
                            <Badge tone={severityTone(r.severity)}>{r.severity}</Badge>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-body-sm font-medium text-on-surface">{r.title}</p>
                              <p className="truncate text-caption text-on-surface-subtle">{titleCase(r.category)}</p>
                            </div>
                            <span className="shrink-0 text-body-sm tabular-nums text-on-surface-muted">
                              {formatCurrency(r.amountAtRisk)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </Section>

                  <Section
                    title="Expansion signals"
                    action={
                      <Button size="xs" variant="ghost" onClick={() => navigate('/expansion')}>
                        View all
                      </Button>
                    }
                  >
                    {opps.length === 0 ? (
                      <EmptyState compact icon={<TrendingUp className="size-5" strokeWidth={1.5} />} title="No expansion signals" description="Nothing detected on this account yet." />
                    ) : (
                      <ul className="divide-y divide-border-default">
                        {opps.map((o) => (
                          <li key={o.id} className="flex items-center gap-3 px-4 py-2.5">
                            <TrendingUp className="size-4 shrink-0 text-success-solid" strokeWidth={1.75} />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-body-sm font-medium text-on-surface">{o.headline}</p>
                              <p className="truncate text-caption text-on-surface-subtle">{titleCase(o.type)}</p>
                            </div>
                            <span className="shrink-0 text-body-sm tabular-nums text-on-surface-muted">
                              {formatCurrency(o.estimatedArr)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </Section>

                  <Section
                    title="Open support"
                    action={
                      <Button size="xs" variant="ghost" onClick={() => setTab('activity')}>
                        View all
                      </Button>
                    }
                  >
                    {openTickets.length === 0 ? (
                      <EmptyState compact icon={<Ticket className="size-5" strokeWidth={1.5} />} title="No open tickets" description="Nothing outstanding for this account." />
                    ) : (
                      <ul className="divide-y divide-border-default">
                        {openTickets.slice(0, 5).map((t: any) => (
                          <li key={t.id} className="flex items-center gap-3 px-4 py-2.5">
                            <Ticket className="size-4 shrink-0 text-on-surface-faint" strokeWidth={1.75} />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-body-sm font-medium text-on-surface">{t.subject}</p>
                              <p className="truncate text-caption text-on-surface-subtle">
                                {t.id} · {titleCase(t.status)}
                              </p>
                            </div>
                            {t.priority && <Badge tone={severityTone(t.priority)}>{t.priority}</Badge>}
                          </li>
                        ))}
                      </ul>
                    )}
                  </Section>
                </div>

                <div className="space-y-4">
                <Section title="Active goals">
                  {goals.length === 0 ? (
                    <EmptyState compact icon={<Crosshair className="size-5" strokeWidth={1.5} />} title="No goals" description="No success plan on this account." />
                  ) : (
                    <ul className="divide-y divide-border-default">
                      {goals.slice(0, 6).map((g) => (
                        <li key={g.id}>
                          <button
                            onClick={() => navigate(`/goals/${g.id}`)}
                            className="flex w-full items-start gap-2.5 px-4 py-2.5 text-left transition-colors duration-[120ms] hover:bg-hover"
                          >
                            <Crosshair className="mt-0.5 size-4 shrink-0 text-accent" strokeWidth={1.75} />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-body-sm font-medium text-on-surface">
                                {g.title}
                              </span>
                              <span className="mt-0.5 block text-caption text-on-surface-subtle">
                                {titleCase(g.status)}
                              </span>
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </Section>

                <Section
                  title="Key contacts"
                  action={
                    <Button size="xs" variant="ghost" onClick={() => setTab('contacts')}>
                      View all
                    </Button>
                  }
                >
                  {contacts.length === 0 ? (
                    <EmptyState compact icon={<Users className="size-5" strokeWidth={1.5} />} title="No contacts" description="Nobody mapped on this account." />
                  ) : (
                    <ul className="divide-y divide-border-default">
                      {contacts.slice(0, 4).map((c: any) => (
                        <li key={c.id} className="flex items-center gap-2.5 px-4 py-2.5">
                          <Avatar name={c.name} size="md" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-body-sm font-medium text-on-surface">{c.name}</p>
                            <p className="truncate text-caption text-on-surface-subtle">{c.title ?? c.role}</p>
                          </div>
                          {c.isChampion && <Badge tone="success">Champion</Badge>}
                        </li>
                      ))}
                    </ul>
                  )}
                </Section>
                </div>
              </div>
            </div>
          )}

          {tab === 'health' && (
            <div className="space-y-4">
              <Section title="Composite score, last 90 days">
                <div className="px-2 py-3">
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={history} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                      <defs>
                        <linearGradient id="healthFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.25} />
                          <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid {...GRID_PROPS} />
                      <XAxis dataKey="date" {...AXIS_PROPS} interval="preserveStartEnd" minTickGap={40} />
                      <YAxis width={36} domain={[0, 100]} {...AXIS_PROPS} />
                      <RTooltip {...TOOLTIP_PROPS} />
                      <Area
                        type="monotone"
                        dataKey="score"
                        stroke="var(--chart-1)"
                        strokeWidth={2}
                        fill="url(#healthFill)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Section>

              <Section title="What drives the score">
                <ul className="divide-y divide-border-default">
                  {(health?.dimensions ?? []).map((d: any) => (
                    <li key={d.key} className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Activity className="size-4 shrink-0 text-on-surface-subtle" strokeWidth={1.75} />
                        <span className="min-w-0 flex-1 truncate text-body-sm font-medium text-on-surface">
                          {d.label}
                        </span>
                        <span className="shrink-0 text-caption text-on-surface-subtle">
                          {Math.round(d.weight * 100)}% weight
                        </span>
                        <span className="w-10 shrink-0 text-right text-body-sm tabular-nums text-on-surface">
                          {d.effectiveScore}
                        </span>
                      </div>
                      {(d.evidence ?? []).map((e: any) => (
                        <p key={e.id} className="mt-1.5 pl-7 text-caption text-on-surface-subtle">
                          <span className="font-medium text-on-surface-muted">{e.label}</span> — {e.detail}
                        </p>
                      ))}
                    </li>
                  ))}
                </ul>
              </Section>
            </div>
          )}

          {tab === 'goals' && (
            <Section title="Success plan">
              {goals.length === 0 ? (
                <EmptyState compact icon={<Crosshair className="size-5" strokeWidth={1.5} />} title="No goals yet" description="Create a goal to start a success plan." />
              ) : (
                <ul className="divide-y divide-border-default">
                  {goals.map((g) => (
                    <li key={g.id}>
                      <button
                        onClick={() => navigate(`/goals/${g.id}`)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-[120ms] hover:bg-hover"
                      >
                        <Crosshair className="size-4 shrink-0 text-accent" strokeWidth={1.75} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-body-sm font-medium text-on-surface">
                            {g.title}
                          </span>
                          {g.description && (
                            <span className="mt-0.5 block truncate text-caption text-on-surface-subtle">
                              {g.description}
                            </span>
                          )}
                        </span>
                        <Badge tone="neutral">{titleCase(g.status)}</Badge>
                        <span className="w-24 shrink-0 text-right text-caption tabular-nums text-on-surface-subtle">
                          {formatDate(g.dueDate)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          )}

          {tab === 'contacts' && (
            <Section title="Contacts">
              {contacts.length === 0 ? (
                <EmptyState
                  icon={<Users className="size-6" strokeWidth={1.5} />}
                  title="No contacts"
                  description="No people are mapped to this account."
                />
              ) : (
                <ul className="divide-y divide-border-default">
                  {contacts.map((c) => (
                    <li key={c.id} className="flex items-center gap-3 px-4 py-2.5">
                      <Avatar name={c.name} size="lg" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-body-sm font-medium text-on-surface">{c.name}</p>
                        <p className="truncate text-caption text-on-surface-subtle">{c.role}</p>
                      </div>
                      <Badge tone={c.sentiment === 'negative' ? 'danger' : c.sentiment === 'positive' ? 'success' : 'neutral'}>
                        {c.engagement}
                      </Badge>
                      <a
                        href={`mailto:${c.email}`}
                        className="inline-flex items-center gap-1.5 text-caption text-on-surface-subtle hover:text-on-surface"
                      >
                        <Mail className="size-3.5" strokeWidth={1.75} />
                        {c.email}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          )}

          {tab === 'activity' && (
            <div className="space-y-4">
              <Section title="Support tickets">
                {tickets.length === 0 ? (
                  <EmptyState compact title="No tickets" description="This account has raised none." />
                ) : (
                  <ul className="divide-y divide-border-default">
                    {tickets.map((t: any) => (
                      <li key={t.id}>
                        <button
                          onClick={() => navigate(`/tickets?ticket=${t.id}`)}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors duration-[120ms] hover:bg-hover"
                        >
                          <Ticket className="size-4 shrink-0 text-on-surface-subtle" strokeWidth={1.75} />
                          <span className="min-w-0 flex-1 truncate text-body-sm text-on-surface">
                            {t.subject}
                          </span>
                          <Badge tone={severityTone(t.severity)}>{t.severity}</Badge>
                          <span className="w-16 shrink-0 text-right text-caption tabular-nums text-on-surface-subtle">
                            {t.age}d
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </Section>

              <Section title="Meetings">
                {meetings.length === 0 ? (
                  <EmptyState compact title="No meetings" description="Nothing logged for this account." />
                ) : (
                  <ul className="divide-y divide-border-default">
                    {meetings.map((m: any) => (
                      <li key={m.id} className="flex items-center gap-3 px-4 py-2.5">
                        <CalendarDays className="size-4 shrink-0 text-on-surface-subtle" strokeWidth={1.75} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-body-sm font-medium text-on-surface">{m.title}</p>
                          <p className="truncate text-caption text-on-surface-subtle">{m.summary}</p>
                        </div>
                        <span className="w-24 shrink-0 text-right text-caption tabular-nums text-on-surface-subtle">
                          {formatDate(m.date)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Section>
            </div>
          )}
        </div>
      </div>

      <AccountPanel
        customer={customer}
        health={health}
        riskCount={risks.length}
        goalCount={goals.length}
        contactCount={contacts.length}
      />
    </div>
  );
}
