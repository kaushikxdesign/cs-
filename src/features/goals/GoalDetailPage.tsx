import React from 'react';
import { AlertTriangle, Crosshair } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useApp } from '@/state/AppContext';
import { useNavigate, useParams } from '@/router';
import {
  Avatar, Badge, Button, Checkbox, EmptyState, KeyValueList, PageHeader, Select,
} from '@/design-system';
import { USERS } from '@/data/core';
import { formatDate } from '@/lib/format';
import { relativeDue } from '@/lib/demoDate';
import { isFinished, statusLabel, statusTone } from '@/features/work/workModel';

export function GoalDetailPage() {
  const { state, dispatch } = useApp();
  const { goalId } = useParams();
  const navigate = useNavigate();

  const goal = (state.goals ?? {})[goalId ?? ''];
  const customer = (state.customers ?? []).find((c: any) => c.id === goal?.customerId);

  if (!goal) {
    return (
      <EmptyState
        icon={<AlertTriangle className="size-6" strokeWidth={1.5} />}
        title="Goal not found"
        description="That goal does not exist or has been removed."
        action={{ label: 'Back to my work', onClick: () => navigate('/work') }}
      />
    );
  }

  const tasks = (goal.taskIds ?? [])
    .map((id: string) => (state.tasks ?? {})[id])
    .filter(Boolean) as any[];
  const doneCount = tasks.filter((t) => isFinished(t.status)).length;
  const owner = USERS[goal.ownerId];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader
        breadcrumbs={[
          ...(customer
            ? [{ label: customer.name, onClick: () => navigate(`/customers/${customer.id}`) }]
            : [{ label: 'My Work', onClick: () => navigate('/work') }]),
          { label: 'Goal' },
        ]}
        title={goal.title}
        meta={
          <>
            <Badge tone={statusTone(goal.status)}>{statusLabel(goal.status)}</Badge>
            <span>Due {formatDate(goal.dueDate)}</span>
            {owner && (
              <>
                <span aria-hidden>·</span>
                <span className="inline-flex items-center gap-1.5">
                  <Avatar name={owner.name} size="xs" />
                  {owner.name}
                </span>
              </>
            )}
          </>
        }
        actions={
          <>
            {goal.status === 'not_started' && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => dispatch({ type: 'ACCEPT_GOAL', goalId: goal.id })}
              >
                Accept goal
              </Button>
            )}
            {goal.publicationStatus !== 'published' ? (
              <Button
                variant="solid"
                size="sm"
                onClick={() => dispatch({ type: 'PUBLISH_GOAL', goalId: goal.id })}
              >
                Publish to customer
              </Button>
            ) : (
              <Badge tone="success">Published</Badge>
            )}
          </>
        }
      />

      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="space-y-4 xl:col-span-2">
            {goal.description && (
              <section className="rounded-xl border border-border-default bg-surface px-4 py-3.5">
                <p className="text-body text-on-surface-muted">{goal.description}</p>
              </section>
            )}

            <section className="rounded-xl border border-border-default bg-surface">
              <div className="flex items-center justify-between gap-3 border-b border-border-default px-4 py-2.5">
                <h3 className="text-body-sm font-semibold text-on-surface">Plan</h3>
                <span className="text-caption tabular-nums text-on-surface-subtle">
                  {doneCount} of {tasks.length} done
                </span>
              </div>
              {tasks.length === 0 ? (
                <EmptyState title="No steps yet" description="This goal has no tasks on it." />
              ) : (
                <ul className="divide-y divide-border-default">
                  {tasks.map((t) => {
                    const done = isFinished(t.status);
                    return (
                      <li key={t.id} className="flex items-center gap-3 px-4 py-2.5">
                        <Checkbox
                          checked={done}
                          onCheckedChange={() =>
                            !done &&
                            dispatch({
                              type: 'COMPLETE_TASK',
                              taskId: t.id,
                              note: 'Completed from goal',
                            })
                          }
                        />
                        <div className="min-w-0 flex-1">
                          <p
                            className={cn(
                              'truncate text-body-sm',
                              done
                                ? 'text-on-surface-faint line-through'
                                : 'font-medium text-on-surface',
                            )}
                          >
                            {t.title}
                          </p>
                          {t.outcomeNote && (
                            <p className="mt-0.5 truncate text-caption text-on-surface-subtle">
                              {t.outcomeNote}
                            </p>
                          )}
                        </div>
                        <span className="w-24 shrink-0 text-right text-caption tabular-nums text-on-surface-subtle">
                          {relativeDue(t.dueDate)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>

          <section className="h-fit rounded-xl border border-border-default bg-surface px-4 py-3.5">
            <h3 className="mb-2 flex items-center gap-1.5 text-body-sm font-semibold text-on-surface">
              <Crosshair className="size-4 text-accent" strokeWidth={1.75} />
              Details
            </h3>
            <KeyValueList
              items={[
                { label: 'Type', value: goal.type ?? '—' },
                { label: 'Priority', value: goal.priority ?? '—' },
                {
                  label: 'Visibility',
                  value: (
                    <Select
                      value={goal.visibility ?? 'internal'}
                      onValueChange={(visibility) =>
                        dispatch({ type: 'CHANGE_GOAL_VISIBILITY', goalId: goal.id, visibility })
                      }
                      options={[
                        { value: 'internal', label: 'Internal' },
                        { value: 'shared', label: 'Shared with customer' },
                      ]}
                      className="h-7 w-44"
                    />
                  ),
                },
                { label: 'Started', value: formatDate(goal.startDate) },
                { label: 'Due', value: formatDate(goal.dueDate) },
                ...(goal.successMetric ? [{ label: 'Success metric', value: goal.successMetric }] : []),
              ]}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
