import React from 'react';
import {
  AtSign, Bookmark, ChevronDown, Inbox, MessagesSquare, MoreHorizontal, Moon, Paperclip,
  Phone, Smile, Star, Ticket, Zap,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { Avatar, Button, EmptyState, IconButton, Kbd, Tooltip } from '@/design-system';
import { parseConversation } from './ticketModel';
import type { TicketRow } from './TicketList';

function Bubble({
  author,
  date,
  body,
  inbound,
  fallbackName,
}: {
  author: string;
  date: string;
  body: string;
  inbound: boolean;
  fallbackName?: string;
}) {
  const who = author || (inbound ? (fallbackName ?? 'Customer') : 'Support');
  const meta = inbound
    ? [author, date].filter(Boolean).join(' · ')
    : ['Seen', date].filter(Boolean).join(' · ');

  return (
    <div className={cn('flex items-end gap-2', !inbound && 'flex-row-reverse')}>
      <Avatar name={who} size="sm" className="mb-0.5" />
      <div className={cn('flex min-w-0 max-w-[36rem] flex-col', !inbound && 'items-end')}>
        <div
          className={cn(
            'rounded-xl px-3.5 py-2.5 text-body',
            inbound ? 'bg-bubble-in text-on-surface' : 'bg-bubble-out text-on-surface',
          )}
        >
          <p className="whitespace-pre-wrap">{body}</p>
          {meta && (
            <p
              className={cn('mt-1 text-caption text-on-surface-subtle', !inbound && 'text-right')}
            >
              {meta}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/** Conversation pane: header, thread on a readable column, docked composer. */
export function TicketConversation({
  ticket,
  customerName,
  onReply,
  onClose,
}: {
  ticket: TicketRow | null;
  customerName?: string;
  onReply: (body: string) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = React.useState('');
  const ref = React.useRef<HTMLDivElement>(null);

  if (!ticket) {
    return (
      <div className="flex min-w-0 flex-1 items-center justify-center bg-surface">
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
    <div className="flex min-w-0 flex-1 flex-col bg-surface">
      <header className="flex h-14 shrink-0 items-center gap-1.5 border-b border-border-default px-4">
        <h2 className="min-w-0 flex-1 truncate text-title font-semibold text-on-surface">
          {customerName}
        </h2>
        <div className="flex shrink-0 items-center gap-1.5">

        <Tooltip label="Star" side="bottom">
          <IconButton label="Star" size="sm">
            <Star className="size-4" strokeWidth={1.75} />
          </IconButton>
        </Tooltip>
        <Tooltip label="More actions" side="bottom">
          <IconButton label="More actions" size="sm" variant="subtle">
            <MoreHorizontal className="size-4" strokeWidth={1.75} />
          </IconButton>
        </Tooltip>
        <Tooltip label={`Ticket ${ticket.id.toUpperCase()}`} side="bottom">
          <IconButton label="Linked ticket" size="sm" variant="subtle">
            <Ticket className="size-4" strokeWidth={1.75} />
          </IconButton>
        </Tooltip>
        <Tooltip label="Call" side="bottom">
          <IconButton label="Call" size="sm" variant="subtle">
            <Phone className="size-4" strokeWidth={1.75} />
          </IconButton>
        </Tooltip>
        <Tooltip label="Snooze" side="bottom">
          <IconButton label="Snooze" size="sm" variant="subtle">
            <Moon className="size-4" strokeWidth={1.75} />
          </IconButton>
        </Tooltip>
        {/* One unmistakable primary action, in solid rather than accent. */}
        <Button
          size="sm"
          variant="solid"
          icon={<Inbox className="size-4" strokeWidth={1.75} />}
          onClick={onClose}
        >
          Close
        </Button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 px-6 py-6">
          {ticket.summary && (
            <div className="rounded-xl border border-border-default bg-subtle px-3.5 py-3">
              <p className="text-caption font-semibold uppercase tracking-wide text-on-surface-subtle">
                Summary
              </p>
              <p className="mt-1.5 text-body text-on-surface-muted">{ticket.summary}</p>
            </div>
          )}

          {messages.map((m) => (
            <Bubble
              key={m.id}
              author={m.author}
              date={m.date}
              body={m.body}
              inbound={m.inbound}
              fallbackName={customerName}
            />
          ))}
        </div>
      </div>

      <div className="shrink-0 p-4 pt-0">
        <div className="mx-auto max-w-3xl overflow-hidden rounded-xl border border-border-default bg-surface shadow-sm">
          <div className="flex items-center gap-1.5 px-3 pt-2.5">
            <MessagesSquare className="size-4 text-on-surface" strokeWidth={1.75} />
            <span className="text-body-sm font-semibold text-on-surface">Reply</span>
            <ChevronDown className="size-3.5 text-on-surface-subtle" strokeWidth={2} />
          </div>

          <div
            ref={ref}
            contentEditable
            role="textbox"
            aria-multiline="true"
            aria-label={`Reply to ${customerName ?? 'the customer'}`}
            data-placeholder="Use ⌘K for shortcuts"
            onInput={() => setDraft(ref.current?.innerText ?? '')}
            className="cx-rte min-h-16 px-3 py-2 text-body text-on-surface outline-none"
          />

          <div className="flex items-center gap-0.5 px-2 pb-2">
            {[
              { icon: Zap, label: 'Macros' },
              { icon: Bookmark, label: 'Saved replies' },
              { icon: AtSign, label: 'Mention' },
              { icon: Smile, label: 'Emoji' },
              { icon: Paperclip, label: 'Attach' },
            ].map(({ icon: Icon, label }) => (
              <Tooltip key={label} label={label} side="top">
                <IconButton label={label} size="sm">
                  <Icon className="size-4" strokeWidth={1.75} />
                </IconButton>
              </Tooltip>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <Kbd>⌘↵</Kbd>
              <Button
                size="sm"
                variant={draft.trim() ? 'solid' : 'ghost'}
                disabled={!draft.trim()}
                onClick={() => {
                  onReply(draft);
                  setDraft('');
                  if (ref.current) ref.current.innerHTML = '';
                }}
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
