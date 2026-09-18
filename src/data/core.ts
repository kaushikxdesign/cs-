// SECTION 1: MOCK DATA
// ============================================================

// No `color` field: the Avatar component derives a hue from the name
// itself (deterministic hash into the --av-* token ramp), so a fixed hex
// per user here would just be dead data nothing ever reads — it wasn't.
const USERS = {
  maya: { id: 'maya', name: 'Maya Chen', role: 'csm', initials: 'MC' },
  daniel: { id: 'daniel', name: 'Daniel Ortiz', role: 'manager', initials: 'DO' },
  priya: { id: 'priya', name: 'Priya Raman', role: 'executive', initials: 'PR' },
  james: { id: 'james', name: 'James Park', role: 'csm', initials: 'JP' },
  sarah: { id: 'sarah', name: 'Sarah Kim', role: 'csm', initials: 'SK' },
};

// Health score calculator
function calcHealth(usage, sentiment, pressure) {
  const supportHealth = 100 - pressure;
  return Math.round(usage * 0.40 + sentiment * 0.30 + supportHealth * 0.30);
}

const CUSTOMERS = [
  { id: 'acme', name: 'Acme Analytics', domain: 'acme-analytics.io', segment: 'enterprise', arr: 240000, renewalDate: '2024-10-06', ownerId: 'maya', products: ['Analytics Pro', 'Data Pipeline'], healthId: 'h_acme', riskIds: ['r1'], expansionIds: [], goalIds: ['g1'], contactIds: ['c1','c2','c3'] },
  { id: 'northstar', name: 'Northstar Labs', domain: 'northstarlabs.com', segment: 'mid_market', arr: 180000, renewalDate: '2024-12-23', ownerId: 'maya', products: ['Analytics Core'], healthId: 'h_northstar', riskIds: [], expansionIds: ['e1'], goalIds: [], contactIds: ['c4','c5'] },
  { id: 'orbit', name: 'Orbit Systems', domain: 'orbitsystems.com', segment: 'enterprise', arr: 320000, renewalDate: '2024-08-31', ownerId: 'maya', products: ['Analytics Pro', 'Insights'], healthId: 'h_orbit', riskIds: [], expansionIds: ['e2'], goalIds: ['g2'], contactIds: ['c6','c7'] },
  { id: 'globex', name: 'Globex Cloud', domain: 'globexcloud.io', segment: 'enterprise', arr: 195000, renewalDate: '2024-08-22', ownerId: 'maya', products: ['Analytics Pro'], healthId: 'h_globex', riskIds: ['r2'], expansionIds: [], goalIds: ['g3'], contactIds: ['c8'] },
  { id: 'helio', name: 'HelioWorks', domain: 'helioworks.com', segment: 'mid_market', arr: 88000, renewalDate: '2024-11-15', ownerId: 'maya', products: ['Analytics Core'], healthId: 'h_helio', riskIds: ['r3'], expansionIds: [], goalIds: [], contactIds: ['c9'] },
  { id: 'vertex', name: 'Vertex AI', domain: 'vertexai.co', segment: 'enterprise', arr: 150000, renewalDate: '2025-01-10', ownerId: 'maya', products: ['Analytics Pro', 'ML Suite'], healthId: 'h_vertex', riskIds: ['r7'], expansionIds: [], goalIds: [], contactIds: ['c10'] },
  { id: 'atlaspay', name: 'AtlasPay', domain: 'atlaspay.com', segment: 'enterprise', arr: 220000, renewalDate: '2024-09-30', ownerId: 'maya', products: ['Analytics Pro'], healthId: 'h_atlas', riskIds: ['r6'], expansionIds: ['e4'], goalIds: ['g4'], contactIds: ['c11'] },
  { id: 'pinnacle', name: 'Pinnacle Health', domain: 'pinnaclehealth.org', segment: 'enterprise', arr: 310000, renewalDate: '2025-02-14', ownerId: 'maya', products: ['Analytics Pro', 'Compliance'], healthId: 'h_pinnacle', riskIds: ['r8'], expansionIds: ['e3'], goalIds: ['g5'], contactIds: ['c12'] },
  // James accounts
  { id: 'databrdige', name: 'DataBridge', domain: 'databridge.io', segment: 'enterprise', arr: 180000, renewalDate: '2024-09-01', ownerId: 'james', products: ['Analytics Pro'], healthId: 'h_databrdige', riskIds: ['r4'], expansionIds: ['e7'], goalIds: ['g6'], contactIds: [] },
  { id: 'cloudnine', name: 'CloudNine', domain: 'cloudnine.tech', segment: 'mid_market', arr: 110000, renewalDate: '2024-08-10', ownerId: 'james', products: ['Analytics Core'], healthId: 'h_cloudnine', riskIds: ['r5'], expansionIds: [], goalIds: [], contactIds: [] },
  { id: 'novatech', name: 'NovaTech', domain: 'novatech.com', segment: 'mid_market', arr: 90000, renewalDate: '2024-09-15', ownerId: 'james', products: ['Analytics Core'], healthId: 'h_novatech', riskIds: ['r9'], expansionIds: [], goalIds: [], contactIds: [] },
  { id: 'westcorp', name: 'WestCorp', domain: 'westcorp.com', segment: 'enterprise', arr: 280000, renewalDate: '2025-03-01', ownerId: 'james', products: ['Analytics Pro'], healthId: 'h_westcorp', riskIds: [], expansionIds: ['e5'], goalIds: ['g7'], contactIds: [] },
  { id: 'microdyn', name: 'MicroDyn', domain: 'microdyn.io', segment: 'mid_market', arr: 95000, renewalDate: '2025-01-20', ownerId: 'james', products: ['Analytics Core'], healthId: 'h_microdyn', riskIds: [], expansionIds: ['e8'], goalIds: [], contactIds: [] },
  { id: 'axelera', name: 'Axelera', domain: 'axelera.com', segment: 'enterprise', arr: 260000, renewalDate: '2024-10-20', ownerId: 'james', products: ['Analytics Pro'], healthId: 'h_axelera', riskIds: [], expansionIds: [], goalIds: ['g8'], contactIds: [] },
  { id: 'luminary', name: 'Luminary Co', domain: 'luminary.co', segment: 'mid_market', arr: 72000, renewalDate: '2025-02-01', ownerId: 'james', products: ['Analytics Core'], healthId: 'h_luminary', riskIds: [], expansionIds: [], goalIds: [], contactIds: [] },
  { id: 'stratford', name: 'Stratford Group', domain: 'stratford.com', segment: 'enterprise', arr: 195000, renewalDate: '2025-04-01', ownerId: 'james', products: ['Analytics Pro'], healthId: 'h_stratford', riskIds: [], expansionIds: [], goalIds: [], contactIds: [] },
  // Sarah accounts
  { id: 'techflow', name: 'TechFlow', domain: 'techflow.io', segment: 'mid_market', arr: 145000, renewalDate: '2024-11-30', ownerId: 'sarah', products: ['Analytics Core'], healthId: 'h_techflow', riskIds: [], expansionIds: ['e6'], goalIds: ['g9'], contactIds: [] },
  { id: 'meridian', name: 'Meridian Brands', domain: 'meridianbrands.com', segment: 'enterprise', arr: 340000, renewalDate: '2025-01-05', ownerId: 'sarah', products: ['Analytics Pro', 'Insights'], healthId: 'h_meridian', riskIds: [], expansionIds: [], goalIds: ['g10'], contactIds: [] },
  { id: 'cascade', name: 'Cascade Digital', domain: 'cascadedigital.com', segment: 'mid_market', arr: 98000, renewalDate: '2024-12-01', ownerId: 'sarah', products: ['Analytics Core'], healthId: 'h_cascade', riskIds: [], expansionIds: [], goalIds: [], contactIds: [] },
  { id: 'keystone', name: 'Keystone Retail', domain: 'keystoneretail.com', segment: 'enterprise', arr: 225000, renewalDate: '2025-03-15', ownerId: 'sarah', products: ['Analytics Pro'], healthId: 'h_keystone', riskIds: [], expansionIds: [], goalIds: ['g11'], contactIds: [] },
  { id: 'prism', name: 'Prism Analytics', domain: 'prismanalytics.ai', segment: 'mid_market', arr: 112000, renewalDate: '2025-02-20', ownerId: 'sarah', products: ['Analytics Core'], healthId: 'h_prism', riskIds: [], expansionIds: [], goalIds: [], contactIds: [] },
  { id: 'talentpath', name: 'TalentPath', domain: 'talentpath.hr', segment: 'mid_market', arr: 78000, renewalDate: '2024-10-15', ownerId: 'sarah', products: ['Analytics Core'], healthId: 'h_talentpath', riskIds: ['r10'], expansionIds: [], goalIds: [], contactIds: [] },
  { id: 'solara', name: 'Solara Energy', domain: 'solaraenergy.com', segment: 'enterprise', arr: 410000, renewalDate: '2025-05-01', ownerId: 'sarah', products: ['Analytics Pro', 'ML Suite'], healthId: 'h_solara', riskIds: [], expansionIds: [], goalIds: ['g12'], contactIds: [] },
  { id: 'vantage', name: 'Vantage Point', domain: 'vantagepoint.co', segment: 'mid_market', arr: 88000, renewalDate: '2024-11-01', ownerId: 'sarah', products: ['Analytics Core'], healthId: 'h_vantage', riskIds: [], expansionIds: [], goalIds: [], contactIds: [] },
];

