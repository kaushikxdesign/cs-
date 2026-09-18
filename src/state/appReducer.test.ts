import { describe, expect, it } from 'vitest';
import { appReducer } from './appReducer';
import { createInitialState } from './AppContext';

/**
 * One case per reducer action. This is the only coverage ~20 of them get:
 * the email, DKIM, blacklist, mailbox and gate-config actions have no
 * reachable path through the UI, so a smoke test can never reach them.
 *
 * Each test asserts the delta from a frozen baseline, so an action that
 * quietly stops doing its job fails here rather than in someone's demo.
 */
const base = () => createInitialState() as any;
const run = (action: any, state: any = base()) => appReducer(state, action);

const firstKey = (o: Record<string, unknown>) => Object.keys(o)[0];

describe('ticket gates', () => {
  it('SAVE_TICKET_GATE records captured fields for a phase', () => {
    const s = run({ type: 'SAVE_TICKET_GATE', ticketId: 't1', phase: 'firstResponse', values: { Status: 'Open' }, by: 'maya' });
    expect(s.ticketGates.t1.firstResponse.values).toEqual({ Status: 'Open' });
  });

  it('UPDATE_GATE_CONFIG patches one phase and leaves the other alone', () => {
    const s = run({ type: 'UPDATE_GATE_CONFIG', phase: 'resolution', patch: { enabled: false } });
    expect(s.gateConfig.resolution.enabled).toBe(false);
    expect(s.gateConfig.firstResponse).toEqual(base().gateConfig.firstResponse);
  });

  it('SET_GATE_FIELD_REQUIRED toggles a single field', () => {
    const key = base().gateConfig.firstResponse.fields[0].key;
    const s = run({ type: 'SET_GATE_FIELD_REQUIRED', phase: 'firstResponse', key, required: false });
    expect(s.gateConfig.firstResponse.fields.find((f: any) => f.key === key).required).toBe(false);
  });

  it('TOGGLE_FOLLOW_TICKET adds and removes', () => {
    const added = run({ type: 'TOGGLE_FOLLOW_TICKET', ticketId: 'sup1901' });
    expect(added.followedTickets).toContain('sup1901');
    const removed = run({ type: 'TOGGLE_FOLLOW_TICKET', ticketId: 'sup1901' }, added);
    expect(removed.followedTickets).not.toContain('sup1901');
  });
});

describe('identity', () => {
  // PERSONAS defines only 'csm', and the reducer reads PERSONAS[p].label for
  // its toast, so switching to any other persona throws. See ui-inventory
  // Question 4 — the support persona is half-built.
  it('SWITCH_PERSONA changes persona', () => {
    expect(run({ type: 'SWITCH_PERSONA', persona: 'csm' }).persona).toBe('csm');
  });

  it('SWITCH_ROLE changes role and the active user together', () => {
    const s = run({ type: 'SWITCH_ROLE', role: 'manager', userId: 'daniel' });
    expect(s.activeRole).toBe('manager');
    expect(s.activeUser).toBe('daniel');
  });
});

describe('goals and tasks', () => {
  it('CREATE_GOAL creates the goal and its child tasks', () => {
    const s = run({
      type: 'CREATE_GOAL',
      goal: { id: 'g_new', customerId: 'acme', title: 'Test goal', ownerId: 'maya' },
      tasks: [{ title: 'Step one' }, { title: 'Step two' }],
    });
    expect(s.goals.g_new.taskIds).toHaveLength(2);
    expect(s.lastCreatedGoalId).toBe('g_new');
    expect(Object.values(s.tasks).filter((t: any) => t.goalId === 'g_new')).toHaveLength(2);
  });

  it('ACCEPT_GOAL moves the goal to in_progress', () => {
    const id = firstKey(base().goals);
    expect(run({ type: 'ACCEPT_GOAL', goalId: id }).goals[id].status).toBe('in_progress');
  });

  it('START_TASK sets the task in_progress', () => {
    const id = firstKey(base().tasks);
    expect(run({ type: 'START_TASK', taskId: id }).tasks[id].status).toBe('in_progress');
  });

  it('COMPLETE_TASK records the outcome note', () => {
    const id = firstKey(base().tasks);
    const s = run({ type: 'COMPLETE_TASK', taskId: id, note: 'Shipped' });
    expect(s.tasks[id].status).toBe('done');
    expect(s.tasks[id].outcomeNote).toBe('Shipped');
  });

  it('SKIP_TASK records the reason', () => {
    const id = firstKey(base().tasks);
    const s = run({ type: 'SKIP_TASK', taskId: id, reason: 'Not needed' });
    expect(s.tasks[id].status).toBe('skipped');
  });

  it('PUBLISH_GOAL publishes and shares', () => {
    const id = firstKey(base().goals);
    expect(run({ type: 'PUBLISH_GOAL', goalId: id }).goals[id].publicationStatus).toBe('published');
  });

  it('CHANGE_GOAL_VISIBILITY sets visibility', () => {
    const id = firstKey(base().goals);
    expect(run({ type: 'CHANGE_GOAL_VISIBILITY', goalId: id, visibility: 'private' }).goals[id].visibility).toBe('private');
  });

  it('CREATE_TASK adds an ad-hoc task', () => {
    const before = Object.keys(base().tasks).length;
    const s = run({ type: 'CREATE_TASK', title: 'Ad hoc', customerId: 'acme' });
    expect(Object.keys(s.tasks).length).toBe(before + 1);
  });
});

