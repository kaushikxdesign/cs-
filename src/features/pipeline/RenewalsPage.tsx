import React from 'react';
import { CalendarCheck } from 'lucide-react';
import { useApp } from '@/state/AppContext';
import { useNavigate } from '@/router';
import { Badge, DataTable, EmptyState, MetricCard, PageHeader, Select, type Column } from '@/design-system';
import { RENEWALS, USERS } from '@/data/core';
import { formatCurrency, formatDate, healthTone } from '@/lib/format';

interface RenewalRow {
  id: string;
  customerId: string;
  arr: number;
  renewalDate: string;
  daysRemaining: number;
  healthBand: string;
  forecast: string;
  probability: number;
  riskAmount: number;
  goalCoverage: boolean;
  ownerId: string;
  nextStep: string;
}

const FORECASTS = [
  { value: 'commit', label: 'Commit' },
  { value: 'best_case', label: 'Best case' },
  { value: 'at_risk', label: 'At risk' },
  { value: 'closed_won', label: 'Closed won' },
];

export function RenewalsPage() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  const customersById = React.useMemo(
    () => Object.fromEntries((state.customers ?? []).map((c: any) => [c.id, c])),
    [state.customers],
  );
  const rows = (state.renewals ?? RENEWALS) as RenewalRow[];

  const totalArr = rows.reduce((n, r) => n + (r.arr ?? 0), 0);
  const atRisk = rows.filter((r) => r.forecast === 'at_risk');

  const columns: Column<RenewalRow>[] = [
    {
      key: 'account',
      header: 'Account',
      sortValue: (r) => customersById[r.customerId]?.name ?? '',
      render: (r) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-on-surface">{customersById[r.customerId]?.name}</p>
          <p className="truncate text-caption text-on-surface-subtle">{r.nextStep}</p>
        </div>
      ),
    },
    {
      key: 'health',
      header: 'Health',
      sortValue: (r) => r.healthBand,
      render: (r) => <Badge tone={healthTone(r.healthBand)} dot>{r.healthBand}</Badge>,
    },
    {
      key: 'forecast',
      header: 'Forecast',
      sortValue: (r) => r.forecast,
      render: (r) => (
        <span onClick={(e) => e.stopPropagation()}>
          <Select
            value={r.forecast}
            onValueChange={(forecast) =>
              dispatch({ type: 'UPDATE_RENEWAL_FORECAST', renewalId: r.id, forecast })
            }
            options={FORECASTS}
            className="h-7 w-32"
          />
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Renewal date',
      sortValue: (r) => r.renewalDate,
      render: (r) => (
        <span>
          {formatDate(r.renewalDate)}
          <span className="ml-1.5 text-caption text-on-surface-subtle tabular-nums">{r.daysRemaining}d</span>
        </span>
      ),
    },
    {
      key: 'coverage',
      header: 'Goal coverage',
      render: (r) =>
        r.goalCoverage ? <Badge tone="success">Covered</Badge> : <Badge tone="warning">None</Badge>,
    },
    {
      key: 'owner',
      header: 'Owner',
      sortValue: (r) => USERS[r.ownerId]?.name ?? '',
      render: (r) => USERS[r.ownerId]?.name ?? '—',
    },
    {
      key: 'arr',
      header: 'ARR',
      align: 'right',
      sortValue: (r) => r.arr,
      render: (r) => formatCurrency(r.arr),
    },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader title="Renewals" meta={<span>{rows.length} upcoming</span>} />
      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <MetricCard label="Total renewal ARR" value={formatCurrency(totalArr)} />
          <MetricCard label="At risk" value={formatCurrency(atRisk.reduce((n, r) => n + r.riskAmount, 0))} hint={`${atRisk.length} accounts`} />
          <MetricCard
            label="Weighted forecast"
            value={formatCurrency(rows.reduce((n, r) => n + r.arr * (r.probability ?? 0), 0))}
          />
        </div>
        <div className="overflow-hidden rounded-lg border border-border-default bg-surface">
          <DataTable
            density={state.tableDensity}
            rows={rows}
            columns={columns}
            rowKey={(r) => r.id}
            onRowClick={(r) => navigate(`/customers/${r.customerId}`)}
            empty={
              <EmptyState
                icon={<CalendarCheck className="size-6" strokeWidth={1.5} />}
                title="No renewals"
                description="Nothing is up for renewal in this window."
              />
            }
          />
        </div>
      </div>
    </div>
  );
}
