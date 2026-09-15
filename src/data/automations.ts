const AUTO_PILLARS = [
  { id:'ticket',   label:'Tickets',   singular:'ticket',   icon:'\u{1F3AB}', tone:'red',   desc:'React to changes on support tickets \u2014 priority, status, SLA, escalation.' },
  { id:'customer', label:'Customers', singular:'customer', icon:'\u{1F3E2}', tone:'blue',  desc:'React to changes on accounts \u2014 health, adoption, churn, renewal, sentiment.' },
  { id:'contact',  label:'Contacts',  singular:'contact',  icon:'\u{1F464}', tone:'purple',desc:'React to changes on people \u2014 role, engagement, buying role, departure.' },
];
const AUTO_PILLAR_META = { ticket:AUTO_PILLARS[0], customer:AUTO_PILLARS[1], contact:AUTO_PILLARS[2] };

const AUTO_FIELDS = {
  ticket: [
    { key:'subject',          label:'Subject',           type:'text' },
    { key:'priority',         label:'Priority',          type:'enum', values:['P1 \u2014 Critical','P2 \u2014 High','P3 \u2014 Normal','P4 \u2014 Low'] },
    { key:'status',           label:'Status',            type:'enum', values:['Open','Pending','Awaiting customer','Resolved','Closed'] },
    { key:'sla_breach_at',    label:'SLA breach time',   type:'date' },
    { key:'escalation_score', label:'Escalation score',  type:'number' },
    { key:'root_cause',       label:'Root cause',        type:'enum', values:['Bug','Configuration','User error','Third-party','Unknown'] },
    { key:'revenue_impact',   label:'Revenue impact',    type:'currency' },
    { key:'error_type',       label:'Error type',        type:'text' },
    { key:'assignee',         label:'Assignee',          type:'enum', values:['Maya Chen','Amara Osei','Sam Rivera','Unassigned'] },
    { key:'csat_score',       label:'CSAT score',        type:'number' },
  ],
  customer: [
    { key:'account_name',   label:'Account name',      type:'text' },
    { key:'segment',        label:'Segment',           type:'enum', values:['Enterprise','Mid-market','SMB'] },
    { key:'arr',            label:'ARR',               type:'currency' },
    { key:'health_score',   label:'Health score',      type:'number' },
    { key:'health_band',    label:'Health band',       type:'enum', values:['Green','Yellow','Red'] },
    { key:'adoption_score', label:'Adoption score',    type:'number' },
    { key:'churn_status',   label:'Churn status',      type:'enum', values:['Healthy','Likely to churn','Confirmed churn'] },
    { key:'renewal_date',   label:'Renewal date',      type:'date' },
    { key:'sentiment',      label:'Sentiment',         type:'enum', values:['Positive','Neutral','Negative'] },
    { key:'seat_util',      label:'Seat utilisation',  type:'percent' },
    { key:'is_strategic',   label:'Strategic account', type:'bool' },
    { key:'nps',            label:'NPS',               type:'number' },
  ],
  contact: [
    { key:'full_name',    label:'Full name',        type:'text' },
    { key:'contact_role', label:'Role',             type:'enum', values:['Champion','Executive Sponsor','Admin','End user','Blocker'] },
    { key:'email',        label:'Email',            type:'text' },
    { key:'linkedin_url', label:'LinkedIn URL',     type:'text' },
    { key:'engagement',   label:'Engagement level', type:'enum', values:['High','Medium','Low','None'] },
    { key:'buying_role',  label:'Buying role',      type:'enum', values:['Decision maker','Influencer','Champion','Blocker','End user'] },
    { key:'open_rate',    label:'Email open rate',  type:'percent' },
    { key:'has_departed', label:'Departed company', type:'bool' },
  ],
};