// Generate 90-day history helper
function genHistory(baseScore, trend, volatility=4) {
  const hist: Array<{ date: string; score: number }> = [];
  let score = baseScore + trend * 90;
  const today = new Date();
  for (let i = 90; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    score = Math.max(0, Math.min(100, score - trend + (Math.random()-0.5)*volatility));
    hist.push({ date: d.toISOString().split('T')[0], score: Math.round(score) });
  }
  return hist;
}

const HEALTH_SIGNALS = {
  h_acme: { id:'h_acme', customerId:'acme', compositeScore:30, band:'red', previousScore:51, previousBand:'yellow', dataQuality:'complete', computedAt:'2024-07-21T08:00:00Z', transitionedAt:'2024-07-21T08:00:00Z',
    dimensions:[
      { key:'product_usage', label:'Product usage', rawScore:28, effectiveScore:28, weight:0.40, contribution:11.2, trend:'down', freshness:'2h ago',
        evidence:[{ id:'e_u1', type:'usage', label:'WAU down 64%', detail:'Weekly active users fell from 78 to 28 over 30 days', occurredAt:'2024-07-20' }] },
      { key:'email_sentiment', label:'Email sentiment', rawScore:42, effectiveScore:42, weight:0.30, contribution:12.6, trend:'down', freshness:'1d ago',
        evidence:[{ id:'e_s1', type:'email', label:'2 unanswered threads', detail:'Follow-up emails from Jul 12 and Jul 16 remain unread', occurredAt:'2024-07-16' }] },
      { key:'support_pressure', label:'Support pressure', rawScore:78, effectiveScore:22, weight:0.30, contribution:6.6, trend:'up', freshness:'3h ago',
        evidence:[{ id:'e_t1', type:'ticket', label:'Critical sync ticket 9d open', detail:'SUP-1842: Data sync failure - production impacted, opened Jul 15', occurredAt:'2024-07-15' }] },
    ],
    history: genHistory(30, -0.2)
  },
  h_northstar: { id:'h_northstar', customerId:'northstar', compositeScore:82, band:'green', previousScore:66, previousBand:'yellow', dataQuality:'complete', computedAt:'2024-07-24T06:00:00Z', transitionedAt:'2024-07-12T00:00:00Z',
    dimensions:[
      { key:'product_usage', label:'Product usage', rawScore:84, effectiveScore:84, weight:0.40, contribution:33.6, trend:'up', freshness:'1h ago', evidence:[{ id:'e_u2', type:'usage', label:'WAU up 31%', detail:'Weekly active users grew 31% over 60 days — 94% seat utilization', occurredAt:'2024-07-24' }] },
      { key:'email_sentiment', label:'Email sentiment', rawScore:74, effectiveScore:74, weight:0.30, contribution:22.2, trend:'up', freshness:'2d ago', evidence:[{ id:'e_s2', type:'email', label:'Positive engagement', detail:'Champion replies promptly, NPS survey returned score of 9', occurredAt:'2024-07-22' }] },
      { key:'support_pressure', label:'Support pressure', rawScore:12, effectiveScore:88, weight:0.30, contribution:26.4, trend:'down', freshness:'1h ago', evidence:[{ id:'e_t2', type:'ticket', label:'No critical tickets', detail:'Only 1 low-severity ticket in past 60 days', occurredAt:'2024-07-24' }] },
    ],
    history: genHistory(82, 0.1)
  },
  h_orbit: { id:'h_orbit', customerId:'orbit', compositeScore:88, band:'green', previousScore:84, previousBand:'green', dataQuality:'complete', computedAt:'2024-07-24T06:00:00Z', transitionedAt:null,
    dimensions:[
      { key:'product_usage', label:'Product usage', rawScore:91, effectiveScore:91, weight:0.40, contribution:36.4, trend:'up', freshness:'1h ago', evidence:[] },
      { key:'email_sentiment', label:'Email sentiment', rawScore:85, effectiveScore:85, weight:0.30, contribution:25.5, trend:'flat', freshness:'1d ago', evidence:[] },
      { key:'support_pressure', label:'Support pressure', rawScore:14, effectiveScore:86, weight:0.30, contribution:25.8, trend:'down', freshness:'2h ago', evidence:[] },
    ],
    history: genHistory(88, 0.02)
  },
  h_globex: { id:'h_globex', customerId:'globex', compositeScore:51, band:'yellow', previousScore:58, previousBand:'yellow', dataQuality:'partial', computedAt:'2024-07-24T06:00:00Z', transitionedAt:null,
    dimensions:[
      { key:'product_usage', label:'Product usage', rawScore:55, effectiveScore:55, weight:0.40, contribution:22, trend:'down', freshness:'2h ago', evidence:[] },
      { key:'email_sentiment', label:'Email sentiment', rawScore:48, effectiveScore:48, weight:0.30, contribution:14.4, trend:'down', freshness:'5d ago', evidence:[{ id:'e_s3', type:'email', label:'Executive unresponsive', detail:'Exec sponsor has not replied to 3 emails over 3 weeks', occurredAt:'2024-07-10' }] },
      { key:'support_pressure', label:'Support pressure', rawScore:49, effectiveScore:51, weight:0.30, contribution:15.3, trend:'flat', freshness:'3h ago', evidence:[] },
    ],
    history: genHistory(51, -0.08)
  },
  h_helio: { id:'h_helio', customerId:'helio', compositeScore:48, band:'yellow', previousScore:60, previousBand:'green', dataQuality:'complete', computedAt:'2024-07-24T06:00:00Z', transitionedAt:'2024-07-19T00:00:00Z',
    dimensions:[
      { key:'product_usage', label:'Product usage', rawScore:60, effectiveScore:60, weight:0.40, contribution:24, trend:'flat', freshness:'2h ago', evidence:[] },
      { key:'email_sentiment', label:'Email sentiment', rawScore:45, effectiveScore:45, weight:0.30, contribution:13.5, trend:'down', freshness:'2d ago', evidence:[] },
      { key:'support_pressure', label:'Support pressure', rawScore:65, effectiveScore:35, weight:0.30, contribution:10.5, trend:'up', freshness:'1h ago', evidence:[{ id:'e_t3', type:'ticket', label:'Critical ticket awaiting response', detail:'SUP-1901: Integration failure - customer awaiting CSM follow-up', occurredAt:'2024-07-22' }] },
    ],
    history: genHistory(48, -0.12)
  },
  h_vertex: { id:'h_vertex', customerId:'vertex', compositeScore:54, band:'yellow', previousScore:61, previousBand:'yellow', dataQuality:'complete', computedAt:'2024-07-24T06:00:00Z', transitionedAt:null,
    dimensions:[
      { key:'product_usage', label:'Product usage', rawScore:65, effectiveScore:65, weight:0.40, contribution:26, trend:'flat', freshness:'2h ago', evidence:[] },
      { key:'email_sentiment', label:'Email sentiment', rawScore:32, effectiveScore:32, weight:0.30, contribution:9.6, trend:'down', freshness:'3d ago', evidence:[{ id:'e_s4', type:'survey', label:'NPS detractor score 3', detail:'NPS survey returned score of 3 with comment "product is too slow"', occurredAt:'2024-07-18' }] },
      { key:'support_pressure', label:'Support pressure', rawScore:38, effectiveScore:62, weight:0.30, contribution:18.6, trend:'flat', freshness:'2h ago', evidence:[] },
    ],
    history: genHistory(54, -0.07)
  },
  h_atlas: { id:'h_atlas', customerId:'atlaspay', compositeScore:42, band:'yellow', previousScore:28, previousBand:'red', dataQuality:'complete', computedAt:'2024-07-24T06:00:00Z', transitionedAt:'2024-07-16T00:00:00Z',
    dimensions:[
      { key:'product_usage', label:'Product usage', rawScore:50, effectiveScore:50, weight:0.40, contribution:20, trend:'up', freshness:'2h ago', evidence:[] },
      { key:'email_sentiment', label:'Email sentiment', rawScore:42, effectiveScore:42, weight:0.30, contribution:12.6, trend:'up', freshness:'1d ago', evidence:[] },
      { key:'support_pressure', label:'Support pressure', rawScore:68, effectiveScore:32, weight:0.30, contribution:9.6, trend:'down', freshness:'2h ago', evidence:[] },
    ],
    history: genHistory(42, 0.15)
  },
  h_pinnacle: { id:'h_pinnacle', customerId:'pinnacle', compositeScore:74, band:'green', previousScore:70, previousBand:'green', dataQuality:'complete', computedAt:'2024-07-24T06:00:00Z', transitionedAt:null,
    dimensions:[
      { key:'product_usage', label:'Product usage', rawScore:80, effectiveScore:80, weight:0.40, contribution:32, trend:'up', freshness:'1h ago', evidence:[] },
      { key:'email_sentiment', label:'Email sentiment', rawScore:72, effectiveScore:72, weight:0.30, contribution:21.6, trend:'flat', freshness:'2d ago', evidence:[] },
      { key:'support_pressure', label:'Support pressure', rawScore:32, effectiveScore:68, weight:0.30, contribution:20.4, trend:'flat', freshness:'2h ago', evidence:[] },
    ],
    history: genHistory(74, 0.04)
  },
  h_databrdige: { id:'h_databrdige', customerId:'databrdige', compositeScore:28, band:'red', previousScore:45, previousBand:'yellow', dataQuality:'complete', computedAt:'2024-07-24T06:00:00Z', transitionedAt:'2024-07-18T00:00:00Z', dimensions:[], history: genHistory(28, -0.18) },
  h_cloudnine: { id:'h_cloudnine', customerId:'cloudnine', compositeScore:25, band:'red', previousScore:35, previousBand:'yellow', dataQuality:'partial', computedAt:'2024-07-24T06:00:00Z', transitionedAt:'2024-07-20T00:00:00Z', dimensions:[], history: genHistory(25, -0.15) },
  h_novatech: { id:'h_novatech', customerId:'novatech', compositeScore:30, band:'red', previousScore:38, previousBand:'yellow', dataQuality:'complete', computedAt:'2024-07-24T06:00:00Z', transitionedAt:'2024-07-19T00:00:00Z', dimensions:[], history: genHistory(30, -0.1) },
  h_westcorp: { id:'h_westcorp', customerId:'westcorp', compositeScore:78, band:'green', previousScore:72, previousBand:'green', dataQuality:'complete', computedAt:'2024-07-24T06:00:00Z', transitionedAt:null, dimensions:[], history: genHistory(78, 0.05) },
  h_microdyn: { id:'h_microdyn', customerId:'microdyn', compositeScore:65, band:'yellow', previousScore:62, previousBand:'yellow', dataQuality:'complete', computedAt:'2024-07-24T06:00:00Z', transitionedAt:null, dimensions:[], history: genHistory(65, 0.03) },
  h_axelera: { id:'h_axelera', customerId:'axelera', compositeScore:72, band:'green', previousScore:68, previousBand:'green', dataQuality:'complete', computedAt:'2024-07-24T06:00:00Z', transitionedAt:null, dimensions:[], history: genHistory(72, 0.04) },
  h_luminary: { id:'h_luminary', customerId:'luminary', compositeScore:58, band:'yellow', previousScore:55, previousBand:'yellow', dataQuality:'stale', computedAt:'2024-07-20T06:00:00Z', transitionedAt:null, dimensions:[], history: genHistory(58, 0.02) },
  h_stratford: { id:'h_stratford', customerId:'stratford', compositeScore:82, band:'green', previousScore:79, previousBand:'green', dataQuality:'complete', computedAt:'2024-07-24T06:00:00Z', transitionedAt:null, dimensions:[], history: genHistory(82, 0.03) },
  h_techflow: { id:'h_techflow', customerId:'techflow', compositeScore:64, band:'yellow', previousScore:68, previousBand:'green', dataQuality:'complete', computedAt:'2024-07-24T06:00:00Z', transitionedAt:'2024-07-20T00:00:00Z', dimensions:[], history: genHistory(64, -0.04) },
  h_meridian: { id:'h_meridian', customerId:'meridian', compositeScore:88, band:'green', previousScore:85, previousBand:'green', dataQuality:'complete', computedAt:'2024-07-24T06:00:00Z', transitionedAt:null, dimensions:[], history: genHistory(88, 0.03) },
  h_cascade: { id:'h_cascade', customerId:'cascade', compositeScore:71, band:'green', previousScore:69, previousBand:'green', dataQuality:'complete', computedAt:'2024-07-24T06:00:00Z', transitionedAt:null, dimensions:[], history: genHistory(71, 0.02) },
  h_keystone: { id:'h_keystone', customerId:'keystone', compositeScore:76, band:'green', previousScore:74, previousBand:'green', dataQuality:'complete', computedAt:'2024-07-24T06:00:00Z', transitionedAt:null, dimensions:[], history: genHistory(76, 0.02) },
  h_prism: { id:'h_prism', customerId:'prism', compositeScore:67, band:'green', previousScore:63, previousBand:'yellow', dataQuality:'complete', computedAt:'2024-07-24T06:00:00Z', transitionedAt:'2024-07-15T00:00:00Z', dimensions:[], history: genHistory(67, 0.04) },
  h_talentpath: { id:'h_talentpath', customerId:'talentpath', compositeScore:44, band:'yellow', previousScore:52, previousBand:'yellow', dataQuality:'complete', computedAt:'2024-07-24T06:00:00Z', transitionedAt:null, dimensions:[], history: genHistory(44, -0.08) },
  h_solara: { id:'h_solara', customerId:'solara', compositeScore:85, band:'green', previousScore:82, previousBand:'green', dataQuality:'complete', computedAt:'2024-07-24T06:00:00Z', transitionedAt:null, dimensions:[], history: genHistory(85, 0.03) },
  h_vantage: { id:'h_vantage', customerId:'vantage', compositeScore:59, band:'yellow', previousScore:61, previousBand:'yellow', dataQuality:'partial', computedAt:'2024-07-22T06:00:00Z', transitionedAt:null, dimensions:[], history: genHistory(59, -0.02) },
};

