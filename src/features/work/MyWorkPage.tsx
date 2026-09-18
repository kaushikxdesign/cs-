import React from 'react';
import { CalendarDays, CheckCircle2, Crosshair, Plus, Reply, Video, Zap } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useApp } from '@/state/AppContext';
import { useNavigate } from '@/router';
import {
  Avatar, Badge, Button, Checkbox, Dialog, EmptyState, Field, Input, PageHeader, SearchInput,
  SegmentedControl, Tabs, Textarea, Tooltip,
} from '@/design-system';
import { GOALS, MEETINGS, USERS } from '@/data/core';
import { relativeDue, daysFromToday } from '@/lib/demoDate';
import { formatDate, titleCase } from '@/lib/format';
import { BUCKETS, bucketFor, isFinished, statusLabel, statusTone, type BucketId } from './workModel';
import { TaskDrawer, type WorkTask } from './TaskDrawer';
import { EmailDetail } from './EmailDetail';
import { MomentumStrip } from './MomentumStrip';

type TabId = 'all' | 'tasks' | 'meetings' | 'email';
type Range = 'all' | 'week' | 'overdue';

/** One row of work. Deliberately a single line of content plus one meta line. */
function WorkRow({
  task,
  customerName,
  currentUserId,
  onToggle,
  onOpen,
}: {
  task: WorkTask;
  customerName?: string;
  currentUserId?: string;
  onToggle: () => void;
  onOpen: () => void;
}) {
  const goal = task.goalId ? GOALS[task.goalId] : undefined;
  // Shown only when the task belongs to someone else — otherwise it is
  // the same face on every row of a list that is mine by definition.
  const owner = task.ownerId && task.ownerId !== currentUserId ? USERS[task.ownerId] : undefined;
  const done = isFinished(task.status);
  const overdue = (daysFromToday(task.dueDate) ?? 0) < 0 && !done;

  return (
    <div
      className={cn(
        'group flex items-center gap-3 rounded-lg px-2.5 py-2 transition-colors duration-[120ms]',
        'hover:bg-hover',
      )}
    >
      <span onClick={(e) => e.stopPropagation()} className="shrink-0">
        <Checkbox checked={done} onCheckedChange={onToggle} />
      </span>

      <button onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-3 text-left">
        <span className="min-w-0 flex-1">
          <span
            className={cn(
              'block truncate text-body-sm font-medium',
              done ? 'text-on-surface-faint line-through' : 'text-on-surface',
            )}
          >
            {task.title}
          </span>
          <span className="mt-0.5 flex items-center gap-2 text-caption text-on-surface-subtle">
            {customerName && <span className="truncate">{customerName}</span>}
            {goal && (
              <>
                {customerName && <span aria-hidden>·</span>}
                <span className="inline-flex min-w-0 items-center gap-1">
                  <Crosshair className="size-3 shrink-0 text-accent" strokeWidth={2} />
                  <span className="truncate">{goal.title}</span>
                </span>
              </>
            )}
          </span>
        </span>

        {/* Provenance: tasks an Action raised are marked; ones you made are plain. */}
        {task.source === 'action' && (
          <Tooltip label={task.actionName ? `Raised by ${task.actionName}` : 'Raised by an Action'} side="top">
            <span className="shrink-0">
              <Badge tone="accent" className="gap-1">
                <Zap className="size-3" strokeWidth={2} />
                Action
              </Badge>
            </span>
          </Tooltip>
        )}

        {task.status === 'in_progress' && (
          <Badge tone={statusTone(task.status)} className="shrink-0">
            {statusLabel(task.status)}
          </Badge>
        )}

        <span
          className={cn(
            'w-24 shrink-0 text-right text-caption tabular-nums',
            overdue ? 'font-medium text-danger-fg' : 'text-on-surface-subtle',
          )}
        >
          {relativeDue(task.dueDate)}
        </span>

        {owner && <Avatar name={owner.name} size="sm" className="shrink-0" />}
      </button>
    </div>
  );
}

