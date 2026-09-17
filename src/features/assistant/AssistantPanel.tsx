import React from 'react';
import { ArrowRight, Send, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useApp } from '@/state/AppContext';
import { useLocation } from '@/router';
import {
  Badge, Button, Dialog, Field, IconButton, Input, Switch, Textarea, Tooltip, type Tone,
} from '@/design-system';
import {
  ASSISTANT_RESPONSES, ASSISTANT_SCOPES, scopeForPath,
  type AssistantChip, type AssistantResponse,
} from '@/data/assistant';

/**
 * Evidence chips carried six unrelated hues in the MVP, one per source, none
 * of which meant anything. They collapse onto the semantic scale: a chip is
 * neutral unless its source is itself a signal of trouble or of health.
 */
const CHIP_TONE: Record<AssistantChip['type'], Tone> = {
  usage: 'info',
  ticket: 'danger',
  email: 'neutral',
  survey: 'success',
  commercial: 'warning',
  meeting: 'neutral',
};

interface Message {
  role: 'user' | 'assistant';
  text: string;
  chips?: AssistantChip[];
  actions?: string[];
}

const DRAFT_BODY = `Hi Sarah,

I wanted to reach out directly to share an update on the data synchronization issue affecting your analytics environment.

Our engineering team has identified the root cause — an API rate-limiting configuration in the ETL connector — and has a fix queued for deployment by end of week. We're monitoring the ticket hourly and will provide you a status update every 24 hours until full resolution.

In the meantime, I'd like to schedule a 30-minute call with you and Raj to walk through the recovery plan and address any questions. Would Thursday at 2 PM work?

I want to make sure you have full confidence in our resolution path ahead of your upcoming renewal.

Best,
Maya Chen
Customer Success Manager`;

/**
 * Ask CX42. The panel is layout-coupled — `AppShell` gives it a column rather
 * than floating it over the page — so it renders as a plain flex column and
 * owns no positioning of its own.
 */
