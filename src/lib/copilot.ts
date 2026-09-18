import { CONTACTS, HEALTH_SIGNALS, MEETINGS, TICKETS } from '@/data/core';
import { daysFromToday } from '@/lib/demoDate';
import { formatCurrency } from '@/lib/format';

/**
 * The copilot's knowledge base is the application's own state.
 *
 * Every sentence, chip and recommendation below is assembled from records
 * already on screen somewhere else — health dimensions, open risks, SLA
 * clocks, renewal dates. Nothing is invented and nothing is stored, so the
 * copilot can never tell you something the rest of the product contradicts.
 * That constraint is the point: a plausible-sounding summary that disagrees
 * with the account page is worse than no summary at all.
 */

export interface Evidence {
  label: string;
  tone: 'danger' | 'warning' | 'success' | 'info' | 'neutral';
}

export interface NextAction {
  id: string;
  title: string;
  why: string;
  /** Ranked: revenue exposure first, then time pressure, then upside. */
  weight: number;
  to?: string;
  kind: 'navigate' | 'compose' | 'task';
}

export interface Overview {
  scope: 'customer' | 'ticket' | 'portfolio';
  title: string;
  headline: string;
  paragraphs: string[];
  evidence: Evidence[];
  actions: NextAction[];
}

const band = (b?: string) =>
  b === 'red' ? 'at risk' : b === 'yellow' ? 'needs attention' : b === 'green' ? 'healthy' : 'unscored';

const plural = (n: number, one: string, many = one + 's') => `${n} ${n === 1 ? one : many}`;

/** "in 0 days" is not something anyone says. */
const when = (days: number) =>
  days <= 0 ? 'today' : days === 1 ? 'tomorrow' : `in ${days} days`;

/** Ranked, highest first, capped — a list of twelve is not a recommendation. */
function rank(actions: NextAction[]) {
  return actions.sort((a, b) => b.weight - a.weight).slice(0, 4);
}

