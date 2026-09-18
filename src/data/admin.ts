import {
  BarChart3, Building2, CheckSquare, CircleDot, Contact, Gauge, Hash, Mail, MessageSquare, PenLine, Server, Slack, Star, Target, ThumbsUp, Ticket, Users, type LucideIcon,
} from 'lucide-react';

/**
 * Admin configuration data, lifted verbatim out of the legacy quarantine.
 * The only edits are the `icon` props: the MVP carried an emoji on every
 * record, and those are now lucide components.
 *
 * `tone` values are the legacy palette names. The admin screens map them
 * onto the semantic scale; they are kept here so the data stays a faithful
 * copy of the original.
 */
export const ADMIN_ENTITIES = [
  { id:'company', label:'Company fields', icon:Building2, tone:'blue',   desc:'Account-level attributes used across health, renewal and segmentation.' },
  { id:'contact', label:'Contact fields', icon:Contact, tone:'purple', desc:'Individual stakeholder attributes for relationship mapping.' },
  { id:'task',    label:'Task fields',    icon:CheckSquare,    desc:'Task attributes used in SOPs and goal execution.', tone:'teal' },
  { id:'plan',    label:'Plan / Goal fields', icon:Target, tone:'green', desc:'Success plan and goal attributes used in QBRs and reporting.' },
];

export const ADMIN_FIELDS = {
  company: [
    { label:'Account name',      key:'account_name',      type:'Text',       req:true,  system:true,  usage:'All views' },
    { label:'Segment',           key:'segment',           type:'Dropdown',   req:true,  system:true,  usage:'Segmentation, routing' },
    { label:'ARR',               key:'arr',               type:'Currency',   req:true,  system:true,  usage:'Renewals, portfolio' },
    { label:'Health score',      key:'health_score',      type:'Number',     req:true,  system:true,  usage:'Health engine, triggers' },
    { label:'Adoption score',    key:'adoption_score',    type:'Number',     req:false, system:true,  usage:'Usage tab, triggers' },
    { label:'Churn status',      key:'churn_status',      type:'Dropdown',   req:false, system:false, usage:'Overview, triggers' },
    { label:'Renewal date',      key:'renewal_date',      type:'Date',       req:true,  system:true,  usage:'Renewals, forecasting' },
    { label:'Sentiment',         key:'sentiment',         type:'Dropdown',   req:false, system:false, usage:'Overview, signals' },
    { label:'Seat utilisation',  key:'seat_util',         type:'Percent',    req:false, system:false, usage:'Expansion signals' },
    { label:'Strategic account', key:'is_strategic',      type:'Checkbox',   req:false, system:false, usage:'Prioritisation' },
  ],
  ticket: [
    { label:'Subject',           key:'subject',           type:'Text',       req:true,  system:true,  usage:'Support tab' },
    { label:'Priority',          key:'priority',          type:'Dropdown',   req:true,  system:true,  usage:'Escalation, triggers' },
    { label:'Status',            key:'status',            type:'Dropdown',   req:true,  system:true,  usage:'Support tab' },
    { label:'Group',             key:'group',             type:'Dropdown',   req:true,  system:false, usage:'Routing, assignment, reporting' },
    { label:'SLA breach time',   key:'sla_breach_at',     type:'DateTime',   req:false, system:true,  usage:'SLA alerts' },
    { label:'Escalation score',  key:'escalation_score',  type:'Number',     req:false, system:false, usage:'Support summary' },
    { label:'Root cause',        key:'root_cause',        type:'Dropdown',   req:false, system:false, usage:'Trend analysis' },
    { label:'Revenue impact',    key:'revenue_impact',    type:'Currency',   req:false, system:false, usage:'Risk scoring' },
    { label:'Error type',        key:'error_type',        type:'Text',       req:false, system:false, usage:'Error tracking' },
  ],
  agent: [
    { label:'Agent name',        key:'agent_name',        type:'Text',       req:true,  system:true,  usage:'Assignment' },
    { label:'Role',              key:'role',              type:'Dropdown',   req:true,  system:true,  usage:'Permissions' },
    { label:'Assigned accounts', key:'assigned_accounts', type:'Lookup',     req:false, system:true,  usage:'Portfolio views' },
    { label:'Workload score',    key:'workload_score',    type:'Number',     req:false, system:false, usage:'Routing balance' },
    { label:'Avg NPS',           key:'avg_nps',           type:'Number',     req:false, system:false, usage:'Performance' },
    { label:'Response time SLA', key:'response_sla',      type:'Duration',   req:false, system:false, usage:'SLA reporting' },
  ],
  contact: [
    { label:'Full name',         key:'full_name',         type:'Text',       req:true,  system:true,  usage:'Contacts tab' },
    { label:'Role',              key:'contact_role',      type:'Dropdown',   req:true,  system:true,  usage:'Org chart' },
    { label:'Email',             key:'email',             type:'Email',      req:true,  system:true,  usage:'Outreach' },
    { label:'LinkedIn URL',      key:'linkedin_url',      type:'URL',        req:false, system:false, usage:'Intelligence tab' },
    { label:'Engagement level',  key:'engagement',        type:'Dropdown',   req:false, system:false, usage:'Relationship health' },
    { label:'Buying role',       key:'buying_role',       type:'Dropdown',   req:false, system:false, usage:'Org chart markings' },
    { label:'Email open rate',   key:'open_rate',         type:'Percent',    req:false, system:false, usage:'Success tab' },
  ],
  task: [
    { label:'Task title',        key:'task_title',        type:'Text',       req:true,  system:true,  usage:'My Work' },
    { label:'Task type',         key:'task_type',         type:'Dropdown',   req:true,  system:true,  usage:'SOPs' },
    { label:'Owner',             key:'owner_id',          type:'Lookup',     req:true,  system:true,  usage:'Assignment' },
    { label:'Due date',          key:'due_date',          type:'Date',       req:false, system:true,  usage:'Reminders' },
    { label:'Visibility',        key:'visibility',        type:'Dropdown',   req:false, system:false, usage:'Customer sharing' },
    { label:'Outcome note',      key:'outcome_note',      type:'Long text',  req:false, system:false, usage:'Goal reporting' },
  ],
  plan: [
    { label:'Goal title',        key:'goal_title',        type:'Text',       req:true,  system:true,  usage:'Goals tab' },
    { label:'Goal type',         key:'goal_type',         type:'Dropdown',   req:true,  system:true,  usage:'SOPs' },
    { label:'Target date',       key:'target_date',       type:'Date',       req:true,  system:true,  usage:'Timeline' },
    { label:'Success criteria',  key:'success_criteria',  type:'Long text',  req:false, system:false, usage:'QBR reporting' },
    { label:'Business objective',key:'business_objective',type:'Long text',  req:false, system:false, usage:'Success tab' },
    { label:'Source',            key:'source',            type:'Dropdown',   req:false, system:true,  usage:'Attribution' },
    { label:'Health linkage',    key:'health_link',       type:'Lookup',     req:false, system:false, usage:'Health engine' },
  ],
};