function GroupHeading({ label, count, tone }: { label: string; count: number; tone: string }) {
  return (
    <div className="flex items-center gap-2 px-2.5 pb-1 pt-4 first:pt-1">
      <h3 className="text-body-sm font-semibold text-on-surface">
        {label}
      </h3>
      <span
        className={cn(
          'text-caption tabular-nums',
          tone === 'danger' ? 'font-medium text-danger-fg' : 'text-on-surface-faint',
        )}
      >
        {count}
      </span>
    </div>
  );
}

export function MyWorkPage() {
  const { state, dispatch } = useApp();

  const [tab, setTab] = React.useState<TabId>('all');
  const [range, setRange] = React.useState<Range>('all');
  const [search, setSearch] = React.useState('');
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [openEmailId, setOpenEmailId] = React.useState<string | null>(null);
  const navigate = useNavigate();
  const [showDone, setShowDone] = React.useState(false);
  const [composeOpen, setComposeOpen] = React.useState(false);
  const [draftTitle, setDraftTitle] = React.useState('');
  const [draftNote, setDraftNote] = React.useState('');

  const customersById = React.useMemo(
    () => Object.fromEntries((state.customers ?? []).map((c: any) => [c.id, c])),
    [state.customers],
  );

  const tasks: WorkTask[] = React.useMemo(
    () => Object.values(state.tasks ?? {}) as WorkTask[],
    [state.tasks],
  );

  const visible = React.useMemo(() => {
    const needle = search.trim().toLowerCase();
    return tasks.filter((t) => {
      if (!showDone && isFinished(t.status)) return false;
      if (range === 'overdue' && (daysFromToday(t.dueDate) ?? 0) >= 0) return false;
      if (range === 'week') {
        const d = daysFromToday(t.dueDate);
        if (d === null || d < 0 || d > 7) return false;
      }
      if (!needle) return true;
      const customer = customersById[t.customerId ?? '']?.name ?? '';
      return (
        t.title.toLowerCase().includes(needle) || customer.toLowerCase().includes(needle)
      );
    });
  }, [tasks, search, range, showDone, customersById]);

  const grouped = React.useMemo(() => {
    const map = new Map<BucketId, WorkTask[]>();
    for (const t of visible) {
      const b = bucketFor(t);
      if (!map.has(b)) map.set(b, []);
      map.get(b)!.push(t);
    }
    for (const list of map.values()) {
      list.sort((a, b) => (daysFromToday(a.dueDate) ?? 1e6) - (daysFromToday(b.dueDate) ?? 1e6));
    }
    return map;
  }, [visible]);

  const openCount = tasks.filter((t) => !isFinished(t.status)).length;
  const overdueCount = tasks.filter(
    (t) => !isFinished(t.status) && (daysFromToday(t.dueDate) ?? 0) < 0,
  ).length;
  const emails = state.emails ?? [];
  const openTask = tasks.find((t) => t.id === openId) ?? null;
  const openMail = openEmailId ? emails.find((e: any) => e.id === openEmailId) : null;

  /** Opening a message is also what marks it read — the two are the same act. */
  function openEmail(e: any) {
    if (e.unread) dispatch({ type: 'MARK_EMAIL_READ', emailId: e.id });
    setOpenEmailId(e.id);
  }

  function toggle(t: WorkTask) {
    if (isFinished(t.status)) return;
    dispatch({ type: 'COMPLETE_TASK', taskId: t.id, note: 'Completed from My Work' });
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader
        title="My Work"
        meta={
          <>
            <span>{openCount} open</span>
            {overdueCount > 0 && (
              <>
                <span aria-hidden>·</span>
                <span className="font-medium text-danger-fg">{overdueCount} overdue</span>
              </>
            )}
          </>
        }
        actions={
          <Button
            variant="solid"
            size="sm"
            icon={<Plus className="size-4" strokeWidth={2} />}
            onClick={() => setComposeOpen(true)}
          >
            New task
          </Button>
        }
        tabs={
          <Tabs
            value={tab}
            onChange={(v) => setTab(v as TabId)}
            items={[
              { value: 'all', label: 'All work', count: openCount },
              { value: 'tasks', label: 'Tasks', count: visible.length },
              { value: 'meetings', label: 'Meetings', count: MEETINGS.length },
              { value: 'email', label: 'Email', count: emails.filter((e: any) => e.unread).length },
            ]}
          />
        }
      />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-6 py-5">
          {tab === 'meetings' ? (
            <ul className="divide-y divide-border-default">
              {MEETINGS.map((m: any) => {
                const account = customersById[m.customerId];
                const upcoming = m.status === 'upcoming';
                return (
                  <li
                    key={m.id}
                    className="group flex items-center gap-3 px-2.5 py-3 transition-colors duration-[120ms] hover:bg-hover"
                  >
                    <span
                      className={cn(
                        'flex size-8 shrink-0 items-center justify-center rounded-lg',
                        upcoming ? 'bg-accent-subtle text-accent' : 'bg-subtle text-on-surface-faint',
                      )}
                    >
                      <CalendarDays className="size-4" strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-body-sm font-medium text-on-surface">{m.title}</p>
                      <p className="mt-0.5 flex min-w-0 items-center gap-1.5 text-caption text-on-surface-subtle">
                        {account && (
                          <>
                            <button
                              onClick={() => navigate(`/customers/${account.id}`)}
                              className="truncate font-medium text-accent transition-colors hover:text-accent-hover"
                            >
                              {account.name}
                            </button>
                            <span aria-hidden>·</span>
                          </>
                        )}
                        <span className="truncate">{m.participants?.length ?? 0} attendees</span>
                      </p>
                    </div>
                    <Badge tone={upcoming ? 'accent' : 'neutral'}>{titleCase(m.status)}</Badge>
                    <span className="w-24 shrink-0 text-right text-caption tabular-nums text-on-surface-subtle">
                      {formatDate(m.date)}
                    </span>
                    {upcoming ? (
                      <Button
                        size="sm"
                        variant="primary"
                        icon={<Video className="size-4" strokeWidth={1.75} />}
                        onClick={() =>
                          dispatch({
                            type: 'ADD_TOAST',
                            msg: `Joining ${m.title}`,
                            toastType: 'info',
                          })
                        }
                      >
                        Join
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="opacity-0 transition-opacity duration-[120ms] group-hover:opacity-100 focus-visible:opacity-100"
                        onClick={() =>
                          dispatch({
                            type: 'ADD_TOAST',
                            msg: 'Opening the meeting notes',
                            toastType: 'info',
                          })
                        }
                      >
                        Notes
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : tab === 'email' ? (
            openMail ? (
              <EmailDetail
                email={openMail}
                customers={state.customers ?? []}
                onBack={() => setOpenEmailId(null)}
                onNavigate={navigate}
                dispatch={dispatch}
              />
            ) : (
            <ul className="divide-y divide-border-default">
              {emails.map((e: any) => (
                <li key={e.id} className="group flex items-center gap-3 pr-2.5 transition-colors duration-[120ms] hover:bg-hover">
                  <button
                    onClick={() => openEmail(e)}
                    className="flex min-w-0 flex-1 items-center gap-3 px-2.5 py-3 text-left"
                  >
                    <Avatar name={e.from} size="xl" className="shrink-0" />
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          'block truncate text-body-sm',
                          e.unread ? 'font-semibold text-on-surface' : 'text-on-surface',
                        )}
                      >
                        {e.from}
                      </span>
                      <span className="mt-0.5 block truncate text-caption text-on-surface-subtle">
                        {e.subject}
                      </span>
                    </span>
                    {e.unread && <span className="size-2 shrink-0 rounded-full bg-accent" />}
                    <span className="w-20 shrink-0 text-right text-caption tabular-nums text-on-surface-subtle">
                      {e.ago}
                    </span>
                  </button>
                  {/* Replying is the common case, so it gets its own affordance
                      rather than living one click inside the message. */}
                  <Button
                    size="sm"
                    variant="secondary"
                    className="shrink-0 opacity-0 transition-opacity duration-[120ms] group-hover:opacity-100 focus-visible:opacity-100"
                    icon={<Reply className="size-4" strokeWidth={1.75} />}
                    onClick={() => openEmail(e)}
                  >
                    Reply
                  </Button>
                </li>
              ))}
            </ul>
            )
          ) : (
            <>
              <MomentumStrip tasks={tasks} />
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <div className="w-56">
                  <SearchInput
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search work…"
                  />
                </div>
                <SegmentedControl
                  value={range}
                  onChange={setRange}
                  options={[
                    { value: 'all', label: 'All' },
                    { value: 'week', label: 'This week' },
                    { value: 'overdue', label: 'Overdue' },
                  ]}
                />
                <button
                  onClick={() => setShowDone((s) => !s)}
                  className={cn(
                    'ml-auto inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-caption',
                    'transition-colors duration-[120ms] hover:bg-hover',
                    showDone ? 'text-on-surface' : 'text-on-surface-subtle',
                  )}
                >
                  <CheckCircle2 className="size-3.5" strokeWidth={1.75} />
                  {showDone ? 'Hide completed' : 'Show completed'}
                </button>
              </div>

              {visible.length === 0 ? (
                <EmptyState
                  icon={<CheckCircle2 className="size-6" strokeWidth={1.5} />}
                  title="Nothing to do here"
                  description="No work matches this view. Try a wider date range."
                />
              ) : (
                BUCKETS.map((b) => {
                  const rows = grouped.get(b.id);
                  if (!rows?.length) return null;
                  return (
                    <section key={b.id}>
                      <GroupHeading label={b.label} count={rows.length} tone={b.tone} />
                      <ul>
                        {rows.map((t) => (
                          <li key={t.id}>
                            <WorkRow
                              task={t}
                              customerName={customersById[t.customerId ?? '']?.name}
                              currentUserId={state.activeUser}
                              onToggle={() => toggle(t)}
                              onOpen={() => setOpenId(t.id)}
                            />
                          </li>
                        ))}
                      </ul>
                    </section>
                  );
                })
              )}
            </>
          )}
        </div>
      </div>

      <Dialog
        open={composeOpen}
        onOpenChange={setComposeOpen}
        title="New task"
        description="Tasks you create yourself appear without an Action marker."
        footer={
          <>
            <Button variant="ghost" onClick={() => setComposeOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="solid"
              disabled={!draftTitle.trim()}
              onClick={() => {
                dispatch({
                  type: 'CREATE_TASK',
                  title: draftTitle.trim(),
                  description: draftNote.trim(),
                  source: 'manual',
                });
                setDraftTitle('');
                setDraftNote('');
                setComposeOpen(false);
              }}
            >
              Create task
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Field label="Title">
            <Input
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              placeholder="What needs doing?"
              autoFocus
            />
          </Field>
          <Field label="Notes" hint="Optional context for whoever picks this up.">
            <Textarea value={draftNote} onChange={(e) => setDraftNote(e.target.value)} />
          </Field>
        </div>
      </Dialog>

      <TaskDrawer
        task={openTask}
        customerName={customersById[openTask?.customerId ?? '']?.name}
        onOpenChange={(o) => !o && setOpenId(null)}
        onStart={(id) => dispatch({ type: 'START_TASK', taskId: id })}
        onComplete={(id, note) => {
          dispatch({ type: 'COMPLETE_TASK', taskId: id, note });
          setOpenId(null);
        }}
        onSkip={(id, reason) => {
          dispatch({ type: 'SKIP_TASK', taskId: id, reason });
          setOpenId(null);
        }}
      />
    </div>
  );
}