// ── Customer ────────────────────────────────────────────────────────
export function customerOverview(state: any, customerId: string): Overview | null {
  const customer = (state.customers ?? []).find((c: any) => c.id === customerId);
  if (!customer) return null;

  const health = HEALTH_SIGNALS[customer.healthId];
  const risks = (Object.values(state.risks ?? {}) as any[]).filter(
    (r) => r.customerId === customerId && r.status !== 'resolved',
  );
  const opps = (Object.values(state.expansionOpps ?? {}) as any[]).filter(
    (o) => o.customerId === customerId,
  );
  const goals = (Object.values(state.goals ?? {}) as any[]).filter(
    (g) => g.customerId === customerId && g.status !== 'completed',
  );
  const tickets = TICKETS.filter((t: any) => t.customerId === customerId && t.status !== 'resolved');
  const contacts = Object.values(CONTACTS).filter((c: any) => c.customerId === customerId);
  const champion = contacts.find((c: any) => c.isChampion);
  const meetings = MEETINGS.filter((m: any) => m.customerId === customerId);
  const lastMeeting = meetings.filter((m: any) => m.status === 'completed').at(-1);
  const daysToRenewal = daysFromToday(customer.renewalDate);
  const exposure = risks.reduce((n, r) => n + (r.amountAtRisk ?? 0), 0);
  const upside = opps.reduce((n, o) => n + (o.estimatedArr ?? 0), 0);

  // The weakest dimension is usually the reason the composite moved, so it
  // leads the explanation rather than the composite itself.
  const weakest = [...(health?.dimensions ?? [])].sort(
    (a: any, b: any) => a.effectiveScore - b.effectiveScore,
  )[0];

  const paragraphs: string[] = [];
  paragraphs.push(
    health
      ? `${customer.name} is ${band(health.band)} at ${health.compositeScore}${
          typeof health.previousScore === 'number'
            ? `, ${
                health.compositeScore >= health.previousScore ? 'up from' : 'down from'
              } ${health.previousScore}`
            : ''
        }${weakest ? `. The weakest driver is ${String(weakest.label).toLowerCase()} at ${weakest.effectiveScore}` : ''}.`
      : `${customer.name} has no health score yet.`,
  );

  if (risks.length) {
    const worst = [...risks].sort((a, b) => (b.amountAtRisk ?? 0) - (a.amountAtRisk ?? 0))[0];
    paragraphs.push(
      `${plural(risks.length, 'open risk')} carrying ${formatCurrency(exposure)} of exposure. The largest is “${worst.title}”.`,
    );
  }

  if (typeof daysToRenewal === 'number') {
    paragraphs.push(
      daysToRenewal < 0
        ? `The renewal date passed ${Math.abs(daysToRenewal)} days ago.`
        : `Renewal is ${daysToRenewal} days out at ${formatCurrency(customer.arr)}.${
            champion ? ` ${champion.name} is the mapped champion.` : ' No champion is mapped.'
          }`,
    );
  }

  if (opps.length) {
    paragraphs.push(
      `${plural(opps.length, 'expansion signal')} worth ${formatCurrency(upside)}, ${
        opps.every((o) => o.stage === 'candidate') ? 'none qualified yet' : 'some already qualified'
      }.`,
    );
  }

  const evidence: Evidence[] = [];
  if (health) {
    evidence.push({
      label: `Health ${health.compositeScore}`,
      tone: health.band === 'red' ? 'danger' : health.band === 'yellow' ? 'warning' : 'success',
    });
  }
  if (weakest) {
    evidence.push({ label: `${weakest.label} ${weakest.effectiveScore}`, tone: 'warning' });
  }
  if (risks.length) evidence.push({ label: `${formatCurrency(exposure)} at risk`, tone: 'danger' });
  if (tickets.length) evidence.push({ label: plural(tickets.length, 'open ticket'), tone: 'info' });
  if (typeof daysToRenewal === 'number' && daysToRenewal >= 0) {
    evidence.push({
      label: `Renews in ${daysToRenewal}d`,
      tone: daysToRenewal <= 60 ? 'warning' : 'neutral',
    });
  }
  if (upside) evidence.push({ label: `${formatCurrency(upside)} upside`, tone: 'success' });

  const actions: NextAction[] = [];
  if (risks.length) {
    actions.push({
      id: 'risk',
      title: goals.length ? 'Review the mitigation plan' : 'Open a mitigation goal',
      why: goals.length
        ? `${plural(goals.length, 'goal')} in flight against ${formatCurrency(exposure)} of exposure.`
        : `${formatCurrency(exposure)} is exposed with no goal covering it.`,
      weight: exposure / 1000 + (goals.length ? 0 : 400),
      to: `/customers/${customerId}`,
      kind: 'navigate',
    });
  }
  if (tickets.length) {
    const breaching = tickets.filter((t: any) => t.slaState === 'breached' || t.slaState === 'at_risk');
    actions.push({
      id: 'support',
      title: breaching.length ? 'Clear the SLA exposure' : 'Work the open tickets',
      why: breaching.length
        ? `${plural(breaching.length, 'ticket')} against SLA on this account.`
        : `${plural(tickets.length, 'ticket')} open.`,
      weight: 300 + breaching.length * 250,
      to: '/tickets',
      kind: 'navigate',
    });
  }
  if (typeof daysToRenewal === 'number' && daysToRenewal >= 0 && daysToRenewal <= 90) {
    actions.push({
      id: 'renewal',
      title: champion ? `Brief ${champion.name.split(' ')[0]} before the renewal` : 'Find an executive sponsor',
      why: champion
        ? `${daysToRenewal} days out, ${formatCurrency(customer.arr)} on the line.`
        : `${daysToRenewal} days out with nobody mapped as champion.`,
      weight: customer.arr / 1000 + (90 - daysToRenewal) * 4 + (champion ? 0 : 200),
      kind: 'compose',
    });
  }
  if (opps.length) {
    actions.push({
      id: 'expansion',
      title: 'Qualify the expansion signal',
      why: `${formatCurrency(upside)} detected and not yet in the pipeline.`,
      weight: upside / 1500,
      to: '/expansion',
      kind: 'navigate',
    });
  }
  if (!lastMeeting) {
    actions.push({
      id: 'meet',
      title: 'Book the first review',
      why: 'No completed meeting is on record for this account.',
      weight: 260,
      kind: 'task',
    });
  }

  return {
    scope: 'customer',
    title: customer.name,
    headline: health
      ? `${band(health.band)[0].toUpperCase()}${band(health.band).slice(1)} · ${formatCurrency(customer.arr)} ARR`
      : formatCurrency(customer.arr) + ' ARR',
    paragraphs,
    evidence,
    actions: rank(actions),
  };
}