export const SIGNAL_SOURCES = [
  { id:'usage',      label:'Product usage',    icon:BarChart3, tone:'blue',   status:'active',  freq:'Every 15 min',  coverage:92, source:'Vantage Analytics',
    desc:'Feature clicks, session depth, drop-offs and rage clicks streamed from the product.',
    metrics:[['Events / day','1.4M'],['Accounts covered','22 / 24'],['Signal lag','12 min']],
    settings:[['Track feature-level clicks',true],['Capture rage clicks',true],['Session replay retention',true],['Anonymous sessions',false]] },
  { id:'sentiment',  label:'Sentiment',        icon:MessageSquare, tone:'purple', status:'active',  freq:'On message',    coverage:88, source:'Email + Ticket NLP',
    desc:'Language-model scoring of email threads, ticket replies and meeting notes.',
    metrics:[['Messages scored','8,412'],['Avg confidence','0.86'],['Negative flags (30d)','37']],
    settings:[['Score inbound email',true],['Score ticket replies',true],['Score meeting transcripts',true],['Alert on sharp drops',true]] },
];

export const DRIVE_TEMPLATES = [
  { id:'tpl1', name:'Enterprise QBR deck',            kind:'QBR',  fmt:'PPTX', size:'4.2 MB',  owner:'Maya Chen',   updated:'Jul 28, 2025', uses:184, status:'published' },
  { id:'tpl2', name:'Mid-market QBR deck',            kind:'QBR',  fmt:'PPTX', size:'2.8 MB',  owner:'Maya Chen',   updated:'Jul 14, 2025', uses:96,  status:'published' },
  { id:'tpl3', name:'Executive business review',      kind:'QBR',  fmt:'PPTX', size:'5.1 MB',  owner:'Amara Osei',  updated:'Jun 30, 2025', uses:41,  status:'draft' },
  { id:'tpl4', name:'Adoption recovery goal',         kind:'Goal', fmt:'DOCX', size:'184 KB',  owner:'Maya Chen',   updated:'Jul 22, 2025', uses:212, status:'published' },
  { id:'tpl5', name:'Expansion qualification goal',   kind:'Goal', fmt:'DOCX', size:'156 KB',  owner:'Sam Rivera',  updated:'Jul 09, 2025', uses:78,  status:'published' },
  { id:'tpl6', name:'Renewal defence goal',           kind:'Goal', fmt:'DOCX', size:'168 KB',  owner:'Amara Osei',  updated:'Jun 18, 2025', uses:134, status:'published' },
  { id:'tpl7', name:'Annual success plan',            kind:'SOP', fmt:'XLSX', size:'320 KB',  owner:'Maya Chen',   updated:'Jul 25, 2025', uses:88,  status:'published' },
  { id:'tpl8', name:'Onboarding 90-day plan',         kind:'SOP', fmt:'XLSX', size:'268 KB',  owner:'Sam Rivera',  updated:'May 30, 2025', uses:57,  status:'published' },
  { id:'tpl9', name:'Mutual action plan',             kind:'SOP', fmt:'XLSX', size:'204 KB',  owner:'Amara Osei',  updated:'Jul 02, 2025', uses:29,  status:'draft' },
];

