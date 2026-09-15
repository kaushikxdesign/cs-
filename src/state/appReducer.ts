import { ATTR_LABELS } from '@/data/attributes';
import { cloneAutomationToAction } from '@/data/automations';
import { routeEmails } from '@/data/emails';
import { PERSONAS } from '@/data/personas';
import { TICKET_GATE_DEFAULTS } from '@/data/tickets';

function appReducer(state, action) {
  switch(action.type) {
    // ── Gated ticket fields ──
    // Records the field set captured at a moment in the ticket's life. Stored
    // per ticket per phase so the gate never fires twice for the same phase.
    case 'SAVE_TICKET_GATE': {
      const prev = state.ticketGates || {};
      const forTicket = prev[action.ticketId] || {};
      return { ...state,
        ticketGates: { ...prev, [action.ticketId]: { ...forTicket,
          [action.phase]: { values: action.values, at: action.at || 'Just now', by: action.by || 'Maya Chen' } } },
        toasts: [...state.toasts, { id: Date.now(),
          msg: (action.phase === 'resolution' ? 'Resolution' : 'First response') + ' fields captured on ' + action.ticketId.toUpperCase(),
          type:'success' }] };
    }
    case 'UPDATE_GATE_CONFIG': {
      const cfg = { ...(state.gateConfig || TICKET_GATE_DEFAULTS) };
      cfg[action.phase] = { ...cfg[action.phase], ...action.patch };
      return { ...state, gateConfig: cfg,
        toasts: [...state.toasts, { id: Date.now(), msg: action.msg || 'Required fields updated', type:'success' }] };
    }
    case 'SET_GATE_FIELD_REQUIRED': {
      const cfg = { ...(state.gateConfig || TICKET_GATE_DEFAULTS) };
      cfg[action.phase] = { ...cfg[action.phase],
        fields: cfg[action.phase].fields.map(f => f.key === action.key ? { ...f, required: action.required } : f) };
      return { ...state, gateConfig: cfg,
        toasts: [...state.toasts, { id: Date.now(),
          msg: action.key + (action.required ? ' is now mandatory' : ' is now optional'), type:'info' }] };
    }

    case 'TOGGLE_FOLLOW_TICKET': {
      const cur = state.followedTickets || [];
      const on = cur.includes(action.ticketId);
      return { ...state, followedTickets: on ? cur.filter(x=>x!==action.ticketId) : cur.concat(action.ticketId),
        toasts: [...state.toasts, { id: Date.now(),
          msg: on ? 'Unfollowed \u2014 no more updates for this ticket'
                  : 'Following \u2014 you will be notified of every update', type:'success' }] };
    }
    case 'SWITCH_PERSONA': {
      const p = action.persona;
      return { ...state, persona: p,
        toasts: [...state.toasts, { id: Date.now(), msg: 'Switched to ' + PERSONAS[p].label, type:'success' }] };
    }
    case 'SWITCH_ROLE':
      return { ...state, activeRole: action.role, activeUser: action.userId };
    
    case 'CREATE_GOAL': {
      const g = action.goal;
      const taskIds: string[] = [];
      const tasks = { ...state.tasks };
      (action.tasks || []).forEach((t, i) => {
        const tid = 't_' + g.id + '_' + i;
        taskIds.push(tid);
        tasks[tid] = { id:tid, goalId:g.id, customerId:g.customerId, title:t.title,
          description:t.description || '', type:t.type || 'custom', ownerId:g.ownerId,
          dueDate:t.dueDate || g.dueDate, status:'todo', visibility:'internal', outcomeNote:null,
          source:'manual', actionName:null, actionSourceId:null, trigger:null, firedAt:null,
          emailId:null, emailSubject:null, emailFrom:null };
      });
      const goals = { ...state.goals, [g.id]: { ...g, taskIds } };
      return { ...state, goals, tasks, lastCreatedGoalId:g.id,
        toasts: [...state.toasts, { id: Date.now(),
          msg: 'Goal created with ' + taskIds.length + ' task' + (taskIds.length===1?'':'s'), type:'success' }] };
    }
    case 'ACCEPT_GOAL': {
      const goals = { ...state.goals, [action.goalId]: { ...state.goals[action.goalId], status: 'in_progress' } };
      return { ...state, goals, toasts: [...state.toasts, { id: Date.now(), msg: 'Goal accepted — plan is now in progress', type: 'success' }] };
    }
    
    case 'START_TASK': {
      const task = { ...state.tasks[action.taskId], status: 'in_progress' };
      const tasks = { ...state.tasks, [action.taskId]: task };
      const goal = state.goals[task.goalId];
      const goals = goal && goal.status === 'not_started'
        ? { ...state.goals, [task.goalId]: { ...goal, status: 'in_progress' } }
        : state.goals;
      return { ...state, tasks, goals, toasts: [...state.toasts, { id: Date.now(), msg: `Task started: "${task.title.substring(0,40)}..."`, type: 'success' }] };
    }
    
    case 'COMPLETE_TASK': {
      const task = { ...state.tasks[action.taskId], status: 'done', outcomeNote: action.note || 'Completed' };
      const tasks = { ...state.tasks, [action.taskId]: task };
      return { ...state, tasks, toasts: [...state.toasts, { id: Date.now(), msg: 'Task marked complete', type: 'success' }] };
    }
    
    case 'SKIP_TASK': {
      const task = { ...state.tasks[action.taskId], status: 'skipped', outcomeNote: action.reason };
      return { ...state, tasks: { ...state.tasks, [action.taskId]: task }, toasts: [...state.toasts, { id: Date.now(), msg: 'Task skipped', type: 'info' }] };
    }
    
    case 'QUALIFY_EXPANSION': {
      const opp = { ...state.expansionOpps[action.oppId], qualificationStatus: 'qualified' };
      return { ...state, expansionOpps: { ...state.expansionOpps, [action.oppId]: opp }, toasts: [...state.toasts, { id: Date.now(), msg: 'Opportunity qualified — ready for outreach', type: 'success' }] };
    }
    
    case 'CREATE_CRM_OPP': {
      const opp = { ...state.expansionOpps[action.oppId], crmOpportunityState: 'draft' };
      return { ...state, expansionOpps: { ...state.expansionOpps, [action.oppId]: opp }, toasts: [...state.toasts, { id: Date.now(), msg: 'Draft CRM opportunity created in Salesforce', type: 'success' }] };
    }
    
    case 'PUBLISH_GOAL': {
      const goal = { ...state.goals[action.goalId], publicationStatus: 'published', visibility: 'shared' };
      return { ...state, goals: { ...state.goals, [action.goalId]: goal }, toasts: [...state.toasts, { id: Date.now(), msg: 'Success plan published — customer can now view it', type: 'success' }] };
    }
    
    case 'CHANGE_GOAL_VISIBILITY': {
      const goal = { ...state.goals[action.goalId], visibility: action.visibility };
      return { ...state, goals: { ...state.goals, [action.goalId]: goal }, toasts: [...state.toasts, { id: Date.now(), msg: `Goal visibility changed to ${action.visibility}`, type: 'info' }] };
    }
    
    case 'SEND_EMAIL': {
      const tasks = { ...state.tasks };
      // Mark email task done if linked
      if(action.taskId && tasks[action.taskId]) tasks[action.taskId] = { ...tasks[action.taskId], status: 'done', outcomeNote: 'Email sent to customer' };
      return { ...state, tasks, toasts: [...state.toasts, { id: Date.now(), msg: `Email sent to ${action.recipient}`, type: 'success' }] };
    }
    
    case 'CREATE_TASK': {
      const id = action.taskId || ('t_new_' + Date.now());
      const task = { id, goalId: action.goalId || null, customerId: action.customerId || null,
        title: action.title, description: action.description || '', type: action.taskType || 'custom',
        ownerId: action.ownerId || state.activeUser || 'maya', dueDate: action.dueDate || null,
        status: 'todo', visibility: 'internal', outcomeNote: null, source: action.source || 'priority_queue',
        emailId: action.emailId || null, emailSubject: action.emailSubject || null, emailFrom: action.emailFrom || null,
        actionName: action.actionName || null, actionSourceId: action.actionSourceId || null,
        trigger: action.trigger || null, firedAt: action.firedAt || null };
      return { ...state, tasks: { ...state.tasks, [id]: task }, lastCreatedTaskId: id,
        toasts: [...state.toasts, { id: Date.now(), msg: 'Task created \u2014 "' + action.title.substring(0,44) + '"', type: 'success' }] };
    }

    case 'DISMISS_PRIORITY':
      return { ...state, dismissedPriority: [...state.dismissedPriority, action.itemId], toasts: [...state.toasts, { id: Date.now(), msg: 'Item dismissed', type: 'info' }] };
    
    case 'SNOOZE_PRIORITY':
      return { ...state, snoozedPriority: [...state.snoozedPriority, action.itemId], toasts: [...state.toasts, { id: Date.now(), msg: 'Snoozed for 7 days', type: 'info' }] };
    
    case 'UPDATE_RENEWAL_FORECAST': {
      const renewals = state.renewals.map(r => r.id === action.renewalId ? { ...r, forecast: action.forecast } : r);
      return { ...state, renewals, toasts: [...state.toasts, { id: Date.now(), msg: 'Renewal forecast updated', type: 'success' }] };
    }
    
    case 'TOGGLE_READ': {
      const readItems = state.readItems.includes(action.itemId)
        ? state.readItems.filter(id => id !== action.itemId)
        : [...state.readItems, action.itemId];
      return { ...state, readItems };
    }
    
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, { id: Date.now(), msg: action.msg, type: action.toastType || 'info' }] };
    
    case 'ADD_WIDGET':
      return { ...state, customWidgets: [...state.customWidgets, action.widget], toasts: [...state.toasts, { id: Date.now(), msg: 'Widget added to dashboard', type: 'success' }] };
    
    case 'REMOVE_WIDGET':
      return { ...state, customWidgets: state.customWidgets.filter(w => w.id !== action.widgetId) };
    
    case 'REORDER_WIDGETS':
      return { ...state, customWidgets: action.widgets };
    
    case 'DISMISS_TOAST':
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.id) };
    
    case 'CLONE_AUTOMATION_AS_ACTION': {
      // The Actions library is customer-scoped; ignore anything else
      if (!action.automation || action.automation.pillar !== 'customer') {
        return { ...state, toasts: [...state.toasts, { id: Date.now(), msg: 'Only customer automations can be published as Actions', type: 'info' }] };
      }
      const act = cloneAutomationToAction(action.automation, state.activeUser);
      return { ...state, actions: [act, ...(state.actions||[])],
        toasts: [...state.toasts, { id: Date.now(), msg: 'Published to the Actions library', type: 'success' }] };
    }
    case 'UPDATE_ACTION_MESSAGE': {
      const actions = (state.actions||[]).map(a => a.id !== action.actionId ? a : {
        ...a, steps: a.steps.map(st => st.key !== action.stepKey ? st : { ...st, subject:action.subject, body:action.body })
      });
      return { ...state, actions, toasts: [...state.toasts, { id: Date.now(), msg: 'Message updated', type: 'success' }] };
    }
    case 'SAVE_ACTION': {
      const a = action.action;
      const list = state.actions || [];
      const exists = a.id && list.some(x=>x.id===a.id);
      const saved = exists ? list.map(x=>x.id===a.id ? a : x)
                           : list.concat(Object.assign({}, a, { id:'act_' + Date.now().toString(36) }));
      return { ...state, actions: saved,
        toasts: [...state.toasts, { id: Date.now(), msg: exists ? 'Action updated' : 'Action created', type:'success' }] };
    }
    case 'TOGGLE_ACTION': {
      const actions = (state.actions||[]).map(a => a.id !== action.actionId ? a : { ...a, enabled: !a.enabled });
      return { ...state, actions };
    }
    case 'LOG_ATTR_CHANGE': {
      const entry = { id:'ac_' + Date.now().toString(36), customerId:action.customerId, field:action.field,
        from:action.from, to:action.to, reason:action.reason, by:state.activeUser || 'maya',
        at:new Date().toISOString() };
      return { ...state, attrChanges: [entry, ...(state.attrChanges||[])],
        toasts: [...state.toasts, { id: Date.now(), msg: (ATTR_LABELS[action.field]||{label:action.field}).label + ' updated \u2014 reason recorded on the timeline', type:'success' }] };
    }
    case 'CONNECT_MAILBOX':
      return { ...state, mailbox: { connected:true, provider:action.provider, address:action.address || 'maya.chen@cx42.io', synced:'just now',
          connectedOn: action.connectedOn || 'Today', scopes: action.scopes || ['Mail.Read','Mail.Send'], method: action.method || 'OAuth 2.0' },
        toasts: [...state.toasts, { id: Date.now(), msg: 'Mailbox connected', type: 'success' }] };

    // ── Email configuration (Admin › Email configuration) ──
    // A section-scoped merge so one tab's save never clobbers another's.
    case 'UPDATE_EMAIL_CONFIG': {
      const cfg = { ...state.emailConfig };
      if (action.section) cfg[action.section] = { ...cfg[action.section], ...action.patch };
      else Object.assign(cfg, action.patch);
      // Domain changes re-route every message, so recompute account mapping.
      const emails = (action.section === undefined || action.section === null)
        ? routeEmails(state.emails, cfg, state.customers) : state.emails;
      return { ...state, emailConfig: cfg, emails,
        toasts: [...state.toasts, { id: Date.now(), msg: action.msg || 'Email configuration saved', type:'success' }] };
    }
    case 'SET_EMAIL_DOMAINS': {
      const cfg = { ...state.emailConfig, companyDomains: action.companyDomains, excludedDomains: action.excludedDomains };
      return { ...state, emailConfig: cfg, emails: routeEmails(state.emails, cfg, state.customers),
        toasts: [...state.toasts, { id: Date.now(), msg: 'Domains updated \u2014 inbox re-routed', type:'success' }] };
    }
    case 'ADD_SUPPORT_MAILBOX':
      return { ...state, supportMailboxes: (state.supportMailboxes||[]).concat(action.mailbox),
        toasts: [...state.toasts, { id: Date.now(), msg: 'Support mailbox connected \u2014 ' + action.mailbox.address, type:'success' }] };
    case 'UPDATE_SUPPORT_MAILBOX':
      return { ...state, supportMailboxes: (state.supportMailboxes||[]).map(m =>
          m.id === action.id ? { ...m, ...action.patch } : (action.patch && action.patch.isDefault ? { ...m, isDefault:false } : m)),
        toasts: [...state.toasts, { id: Date.now(), msg: action.msg || 'Mailbox updated', type:'success' }] };
    case 'REMOVE_SUPPORT_MAILBOX':
      return { ...state, supportMailboxes: (state.supportMailboxes||[]).filter(m=>m.id!==action.id),
        toasts: [...state.toasts, { id: Date.now(), msg: 'Mailbox disconnected', type:'info' }] };
    case 'SET_DKIM':
      return { ...state, emailConfig: { ...state.emailConfig, dkim: { ...state.emailConfig.dkim, ...action.patch } },
        toasts: [...state.toasts, { id: Date.now(), msg: action.msg || 'DKIM updated', type:'success' }] };
    case 'TOGGLE_BLACKLIST': {
      const bl = state.emailConfig.blacklist;
      return { ...state, emailConfig: { ...state.emailConfig, blacklist: { ...bl,
          entries: bl.entries.map(e => e.id===action.id ? { ...e, active: !e.active } : e) } },
        toasts: [...state.toasts, { id: Date.now(), msg: action.msg || 'Blacklist updated', type:'info' }] };
    }
    case 'MAP_EMAIL_TO_ACCOUNT':
      return { ...state, emails: (state.emails||[]).map(e => e.id===action.emailId
          ? { ...e, customerId: action.customerId, pinnedCustomerId: action.customerId,
              routing: { ...(e.routing||{}), bucket:'mapped', reason:'Mapped manually by ' + (action.by || 'an agent') + '.' } } : e),
        toasts: [...state.toasts, { id: Date.now(), msg: 'Email mapped to the account', type:'success' }] };
    case 'DISCONNECT_MAILBOX':
      return { ...state, mailbox: { connected:false, provider:null, address:'', synced:'' },
        toasts: [...state.toasts, { id: Date.now(), msg: 'Mailbox disconnected', type: 'info' }] };
    case 'SYNC_MAILBOX':
      return { ...state, mailbox: { ...state.mailbox, synced:'just now' },
        toasts: [...state.toasts, { id: Date.now(), msg: 'Mailbox synced', type: 'success' }] };
    case 'MARK_EMAIL_READ':
      return { ...state, emails: (state.emails||[]).map(e => e.id === action.emailId ? { ...e, unread:false } : e) };
    case 'TOGGLE_ASSISTANT':
      return { ...state, assistantOpen: !state.assistantOpen };
    
    case 'SET_ASSISTANT_CONTEXT':
      return { ...state, assistantContext: action.context };
    
    default:
      return state;
  }
}

export {
  appReducer,
};
