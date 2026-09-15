import React from 'react';
import { Badge, Checkbox, DetailsPanel, KeyValueList, PanelSection } from '@/design-system';
import { actionsForTicket, ticketSla } from '@/data/tickets';
import { sentimentTone, severityTone, slaTone, statusLabel } from './ticketModel';
import type { TicketRow } from './TicketList';

/** Details pane: account attributes, SLA, sentiment, and SOPs as a checklist. */
export function TicketDetailsPanel({
  ticket,
  customer,
  ownerName,
}: {
  ticket: TicketRow;
  customer?: { name: string; segment?: string; arr?: number; renewalDate?: string };
  ownerName?: string;
}) {
  const sla = ticketSla(ticket);
  const sops = actionsForTicket(ticket);
  const [done, setDone] = React.useState<Record<string, boolean>>({});

  return (
    <DetailsPanel title="Details">
      <PanelSection title="Account">
        <KeyValueList
          items={[
            { label: 'Customer', value: customer?.name ?? '—' },
            { label: 'Segment', value: customer?.segment ?? '—' },
            {
              label: 'ARR',
              value: customer?.arr ? `$${(customer.arr / 1000).toFixed(0)}K` : '—',
            },
            { label: 'Renewal', value: customer?.renewalDate ?? '—' },
            { label: 'Owner', value: ownerName ?? '—' },
          ]}
        />
      </PanelSection>

      <PanelSection title="Service level">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-body-sm text-tertiary">SLA</span>
            <Badge tone={slaTone(sla)}>{sla.label}</Badge>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-body-sm text-tertiary">Severity</span>
            <Badge tone={severityTone(ticket.severity)}>{ticket.severity}</Badge>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-body-sm text-tertiary">Sentiment</span>
            <Badge tone={sentimentTone(ticket.sentiment)} dot>
              {ticket.sentiment}
            </Badge>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-body-sm text-tertiary">Status</span>
            <span className="text-body-sm text-primary">{statusLabel(ticket.status)}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-body-sm text-tertiary">Age</span>
            <span className="text-body-sm text-primary tabular-nums">{ticket.age} days</span>
          </div>
        </div>
      </PanelSection>

      <PanelSection title="Suggested playbooks">
        {sops.length === 0 ? (
          <p className="text-body-sm text-tertiary">No playbook applies to this ticket.</p>
        ) : (
          <div className="space-y-3">
            {sops.map((sop: any) => (
              <div key={sop.id}>
                <p className="text-body-sm font-medium text-primary">{sop.name}</p>
                {sop.summary && <p className="mt-0.5 text-caption text-tertiary">{sop.summary}</p>}
                <ul className="mt-1.5 space-y-1">
                  {(sop.steps ?? []).map((step: any, i: number) => {
                    const key = `${sop.id}:${i}`;
                    return (
                      <li key={key}>
                        <Checkbox
                          checked={!!done[key]}
                          onCheckedChange={(c) => setDone((d) => ({ ...d, [key]: c }))}
                          label={<span className="text-body-sm text-secondary">{step.t}</span>}
                        />
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </PanelSection>
    </DetailsPanel>
  );
}