export const USAGE_EVENTS = [
  { id:'ue1', name:'Export report clicked',   selector:'button[data-cx="export-report"]', page:'/reports',      type:'Click',      captured:12840, tagged:true,  autocaptured:false },
  { id:'ue2', name:'Dashboard viewed',        selector:'route:/dashboards/*',              page:'/dashboards',   type:'Page view',  captured:48211, tagged:true,  autocaptured:false },
  { id:'ue3', name:'Connector added',         selector:'button.connector-add',             page:'/integrations', type:'Click',      captured:1904,  tagged:true,  autocaptured:false },
  { id:'ue4', name:'Scheduled report saved',  selector:'form#schedule-report >> submit',   page:'/reports/new',  type:'Form submit',captured:3120,  tagged:true,  autocaptured:false },
  { id:'ue5', name:'AI Insights opened',      selector:'a[href^="/insights"]',             page:'/insights',     type:'Click',      captured:642,   tagged:true,  autocaptured:false },
  { id:'ue6', name:'div.toolbar > button:nth-child(3)', selector:'div.toolbar > button:nth-child(3)', page:'/dashboards', type:'Click', captured:2210, tagged:false, autocaptured:true },
  { id:'ue7', name:'a.nav-link[href="/settings"]',      selector:'a.nav-link[href="/settings"]',      page:'(all)',       type:'Click', captured:5401, tagged:false, autocaptured:true },
];

export const USAGE_PAGE_RULES = [
  { id:'pr1', name:'Reports',    match:'starts with', value:'/reports',      events:4 },
  { id:'pr2', name:'Dashboards', match:'starts with', value:'/dashboards',   events:6 },
  { id:'pr3', name:'Admin',      match:'starts with', value:'/admin',        events:2, exclude:true },
];

export const USAGE_SNIPPET = "<script>\n  (function(w,d,k){w.sia=w.sia||function(){(w.sia.q=w.sia.q||[]).push(arguments)};\n   var s=d.createElement('script');s.async=1;\n   s.src='https://cdn.sia.com/listener.js?k='+k;\n   d.head.appendChild(s);})(window,document,'PK_live_8f2c41');\n  sia('identify', { accountId: ACCOUNT_ID, userId: USER_ID });\n<' + '/script>";

export const CONVO_PARSERS = [
  { id:'vtt',  label:'WebVTT (.vtt)',        note:'Zoom, Teams and Meet exports.' },
  { id:'srt',  label:'SubRip (.srt)',        note:'Common recorder output.' },
  { id:'txt',  label:'Plain text (.txt)',    note:'Timestamp Speaker: text, one line per turn.' },
  { id:'json', label:'JSON transcript',      note:'Gong and Chorus API payloads.' },
];

export const CONVO_MAPPING = [
  { field:'Speaker',   from:'speaker | name | participant' },
  { field:'Timestamp', from:'start | at | offset' },
  { field:'Text',      from:'text | content | words' },
  { field:'Account',   from:'matched on attendee email domain' },
];

export const COMMUNITY_PLATFORMS = [
  { id:'native',   name:'Sia Communities', note:'Built in. Spaces, categories and moderation managed here.', connected:true },
  { id:'discourse',name:'Discourse',        note:'Read topics, replies and likes via API key.',              connected:false },
  { id:'khoros',   name:'Khoros',           note:'Enterprise community sync.',                                connected:false },
  { id:'circle',   name:'Circle',           note:'Spaces and member activity.',                               connected:false },
  { id:'discord',  name:'Discord',          note:'Channel activity for developer communities.',               connected:false },
];

export const COMMUNITY_SPACES = [
  { id:'cs1', name:'Product announcements', posts:184, members:1240, moderated:true,  signal:'low' },
  { id:'cs2', name:'Ask the community',     posts:912, members:1806, moderated:true,  signal:'high' },
  { id:'cs3', name:'Feature requests',      posts:441, members:980,  moderated:true,  signal:'high' },
  { id:'cs4', name:'Integrations & API',    posts:308, members:612,  moderated:false, signal:'medium' },
];

