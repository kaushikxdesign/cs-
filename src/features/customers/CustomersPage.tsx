import React from 'react';
import { Building2 } from 'lucide-react';
import { useApp } from '@/state/AppContext';
import { useLocation, useNavigate } from '@/router';
import {
  Avatar, Badge, Button, DataTable, EmptyState, FilterBar, PageHeader, PrimaryCell, type Column,
} from '@/design-system';
import { HEALTH_SIGNALS, USERS } from '@/data/core';
import { formatCurrency, formatDate, healthTone, titleCase } from '@/lib/format';

interface CustomerRow {
  id: string;
  name: string;
  segment: string;
  arr: number;
  renewalDate: string;
  ownerId: string;
  healthId: string;
  riskIds?: string[];
}

export function CustomersPage() {
  const { state } = useApp();
  const { query } = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = React.useState('');
  const [selected, setSelected] = React.useState<string[]>([]);

  const ownerFilter = query.owner ?? null;

  const rows: CustomerRow[] = React.useMemo(() => {
    const needle = search.trim().toLowerCase();
    return (state.customers ?? []).filter((c: CustomerRow) => {
      if (ownerFilter && c.ownerId !== ownerFilter) return false;
      if (!needle) return true;
      return c.name.toLowerCase().includes(needle) || c.segment?.toLowerCase().includes(needle);
    });
  }, [state.customers, ownerFilter, search]);

  const health = (c: CustomerRow) => HEALTH_SIGNALS[c.healthId];

  const columns: Column<CustomerRow>[] = [
    {
      key: 'name',
      header: 'Account',
      width: '30%',
      sortValue: (c) => c.name,
      render: (c) => (
        <PrimaryCell icon={<Avatar name={c.name} size="md" />} sub={c.domain}>
          {c.name}
        </PrimaryCell>
      ),
    },
    {
      key: 'health',
      header: 'Health',
      sortValue: (c) => health(c)?.compositeScore ?? 0,
      render: (c) => {
        const h = health(c);
        if (!h) return <span className="text-on-surface-subtle">—</span>;
        return (
          <Badge tone={healthTone(h.band)} dot>
            {h.compositeScore}
          </Badge>
        );
      },
    },
    { key: 'segment', header: 'Segment', sortValue: (c) => c.segment, render: (c) => titleCase(c.segment) },
    {
      key: 'owner',
      header: 'Owner',
      sortValue: (c) => USERS[c.ownerId]?.name ?? '',
      render: (c) =>
        USERS[c.ownerId] ? (
          <span className="flex items-center gap-2">
            <Avatar name={USERS[c.ownerId].name} size="sm" />
            {USERS[c.ownerId].name}
          </span>
        ) : (
          '—'
        ),
    },
    {
      key: 'renewal',
      header: 'Renewal',
      sortValue: (c) => c.renewalDate,
      render: (c) => formatDate(c.renewalDate),
    },
    {
      key: 'arr',
      header: 'ARR',
      align: 'right',
      sortValue: (c) => c.arr,
      render: (c) => formatCurrency(c.arr),
    },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader
        title={ownerFilter ? 'My portfolio' : 'All accounts'}
        meta={
          <>
            <span>{rows.length} accounts</span>
            <span>·</span>
            <span>{formatCurrency(rows.reduce((n, c) => n + (c.arr ?? 0), 0))} ARR</span>
          </>
        }
        actions={selected.length > 0 ? <Button>Export {selected.length}</Button> : undefined}
      />

      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <FilterBar
          className="mb-3"
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search accounts…"
          chips={ownerFilter ? [{ id: 'owner', label: 'Owner', value: USERS[ownerFilter]?.name ?? ownerFilter }] : []}
          onRemove={() => navigate('/customers')}
          onAdd={(id) => id === 'owner' && navigate('/customers?owner=maya')}
          addOptions={[{ id: 'owner', label: 'My portfolio' }]}
        />

        <div className="overflow-hidden rounded-lg border border-border-default bg-surface">
          <DataTable
            rows={rows}
            columns={columns}
            rowKey={(c) => c.id}
            selectable
            selected={selected}
            onSelectedChange={setSelected}
            onRowClick={(c) => navigate(`/customers/${c.id}`)}
            empty={
              <EmptyState
                icon={<Building2 className="size-6" strokeWidth={1.5} />}
                title="No accounts match"
                description="Try clearing the search or the owner filter."
              />
            }
          />
        </div>
      </div>
    </div>
  );
}
