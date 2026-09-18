import React from 'react';
import {
  ArrowLeft, CheckSquare, ExternalLink, FileText, Paperclip, Send, X,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import {
  Avatar, Badge, Button, Card, ComposerTools, DropdownMenu, Field, Input, Select,
  SuggestedReplies, Textarea,
} from '@/design-system';
import { EMAIL_TEMPLATES } from '@/data/emails';
import { suggestReplies } from '@/lib/composer';

/**
 * A pulled message, its routing decision, and the reply.
 *
 * Replying without leaving the product is the reason the mailbox is
 * connected at all, so the composer is part of the message view rather than
 * a modal on top of it — the thread has to stay readable while you answer.
 */
export function EmailDetail({
  email,
  customers,
  onBack,
  onNavigate,
  dispatch,
}: {
  email: any;
  customers: any[];
  onBack: () => void;
  onNavigate: (path: string) => void;
  dispatch: (a: any) => void;
}) {
  const customer = customers.find((c) => c.id === email.customerId);
  const [reply, setReply] = React.useState('');
  const [attachments, setAttachments] = React.useState<Array<{ name: string; size: string }>>([]);
  const [taskOpen, setTaskOpen] = React.useState(false);
  const [taskTitle, setTaskTitle] = React.useState(
    'Follow up: ' + String(email.subject ?? '').replace(/^Re:\s*/i, ''),
  );
  const [taskDue, setTaskDue] = React.useState('');

  const composerContext = React.useMemo(
    () => ({
      recipient: email.from,
      sender: 'Maya Chen',
      account: customer?.name,
      subject: email.subject,
    }),
    [email.from, email.subject, customer?.name],
  );

  // An email carries no SLA clock, so the openers key off the thread's own
  // signals instead: how old it is, and how it reads.
  const suggestions = React.useMemo(
    () => suggestReplies({ sentiment: email.sentiment, ageDays: email.ageDays }),
    [email.sentiment, email.ageDays],
  );

  function applyTemplate(t: any) {
    setReply(
      t.body
        .replace(/\{\{contact\.first_name\}\}/g, String(email.from ?? '').split(' ')[0])
        .replace(/\{\{my\.name\}\}/g, 'Maya Chen')
        .replace(/\{\{my\.calendar\}\}/g, 'cx42.io/maya'),
    );
    dispatch({ type: 'ADD_TOAST', msg: `Template applied — "${t.name}"`, toastType: 'info' });
  }

  function addAttachment() {
    const n = attachments.length + 1;
    setAttachments((a) => [...a, { name: `attachment-${n}.pdf`, size: `${120 * n} KB` }]);
    dispatch({ type: 'ADD_TOAST', msg: 'Attachment added', toastType: 'info' });
  }

  function send() {
    dispatch({ type: 'ADD_TOAST', msg: `Reply sent to ${email.fromEmail}`, toastType: 'success' });
    setReply('');
    setAttachments([]);
    onBack();
  }

  function createTask() {
    dispatch({
      type: 'CREATE_TASK',
      taskId: `t_em_${email.id}_${Date.now().toString(36)}`,
      title: taskTitle,
      description: `Raised from the email “${email.subject}” from ${email.from} (${email.fromEmail}).`,
      customerId: email.customerId,
      ownerId: 'maya',
      dueDate: taskDue || null,
      source: 'email',
      emailId: email.id,
      emailSubject: email.subject,
      emailFrom: email.from,
    });
    setTaskOpen(false);
  }

  const internal = email.routing?.bucket === 'internal';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          variant="ghost"
          size="sm"
          icon={<ArrowLeft className="size-4" strokeWidth={1.75} />}
          onClick={onBack}
        >
          Back to inbox
        </Button>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<CheckSquare className="size-4" strokeWidth={1.75} />}
            onClick={() => setTaskOpen((v) => !v)}
          >
            Create task
          </Button>
          {customer && (
            <Button
              variant="secondary"
              size="sm"
              icon={<ExternalLink className="size-4" strokeWidth={1.75} />}
              onClick={() => onNavigate(`/customers/${customer.id}`)}
            >
              Open account
            </Button>
          )}
        </div>
      </div>

      {/* Why this message did or did not attach to an account. The routing
          rules are configurable, so the decision has to be visible where it
          was applied, not only in settings. */}
      <Card
        className={cn(
          'px-4 py-3',
          customer ? 'border-success-border bg-success-subtle/40' : 'bg-subtle',
        )}
      >
        <div className="flex flex-wrap items-start gap-3">
          <Badge tone={customer ? 'success' : internal ? 'neutral' : 'warning'} dot>
            {customer
              ? `Mapped to ${customer.name}`
              : internal
                ? 'Internal — not mapped'
                : 'Not mapped to an account'}
          </Badge>
          <p className="min-w-[15rem] flex-1 text-caption leading-relaxed text-on-surface-muted">
            {email.routing?.reason ?? 'No routing decision recorded for this message.'}
          </p>
          {!customer && !internal && (
            <Select
              value=""
              placeholder="Map to an account…"
              onValueChange={(v) =>
                v &&
                dispatch({
                  type: 'MAP_EMAIL_TO_ACCOUNT',
                  emailId: email.id,
                  customerId: v,
                  by: 'Maya Chen',
                })
              }
              options={customers.slice(0, 20).map((c) => ({ value: c.id, label: c.name }))}
            />
          )}
        </div>
      </Card>

      <Card className="px-5 py-4">
        <div className="flex items-start gap-3 border-b border-border-default pb-3.5">
          <Avatar name={email.from} size="xl" />
          <div className="min-w-0 flex-1">
            <p className="text-title-sm font-semibold text-on-surface">{email.subject}</p>
            <p className="mt-0.5 text-caption text-on-surface-subtle">
              {email.from} · {email.fromEmail} → {email.to}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <span className="text-caption text-on-surface-faint">{email.received}</span>
              {customer && (
                <button
                  onClick={() => onNavigate(`/customers/${customer.id}`)}
                  className="text-caption font-medium text-accent transition-colors hover:text-accent-hover"
                >
                  {customer.name}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="whitespace-pre-line py-4 text-body leading-relaxed text-on-surface">
          {email.body}
        </div>

        {(email.attachments ?? []).length > 0 && (
          <div className="border-t border-border-default pt-3.5">
            <p className="mb-2 text-caption font-medium text-on-surface-muted">Attachments</p>
            <div className="flex flex-wrap gap-2">
              {email.attachments.map((a: any) => (
                <button
                  key={a.name}
                  onClick={() =>
                    dispatch({ type: 'ADD_TOAST', msg: `Downloading ${a.name}`, toastType: 'info' })
                  }
                  className="flex items-center gap-2 rounded-lg border border-border-default px-2.5 py-1.5 transition-colors duration-[120ms] hover:border-border-strong hover:bg-hover"
                >
                  <FileText className="size-3.5 text-on-surface-faint" strokeWidth={1.75} />
                  <span className="text-caption font-medium text-on-surface">{a.name}</span>
                  <span className="text-caption text-on-surface-subtle">{a.size}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>

      {taskOpen && (
        <Card className="border-accent-muted bg-accent-subtle/40 px-4 py-3.5">
          <p className="mb-2.5 text-body-sm font-semibold text-on-surface">
            Create a task from this email
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Task title" className="sm:col-span-2">
              <Input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} />
            </Field>
            <Field label="Due date">
              <Input type="date" value={taskDue} onChange={(e) => setTaskDue(e.target.value)} />
            </Field>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button variant="primary" size="sm" onClick={createTask}>
              Create task
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setTaskOpen(false)}>
              Cancel
            </Button>
            <span className="text-caption text-on-surface-subtle">
              Source is recorded as “Converted from Email”
              {customer ? ` and linked to ${customer.name}` : ''}.
            </span>
          </div>
        </Card>
      )}

      <Card className="px-4 py-3.5">
        <div className="mb-2.5 flex items-center justify-between gap-3">
          <p className="text-body-sm font-semibold text-on-surface">Reply to {email.from}</p>
          <DropdownMenu
            align="end"
            trigger={
              <Button variant="secondary" size="sm" icon={<FileText className="size-4" strokeWidth={1.75} />}>
                Apply template
              </Button>
            }
            items={EMAIL_TEMPLATES.map((t: any) => ({
              label: t.name,
              onSelect: () => applyTemplate(t),
            }))}
          />
        </div>

        {!reply.trim() && (
          <SuggestedReplies
            className="mb-2"
            suggestions={suggestions}
            context={composerContext}
            onPick={setReply}
          />
        )}

        <Textarea
          rows={9}
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Write your reply… or apply a template to start from a draft"
          aria-label={`Reply to ${email.from}`}
        />

        {reply.trim() && (
          <ComposerTools
            className="mt-2"
            draft={reply}
            onChange={setReply}
            context={composerContext}
          />
        )}

        {attachments.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {attachments.map((a, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 rounded-lg bg-subtle px-2 py-1 text-caption text-on-surface-muted"
              >
                <Paperclip className="size-3" strokeWidth={1.75} />
                {a.name}
                <button
                  onClick={() => setAttachments((l) => l.filter((_, j) => j !== i))}
                  aria-label={`Remove ${a.name}`}
                  className="opacity-60 transition-opacity hover:opacity-100"
                >
                  <X className="size-3" strokeWidth={2} />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border-default pt-3">
          <Button
            variant="primary"
            size="sm"
            disabled={!reply.trim()}
            icon={<Send className="size-4" strokeWidth={1.75} />}
            onClick={send}
          >
            Send reply
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<Paperclip className="size-4" strokeWidth={1.75} />}
            onClick={addAttachment}
          >
            Attach file
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<CheckSquare className="size-4" strokeWidth={1.75} />}
            onClick={() => setTaskOpen(true)}
          >
            Create task
          </Button>
          <span className="ml-auto text-caption text-on-surface-subtle">
            {attachments.length
              ? `${attachments.length} attachment${attachments.length === 1 ? '' : 's'}`
              : 'No attachments'}
          </span>
        </div>
      </Card>
    </div>
  );
}