export const SURVEY_QUESTION_TYPES = [
  { id:'rating5',  label:'1\u20135 rating',      icon:Star },
  { id:'thumbs',   label:'Thumbs up / down',     icon:ThumbsUp },
  { id:'scale10',  label:'0\u201310 scale',      icon:Hash },
  { id:'choice',   label:'Multiple choice',      icon:CircleDot },
  { id:'text',     label:'Open text',            icon:PenLine },
  { id:'nps',      label:'NPS question',         icon:Gauge },
];

export const DEFAULT_CSAT_SURVEY = [
  { id:'q1', type:'rating5', title:'How satisfied were you with this resolution?', required:true,  options:[] },
  { id:'q2', type:'choice',  title:'What could we have done better?', required:false,
    options:['Faster response','Clearer communication','Better first answer','Nothing \u2014 it was good'] },
  { id:'q3', type:'text',    title:'Anything else you would like us to know?', required:false, options:[] },
];

export const SURVEY_TRIGGERS = ['On ticket resolution','On ticket close','7 days after onboarding','After a QBR','Manual send only'];

export const NPS_SNIPPET = "<script>\n  window.siaNPS = {\n    surveyId: 'nps_q3_2025',\n    accountId: ACCOUNT_ID,\n    userId: USER_ID,\n    position: 'bottom-right',\n    delay: 8000,          // ms after page load\n    frequency: 90         // days between prompts for the same user\n  };\n<' + '/script>\n<script async src=\"https://cdn.sia.com/nps.js?k=PK_live_8f2c41\"><' + '/script>";

export const NPS_SEGMENTS = ['All users','Admins only','Users active in the last 30 days','Accounts renewing in 90 days','Enterprise accounts'];

export const HYGIENE_RULES = [
  { id:'hy1', name:'First response within SLA',      weight:25, target:'95%',  current:'91%', healthy:false },
  { id:'hy2', name:'No ticket open beyond 14 days',  weight:20, target:'100%', current:'96%', healthy:false },
  { id:'hy3', name:'Every P1 has a written RCA',     weight:20, target:'100%', current:'100%',healthy:true },
  { id:'hy4', name:'Reopen rate below 8%',           weight:15, target:'<8%',  current:'5.2%',healthy:true },
  { id:'hy5', name:'CSAT survey sent on resolution', weight:10, target:'90%',  current:'93%', healthy:true },
  { id:'hy6', name:'Tickets categorised at close',   weight:10, target:'95%',  current:'88%', healthy:false },
];

export const SLA_PRIORITIES = [
  { id:'p1', label:'P1 \u2014 Critical', tone:'red',   respond:'15 minutes', resolve:'4 hours',   clock:'24\u00d77',           breach:12, met:88 },
  { id:'p2', label:'P2 \u2014 High',     tone:'amber', respond:'1 hour',     resolve:'8 hours',   clock:'24\u00d77',           breach:7,  met:93 },
  { id:'p3', label:'P3 \u2014 Normal',   tone:'blue',  respond:'4 hours',    resolve:'2 business days', clock:'Business hours', breach:4, met:96 },
  { id:'p4', label:'P4 \u2014 Low',      tone:'slate', respond:'1 business day', resolve:'5 business days', clock:'Business hours', breach:1, met:99 },
];

export const SLA_CALENDARS = [
  { id:'cal1', name:'Global 24\u00d77',        hours:'All hours',            tz:'UTC',              holidays:'None',            teams:'Tier 1 support' },
  { id:'cal2', name:'India business hours', hours:'09:00 \u2013 18:30',    tz:'Asia/Kolkata',     holidays:'India 2025 (12)', teams:'APAC CSM pod' },
  { id:'cal3', name:'US business hours',    hours:'08:00 \u2013 17:00',    tz:'America/New_York', holidays:'US 2025 (11)',    teams:'AMER CSM pod' },
  { id:'cal4', name:'EMEA business hours',  hours:'09:00 \u2013 17:30',    tz:'Europe/London',    holidays:'UK 2025 (8)',     teams:'EMEA CSM pod' },
];

export const SLA_ESCALATIONS = [
  { at:'50% of target elapsed',  who:'Assigned agent',          how:'In-app + email' },
  { at:'75% of target elapsed',  who:'Team lead',               how:'Slack' },
  { at:'Target breached',        who:'Support manager + CSM',   how:'Slack + email' },
  { at:'2\u00d7 target elapsed', who:'Head of Support',         how:'Slack, email, SMS' },
];

export const SLA_PAUSE_CONDITIONS = [
  ['Awaiting customer response', true],
  ['Pending third-party vendor', true],
  ['Scheduled maintenance window', false],
  ['Outside business hours (business-hours calendars only)', true],
  ['Ticket on hold by agent', false],
];

export const ASSIGNMENT_STRATEGIES = ['Skill based','Load balanced','Round robin'];