const TASKS = {
  t1: { id:'t1', goalId:'g1', title:'Schedule recovery meeting with product admin and exec sponsor', description:'Set up a 60-min call with Sarah Mitchell (Admin) and David Park (Exec Sponsor) to review the data sync issue and adoption recovery plan.', type:'meeting', ownerId:'maya', dueDate:'2024-07-29', status:'todo', visibility:'internal', outcomeNote:null },
  t2: { id:'t2', goalId:'g1', title:'Coordinate engineering escalation on SUP-1842', description:'Work with Zendesk support team to escalate the critical sync ticket and get an ETA on the fix.', type:'custom', ownerId:'maya', dueDate:'2024-07-26', status:'todo', visibility:'internal', outcomeNote:null },
  t3: { id:'t3', goalId:'g1', title:'Send executive summary of impact and resolution plan', description:'Draft and send a clear executive summary to David Park outlining the business impact of the sync failure and the recovery timeline.', type:'email_outreach', ownerId:'maya', dueDate:'2024-07-31', status:'todo', visibility:'internal', outcomeNote:null },
  t10: { id:'t10', goalId:'g2', title:'Enablement workshop for Revenue Operations team', description:'Run 2-hour enablement workshop covering advanced analytics features for the RevOps team.', type:'training', ownerId:'maya', dueDate:'2024-06-15', status:'done', visibility:'shared', outcomeNote:'Workshop completed with 14 attendees. Positive feedback received.' },
  t11: { id:'t11', goalId:'g2', title:'Deploy analytics dashboards across Rev Ops workflow', description:'Work with IT admin to deploy and configure the standard dashboard set for Revenue Operations.', type:'custom', ownerId:'maya', dueDate:'2024-07-01', status:'done', visibility:'shared', outcomeNote:'Dashboards deployed and configured for 8 users.' },
  t12: { id:'t12', goalId:'g2', title:'Conduct adoption review and success milestone check', description:'Review adoption metrics with Orbit stakeholders and confirm success criteria achievement.', type:'health_check', ownerId:'maya', dueDate:'2024-07-31', status:'in_progress', visibility:'shared', outcomeNote:null },
  t13: { id:'t13', goalId:'g2', title:'Prepare commercial packaging for expansion', description:'Prepare renewal and expansion proposal for account review.', type:'custom', ownerId:'maya', dueDate:'2024-07-25', status:'todo', visibility:'internal', outcomeNote:null },
  t20: { id:'t20', goalId:'g3', title:'Identify and engage new executive sponsor candidate', description:'Research Globex org chart and identify 2-3 candidates to fill exec sponsor gap. Schedule introductory calls.', type:'custom', ownerId:'maya', dueDate:'2024-08-05', status:'todo', visibility:'internal', outcomeNote:null },
  t21: { id:'t21', goalId:'g3', title:'Schedule renewal planning call with finance lead', description:'Initiate renewal discussion with Globex finance team given 28-day window.', type:'meeting', ownerId:'maya', dueDate:'2024-07-30', status:'todo', visibility:'internal', outcomeNote:null },
  t30: { id:'t30', goalId:'g4', title:'Run AtlasPay platform health review', description:'Review current usage metrics and compare against targets set at last QBR.', type:'health_check', ownerId:'maya', dueDate:'2024-08-10', status:'in_progress', visibility:'internal', outcomeNote:null },
  t40: { id:'t40', goalId:'g5', title:'Deliver compliance audit support pack', description:'Prepare required compliance documentation and schedule review with Pinnacle legal team.', type:'custom', ownerId:'maya', dueDate:'2024-08-20', status:'todo', visibility:'shared', outcomeNote:null },
  t41: { id:'t41', goalId:'g5', title:'QBR executive briefing - Q3 outcomes', description:'Prepare and deliver Q3 executive briefing for Pinnacle leadership team.', type:'meeting', ownerId:'maya', dueDate:'2024-08-30', status:'todo', visibility:'shared', outcomeNote:null },
};

