const ATTR_LABELS = {
  churn:     { label:'Customer churn',      values:{ healthy:'Healthy', likely:'Likely to churn', confirmed:'Confirm churn' } },
  renewal:   { label:'Renewal possibility', values:{ on_track:'On-track', at_risk:'At risk' } },
  sentiment: { label:'Sentiment',           values:{ positive:'Positive', neutral:'Neutral', negative:'Negative' } },
};

const SEED_ATTR_CHANGES = [
  { id:'ac1', customerId:'acme', field:'sentiment', from:'neutral', to:'negative',
    reason:'Three consecutive ticket replies scored negative and the champion escalated to their VP over the unresolved sync failure.',
    by:'maya', at:'2025-08-12T21:44:00' },
  { id:'ac2', customerId:'acme', field:'churn', from:'healthy', to:'likely',
    reason:'Nine days on an unresolved P1 with users reverting to spreadsheets. Renewal is 74 days out and the sponsor has gone quiet.',
    by:'maya', at:'2025-08-14T06:20:00' },
  { id:'ac3', customerId:'acme', field:'renewal', from:'on_track', to:'at_risk',
    reason:'Sponsor asked whether to include platform numbers in the board update — signals they are weighing alternatives.',
    by:'maya', at:'2025-08-17T08:30:00' },
  { id:'ac4', customerId:'globex', field:'renewal', from:'at_risk', to:'on_track',
    reason:'Procurement has the order form in review and the economic buyer is confirmed. Blocker cleared.',
    by:'maya', at:'2025-08-17T06:55:00' },
];

export {
  ATTR_LABELS,
  SEED_ATTR_CHANGES,
};