const AUTO_OPERATORS = {
  text:     ['is','is not','contains','does not contain','is empty','is not empty'],
  enum:     ['changes to','changed from','is','is not','is any of'],
  number:   ['rises above','drops below','is','is not','increases by','decreases by'],
  currency: ['rises above','drops below','is','is not','increases by','decreases by'],
  percent:  ['rises above','drops below','is','is not','increases by','decreases by'],
  date:     ['is within next','is more than','is before','is after','is set','is not set'],
  bool:     ['changes to true','changes to false','is true','is false'],
};

const fieldMeta = (pillar, key) => (AUTO_FIELDS[pillar] || []).find(f => f.key === key) || null;

const AUTO_ACTIONS = [
  { group:'Ticket',   items:[
    { id:'t_priority', label:'Set ticket priority',  icon:'\u{1F3AB}', arg:'enum', values:AUTO_FIELDS.ticket[1].values },
    { id:'t_status',   label:'Set ticket status',    icon:'\u{1F3AB}', arg:'enum', values:AUTO_FIELDS.ticket[2].values },
    { id:'t_assign',   label:'Assign ticket to',     icon:'\u{1F464}', arg:'enum', values:AUTO_FIELDS.ticket[8].values },
    { id:'t_escalate', label:'Escalate ticket',      icon:'\u26A0',    arg:'none' },
    { id:'t_note',     label:'Add private note',     icon:'\u{1F4DD}', arg:'text' },
  ]},
  { group:'Customer', items:[
    { id:'c_health',   label:'Set health band',      icon:'\u2665',    arg:'enum', values:AUTO_FIELDS.customer[4].values },
    { id:'c_churn',    label:'Set churn status',     icon:'\u{1F4C9}', arg:'enum', values:AUTO_FIELDS.customer[6].values },
    { id:'c_goal',     label:'Create goal from template', icon:'\u{1F3AF}', arg:'text' },
    { id:'c_risk',     label:'Open risk record',     icon:'\u{1F6A8}', arg:'text' },
    { id:'c_qbr',      label:'Schedule QBR',         icon:'\u{1F4C5}', arg:'none' },
    { id:'c_owner',    label:'Reassign account CSM', icon:'\u{1F504}', arg:'enum', values:['Maya Chen','Amara Osei','Sam Rivera'] },
  ]},
  { group:'Contact',  items:[
    { id:'p_engage',   label:'Set engagement level', icon:'\u{1F4C8}', arg:'enum', values:AUTO_FIELDS.contact[4].values },
    { id:'p_role',     label:'Set buying role',      icon:'\u{1F3F7}', arg:'enum', values:AUTO_FIELDS.contact[5].values },
    { id:'p_flag',     label:'Flag champion departure', icon:'\u{1F6A9}', arg:'none' },
    { id:'p_email',    label:'Send email to contact',icon:'\u2709',    arg:'text' },
  ]},
  { group:'Notify & tasks', items:[
    { id:'n_slack',    label:'Send Slack message',   icon:'\u{1F4AC}', arg:'text' },
    { id:'n_teams',    label:'Send MS Teams message',icon:'\u{1F5A5}', arg:'text' },
    { id:'n_email',    label:'Send email',           icon:'\u2709',    arg:'text' },
    { id:'n_manager',  label:'Notify manager',       icon:'\u{1F4E3}', arg:'none' },
    { id:'n_task',     label:'Create task',          icon:'\u2705',    arg:'text' },
    { id:'n_webhook',  label:'Fire webhook',         icon:'\u{1F517}', arg:'text' },
  ]},
];
const actionMeta = (id) => { for (const g of AUTO_ACTIONS) { const f = g.items.find(i=>i.id===id); if (f) return f; } return null; };