// ── Ticket ──────────────────────────────────────────────────────────
export function ticketOverview(state: any, ticketId: string): Overview | null {
  const ticket = TICKETS.find((t: any) => t.id === ticketId);
  if (!ticket) return null;
  const customer = (state.customers ?? []).find((c: any) => c.id === ticket.customerId);
  const health = customer ? HEALTH_SIGNALS[customer.healthId] : undefined;
  const siblings = TICKETS.filter(
    (t: any) => t.customerId === ticket.customerId && t.id !== ticket.id && t.status !== 'resolved',
  );

  const paragraphs: string[] = [];
  paragraphs.push(
    `${ticket.subject}${customer ? ` — raised by ${customer.name}` : ''}. Priority ${
      ticket.priority ?? 'unset'
    }, ${ticket.status}${ticket.ageDays !== undefined ? `, open ${plural(ticket.ageDays, 'day')}` : ''}.`,
  );
  if (ticket.slaState === 'breached') {
    paragraphs.push('The SLA has already breached, so the next reply is the recovery, not the fix.');
  } else if (ticket.slaState === 'at_risk') {
    paragraphs.push('The SLA clock is close. A holding update now costs less than a breach.');
  }
  if (ticket.sentiment && ticket.sentiment !== 'neutral') {
    paragraphs.push(`Sentiment on the thread reads ${ticket.sentiment}.`);
  }
  if (siblings.length) {
    paragraphs.push(
      `${plural(siblings.length, 'other ticket')} open on this account — worth checking whether they share a root cause.`,
    );
  }
  if (customer && health?.band === 'red') {
    paragraphs.push(
      `${customer.name} is already at risk at ${health.compositeScore}, so support pressure here feeds the health score.`,
    );
  }

  const evidence: Evidence[] = [];
  if (ticket.priority) {
    evidence.push({
      label: `Priority ${ticket.priority}`,
      tone: /crit|high|p1/i.test(String(ticket.priority)) ? 'danger' : 'neutral',
    });
  }
  if (ticket.slaState) {
    evidence.push({
      label: ticket.slaState === 'breached' ? 'SLA breached' : ticket.slaState === 'at_risk' ? 'SLA at risk' : 'SLA on track',
      tone: ticket.slaState === 'breached' ? 'danger' : ticket.slaState === 'at_risk' ? 'warning' : 'success',
    });
  }
  if (ticket.sentiment) {
    evidence.push({
      label: `Sentiment ${ticket.sentiment}`,
      tone: ticket.sentiment === 'unhappy' ? 'danger' : ticket.sentiment === 'happy' ? 'success' : 'neutral',
    });
  }
  if (customer) evidence.push({ label: formatCurrency(customer.arr) + ' ARR', tone: 'info' });

  const actions: NextAction[] = [
    {
      id: 'reply',
      title: ticket.slaState === 'breached' ? 'Send a recovery update' : 'Reply with a holding update',
      why: 'Keeps the clock honest and the reporter informed while the fix lands.',
      weight: ticket.slaState === 'breached' ? 900 : ticket.slaState === 'at_risk' ? 700 : 400,
      kind: 'compose',
    },
  ];
  if (siblings.length) {
    actions.push({
      id: 'cluster',
      title: 'Check the other open tickets',
      why: `${plural(siblings.length, 'ticket')} on the same account.`,
      weight: 300 + siblings.length * 40,
      to: '/tickets',
      kind: 'navigate',
    });
  }
  if (customer) {
    actions.push({
      id: 'account',
      title: `Open ${customer.name}`,
      why: health ? `Health ${health.compositeScore}, ${band(health.band)}.` : 'Review the account context.',
      weight: health?.band === 'red' ? 500 : 200,
      to: `/customers/${customer.id}`,
      kind: 'navigate',
    });
  }

  return {
    scope: 'ticket',
    title: String(ticket.id).toUpperCase(),
    headline: ticket.subject,
    paragraphs,
    evidence,
    actions: rank(actions),
  };
}

