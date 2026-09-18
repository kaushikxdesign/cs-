import React from 'react';
import { HeartPulse, TrendingDown, TrendingUp } from 'lucide-react';
import {
  Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis,
} from 'recharts';
import { cn } from '@/lib/cn';
import { useApp } from '@/state/AppContext';
import { useNavigate } from '@/router';
import {
  AXIS_PROPS, Avatar, Badge, Card, CardHeader, DataTable, EmptyState, GRID_PROPS, MetricCard, PageHeader,
  SegmentedControl, TOOLTIP_PROPS, type Column,
} from '@/design-system';
import { HEALTH_SIGNALS, USERS } from '@/data/core';
import { formatCurrency, healthTone, titleCase } from '@/lib/format';

type BandFilter = 'all' | 'red' | 'yellow' | 'green';

interface Row {
  id: string; name: string; arr: number; segment: string; ownerId: string; healthId: string;
}

export function HealthBoardPage() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [band, setBand] = React.useState<BandFilter>('all');

  const customers = React.useMemo(() => (state.customers ?? []) as Row[], [state.customers]);
  const healthOf = (c: Row) => HEALTH_SIGNALS[c.healthId];

  const counts = React.useMemo(() => {
    const c = { red: 0, yellow: 0, green: 0 };
    for (const cust of customers) {
      const b = healthOf(cust)?.band;
      if (b === 'red') c.red++;
      else if (b === 'yellow') c.yellow++;
      else if (b === 'green') c.green++;
    }
    return c;
  }, [customers]);

  const distribution = [
    { name: 'At risk', count: counts.red, fill: 'var(--band-risk)' },
    { name: 'Needs attention', count: counts.yellow, fill: 'var(--band-watch)' },
    { name: 'Healthy', count: counts.green, fill: 'var(--band-good)' },
  ];

  const rows = React.useMemo(
    () => customers.filter((c) => band === 'all' || healthOf(c)?.band === band),
    [customers, band],
  );

  const columns: Column<Row>[] = [
    {
      key: 'name',
      header: 'Account',
      sortValue: (c) => c.name,
      render: (c) => (
        <span className="flex items-center gap-2">
          <Avatar name={c.name} size="md" />
          <span className="font-medium text-on-surface">{c.name}</span>
        </span>
      ),
    },
    {
      key: 'score',
      header: 'Score',
      sortValue: (c) => healthOf(c)?.compositeScore ?? 0,
      render: (c) => {
        const h = healthOf(c);
        if (!h) return <span className="text-on-surface-subtle">—</span>;
        const delta = h.compositeScore - (h.previousScore ?? h.compositeScore);
        const Trend = delta < 0 ? TrendingDown : TrendingUp;
        return (
          <span className="flex items-center gap-2">
            <Badge tone={healthTone(h.band)} dot>
              {h.compositeScore}
            </Badge>
            {delta !== 0 && (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 text-caption tabular-nums',
                  delta < 0 ? 'text-danger-fg' : 'text-success-fg',
                )}
              >
                <Trend className="size-3" strokeWidth={2} />
                {Math.abs(delta)}
              </span>
            )}
          </span>
        );
      },
    },
    {
      key: 'drivers',
      header: 'Weakest driver',
      render: (c) => {
        const dims = healthOf(c)?.dimensions ?? [];
        if (!dims.length) return <span className="text-on-surface-subtle">—</span>;
        const worst = [...dims].sort((a: any, b: any) => a.effectiveScore - b.effectiveScore)[0];
        return (
          <span className="text-on-surface-muted">
            {worst.label}
            <span className="ml-1.5 tabular-nums text-on-surface-subtle">{worst.effectiveScore}</span>
          </span>
        );
      },
    },
    { key: 'segment', header: 'Segment', sortValue: (c) => c.segment, render: (c) => titleCase(c.segment) },
    {
      key: 'owner',
      header: 'Owner',
      sortValue: (c) => USERS[c.ownerId]?.name ?? '',
      render: (c) => USERS[c.ownerId]?.name ?? '—',
    },
    { key: 'arr', header: 'ARR', align: 'right', sortValue: (c) => c.arr, render: (c) => formatCurrency(c.arr) },
  ];

  const redArr = customers
    .filter((c) => healthOf(c)?.band === 'red')
    .reduce((n, c) => n + (c.arr ?? 0), 0);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader
        title="Health board"
        meta={<span>{customers.length} accounts scored</span>}
      />
      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MetricCard label="Total accounts" value={customers.length} />
          <MetricCard label="At risk" value={counts.red} hint={`${formatCurrency(redArr)} ARR`} />
          <MetricCard label="Needs attention" value={counts.yellow} />
          <MetricCard label="Healthy" value={counts.green} />
        </div>

        <Card className="mt-4">
          <CardHeader title="Distribution by band" />
          <div className="px-2 py-3">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={distribution} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid {...GRID_PROPS} />
                <XAxis dataKey="name" {...AXIS_PROPS} />
                <YAxis width={36} allowDecimals={false} {...AXIS_PROPS} />
                <RTooltip {...TOOLTIP_PROPS} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {distribution.map((d) => (
                    <Cell key={d.name} fill={d.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="mt-4 flex items-center justify-between gap-3">
          <h3 className="text-body-sm font-semibold text-on-surface">Accounts</h3>
          <SegmentedControl
            value={band}
            onChange={setBand}
            options={[
              { value: 'all', label: 'All' },
              { value: 'red', label: 'At risk' },
              { value: 'yellow', label: 'Watch' },
              { value: 'green', label: 'Healthy' },
            ]}
          />
        </div>

        <div className="mt-2 overflow-hidden rounded-xl border border-border-default bg-surface">
          <DataTable
            density={state.tableDensity}
            rows={rows}
            columns={columns}
            rowKey={(c) => c.id}
            onRowClick={(c) => navigate(`/customers/${c.id}`)}
            empty={
              <EmptyState
                icon={<HeartPulse className="size-6" strokeWidth={1.5} />}
                title="No accounts in this band"
                description="Try a different health filter."
              />
            }
          />
        </div>
      </div>
    </div>
  );
}
