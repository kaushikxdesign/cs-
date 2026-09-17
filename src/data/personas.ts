const PERSONAS = {
  csm:     { id:'csm',     label:'Customer Success Manager', short:'CSM',           icon: undefined, tone:'blue',
             pivot:'customer', desc:'Everything revolves around accounts \u2014 health, renewals, expansion and goals.' },
};

const NAV_BY_PERSONA = {
  csm:     ['/dashboard','/work','/customers','/risks','/expansion','/actions','/drive','/admin'],
};

export {
  NAV_BY_PERSONA,
  PERSONAS,
};