describe('pipeline', () => {
  it('QUALIFY_EXPANSION marks the opportunity qualified', () => {
    const id = firstKey(base().expansionOpps);
    expect(run({ type: 'QUALIFY_EXPANSION', oppId: id }).expansionOpps[id].qualificationStatus).toBe('qualified');
  });

  it('CREATE_CRM_OPP moves the CRM state off none', () => {
    const id = firstKey(base().expansionOpps);
    expect(run({ type: 'CREATE_CRM_OPP', oppId: id }).expansionOpps[id].crmOpportunityState).not.toBe('none');
  });

  it('UPDATE_RENEWAL_FORECAST sets the forecast', () => {
    const id = base().renewals[0].id;
    const s = run({ type: 'UPDATE_RENEWAL_FORECAST', renewalId: id, forecast: 'commit' });
    expect(s.renewals.find((r: any) => r.id === id).forecast).toBe('commit');
  });
});

describe('queue and reading state', () => {
  it('DISMISS_PRIORITY and SNOOZE_PRIORITY record the id', () => {
    expect(run({ type: 'DISMISS_PRIORITY', itemId: 'x' }).dismissedPriority).toContain('x');
    expect(run({ type: 'SNOOZE_PRIORITY', itemId: 'x' }).snoozedPriority).toContain('x');
  });

  it('TOGGLE_READ flips both ways', () => {
    const on = run({ type: 'TOGGLE_READ', itemId: 'x' });
    expect(on.readItems).toContain('x');
    expect(run({ type: 'TOGGLE_READ', itemId: 'x' }, on).readItems).not.toContain('x');
  });
});

describe('toasts and widgets', () => {
  it('ADD_TOAST then DISMISS_TOAST round-trips', () => {
    const added = run({ type: 'ADD_TOAST', msg: 'Saved', toastType: 'success' });
    expect(added.toasts).toHaveLength(1);
    const cleared = run({ type: 'DISMISS_TOAST', id: added.toasts[0].id }, added);
    expect(cleared.toasts).toHaveLength(0);
  });

  it('ADD_WIDGET, REORDER_WIDGETS and REMOVE_WIDGET manage the dashboard', () => {
    const a = run({ type: 'ADD_WIDGET', widget: { id: 'w1' } });
    const b = run({ type: 'ADD_WIDGET', widget: { id: 'w2' } }, a);
    expect(b.customWidgets).toHaveLength(2);
    const reordered = run({ type: 'REORDER_WIDGETS', widgets: [b.customWidgets[1], b.customWidgets[0]] }, b);
    expect(reordered.customWidgets[0].id).toBe('w2');
    expect(run({ type: 'REMOVE_WIDGET', widgetId: 'w1' }, reordered).customWidgets).toHaveLength(1);
  });
});

describe('actions library', () => {
  it('SAVE_ACTION adds an action', () => {
    const before = base().actions.length;
    const s = run({ type: 'SAVE_ACTION', action: { id: 'act_test', name: 'Test', enabled: true, steps: [] } });
    expect(s.actions.length).toBe(before + 1);
  });

  it('TOGGLE_ACTION flips enabled', () => {
    const id = base().actions[0].id;
    const before = base().actions[0].enabled;
    expect(run({ type: 'TOGGLE_ACTION', actionId: id }).actions[0].enabled).toBe(!before);
  });

  it('UPDATE_ACTION_MESSAGE edits a step body', () => {
    const action = base().actions.find((a: any) => a.steps?.length);
    const s = run({ type: 'UPDATE_ACTION_MESSAGE', actionId: action.id, stepKey: action.steps[0].key, subject: 'Hi', body: 'There' });
    const step = s.actions.find((a: any) => a.id === action.id).steps[0];
    expect(step.body).toBe('There');
  });

  it('CLONE_AUTOMATION_AS_ACTION appends a cloned action', () => {
    const before = base().actions.length;
    const s = run({
      type: 'CLONE_AUTOMATION_AS_ACTION',
      automation: { id: 'a1', name: 'Auto', pillar: 'customer', event: { field: 'health_score', mode: 'drops_below', to: '60' }, logic: 'all', conditions: [], actions: [] },
    });
    expect(s.actions.length).toBe(before + 1);
  });
});