export const ASSIGNMENT_RULES = {
  ticket: [
    { id:'at1', name:'Critical tickets  Tier 1 pod',   match:'Priority is P1 \u2014 Critical',        strategy:'Skill based',   target:'Tier 1 support', order:1, enabled:true,  handled:412 },
    { id:'at2', name:'Enterprise tickets  named agent', match:'Segment is Enterprise',              strategy:'Skill based', target:'Named support agent', order:2, enabled:true,  handled:288 },
    { id:'at3', name:'APAC hours  APAC pod',            match:'Created 00:00\u201308:00 UTC',        strategy:'Load balanced', target:'APAC pod', order:3, enabled:true,  handled:196 },
    { id:'at4', name:'Everything else  round robin',    match:'No other rule matched',              strategy:'Round robin',   target:'General support queue', order:4, enabled:true, handled:1104 },
    { id:'at5', name:'Billing keywords  Finance',       match:'Subject contains "invoice, billing"', strategy:'Skill based',  target:'Finance ops', order:5, enabled:false, handled:0 },
  ],
  company: [
    { id:'ac1', name:'Strategic accounts  senior CSM',  match:'Strategic account is true',          strategy:'Manual',        target:'Maya Chen, Amara Osei', order:1, enabled:true,  handled:6 },
    { id:'ac2', name:'Enterprise  enterprise pod',      match:'Segment is Enterprise',              strategy:'Load balanced', target:'Enterprise CSM pod', order:2, enabled:true,  handled:9 },
    { id:'ac3', name:'ARR above $150K  named CSM',      match:'ARR is above $150,000',              strategy:'Load balanced', target:'Senior CSM bench', order:3, enabled:true,  handled:11 },
    { id:'ac4', name:'India-based  APAC pod',           match:'Region is APAC',                      strategy:'Load balanced', target:'APAC CSM pod', order:4, enabled:true,  handled:4 },
    { id:'ac5', name:'New logos  onboarding pod',       match:'Account age is under 90 days',        strategy:'Round robin',   target:'Onboarding team', order:5, enabled:false, handled:0 },
  ],
};

export const ASSIGNMENT_OBJECTS = [
  { id:'ticket',  label:'Ticket assignment',  icon:Ticket, tone:'red',  desc:'Route incoming support tickets to the right agent, pod or queue.' },
  { id:'company', label:'Company assignment', icon:Building2, tone:'blue', desc:'Assign accounts to CSMs by segment, ARR, territory or workload.' },
];

export const NOTIFY_CHANNELS = [
  { id:'email', label:'Email',    icon:Mail,    tone:'blue',   status:'connected', detail:'notifications@sia.io \u00b7 SendGrid',
    desc:'Transactional and digest email delivered to agents, CSMs and managers.',
    settings:[['Daily digest at 08:00',true],['Immediate for P1 breaches',true],['Include ticket body in email',false],['Weekly portfolio summary',true]],
    stats:[['Sent (30d)','12,480'],['Open rate','54%'],['Bounces','18']] },
  { id:'slack', label:'Slack',    icon:Slack, tone:'purple', status:'connected', detail:'sia-workspace \u00b7 6 channels mapped',
    desc:'Real-time alerts pushed into team channels and direct messages.',
    settings:[['Post to #cs-alerts',true],['DM the account owner',true],['Thread follow-up updates',true],['Mention @here on P1',false]],
    stats:[['Messages (30d)','3,204'],['Channels','6'],['Click-through','41%']] },
  { id:'teams', label:'MS Teams', icon:Users, tone:'teal',   status:'not_connected', detail:'Not connected',
    desc:'Adaptive-card notifications delivered to Teams channels and chats.',
    settings:[['Post to CS Alerts channel',false],['Chat the account owner',false],['Use adaptive cards',false],['Mention on breach',false]],
    stats:[['Messages (30d)','\u2014'],['Channels','0'],['Click-through','\u2014']] },
];

export const NOTIFY_EVENTS = [
  { id:'ev1', label:'SLA breach imminent',       email:true,  slack:true,  teams:false, audience:'Agent, team lead' },
  { id:'ev2', label:'SLA breached',              email:true,  slack:true,  teams:false, audience:'Manager, CSM' },
  { id:'ev3', label:'Health band drops to red',  email:true,  slack:true,  teams:false, audience:'Account owner' },
  { id:'ev4', label:'Renewal within 30 days',    email:true,  slack:false, teams:false, audience:'Account owner, manager' },
  { id:'ev5', label:'Expansion signal detected', email:false, slack:true,  teams:false, audience:'Account owner, AE' },
  { id:'ev6', label:'Champion departure',        email:true,  slack:true,  teams:false, audience:'Account owner' },
  { id:'ev7', label:'New account assigned',      email:true,  slack:true,  teams:false, audience:'Assigned CSM' },
  { id:'ev8', label:'Goal overdue',              email:false, slack:true,  teams:false, audience:'Goal owner' },
];

