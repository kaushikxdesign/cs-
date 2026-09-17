import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useApp } from '@/state/AppContext';
import { useNavigate, useParams } from '@/router';
import { Avatar, Badge, Button, Card, EmptyState } from '@/design-system';
import { USERS } from '@/data/core';

/** Only shared, non-skipped tasks count towards what the customer is shown. */
function sharedGoalProgress(goal: any, tasks: Record<string, any>) {
  if (!goal.taskIds?.length) return 0;
  const ts = goal.taskIds.map((id: string) => tasks[id]).filter((t: any) => t?.visibility === 'shared');
  const active = ts.filter((t: any) => t.status !== 'skipped');
  if (active.length === 0) return 0;
  return Math.round((active.filter((t: any) => t.status === 'done').length / active.length) * 100);
}

const MILESTONE_LABEL: Record<string, string> = {
  done: 'Complete',
  in_progress: 'In progress',
};

/**
 * The customer-facing Success Hub, shown to the CSM as a preview. It is the
 * one route that bypasses the app shell, so it carries its own page chrome —
 * and deliberately shows no risks, health scores, internal tasks, sentiment
 * or discounts.
 */
export function PortalPreview() {
  const { state } = useApp();
  const { customerId } = useParams() as { customerId?: string };
  const navigate = useNavigate();

  const customer = (state.customers ?? []).find((c: any) => c.id === customerId);
  const goals = Object.values(state.goals ?? {}).filter(
    (g: any) =>
      g.customerId === customerId && g.visibility === 'shared' && g.publicationStatus === 'published',
  ) as any[];

  return (
    <div className="min-h-screen bg-canvas">
      <div className="flex items-center justify-center gap-3 bg-warning-subtle px-4 py-2 text-body-sm text-warning-fg">
        <span className="font-medium">
          Previewing as customer — this is how {customer?.name ?? 'the customer'} sees their portal
        </span>
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          Exit preview
        </Button>
      </div>

      <header className="border-b border-border-default bg-surface px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-solid text-caption font-bold tracking-tight text-on-solid">
            CX
          </span>
          <div className="min-w-0">
            <p className="text-body-sm font-semibold text-on-surface">Success Hub</p>
            <p className="truncate text-caption text-on-surface-subtle">{customer?.name}</p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl space-y-5 px-6 py-8">
        <div>
          <h1 className="text-title-lg font-semibold tracking-tight text-on-surface">
            Welcome, {customer?.name ?? 'Customer'}
          </h1>
          <p className="mt-1 text-body text-on-surface-muted">
            Your dedicated success plan, updated by Maya Chen
          </p>
        </div>

        {goals.length === 0 ? (
          <EmptyState
            title="No published goals yet"
            description="Your CSM will share your success plan here once it's ready."
          />
        ) : (
          goals.map((g) => {
            const tasks = (g.taskIds ?? [])
              .map((id: string) => state.tasks[id])
              .filter((t: any) => t && t.visibility === 'shared');
            const progress = sharedGoalProgress(g, state.tasks);
            return (
              <Card key={g.id} className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-title-sm font-semibold text-on-surface">{g.title}</h2>
                    <p className="mt-1 text-body-sm text-on-surface-muted">
                      {String(g.description ?? '').slice(0, 120)}…
                    </p>
                  </div>
                  <Badge tone="success" dot>
                    Active
                  </Badge>
                </div>

                <div className="mt-4">
                  <div className="mb-1.5 flex items-center justify-between text-body-sm">
                    <span className="text-on-surface-muted">Progress</span>
                    <span className="font-semibold tabular-nums text-on-surface">{progress}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-subtle">
                    <div
                      className="h-full rounded-full bg-accent transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-5">
                  <h3 className="mb-2.5 text-body-sm font-semibold text-on-surface">Milestones</h3>
                  <ul className="space-y-1.5">
                    {tasks.map((t: any) => (
                      <li
                        key={t.id}
                        className="flex items-center gap-3 rounded-lg bg-subtle px-3 py-2.5"
                      >
                        <span
                          className={cn(
                            'flex size-5 shrink-0 items-center justify-center rounded-full border-2',
                            t.status === 'done'
                              ? 'border-success-solid bg-success-solid text-on-solid'
                              : t.status === 'in_progress'
                                ? 'border-accent'
                                : 'border-border-strong',
                          )}
                        >
                          {t.status === 'done' && <Check className="size-3" strokeWidth={3} />}
                          {t.status === 'in_progress' && (
                            <span className="size-1.5 rounded-full bg-accent" />
                          )}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-body-sm font-medium text-on-surface">
                            {t.title}
                          </p>
                          {t.dueDate && (
                            <p className="text-caption text-on-surface-subtle">
                              Due{' '}
                              {new Date(t.dueDate).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </p>
                          )}
                        </div>
                        <span
                          className={cn(
                            'ml-auto shrink-0 text-caption font-medium',
                            t.status === 'done'
                              ? 'text-success-fg'
                              : t.status === 'in_progress'
                                ? 'text-accent'
                                : 'text-on-surface-subtle',
                          )}
                        >
                          {MILESTONE_LABEL[t.status] ?? 'Upcoming'}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 flex items-center gap-3 rounded-lg border border-border-default px-3 py-2.5">
                  <Avatar name={USERS.maya?.name} size="md" />
                  <div>
                    <p className="text-body-sm font-medium text-on-surface">Maya Chen</p>
                    <p className="text-caption text-on-surface-subtle">
                      Your Customer Success Manager
                    </p>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