// ── Tasks generated by published Actions. These carry provenance:
//    which action fired, on which customer, and why. ──
const ACTION_TASKS = {
  ta1: { id:'ta1', goalId:null, customerId:'acme', title:'Book enablement session with James Mok',
    description:'Adoption has fallen below the recovery threshold ahead of renewal. Run a working session on the two lowest-adoption features before the next check-in.',
    type:'meeting', ownerId:'maya', dueDate:'2025-08-22', status:'todo', visibility:'internal', outcomeNote:null,
    source:'action', actionName:'Adoption drops before renewal', actionSourceId:'a5',
    trigger:'Adoption score dropped below 60', firedAt:'Aug 09, 2025 \u00b7 14:05' },

  ta2: { id:'ta2', goalId:null, customerId:'acme', title:'Acknowledge the adoption recovery goal',
    description:'A goal was drafted automatically when health moved to Red. It stays in draft until you accept or amend it.',
    type:'custom', ownerId:'maya', dueDate:'2025-08-19', status:'todo', visibility:'internal', outcomeNote:null,
    source:'action', actionName:'Health band falls to Red', actionSourceId:'a4',
    trigger:'Health band changed to Red', firedAt:'Aug 14, 2025 \u00b7 06:12' },

  ta3: { id:'ta3', goalId:null, customerId:'globex', title:'Confirm executive sponsor before renewal',
    description:'Renewal is inside 30 days with no identified economic buyer on the account.',
    type:'custom', ownerId:'maya', dueDate:'2025-08-20', status:'in_progress', visibility:'internal', outcomeNote:null,
    source:'action', actionName:'Health band falls to Red', actionSourceId:'a4',
    trigger:'Health band changed to Red', firedAt:'Aug 11, 2025 \u00b7 16:22' },

  ta4: { id:'ta4', goalId:null, customerId:'vertex', title:'Follow up on negative sentiment thread',
    description:'Three consecutive ticket replies scored negative. Reach out before it reaches the executive sponsor.',
    type:'custom', ownerId:'maya', dueDate:'2025-08-18', status:'todo', visibility:'internal', outcomeNote:null,
    source:'action', actionName:'Sentiment turns negative', actionSourceId:'a6',
    trigger:'Sentiment changed to Negative', firedAt:'Aug 15, 2025 \u00b7 08:30' },
};


const GOALS = {
  g1: { id:'g1', customerId:'acme', title:'Restore product adoption and resolve critical sync issue', description:"Address the critical data synchronization failure impacting Acme's production environment. Recover weekly active users to pre-issue levels and rebuild executive confidence ahead of the 74-day renewal window.", type:'risk_mitigation', ownerId:'maya', startDate:null, dueDate:'2024-09-15', status:'not_started', priority:'critical', visibility:'internal', publicationStatus:'draft', source:'signal_triggered', triggeringSignalId:'h_acme', successMetric:'WAU returns to ≥70, SUP-1842 resolved, executive sponsor re-engaged', outcomeNote:null, taskIds:['t1','t2','t3'], riskId:'r1' },
  g2: { id:'g2', customerId:'orbit', title:'Scale analytics adoption across Revenue Operations', description:"Drive full adoption of the Analytics Pro platform across Orbit's Revenue Operations team, achieving defined utilization targets and securing executive advocacy for renewal.", type:'retention', ownerId:'maya', startDate:'2024-06-01', dueDate:'2024-07-31', status:'in_progress', priority:'high', visibility:'shared', publicationStatus:'published', source:'manual', triggeringSignalId:null, successMetric:'100% of licensed seats active, RevOps team completes adoption review', outcomeNote:null, taskIds:['t10','t11','t12','t13'] },
  g3: { id:'g3', customerId:'globex', title:'Secure executive sponsor and prepare renewal', description:'Close the executive sponsor gap at Globex Cloud and execute renewal preparation with 28 days remaining. Identify new sponsor candidate and initiate renewal commercial discussion.', type:'retention', ownerId:'maya', startDate:null, dueDate:'2024-08-15', status:'not_started', priority:'critical', visibility:'internal', publicationStatus:'draft', source:'signal_triggered', triggeringSignalId:'h_globex', successMetric:'New exec sponsor identified and meeting booked, renewal forecast updated to Commit', outcomeNote:null, taskIds:['t20','t21'], riskId:'r2' },
  g4: { id:'g4', customerId:'atlaspay', title:'Rebuild trust and confirm platform value post-recovery', description:"Capitalize on AtlasPay's health recovery by reinforcing platform value and securing renewal commitment.", type:'retention', ownerId:'maya', startDate:'2024-07-16', dueDate:'2024-08-31', status:'in_progress', priority:'high', visibility:'internal', publicationStatus:'draft', source:'manual', triggeringSignalId:null, successMetric:'Renewal forecast moved to Likely, NPS recovered to ≥7', outcomeNote:null, taskIds:['t30'] },
  g5: { id:'g5', customerId:'pinnacle', title:'Q3 compliance support and executive alignment', description:"Deliver compliance documentation support and Q3 executive briefing to maintain Pinnacle's green health and secure expansion conversation.", type:'retention', ownerId:'maya', startDate:'2024-07-15', dueDate:'2024-08-30', status:'in_progress', priority:'medium', visibility:'shared', publicationStatus:'published', source:'manual', triggeringSignalId:null, successMetric:'Compliance pack delivered, exec briefing completed, expansion discovery initiated', outcomeNote:null, taskIds:['t40','t41'] },
  g6: { id:'g6', customerId:'databrdige', title:'Adoption recovery and license right-sizing', description:'Address underutilization at DataBridge to prevent churn at renewal.', type:'risk_mitigation', ownerId:'james', startDate:'2024-07-01', dueDate:'2024-08-25', status:'in_progress', priority:'critical', visibility:'internal', publicationStatus:'draft', source:'signal_triggered', triggeringSignalId:'h_databrdige', successMetric:'License utilization reaches 70%', outcomeNote:null, taskIds:[] },
  g7: { id:'g7', customerId:'westcorp', title:'Expansion discovery — APAC region', description:"Explore expansion of WestCorp's deployment into APAC region based on positive signals from Singapore team.", type:'expansion', ownerId:'james', startDate:'2024-07-10', dueDate:'2024-09-30', status:'in_progress', priority:'medium', visibility:'shared', publicationStatus:'draft', source:'manual', triggeringSignalId:null, successMetric:'APAC expansion opportunity qualified and CRM opportunity created', outcomeNote:null, taskIds:[] },
  g8: { id:'g8', customerId:'axelera', title:'Q3 renewal preparation and exec alignment', description:'Prepare Axelera renewal with executive alignment and value demonstration.', type:'retention', ownerId:'james', startDate:'2024-07-20', dueDate:'2024-10-10', status:'not_started', priority:'high', visibility:'internal', publicationStatus:'draft', source:'manual', triggeringSignalId:null, successMetric:'Renewal closed on time at or above current ARR', outcomeNote:null, taskIds:[] },
  g9: { id:'g9', customerId:'techflow', title:'Seat expansion discovery at TechFlow', description:'Investigate expansion opportunity based on seat utilization signal at TechFlow.', type:'expansion', ownerId:'sarah', startDate:'2024-07-15', dueDate:'2024-09-15', status:'in_progress', priority:'medium', visibility:'internal', publicationStatus:'draft', source:'manual', triggeringSignalId:null, successMetric:'$48K expansion opportunity qualified and proposal submitted', outcomeNote:null, taskIds:[] },
  g10: { id:'g10', customerId:'meridian', title:'Executive business review — Q3 outcomes', description:'Deliver comprehensive Q3 business review for Meridian Brands leadership.', type:'retention', ownerId:'sarah', startDate:'2024-07-01', dueDate:'2024-07-31', status:'in_progress', priority:'high', visibility:'shared', publicationStatus:'published', source:'manual', triggeringSignalId:null, successMetric:'QBR delivered with exec attendance, renewal forecast confirmed', outcomeNote:null, taskIds:[] },
  g11: { id:'g11', customerId:'keystone', title:'Analytics Pro onboarding — expanded team', description:"Onboard Keystone's expanded analytics team following Q2 seat purchase.", type:'onboarding', ownerId:'sarah', startDate:'2024-07-01', dueDate:'2024-08-15', status:'in_progress', priority:'medium', visibility:'shared', publicationStatus:'published', source:'manual', triggeringSignalId:null, successMetric:'All 12 new users activated and completing core training', outcomeNote:null, taskIds:[] },
  g12: { id:'g12', customerId:'solara', title:'ML Suite adoption and use-case expansion', description:"Drive adoption of Solara's newly purchased ML Suite license across data science team.", type:'onboarding', ownerId:'sarah', startDate:'2024-07-10', dueDate:'2024-09-30', status:'in_progress', priority:'high', visibility:'shared', publicationStatus:'published', source:'manual', triggeringSignalId:null, successMetric:'5 ML models in production, data science team self-sufficient', outcomeNote:null, taskIds:[] },
};

