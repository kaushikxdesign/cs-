import type { Tone } from '@/design-system';
import { daysFromToday } from '@/lib/demoDate';

export type BucketId = 'overdue' | 'today' | 'week' | 'later' | 'done';

export interface Bucket {
  id: BucketId;
  label: string;
  tone: Tone;
}

export const BUCKETS: Bucket[] = [
  { id: 'overdue', label: 'Overdue', tone: 'danger' },
  { id: 'today', label: 'Today', tone: 'warning' },
  { id: 'week', label: 'This week', tone: 'neutral' },
  { id: 'later', label: 'Later', tone: 'neutral' },
  { id: 'done', label: 'Completed', tone: 'success' },
];

const FINISHED = ['done', 'completed', 'skipped'];

export function isFinished(status?: string) {
  return FINISHED.includes(status ?? '');
}

export function bucketFor(item: { dueDate?: string; status?: string }): BucketId {
  if (isFinished(item.status)) return 'done';
  const d = daysFromToday(item.dueDate);
  if (d === null) return 'later';
  if (d < 0) return 'overdue';
  if (d === 0) return 'today';
  if (d <= 7) return 'week';
  return 'later';
}

export function statusTone(status?: string): Tone {
  if (status === 'in_progress') return 'info';
  if (isFinished(status)) return 'success';
  return 'neutral';
}

export function statusLabel(status?: string) {
  if (status === 'in_progress') return 'In progress';
  if (status === 'not_started' || status === 'todo') return 'To do';
  if (status === 'completed' || status === 'done') return 'Done';
  if (status === 'skipped') return 'Skipped';
  return '—';
}