const AUTOMATIONS = [
  { id:'a1', pillar:'ticket', name:'P1 opened on a strategic account', enabled:true, runs:34, last:'2h ago',
    event:{ field:'priority', mode:'changes_to', to:'P1 \u2014 Critical' },
    logic:'AND',
    conditions:[ { pillar:'customer', field:'is_strategic', op:'is true', val:'' },
                 { pillar:'customer', field:'health_band', op:'is any of', val:'Yellow, Red' } ],
    actions:[ { id:'n_slack', arg:'#cs-escalations' }, { id:'n_manager', arg:'' }, { id:'c_risk', arg:'P1 on strategic account' } ] },
  { id:'a2', pillar:'ticket', name:'Escalation score spikes', enabled:true, runs:12, last:'Yesterday',
    event:{ field:'escalation_score', mode:'rises_above', to:'70' },
    logic:'AND',
    conditions:[ { pillar:'ticket', field:'status', op:'is not', val:'Resolved' } ],
    actions:[ { id:'t_escalate', arg:'' }, { id:'n_slack', arg:'#cs-escalations' } ] },
  { id:'a3', pillar:'ticket', name:'CSAT detractor after resolution', enabled:false, runs:0, last:'Never run',
    event:{ field:'csat_score', mode:'drops_below', to:'3' },
    logic:'AND',
    conditions:[ { pillar:'customer', field:'arr', op:'rises above', val:'100000' } ],
    actions:[ { id:'n_task', arg:'Call the detractor within 24h' }, { id:'c_risk', arg:'CSAT detractor' } ] },

  { id:'a4', pillar:'customer', name:'Health band falls to Red', enabled:true, runs:9, last:'3d ago',
    event:{ field:'health_band', mode:'changes_to', to:'Red' },
    logic:'AND',
    conditions:[ { pillar:'customer', field:'arr', op:'rises above', val:'50000' } ],
    actions:[ { id:'c_goal', arg:'Adoption recovery' }, { id:'n_manager', arg:'' }, { id:'n_slack', arg:'#cs-health' } ] },
  { id:'a5', pillar:'customer', name:'Adoption drops before renewal', enabled:true, runs:6, last:'5d ago',
    event:{ field:'adoption_score', mode:'drops_below', to:'60' },
    logic:'AND',
    conditions:[ { pillar:'customer', field:'renewal_date', op:'is within next', val:'90 days' },
                 { pillar:'contact',  field:'engagement',   op:'is any of',      val:'Low, None' } ],
    actions:[ { id:'c_goal', arg:'Pre-renewal adoption push' }, { id:'n_task', arg:'Book enablement session' } ] },
  { id:'a6', pillar:'customer', name:'Sentiment turns negative', enabled:true, runs:15, last:'6h ago',
    event:{ field:'sentiment', mode:'changes_to', to:'Negative' },
    logic:'OR',
    conditions:[ { pillar:'ticket', field:'priority', op:'is any of', val:'P1 \u2014 Critical, P2 \u2014 High' },
                 { pillar:'customer', field:'churn_status', op:'is', val:'Likely to churn' } ],
    actions:[ { id:'n_slack', arg:'#cs-alerts' }, { id:'c_churn', arg:'Likely to churn' } ] },

  { id:'a7', pillar:'contact', name:'Champion leaves the company', enabled:true, runs:4, last:'1w ago',
    event:{ field:'has_departed', mode:'changes_to', to:'true' },
    logic:'AND',
    conditions:[ { pillar:'contact', field:'buying_role', op:'is any of', val:'Champion, Decision maker' } ],
    actions:[ { id:'p_flag', arg:'' }, { id:'c_risk', arg:'Champion departure' }, { id:'n_manager', arg:'' }, { id:'n_task', arg:'Identify replacement champion' } ] },
  { id:'a8', pillar:'contact', name:'Engagement decays on key contact', enabled:true, runs:11, last:'2d ago',
    event:{ field:'engagement', mode:'changes_to', to:'Low' },
    logic:'AND',
    conditions:[ { pillar:'contact',  field:'buying_role', op:'is any of', val:'Champion, Decision maker' },
                 { pillar:'customer', field:'health_band', op:'is not',    val:'Green' } ],
    actions:[ { id:'n_task', arg:'Re-engage key contact' }, { id:'p_email', arg:'Check-in template' } ] },
  { id:'a9', pillar:'contact', name:'New executive sponsor identified', enabled:false, runs:2, last:'2w ago',
    event:{ field:'contact_role', mode:'changes_to', to:'Executive Sponsor' },
    logic:'AND', conditions:[],
    actions:[ { id:'n_slack', arg:'#cs-wins' }, { id:'n_task', arg:'Send exec welcome pack' } ] },
];