export const AGENT_MAILBOXES = {
  maya:   { connected:true,  provider:'gmail', method:'OAuth 2.0',      address:'maya.chen@sia.io',    connectedOn:'Jun 14, 2025', synced:'12 minutes ago', scopes:['read','send','calendar'] },
  james:  { connected:true,  provider:'o365',  method:'Microsoft Graph', address:'james.park@sia.io',   connectedOn:'Jul 02, 2025', synced:'38 minutes ago', scopes:['read','send'] },
  sarah:  { connected:true,  provider:'gmail', method:'OAuth 2.0',      address:'sarah.kim@sia.io',    connectedOn:'May 28, 2025', synced:'4 hours ago',    scopes:['read','send','calendar'] },
  daniel: { connected:false, provider:null,    method:null,             address:'daniel.ortiz@sia.io', connectedOn:null,           synced:null,             scopes:[] },
  priya:  { connected:false, provider:null,    method:null,             address:'priya.raman@sia.io',  connectedOn:null,           synced:null,             scopes:[] },
};

export const EMAIL_AUTH_METHODS = [
  { id:'oauth_google', label:'Google OAuth 2.0',  icon:Mail,    status:'enabled',
    note:'Agents authorise Gmail and Calendar from Profile settings. Tokens refresh automatically.',
    detail:['Scopes: gmail.readonly, gmail.send, calendar.events','Token lifetime: 60 minutes, auto-refreshed','Consent screen: verified'] },
  { id:'graph_ms',     label:'Microsoft Graph',   icon:Mail, status:'enabled',
    note:'Delegated Graph permissions for Outlook mail and calendar.',
    detail:['Scopes: Mail.Read, Mail.Send, Calendars.ReadWrite','Tenant: sia.onmicrosoft.com','Admin consent: granted'] },
  { id:'imap',         label:'IMAP / SMTP',       icon:Server, status:'disabled',
    note:'Manual server configuration. Less secure \u2014 only enable where OAuth is unavailable.',
    detail:['Requires per-agent app passwords','No calendar sync','Not recommended for new setups'] },
];

export const FORWARDING_RULES = [
  { id:'fw1', address:'support@sia.io',       target:'Support queue',        creates:'Ticket', verified:true,  received:1284, note:'Primary inbound support address.' },
  { id:'fw2', address:'escalations@sia.io',   target:'Escalation queue',     creates:'Ticket \u00b7 P1', verified:true, received:96, note:'Auto-sets priority to P1 on arrival.' },
  { id:'fw3', address:'success@sia.io',       target:'Assigned CSM',         creates:'Ticket', verified:true,  received:412, note:'Routed by account domain to the owning CSM.' },
  { id:'fw4', address:'renewals@sia.io',      target:'Renewals queue',       creates:'Ticket', verified:false, received:0,   note:'DNS verification pending \u2014 add the MX record.' },
];

export const AGENT_AUDIT = {
  maya: [
    { at:'Aug 17, 2025 \u00b7 08:02', event:'Login',  ip:'103.21.244.18', device:'Chrome 128 \u00b7 macOS',  ok:true },
    { at:'Aug 16, 2025 \u00b7 19:41', event:'Logout', ip:'103.21.244.18', device:'Chrome 128 \u00b7 macOS',  ok:true },
    { at:'Aug 16, 2025 \u00b7 08:14', event:'Login',  ip:'103.21.244.18', device:'Chrome 128 \u00b7 macOS',  ok:true },
    { at:'Aug 15, 2025 \u00b7 22:07', event:'Logout', ip:'49.207.180.62', device:'Safari \u00b7 iOS',        ok:true },
    { at:'Aug 15, 2025 \u00b7 09:03', event:'Login',  ip:'49.207.180.62', device:'Safari \u00b7 iOS',        ok:true },
  ],
  james: [
    { at:'Aug 17, 2025 \u00b7 07:20', event:'Login',  ip:'82.14.60.7',    device:'Edge 127 \u00b7 Windows',  ok:true },
    { at:'Aug 16, 2025 \u00b7 18:55', event:'Logout', ip:'82.14.60.7',    device:'Edge 127 \u00b7 Windows',  ok:true },
    { at:'Aug 16, 2025 \u00b7 07:31', event:'Login',  ip:'82.14.60.7',    device:'Edge 127 \u00b7 Windows',  ok:true },
  ],
  sarah: [
    { at:'Aug 16, 2025 \u00b7 14:12', event:'Login',  ip:'171.61.9.240',  device:'Chrome 128 \u00b7 Windows',ok:true },
    { at:'Aug 16, 2025 \u00b7 14:10', event:'Failed login', ip:'171.61.9.240', device:'Chrome 128 \u00b7 Windows', ok:false },
    { at:'Aug 15, 2025 \u00b7 17:44', event:'Logout', ip:'171.61.9.240',  device:'Chrome 128 \u00b7 Windows',ok:true },
  ],
  daniel: [
    { at:'Aug 17, 2025 \u00b7 06:48', event:'Login',  ip:'59.92.14.201',  device:'Chrome 128 \u00b7 macOS',  ok:true },
    { at:'Aug 14, 2025 \u00b7 20:02', event:'Logout', ip:'59.92.14.201',  device:'Chrome 128 \u00b7 macOS',  ok:true },
  ],
  priya: [
    { at:'Aug 12, 2025 \u00b7 11:15', event:'Login',  ip:'106.51.72.9',   device:'Safari \u00b7 macOS',      ok:true },
    { at:'Aug 12, 2025 \u00b7 09:58', event:'Logout', ip:'106.51.72.9',   device:'Safari \u00b7 macOS',      ok:true },
  ],
};

