import React from 'react';
import { ShieldCheck, TrendingUp, Users } from 'lucide-react';
import {
  Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis,
} from 'recharts';
import { useApp } from '@/state/AppContext';
import { useNavigate } from '@/router';
import {
  AXIS_PROPS, Avatar, Badge, DataTable, EmptyState, GRID_PROPS, MetricCard, PageHeader,
  TOOLTIP_PROPS, type Column,
} from '@/design-system';
import { HEALTH_SIGNALS, RENEWALS, USERS } from '@/data/core';
import { formatCurrency, healthTone } from '@/lib/format';

interface OwnerRow {
  id: string;
  name: string;
  accounts: number;
  arr: number;
  atRisk: number;
  red: number;
  covered: number;
}

/** Portfolio rolled up per CSM — the manager's actual unit of work. */
function useOwnerRollup() {
  const { state } = useApp();
  return React.useMemo(() => {
    const customers = state.customers ?? [];
    const risks = Object.values(state.risks ?? {}) as any[];
    const byOwner = new Map<string, OwnerRow>();

    for (const c of customers) {
      const owner = USERS[c.ownerId];
      if (!owner) continue;
      const row =
        byOwner.get(owner.id) ??
        { id: owner.id, name: owner.name, accounts: 0, arr: 0, atRisk: 0, red: 0, covered: 0 };
      row.accounts += 1;
      row.arr += c.arr ?? 0;
      if (HEALTH_SIGNALS[c.healthId]?.band === 'red') row.red += 1;
      byOwner.set(owner.id, row);
    }

    for (const r of risks) {
      if (r.status === 'resolved') continue;
      const cust = customers.find((c: any) => c.id === r.customerId);
      const row = cust ? byOwner.get(cust.ownerId) : undefined;
      if (!row) continue;
      row.atRisk += r.amountAtRisk ?? 0;
      if (r.mitigationGoalId) row.covered += r.amountAtRisk ?? 0;
    }

    return [...byOwner.values()].sort((a, b) => b.arr - a.arr);
  }, [state.customers, state.risks]);
}