const modeLabel = (m) => ({ changes_to:'changes to', changed_from:'changes from', any_change:'changes at all',
                            rises_above:'rises above', drops_below:'drops below' })[m] || m;

const ACTION_PILLARS = [
  { id:'customer', label:'Customers', singular:'customer', icon:'\u{1F3E2}', tone:'blue',
    desc:'Health, adoption, churn, renewal, sentiment and ARR changes.' },
  { id:'contact',  label:'Contacts',  singular:'contact',  icon:'\u{1F464}', tone:'purple',
    desc:'Role, engagement, buying role and departure changes.' },
];

const ACTION_SCOPES = [
  { id:'my_accounts', label:'My accounts only', desc:'Runs only on the accounts assigned to you.' },
  { id:'selected',    label:'Selected accounts', desc:'Runs on the accounts you pick below.' },
];

const CSM_ACTIONS_EXTRA = [
  { id:'act_jp1', name:'Renewal inside 60 days with no QBR', ownerId:'james', pillar:'customer',
    event:{ field:'renewal_date', mode:'any_change', to:'' }, logic:'AND',
    conditions:[{ pillar:'customer', field:'health_band', op:'is not', val:'Green' }],
    scope:'my_accounts', accountIds:[], enabled:true, runs:5, lastRun:'2d ago', createdAt:'Jul 30, 2025',
    steps:[ { key:'n_task_0', id:'n_task', label:'Create task', icon:'\u2705', arg:'Book the pre-renewal QBR', editable:false, channel:null, subject:'', body:'' },
            { key:'n_slack_1', id:'n_slack', label:'Send Slack message', icon:'\u{1F4AC}', arg:'#cs-renewals', editable:true, channel:'Slack message',
              subject:'', body:'Renewal approaching on {{customer.name}} with no QBR booked.' } ] },
  { id:'act_sk1', name:'Champion engagement drops', ownerId:'sarah', pillar:'contact',
    event:{ field:'engagement', mode:'changes_to', to:'Low' }, logic:'AND',
    conditions:[{ pillar:'contact', field:'buying_role', op:'is any of', val:'Champion' }],
    scope:'my_accounts', accountIds:[], enabled:true, runs:8, lastRun:'6h ago', createdAt:'Aug 05, 2025',
    steps:[ { key:'p_email_0', id:'p_email', label:'Send email to contact', icon:'\u2709', arg:'Check-in template', editable:true, channel:'Email to contact',
              subject:'Checking in on {{customer.name}}', body:'Hi {{contact.first_name}},\n\nIt has been a while since we caught up properly. Are you free for a short call this week?\n\nBest,\n{{owner.name}}' } ] },
  { id:'act_sk2', name:'Strategic account turns amber', ownerId:'sarah', pillar:'customer',
    event:{ field:'health_band', mode:'changes_to', to:'Yellow' }, logic:'AND',
    conditions:[{ pillar:'customer', field:'is_strategic', op:'is true', val:'' }],
    scope:'selected', accountIds:['meridian','northstar'], enabled:false, runs:0, lastRun:'Never run', createdAt:'Aug 09, 2025',
    steps:[ { key:'n_manager_0', id:'n_manager', label:'Notify manager', icon:'\u{1F4E3}', arg:'', editable:false, channel:null, subject:'', body:'' } ] },
];

const ACTION_COMMS = { n_slack:'Slack message', n_teams:'MS Teams message', n_email:'Email', p_email:'Email to contact' };
const isCommsAction = (id) => Object.prototype.hasOwnProperty.call(ACTION_COMMS, id);