// ── Portfolio ───────────────────────────────────────────────────────
export function portfolioOverview(state: any): Overview {
  const customers: any[] = state.customers ?? [];
  const risks = (Object.values(state.risks ?? {}) as any[]).filter((r) => r.status !== 'resolved');
  const opps = Object.values(state.expansionOpps ?? {}) as any[];
  const exposure = risks.reduce((n, r) => n + (r.amountAtRisk ?? 0), 0);
  const upside = opps.reduce((n, o) => n + (o.estimatedArr ?? 0), 0);
  const arr = customers.reduce((n, c) => n + (c.arr ?? 0), 0);

  const bands = customers.reduce(
    (acc: any, c: any) => {
      const b = HEALTH_SIGNALS[c.healthId]?.band;
      if (b) acc[b] = (acc[b] ?? 0) + 1;
      return acc;
    },
    { red: 0, yellow: 0, green: 0 },
  );

  const soon = customers
    .map((c) => ({ c, d: daysFromToday(c.renewalDate) }))
    .filter((x) => typeof x.d === 'number' && x.d! >= 0 && x.d! <= 60)
    .sort((a, b) => a.d! - b.d!);

  const worst = [...risks].sort((a, b) => (b.amountAtRisk ?? 0) - (a.amountAtRisk ?? 0))[0];
  const worstName = worst
    ? customers.find((c) => c.id === worst.customerId)?.name ?? 'an account'
    : null;

  return {
    scope: 'portfolio',
    title: 'Your portfolio',
    headline: `${customers.length} accounts · ${formatCurrency(arr)} ARR`,
    paragraphs: [
      `${bands.red} at risk, ${bands.yellow} needing attention, ${bands.green} healthy across ${plural(customers.length, 'account')}.`,
      risks.length
        ? `${plural(risks.length, 'open risk')} carrying ${formatCurrency(exposure)}${worstName ? `, the largest at ${worstName}` : ''}.`
        : 'No open risks.',
      soon.length
        ? `${plural(soon.length, 'renewal')} inside 60 days, the nearest being ${soon[0].c.name} ${when(soon[0].d!)}.`
        : 'Nothing renews inside 60 days.',
      upside ? `${formatCurrency(upside)} of expansion signal is detected and unqualified.` : '',
    ].filter(Boolean),
    evidence: [
      { label: `${bands.red} at risk`, tone: 'danger' },
      { label: `${formatCurrency(exposure)} exposed`, tone: 'warning' },
      { label: `${formatCurrency(upside)} upside`, tone: 'success' },
    ],
    actions: rank([
      worst
        ? {
            id: 'worst',
            title: `Work the ${worstName} risk`,
            why: `${formatCurrency(worst.amountAtRisk ?? 0)} is the largest single exposure.`,
            weight: (worst.amountAtRisk ?? 0) / 1000,
            to: `/customers/${worst.customerId}`,
            kind: 'navigate' as const,
          }
        : null,
      soon.length
        ? {
            id: 'renewals',
            title: 'Prepare the near renewals',
            why: `${plural(soon.length, 'account')} renew inside 60 days.`,
            weight: 500,
            to: '/renewals',
            kind: 'navigate' as const,
          }
        : null,
      upside
        ? {
            id: 'expansion',
            title: 'Qualify the expansion pipeline',
            why: `${formatCurrency(upside)} detected, none of it in CRM.`,
            weight: upside / 2000,
            to: '/expansion',
            kind: 'navigate' as const,
          }
        : null,
    ].filter(Boolean) as NextAction[]),
  };
}

/** What the assistant should open on, given where it was opened from. */
export function overviewForPath(state: any, pathname: string, query: Record<string, string>) {
  const customerId = pathname.match(/^\/customers\/([^/?]+)/)?.[1];
  if (customerId) return customerOverview(state, customerId);
  if (pathname.startsWith('/tickets')) {
    const id = query.ticket ?? TICKETS.find((t: any) => t.status !== 'resolved')?.id;
    if (id) return ticketOverview(state, id);
  }
  return portfolioOverview(state);
}