export const AGENT_META = {
  maya:   { roleLabel:'CSM',           lastActive:'2 minutes ago',  status:'active',   accounts:8, joined:'Mar 2023' },
  james:  { roleLabel:'CSM',           lastActive:'1 hour ago',     status:'active',   accounts:7, joined:'Sep 2023' },
  sarah:  { roleLabel:'Senior CSM',    lastActive:'Yesterday',      status:'active',   accounts:6, joined:'Jan 2023' },
  daniel: { roleLabel:'Manager',       lastActive:'3 hours ago',    status:'active',   accounts:0, joined:'Nov 2022' },
  priya:  { roleLabel:'Team Lead',     lastActive:'5 days ago',     status:'inactive', accounts:3, joined:'Feb 2024' },
};

export const APP_ROLES = [
  { id:'csm',        label:'CSM',           tone:'blue',   desc:'Owns a portfolio of accounts and the day-to-day success motion.' },
  { id:'senior_csm', label:'Senior CSM',    tone:'purple', desc:'Owns strategic accounts and mentors other CSMs.' },
  { id:'team_lead',  label:'Team Lead',     tone:'teal',   desc:'Runs a pod of CSMs; owns queue coverage and process adherence.' },
  { id:'manager',    label:'Manager',       tone:'green',  desc:'Owns the function \u2014 reporting, configuration and staffing.' },
  { id:'support',    label:'Support Agent', tone:'amber',  desc:'Works tickets; limited access to commercial account data.' },
];

