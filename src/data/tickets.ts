import { cxHash } from '@/data/core';
const TICKET_GATE_DEFAULTS = {
  firstResponse: {
    enabled: true,
    blocking: true,          // false = warn but allow the reply through
    label: 'First response',
    fields: [
      { key:'Category',            required:true,  help:'What the customer is actually reporting.' },
      { key:'Product area',        required:true,  help:'Which team owns this if it needs to move.' },
      { key:'Priority',            required:true,  help:'Confirm or correct the auto-assigned priority.' },
      { key:'First response type', required:true,  help:'What this first reply actually gives the customer.' },
      { key:'Escalate to tier 2',  required:true,  help:'Decide now, not after the SLA clock runs down.' },
      { key:'Reproducible',        required:false, help:'Optional at first contact \u2014 often not known yet.' },
    ],
  },
  resolution: {
    enabled: true,
    blocking: true,
    label: 'Resolution',
    triggerStatuses: ['Resolved','Closed'],
    fields: [
      { key:'Root cause',          required:true,  help:'What actually caused it \u2014 not what the symptom was.' },
      { key:'Resolution type',     required:true,  help:'How it was closed out.' },
      { key:'Resolution summary',  required:true,  help:'Two or three lines the next agent can act on.' },
      { key:'Preventable',         required:true,  help:'Could a product or process change have stopped this?' },
      { key:'Knowledge article',   required:true,  help:'Deflection only works if the answer gets written down.' },
      { key:'Customer confirmed',  required:false, help:'Optional \u2014 not every customer replies to confirm.' },
    ],
  },
};


const TICKET_ACTIONS = [
  { id:'tact_p1', name:'P1 critical incident SOP', category:'Escalation', tone:'red', icon: undefined,
    when:'A critical ticket is raised, or an existing ticket is escalated to P1.',
    summary:'Keeps communication tight while engineering works the incident, so the commercial relationship survives the outage.',
    appliesWhen:(t)=> t.severity==='critical',
    steps:[
      { t:'Acknowledge to the customer with a named owner and a next-update time', due:'Within 15 min', owner:'Support' },
      { t:'Post the incident in #cs-escalations with account ARR and renewal date', due:'Within 30 min', owner:'Support' },
      { t:'Confirm business impact and how many users are blocked', due:'Within 1 hour', owner:'Support' },
      { t:'Open an engineering escalation with reproduction steps attached', due:'Within 2 hours', owner:'Support lead' },
      { t:'Send an update at the promised cadence even when nothing has changed', due:'Every 4 hours', owner:'Support' },
      { t:'Brief the account owner so they are not blindsided by the customer', due:'Same day', owner:'Support  CSM' },
    ]},
  { id:'tact_sla', name:'SLA breach recovery SOP', category:'SLA', tone:'amber', icon:'\u23F1',
    when:'A ticket has breached its SLA target, or is within an hour of breaching.',
    summary:'Recovers the relationship after a missed commitment and prevents a second breach on the same ticket.',
    appliesWhen:(t)=> t.sla==='breached' || t.sla==='at_risk',
    steps:[
      { t:'Send a written apology naming the missed target, without excuses', due:'Immediately', owner:'Support' },
      { t:'Commit to a specific next-response time and set a reminder', due:'Immediately', owner:'Support' },
      { t:'Reassign to a named owner if the current owner is unavailable', due:'Within 1 hour', owner:'Support lead' },
      { t:'Log the breach reason against the ticket for the weekly review', due:'Same day', owner:'Support' },
    ]},
  { id:'tact_sentiment', name:'Negative sentiment recovery SOP', category:'Relationship', tone:'purple', icon: undefined,
    when:'Ticket sentiment turns negative, or the customer escalates in tone.',
    summary:'Moves the conversation off email before frustration hardens into a churn signal.',
    appliesWhen:(t)=> t.sentiment==='negative',
    steps:[
      { t:'Stop replying by email and offer a call within 24 hours', due:'Today', owner:'Support' },
      { t:'Read the full thread before the call so nothing is repeated back', due:'Before the call', owner:'Support' },
      { t:'Bring the account owner onto the call if renewal is inside 90 days', due:'Before the call', owner:'Support + CSM' },
      { t:'Summarise agreed next steps in writing within an hour of the call', due:'Same day', owner:'Support' },
    ]},
  { id:'tact_revenue', name:'High-revenue account SOP', category:'Commercial', tone:'green', icon: undefined,
    when:'A ticket on an account with material ARR exposure.',
    summary:'Ensures support decisions on large accounts account for the commercial stakes, not just the technical severity.',
    appliesWhen:(t)=> (t.revenueImpact||0) >= 150000,
    steps:[
      { t:'Flag the ticket to the account owner and log a risk record', due:'Same day', owner:'Support  CSM' },
      { t:'Check the renewal date before promising any timeline', due:'Same day', owner:'Support' },
      { t:'Route to a senior engineer rather than the standard queue', due:'Within 4 hours', owner:'Support lead' },
    ]},
  { id:'tact_aging', name:'Ageing ticket SOP', category:'Queue hygiene', tone:'blue', icon: undefined,
    when:'A ticket has been open more than five days without resolution.',
    summary:'Breaks the stall on tickets that have quietly slipped down the queue.',
    appliesWhen:(t)=> (t.age||0) > 5 && t.status!=='resolved',
    steps:[
      { t:'Review the thread and identify what is actually blocking closure', due:'Today', owner:'Support' },
      { t:'Chase the blocking party \u2014 customer, engineering or third party', due:'Today', owner:'Support' },
      { t:'If waiting on the customer, set the status correctly so the clock pauses', due:'Today', owner:'Support' },
      { t:'Escalate to the support lead if blocked more than 48 further hours', due:'In 2 days', owner:'Support' },
    ]},
  { id:'tact_close', name:'Resolution and closure SOP', category:'Closure', tone:'teal', icon: undefined,
    when:'A fix is confirmed and the ticket is ready to close.',
    summary:'Closes the loop properly so the resolution is reusable and the customer record stays complete.',
    appliesWhen:(t)=> true,
    steps:[
      { t:'Confirm the fix with the reporter before closing, not after', due:'Before closing', owner:'Support' },
      { t:'Write the root cause in plain language on the ticket', due:'At closure', owner:'Support' },
      { t:'Attach the resolution to the account timeline', due:'At closure', owner:'Support' },
      { t:'Send the CSAT survey unless the ticket was a P1', due:'At closure', owner:'System' },
    ]},
];