// ============================================================
// RISK SIGNALS — eight distinct churn-warning patterns
// ============================================================
const RISK_SIGNALS = {
  usage_decline:  { id:'usage_decline',  label:'Declining usage',        icon: undefined, tone:'red',
    what:'Weekly active users or session depth falling, or the account has gone dark entirely.',
    why:'Usage is the earliest hard signal. A customer who has stopped logging in has already stopped deciding to renew.',
    play:'Find out whether it is a people change, a process change or a product failure before proposing anything.' },
  support_friction:{ id:'support_friction', label:'Support friction',    icon: undefined, tone:'amber',
    what:'Repeated tickets, SLA breaches, reopened issues or escalations on the same root cause.',
    why:'Each unresolved contact compounds. Support pain is the most common reason a healthy-looking account churns.',
    play:'Get one named owner on the root cause and give the customer a written date. Silence is what does the damage.' },
  account_change: { id:'account_change', label:'Account changes',        icon: undefined, tone:'purple',
    what:'Seat reductions, plan downgrades or licences left unassigned at renewal.',
    why:'A customer shrinking their commitment has already made a decision internally. This is late-stage risk.',
    play:'Understand the budget driver before defending the number. A partial save beats a lost renewal.' },
  feedback_scores:{ id:'feedback_scores', label:'Feedback scores',       icon: undefined, tone:'amber',
    what:'CSAT or NPS falling, detractor responses, or negative survey verbatims.',
    why:'A detractor who bothers to respond is still engaged enough to be recovered. Ignoring them converts them.',
    play:'Close the loop personally within 48 hours. Reference their exact words, not a template.' },
  no_engagement:  { id:'no_engagement',  label:'No engagement',          icon: undefined, tone:'slate',
    what:'No QBR, no meetings and no logged activity for an extended period.',
    why:'An account nobody is talking to is an account being evaluated without you in the room.',
    play:'Re-establish a business conversation, not a check-in. Bring something they did not ask for.' },
  unresponsive:   { id:'unresponsive',   label:'Non-responsive',         icon: undefined, tone:'red',
    what:'Emails unanswered or unopened across multiple attempts and multiple contacts.',
    why:'Going quiet after a history of replying is a deliberate signal, not an oversight.',
    play:'Change channel and change sender. A call from a manager gets answered when a CSM email does not.' },
  acquisition:    { id:'acquisition',    label:'Company acquisition',    icon: undefined, tone:'blue',
    what:'The account is acquired, merging, or its parent is consolidating vendors.',
    why:'Procurement review is near certain. The incumbent tool is not guaranteed to survive consolidation.',
    play:'Get in front of the acquiring side early. Renew before the consolidation review starts, not during it.' },
  sentiment_drop: { id:'sentiment_drop', label:'Sentiment trending negative', icon: undefined, tone:'red',
    what:'Language across email, tickets and calls scoring progressively more negative.',
    why:'Tone shifts before behaviour does. It is the last cheap warning before something concrete breaks.',
    play:'Move off email. A call surfaces the real objection that written threads keep polite.' },
};

const RISKS = {
  r1: { id:'r1', customerId:'acme', signal:'usage_decline', title:'Weekly active users down 62% in eight weeks',
    category:'adoption', severity:'critical', amountAtRisk:240000, probability:0.65, ownerId:'maya',
    mitigationGoalId:'g1', status:'open', evidenceIds:['e_t1','e_u1'], createdAt:'2024-07-21',
    rootCause:'A recurring ETL sync failure pushed three teams back to spreadsheets. Usage has not recovered since the first incident, and the decline is now steeper than the outage window explains.',
    metrics:[['WAU','28 (was 75)'],['Decline','\u221262% in 8w'],['Last login','2 days ago']],
    evidence:['Weekly active users fell from 75 to 28','Dashboard sessions down 71%','Three teams reverted to the old spreadsheet process','Scheduled reports disabled by an admin on 4 Aug'] },

  r2: { id:'r2', customerId:'helio', signal:'support_friction', title:'Six tickets on the same root cause, two SLA breaches',
    category:'support', severity:'high', amountAtRisk:88000, probability:0.5, ownerId:'maya',
    mitigationGoalId:null, status:'open', evidenceIds:[], createdAt:'2024-08-02',
    rootCause:'The same connector defect has generated six tickets since June. Two breached first-response SLA and one was reopened twice, so the customer has now escalated to their VP.',
    metrics:[['Tickets (90d)','6'],['SLA breaches','2'],['Reopens','2']],
    evidence:['Same root cause across all six tickets','P2 open 11 days without a fix date','Reopened twice after being marked resolved','Escalated to VP Engineering on 14 Aug'] },

  r3: { id:'r3', customerId:'talentpath', signal:'account_change', title:'Seat count cut from 220 to 140 at mid-term',
    category:'commercial', severity:'high', amountAtRisk:110000, probability:0.55, ownerId:'maya',
    mitigationGoalId:null, status:'open', evidenceIds:[], createdAt:'2024-08-09',
    rootCause:'A restructure removed the Operations pod. Finance has asked to true down seats at renewal and has separately queried the Analytics add-on line item.',
    metrics:[['Seats','140 (was 220)'],['Reduction','\u221236%'],['Add-on','Under review']],
    evidence:['80 licences unassigned for over 30 days','Finance requested a true-down quote','Operations pod dissolved in the July restructure','Downgrade path queried in writing'] },

  r4: { id:'r4', customerId:'vertex', signal:'feedback_scores', title:'NPS fell to 3 with a detractor verbatim',
    category:'sentiment', severity:'high', amountAtRisk:150000, probability:0.45, ownerId:'maya',
    mitigationGoalId:null, status:'open', evidenceIds:[], createdAt:'2024-08-11',
    rootCause:'The VP Engineering scored 3 and wrote that support response times have not matched what was sold. No one has closed the loop on that response in six days.',
    metrics:[['NPS','3 (was 8)'],['CSAT','2.6 / 5'],['Unanswered','6 days']],
    evidence:['NPS dropped 5 points quarter on quarter','Detractor verbatim names support response times','Two CSAT scores of 2 in the last month','No follow-up logged against the survey response'] },

  r5: { id:'r5', customerId:'cloudnine', signal:'no_engagement', title:'No QBR or meeting in 154 days',
    category:'relationship', severity:'high', amountAtRisk:132000, probability:0.5, ownerId:'maya',
    mitigationGoalId:null, status:'open', evidenceIds:[], createdAt:'2024-07-30',
    rootCause:'The last business review was in March. Two scheduled QBRs were cancelled by the customer and never rebooked, and there is no logged activity from either side since June.',
    metrics:[['Last QBR','154 days'],['Meetings (90d)','0'],['Renewal','17 days']],
    evidence:['Two QBRs cancelled and not rebooked','No logged activity from either side since June','Renewal is inside 30 days','Champion has not opened the last three emails'] },

  r6: { id:'r6', customerId:'atlaspay', signal:'unresponsive', title:'Nine emails unanswered across three contacts',
    category:'relationship', severity:'medium', amountAtRisk:76000, probability:0.4, ownerId:'maya',
    mitigationGoalId:null, status:'open', evidenceIds:[], createdAt:'2024-08-13',
    rootCause:'The champion replied within a day for eighteen months and has now gone silent for three weeks. Two escalation contacts have also not responded, so this is unlikely to be a holiday.',
    metrics:[['Unanswered','9 emails'],['Contacts tried','3'],['Silent for','21 days']],
    evidence:['Champion previously replied within 24 hours','Last three emails unopened','Two alternate contacts also silent','An out-of-office covered only part of the window'] },

  r7: { id:'r7', customerId:'novatech', signal:'acquisition', title:'Acquired by a group that standardises on a competitor',
    category:'commercial', severity:'critical', amountAtRisk:180000, probability:0.6, ownerId:'maya',
    mitigationGoalId:null, status:'open', evidenceIds:[], createdAt:'2024-08-06',
    rootCause:'NovaTech was acquired in July. The parent group runs a competing platform across its portfolio and has begun a vendor consolidation review covering the current contract term.',
    metrics:[['Announced','12 Jul'],['Renewal','88 days'],['Parent stack','Competitor']],
    evidence:['Acquisition confirmed in the trade press','Parent group standardises on a competing platform','Procurement contact changed to the parent entity','Budget approvals paused pending review'] },

  r8: { id:'r8', customerId:'globex', signal:'sentiment_drop', title:'Sentiment negative across email, tickets and calls',
    category:'sentiment', severity:'high', amountAtRisk:195000, probability:0.45, ownerId:'maya',
    mitigationGoalId:null, status:'open', evidenceIds:[], createdAt:'2024-08-15',
    rootCause:'Sentiment has moved from positive to negative over six weeks across every channel. The shift began after the executive sponsor left and has continued through the renewal conversation.',
    metrics:[['Sentiment','\u22120.42'],['Trend','6 weeks down'],['Channels','All three']],
    evidence:['Email sentiment fell from +0.31 to \u22120.42','Ticket replies scoring negative since 28 Jul','Call transcript flagged competitor mentions twice','Executive sponsor left six weeks ago'] },

  // Secondary examples on the same taxonomy
  r9:  { id:'r9', customerId:'databrdige', signal:'usage_decline', title:'No logins recorded for 23 days',
    category:'adoption', severity:'high', amountAtRisk:64000, probability:0.5, ownerId:'james',
    mitigationGoalId:null, status:'open', evidenceIds:[], createdAt:'2024-08-04',
    rootCause:'The account has gone completely dark. No sessions, no API traffic and no support contact since late July.',
    metrics:[['Last login','23 days'],['WAU','0'],['API calls','0']],
    evidence:['Zero sessions in 23 days','API traffic stopped on 26 Jul','No support contact in the same window'] },

  r10: { id:'r10', customerId:'pinnacle', signal:'support_friction', title:'Escalation score at 78 with a P1 open nine days',
    category:'support', severity:'high', amountAtRisk:120000, probability:0.45, ownerId:'sarah',
    mitigationGoalId:null, status:'open', evidenceIds:[], createdAt:'2024-08-12',
    rootCause:'A P1 has been open nine days without a committed fix date, and the escalation score has climbed steadily through the period.',
    metrics:[['Escalation','78 / 100'],['P1 age','9 days'],['Tickets (30d)','4']],
    evidence:['P1 open nine days with no fix date','Escalation score up 22 points this month','Four tickets in 30 days'] },
};

