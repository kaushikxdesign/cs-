import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useApp } from '@/state/AppContext';
import { useLocation, useNavigate } from '@/router';
import {
  Avatar, Badge, DataTable, Drawer, EmptyState, FilterBar, KeyValueList, PageHeader, PrimaryCell, type Column,
} from '@/design-system';
import { USERS } from '@/data/core';
import { formatCurrency, severityTone, titleCase } from '@/lib/format';

interface RiskRow {
  id: string;
  customerId: string;
  title: string;
  category: string;
  severity: string;
  amountAtRisk: number;
  probability: number;
  ownerId: string;
  status: string;
  rootCause?: string;
  evidence?: string[];
}

export function RisksPage() {
  const { state } = useApp();
  const { query } = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = React.useState('');
  const [openId, setOpenId] = React.useState<string | null>(null);

  const ownerFilter = query.owner ?? null;
  const customersById = React.useMemo(
    () => Object.fromEntries((state.customers ?? []).map((c: any) => [c.id, c])),
    [state.customers],
  );

  const rows: RiskRow[] = React.useMemo(() => {
    const needle = search.trim().toLowerCase();
    return Object.values(state.risks ?? {}).filter((r: any) => {
      if (ownerFilter && r.ownerId !== ownerFilter) return false;
      if (!needle) return true;
      return (
        r.title.toLowerCase().includes(needle) ||
        (customersById[r.customerId]?.name ?? '').toLowerCase().includes(needle)
      );
    }) as RiskRow[];
  }, [state.risks, ownerFilter, search, customersById]);

  const open = rows.find((r) => r.id === openId) ?? null;

  const columns: Column<RiskRow>[] = [
    {
      key: 'title',
      header: 'Risk',
      width: '34%',
      sortValue: (r) => r.title,
      render: (r) => (
        <PrimaryCell sub={customersById[r.customerId]?.name}>{r.title}</PrimaryCell>
      ),
    },
    {
      key: 'severity',
      header: 'Severity',
      sortValue: (r) => r.severity,
      render: (r) => <Badge tone={severityTone(r.severity)}>{r.severity}</Badge>,
    },
    { key: 'category', header: 'Category', sortValue: (r) => r.category, render: (r) => titleCase(r.category) },
    {
      key: 'owner',
      header: 'Owner',
      sortValue: (r) => USERS[r.ownerId]?.name ?? '',
      render: (r) =>
        USERS[r.ownerId] ? (
          <span className="flex items-center gap-2">
            <Avatar name={USERS[r.ownerId].name} size="sm" />
            {USERS[r.ownerId].name}
          </span>
        ) : (
          '—'
        ),
    },
    {
      key: 'status',
      header: 'Status',
      sortValue: (r) => r.status,
      render: (r) => <Badge tone="neutral">{titleCase(r.status)}</Badge>,
    },
    {
      key: 'amount',
      header: 'At risk',
      align: 'right',
      sortValue: (r) => r.amountAtRisk,
      render: (r) => formatCurrency(r.amountAtRisk),
    },
  ];

  const totalAtRisk = rows.reduce((n, r) => n + (r.amountAtRisk ?? 0), 0);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader
        title={ownerFilter ? 'My risks' : 'All risks'}
        meta={
          <>
            <span>{rows.length} open</span>
            <span>·</span>
            <span>{formatCurrency(totalAtRisk)} exposed</span>
          </>
        }
      />
      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <FilterBar
          className="mb-3"
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search risks…"
          chips={ownerFilter ? [{ id: 'owner', label: 'Owner', value: USERS[ownerFilter]?.name ?? ownerFilter }] : []}
          onRemove={() => navigate('/risks')}
          onAdd={() => navigate('/risks?owner=maya')}
          addOptions={[{ id: 'owner', label: 'My risks' }]}
        />
        <div className="overflow-hidden rounded-lg border border-border-default bg-surface">
          <DataTable
            rows={rows}
            columns={columns}
            rowKey={(r) => r.id}
            onRowClick={(r) => setOpenId(r.id)}
            empty={
              <EmptyState
                icon={<ShieldCheck className="size-6" strokeWidth={1.5} />}
                title="No open risks"
                description="Nothing in this view needs attention right now."
              />
            }
          />
        </div>
      </div>

      <Drawer
        open={!!open}
        onOpenChange={(o) => !o && setOpenId(null)}
        title={open?.title ?? ''}
        description={open ? customersById[open.customerId]?.name : undefined}
      >
        {open && (
          <div className="space-y-4">
            <KeyValueList
              items={[
                { label: 'Severity', value: <Badge tone={severityTone(open.severity)}>{open.severity}</Badge> },
                { label: 'Category', value: titleCase(open.category) },
                { label: 'Status', value: titleCase(open.status) },
                { label: 'Owner', value: USERS[open.ownerId]?.name ?? '—' },
                { label: 'Amount at risk', value: formatCurrency(open.amountAtRisk) },
                { label: 'Probability', value: `${Math.round((open.probability ?? 0) * 100)}%` },
              ]}
            />
            {open.rootCause && (
              <div>
                <p className="text-caption font-medium text-on-surface-subtle">Root cause</p>
                <p className="mt-1 text-body text-on-surface-muted">{open.rootCause}</p>
              </div>
            )}
            {open.evidence && open.evidence.length > 0 && (
              <div>
                <p className="text-caption font-medium text-on-surface-subtle">Evidence</p>
                <ul className="mt-1 space-y-1">
                  {open.evidence.map((e, i) => (
                    <li key={i} className="text-body-sm text-on-surface-muted">• {e}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
