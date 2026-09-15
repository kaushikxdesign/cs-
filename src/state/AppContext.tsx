import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { SEED_ATTR_CHANGES } from '@/data/attributes';
import { SEEDED_ACTIONS } from '@/data/automations';
import { ACTION_TASKS, CUSTOMERS, EXPANSION_OPPS, GOALS, RENEWALS, RISKS, TASKS } from '@/data/core';
import { EMAILS, EMAIL_CONFIG_DEFAULTS, SUPPORT_MAILBOXES, routeEmails } from '@/data/emails';
import { TICKET_GATE_DEFAULTS } from '@/data/tickets';
import { appReducer } from '@/state/appReducer';

const AppContext = createContext<any>(null);

function AppProvider({ children }: { children: React.ReactNode }) {
  const initialState = {
    activeRole: 'csm',
    persona: 'csm',
    followedTickets: ['sup1842'],
    // Captured gated field sets, keyed by ticket id:
    //   { sup1842: { firstResponse: {values, at, by}, resolution: {...} } }
    ticketGates: {},
    gateConfig: TICKET_GATE_DEFAULTS,
    activeUser: 'maya',
    customers: CUSTOMERS,
    goals: GOALS,
    tasks: Object.assign({}, TASKS, ACTION_TASKS),
    risks: RISKS,
    expansionOpps: EXPANSION_OPPS,
    renewals: RENEWALS,
    toasts: [],
    dismissedPriority: [],
    snoozedPriority: [],
    readItems: [],
    customWidgets: [],
    actions: SEEDED_ACTIONS,
    emails: routeEmails(EMAILS, EMAIL_CONFIG_DEFAULTS, CUSTOMERS),
    emailConfig: EMAIL_CONFIG_DEFAULTS,
    supportMailboxes: SUPPORT_MAILBOXES,
    attrChanges: SEED_ATTR_CHANGES,
    mailbox: { connected:true, provider:'gmail', address:'maya.chen@cx42.io', synced:'12 minutes ago' },
    assistantOpen: false,
    assistantContext: null,
    lastCreatedGoalId: null,
  };
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // Auto-dismiss toasts
  useEffect(() => {
    if(state.toasts.length > 0) {
      const timer = setTimeout(() => dispatch({ type:'DISMISS_TOAST', id: state.toasts[0].id }), 4000);
      return () => clearTimeout(timer);
    }
  }, [state.toasts]);
  
  return React.createElement(AppContext.Provider, { value: { state, dispatch } }, children);
}

function useApp() { return useContext(AppContext); }

export {
  AppContext,
  AppProvider,
  useApp,
};