export function AssistantPanel() {
  const { state, dispatch } = useApp();
  const { pathname } = useLocation();
  const [input, setInput] = React.useState('');
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [showDraft, setShowDraft] = React.useState(false);
  const [draftTo, setDraftTo] = React.useState('Sarah Mitchell <sarah.mitchell@acme-analytics.io>');
  const [draftSubject, setDraftSubject] = React.useState(
    'Update on data sync resolution — Acme Analytics',
  );
  const [draftBody, setDraftBody] = React.useState(DRAFT_BODY);
  const endRef = React.useRef<HTMLDivElement>(null);

  // The scope the assistant was opened in. Dashboard resolves to global; every
  // other module opens narrowed to itself, and the user can widen it.
  const pageScope = scopeForPath(pathname);
  const [scoped, setScoped] = React.useState(true);
  const activeScopeId = pageScope === 'global' || !scoped ? 'global' : pageScope;
  const scope = ASSISTANT_SCOPES[activeScopeId] ?? ASSISTANT_SCOPES.global;
  const canNarrow = pageScope !== 'global';

  // Customer detail resolves the account so the badge names it.
  const customerId = (pathname.match(/^\/customers\/([^/?]+)/) || [])[1];
  const scopeCustomer = customerId
    ? (state.customers ?? []).find((c: any) => c.id === customerId)
    : null;
  const isAcme = customerId === 'acme';
  const isNorthstar = customerId === 'northstar';

  const scopeLabel =
    activeScopeId === 'customer' && scopeCustomer ? scopeCustomer.name : scope.label;
  const ScopeIcon = scope.icon;

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length]);

  function handlePrompt(prompt: string) {
    let responseKey = 'default';
    if (prompt.includes('attention')) responseKey = 'portfolio_attention';
    else if (prompt.includes('renewal')) responseKey = 'portfolio_renewals';
    else if (prompt.includes('expansion') && !isNorthstar) responseKey = 'portfolio_expansion';
    else if (isAcme && prompt.includes('health')) responseKey = 'acme_health';
    else if (isAcme && prompt.includes('meeting')) responseKey = 'acme_meeting';
    else if (isAcme || prompt.includes('follow-up') || prompt.includes('outreach'))
      responseKey = 'acme_health';
    else if (isNorthstar) responseKey = 'northstar_expand';

    const response: AssistantResponse =
      ASSISTANT_RESPONSES[responseKey] ?? ASSISTANT_RESPONSES.default;
    setMessages((m) => [
      ...m,
      { role: 'user', text: prompt },
      { role: 'assistant', ...response },
    ]);
    setInput('');
  }

  function handleAction(action: string) {
    if (/Draft outreach|Draft a customer|Draft discovery/.test(action)) setShowDraft(true);
    else handlePrompt(action);
  }

  function handleSendEmail() {
    dispatch({ type: 'SEND_EMAIL', recipient: 'Sarah Mitchell (Acme)', taskId: 't3' });
    setShowDraft(false);
    dispatch({ type: 'TOGGLE_ASSISTANT' });
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-panel">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border-default px-4">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-accent-subtle">
          <Sparkles className="size-3.5 text-accent" strokeWidth={1.75} />
        </span>
        <h2 className="shrink-0 text-body-sm font-semibold text-on-surface">Ask CX42</h2>
        <Badge tone="neutral" className="min-w-0 max-w-[9rem]">
          <ScopeIcon className="size-3 shrink-0" strokeWidth={1.75} />
          <span className="truncate">{scopeLabel}</span>
        </Badge>
        <Tooltip label="Close" side="bottom">
          <IconButton
            label="Close assistant"
            size="sm"
            className="ml-auto"
            onClick={() => dispatch({ type: 'TOGGLE_ASSISTANT' })}
          >
            <X className="size-4" strokeWidth={1.75} />
          </IconButton>
        </Tooltip>
      </header>

      {/* Scope control — only meaningful when the page is narrower than global. */}
      {canNarrow && (
        <div className="flex shrink-0 items-center gap-3 border-b border-border-default bg-subtle px-4 py-2.5">
          <Switch
            checked={scoped}
            onCheckedChange={setScoped}
            aria-label={
              scoped
                ? `Searching ${scopeLabel} only — switch to search all of CX42`
                : 'Searching all of CX42 — switch back to this module'
            }
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-caption font-medium text-on-surface">
              {scoped ? `Searching within ${scopeLabel}` : 'Searching all of CX42'}
            </p>
            <p className="truncate text-caption text-on-surface-subtle">
              {scoped ? 'Toggle off to widen the search' : `Toggle on to narrow to ${scopeLabel}`}
            </p>
          </div>
          <Badge tone={scoped ? 'accent' : 'neutral'}>{scoped ? 'Scoped' : 'Global'}</Badge>
        </div>
      )}

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div>
            <p className="mb-2.5 text-caption text-on-surface-subtle">
              Suggested prompts for {scopeLabel}
            </p>
            <div className="space-y-1.5">
              {scope.prompts.map((s) => (
                <button
                  key={s}
                  onClick={() => handlePrompt(s)}
                  className={cn(
                    'block w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-left',
                    'text-body-sm text-on-surface transition-colors duration-[120ms]',
                    'hover:border-border-strong hover:bg-hover',
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) =>
            msg.role === 'user' ? (
              <div key={i} className="flex justify-end">
                <p className="max-w-[80%] rounded-xl rounded-br-sm bg-solid px-3 py-2 text-body-sm text-on-solid">
                  {msg.text}
                </p>
              </div>
            ) : (
              <div key={i} className="space-y-2">
                <p className="text-body-sm leading-relaxed text-on-surface">{msg.text}</p>
                {!!msg.chips?.length && (
                  <div className="flex flex-wrap gap-1.5">
                    {msg.chips.map((c, j) => (
                      <Badge key={j} tone={CHIP_TONE[c.type] ?? 'neutral'}>
                        {c.label}
                      </Badge>
                    ))}
                  </div>
                )}
                {!!msg.actions?.length && (
                  <div className="flex flex-col items-start gap-1 pt-0.5">
                    {msg.actions.map((a, j) => (
                      <button
                        key={j}
                        onClick={() => handleAction(a)}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-lg px-2 py-1 -ml-2',
                          'text-body-sm font-medium text-accent transition-colors duration-[120ms]',
                          'hover:bg-accent-subtle',
                        )}
                      >
                        <ArrowRight className="size-3.5 shrink-0" strokeWidth={1.75} />
                        {a}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ),
          )
        )}
        <div ref={endRef} />
      </div>

      <div className="shrink-0 border-t border-border-default p-3">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && input) handlePrompt(input);
            }}
            placeholder="Ask anything about your portfolio…"
            aria-label="Ask CX42"
            className="flex-1"
          />
          <Button
            variant="primary"
            aria-label="Send"
            disabled={!input}
            onClick={() => input && handlePrompt(input)}
          >
            <Send className="size-4" strokeWidth={1.75} />
          </Button>
        </div>
      </div>

      <Dialog
        open={showDraft}
        onOpenChange={setShowDraft}
        title="Draft outreach — Acme Analytics"
        className="max-w-2xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowDraft(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSendEmail}>
              Send email
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Field label="To">
            <Input value={draftTo} onChange={(e) => setDraftTo(e.target.value)} />
          </Field>
          <Field label="Subject">
            <Input value={draftSubject} onChange={(e) => setDraftSubject(e.target.value)} />
          </Field>
          <Field label="Message">
            <Textarea rows={10} value={draftBody} onChange={(e) => setDraftBody(e.target.value)} />
          </Field>
          <p className="rounded-lg bg-warning-subtle px-3 py-2 text-caption text-warning-fg">
            This email will be sent to the customer. Please review before sending.
          </p>
        </div>
      </Dialog>
    </div>
  );
}