// ============================================================
// EXPANSION SIGNALS — five distinct buying-intent patterns
// ============================================================
const EXPANSION_SIGNALS = {
  seat_saturation: { id:'seat_saturation', label:'Seat saturation', icon: undefined, tone:'blue',
    what:'Active user count is at 80\u201390% of the plan limit.',
    why:'The account is about to run out of room. Raising it before they hit the ceiling avoids a blocked onboarding and an awkward mid-quarter negotiation.',
    play:'Lead with the utilisation curve and the date they run out. Propose the next seat tier before the wall, not after.' },
  feature_bumping: { id:'feature_bumping', label:'Feature bumping', icon: undefined, tone:'purple',
    what:'Users repeatedly hit paywalls or open locked advanced tools.',
    why:'Demand is already proven \u2014 people are trying to use something they cannot reach. This is the highest-intent signal of the five.',
    play:'Open a time-boxed trial of the locked capability for the users who hit it, then price on measured usage.' },
  volume_threshold: { id:'volume_threshold', label:'Volume thresholds', icon: undefined, tone:'amber',
    what:'Storage, API calls or monthly active contacts are approaching the cap.',
    why:'A hard limit is coming. Left alone it becomes an incident, and incidents make bad commercial conversations.',
    play:'Show the projection and the overage date. Frame the upgrade as continuity, not as an upsell.' },
  team_velocity: { id:'team_velocity', label:'Team velocity', icon: undefined, tone:'green',
    what:'New team members join or accept invites in rapid succession.',
    why:'A team scaling quickly is a team that has decided the product works. Growth in headcount usually precedes growth in spend.',
    play:'Reach the manager driving the hiring. Tie the seat pack to their onboarding schedule.' },
  workflow_spread: { id:'workflow_spread', label:'Workflow spread', icon: undefined, tone:'teal',
    what:'Teams adopt secondary use cases outside their primary tier functionality.',
    why:'The product is spreading beyond what it was bought for. That breadth is what justifies a tier change rather than an add-on.',
    play:'Map the new use case to the tier that actually supports it, and quantify the workaround cost of staying put.' },
};

// One clear worked example per signal, on a different account
const EXPANSION_OPPS = {
  e1: { id:'e1', customerId:'northstar', signal:'seat_saturation', type:'seats', estimatedArr:72000,
    confidence:'high', qualificationStatus:'candidate', ownerId:'maya', crmOpportunityState:'none', goalId:null,
    headline:'340 of 400 seats in use \u2014 85% of the plan limit',
    metrics:[['Seats used','340 / 400'],['Utilisation','85%'],['Runs out','~26 Sep']],
    evidence:['Active users up 31% in 60 days','Finance business unit onboarding next month',
              'Invites pending for 22 more users','Hit 80% threshold on 2 Aug, 85% on 14 Aug'] },

  e2: { id:'e2', customerId:'orbit', signal:'feature_bumping', type:'product', estimatedArr:45000,
    confidence:'high', qualificationStatus:'qualified', ownerId:'maya', crmOpportunityState:'draft', goalId:null,
    headline:'184 paywall hits on AI Insights in 30 days',
    metrics:[['Paywall hits','184'],['Distinct users','23'],['Repeat offenders','9']],
    evidence:['9 users hit the AI Insights lock more than 5 times each','Champion requested an ML Suite demo',
              'Data science team evaluating alternatives','Locked export format opened 41 times'] },

  e3: { id:'e3', customerId:'pinnacle', signal:'volume_threshold', type:'tier', estimatedArr:60000,
    confidence:'medium', qualificationStatus:'candidate', ownerId:'maya', crmOpportunityState:'none', goalId:null,
    headline:'API calls at 92% of the monthly ceiling',
    metrics:[['API calls','4.6M / 5M'],['Storage','78% used'],['Projected overage','11 Sep']],
    evidence:['Call volume up 40% quarter on quarter','Storage growing 6% a month',
              'Two throttling events logged this month','Monthly active contacts at 88% of cap'] },

  e4: { id:'e4', customerId:'atlaspay', signal:'team_velocity', type:'seats', estimatedArr:38000,
    confidence:'high', qualificationStatus:'candidate', ownerId:'maya', crmOpportunityState:'none', goalId:null,
    headline:'18 invites accepted in 14 days \u2014 3\u00d7 their normal rate',
    metrics:[['Invites accepted','18 in 14d'],['Normal rate','6 per month'],['Pending invites','7']],
    evidence:['New Operations pod formed in July','Two managers now inviting independently',
              'Admin raised a bulk-provisioning question','Headcount page shows 40 open roles'] },

  e5: { id:'e5', customerId:'westcorp', signal:'workflow_spread', type:'business_unit', estimatedArr:96000,
    confidence:'medium', qualificationStatus:'candidate', ownerId:'maya', crmOpportunityState:'none', goalId:null,
    headline:'Compliance team using reporting well outside the Analytics tier',
    metrics:[['Secondary use cases','3'],['Teams involved','4'],['Tier fit','Below requirement']],
    evidence:['Compliance building audit exports the tier does not support','Support raised 6 tickets about the workaround',
              'Scheduled reports used for regulatory filing','Two teams outside the original buying centre now active'] },

  // Secondary examples, same taxonomy
  e6: { id:'e6', customerId:'techflow', signal:'seat_saturation', type:'seats', estimatedArr:24000,
    confidence:'medium', qualificationStatus:'candidate', ownerId:'james', crmOpportunityState:'none', goalId:null,
    headline:'82% seat utilisation, climbing steadily',
    metrics:[['Seats used','123 / 150'],['Utilisation','82%'],['Runs out','~Nov']],
    evidence:['Crossed the 80% threshold on 9 Aug','Growth steady rather than spiking'] },

  e7: { id:'e7', customerId:'databrdige', signal:'feature_bumping', type:'product', estimatedArr:31000,
    confidence:'medium', qualificationStatus:'candidate', ownerId:'sarah', crmOpportunityState:'none', goalId:null,
    headline:'Advanced connectors opened 62 times by locked users',
    metrics:[['Paywall hits','62'],['Distinct users','11'],['Repeat offenders','4']],
    evidence:['Reverse-sync repeatedly attempted','Admin asked about connector pricing'] },

  e8: { id:'e8', customerId:'microdyn', signal:'volume_threshold', type:'tier', estimatedArr:18000,
    confidence:'low', qualificationStatus:'candidate', ownerId:'james', crmOpportunityState:'none', goalId:null,
    headline:'Storage at 81% and rising',
    metrics:[['Storage','810 GB / 1 TB'],['Growth','4% a month'],['Projected overage','Q1']],
    evidence:['No throttling yet','Retention policy not configured'] },
};



