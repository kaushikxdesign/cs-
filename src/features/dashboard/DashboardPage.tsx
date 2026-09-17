import React from 'react';
import {
  Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { ArrowRight, Clock, ListTodo, X } from 'lucide-react';
import { useApp } from '@/state/AppContext';
import { useNavigate } from '@/router';
import {
  AXIS_PROPS, Avatar, Badge, Button, Card, CardHeader, ChartCard, EmptyState, GRID_PROPS,
  IconButton, MetricCard, PageHeader, STATUS_CHART_COLORS, TOOLTIP_PROPS, Tabs,
  Tooltip as UITooltip,
} from '@/design-system';
import { HEALTH_SIGNALS, RENEWALS, USERS } from '@/data/core';
import { formatCurrency, formatDate, severityTone } from '@/lib/format';

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
      const avg = series.reduce((n, s) => n + s[i].score, 0) / series.length;
      points.push({ date: s0Date(series[0][i].date), score: Math.round(avg) });
    }
    return points;
  }, [customers]);

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

      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Managed ARR" value={formatCurrency(managedArr)} hint={`${customers.length} accounts`} />
          <MetricCard label="Revenue at risk" value={formatCurrency(atRisk)} delta={12} invertDelta hint={`${risks.length} open risks`} />
          <MetricCard label="Renewals in 30 days" value={upcoming.length} hint={formatCurrency(upcoming.reduce((n: number, r: any) => n + r.arr, 0))} />
          <MetricCard label="Expansion potential" value={formatCurrency(expansion)} hint={`${opps.length} opportunities`} />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="xl:col-span-2 space-y-4">
            <ChartCard title="Portfolio health" description="Average composite score across your accounts">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={trend} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                  <CartesianGrid {...GRID_PROPS} />
                  <XAxis dataKey="date" {...AXIS_PROPS} />
                  <YAxis domain={[0, 100]} {...AXIS_PROPS} />
                  <Tooltip {...TOOLTIP_PROPS} />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
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
              <div className="border-t border-border-default">
                {priority.length === 0 ? (
                  <EmptyState title="Nothing needs attention" description="No open risks in your portfolio." />
                ) : (
                  <ul className="divide-y divide-border-default">
                    {priority.map((r) => (
                      <li key={r.id} className="flex items-center gap-3 px-4 py-3">
                        <Badge tone={severityTone(r.severity)}>{r.severity}</Badge>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-body-sm font-medium text-on-surface">
                            {customersById[r.customerId]?.name}
                          </p>
                          <p className="truncate text-caption text-on-surface-subtle">{r.title}</p>
                        </div>
                        <span className="shrink-0 text-body-sm text-on-surface-muted tabular-nums">
                          {formatCurrency(r.amountAtRisk)}
                        </span>
                        <span className="flex shrink-0 items-center gap-1">
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
                <BarChart data={bandCounts} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
                  <CartesianGrid {...GRID_PROPS} />
                  <XAxis dataKey="name" {...AXIS_PROPS} />
                  <YAxis allowDecimals={false} {...AXIS_PROPS} />
                  <Tooltip {...TOOLTIP_PROPS} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
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
                <EmptyState icon={<ListTodo className="size-6" strokeWidth={1.5} />} title="Nothing here" description="No tasks in this state." />
              ) : (
                <ul className="divide-y divide-border-default">
                  {visibleTasks.map((t) => (
                    <li key={t.id} className="flex items-start gap-2 px-4 py-2.5">
                      <Avatar name={USERS[t.ownerId]?.name} size="sm" className="mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-body-sm text-on-surface">{t.title}</p>
                        {t.dueDate && <p className="mt-0.5 text-caption text-on-surface-subtle">Due {formatDate(t.dueDate)}</p>}
                      </div>
                    </li>
                  ))}
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
