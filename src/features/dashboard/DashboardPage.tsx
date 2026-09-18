import React from 'react';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { ArrowRight, Clock, ListTodo, X } from 'lucide-react';
import { useApp } from '@/state/AppContext';
import { useNavigate } from '@/router';
import {
  AXIS_PROPS, BAR_PROPS, Button, Card, CardHeader, ChartCard, EmptyState, GRID_PROPS,
  IconButton, LINE_PROPS, MetricCard, PageHeader, STATUS_CHART_COLORS, TOOLTIP_PROPS, Tabs,
  Tooltip as UITooltip,
} from '@/design-system';
import { cn } from '@/lib/cn';
import { HEALTH_SIGNALS, RENEWALS, USERS } from '@/data/core';
import { formatCurrency, formatDate, severityTone } from '@/lib/format';
import { daysFromToday } from '@/lib/demoDate';

const SEVERITY_RAIL: Record<string, string> = {
  danger: 'bg-danger-solid',
  warning: 'bg-warning-solid',
  info: 'bg-info-solid',
  neutral: 'bg-border-strong',
  success: 'bg-success-solid',
  accent: 'bg-accent',
};

const BANDS = [
  { key: 'green', label: 'Healthy', fill: STATUS_CHART_COLORS.success },
  { key: 'yellow', label: 'Watch', fill: STATUS_CHART_COLORS.warning },
  { key: 'red', label: 'At risk', fill: STATUS_CHART_COLORS.danger },
];

