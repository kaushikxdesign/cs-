import { TASKS, ACTION_TASKS } from '@/data/core';

/**
 * The mock data was authored around mid-2024, so measuring it against the real
 * clock puts every task in the past and collapses "Overdue / Today / Later"
 * into a single useless bucket.
 *
 * Instead the app anchors relative dates to the dataset: the median due date
 * of open work. That keeps the groupings meaningful and self-adjusting if the
 * seed data is ever refreshed, rather than hard-coding a date that silently
 * rots.
 */
function computeAnchor(): Date {
  const all = { ...TASKS, ...ACTION_TASKS } as Record<string, { dueDate?: string; status?: string }>;
  const open = Object.values(all)
    .filter((t) => t.dueDate && t.status !== 'done' && t.status !== 'completed')
    .map((t) => new Date(t.dueDate as string).getTime())
    .filter((n) => !Number.isNaN(n))
    .sort((a, b) => a - b);

  if (!open.length) return new Date();
  return new Date(open[Math.floor(open.length / 2)]);
}

export const DEMO_TODAY = computeAnchor();

const DAY = 86_400_000;

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** Whole days from the demo anchor. Negative is overdue. */
export function daysFromToday(value?: string) {
  if (!value) return null;
  const t = new Date(value).getTime();
  if (Number.isNaN(t)) return null;
  return Math.round((startOfDay(new Date(t)) - startOfDay(DEMO_TODAY)) / DAY);
}

export function relativeDue(value?: string) {
  const d = daysFromToday(value);
  if (d === null) return '—';
  if (d === 0) return 'Today';
  if (d === 1) return 'Tomorrow';
  if (d === -1) return 'Yesterday';
  if (d < 0) return `${Math.abs(d)}d overdue`;
  if (d < 7) return `In ${d}d`;
  return new Date(value as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