function defaultCommsBody(actionId, automation){
  const pm = AUTO_PILLAR_META[automation.pillar];
  const f  = fieldMeta(automation.pillar, automation.event.field);
  const trigger = `${f ? f.label : automation.event.field} ${modeLabel(automation.event.mode)}${automation.event.to ? ' ' + automation.event.to : ''}`;
  if (actionId === 'n_slack' || actionId === 'n_teams')
    return `:rotating_light: *{{customer.name}}* — ${trigger}.\nARR {{customer.arr}} · Owner {{customer.owner}}\nOpen the account: {{customer.link}}`;
  if (actionId === 'n_email')
    return `Hi {{owner.first_name}},\n\n${pm.label.slice(0,-1)} alert on {{customer.name}}: ${trigger.toLowerCase()}.\n\nCurrent health is {{customer.health_band}} and the renewal is {{customer.renewal_date}}. Worth a look before your next check-in.\n\n— CX42`;
  return `Hi {{contact.first_name}},\n\nI wanted to reach out personally about your account. ${trigger}, and I'd like to make sure we're supporting you properly.\n\nAre you free for a short call this week?\n\nBest,\n{{owner.name}}`;
}
function defaultCommsSubject(actionId, automation){
  const f = fieldMeta(automation.pillar, automation.event.field);
  if (actionId === 'n_email')  return `{{customer.name}} — ${f ? f.label.toLowerCase() : 'attribute'} alert`;
  if (actionId === 'p_email')  return `Checking in on {{customer.name}}`;
  return '';
}

function cloneAutomationToAction(automation, clonedBy): any {
  return {
    id: 'act_' + automation.id + '_' + Date.now().toString(36),
    sourceId: automation.id,
    name: automation.name,
    pillar: automation.pillar,
    event: automation.event,
    logic: automation.logic,
    conditions: automation.conditions,
    enabled: true,
    clonedBy: clonedBy || 'maya',
    clonedAt: new Date().toISOString().slice(0,10),
    runs: 0,
    lastRun: 'Never run',
    steps: automation.actions.map((a, i) => {
      const meta = actionMeta(a.id);
      const comms = isCommsAction(a.id);
      return {
        key: a.id + '_' + i,
        id: a.id,
        label: meta ? meta.label : a.id,
        icon: meta ? meta.icon : '\u2699',
        arg: a.arg || '',
        editable: comms,
        channel: comms ? ACTION_COMMS[a.id] : null,
        subject: comms ? defaultCommsSubject(a.id, automation) : '',
        body: comms ? defaultCommsBody(a.id, automation) : '',
      };
    }),
  };
}

const SEEDED_ACTIONS = (function(){
  // Actions are a customer-pillar concept only — seed from customer automations
  const seedIds = AUTOMATIONS.filter(a=>a.pillar==='customer').map(a=>a.id);
  return seedIds.map((id, i) => {
    const auto = AUTOMATIONS.find(a=>a.id===id);
    if (!auto) return null;
    const act = cloneAutomationToAction(auto, 'maya');
    act.id = 'act_seed_' + id;
    act.clonedAt = ['Jul 20, 2025','Jul 12, 2025','Aug 01, 2025','Jun 28, 2025'][i % 4];
    act.runs = [9, 6, 15, 4][i % 4];
    act.lastRun = ['3d ago','5d ago','6h ago','1w ago'][i % 4];
    act.ownerId = 'maya';            // CSMs own the actions they build
    act.scope = 'my_accounts';
    act.accountIds = [];
    act.createdAt = act.clonedAt;
    return act;
  }).filter(Boolean).concat(typeof CSM_ACTIONS_EXTRA !== 'undefined' ? CSM_ACTIONS_EXTRA : []);
})();

export {
  ACTION_COMMS,
  ACTION_PILLARS,
  ACTION_SCOPES,
  AUTOMATIONS,
  AUTO_ACTIONS,
  AUTO_FIELDS,
  AUTO_OPERATORS,
  AUTO_PILLARS,
  AUTO_PILLAR_META,
  CSM_ACTIONS_EXTRA,
  SEEDED_ACTIONS,
  actionMeta,
  cloneAutomationToAction,
  defaultCommsBody,
  defaultCommsSubject,
  fieldMeta,
  isCommsAction,
  modeLabel,
};