export function ManagerDashboardPage() {
  const { state } = useApp();
  const navigate = useNavigate();
  const owners = useOwnerRollup();

  const totalArr = owners.reduce((n, o) => n + o.arr, 0);
  const atRisk = owners.reduce((n, o) => n + o.atRisk, 0);
  const covered = owners.reduce((n, o) => n + o.covered, 0);
  const coverage = atRisk > 0 ? Math.round((covered / atRisk) * 100) : 100;

  const columns: Column<OwnerRow>[] = [
    {
      key: 'name',
      header: 'CSM',
      sortValue: (o) => o.name,
      render: (o) => (
        <span className="flex items-center gap-2">
          <Avatar name={o.name} size="md" />
          <span className="font-medium text-on-surface">{o.name}</span>
        </span>
      ),
    },
    { key: 'accounts', header: 'Accounts', align: 'right', sortValue: (o) => o.accounts, render: (o) => o.accounts },
    {
      key: 'red',
      header: 'At risk',
      align: 'right',
      sortValue: (o) => o.red,
      render: (o) =>
        o.red > 0 ? <Badge tone="danger">{o.red}</Badge> : <span className="text-on-surface-subtle">0</span>,
    },
    {
      key: 'exposure',
      header: 'Exposure',
      align: 'right',
      sortValue: (o) => o.atRisk,
      render: (o) => formatCurrency(o.atRisk),
    },
    {
      key: 'coverage',
      header: 'Mitigation',
      align: 'right',
      sortValue: (o) => (o.atRisk ? o.covered / o.atRisk : 1),
      render: (o) => {
        const pct = o.atRisk ? Math.round((o.covered / o.atRisk) * 100) : 100;
        return (
          <Badge tone={pct >= 75 ? 'success' : pct >= 40 ? 'warning' : 'danger'}>{pct}%</Badge>
        );
      },
    },
    { key: 'arr', header: 'ARR', align: 'right', sortValue: (o) => o.arr, render: (o) => formatCurrency(o.arr) },
  ];

  const chart = owners.map((o) => ({ name: o.name.split(' ')[0], arr: Math.round(o.arr / 1000) }));

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader
        title="Manager view"
        meta={<span>{owners.length} CSMs · {state.customers?.length ?? 0} accounts</span>}
      />
      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MetricCard label="Total managed ARR" value={formatCurrency(totalArr)} />
          <MetricCard label="Revenue at risk" value={formatCurrency(atRisk)} invertDelta />
          <MetricCard
            label="Mitigation coverage"
            value={`${coverage}%`}
            hint="Of at-risk ARR with an active goal"
          />
          <MetricCard label="Accounts at risk" value={owners.reduce((n, o) => n + o.red, 0)} />
        </div>

        <div className="mt-4 rounded-xl border border-border-default bg-surface">
          <div className="border-b border-border-default px-4 py-2.5">
            <h3 className="text-body-sm font-semibold text-on-surface">ARR by CSM</h3>
          </div>
          <div className="px-2 py-3">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chart} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
                <CartesianGrid {...GRID_PROPS} />
                <XAxis dataKey="name" {...AXIS_PROPS} />
                <YAxis {...AXIS_PROPS} unit="K" />
                <RTooltip {...TOOLTIP_PROPS} formatter={(v: any) => [`$${v}K`, 'ARR']} />
                <Bar dataKey="arr" radius={[4, 4, 0, 0]}>
                  {chart.map((c) => (
                    <Cell key={c.name} fill="var(--chart-1)" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-border-default bg-surface">
          <DataTable
            rows={owners}
            columns={columns}
            rowKey={(o) => o.id}
            onRowClick={() => navigate('/customers')}
            empty={
              <EmptyState
                icon={<Users className="size-6" strokeWidth={1.5} />}
                title="No team data"
                description="No accounts are assigned yet."
              />
            }
          />
        </div>
      </div>
    </div>
  );
}

export function ExecutiveDashboardPage() {
  const { state } = useApp();
  const owners = useOwnerRollup();

  const customers = React.useMemo(() => state.customers ?? [], [state.customers]);
  const totalArr = customers.reduce((n: number, c: any) => n + (c.arr ?? 0), 0);
  const renewals = (state.renewals ?? RENEWALS) as any[];

  const atRisk = renewals
    .filter((r) => r.forecast === 'at_risk')
    .reduce((n, r) => n + (r.riskAmount ?? 0), 0);
  const renewalArr = renewals.reduce((n, r) => n + (r.arr ?? 0), 0);
  const weighted = renewals.reduce((n, r) => n + (r.arr ?? 0) * (r.probability ?? 0), 0);

  // GRR excludes expansion; NRR adds qualified expansion on top.
  const grr = renewalArr > 0 ? Math.round((weighted / renewalArr) * 100) : 0;
  const expansion = (Object.values(state.expansionOpps ?? {}) as any[]).reduce(
    (n, o) => n + (o.estimatedArr ?? 0),
    0,
  );
  const nrr = renewalArr > 0 ? Math.round(((weighted + expansion) / renewalArr) * 100) : 0;

  const bandSplit = React.useMemo(() => {
    const acc = { red: 0, yellow: 0, green: 0 } as Record<string, number>;
    for (const c of customers) {
      const b = HEALTH_SIGNALS[c.healthId]?.band;
      if (b) acc[b] = (acc[b] ?? 0) + (c.arr ?? 0);
    }
    return [
      { name: 'At risk', arr: Math.round(acc.red / 1000), fill: 'var(--danger-solid)' },
      { name: 'Watch', arr: Math.round(acc.yellow / 1000), fill: 'var(--warning-solid)' },
      { name: 'Healthy', arr: Math.round(acc.green / 1000), fill: 'var(--success-solid)' },
    ];
  }, [customers]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader
        title="Executive view"
        meta={<span>Portfolio across {owners.length} CSMs</span>}
      />
      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MetricCard label="Total ARR" value={formatCurrency(totalArr)} hint={`${customers.length} accounts`} />
          <MetricCard label="Gross revenue retention" value={`${grr}%`} hint="Weighted renewal forecast" />
          <MetricCard label="Net revenue retention" value={`${nrr}%`} hint="Including expansion pipeline" />
          <MetricCard label="Revenue at risk" value={formatCurrency(atRisk)} invertDelta />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="rounded-xl border border-border-default bg-surface">
            <div className="border-b border-border-default px-4 py-2.5">
              <h3 className="text-body-sm font-semibold text-on-surface">ARR by health band</h3>
            </div>
            <div className="px-2 py-3">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={bandSplit} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
                  <CartesianGrid {...GRID_PROPS} />
                  <XAxis dataKey="name" {...AXIS_PROPS} />
                  <YAxis {...AXIS_PROPS} unit="K" />
                  <RTooltip {...TOOLTIP_PROPS} formatter={(v: any) => [`$${v}K`, 'ARR']} />
                  <Bar dataKey="arr" radius={[4, 4, 0, 0]}>
                    {bandSplit.map((b) => (
                      <Cell key={b.name} fill={b.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-border-default bg-surface">
            <div className="flex items-center gap-2 border-b border-border-default px-4 py-2.5">
              <ShieldCheck className="size-4 text-on-surface-subtle" strokeWidth={1.75} />
              <h3 className="text-body-sm font-semibold text-on-surface">Renewal forecast</h3>
            </div>
            <ul className="divide-y divide-border-default">
              {renewals.slice(0, 7).map((r) => {
                const cust = customers.find((c: any) => c.id === r.customerId);
                return (
                  <li key={r.id} className="flex items-center gap-3 px-4 py-2.5">
                    <Badge tone={healthTone(r.healthBand)} dot>
                      {r.healthBand === 'yellow' ? 'Watch' : r.healthBand === 'red' ? 'At risk' : 'Healthy'}
                    </Badge>
                    <span className="min-w-0 flex-1 truncate text-body-sm text-on-surface">
                      {cust?.name ?? '—'}
                    </span>
                    <span className="shrink-0 text-caption tabular-nums text-on-surface-subtle">
                      {r.daysRemaining}d
                    </span>
                    <span className="w-16 shrink-0 text-right text-body-sm tabular-nums text-on-surface-muted">
                      {formatCurrency(r.arr)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-border-default bg-surface">
          <div className="flex items-center gap-2 border-b border-border-default px-4 py-2.5">
            <TrendingUp className="size-4 text-on-surface-subtle" strokeWidth={1.75} />
            <h3 className="text-body-sm font-semibold text-on-surface">Portfolio by CSM</h3>
          </div>
          <ul className="divide-y divide-border-default">
            {owners.map((o) => (
              <li key={o.id} className="flex items-center gap-3 px-4 py-2.5">
                <Avatar name={o.name} size="md" />
                <span className="min-w-0 flex-1 truncate text-body-sm font-medium text-on-surface">
                  {o.name}
                </span>
                <span className="shrink-0 text-caption text-on-surface-subtle">
                  {o.accounts} accounts
                </span>
                {o.red > 0 && <Badge tone="danger">{o.red} at risk</Badge>}
                <span className="w-20 shrink-0 text-right text-body-sm tabular-nums text-on-surface-muted">
                  {formatCurrency(o.arr)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
