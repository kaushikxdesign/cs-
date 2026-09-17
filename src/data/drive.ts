const DRIVE_SOPS = [
  {
    id:'sop_churn', title:'Customer churn — wind-down SOP', category:'Churn',
    owner:'Amara Osei', updated:'Jul 30, 2025', version:'v4.2', reads:212, fmt:'SOP',
    status:'published', tone:'red', icon: undefined,
    when:'A customer has confirmed churn or served notice of non-renewal.',
    summary:'Protects revenue recovery, preserves the relationship for a future win-back, and ensures nothing is left legally or operationally open when the contract ends.',
    phases:[
      { name:'Immediate (0\u201348 hours)', tasks:[
        { t:'Log confirmed churn status on the account record', owner:'CSM', due:'Same day' },
        { t:'Notify the account team, RevOps and Finance in #cs-churn', owner:'CSM', due:'Same day' },
        { t:'Book a churn debrief call with the economic buyer', owner:'CSM + AE', due:'Within 48h' },
        { t:'Freeze all active expansion opportunities in CRM', owner:'AE', due:'Within 48h' },
      ]},
      { name:'Root cause (week 1)', tasks:[
        { t:'Complete the structured churn reason form (primary + contributing)', owner:'CSM', due:'Day 5' },
        { t:'Pull the last 12 months of health, usage and ticket history into the debrief doc', owner:'CSM', due:'Day 5' },
        { t:'Interview the champion and one detractor for qualitative context', owner:'CSM', due:'Day 7' },
        { t:'Flag any product gaps to Product with evidence attached', owner:'CSM', due:'Day 7' },
      ]},
      { name:'Commercial close-out (weeks 1\u20132)', tasks:[
        { t:'Confirm contract end date, notice period and final invoice with Finance', owner:'Finance', due:'Week 2' },
        { t:'Check for auto-renew clauses that still need cancelling', owner:'Legal', due:'Week 2' },
        { t:'Agree data export format and deletion timeline with the customer', owner:'Support', due:'Week 2' },
      ]},
      { name:'Offboarding (weeks 2\u20134)', tasks:[
        { t:'Deliver the customer data export and confirm receipt in writing', owner:'Support', due:'Week 3' },
        { t:'Deactivate integrations, webhooks and API keys', owner:'Support', due:'Week 4' },
        { t:'Revoke SSO and remove seats after the confirmed end date', owner:'IT', due:'Week 4' },
        { t:'Archive the workspace per the data retention policy', owner:'IT', due:'Week 4' },
      ]},
      { name:'Win-back setup (day 30+)', tasks:[
        { t:'Set a win-back reminder for 6 months out', owner:'CSM', due:'Day 30' },
        { t:'Move contacts to the nurture list rather than deleting them', owner:'Marketing', due:'Day 30' },
        { t:'Record the churn in the quarterly loss review deck', owner:'CS Ops', due:'Quarter end' },
      ]},
    ],
    links:[ { label:'Churn reason taxonomy', kind:'Reference' }, { label:'Data deletion policy', kind:'Policy' }, { label:'Win-back email sequence', kind:'Template' } ],
  },
  {
    id:'sop_risk', title:'Churn risk intervention SOP', category:'Churn',
    owner:'Maya Chen', updated:'Jul 22, 2025', version:'v3.1', reads:340, fmt:'SOP',
    status:'published', tone:'amber', icon: undefined,
    when:'Health band drops to Red, or churn status is set to "Likely to churn".',
    summary:'A 30-day structured intervention to diagnose the real problem, get executive alignment on a fix, and convert the account back to a defensible position before renewal.',
    phases:[
      { name:'Diagnose (days 1\u20135)', tasks:[
        { t:'Review health dimension breakdown and identify the lowest two', owner:'CSM', due:'Day 2' },
        { t:'Audit open tickets for unresolved P1/P2 issues', owner:'CSM', due:'Day 2' },
        { t:'Confirm the champion is still in role and still engaged', owner:'CSM', due:'Day 3' },
        { t:'Write a one-page risk hypothesis and share with the manager', owner:'CSM', due:'Day 5' },
      ]},
      { name:'Align (days 5\u201312)', tasks:[
        { t:'Request an executive call with the economic buyer', owner:'CSM', due:'Day 7' },
        { t:'Prepare the value-realised summary against original success criteria', owner:'CSM', due:'Day 10' },
        { t:'Agree a written remediation plan with dates and named owners', owner:'CSM + Customer', due:'Day 12' },
      ]},
      { name:'Execute (days 12\u201330)', tasks:[
        { t:'Create a recovery goal on the account with weekly checkpoints', owner:'CSM', due:'Day 14' },
        { t:'Escalate any blocking product issues with revenue impact attached', owner:'CSM', due:'Day 14' },
        { t:'Run an enablement session on the lowest-adoption feature', owner:'CSM + SE', due:'Day 21' },
        { t:'Re-score health and report the trend to the manager', owner:'CSM', due:'Day 30' },
      ]},
    ],
    links:[ { label:'Executive call agenda', kind:'Template' }, { label:'Value realisation one-pager', kind:'Template' } ],
  },
  {
    id:'sop_champion', title:'Champion departure SOP', category:'Relationship',
    owner:'Sam Rivera', updated:'Jul 11, 2025', version:'v2.0', reads:158, fmt:'SOP',
    status:'published', tone:'purple', icon: undefined,
    when:'A contact with buying role Champion or Decision maker leaves the company.',
    summary:'Champion loss is the single strongest leading indicator of churn. This SOP re-establishes coverage within 30 days before the relationship goes cold.',
    phases:[
      { name:'First 72 hours', tasks:[
        { t:'Mark the contact as departed and remove them from active sequences', owner:'CSM', due:'Day 1' },
        { t:'Open a risk record with the ARR exposure attached', owner:'CSM', due:'Day 1' },
        { t:'Map the remaining stakeholders and identify coverage gaps', owner:'CSM', due:'Day 3' },
      ]},
      { name:'Re-establish (weeks 1\u20134)', tasks:[
        { t:'Identify the most likely replacement champion from the org chart', owner:'CSM', due:'Week 1' },
        { t:'Request a warm introduction from the departing champion if amicable', owner:'CSM', due:'Week 1' },
        { t:'Run a re-onboarding session for the new stakeholder', owner:'CSM + SE', due:'Week 3' },
        { t:'Re-confirm success criteria and renewal expectations in writing', owner:'CSM', due:'Week 4' },
      ]},
      { name:'Follow the champion', tasks:[
        { t:'Track the champion to their new company as a warm lead', owner:'AE', due:'Week 2' },
      ]},
    ],
    links:[ { label:'Stakeholder mapping worksheet', kind:'Template' }, { label:'Re-onboarding deck', kind:'Template' } ],
  },
  {
    id:'sop_onboard', title:'New customer onboarding SOP (first 90 days)', category:'Onboarding',
    owner:'Maya Chen', updated:'Jun 28, 2025', version:'v5.0', reads:421, fmt:'SOP',
    status:'published', tone:'green', icon: undefined,
    when:'A new contract is signed and the account moves to Onboarding.',
    summary:'Standardises the first 90 days so every customer reaches first value on schedule and enters steady state with an identified champion and agreed success criteria.',
    phases:[
      { name:'Days 0\u201314 — Kickoff', tasks:[
        { t:'Send the welcome pack and book the kickoff call', owner:'CSM', due:'Day 2' },
        { t:'Complete the handover doc from Sales (goals, promises, risks)', owner:'AE  CSM', due:'Day 3' },
        { t:'Confirm the executive sponsor and champion in writing', owner:'CSM', due:'Day 7' },
        { t:'Agree written success criteria for day 90', owner:'CSM + Customer', due:'Day 14' },
      ]},
      { name:'Days 15\u201345 — Technical setup', tasks:[
        { t:'Complete SSO and provisioning configuration', owner:'SE', due:'Day 21' },
        { t:'Connect the primary data sources and validate the first report', owner:'SE', due:'Day 30' },
        { t:'Run admin training for the core team', owner:'CSM + SE', due:'Day 35' },
      ]},
      { name:'Days 45\u201390 — First value', tasks:[
        { t:'Confirm first value milestone is met and evidenced', owner:'CSM', due:'Day 60' },
        { t:'Drive weekly active usage above the segment benchmark', owner:'CSM', due:'Day 75' },
        { t:'Run the 90-day review and set the next quarter goals', owner:'CSM', due:'Day 90' },
      ]},
    ],
    links:[ { label:'Kickoff deck', kind:'Template' }, { label:'Sales-to-CS handover form', kind:'Template' }, { label:'90-day success plan', kind:'Template' } ],
  },
  {
    id:'sop_p1', title:'P1 escalation SOP', category:'Support',
    owner:'Amara Osei', updated:'Jul 18, 2025', version:'v3.4', reads:389, fmt:'SOP',
    status:'published', tone:'red', icon: undefined,
    when:'A P1 critical ticket is raised, or escalation score rises above 70.',
    summary:'Keeps the commercial relationship intact while engineering resolves the incident, with clear ownership of customer communication.',
    phases:[
      { name:'First hour', tasks:[
        { t:'Acknowledge to the customer with a named owner and next update time', owner:'Support', due:'15 min' },
        { t:'Post the incident in #cs-escalations with account context and ARR', owner:'CSM', due:'30 min' },
        { t:'Confirm business impact and number of users blocked', owner:'CSM', due:'1 hour' },
      ]},
      { name:'Through resolution', tasks:[
        { t:'Send customer updates at the promised cadence, even with no change', owner:'CSM', due:'Every 4h' },
        { t:'Brief the executive sponsor if unresolved after 24 hours', owner:'CSM', due:'24h' },
        { t:'Track a workaround and communicate it as soon as one exists', owner:'Support', due:'Ongoing' },
      ]},
      { name:'After resolution', tasks:[
        { t:'Deliver a written RCA within 5 business days', owner:'Support + Eng', due:'Day 5' },
        { t:'Book a follow-up call to rebuild confidence', owner:'CSM', due:'Day 7' },
        { t:'Re-score health and check for renewal impact', owner:'CSM', due:'Day 10' },
      ]},
    ],
    links:[ { label:'RCA template', kind:'Template' }, { label:'Incident comms templates', kind:'Template' } ],
  },
  {
    id:'sop_renewal', title:'Renewal defence SOP', category:'Renewal',
    owner:'Sam Rivera', updated:'Jul 05, 2025', version:'v2.6', reads:276, fmt:'SOP',
    status:'published', tone:'blue', icon: undefined,
    when:'An account enters the 120-day renewal window, or renewal forecast moves to At risk.',
    summary:'Turns the renewal conversation into a confirmation of value already delivered rather than a negotiation under time pressure.',
    phases:[
      { name:'120 days out', tasks:[
        { t:'Confirm the renewal date, contract terms and notice period', owner:'CSM', due:'Day 120' },
        { t:'Assemble the value-realised summary against original success criteria', owner:'CSM', due:'Day 110' },
        { t:'Verify the economic buyer is still in role', owner:'CSM', due:'Day 110' },
      ]},
      { name:'90 days out', tasks:[
        { t:'Run the renewal-focused business review', owner:'CSM + AE', due:'Day 90' },
        { t:'Surface and log any pricing or procurement blockers', owner:'AE', due:'Day 85' },
        { t:'Confirm budget ownership for next year', owner:'AE', due:'Day 80' },
      ]},
      { name:'60\u201330 days out', tasks:[
        { t:'Issue the renewal proposal', owner:'AE', due:'Day 60' },
        { t:'Escalate internally if no response after 10 days', owner:'AE', due:'Day 50' },
        { t:'Secure written confirmation or a signed order form', owner:'AE', due:'Day 30' },
      ]},
    ],
    links:[ { label:'Renewal proposal template', kind:'Template' }, { label:'Value realisation one-pager', kind:'Template' } ],
  },
  {
    id:'sop_expansion', title:'Expansion qualification SOP', category:'Growth',
    owner:'Maya Chen', updated:'Jun 12, 2025', version:'v1.8', reads:143, fmt:'SOP',
    status:'draft', tone:'teal', icon: undefined,
    when:'An expansion signal is detected \u2014 seat utilisation above 85%, or a new business unit appears.',
    summary:'Qualifies expansion signals before they reach the pipeline so AEs spend time on opportunities with genuine evidence behind them.',
    phases:[
      { name:'Qualify', tasks:[
        { t:'Validate the signal against actual usage data', owner:'CSM', due:'Day 3' },
        { t:'Confirm the account is Green and has no open P1s', owner:'CSM', due:'Day 3' },
        { t:'Identify the budget holder for the new scope', owner:'CSM', due:'Day 7' },
      ]},
      { name:'Hand off', tasks:[
        { t:'Write the opportunity brief with evidence attached', owner:'CSM', due:'Day 10' },
        { t:'Introduce the AE to the budget holder', owner:'CSM  AE', due:'Day 12' },
        { t:'Create the CRM opportunity with the signal linked', owner:'AE', due:'Day 14' },
      ]},
    ],
    links:[ { label:'Opportunity brief template', kind:'Template' } ],
  },
];

