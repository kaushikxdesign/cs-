import React from 'react';
import { cn } from '@/lib/cn';
import { Avatar, Badge, EmptyState, SearchInput, StatusDot } from '@/design-system';
import { Inbox } from 'lucide-react';
import { ticketSla } from '@/data/tickets';
import { sentimentTone, severityTone, slaTone } from './ticketModel';

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

/** List pane: compact rows — avatar, subject, snippet, SLA and sentiment, age. */
export function TicketList({
  tickets,
  customersById,
  selectedId,
  onSelect,
  search,
  onSearchChange,
}: {
  tickets: TicketRow[];
  customersById: Record<string, { name: string }>;
  selectedId?: string | null;
  onSelect: (id: string) => void;
  search: string;
  onSearchChange: (v: string) => void;
}) {
  return (
    <div className="flex w-96 shrink-0 flex-col border-r border-border-default bg-surface">
      <div className="border-b border-border-default p-3">
        <SearchInput
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search tickets…"
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {tickets.length === 0 ? (
          <EmptyState
            icon={<Inbox className="size-6" strokeWidth={1.5} />}
            title="No tickets"
            description="Nothing matches this view right now."
          />
        ) : (
          <ul>
            {tickets.map((t) => {
              const sla = ticketSla(t);
              const customer = customersById[t.customerId];
              const active = t.id === selectedId;
              return (
                <li key={t.id}>
                  <button
                    onClick={() => onSelect(t.id)}
                    aria-current={active ? 'true' : undefined}
                    className={cn(
                      'flex w-full gap-3 border-b border-border-default px-3 py-2.5 text-left',
                      'transition-colors duration-[120ms]',
                      active ? 'bg-selected' : 'hover:bg-hover',
                    )}
                  >
                    <Avatar name={customer?.name} size="lg" className="mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-body-sm font-medium text-primary">
                          {customer?.name ?? 'Unknown account'}
                        </span>
                        <span className="shrink-0 text-caption text-tertiary tabular-nums">{t.age}d</span>
                      </div>
                      <p className="mt-0.5 truncate text-body-sm text-secondary">{t.subject}</p>
                      {t.summary && (
                        <p className="mt-0.5 truncate text-caption text-tertiary">{t.summary}</p>
                      )}
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <Badge tone={severityTone(t.severity)}>{t.severity}</Badge>
                        <Badge tone={slaTone(sla)}>{sla.label}</Badge>
                        {t.sentiment === 'negative' && (
                          <span className="inline-flex items-center gap-1 text-caption text-tertiary">
                            <StatusDot tone={sentimentTone(t.sentiment)} />
                            {t.sentiment}
                          </span>
                        )}
                      </div>
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