function actionsForTicket(ticket){
  if (!ticket) return [];
  return TICKET_ACTIONS.filter(a => { try { return a.appliesWhen(ticket); } catch { return false; } });
}

const TICKET_SAVED_FILTERS = [
  { id:'all',        label:'All tickets',        fn:(t)=>true },
  { id:'unresolved', label:'Unresolved',         fn:(t)=>t.status!=='resolved' },
  { id:'breached',   label:'SLA breached',       fn:(t)=>t.sla==='breached' },
  { id:'at_risk',    label:'SLA at risk',        fn:(t)=>t.sla==='at_risk' },
  { id:'critical',   label:'Critical',           fn:(t)=>t.severity==='critical' },
  { id:'negative',   label:'Negative sentiment', fn:(t)=>t.sentiment==='negative' },
  { id:'aging',      label:'Ageing > 5 days',    fn:(t)=>t.age>5 && t.status!=='resolved' },
  { id:'revenue',    label:'High revenue impact',fn:(t)=>(t.revenueImpact||0)>=150000 },
];

const SLA_TARGET_HOURS = { critical:4, high:8, medium:24, low:48 };

function ticketSla(t){
  const target = SLA_TARGET_HOURS[t.severity] || 24;
  // The data carries an SLA state, not a clock, so derive elapsed hours from that
  // state. Deriving it from ticket age alone made healthy tickets read "Due now",
  // because a 5-day-old ticket exceeds an 8-hour first-response target.
  const seed = cxHash(t.id);
  const elapsed = t.sla === 'breached'  ? target + (seed % Math.max(2, Math.round(target * 2)))
                : t.sla === 'at_risk'   ? Math.round(target * (0.80 + (seed % 15) / 100))
                : Math.round(target * (0.15 + (seed % 40) / 100));
  const remaining = target - elapsed;
  return { target, elapsed, remaining,
    breached: t.sla==='breached',
    atRisk: t.sla==='at_risk',
    pct: Math.max(0, Math.min(100, Math.round((elapsed/target)*100))),
    label: t.sla==='breached' ? 'Breached ' + Math.abs(remaining) + 'h ago'
         : remaining <= 0 ? 'Due now'
         : remaining < 24 ? remaining + 'h remaining'
         : Math.round(remaining/24) + 'd remaining' };
}

const TICKET_FIELD_DEFS = [
  { key:'Status',              type:'select', options:['Open','In progress','Awaiting customer','Pending third party','Resolved','Closed'] },
  { key:'Priority',            type:'select', options:['P1 \u2014 Critical','P2 \u2014 High','P3 \u2014 Normal','P4 \u2014 Low'] },
  { key:'Assignee',            type:'select', options:['Maya Chen','James Park','Sarah Kim','Amara Osei','Unassigned'] },
  { key:'Group',               type:'select', options:['Tier 1 Support','Tier 2 Support','Data Platform','Integrations','Billing Operations','Proactive Support pod','Customer Success'] },
  { key:'Category',            type:'select', options:['Data pipeline','Authentication','Reporting','Integrations','Performance','Billing'] },
  { key:'Root cause',          type:'select', options:['Bug','Configuration','Third-party','User error','Capacity','Unknown'] },
  { key:'Product area',        type:'select', options:['Analytics','Platform','Data Pipeline','Integrations'] },
  { key:'Escalate to tier 2',  type:'select', options:['No','Yes'] },
  { key:'Error type',          type:'text' },
  // ── captured at first response ──
  { key:'First response type', type:'select', options:['Acknowledgement','Information requested','Workaround provided','Resolution provided','Escalated on first touch'] },
  { key:'Reproducible',        type:'select', options:['Yes','No','Not yet attempted'] },
  // ── captured at resolution ──
  { key:'Resolution type',     type:'select', options:['Fixed \u2014 code change','Fixed \u2014 configuration','Workaround accepted','Answered \u2014 no defect','Duplicate','Not reproducible','Withdrawn by customer'] },
  { key:'Resolution summary',  type:'textarea' },
  { key:'Preventable',         type:'select', options:['No','Yes \u2014 product change','Yes \u2014 process change','Yes \u2014 documentation'] },
  { key:'Knowledge article',   type:'select', options:['Created','Updated','Existing article linked','Not needed'] },
  { key:'Customer confirmed',  type:'select', options:['Yes','No','No response'] },
];

const TICKET_PRIMARY_FIELDS = ['Status','Priority','Assignee','Category','Group'];

export {
  SLA_TARGET_HOURS,
  TICKET_ACTIONS,
  TICKET_FIELD_DEFS,
  TICKET_GATE_DEFAULTS,
  TICKET_PRIMARY_FIELDS,
  TICKET_SAVED_FILTERS,
  actionsForTicket,
  ticketSla,
};