describe('email and mailboxes', () => {
  it('MARK_EMAIL_READ clears unread', () => {
    const unread = base().emails.find((e: any) => e.unread);
    const s = run({ type: 'MARK_EMAIL_READ', emailId: unread.id });
    expect(s.emails.find((e: any) => e.id === unread.id).unread).toBe(false);
  });

  it('MAP_EMAIL_TO_ACCOUNT assigns a customer', () => {
    const id = base().emails[0].id;
    expect(run({ type: 'MAP_EMAIL_TO_ACCOUNT', emailId: id, customerId: 'globex' }).emails[0].customerId).toBe('globex');
  });

  it('SEND_EMAIL raises a toast', () => {
    expect(run({ type: 'SEND_EMAIL', taskId: null }).toasts.length).toBeGreaterThan(0);
  });

  it('SET_EMAIL_DOMAINS replaces the domain lists', () => {
    const s = run({ type: 'SET_EMAIL_DOMAINS', companyDomains: ['sia.io'], excludedDomains: ['spam.io'] });
    expect(s.emailConfig.companyDomains).toEqual(['sia.io']);
  });

  it('UPDATE_EMAIL_CONFIG merges into one section', () => {
    const s = run({ type: 'UPDATE_EMAIL_CONFIG', section: 'threading', patch: { strategy: 'references' } });
    expect(s.emailConfig.threading.strategy).toBe('references');
  });

  it('SET_DKIM patches DKIM', () => {
    expect(run({ type: 'SET_DKIM', patch: { verified: true } }).emailConfig.dkim.verified).toBe(true);
  });

  it('TOGGLE_BLACKLIST flips an entry', () => {
    const entry = base().emailConfig.blacklist.entries[0];
    const s = run({ type: 'TOGGLE_BLACKLIST', id: entry.id });
    expect(s.emailConfig.blacklist.entries[0].active).toBe(!entry.active);
  });

  it('support mailboxes add, update and remove', () => {
    const added = run({ type: 'ADD_SUPPORT_MAILBOX', mailbox: { id: 'mb_new', address: 'new@sia.io' } });
    expect(added.supportMailboxes.some((m: any) => m.id === 'mb_new')).toBe(true);
    const updated = run({ type: 'UPDATE_SUPPORT_MAILBOX', id: 'mb_new', patch: { label: 'New' } }, added);
    expect(updated.supportMailboxes.find((m: any) => m.id === 'mb_new').label).toBe('New');
    const removed = run({ type: 'REMOVE_SUPPORT_MAILBOX', id: 'mb_new' }, updated);
    expect(removed.supportMailboxes.some((m: any) => m.id === 'mb_new')).toBe(false);
  });

  it('personal mailbox connects, syncs and disconnects', () => {
    const connected = run({ type: 'CONNECT_MAILBOX', provider: 'gmail', address: 'a@b.io' });
    expect(connected.mailbox.connected).toBe(true);
    expect(run({ type: 'SYNC_MAILBOX' }, connected).mailbox.synced).toBeDefined();
    expect(run({ type: 'DISCONNECT_MAILBOX' }, connected).mailbox.connected).toBe(false);
  });
});

describe('assistant and audit', () => {
  it('TOGGLE_ASSISTANT flips the panel', () => {
    expect(run({ type: 'TOGGLE_ASSISTANT' }).assistantOpen).toBe(true);
  });

  it('SET_ASSISTANT_CONTEXT stores context', () => {
    expect(run({ type: 'SET_ASSISTANT_CONTEXT', context: { id: 'x' } }).assistantContext).toEqual({ id: 'x' });
  });

  it('LOG_ATTR_CHANGE appends an audit entry', () => {
    const before = base().attrChanges.length;
    const s = run({ type: 'LOG_ATTR_CHANGE', customerId: 'acme', field: 'segment', from: 'a', to: 'b', reason: 'why' });
    expect(s.attrChanges.length).toBe(before + 1);
  });
});

describe('unknown actions', () => {
  it('return the same state object', () => {
    const s = base();
    expect(appReducer(s, { type: 'NOPE' } as any)).toBe(s);
  });
});
