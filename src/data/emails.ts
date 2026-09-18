// ============================================================
// MAILBOX & EMAIL
// ============================================================
const EMAILS = [
  { id:'em1', customerId:'acme', from:'Sarah Mitchell', fromEmail:'sarah.mitchell@acme-analytics.io',
    to:'maya.chen@sia.io', subject:'Re: Data sync still failing after the weekend patch',
    received:'Aug 17, 2025 \u00b7 08:12', ago:'2h ago', unread:true, starred:true, hasAttachment:true,
    attachments:[{ name:'sync-error-log-aug17.txt', size:'46 KB' }],
    preview:'Maya \u2014 the sync failed again overnight. We are now 9 days into this and my team has stopped trusting the dashboards.',
    body:'Maya,\n\nThe sync failed again overnight, same error as before. We are now nine days into this issue and my team has effectively stopped trusting the dashboards \u2014 three of them went back to the old spreadsheet process this week.\n\nI have attached the error log from this morning. Can you give me a firm date? I have a board update on the 29th and I need to know whether to include the platform numbers or not.\n\nSarah' },

  { id:'em2', customerId:'globex', from:'Tom Rivera', fromEmail:'t.rivera@globexcloud.io',
    to:'maya.chen@sia.io', subject:'Renewal paperwork \u2014 who signs on your side?',
    received:'Aug 17, 2025 \u00b7 06:40', ago:'4h ago', unread:true, starred:false, hasAttachment:false, attachments:[],
    preview:'Procurement has the order form in review. They are asking who countersigns and whether the 3-year option is still on the table.',
    body:'Hi Maya,\n\nProcurement has the order form in review. Two questions before they can move it forward:\n\n1. Who countersigns on your side?\n2. Is the three-year option still available at the price we discussed in June?\n\nOur renewal date is the 14th so we have a little time, but I would rather not leave it to the last week.\n\nThanks,\nTom' },

  { id:'em3', customerId:'northstar', from:'Priya Anand', fromEmail:'priya@northstarlabs.com',
    to:'maya.chen@sia.io', subject:'Finance team wants access \u2014 how do we add seats?',
    received:'Aug 16, 2025 \u00b7 17:22', ago:'Yesterday', unread:false, starred:false, hasAttachment:false, attachments:[],
    preview:'Our finance team has been using Dan\u2019s login to pull reports. That is obviously not ideal \u2014 what does adding 12 seats look like?',
    body:'Hi Maya,\n\nSlightly awkward admission: our finance team has been sharing Dan\u2019s login to pull the monthly reports. That is obviously not ideal.\n\nWhat does adding around 12 seats look like commercially? And is there a way to give them a read-only role so they cannot change the shared dashboards?\n\nPriya' },

  { id:'em4', customerId:'meridian', from:'James Okafor', fromEmail:'j.okafor@meridianbrands.com',
    to:'maya.chen@sia.io', subject:'Thanks for the QBR \u2014 one follow-up',
    received:'Aug 16, 2025 \u00b7 11:05', ago:'Yesterday', unread:false, starred:false, hasAttachment:true,
    attachments:[{ name:'meridian-q3-notes.pdf', size:'1.2 MB' }],
    preview:'Good session yesterday. The exec team liked the adoption trend. One follow-up on the API rate limits we discussed.',
    body:'Maya,\n\nGood session yesterday \u2014 the exec team responded well to the adoption trend, particularly the time-to-insight numbers.\n\nOne follow-up: you mentioned the API rate limits could be raised for our integration workload. Could you send over what that involves and whether it affects our current tier?\n\nNotes from our side attached.\n\nJames' },

  { id:'em5', customerId:'vertex', from:'Elena Fischer', fromEmail:'elena.fischer@vertexai.co',
    to:'maya.chen@sia.io', subject:'Disappointed with the support response time',
    received:'Aug 15, 2025 \u00b7 19:48', ago:'2 days ago', unread:true, starred:true, hasAttachment:false, attachments:[],
    preview:'Three tickets this month have gone more than 48 hours without a substantive reply. This is not what we signed up for.',
    body:'Maya,\n\nI need to raise something. Three tickets this month have gone more than 48 hours without a substantive reply \u2014 not an acknowledgement, an actual answer.\n\nWhen we signed we were told enterprise support meant same-business-day response. That has not been our experience since June.\n\nI would like to understand what changed and what you are going to do about it.\n\nElena Fischer\nVP Engineering' },

  { id:'em6', customerId:'atlaspay', from:'Dan Kowalski', fromEmail:'dan.k@atlaspay.com',
    to:'maya.chen@sia.io', subject:'Out of office until the 25th',
    received:'Aug 15, 2025 \u00b7 09:00', ago:'2 days ago', unread:false, starred:false, hasAttachment:false, attachments:[],
    preview:'I am away until the 25th. For anything urgent please contact Marissa Cole who is covering my accounts.',
    body:'I am away from the office until August 25th with limited access to email.\n\nFor anything urgent relating to the platform rollout, please contact Marissa Cole (marissa.cole@atlaspay.com) who is covering.\n\nDan' },

  { id:'em7', customerId:'helio', from:'Aisha Bello', fromEmail:'aisha@helioworks.com',
    to:'maya.chen@sia.io', subject:'Can we bring forward the enablement session?',
    received:'Aug 14, 2025 \u00b7 15:30', ago:'3 days ago', unread:false, starred:false, hasAttachment:false, attachments:[],
    preview:'Our new analysts start on the 26th. Any chance we can move the session earlier so they are productive from week one?',
    body:'Hi Maya,\n\nTwo new analysts start with us on the 26th. Any chance we can move the enablement session earlier in that week so they are productive from day one rather than shadowing?\n\nHappy to work around your calendar.\n\nAisha' },

  // ── Internal: every participant is on a company domain, so never account-mapped
  { id:'em8', customerId:null, from:'James Park', fromEmail:'james.park@acme.com',
    to:'maya.chen@sia.io', cc:['sarah.kim@sia.io'], subject:'Weekly CSM sync \u2014 agenda for Monday',
    received:'Aug 17, 2025 \u00b7 07:55', ago:'3h ago', unread:true, starred:false, hasAttachment:false, attachments:[],
    preview:'Adding the renewal pipeline review to Monday. Anything you want on the agenda before I send it round?',
    body:'Maya,\n\nAdding the renewal pipeline review to Monday\u2019s sync. Anything you want on the agenda before I circulate it?\n\nJames' },

  { id:'em9', customerId:null, from:'Sia Finance', fromEmail:'billing@sia.io',
    to:'maya.chen@sia.io', subject:'Your expense claim for July has been approved',
    received:'Aug 16, 2025 \u00b7 09:30', ago:'Yesterday', unread:false, starred:false, hasAttachment:false, attachments:[],
    preview:'Expense claim EXP-4417 was approved and will be paid in the August cycle.',
    body:'Expense claim EXP-4417 has been approved and will be paid in the August cycle.\n\nSia Finance' },

  // ── Excluded domain: a personal address, deliberately never mapped
  { id:'em10', customerId:null, from:'Dev Raman', fromEmail:'devraman88@gmail.com',
    to:'maya.chen@sia.io', subject:'Following up on the analyst role',
    received:'Aug 15, 2025 \u00b7 14:10', ago:'2 days ago', unread:false, starred:false, hasAttachment:true,
    attachments:[{ name:'dev-raman-cv.pdf', size:'88 KB' }],
    preview:'I applied for the support analyst opening last week and wanted to check on the status.',
    body:'Hello Maya,\n\nI applied for the support analyst opening last week and wanted to check whether the team has had a chance to review.\n\nRegards,\nDev' },

  // ── External but no matching account domain
  { id:'em11', customerId:null, from:'Nadia Haddad', fromEmail:'n.haddad@brightpath-consulting.com',
    to:'support@acme.com', subject:'Partner integration \u2014 sandbox credentials',
    received:'Aug 14, 2025 \u00b7 10:05', ago:'3 days ago', unread:true, starred:false, hasAttachment:false, attachments:[],
    preview:'We are implementing on behalf of a shared client and need sandbox credentials for the API.',
    body:'Hello,\n\nWe are implementing on behalf of a shared client and need sandbox credentials for the API. Who should I speak to?\n\nNadia Haddad\nBrightPath Consulting' },
];

