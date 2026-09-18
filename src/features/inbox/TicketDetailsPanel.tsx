import React from 'react';
import { ChevronDown, PanelRightClose, Sparkles } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Avatar, Badge, Checkbox, CountBadge, IconButton, Meter, Tooltip } from '@/design-system';
import { actionsForTicket, ticketSla } from '@/data/tickets';
import { formatCurrency, formatDate, titleCase } from '@/lib/format';
import { sentimentTone, severityTone, slaTone, statusLabel } from './ticketModel';
import type { TicketRow } from './TicketList';

function Section({
  title,
  count,
  defaultOpen = true,
  children,
}: {
  title: string;
  count?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <section className="border-b border-border-default px-4 py-3 last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 text-left"
      >
        <span className="text-body-sm font-semibold text-on-surface">
          {title}
        </span>
        {count !== undefined && <CountBadge>{count}</CountBadge>}
        <ChevronDown
          className={cn(
            'ml-auto size-4 text-on-surface-subtle transition-transform duration-[180ms]',
            !open && '-rotate-90',
          )}
          strokeWidth={1.75}
        />
      </button>
      {open && <div className="mt-2.5">{children}</div>}
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <span className="shrink-0 text-body-sm text-on-surface-subtle">{label}</span>
      <span className="min-w-0 truncate text-body-sm text-on-surface">{children}</span>
    </div>
  );
}

/** Details pane: who owns it, how it is doing, and what to do next. */
export function TicketDetailsPanel({
  ticket,
  customer,
  ownerName,
  onCollapse,
}: {
  ticket: TicketRow;
  customer?: { name: string; segment?: string; arr?: number; renewalDate?: string };
  ownerName?: string;
  onCollapse?: () => void;
}) {
  const [tab, setTab] = React.useState<'details' | 'assistant'>('details');
  const sla = ticketSla(ticket);
  const sops = actionsForTicket(ticket);
  const [done, setDone] = React.useState<Record<string, boolean>>({});

  const stepCount = sops.reduce((n: number, s: any) => n + (s.steps?.length ?? 0), 0);
  const doneCount = Object.values(done).filter(Boolean).length;

  return (
    <aside className="flex w-[21rem] shrink-0 flex-col border-l border-border-default bg-panel">
      <div className="flex h-14 shrink-0 items-center gap-1 border-b border-border-default px-3">
        {(['details', 'assistant'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            aria-current={tab === t ? 'true' : undefined}
            className={cn(
              'flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-body-sm transition-colors duration-[120ms]',
              tab === t
                ? 'bg-surface font-medium text-on-surface shadow-sm'
                : 'text-on-surface-muted hover:text-on-surface',
            )}
          >
            {t === 'assistant' && <Sparkles className="size-3.5 text-accent" strokeWidth={1.75} />}
            {t === 'details' ? 'Details' : 'Assistant'}
          </button>
        ))}
        {onCollapse && (
          <Tooltip label="Collapse panel" side="bottom">
            <IconButton label="Collapse panel" size="sm" className="ml-auto" onClick={onCollapse}>
              <PanelRightClose className="size-4" strokeWidth={1.75} />
            </IconButton>
          </Tooltip>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {tab === 'details' ? (
          <>
            <Section title="Assignment">
              <Row label="Owner">
                <span className="inline-flex items-center gap-1.5">
                  <Avatar name={ownerName} size="xs" />
                  {ownerName ?? '—'}
                </span>
              </Row>
              <Row label="Status">{statusLabel(ticket.status)}</Row>
              <Row label="Ticket">{ticket.id.toUpperCase()}</Row>
            </Section>

            <Section title="Service level">
              <div className="space-y-1">
                <Row label="SLA">
                  <Badge tone={slaTone(sla)} raw>
                    {sla.label}
                  </Badge>
                </Row>
                <Row label="Priority">
                  <Badge tone={severityTone(ticket.severity)}>{ticket.severity}</Badge>
                </Row>
                <Row label="Sentiment">
                  <Badge tone={sentimentTone(ticket.sentiment)} dot>
                    {ticket.sentiment}
                  </Badge>
                </Row>
                <Row label="Age">{ticket.age === 1 ? '1 day' : `${ticket.age} days`}</Row>
              </div>
            </Section>

            <Section title="Account">
              <div className="space-y-1">
                <Row label="Company">{customer?.name ?? '—'}</Row>
                <Row label="Segment">{titleCase(customer?.segment)}</Row>
                <Row label="ARR">{formatCurrency(customer?.arr)}</Row>
                <Row label="Renewal">{formatDate(customer?.renewalDate)}</Row>
              </div>
            </Section>

            <Section title="Playbook" count={stepCount || undefined}>
              {sops.length === 0 ? (
                <p className="text-body-sm text-on-surface-subtle">
                  No playbook applies to this ticket.
                </p>
              ) : (
                <div className="space-y-3">
                  {stepCount > 0 && (
                    <Meter
                      label="Steps complete"
                      value={doneCount}
                      max={stepCount}
                      display={`${doneCount}/${stepCount}`}
                      tone={doneCount === stepCount ? 'good' : 'accent'}
                      className="pb-1"
                    />
                  )}
                  {sops.map((sop: any) => (
                    <div key={sop.id}>
                      <p className="text-body-sm font-medium text-on-surface">{sop.name}</p>
                      <ul className="mt-1.5 space-y-1.5">
                        {(sop.steps ?? []).map((step: any, i: number) => {
                          const key = `${sop.id}:${i}`;
                          return (
                            <li key={key}>
                              <Checkbox
                                checked={!!done[key]}
                                onCheckedChange={(c) => setDone((d) => ({ ...d, [key]: c }))}
                                label={
                                  <span
                                    className={cn(
                                      'text-body-sm',
                                      done[key]
                                        ? 'text-on-surface-faint line-through'
                                        : 'text-on-surface-muted',
                                    )}
                                  >
                                    {step.t}
                                  </span>
                                }
                              />
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </>
        ) : (
          <div className="px-4 py-4">
            <div className="rounded-xl border border-border-default bg-surface p-3">
              <div className="flex items-center gap-1.5">
                <Sparkles className="size-4 text-accent" strokeWidth={1.75} />
                <span className="text-body-sm font-semibold text-on-surface">Suggested next step</span>
              </div>
              <p className="mt-2 text-body text-on-surface-muted">
                {sla.breached
                  ? `SLA is ${sla.label.toLowerCase()} on a ${ticket.severity} ticket. Acknowledge with a named owner and a next-update time before anything else.`
                  : `This has been open ${ticket.age} days. Confirm business impact and how many users are blocked, then set a next-update time.`}
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