const DRIVE_KINDS = [
  { id:'qbr', label:'QBR', singular:'QBR', icon: undefined, tone:'blue', desc:'Business review decks, agendas and past QBR records.' },
];

const DRIVE_FILES = [
  { id:'f1', name:'Enterprise QBR deck',          kind:'qbr',  fmt:'PPTX', size:'4.2 MB', owner:'Maya Chen',  updated:'Jul 28, 2025', uses:184, status:'published' },
  { id:'f2', name:'Mid-market QBR deck',          kind:'qbr',  fmt:'PPTX', size:'2.8 MB', owner:'Maya Chen',  updated:'Jul 14, 2025', uses:96,  status:'published' },
  { id:'f3', name:'Executive business review',    kind:'qbr',  fmt:'PPTX', size:'5.1 MB', owner:'Amara Osei', updated:'Jun 30, 2025', uses:41,  status:'draft' },
  { id:'f4', name:'QBR agenda + talk track',      kind:'qbr',  fmt:'DOCX', size:'240 KB', owner:'Sam Rivera', updated:'Jul 02, 2025', uses:88,  status:'published' },
  { id:'f5', name:'Adoption recovery goal',       kind:'goal', fmt:'DOCX', size:'184 KB', owner:'Maya Chen',  updated:'Jul 22, 2025', uses:212, status:'published' },
  { id:'f6', name:'Expansion qualification goal', kind:'goal', fmt:'DOCX', size:'156 KB', owner:'Sam Rivera', updated:'Jul 09, 2025', uses:78,  status:'published' },
  { id:'f7', name:'Renewal defence goal',         kind:'goal', fmt:'DOCX', size:'168 KB', owner:'Amara Osei', updated:'Jun 18, 2025', uses:134, status:'published' },
  { id:'f8', name:'Annual success plan',          kind:'goal', fmt:'XLSX', size:'320 KB', owner:'Maya Chen',  updated:'Jul 25, 2025', uses:88,  status:'published' },
  { id:'f9', name:'Onboarding 90-day plan',       kind:'goal', fmt:'XLSX', size:'268 KB', owner:'Sam Rivera', updated:'May 30, 2025', uses:57,  status:'published' },
  // Email templates, moved here from Profile settings so the whole library lives in one place
];

export {
  DRIVE_FILES,
  DRIVE_KINDS,
  DRIVE_SOPS,
};