// ============================================================
// EMAIL INGESTION — config, mailboxes and the routing engine
// ------------------------------------------------------------
// Two kinds of mailbox feed the product:
//   1. Support mailboxes — shared, connected by an admin.
//   2. CSM mailboxes    — personal, connected by the CSM from Profile
//                         settings via OAuth. Admin sees them read-only.
// Every message pulled from an inbox is classified before it is shown:
// an external participant maps it to a customer account; no external
// participant means it is internal and is never mapped to an account.
// ============================================================

const SUPPORT_MAILBOXES = [
  { id:'mb_support', address:'support@acme.com', label:'Support', isDefault:true,
    provider:'o365', method:'Microsoft Graph', connected:true, connectedOn:'Mar 04, 2025', synced:'6 minutes ago',
    routesTo:'Support queue', creates:'Ticket', received30d:1284,
    scopes:['Mail.Read','Mail.Send'], owner:'Shared \u00b7 Support operations' },
  { id:'mb_proactive', address:'proactive-support@acme.com', label:'Proactive Support', isDefault:false,
    provider:'o365', method:'Microsoft Graph', connected:true, connectedOn:'Jun 18, 2025', synced:'21 minutes ago',
    routesTo:'Proactive Support pod', creates:'Ticket', received30d:342,
    scopes:['Mail.Read','Mail.Send'], owner:'Shared \u00b7 Proactive Support' },
];

