import React from 'react';
import {
  AtSign, Bookmark, ChevronDown, Inbox, MessagesSquare, MoreHorizontal, Moon, Paperclip,
  Phone, Smile, Sparkles, Star, Ticket, Zap, CornerDownLeft, Command,
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
  onToggleFollow,
  following,
}: {
  ticket: TicketRow | null;
  customerName?: string;
  onReply: (body: string) => void;
  onClose: () => void;
  onToggleFollow: () => void;
  following?: boolean;
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
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-title-sm font-semibold text-on-surface">{customerName}</h2>
          <p className="truncate text-caption text-on-surface-subtle">
            {ticket.subject}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">

        <Tooltip label={following ? 'Unfollow' : 'Follow'} side="bottom">
          <IconButton
            label={following ? 'Unfollow' : 'Follow'}
            size="sm"
            aria-pressed={following}
            onClick={onToggleFollow}
          >
            <Star
              className={cn('size-4', following && 'fill-warning-solid text-warning-solid')}
              strokeWidth={1.75}
            />
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
        {/* A rule separates the five secondary tools from the one action
            that ends the conversation — without it the Close button reads as
            the sixth item in an icon strip. */}
        <span className="mx-1.5 h-5 w-px bg-border-default" aria-hidden />
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

      {/* A short thread sits against the composer rather than hanging from
          the top of an empty pane — the newest message is the one you came
          to read, so it belongs next to the box you reply in. */}
      <div className="flex min-h-0 flex-1 flex-col justify-end overflow-y-auto">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 py-6">
          {ticket.summary && (
            <div className="border-l-2 border-accent-muted pl-3.5">
              <p className="flex items-center gap-1.5 text-caption font-medium text-accent">
                <Sparkles className="size-3.5" strokeWidth={1.75} />
                Summary
              </p>
              <p className="mt-1 text-body text-on-surface-muted">{ticket.summary}</p>
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

      <div className="shrink-0 border-t border-border-default bg-surface px-4 py-3">
        <div className="mx-auto max-w-3xl overflow-hidden rounded-lg border border-border-default bg-canvas focus-within:border-border-strong">
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
              {/* Drawn as icons rather than the ⌘ and ↵ glyphs, so no
                  codepoint stands in for an icon anywhere in the UI. */}
              <Kbd className="gap-0.5 px-1">
                <Command className="size-3" strokeWidth={2} />
                <CornerDownLeft className="size-3" strokeWidth={2} />
              </Kbd>
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
