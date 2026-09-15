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

export {
  TICKET_GATE_DEFAULTS,
};