const EMAIL_CONFIG_DEFAULTS = {
  // Domains — what counts as "us" and what must never be treated as a customer
  companyDomains: ['acme.com', 'sia.io'],
  excludedDomains: ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com'],

  // Threading — decided on headers, never on what the screen shows
  threading: { reopenWindowDays: 3, matchHeaders: true, forwardRepliesAsNote: true },

  // DKIM
  dkim: { domain: 'acme.com', selector: null, value: null, status: 'none' },

  // Loop protection — safety critical, not a nice-to-have
  loop: { detectAutoResponders: true, suppressAfterDetect: true,
          maxPerRecipientHour: 5, maxAutomationsPerTicketHour: 10,
          throttleOn: true, throttleWindowMin: 30 },

  // Surge blacklisting
  blacklist: { autoOnSurge: true, thresholdPerHour: 30, entries: [
    { id:'bl1', email:'noreply@monitor.vertexai.co', reason:'Surge \u2014 61 emails in one hour', at:'Aug 16, 2025 \u00b7 03:12', active:true },
    { id:'bl2', email:'alerts@atlaspay.com', reason:'Surge \u2014 44 emails in one hour', at:'Aug 09, 2025 \u00b7 22:40', active:false },
  ] },
};

function emailDomainOf(addr){
  const m = String(addr||'').match(/@([^\s>,;]+)/);
  return m ? m[1].toLowerCase().replace(/[.>,;]+$/,'') : '';
}

// Company domains are our own staff. Excluded domains are consumer/public mail
// that must never be turned into a customer account, however it arrives.
function classifyAddress(addr, cfg){
  const d = emailDomainOf(addr);
  if (!d) return 'unknown';
  if ((cfg.companyDomains||[]).some(x=>d===x.toLowerCase() || d.endsWith('.'+x.toLowerCase()))) return 'internal';
  if ((cfg.excludedDomains||[]).some(x=>d===x.toLowerCase())) return 'excluded';
  return 'external';
}

