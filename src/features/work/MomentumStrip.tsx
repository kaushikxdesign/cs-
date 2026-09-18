import React from 'react';
import { Card, ProgressRing } from '@/design-system';
import { daysFromToday } from '@/lib/demoDate';
import { isFinished } from './workModel';

/**
 * Three dials over the task list.
 *
 * Every number here is read off the list below it and moves the moment you
 * tick something, which is the only kind of gamification worth having — a
 * streak counter the dataset cannot support would read zero on load and
 * teach people to ignore the strip.
 */
export function MomentumStrip({ tasks }: { tasks: any[] }) {
  const stats = React.useMemo(() => {
    const done = tasks.filter((t) => isFinished(t.status)).length;
    const open = tasks.filter((t) => !isFinished(t.status));
    const overdue = open.filter((t) => (daysFromToday(t.dueDate) ?? 0) < 0).length;
    const planned = tasks.filter((t) => !!t.goalId).length;
    return {
      done,
      total: tasks.length,
      open: open.length,
      overdue,
      onTrack: open.length ? Math.round(((open.length - overdue) / open.length) * 100) : 100,
      planned,
      coverage: tasks.length ? Math.round((planned / tasks.length) * 100) : 0,
    };
  }, [tasks]);

  const dials = [
    {
      key: 'done',
      value: stats.done,
      max: Math.max(1, stats.total),
      label: String(stats.done),
      tone: stats.total > 0 && stats.done === stats.total ? ('good' as const) : ('accent' as const),
      title: 'Completed',
      hint:
        stats.total === 0
          ? 'Nothing assigned'
          : stats.done === stats.total
            ? 'Everything closed'
            : `${stats.total - stats.done} left of ${stats.total}`,
    },
    {
      key: 'track',
      value: stats.onTrack,
      max: 100,
      label: `${stats.onTrack}%`,
      tone:
        stats.onTrack >= 80 ? ('good' as const) : stats.onTrack >= 50 ? ('watch' as const) : ('risk' as const),
      title: 'On track',
      hint: stats.overdue ? `${stats.overdue} of ${stats.open} overdue` : 'Nothing overdue',
    },
    {
      key: 'coverage',
      value: stats.coverage,
      max: 100,
      label: `${stats.coverage}%`,
      tone:
        stats.coverage >= 80 ? ('good' as const) : stats.coverage >= 50 ? ('watch' as const) : ('risk' as const),
      title: 'Under a goal',
      // Loose work is work nobody is measuring, which is the thing this
      // dial is actually there to make uncomfortable.
      hint:
        stats.total - stats.planned > 0
          ? `${stats.total - stats.planned} not tied to a plan`
          : 'Every task sits under a goal',
    },
  ];

  return (
    <div className="mb-4 grid gap-3 sm:grid-cols-3">
      {dials.map((d) => (
        <Card key={d.key} className="flex items-center gap-3.5 px-4 py-3">
          <ProgressRing value={d.value} max={d.max} label={d.label} tone={d.tone} />
          <div className="min-w-0">
            <p className="text-body-sm font-medium text-on-surface">{d.title}</p>
            <p className="mt-0.5 text-caption text-on-surface-subtle">{d.hint}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
