import React from 'react';
import { MessagesSquare } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Avatar, Badge, Button, EmptyState, RichTextEditor } from '@/design-system';
import { parseConversation, severityTone, statusLabel } from './ticketModel';
import type { TicketRow } from './TicketList';

/** Conversation pane: thread above, composer docked at the bottom. */
export function TicketConversation({
  ticket,
  customerName,
  onReply,
}: {
  ticket: TicketRow | null;
  customerName?: string;
  onReply: (body: string) => void;
}) {
  const [draft, setDraft] = React.useState('');

  if (!ticket) {
    return (
      <div className="flex min-w-0 flex-1 items-center justify-center">
        <EmptyState
          icon={<MessagesSquare className="size-6" strokeWidth={1.5} />}
          title="No conversation selected"
          description="Pick a ticket from the list to read the thread and reply."
        />
      </div>
    );
  }

  const messages = parseConversation((ticket as { conversation?: string }).conversation);

  return (
    <div className="flex min-w-0 flex-1 flex-col bg-canvas">
      <div className="border-b border-border-default bg-surface px-5 py-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="truncate text-title-sm font-semibold text-primary">{ticket.subject}</h2>
            <p className="mt-0.5 text-caption text-tertiary">
              {ticket.id.toUpperCase()} · {customerName}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Badge tone={severityTone(ticket.severity)}>{ticket.severity}</Badge>
            <Badge tone="neutral">{statusLabel(ticket.status)}</Badge>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {ticket.summary && (
          <div className="rounded-lg border border-border-default bg-surface px-3 py-2.5">
            <p className="text-caption font-medium uppercase tracking-wide text-tertiary">Summary</p>
            <p className="mt-1 text-body text-secondary">{ticket.summary}</p>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={cn('flex gap-3', !m.inbound && 'flex-row-reverse')}>
            <Avatar name={m.author} size="lg" className="mt-0.5" />
            <div
              className={cn(
                'max-w-xl rounded-lg border px-3 py-2',
                m.inbound
                  ? 'border-border-default bg-surface'
                  : 'border-accent-muted bg-accent-subtle',
              )}
            >
              <div className="flex items-baseline gap-2">
                <span className="text-caption font-medium text-primary">{m.author}</span>
                <span className="text-caption text-tertiary">{m.date}</span>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-body text-secondary">{m.body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-border-default bg-surface p-3">
        <RichTextEditor
          value={draft}
          onChange={setDraft}
          placeholder={`Reply to ${customerName ?? 'the customer'}…`}
          footer={
            <div className="flex items-center justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setDraft('')}>
                Discard
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  onReply(draft);
                  setDraft('');
                }}
              >
                Send reply
              </Button>
            </div>
          }
        />
      </div>
    </div>
  );
}