const TICKETS = [
  { id:'sup1842', customerId:'acme', subject:'Data sync failure — production impacted', severity:'critical', status:'open', age:9, sla:'breached', sentiment:'negative', revenueImpact:240000, riskId:'r1', goalId:'g1', summary:'Customer reports complete failure of ETL data sync pipeline since July 15. All production analytics dashboards show stale data. 47 affected users. Engineering investigating root cause — suspected API rate-limiting issue in the connector.', conversation:`Jul 15: Sarah M. (Acme): Our data hasn't updated since yesterday. This is critical for our board reporting.\nJul 15: Support: We've opened an investigation and escalated to engineering. ETA 24h.\nJul 16: Sarah M.: Still broken. Board meeting is Friday.\nJul 17: Support: Engineering identified a connector configuration issue. Working on fix.\nJul 19: Sarah M.: Still waiting. This is unacceptable.` },
  { id:'sup1901', customerId:'helio', subject:'Integration failure — CSM follow-up needed', severity:'high', status:'open', age:5, sla:'at_risk', sentiment:'negative', revenueImpact:88000, riskId:'r3', goalId:null, summary:'HelioWorks reports intermittent failures in their Salesforce integration causing data gaps. Fourth escalation in 60 days. CSM has not responded to customer emails from Jul 20.', conversation:`Jul 20: Mike T. (HelioWorks): Integration dropped again. We've raised this multiple times.\nJul 22: Mike T.: No response from our CSM in 2 days.` },
  { id:'sup1944', customerId:'vertex', subject:'Performance degradation — dashboard load times', severity:'medium', status:'open', age:6, sla:'on_track', sentiment:'negative', revenueImpact:50000, riskId:'r7', goalId:null, summary:'Key Vertex user experiencing 8-12s dashboard load times on complex reports. NPS detractor submitted after this issue. Engineering identified an indexing issue that will be patched in next release.', conversation:`Jul 18: Alex K. (Vertex): Dashboards are way too slow. I gave a 3 on the NPS survey because of this.\nJul 19: Support: Investigating performance issue. Workaround available.` },
  { id:'sup1888', customerId:'atlaspay', subject:'Historical data import — resolved', severity:'medium', status:'resolved', age:12, sla:'on_track', sentiment:'neutral', revenueImpact:0, riskId:'r6', goalId:'g4', summary:'AtlasPay historical data import completed after multiple retries. Customer satisfied with resolution.', conversation:'Resolved Jul 16.' },
  { id:'sup1955', customerId:'orbit', subject:'Custom report permissions request', severity:'low', status:'open', age:2, sla:'on_track', sentiment:'positive', revenueImpact:0, riskId:null, goalId:null, summary:'Orbit admin requesting expanded permissions for new Revenue Operations team lead.', conversation:`Jul 22: Admin request received.\nJul 23: Permissions update in progress.` },
  { id:'sup1922', customerId:'databrdige', subject:'Rollout blockers — IT security review', severity:'high', status:'open', age:18, sla:'breached', sentiment:'negative', revenueImpact:180000, riskId:'r4', goalId:'g6', summary:'DataBridge IT security review has stalled the platform rollout for 3 weeks. Pending approval from CISO team.', conversation:`Jul 6: IT team flagged security review requirement.\nJul 15: CISO review still pending.` },
  { id:'sup1877', customerId:'cloudnine', subject:'Admin access issue', severity:'medium', status:'open', age:8, sla:'at_risk', sentiment:'neutral', revenueImpact:0, riskId:'r5', goalId:null, summary:'CloudNine champion requesting admin access transfer due to internal org change.', conversation:'Admin access transfer pending manager approval.' },
  { id:'sup1933', customerId:'pinnacle', subject:'Compliance data export request', severity:'low', status:'in_progress', age:3, sla:'on_track', sentiment:'neutral', revenueImpact:0, riskId:'r8', goalId:'g5', summary:'Pinnacle legal team requesting a compliance data export for regulatory audit.', conversation:`Jul 21: Request received.\nJul 22: Data export prepared and under review.` },
];

// Add more mock tickets for other customers
['globex','novatech','westcorp','techflow','meridian','cascade','keystone','prism','talentpath','solara','vantage','luminary','axelera','microdyn','stratford'].forEach((cId, i) => {
  TICKETS.push({ id:`sup${2000+i}`, customerId:cId, subject:['Usage report question','Onboarding assistance needed','Feature request: bulk export','API rate limit question','Dashboard sharing setup','SSO configuration help','Training session request','Billing inquiry','Custom field question','Data retention policy question','Report scheduling issue','User deactivation request','Webhook configuration','SAML setup assistance','CSV import question'][i], severity:['low','medium','low','low','medium','medium','low','low','low','medium','low','low','medium','medium','low'][i], status:'open', age:i+1, sla:'on_track', sentiment:'neutral', revenueImpact:0, riskId:null, goalId:null, summary:'Standard support inquiry.', conversation:'Customer inquiry received and being handled by support team.' });
});

const MEETINGS = [
  { id:'m1', customerId:'acme', type:'EBR', title:'Acme Analytics — Emergency Recovery Review', date:'2024-07-29', status:'upcoming', participants:['Sarah Mitchell - VP Analytics','David Park - CFO','Maya Chen - CSM'], summary:null, decisions:[], risks:[], actionItems:[] },
  { id:'m2', customerId:'orbit', type:'QBR', title:'Orbit Systems — Q2 Business Review', date:'2024-07-10', status:'completed', participants:['Jennifer Wu - CTO','Robert Lee - VP Revenue Ops','Maya Chen - CSM'], summary:'Strong Q2 adoption results. RevOps team completed enablement. Analytics driving $1.2M in identified pipeline. Expansion discussion initiated for ML Suite.', decisions:['Proceed with ML Suite evaluation in Q3','Schedule monthly adoption reviews'], risks:[], actionItems:['Maya: Prepare ML Suite proposal by Aug 1','Jennifer: Provide data science team requirements'] },
  { id:'m3', customerId:'northstar', type:'Check-in', title:'Northstar Labs — Monthly Success Review', date:'2024-07-18', status:'completed', participants:['James Holt - Head of Product','Emily Chen - Data Lead','Maya Chen - CSM'], summary:'Excellent adoption trajectory. Finance team has started using the platform organically. Seat pressure becoming visible — 94% utilization. Customer receptive to discussing expansion.', decisions:['Explore seat expansion options'], risks:[], actionItems:['Maya: Prepare expansion analysis and proposal'] },
  { id:'m4', customerId:'globex', type:'Check-in', title:'Globex Cloud — Renewal Preparation', date:'2024-07-25', status:'upcoming', participants:['TBD - Executive','Maya Chen - CSM'], summary:null, decisions:[], risks:['Executive sponsor TBD'], actionItems:[] },
  { id:'m5', customerId:'pinnacle', type:'QBR', title:'Pinnacle Health — Q3 Planning Session', date:'2024-08-15', status:'upcoming', participants:['Carol Nguyen - CDO','Legal Team Lead','Maya Chen - CSM'], summary:null, decisions:[], risks:[], actionItems:[] },
];

