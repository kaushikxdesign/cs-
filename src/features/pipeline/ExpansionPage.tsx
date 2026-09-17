import React from 'react';
import { TrendingUp } from 'lucide-react';
import { useApp } from '@/state/AppContext';
import { useLocation, useNavigate } from '@/router';
import { Badge, Button, DataTable, EmptyState, FilterBar, PageHeader, type Column, type Tone } from '@/design-system';
import { USERS } from '@/data/core';
import { formatCurrency, titleCase } from '@/lib/format';

interface OppRow {
  id: string;
  customerId: string;
  type: string;
  estimatedArr: number;
  confidence: string;
  qualificationStatus: string;
  ownerId: string;
  crmOpportunityState: string;
  headline?: string;
}

function confidenceTone(c: string): Tone {
  if (c === 'high') return 'success';
  if (c === 'medium') return 'warning';
  return 'neutral';
}

export function ExpansionPage() {
  const { state, dispatch } = useApp();
  const { query } = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = React.useState('');

  const ownerFilter = query.owner ?? null;
  const customersById = React.useMemo(
    () => Object.fromEntries((state.customers ?? []).map((c: any) => [c.id, c])),
    [state.customers],
  );

  const rows: OppRow[] = React.useMemo(() => {
    const needle = search.trim().toLowerCase();
    return Object.values(state.expansionOpps ?? {}).filter((o: any) => {
      if (ownerFilter && o.ownerId !== ownerFilter) return false;
      if (!needle) return true;
      return (
        (o.headline ?? '').toLowerCase().includes(needle) ||
        (customersById[o.customerId]?.name ?? '').toLowerCase().includes(needle)
      );
    }) as OppRow[];
  }, [state.expansionOpps, ownerFilter, search, customersById]);

  const columns: Column<OppRow>[] = [
    {
      key: 'account',
      header: 'Opportunity',
      sortValue: (o) => customersById[o.customerId]?.name ?? '',
      render: (o) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-on-surface">{customersById[o.customerId]?.name}</p>
          {o.headline && <p className="truncate text-caption text-on-surface-subtle">{o.headline}</p>}
        </div>
      ),
    },
    { key: 'type', header: 'Type', sortValue: (o) => o.type, render: (o) => titleCase(o.type) },
    {
      key: 'confidence',
      header: 'Confidence',
      sortValue: (o) => o.confidence,
      render: (o) => <Badge tone={confidenceTone(o.confidence)}>{o.confidence}</Badge>,
    },
    {
      key: 'stage',
      header: 'Stage',
      sortValue: (o) => o.qualificationStatus,
      render: (o) => <Badge tone="neutral">{titleCase(o.qualificationStatus)}</Badge>,
    },
    {
      key: 'crm',
      header: 'CRM',
      sortValue: (o) => o.crmOpportunityState,
      render: (o) =>
        o.crmOpportunityState === 'none' ? (
          <span className="text-on-surface-subtle">Not created</span>
        ) : (
          <Badge tone="info">{titleCase(o.crmOpportunityState)}</Badge>
        ),
    },
    {
      key: 'owner',
      header: 'Owner',
      sortValue: (o) => USERS[o.ownerId]?.name ?? '',
      render: (o) => USERS[o.ownerId]?.name ?? '—',
    },
    {
      key: 'arr',
      header: 'Est. ARR',
      align: 'right',
      sortValue: (o) => o.estimatedArr,
      render: (o) => formatCurrency(o.estimatedArr),
    },
  ];

  const pipeline = rows.reduce((n, o) => n + (o.estimatedArr ?? 0), 0);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader
        title={ownerFilter ? 'My opportunities' : 'All opportunities'}
        meta={
          <>
            <span>{rows.length} opportunities</span>
            <span>·</span>
            <span>{formatCurrency(pipeline)} potential</span>
          </>
        }
      />
      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <FilterBar
          className="mb-3"
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search opportunities…"
          chips={ownerFilter ? [{ id: 'owner', label: 'Owner', value: USERS[ownerFilter]?.name ?? ownerFilter }] : []}
          onRemove={() => navigate('/expansion')}
          onAdd={() => navigate('/expansion?owner=maya')}
          addOptions={[{ id: 'owner', label: 'My opportunities' }]}
        />
        <div className="overflow-hidden rounded-lg border border-border-default bg-surface">
          <DataTable
            rows={rows}
            columns={columns}
            rowKey={(o) => o.id}
            onRowClick={(o) => navigate(`/customers/${o.customerId}`)}
            rowActions={(o) =>
              o.qualificationStatus === 'candidate' ? (
                <Button
                  size="xs"
                  variant="secondary"
                  onClick={() => dispatch({ type: 'QUALIFY_EXPANSION', oppId: o.id })}
                >
                  Qualify
                </Button>
              ) : o.crmOpportunityState === 'none' ? (
                <Button
                  size="xs"
                  variant="secondary"
                  onClick={() => dispatch({ type: 'CREATE_CRM_OPP', oppId: o.id })}
                >
                  Create opp
                </Button>
              ) : null
            }
            empty={
              <EmptyState
                icon={<TrendingUp className="size-6" strokeWidth={1.5} />}
                title="No opportunities"
                description="No expansion signals match this view."
              />
            }
          />
        </div>
      </div>
    </div>
  );
}