export function DashboardPage() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [taskTab, setTaskTab] = React.useState('todo');

  const customers = React.useMemo(() => state.customers ?? [], [state.customers]);
  const risks = Object.values(state.risks ?? {}) as any[];
  const opps = Object.values(state.expansionOpps ?? {}) as any[];
  const tasks = Object.values(state.tasks ?? {}) as any[];

  const managedArr = customers.reduce((n: number, c: any) => n + (c.arr ?? 0), 0);
  const atRisk = risks.reduce((n, r) => n + (r.amountAtRisk ?? 0), 0);
  const expansion = opps.reduce((n, o) => n + (o.estimatedArr ?? 0), 0);
  const upcoming = (state.renewals ?? RENEWALS).filter((r: any) => r.daysRemaining <= 30);

  const bandCounts = React.useMemo(
    () =>
      BANDS.map((b) => ({
        name: b.label,
        fill: b.fill,
        count: customers.filter((c: any) => HEALTH_SIGNALS[c.healthId]?.band === b.key).length,
      })),
    [customers],
  );

  // Portfolio-average health over the window the mock history covers.
  const trend = React.useMemo(() => {
    const series = customers
      .map((c: any) => HEALTH_SIGNALS[c.healthId]?.history)
      .filter(Boolean) as Array<Array<{ date: string; score: number }>>;
    if (!series.length) return [];
    const len = Math.min(...series.map((s) => s.length));
    const step = Math.max(1, Math.floor(len / 12));
    const points: Array<{ date: string; score: number }> = [];
    for (let i = 0; i < len; i += step) {
      // Skip any index where a series is missing a reading: one gap turned
      // the whole average into NaN and the line simply stopped half way
      // across the panel with the axis still running to the right edge.
      const scores = series.map((sr) => sr[i]?.score).filter((n) => Number.isFinite(n)) as number[];
      if (!scores.length) continue;
      const avg = scores.reduce((n, v) => n + v, 0) / scores.length;
      points.push({ date: s0Date(series[0][i].date), score: Math.round(avg) });
    }
    return points;
  }, [customers]);

  /* Pad the observed range by a couple of points and snap to fives, so the
     line sits in the middle of the panel and a real movement is visible. */
  const yDomain = React.useMemo<[number, number]>(() => {
    if (!trend.length) return [0, 100];
    const vals = trend.map((p) => p.score);
    const lo = Math.max(0, Math.floor((Math.min(...vals) - 6) / 5) * 5);
    const hi = Math.min(100, Math.ceil((Math.max(...vals) + 6) / 5) * 5);
    return [lo, hi];
  }, [trend]);

  const hidden = React.useMemo(
    () => new Set([...(state.dismissedPriority ?? []), ...(state.snoozedPriority ?? [])]),
    [state.dismissedPriority, state.snoozedPriority],
  );

  const priority = React.useMemo(
    () =>
      risks
        .filter((r) => r.status !== 'resolved' && !hidden.has(r.id))
        .sort((a, b) => (b.amountAtRisk ?? 0) - (a.amountAtRisk ?? 0))
        .slice(0, 4),
    [risks, hidden],
  );

  // The mock data uses two spellings for each end state.
  const PENDING = ['todo', 'not_started'];
  const FINISHED = ['done', 'completed'];
  const inBucket = (t: any, bucket: string) =>
    bucket === 'todo'
      ? PENDING.includes(t.status)
      : bucket === 'doing'
        ? t.status === 'in_progress'
        : FINISHED.includes(t.status);

  const visibleTasks = tasks.filter((t) => inBucket(t, taskTab)).slice(0, 5);

  const customersById = Object.fromEntries(customers.map((c: any) => [c.id, c]));

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader
        title={`Good morning, ${USERS[state.activeUser]?.name?.split(' ')[0] ?? 'there'}`}
        meta={<span>Here's what changed across your portfolio.</span>}
        actions={
          <Button variant="solid" onClick={() => navigate("/work")}>
            Go to my work
          </Button>
        }
      />

      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Managed ARR" value={formatCurrency(managedArr)} hint={`${customers.length} accounts`} />
          <MetricCard label="Revenue at risk" value={formatCurrency(atRisk)} delta={12} invertDelta hint={`${risks.length} open risks`} />
          <MetricCard label="Renewals in 30 days" value={upcoming.length} hint={formatCurrency(upcoming.reduce((n: number, r: any) => n + r.arr, 0))} />
          <MetricCard label="Expansion potential" value={formatCurrency(expansion)} hint={`${opps.length} opportunities`} />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="xl:col-span-2 space-y-4">
            <ChartCard title="Portfolio health" description="Average composite score, last 90 days">
              <ResponsiveContainer width="100%" height={188}>
                <AreaChart data={trend} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="dashHealth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.18} />
                      <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...GRID_PROPS} />
                  <XAxis dataKey="date" {...AXIS_PROPS} minTickGap={24} />
                  {/* Framed to the data, not to the theoretical 0–100 range:
                      a flat line pinned to the floor of an empty panel says
                      nothing about a portfolio that moved four points. */}
                  <YAxis domain={yDomain} width={32} tickCount={5} {...AXIS_PROPS} />
                  <Tooltip {...TOOLTIP_PROPS} />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="var(--chart-1)"
                    fill="url(#dashHealth)"
                    {...LINE_PROPS}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <Card>
              <CardHeader
                title="Priority queue"
                description="Ranked by revenue exposure"
                actions={
                  <Button size="sm" variant="ghost" iconRight={<ArrowRight className="size-4" strokeWidth={1.5} />} onClick={() => navigate('/risks')}>
                    View all
                  </Button>
                }
              />
              <div>
                {priority.length === 0 ? (
                  <EmptyState compact title="Nothing needs attention" description="No open risks in your portfolio." />
                ) : (
                  <ul className="divide-y divide-border-default border-t border-border-default">
                    {priority.map((r) => (
                      <li key={r.id} className="group flex items-center gap-3 px-4 py-2.5 transition-colors duration-[120ms] hover:bg-hover">
                        {/* Severity as a coloured rail rather than a pill: it
                            qualifies the row, it is not a value in it. */}
                        <span
                          aria-label={r.severity}
                          className={cn('h-8 w-0.5 shrink-0 rounded-full', SEVERITY_RAIL[severityTone(r.severity)])}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-body-sm font-medium text-on-surface">
                            {customersById[r.customerId]?.name}
                          </p>
                          <p className="truncate text-caption text-on-surface-subtle">{r.title}</p>
                        </div>
                        <span className="shrink-0 text-body-sm font-medium text-on-surface tabular-nums">
                          {formatCurrency(r.amountAtRisk)}
                        </span>
                        <span className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity duration-[120ms] group-hover:opacity-100 group-focus-within:opacity-100">
                          <UITooltip label="Snooze" side="top">
                            <IconButton
                              label="Snooze"
                              size="sm"
                              onClick={() => dispatch({ type: 'SNOOZE_PRIORITY', itemId: r.id })}
                            >
                              <Clock className="size-4" strokeWidth={1.75} />
                            </IconButton>
                          </UITooltip>
                          <UITooltip label="Dismiss" side="top">
                            <IconButton
                              label="Dismiss"
                              size="sm"
                              onClick={() => dispatch({ type: 'DISMISS_PRIORITY', itemId: r.id })}
                            >
                              <X className="size-4" strokeWidth={1.75} />
                            </IconButton>
                          </UITooltip>
                          <Button size="sm" variant="secondary" onClick={() => navigate(`/customers/${r.customerId}`)}>
                            Open
                          </Button>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <ChartCard title="Health distribution" description="Accounts by band">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={bandCounts} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid {...GRID_PROPS} />
                  <XAxis dataKey="name" {...AXIS_PROPS} />
                  <YAxis allowDecimals={false} width={28} {...AXIS_PROPS} />
                  <Tooltip {...TOOLTIP_PROPS} />
                  <Bar dataKey="count" {...BAR_PROPS}>
                    {bandCounts.map((b) => (
                      <Cell key={b.name} fill={b.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <Card>
              <CardHeader title="My tasks" />
              <div className="px-4">
                <Tabs
                  value={taskTab}
                  onChange={setTaskTab}
                  items={[
                    { value: 'todo', label: 'To do', count: tasks.filter((t) => inBucket(t, 'todo')).length },
                    { value: 'doing', label: 'In progress', count: tasks.filter((t) => inBucket(t, 'doing')).length },
                    { value: 'done', label: 'Done', count: tasks.filter((t) => inBucket(t, 'done')).length },
                  ]}
                />
              </div>
              {visibleTasks.length === 0 ? (
                <EmptyState compact icon={<ListTodo className="size-5" strokeWidth={1.5} />} title="Nothing here" description="No tasks in this state." />
              ) : (
                <ul className="divide-y divide-border-default">
                  {visibleTasks.map((t) => {
                    const overdue = t.dueDate ? daysFromToday(t.dueDate) < 0 : false;
                    return (
                      <li key={t.id} className="flex items-start gap-2.5 px-4 py-2.5">
                        {/* This is *my* task list, so an avatar of me on every
                            row is five repetitions of a fact the panel title
                            already states. The dot carries urgency instead. */}
                        <span
                          aria-hidden
                          className={cn(
                            'mt-1.5 size-1.5 shrink-0 rounded-full',
                            overdue ? 'bg-danger-solid' : 'bg-border-strong',
                          )}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-body-sm text-on-surface">{t.title}</p>
                          {t.dueDate && (
                            <p
                              className={cn(
                                'mt-0.5 text-caption',
                                overdue ? 'font-medium text-danger-fg' : 'text-on-surface-subtle',
                              )}
                            >
                              {overdue ? 'Overdue — ' : 'Due '}
                              {formatDate(t.dueDate)}
                            </p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

/** History dates are ISO; the axis only needs month + day. */
function s0Date(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
