import React from 'react';
import { ChevronDown, Inbox, PanelLeftClose } from 'lucide-react';
import { cn } from '@/lib/cn';
import {
  Avatar, Badge, DropdownMenu, EmptyState, IconButton, StatusDot, Tooltip,
} from '@/design-system';
import { ticketSla } from '@/data/tickets';
import { sentimentTone } from './ticketModel';

export interface TicketRow {
  id: string;
  subject: string;
  severity: string;
  sentiment: string;
  status: string;
  age: number;
  summary?: string;
  customerId: string;
}

export type SortId = 'newest' | 'oldest' | 'severity';

const SORTS: Array<{ id: SortId; label: string }> = [
  { id: 'newest', label: 'Newest' },
  { id: 'oldest', label: 'Oldest' },
  { id: 'severity', label: 'Priority' },
];

// Radix `asChild` clones this into the trigger and hands it a ref, so it has
// to forward one — a plain function component silently loses the ref and the
// menu never anchors.
const Trigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  function Trigger({ children, ...props }, ref) {
    return (
      <button
        ref={ref}
        {...props}
        className="inline-flex items-center gap-1 rounded-md px-1 py-0.5 text-body-sm font-semibold text-on-surface transition-colors duration-[120ms] hover:bg-hover"
      >
        {children}
        <ChevronDown className="size-3.5 text-on-surface-subtle" strokeWidth={2} />
      </button>
    );
  },
);

/**
 * List pane. Deliberately quiet: avatar, who, what, when. The first pass
 * stacked three status badges on every row, which made the column impossible
 * to scan — severity and SLA belong in the details pane, not repeated 22
 * times down the list. Only genuinely exceptional state surfaces here.
 */
export function TicketList({
  tickets,
  customersById,
  selectedId,
  onSelect,
  sort,
  onSortChange,
  statusLabel,
  onCollapse,
}: {
  tickets: TicketRow[];
  customersById: Record<string, { name: string }>;
  selectedId?: string | null;
  onSelect: (id: string) => void;
  sort: SortId;
  onSortChange: (s: SortId) => void;
  statusLabel: string;
  onCollapse?: () => void;
}) {
  return (
    <div className="flex w-[22rem] shrink-0 flex-col overflow-hidden rounded-xl border border-border-default bg-surface">
      <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border-default px-3">
        <span className="text-body-sm font-semibold text-on-surface">
          {tickets.length} {statusLabel}
        </span>
        <span className="flex items-center gap-1">
          <DropdownMenu
            align="end"
            trigger={<Trigger>{SORTS.find((s) => s.id === sort)?.label}</Trigger>}
            items={SORTS.map((s) => ({ label: s.label, onSelect: () => onSortChange(s.id) }))}
          />
          {onCollapse && (
            <Tooltip label="Hide list" side="bottom">
              <IconButton label="Hide list" size="sm" onClick={onCollapse}>
                <PanelLeftClose className="size-4" strokeWidth={1.75} />
              </IconButton>
            </Tooltip>
          )}
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        {tickets.length === 0 ? (
          <EmptyState
            icon={<Inbox className="size-6" strokeWidth={1.5} />}
            title="Inbox zero"
            description="Nothing in this view is waiting on you."
          />
        ) : (
          <ul>
            {tickets.map((t, i) => {
              const sla = ticketSla(t);
              const customer = customersById[t.customerId];
              const active = t.id === selectedId;
              const prevActive = i > 0 && tickets[i - 1].id === selectedId;
              return (
                <li key={t.id}>
                  <button
                    onClick={() => onSelect(t.id)}
                    aria-current={active ? 'true' : undefined}
                    className={cn(
                      'relative flex w-full gap-2.5 rounded-lg px-2 py-2.5 text-left',
                      'transition-colors duration-[120ms]',
                      active ? 'bg-selected' : 'hover:bg-hover',
                    )}
                  >
                    {/* Divider is drawn as a pseudo-row rule inset to the text
                        column, and suppressed either side of the selection so
                        the tinted block reads as one shape. */}
                    {!active && !prevActive && i > 0 && (
                      <span className="absolute inset-x-2 top-0 h-px bg-border-default" aria-hidden />
                    )}
                    <Avatar name={customer?.name} size="lg" className="mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="min-w-0 flex-1 truncate text-body-sm font-semibold text-on-surface">
                          {customer?.name ?? 'Unknown account'}
                        </span>
                        <span className="shrink-0 text-caption tabular-nums text-on-surface-subtle">
                          {t.age}d
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-body-sm text-on-surface-muted">{t.subject}</p>
                      {/* One signal only, and only when it is exceptional. */}
                      {sla.breached ? (
                        <Badge tone="danger" className="mt-1.5" raw>
                          {sla.label}
                        </Badge>
                      ) : t.sentiment === 'negative' ? (
                        <span className="mt-1.5 inline-flex items-center gap-1 text-caption text-on-surface-subtle">
                          <StatusDot tone={sentimentTone(t.sentiment)} />
                          Unhappy
                        </span>
                      ) : null}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