export const PRIVILEGE_GROUPS = [
  { group:'Customers', icon:'', items:[
    { key:'cust.view_own',      label:'View own portfolio',            desc:'See accounts where the user is the assigned owner.',            roles:[1,1,1,1,1] },
    { key:'cust.view_all',      label:'View all accounts',             desc:'See every account regardless of ownership.',                    roles:[0,1,1,1,0] },
    { key:'cust.edit_fields',   label:'Edit account fields',           desc:'Change health inputs, churn status, sentiment and segment.',    roles:[1,1,1,1,0] },
    { key:'cust.reassign',      label:'Reassign account owner',        desc:'Move an account to a different CSM.',                           roles:[0,0,1,1,0] },
    { key:'cust.export',        label:'Export customer data',          desc:'Download account lists and health history as CSV.',             roles:[0,1,1,1,0] },
    { key:'cust.delete',        label:'Delete an account',             desc:'Permanently remove an account record.',                         roles:[0,0,0,1,0] },
  ]},
  { group:'Goals & tasks', icon:'', items:[
    { key:'goal.create',        label:'Create goals',                  desc:'Raise a new goal on any account they can view.',                roles:[1,1,1,1,0] },
    { key:'goal.edit_own',      label:'Edit own goals',                desc:'Amend goals they own.',                                          roles:[1,1,1,1,0] },
    { key:'goal.edit_any',      label:'Edit any goal',                 desc:'Amend goals owned by other users.',                              roles:[0,0,1,1,0] },
    { key:'goal.delete',        label:'Delete goals',                  desc:'Remove a goal and its child tasks.',                             roles:[0,0,1,1,0] },
    { key:'task.complete',      label:'Complete tasks',                desc:'Mark tasks done or skipped.',                                    roles:[1,1,1,1,1] },
    { key:'task.reassign',      label:'Reassign tasks',                desc:'Move a task to another owner.',                                  roles:[0,1,1,1,0] },
  ]},
  { group:'Tickets', icon:'', items:[
    { key:'tkt.view',           label:'View tickets',                  desc:'Read tickets on accounts they can view.',                        roles:[1,1,1,1,1] },
    { key:'tkt.reply',          label:'Reply to tickets',              desc:'Post public replies to the customer.',                           roles:[0,0,0,0,1] },
    { key:'tkt.note',           label:'Add private notes',             desc:'Post internal-only notes on a ticket.',                          roles:[1,1,1,1,1] },
    { key:'tkt.priority',       label:'Change ticket priority',        desc:'Raise or lower ticket priority.',                                roles:[0,1,1,1,1] },
    { key:'tkt.escalate',       label:'Escalate a ticket',             desc:'Push a ticket to tier 2 or engineering.',                        roles:[1,1,1,1,1] },
    { key:'tkt.close',          label:'Close tickets',                 desc:'Resolve or close a ticket.',                                     roles:[0,0,1,1,1] },
  ]},
  { group:'Actions', icon:'', items:[
    { key:'act.view',           label:'View the action library',       desc:'See published actions and what they do.',                        roles:[1,1,1,1,1] },
    { key:'act.edit_message',   label:'Edit action messages',          desc:'Personalise the email or chat copy an action sends.',            roles:[1,1,1,1,0] },
    { key:'act.pause',          label:'Pause or resume an action',     desc:'Temporarily stop an action from running.',                       roles:[0,1,1,1,0] },
    { key:'act.clone',          label:'Publish an action from an automation', desc:'Clone a customer automation into the action library.',    roles:[0,0,0,1,0] },
  ]},
  { group:'Automation (admin)', icon:'', items:[
    { key:'auto.view',          label:'View automations',              desc:'Open the automation builder in read mode.',                      roles:[0,0,1,1,0] },
    { key:'auto.create',        label:'Create or edit automations',    desc:'Build triggers, conditions and actions.',                        roles:[0,0,0,1,0] },
    { key:'auto.delete',        label:'Delete automations',            desc:'Permanently remove an automation.',                              roles:[0,0,0,1,0] },
  ]},
  { group:'Sia Drive', icon:'', items:[
    { key:'drive.view',         label:'View Drive content',            desc:'Read SOPs, QBR decks and goal templates.',                  roles:[1,1,1,1,1] },
    { key:'drive.upload',       label:'Upload templates and SOPs',     desc:'Add new files to the Drive library.',                            roles:[0,1,1,1,0] },
    { key:'drive.publish',      label:'Publish or unpublish',          desc:'Move a Drive item between draft and published.',                 roles:[0,0,1,1,0] },
    { key:'drive.delete',       label:'Delete Drive content',          desc:'Permanently remove a template or SOP.',                          roles:[0,0,0,1,0] },
  ]},
  { group:'Reporting', icon:'', items:[
    { key:'rpt.own',            label:'View own performance',          desc:'See their own portfolio metrics.',                               roles:[1,1,1,1,1] },
    { key:'rpt.team',           label:'View team performance',         desc:'See metrics across a pod of users.',                             roles:[0,0,1,1,0] },
    { key:'rpt.org',            label:'View org-wide reporting',       desc:'See metrics across the whole customer base.',                    roles:[0,0,0,1,0] },
    { key:'rpt.export',         label:'Export reports',                desc:'Download report data.',                                          roles:[0,1,1,1,0] },
  ]},
  { group:'Administration', icon:'', items:[
    { key:'adm.fields',         label:'Manage field manager',          desc:'Add or retire fields on any object.',                            roles:[0,0,0,1,0] },
    { key:'adm.sla',            label:'Manage SLA configuration',      desc:'Edit targets, calendars, escalation and pause rules.',           roles:[0,0,0,1,0] },
    { key:'adm.assignment',     label:'Manage assignment policies',    desc:'Edit ticket and company routing rules.',                         roles:[0,0,0,1,0] },
    { key:'adm.notifications',  label:'Manage notifications',          desc:'Configure channels and per-event delivery.',                     roles:[0,0,0,1,0] },
    { key:'adm.connectors',     label:'Manage connectors',             desc:'Connect or disconnect integrations.',                            roles:[0,0,0,1,0] },
    { key:'adm.signals',        label:'Manage signal sources',         desc:'Tune the sources feeding health and triggers.',                   roles:[0,0,0,1,0] },
    { key:'adm.roles',          label:'Manage roles and privileges',   desc:'Grant or revoke privileges on this page.',                        roles:[0,0,0,1,0] },
  ]},
  { group:'Data & privacy', icon:'', items:[
    { key:'data.pii',           label:'View contact PII',              desc:'See contact email addresses and phone numbers.',                 roles:[1,1,1,1,1] },
    { key:'data.bulk_edit',     label:'Bulk edit records',             desc:'Apply a change across many records at once.',                    roles:[0,0,1,1,0] },
    { key:'data.audit',         label:'View the audit log',            desc:'See who changed what and when.',                                 roles:[0,0,0,1,0] },
  ]},
];

/** Every privilege, flattened — the roles matrix counts against this. */
export const ALL_PRIVILEGES = PRIVILEGE_GROUPS.flatMap((g) => g.items);

export type AdminIcon = LucideIcon;
