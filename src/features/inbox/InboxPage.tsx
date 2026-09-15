import React from 'react';
import { useApp } from '@/state/AppContext';
import { useLocation, useNavigate } from '@/router';
import { PageHeader, SegmentedControl } from '@/design-system';
import { TICKETS, USERS } from '@/data/core';
import { ticketSla } from '@/data/tickets';
import { TicketList, type TicketRow } from './TicketList';
import { TicketConversation } from './TicketConversation';
import { TicketDetailsPanel } from './TicketDetailsPanel';

type FilterId = 'all' | 'mine' | 'sla_risk' | 'sla_breached' | 'ageing';

const FILTERS: Array<{ id: FilterId; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'mine', label: 'Mine' },
  { id: 'sla_risk', label: 'At risk' },
  { id: 'sla_breached', label: 'Breached' },
  { id: 'ageing', label: 'Ageing' },
];

function matchesFilter(t: TicketRow, filter: FilterId) {
  if (filter === 'all') return t.status !== 'resolved';
  if (filter === 'ageing') return t.age > 5 && t.status !== 'resolved';
  const sla = ticketSla(t);
  if (filter === 'sla_risk') return sla.atRisk;
  if (filter === 'sla_breached') return sla.breached;
  // "Mine" has no assignee field in the mock data, so it falls back to open work.
  return t.status !== 'resolved';
}

export function InboxPage() {
  const { state, dispatch } = useApp();
  const { query } = useLocation();
  const navigate = useNavigate();

  const filter = (query.filter as FilterId) || 'all';
  const [search, setSearch] = React.useState('');
  const [selectedId, setSelectedId] = React.useState<string | null>(query.ticket ?? null);

  const customersById = React.useMemo(
    () => Object.fromEntries((state.customers ?? []).map((c: any) => [c.id, c])),
    [state.customers],
  );

  const tickets = React.useMemo(() => {
    const needle = search.trim().toLowerCase();
    return (TICKETS as TicketRow[])
      .filter((t) => matchesFilter(t, filter))
      .filter((t) => {
        if (!needle) return true;
        const customer = customersById[t.customerId]?.name ?? '';
        return (
          t.subject.toLowerCase().includes(needle) ||
          t.id.toLowerCase().includes(needle) ||
          customer.toLowerCase().includes(needle)
        );
      });
  }, [filter, search, customersById]);

  // Keep a selection valid as filters narrow the list.
  React.useEffect(() => {
    if (!tickets.length) {
      setSelectedId(null);
    } else if (!tickets.some((t) => t.id === selectedId)) {
      setSelectedId(tickets[0].id);
    }
  }, [tickets, selectedId]);

  const selected = tickets.find((t) => t.id === selectedId) ?? null;
  const customer = selected ? customersById[selected.customerId] : undefined;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader
        title="Inbox"
        meta={<span>{tickets.length} open conversations</span>}
        actions={
          <SegmentedControl
            value={filter}
            onChange={(f) => navigate(f === 'all' ? '/tickets' : `/tickets?filter=${f}`)}
            options={FILTERS.map((f) => ({ value: f.id, label: f.label }))}
          />
        }
      />

      <div className="flex min-h-0 flex-1">
        <TicketList
          tickets={tickets}
          customersById={customersById}
          selectedId={selectedId}
          onSelect={setSelectedId}
          search={search}
          onSearchChange={setSearch}
        />

        <TicketConversation
          ticket={selected}
          customerName={customer?.name}
          onReply={(body) =>
            dispatch({
              type: 'ADD_TOAST',
              msg: body.trim() ? 'Reply sent.' : 'Nothing to send.',
              toastType: body.trim() ? 'success' : 'info',
            })
          }
        />

        {selected && (
          <TicketDetailsPanel
            ticket={selected}
            customer={customer}
            ownerName={customer ? USERS[customer.ownerId]?.name : undefined}
          />
        )}
      </div>
    </div>
  );
}
