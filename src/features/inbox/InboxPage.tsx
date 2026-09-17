import React from 'react';
import { useApp } from '@/state/AppContext';
import { useLocation } from '@/router';
import { TICKETS, USERS } from '@/data/core';
import { ticketSla } from '@/data/tickets';
import { TicketList, type SortId, type TicketRow } from './TicketList';
import { TicketConversation } from './TicketConversation';
import { TicketDetailsPanel } from './TicketDetailsPanel';

type FilterId = 'all' | 'mine' | 'sla_risk' | 'sla_breached' | 'ageing';

const RANK: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };

const LABELS: Record<FilterId, string> = {
  all: 'Open',
  mine: 'Assigned to me',
  sla_risk: 'At risk',
  sla_breached: 'Breached',
  ageing: 'Ageing',
};

function matchesFilter(t: TicketRow, filter: FilterId) {
  if (filter === 'ageing') return t.age > 5 && t.status !== 'resolved';
  const sla = ticketSla(t);
  if (filter === 'sla_risk') return sla.atRisk;
  if (filter === 'sla_breached') return sla.breached;
  // The mock data has no assignee field, so "mine" falls back to open work.
  return t.status !== 'resolved';
}

export function InboxPage() {
  const { state, dispatch } = useApp();
  const { query } = useLocation();

  const filter = (query.filter as FilterId) || 'all';
  const [sort, setSort] = React.useState<SortId>('newest');
  const [selectedId, setSelectedId] = React.useState<string | null>(query.ticket ?? null);
  const [panelOpen, setPanelOpen] = React.useState(true);

  const customersById = React.useMemo(
    () => Object.fromEntries((state.customers ?? []).map((c: any) => [c.id, c])),
    [state.customers],
  );

  const tickets = React.useMemo(() => {
    const rows = (TICKETS as TicketRow[]).filter((t) => matchesFilter(t, filter));
    const sorted = [...rows];
    if (sort === 'newest') sorted.sort((a, b) => a.age - b.age);
    else if (sort === 'oldest') sorted.sort((a, b) => b.age - a.age);
    else sorted.sort((a, b) => (RANK[a.severity] ?? 9) - (RANK[b.severity] ?? 9));
    return sorted;
  }, [filter, sort]);

  // Keep a valid selection as filters narrow the list.
  React.useEffect(() => {
    if (!tickets.length) setSelectedId(null);
    else if (!tickets.some((t) => t.id === selectedId)) setSelectedId(tickets[0].id);
  }, [tickets, selectedId]);

  const selected = tickets.find((t) => t.id === selectedId) ?? null;
  const customer = selected ? customersById[selected.customerId] : undefined;

  return (
    <div className="flex h-full min-h-0">
      <TicketList
        tickets={tickets}
        customersById={customersById}
        selectedId={selectedId}
        onSelect={setSelectedId}
        sort={sort}
        onSortChange={setSort}
        statusLabel={LABELS[filter]}
      />

      <TicketConversation
        ticket={selected}
        customerName={customer?.name}
        following={(state.followedTickets ?? []).includes(selected?.id ?? '')}
        onToggleFollow={() =>
          selected && dispatch({ type: 'TOGGLE_FOLLOW_TICKET', ticketId: selected.id })
        }
        onClose={() =>
          dispatch({ type: 'ADD_TOAST', msg: 'Conversation closed.', toastType: 'success' })
        }
        onReply={(body) =>
          dispatch({
            type: 'ADD_TOAST',
            msg: body.trim() ? 'Reply sent.' : 'Nothing to send.',
            toastType: body.trim() ? 'success' : 'info',
          })
        }
      />

      {selected && panelOpen && (
        <TicketDetailsPanel
          ticket={selected}
          customer={customer}
          ownerName={customer ? USERS[customer.ownerId]?.name : undefined}
          onCollapse={() => setPanelOpen(false)}
        />
      )}
    </div>
  );
}