// The routing decision for one message. Returns the customer it maps to (or
// null), which bucket it lands in, and the reason — the reason is surfaced in
// the UI so an agent can see why something was or was not mapped.
function routeEmail(email, cfg, customers){
  const parts = [email.fromEmail, email.to].concat(email.cc || []).filter(Boolean);
  const externals = parts.filter(a => classifyAddress(a, cfg) === 'external');
  const excluded = parts.filter(a => classifyAddress(a, cfg) === 'excluded');

  if (externals.length === 0) {
    return { customerId: null, bucket: 'internal', external: null,
      reason: excluded.length
        ? 'All outside participants are on excluded domains (' + excluded.map(emailDomainOf).join(', ') + '). Not mapped to an account.'
        : 'Every participant is on a company domain. Internal mail is never mapped to an account.' };
  }
  const extDomain = emailDomainOf(externals[0]);
  const match = (customers||[]).find(c => c.domain && (extDomain === c.domain.toLowerCase() || extDomain.endsWith('.' + c.domain.toLowerCase())));
  if (match) return { customerId: match.id, bucket: 'mapped', external: externals[0],
    reason: 'External participant ' + externals[0] + ' matched ' + match.name + ' on domain ' + match.domain + '.' };
  return { customerId: null, bucket: 'unmatched', external: externals[0],
    reason: 'External participant ' + externals[0] + ' does not match any account domain. Available in My Work only until an account is chosen.' };
}

function routeEmails(emails, cfg, customers){
  return (emails||[]).map(e => {
    const r = routeEmail(e, cfg, customers);
    return Object.assign({}, e, { routing: r, customerId: r.bucket === 'mapped' ? r.customerId : (e.pinnedCustomerId || null) });
  });
}

const EMAIL_TEMPLATES = [
  { id:'et1', name:'Acknowledge and commit to a date',
    body:'Hi {{contact.first_name}},\n\nThank you for flagging this, and I am sorry it has taken this long.\n\nI have escalated internally and will come back to you with a firm date by end of day tomorrow. In the meantime I have asked the team to send a daily status so you are not chasing us.\n\nBest,\n{{my.name}}' },
  { id:'et2', name:'Renewal \u2014 next steps',
    body:'Hi {{contact.first_name}},\n\nThanks for moving this along. To answer your questions:\n\n1. \n2. \n\nI will send the updated order form across today so procurement has what they need.\n\nBest,\n{{my.name}}' },
  { id:'et3', name:'Seat expansion \u2014 options',
    body:'Hi {{contact.first_name}},\n\nHappy to help \u2014 and thank you for the honesty about the shared login, it is more common than you would think.\n\nHere is what adding seats looks like:\n\n\u2022 Pricing: \n\u2022 Read-only role: yes, this is available on your current tier\n\nShall I put together a formal quote?\n\nBest,\n{{my.name}}' },
  { id:'et4', name:'QBR follow-up',
    body:'Hi {{contact.first_name}},\n\nGreat to see you yesterday. As promised, here is the detail on the point you raised:\n\n\n\nLet me know if you would like me to walk the team through it.\n\nBest,\n{{my.name}}' },
  { id:'et5', name:'Schedule a call',
    body:'Hi {{contact.first_name}},\n\nRather than go back and forth on email, would a short call help? Here is my calendar: {{my.calendar}}\n\nBest,\n{{my.name}}' },
];

// Where a task came from. Actions, email conversion and manual creation are the
// three the CSM cares about; priority_queue and signal_triggered are kept
// distinct because they already exist in the data.
const TASK_SOURCES = {
  action:           { label:'Actions',             tone:'blue',   icon: undefined },
  email:            { label:'Converted from Email',tone:'purple', icon: undefined },
  manual:           { label:'Manually created',    tone:'slate',  icon: undefined },
  priority_queue:   { label:'Priority queue',      tone:'amber',  icon: undefined },
  signal_triggered: { label:'Signal triggered',    tone:'teal',   icon: undefined },
};

export {
  EMAILS,
  EMAIL_CONFIG_DEFAULTS,
  EMAIL_TEMPLATES,
  SUPPORT_MAILBOXES,
  TASK_SOURCES,
  classifyAddress,
  emailDomainOf,
  routeEmail,
  routeEmails,
};
