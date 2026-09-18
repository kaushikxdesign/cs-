import React from 'react';
import { Building2, Target, SkipForward } from 'lucide-react';
import { Avatar, Badge, Button, Drawer, KeyValueList, Textarea } from '@/design-system';
import { GOALS, USERS } from '@/data/core';
import { relativeDue } from '@/lib/demoDate';
import { formatDate } from '@/lib/format';
import { isFinished, statusLabel, statusTone } from './workModel';

export interface WorkTask {
  id: string;
  title: string;
  description?: string;
  goalId?: string;
  customerId?: string;
  ownerId?: string;
  dueDate?: string;
  status?: string;
  type?: string;
  source?: string;
  actionName?: string;
  outcomeNote?: string;
}

export function TaskDrawer({
  task,
  customerName,
  onOpenChange,
  onStart,
  onComplete,
  onSkip,
}: {
  task: WorkTask | null;
  customerName?: string;
  onOpenChange: (open: boolean) => void;
  onStart: (id: string) => void;
  onComplete: (id: string, note: string) => void;
  onSkip: (id: string, reason: string) => void;
}) {
  const [note, setNote] = React.useState('');

  React.useEffect(() => setNote(''), [task?.id]);

  if (!task) return null;

  const goal = task.goalId ? GOALS[task.goalId] : undefined;
  const owner = task.ownerId ? USERS[task.ownerId] : undefined;
  const finished = isFinished(task.status);

  return (
    <Drawer
      open={!!task}
      onOpenChange={onOpenChange}
      title={task.title}
      description={customerName}
      footer={
        finished ? (
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        ) : (
          <>
            <Button
              variant="ghost"
              icon={<SkipForward className="size-4" strokeWidth={1.75} />}
              onClick={() => onSkip(task.id, note || 'No reason given')}
            >
              Skip
            </Button>
            {task.status !== 'in_progress' && (
              <Button variant="secondary" onClick={() => onStart(task.id)}>
                Start
              </Button>
            )}
            <Button variant="solid" onClick={() => onComplete(task.id, note)}>
              Complete
            </Button>
          </>
        )
      }
    >
      <div className="space-y-5">
        {task.description && <p className="text-body text-on-surface-muted">{task.description}</p>}

        <KeyValueList
          items={[
            {
              label: 'Status',
              value: <Badge tone={statusTone(task.status)}>{statusLabel(task.status)}</Badge>,
            },
            {
              label: 'Due',
              value: (
                <span className="tabular-nums">
                  {formatDate(task.dueDate)}
                  <span className="ml-1.5 text-on-surface-subtle">{relativeDue(task.dueDate)}</span>
                </span>
              ),
            },
            {
              label: 'Owner',
              value: owner ? (
                <span className="inline-flex items-center gap-1.5">
                  <Avatar name={owner.name} size="xs" />
                  {owner.name}
                </span>
              ) : (
                '—'
              ),
            },
            ...(customerName
              ? [
                  {
                    label: 'Account',
                    value: (
                      <span className="inline-flex items-center gap-1.5">
                        <Building2 className="size-3.5 text-on-surface-subtle" strokeWidth={1.75} />
                        {customerName}
                      </span>
                    ),
                  },
                ]
              : []),
            ...(goal
              ? [
                  {
                    label: 'Goal',
                    value: (
                      <span className="inline-flex items-center gap-1.5">
                        <Target className="size-3.5 text-accent" strokeWidth={1.75} />
                        {goal.title}
                      </span>
                    ),
                  },
                ]
              : []),
            ...(task.actionName
              ? [{ label: 'Raised by', value: task.actionName }]
              : []),
          ]}
        />

        {task.outcomeNote && (
          <div>
            <p className="text-body-sm font-semibold text-on-surface">
              Outcome
            </p>
            <p className="mt-1.5 text-body text-on-surface-muted">{task.outcomeNote}</p>
          </div>
        )}

        {!finished && (
          <div>
            <p className="mb-1.5 text-body-sm font-semibold text-on-surface">
              Outcome note
            </p>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What happened? Recorded against the goal."
            />
          </div>
        )}
      </div>
    </Drawer>
  );
}