const QBRS = [
  { id:'qbr1', customerId:'orbit', title:'Orbit Systems — Q2 2024 Business Review', date:'2024-07-10', status:'completed', owner:'maya', shareStatus:'shared', approvalStatus:'approved',
    execSummary:'Orbit Systems achieved strong Q2 analytics adoption with the Revenue Operations team fully onboarded. Platform is driving measurable pipeline impact. Q3 focus: ML Suite evaluation and continued adoption growth.',
    goals:[{ title:'Scale analytics adoption across Revenue Operations', status:'in_progress', progress:67 }],
    adoptionMetrics:{ wau:91, seatUtil:88, topFeatures:['Pipeline Analytics','Forecast Models','Custom Dashboards'] },
    supportMetrics:{ openTickets:1, avgResolution:'1.2 days', satisfactionScore:4.8 },
    recommendations:['Evaluate ML Suite for data science team','Expand analytics to Engineering org','Schedule executive sponsor alignment for renewal'],
    nextPeriod:'Complete RevOps adoption milestone, initiate ML Suite trial, prepare renewal proposal' },
  { id:'qbr2', customerId:'pinnacle', title:'Pinnacle Health — Q3 2024 Planning', date:'2024-08-15', status:'upcoming', owner:'maya', shareStatus:'draft', approvalStatus:'pending', execSummary:'', goals:[], adoptionMetrics:{}, supportMetrics:{}, recommendations:[], nextPeriod:'' },
  { id:'qbr3', customerId:'meridian', title:'Meridian Brands — Q3 2024 Business Review', date:'2024-07-31', status:'in_progress', owner:'sarah', shareStatus:'draft', approvalStatus:'pending', execSummary:'', goals:[], adoptionMetrics:{}, supportMetrics:{}, recommendations:[], nextPeriod:'' },
];

const CONNECTORS = [
  { id:'salesforce', name:'Salesforce', icon:'SF', status:'connected', lastSync:'2h ago', freshness:'current', recordsSynced:1247, errorCount:0, authOwner:'Maya Chen' },
  { id:'stripe', name:'Stripe', icon:'ST', status:'connected', lastSync:'4h ago', freshness:'current', recordsSynced:8934, errorCount:0, authOwner:'Maya Chen' },
  { id:'zendesk', name:'Zendesk', icon:'ZD', status:'connected', lastSync:'1h ago', freshness:'current', recordsSynced:3421, errorCount:2, authOwner:'Daniel Ortiz' },
  { id:'gmail', name:'Gmail', icon:'GM', status:'connected', lastSync:'30m ago', freshness:'current', recordsSynced:15632, errorCount:0, authOwner:'Maya Chen' },
  { id:'gong', name:'Gong', icon:'GG', status:'needs_attention', lastSync:'3d ago', freshness:'stale', recordsSynced:892, errorCount:14, authOwner:'Sarah Kim', issue:'OAuth token expired' },
  { id:'mixpanel', name:'Mixpanel', icon:'MP', status:'connected', lastSync:'6h ago', freshness:'current', recordsSynced:284721, errorCount:0, authOwner:'James Park' },
  { id:'slack', name:'Slack', icon:'SL', status:'disconnected', lastSync:'Never', freshness:'none', recordsSynced:0, errorCount:0, authOwner:null },
];

const RENEWALS = [
  { id:'ren1', customerId:'orbit', arr:320000, renewalDate:'2024-08-31', daysRemaining:38, healthBand:'green', forecast:'commit', probability:0.95, riskAmount:0, goalCoverage:true, ownerId:'maya', nextStep:'Prepare final renewal proposal' },
  { id:'ren2', customerId:'globex', arr:195000, renewalDate:'2024-08-22', daysRemaining:29, healthBand:'yellow', forecast:'at_risk', probability:0.45, riskAmount:195000, goalCoverage:true, ownerId:'maya', nextStep:'Identify executive sponsor immediately' },
  { id:'ren3', customerId:'acme', arr:240000, renewalDate:'2024-10-06', daysRemaining:74, healthBand:'red', forecast:'at_risk', probability:0.35, riskAmount:240000, goalCoverage:true, ownerId:'maya', nextStep:'Accept recovery goal and start outreach' },
  { id:'ren4', customerId:'atlaspay', arr:220000, renewalDate:'2024-09-30', daysRemaining:68, healthBand:'yellow', forecast:'likely', probability:0.72, riskAmount:50000, goalCoverage:true, ownerId:'maya', nextStep:'Platform health review meeting' },
  { id:'ren5', customerId:'databrdige', arr:180000, renewalDate:'2024-09-01', daysRemaining:39, healthBand:'red', forecast:'at_risk', probability:0.30, riskAmount:180000, goalCoverage:true, ownerId:'james', nextStep:'Remove IT blockers for rollout' },
  { id:'ren6', customerId:'cloudnine', arr:110000, renewalDate:'2024-08-10', daysRemaining:17, healthBand:'red', forecast:'at_risk', probability:0.25, riskAmount:110000, goalCoverage:false, ownerId:'james', nextStep:'Urgently escalate champion situation' },
  { id:'ren7', customerId:'novatech', arr:90000, renewalDate:'2024-09-15', daysRemaining:53, healthBand:'red', forecast:'at_risk', probability:0.40, riskAmount:90000, goalCoverage:false, ownerId:'james', nextStep:'Executive alignment call with new budget context' },
  { id:'ren8', customerId:'talentpath', arr:78000, renewalDate:'2024-10-15', daysRemaining:83, healthBand:'yellow', forecast:'upside', probability:0.60, riskAmount:30000, goalCoverage:false, ownerId:'sarah', nextStep:'Adoption recovery engagement' },
  { id:'ren9', customerId:'vantage', arr:88000, renewalDate:'2024-11-01', daysRemaining:100, healthBand:'yellow', forecast:'likely', probability:0.68, riskAmount:0, goalCoverage:false, ownerId:'sarah', nextStep:'Monthly check-in scheduled' },
  { id:'ren10', customerId:'helio', arr:88000, renewalDate:'2024-11-15', daysRemaining:114, healthBand:'yellow', forecast:'likely', probability:0.65, riskAmount:20000, goalCoverage:false, ownerId:'maya', nextStep:'Follow up on critical ticket' },
];

const CONTACTS = {
  c1: { id:'c1', customerId:'acme', name:'Sarah Mitchell', role:'Executive Sponsor', email:'sarah.mitchell@acme-analytics.io', engagement:'low', sentiment:'negative', lastActivity:'Jul 16' },
  c2: { id:'c2', customerId:'acme', name:'David Park', role:'Champion', email:'d.park@acme-analytics.io', engagement:'medium', sentiment:'neutral', lastActivity:'Jul 18' },
  c3: { id:'c3', customerId:'acme', name:'Raj Patel', role:'Admin', email:'r.patel@acme-analytics.io', engagement:'high', sentiment:'neutral', lastActivity:'Jul 23' },
  c4: { id:'c4', customerId:'northstar', name:'James Holt', role:'Executive Sponsor', email:'jholt@northstarlabs.com', engagement:'high', sentiment:'positive', lastActivity:'Jul 18' },
  c5: { id:'c5', customerId:'northstar', name:'Emily Chen', role:'Champion', email:'echen@northstarlabs.com', engagement:'high', sentiment:'positive', lastActivity:'Jul 21' },
  c6: { id:'c6', customerId:'orbit', name:'Jennifer Wu', role:'Executive Sponsor', email:'jwu@orbitsystems.com', engagement:'high', sentiment:'positive', lastActivity:'Jul 10' },
  c7: { id:'c7', customerId:'orbit', name:'Robert Lee', role:'Champion', email:'rlee@orbitsystems.com', engagement:'high', sentiment:'positive', lastActivity:'Jul 20' },
  c8: { id:'c8', customerId:'globex', name:'TBD', role:'Executive Sponsor', email:null, engagement:'none', sentiment:'unknown', lastActivity:'N/A' },
  c9: { id:'c9', customerId:'helio', name:'Mike Torres', role:'Champion', email:'mtorres@helioworks.com', engagement:'medium', sentiment:'negative', lastActivity:'Jul 22' },
  c10: { id:'c10', customerId:'vertex', name:'Alex Kim', role:'Champion', email:'akim@vertexai.co', engagement:'medium', sentiment:'negative', lastActivity:'Jul 18' },
  c11: { id:'c11', customerId:'atlaspay', name:'Priya Shah', role:'Champion', email:'pshah@atlaspay.com', engagement:'medium', sentiment:'neutral', lastActivity:'Jul 20' },
  c12: { id:'c12', customerId:'pinnacle', name:'Carol Nguyen', role:'Executive Sponsor', email:'cnguyen@pinnaclehealth.org', engagement:'high', sentiment:'positive', lastActivity:'Jul 22' },
};

// ============================================================


function cxHash(s){ let h=0; for(let i=0;i<String(s).length;i++){ h=((h<<5)-h)+String(s).charCodeAt(i); h|=0; } return Math.abs(h); }

export {
  ACTION_TASKS,
  CONNECTORS,
  CONTACTS,
  CUSTOMERS,
  EXPANSION_OPPS,
  EXPANSION_SIGNALS,
  GOALS,
  HEALTH_SIGNALS,
  MEETINGS,
  QBRS,
  RENEWALS,
  RISKS,
  RISK_SIGNALS,
  TASKS,
  TICKETS,
  USERS,
  calcHealth,
  cxHash,
  genHistory,
};
