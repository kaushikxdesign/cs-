import { AlertTriangle, Clock, TrendingUp, type LucideIcon } from 'lucide-react';
import { TICKETS } from '@/data/core';
import { daysFromToday } from '@/lib/demoDate';

export interface Notice {
  id: string;
  icon: LucideIcon;
  tone: 'danger' | 'warning' | 'success';
  title: string;
  detail: string;
  path: string;
}

/**
 * Notifications are derived, not stored. The dataset already knows what is
 * overdue, what is breaching and what is newly at risk — inventing a
 * separate feed would mean a badge that agrees with nothing on screen.
 */
export function buildNotices(state: any): Notice[] {
  const notices: Notice[] = [];
  const customers: any[] = state.customers ?? [];
  const nameOf = (id?: string) => customers.find((c) => c.id === id)?.name ?? 'an account';

  const overdue = (Object.values(state.tasks ?? {}) as any[]).filter(
    (t) => t.dueDate && (daysFromToday(t.dueDate) ?? 0) < 0 && t.status !== 'done' && t.status !== 'skipped',
  );
  if (overdue.length) {
    notices.push({
      id: 'overdue',
      icon: Clock,
      tone: 'danger',
      title: `${overdue.length} task${overdue.length === 1 ? '' : 's'} overdue`,
      detail: overdue
        .slice(0, 2)
        .map((t) => t.title)
        .join(' · '),
      path: '/work',
    });
  }

  const breaching = TICKETS.filter(
    (t: any) => t.status !== 'resolved' && (t.slaState === 'breached' || t.slaState === 'at_risk'),
  );
  if (breaching.length) {
    notices.push({
      id: 'sla',
      icon: AlertTriangle,
      tone: 'warning',
      title: `${breaching.length} ticket${breaching.length === 1 ? '' : 's'} against SLA`,
      detail: breaching
        .slice(0, 2)
        .map((t: any) => nameOf(t.customerId))
        .join(' · '),
      path: '/tickets',
    });
  }

  const critical = (Object.values(state.risks ?? {}) as any[]).filter(
    (r) => r.severity === 'critical' && r.status !== 'resolved',
  );
  if (critical.length) {
    notices.push({
      id: 'risk',
      icon: AlertTriangle,
      tone: 'danger',
      title: `${critical.length} critical risk${critical.length === 1 ? '' : 's'} open`,
      detail: critical.slice(0, 2).map((r) => nameOf(r.customerId)).join(' · '),
      path: '/risks',
    });
  }

  const unqualified = (Object.values(state.expansionOpps ?? {}) as any[]).filter(
    (o) => o.stage === 'candidate',
  );
  if (unqualified.length) {
    notices.push({
      id: 'expansion',
      icon: TrendingUp,
      tone: 'success',
      title: `${unqualified.length} expansion signal${unqualified.length === 1 ? '' : 's'} unqualified`,
      detail: unqualified.slice(0, 2).map((o) => nameOf(o.customerId)).join(' · '),
      path: '/expansion',
    });
  }

  return notices;
}
