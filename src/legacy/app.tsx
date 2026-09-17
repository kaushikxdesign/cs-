// ============================================================
// LEGACY CX42 APP — extracted verbatim from the single-file MVP
// (public/legacy/index.html, lines 101-13774).
//
// This file is a quarantine, not a destination. Phase 1 moved the
// code here unchanged so it compiles and runs under Vite; every
// later phase pulls screens OUT of it into src/features/*. When the
// last screen leaves, this file and its @ts-nocheck go with it.
//
// The only edits made during extraction were to the first 20 lines:
// UMD globals (React, Recharts) became real imports, and App /
// ErrorBoundary became exports. Nothing below that was touched.
// ============================================================

// @ts-nocheck
/* eslint-disable */
import React, {
  useState, useEffect, useContext, useReducer,
  createContext, useRef, useCallback, useMemo,
} from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';
import {
  DRIVE_FILES,
  DRIVE_KINDS,
  DRIVE_SOPS,
} from '@/data/drive';

import {
  HashRouter,
  Link,
  NavLink,
  ParamsCtx,
  Route,
  RouterCtx,
  Routes,
  matchPath,
  parseQuery,
  useLocation,
  useNavigate,
  useParams,
} from '@/router/index';
import {
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
} from '@/data/core';
import {
  EMAILS,
  EMAIL_CONFIG_DEFAULTS,
  EMAIL_TEMPLATES,
  SUPPORT_MAILBOXES,
  TASK_SOURCES,
  classifyAddress,
  emailDomainOf,
  routeEmail,
  routeEmails,
} from '@/data/emails';
import {
  ATTR_LABELS,
  SEED_ATTR_CHANGES,
} from '@/data/attributes';
import {
  NAV_BY_PERSONA,
  PERSONAS,
} from '@/data/personas';
import {
  SLA_TARGET_HOURS,
  TICKET_ACTIONS,
  TICKET_FIELD_DEFS,
  TICKET_GATE_DEFAULTS,
  TICKET_PRIMARY_FIELDS,
  TICKET_SAVED_FILTERS,
  actionsForTicket,
  ticketSla,
} from '@/data/tickets';
import {
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
} from '@/data/automations';
import {
  appReducer,
} from '@/state/appReducer';
import {
  AppContext,
  AppProvider,
  useApp,
} from '@/state/AppContext';

// SECTION 2: GLOBAL STATE
// ============================================================



const taskSourceMeta = (t) => TASK_SOURCES[(t && t.source) || 'manual'] || TASK_SOURCES.manual;





// ============================================================
// SECTION 3: SHARED COMPONENTS
// ============================================================

function Avatar({ user, size='sm' }) {
  const u = typeof user === 'string' ? USERS[user] : user;
  if(!u) return null;
  const sz = size === 'sm' ? 'w-7 h-7 text-xs' : size === 'lg' ? 'w-10 h-10 text-sm' : 'w-8 h-8 text-xs';
  return React.createElement('div', { className: `${sz} rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0`, style: { background: u.color || '#4f46e5' } }, u.initials);
}

function HealthBadge({ band, score, size='sm' }) {
  const cfg = {
    red: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500', label: 'At risk' },
    yellow: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Needs attention' },
    green: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500', label: 'Healthy' },
  }[band] || { bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400', label: 'No data' };
  return React.createElement('span', { className: `inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}` },
    React.createElement('span', { className: `w-1.5 h-1.5 rounded-full ${cfg.dot}` }),
    cfg.label, score != null && React.createElement('span', { className: 'font-bold' }, score)
  );
}

function SeverityBadge({ severity }) {
  const cfg = { critical: 'bg-red-100 text-red-700', high: 'bg-orange-100 text-orange-700', medium: 'bg-amber-100 text-amber-700', low: 'bg-gray-100 text-gray-600' }[severity] || 'bg-gray-100 text-gray-600';
  return React.createElement('span', { className: `px-2 py-0.5 rounded text-xs font-medium ${cfg} capitalize` }, severity);
}

function StatusBadge({ status }) {
  const cfg = {
    not_started: 'bg-gray-100 text-gray-600',
    in_progress: 'bg-blue-100 text-blue-700',
    at_risk: 'bg-red-100 text-red-700',
    completed: 'bg-green-100 text-green-700',
    abandoned: 'bg-gray-100 text-gray-500',
    todo: 'bg-gray-100 text-gray-600',
    done: 'bg-green-100 text-green-700',
    skipped: 'bg-gray-100 text-gray-400',
    upcoming: 'bg-amber-100 text-amber-700',
  }[status] || 'bg-gray-100 text-gray-600';
  const label = { not_started: 'Not started', in_progress: 'In progress', at_risk: 'At risk', completed: 'Completed', abandoned: 'Abandoned', todo: 'To do', done: 'Done', skipped: 'Skipped', upcoming: 'Upcoming' }[status] || status;
  return React.createElement('span', { className: `px-2 py-0.5 rounded text-xs font-medium ${cfg}` }, label);
}

function Card({ children, className='', onClick, ...rest }) {
  return React.createElement('div', Object.assign({
    className: `bg-white rounded-xl border border-slate-200 shadow-sm ${className}`,
    onClick,
    role: onClick ? 'button' : undefined,
    tabIndex: onClick ? 0 : undefined,
    onKeyDown: onClick ? (e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(e); } }) : undefined,
  }, rest), children);
}

function MetricCard({ label, value, sub, subColor='text-slate-500', onClick }) {
  return React.createElement(Card, { className: `p-4 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`, onClick },
    React.createElement('p', { className: 'text-xs font-medium text-slate-500 uppercase tracking-wide' }, label),
    React.createElement('p', { className: 'text-2xl font-bold text-slate-900 mt-1' }, value),
    sub && React.createElement('p', { className: `text-xs mt-0.5 ${subColor}` }, sub)
  );
}

function Btn({ children, variant='primary', size='sm', onClick, disabled, className='' }) {
  const base = 'inline-flex items-center gap-1.5 font-medium rounded-lg transition-all cursor-pointer border ';
  const sz = size === 'sm' ? 'px-3 py-1.5 text-sm' : size === 'xs' ? 'px-2 py-1 text-xs' : 'px-4 py-2 text-sm';
  const variants = {
    primary: 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700',
    secondary: 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50',
    danger: 'bg-red-600 text-white border-red-600 hover:bg-red-700',
    ghost: 'bg-transparent text-slate-600 border-transparent hover:bg-slate-100',
    success: 'bg-green-600 text-white border-green-600 hover:bg-green-700',
    teal: 'bg-teal-600 text-white border-teal-600 hover:bg-teal-700',
  };
  return React.createElement('button', { className: `${base}${sz} ${variants[variant]||variants.secondary} ${disabled?'opacity-50 cursor-not-allowed':''} ${className}`, onClick, disabled }, children);
}

function Progress({ value, max=100, color='indigo' }) {
  const pct = Math.min(100, Math.round((value/max)*100));
  const colors = { indigo: 'bg-indigo-500', green: 'bg-green-500', amber: 'bg-amber-500', red: 'bg-red-500' };
  return React.createElement('div', { className: 'w-full' },
    React.createElement('div', { className: 'flex justify-between text-xs text-slate-500 mb-1' }, React.createElement('span', null), React.createElement('span', null, `${pct}%`)),
    React.createElement('div', { className: 'w-full bg-slate-100 rounded-full h-2' },
      React.createElement('div', { className: `h-2 rounded-full ${colors[color]||colors.indigo} transition-all`, style: { width: `${pct}%` } })
    )
  );
}

function Tabs({ tabs, active, onChange }) {
  return React.createElement('div', { className: 'flex gap-1 border-b border-slate-200' },
    tabs.map(tab => React.createElement('button', { key: tab.id, onClick: () => onChange(tab.id), className: `px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${active===tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}` }, tab.label))
  );
}

function Drawer({ open, onClose, title, children, width='w-[480px]' }) {
  if(!open) return null;
  return React.createElement('div', { className: 'fixed inset-0 z-40 flex justify-end' },
    React.createElement('div', { className: 'absolute inset-0 bg-black/30', onClick: onClose }),
    React.createElement('div', { className: `relative ${width} h-full bg-white shadow-2xl flex flex-col animate-slide-in` },
      React.createElement('div', { className: 'flex items-center justify-between px-6 py-4 border-b' },
        React.createElement('h3', { className: 'font-semibold text-slate-900' }, title),
        React.createElement('button', { onClick: onClose, className: 'text-slate-400 hover:text-slate-600 text-xl' }, '×')
      ),
      React.createElement('div', { className: 'flex-1 overflow-y-auto p-6' }, children)
    )
  );
}

function Modal({ open, onClose, title, children, size='md' }) {
  if(!open) return null;
  const sz = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }[size] || 'max-w-lg';
  return React.createElement('div', { className: 'fixed inset-0 z-50 flex items-center justify-center p-4' },
    React.createElement('div', { className: 'absolute inset-0 bg-black/40', onClick: onClose }),
    React.createElement('div', { className: `relative w-full ${sz} bg-white rounded-2xl shadow-2xl animate-fade-in max-h-[90vh] flex flex-col` },
      React.createElement('div', { className: 'flex items-center justify-between px-6 py-4 border-b flex-shrink-0' },
        React.createElement('h3', { className: 'font-semibold text-slate-900' }, title),
        React.createElement('button', { onClick: onClose, className: 'text-slate-400 hover:text-slate-600 text-xl' }, '×')
      ),
      React.createElement('div', { className: 'overflow-y-auto flex-1 p-6' }, children)
    )
  );
}

function Toast({ toasts, dispatch }) {
  return React.createElement('div', { className: 'fixed bottom-4 right-4 z-50 flex flex-col gap-2' },
    toasts.map(t => React.createElement('div', { key: t.id, className: `flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-fade-in ${t.type==='success'?'bg-green-600 text-white':t.type==='danger'?'bg-red-600 text-white':'bg-slate-800 text-white'}` },
      React.createElement('span', null, t.type==='success'?'✓':'ℹ'),
      React.createElement('span', null, t.msg),
      React.createElement('button', { onClick: ()=>dispatch({type:'DISMISS_TOAST',id:t.id}), className:'ml-2 opacity-70 hover:opacity-100' }, '×')
    ))
  );
}

function formatCurrency(n) { return n >= 1000000 ? `$${(n/1000000).toFixed(2)}M` : `$${(n/1000).toFixed(0)}K`; }
function formatARR(n) { return `$${(n/1000).toFixed(0)}K`; }
function daysUntil(dateStr) { return Math.ceil((new Date(dateStr) - new Date()) / 86400000); }

function toISODate(d) { return d.toISOString().split('T')[0]; }

function getDatePresetRange(preset) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dow = startOfDay.getDay(); // 0 = Sunday
  switch(preset) {
    case 'today':
      return { from: toISODate(startOfDay), to: toISODate(startOfDay) };
    case 'tomorrow': {
      const d = new Date(startOfDay); d.setDate(d.getDate() + 1);
      return { from: toISODate(d), to: toISODate(d) };
    }
    case 'this_week': {
      const start = new Date(startOfDay); start.setDate(start.getDate() - dow);
      const end = new Date(start); end.setDate(start.getDate() + 6);
      return { from: toISODate(start), to: toISODate(end) };
    }
    case 'next_week': {
      const start = new Date(startOfDay); start.setDate(start.getDate() - dow + 7);
      const end = new Date(start); end.setDate(start.getDate() + 6);
      return { from: toISODate(start), to: toISODate(end) };
    }
    case 'this_month': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { from: toISODate(start), to: toISODate(end) };
    }
    default:
      return { from: '', to: '' };
  }
}

function getCustomerHealth(customer, healthSignals) {
  return healthSignals[customer.healthId];
}

function goalProgress(goal, tasks) {
  if(!goal.taskIds || goal.taskIds.length === 0) return 0;
  const ts = goal.taskIds.map(id => tasks[id]).filter(Boolean);
  const active = ts.filter(t => t.status !== 'skipped');
  if(active.length === 0) return 0;
  return Math.round(active.filter(t => t.status === 'done').length / active.length * 100);
}

function sharedGoalProgress(goal, tasks) {
  if(!goal.taskIds || goal.taskIds.length === 0) return 0;
  const ts = goal.taskIds.map(id => tasks[id]).filter(t => t && t.visibility === 'shared');
  const active = ts.filter(t => t.status !== 'skipped');
  if(active.length === 0) return 0;
  return Math.round(active.filter(t => t.status === 'done').length / active.length * 100);
}

// EvidenceChip
function EvidenceChip({ label, type }) {
  const colors = { usage:'bg-blue-100 text-blue-700', ticket:'bg-red-100 text-red-700', email:'bg-purple-100 text-purple-700', survey:'bg-green-100 text-green-700', commercial:'bg-amber-100 text-amber-700', meeting:'bg-indigo-100 text-indigo-700' };
  return React.createElement('span', { className: `px-2 py-0.5 rounded-full text-xs font-medium ${colors[type]||'bg-gray-100 text-gray-600'}` }, label);
}

// ============================================================
// CUSTOM DASHBOARD — widget field catalogue & data helpers
// ============================================================

const CUSTOMER_FIELDS = [
  { key:'segment', label:'Segment', type:'category' },
  { key:'healthBand', label:'Health band', type:'category' },
  { key:'ownerId', label:'Owner', type:'category' },
  { key:'renewalMonth', label:'Renewal month', type:'category' },
  { key:'arr', label:'ARR', type:'number', defaultAgg:'sum' },
];

const TICKET_FIELDS = [
  { key:'severity', label:'Severity', type:'category' },
  { key:'status', label:'Status', type:'category' },
  { key:'sla', label:'SLA', type:'category' },
  { key:'age', label:'Age (days)', type:'number', defaultAgg:'avg' },
  { key:'revenueImpact', label:'Revenue impact', type:'number', defaultAgg:'sum' },
];

function fieldsFor(source) { return source === 'tickets' ? TICKET_FIELDS : CUSTOMER_FIELDS; }
function recordsFor(source) { return source === 'tickets' ? TICKETS : CUSTOMERS; }

function getFieldValue(source, record, key) {
  if(source === 'customers') {
    if(key === 'healthBand') return HEALTH_SIGNALS[record.healthId]?.band || 'unknown';
    if(key === 'ownerId') return USERS[record.ownerId]?.name || record.ownerId;
    if(key === 'renewalMonth') return record.renewalDate ? new Date(record.renewalDate).toLocaleString('en-US',{month:'short',year:'numeric'}) : 'Unknown';
    return record[key];
  }
  return record[key];
}

function makeWidgetId() { return 'w_' + Date.now() + '_' + Math.random().toString(36).slice(2,6); }

function fieldToWidget(source, field) {
  if(field.type === 'number') {
    const agg = field.defaultAgg || 'sum';
    const aggLabel = agg === 'avg' ? 'Average' : agg === 'count' ? 'Count of' : 'Total';
    return { id:makeWidgetId(), source, type:'metric', field:field.key, agg, title:`${aggLabel} ${field.label}` };
  }
  return { id:makeWidgetId(), source, type:'breakdown', groupBy:field.key, agg:'count', title:`${source==='tickets'?'Tickets':'Customers'} by ${field.label}` };
}

function listWidget(source) {
  return { id:makeWidgetId(), source, type:'list', sortField: source==='tickets' ? 'revenueImpact' : 'arr', title: source==='tickets' ? 'Recent tickets' : 'Top customers' };
}

function computeWidgetData(widget) {
  const records = recordsFor(widget.source);
  if(widget.type === 'metric') {
    const vals = records.map(r => getFieldValue(widget.source, r, widget.field)).filter(v => typeof v === 'number');
    if(widget.agg === 'count') return { value: records.length };
    if(widget.agg === 'avg') return { value: vals.length ? Math.round(vals.reduce((a,b)=>a+b,0)/vals.length) : 0 };
    return { value: vals.reduce((a,b)=>a+b,0) };
  }
  if(widget.type === 'breakdown') {
    const groups = {};
    records.forEach(r => {
      const g = getFieldValue(widget.source, r, widget.groupBy) || 'Unknown';
      if(!groups[g]) groups[g] = { count:0, sum:0 };
      groups[g].count++;
      if(widget.valueField) {
        const v = getFieldValue(widget.source, r, widget.valueField);
        if(typeof v === 'number') groups[g].sum += v;
      }
    });
    const rows = Object.entries(groups).map(([label, g]) => ({
      label,
      value: widget.agg === 'sum' ? g.sum : widget.agg === 'avg' ? Math.round(g.sum / g.count) : g.count
    })).sort((a,b) => b.value - a.value);
    return { rows };
  }
  if(widget.type === 'list') {
    let rows = [...records];
    if(widget.sortField) rows.sort((a,b) => (getFieldValue(widget.source,b,widget.sortField)||0) - (getFieldValue(widget.source,a,widget.sortField)||0));
    return { rows: rows.slice(0,6) };
  }
  return {};
}

// Very lightweight keyword-based prompt parser (no external AI call — mirrors the
// rule-based "assistant" demos used elsewhere in this prototype).
function parsePromptToWidget(prompt) {
  const p = prompt.toLowerCase();
  const isTickets = /ticket|support|\bsla\b|revenue impact/.test(p);
  const source = isTickets ? 'tickets' : 'customers';
  const fields = fieldsFor(source);
  const fieldKeywordMap = isTickets
    ? { severity:['severity','critical'], status:['status'], sla:['sla'], age:['age','days open'], revenueImpact:['revenue impact','impact','revenue at risk','revenue'] }
    : { segment:['segment'], healthBand:['health'], ownerId:['owner','csm'], renewalMonth:['renewal'], arr:['arr','revenue','value'] };

  function findField(text) {
    for(const [key, kws] of Object.entries(fieldKeywordMap)) {
      if(kws.some(kw => text.includes(kw))) return fields.find(f => f.key === key);
    }
    return null;
  }

  const byMatch = p.match(/\bby\s+([a-z][a-z\s]*)/);
  const beforeBy = byMatch ? p.slice(0, byMatch.index) : p;
  const afterBy = byMatch ? byMatch[1] : '';

  const primaryField = findField(beforeBy);
  const groupField = afterBy ? findField(afterBy) : null;

  if(!primaryField && !groupField) {
    if(/\blist\b/.test(p)) return listWidget(source);
    return null;
  }

  const wantsAvg = /average|\bavg\b|mean/.test(p);
  const wantsSum = /total|\bsum\b/.test(p);

  if(primaryField && primaryField.type === 'number' && groupField && groupField.type === 'category') {
    const agg = wantsAvg ? 'avg' : 'sum';
    return { id:makeWidgetId(), source, type:'breakdown', groupBy:groupField.key, valueField:primaryField.key, agg, title:`${agg==='avg'?'Average':'Total'} ${primaryField.label} by ${groupField.label}` };
  }
  if(groupField) return fieldToWidget(source, groupField);
  if(primaryField.type === 'number') {
    const agg = wantsAvg ? 'avg' : wantsSum ? 'sum' : (primaryField.defaultAgg || 'sum');
    const w = fieldToWidget(source, primaryField);
    w.agg = agg;
    w.title = `${agg==='avg'?'Average':'Total'} ${primaryField.label}`;
    return w;
  }
  return fieldToWidget(source, primaryField);
}

// ============================================================
// SECTION 4: LAYOUT
// ============================================================

const NAV = [
  { label:'Dashboard', path:'/dashboard', icon:'▦' },
  { label:'My Work', path:'/work', icon:'✓' },
  { label:'Customers', path:'/customers', icon:'⬛' },
  { label:'Risks', path:'/risks', icon:'⚠' },
  { label:'Expansion', path:'/expansion', icon:'↗' },
  { label:'Actions', path:'/actions', icon:'⚡' },
  { label:'CX42 Drive', path:'/drive', icon:'📁' },
  { label:'Admin', path:'/admin', icon:'⚙' },
];



// ============================================================
// ROLES & PRIVILEGES
// Single source of truth \u2014 consumed by Admin \u203a Roles and by
// Profile settings \u203a Configuration, so the two can never drift.
// ============================================================
const APP_ROLES = [
  { id:'csm',        label:'CSM',           tone:'blue',   desc:'Owns a portfolio of accounts and the day-to-day success motion.' },
  { id:'senior_csm', label:'Senior CSM',    tone:'purple', desc:'Owns strategic accounts and mentors other CSMs.' },
  { id:'team_lead',  label:'Team Lead',     tone:'teal',   desc:'Runs a pod of CSMs; owns queue coverage and process adherence.' },
  { id:'manager',    label:'Manager',       tone:'green',  desc:'Owns the function \u2014 reporting, configuration and staffing.' },
  { id:'support',    label:'Support Agent', tone:'amber',  desc:'Works tickets; limited access to commercial account data.' },
];
const APP_ROLE_LABELS = APP_ROLES.map(r => r.label);
const roleIdFromLabel = (label) => (APP_ROLES.find(r => r.label === label) || APP_ROLES[0]).id;

// Every privilege is listed individually and granted per role.
// Key: [csm, senior_csm, team_lead, manager, support]
const PRIVILEGE_GROUPS = [
  { group:'Customers', icon:'\u{1F3E2}', items:[
    { key:'cust.view_own',      label:'View own portfolio',            desc:'See accounts where the user is the assigned owner.',            roles:[1,1,1,1,1] },
    { key:'cust.view_all',      label:'View all accounts',             desc:'See every account regardless of ownership.',                    roles:[0,1,1,1,0] },
    { key:'cust.edit_fields',   label:'Edit account fields',           desc:'Change health inputs, churn status, sentiment and segment.',    roles:[1,1,1,1,0] },
    { key:'cust.reassign',      label:'Reassign account owner',        desc:'Move an account to a different CSM.',                           roles:[0,0,1,1,0] },
    { key:'cust.export',        label:'Export customer data',          desc:'Download account lists and health history as CSV.',             roles:[0,1,1,1,0] },
    { key:'cust.delete',        label:'Delete an account',             desc:'Permanently remove an account record.',                         roles:[0,0,0,1,0] },
  ]},
  { group:'Goals & tasks', icon:'\u{1F3AF}', items:[
    { key:'goal.create',        label:'Create goals',                  desc:'Raise a new goal on any account they can view.',                roles:[1,1,1,1,0] },
    { key:'goal.edit_own',      label:'Edit own goals',                desc:'Amend goals they own.',                                          roles:[1,1,1,1,0] },
    { key:'goal.edit_any',      label:'Edit any goal',                 desc:'Amend goals owned by other users.',                              roles:[0,0,1,1,0] },
    { key:'goal.delete',        label:'Delete goals',                  desc:'Remove a goal and its child tasks.',                             roles:[0,0,1,1,0] },
    { key:'task.complete',      label:'Complete tasks',                desc:'Mark tasks done or skipped.',                                    roles:[1,1,1,1,1] },
    { key:'task.reassign',      label:'Reassign tasks',                desc:'Move a task to another owner.',                                  roles:[0,1,1,1,0] },
  ]},
  { group:'Tickets', icon:'\u{1F3AB}', items:[
    { key:'tkt.view',           label:'View tickets',                  desc:'Read tickets on accounts they can view.',                        roles:[1,1,1,1,1] },
    { key:'tkt.reply',          label:'Reply to tickets',              desc:'Post public replies to the customer.',                           roles:[0,0,0,0,1] },
    { key:'tkt.note',           label:'Add private notes',             desc:'Post internal-only notes on a ticket.',                          roles:[1,1,1,1,1] },
    { key:'tkt.priority',       label:'Change ticket priority',        desc:'Raise or lower ticket priority.',                                roles:[0,1,1,1,1] },
    { key:'tkt.escalate',       label:'Escalate a ticket',             desc:'Push a ticket to tier 2 or engineering.',                        roles:[1,1,1,1,1] },
    { key:'tkt.close',          label:'Close tickets',                 desc:'Resolve or close a ticket.',                                     roles:[0,0,1,1,1] },
  ]},
  { group:'Actions', icon:'\u26A1', items:[
    { key:'act.view',           label:'View the action library',       desc:'See published actions and what they do.',                        roles:[1,1,1,1,1] },
    { key:'act.edit_message',   label:'Edit action messages',          desc:'Personalise the email or chat copy an action sends.',            roles:[1,1,1,1,0] },
    { key:'act.pause',          label:'Pause or resume an action',     desc:'Temporarily stop an action from running.',                       roles:[0,1,1,1,0] },
    { key:'act.clone',          label:'Publish an action from an automation', desc:'Clone a customer automation into the action library.',    roles:[0,0,0,1,0] },
  ]},
  { group:'Automation (admin)', icon:'\u{1F9E9}', items:[
    { key:'auto.view',          label:'View automations',              desc:'Open the automation builder in read mode.',                      roles:[0,0,1,1,0] },
    { key:'auto.create',        label:'Create or edit automations',    desc:'Build triggers, conditions and actions.',                        roles:[0,0,0,1,0] },
    { key:'auto.delete',        label:'Delete automations',            desc:'Permanently remove an automation.',                              roles:[0,0,0,1,0] },
  ]},
  { group:'CX42 Drive', icon:'\u{1F4C1}', items:[
    { key:'drive.view',         label:'View Drive content',            desc:'Read SOPs, QBR decks and goal templates.',                  roles:[1,1,1,1,1] },
    { key:'drive.upload',       label:'Upload templates and SOPs',     desc:'Add new files to the Drive library.',                            roles:[0,1,1,1,0] },
    { key:'drive.publish',      label:'Publish or unpublish',          desc:'Move a Drive item between draft and published.',                 roles:[0,0,1,1,0] },
    { key:'drive.delete',       label:'Delete Drive content',          desc:'Permanently remove a template or SOP.',                          roles:[0,0,0,1,0] },
  ]},
  { group:'Reporting', icon:'\u{1F4C8}', items:[
    { key:'rpt.own',            label:'View own performance',          desc:'See their own portfolio metrics.',                               roles:[1,1,1,1,1] },
    { key:'rpt.team',           label:'View team performance',         desc:'See metrics across a pod of users.',                             roles:[0,0,1,1,0] },
    { key:'rpt.org',            label:'View org-wide reporting',       desc:'See metrics across the whole customer base.',                    roles:[0,0,0,1,0] },
    { key:'rpt.export',         label:'Export reports',                desc:'Download report data.',                                          roles:[0,1,1,1,0] },
  ]},
  { group:'Administration', icon:'\u2699', items:[
    { key:'adm.fields',         label:'Manage field manager',          desc:'Add or retire fields on any object.',                            roles:[0,0,0,1,0] },
    { key:'adm.sla',            label:'Manage SLA configuration',      desc:'Edit targets, calendars, escalation and pause rules.',           roles:[0,0,0,1,0] },
    { key:'adm.assignment',     label:'Manage assignment policies',    desc:'Edit ticket and company routing rules.',                         roles:[0,0,0,1,0] },
    { key:'adm.notifications',  label:'Manage notifications',          desc:'Configure channels and per-event delivery.',                     roles:[0,0,0,1,0] },
    { key:'adm.connectors',     label:'Manage connectors',             desc:'Connect or disconnect integrations.',                            roles:[0,0,0,1,0] },
    { key:'adm.signals',        label:'Manage signal sources',         desc:'Tune the sources feeding health and triggers.',                   roles:[0,0,0,1,0] },
    { key:'adm.roles',          label:'Manage roles and privileges',   desc:'Grant or revoke privileges on this page.',                        roles:[0,0,0,1,0] },
  ]},
  { group:'Data & privacy', icon:'\u{1F512}', items:[
    { key:'data.pii',           label:'View contact PII',              desc:'See contact email addresses and phone numbers.',                 roles:[1,1,1,1,1] },
    { key:'data.bulk_edit',     label:'Bulk edit records',             desc:'Apply a change across many records at once.',                    roles:[0,0,1,1,0] },
    { key:'data.audit',         label:'View the audit log',            desc:'See who changed what and when.',                                 roles:[0,0,0,1,0] },
  ]},
];
const ALL_PRIVILEGES = PRIVILEGE_GROUPS.reduce((a,g)=>a.concat(g.items), []);
const privCountForRole = (roleIdx) => ALL_PRIVILEGES.filter(p=>p.roles[roleIdx]===1).length;

// ============================================================
// PROFILE SETTINGS
// ============================================================
const PROFILE_TIMEZONES = [
  'Asia/Kolkata (IST, UTC+5:30)','Asia/Singapore (SGT, UTC+8)','Asia/Dubai (GST, UTC+4)',
  'Europe/London (BST, UTC+1)','Europe/Berlin (CEST, UTC+2)',
  'America/New_York (EDT, UTC-4)','America/Chicago (CDT, UTC-5)','America/Los_Angeles (PDT, UTC-7)',
  'Australia/Sydney (AEST, UTC+10)','UTC',
];
const PROFILE_MAILBOXES = [
  { id:'gmail',   label:'Google Workspace', icon:'\u2709', note:'Gmail, Calendar and contact sync' },
  { id:'o365',    label:'Microsoft 365',    icon:'\u{1F4E7}', note:'Outlook, Calendar and Teams presence' },
  { id:'imap',    label:'Other (IMAP/SMTP)',icon:'\u{1F5A5}', note:'Manual server configuration' },
];
const PROFILE_TEMPLATES = [
  { id:'pt1', name:'Check-in \u2014 quiet account',      kind:'Email', uses:42, updated:'Aug 02, 2025' },
  { id:'pt2', name:'Renewal reminder \u2014 60 days',    kind:'Email', uses:28, updated:'Jul 24, 2025' },
  { id:'pt3', name:'QBR invitation',                     kind:'Email', uses:61, updated:'Jul 11, 2025' },
  { id:'pt4', name:'Escalation acknowledgement',         kind:'Email', uses:19, updated:'Jun 30, 2025' },
];

function ProfileSettings(){
  const { state, dispatch } = useApp();
  const user = USERS[state.activeUser] || USERS.maya;

  const [tab, setTab] = useState('profile');
  const mailbox = state.mailbox || { connected:false, provider:null, address:'', synced:'' };   // shared with My Work › Email
  const [avatar, setAvatar] = useState(null);
  const [oauth, setOauth] = useState(null);   // provider id mid-consent
  const [dragAvatar, setDragAvatar] = useState(false);
  const [sigHtml, setSigHtml] = useState(
    'Maya Chen\nCustomer Success Manager \u00b7 CX42\nmaya.chen@cx42.io \u00b7 +91 98400 12345\nBook time with me: cx42.io/maya');
  const [sigOn, setSigOn] = useState(true);
  const [sigReplies, setSigReplies] = useState(false);
  const [tz, setTz] = useState('Asia/Kolkata (IST, UTC+5:30)');
  const [workStart, setWorkStart] = useState('09:00');
  const [workEnd, setWorkEnd] = useState('18:00');
  const [dateFmt, setDateFmt] = useState('DD MMM YYYY');
  const [agent, setAgent] = useState({
    agent_name:user.name, role:'CSM', assigned_accounts:'8 accounts',
    workload_score:'62', avg_nps:'48', response_sla:'4 hours',
  });

  const inp = 'w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400';
  const lbl = 'text-[10px] font-bold text-slate-400 uppercase tracking-wider';
  const toast = (m) => dispatch({ type:'ADD_TOAST', msg:m, toastType:'success' });


  // Agent fields mirror Admin > Field Manager > Agent fields
  const agentFieldDefs = (typeof ADMIN_FIELDS !== 'undefined' && ADMIN_FIELDS.agent) ? ADMIN_FIELDS.agent : [];
  const roleOptions = APP_ROLE_LABELS;   // shared with Admin › Roles

  const tabs = [
    { id:'profile',   label:'Profile' },
    { id:'mailbox',   label:'Mailbox' },
    { id:'signature', label:'Signature' },
    { id:'prefs',     label:'Locale & timezone' },
  ];

  return React.createElement('div', { className:'space-y-4 max-w-[1100px]' },

    // Header
    React.createElement(Card, { className:'p-5' },
      React.createElement('div', { className:'flex items-center gap-4 flex-wrap' },
        React.createElement('div', { className:'w-16 h-16 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xl font-bold flex-shrink-0 overflow-hidden' },
          avatar ? React.createElement('span', { className:'text-2xl' }, avatar) : user.name.split(' ').map(n=>n[0]).join('')),
        React.createElement('div', { className:'flex-1 min-w-0' },
          React.createElement('p', { className:'text-lg font-bold text-slate-900' }, user.name),
          React.createElement('p', { className:'text-sm text-slate-500' }, agent.role + ' \u00b7 ' + mailbox.address),
          React.createElement('div', { className:'flex gap-2 mt-2 flex-wrap' },
            React.createElement(CxPill, { tone: mailbox.connected ? 'green':'amber' }, mailbox.connected ? '\u25CF Mailbox connected' : '\u25CB Mailbox not connected'),
            React.createElement(CxPill, { tone:'slate' }, tz.split(' ')[0]),
            React.createElement(CxPill, { tone:'blue' }, 'Mailbox ready'))
        )
      )
    ),

    React.createElement(Tabs, { tabs, active:tab, onChange:setTab }),

    // ── PROFILE / picture ──
    tab === 'profile' && React.createElement('div', { className:'grid grid-cols-3 gap-4 items-start' },
      React.createElement(Card, { className:'p-5 col-span-2' },
        React.createElement(CxLabel, null, 'Profile details'),
        React.createElement('div', { className:'grid grid-cols-2 gap-3' },
          React.createElement('div', null, React.createElement('label',{className:lbl},'Full name'),
            React.createElement('input', { value:agent.agent_name, onChange:e=>setAgent(a=>({...a,agent_name:e.target.value})), className:'mt-1 '+inp })),
          React.createElement('div', null, React.createElement('label',{className:lbl},'Display role'),
            React.createElement('select', { value:agent.role, onChange:e=>setAgent(a=>({...a,role:e.target.value})), className:'mt-1 '+inp },
              roleOptions.map(r=>React.createElement('option',{key:r},r)))),
          React.createElement('div', null, React.createElement('label',{className:lbl},'Work email'),
            React.createElement('input', { value:mailbox.address, readOnly:true, className:'mt-1 '+inp })),
          React.createElement('div', null, React.createElement('label',{className:lbl},'Phone'),
            React.createElement('input', { defaultValue:'+91 98400 12345', className:'mt-1 '+inp }))
        ),
        React.createElement('div', { className:'mt-3' }, React.createElement('label',{className:lbl},'Short bio'),
          React.createElement('textarea', { rows:3, defaultValue:'CSM covering enterprise accounts across APAC and EMEA.', className:'mt-1 '+inp+' resize-y' })),
        React.createElement('div', { className:'flex justify-end mt-3' },
          React.createElement(Btn, { variant:'primary', size:'sm', onClick:()=>toast('Profile saved') }, 'Save changes'))
      ),

      React.createElement(Card, { className:'p-5' },
        React.createElement(CxLabel, null, 'Profile picture'),
        React.createElement('div', {
          onDragOver:e=>{ e.preventDefault(); setDragAvatar(true); },
          onDragLeave:()=>setDragAvatar(false),
          onDrop:e=>{ e.preventDefault(); setDragAvatar(false); setAvatar('\u{1F464}'); toast('Profile picture uploaded'); },
          onClick:()=>{ setAvatar('\u{1F464}'); toast('Profile picture uploaded'); },
          className:`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${dragAvatar?'border-indigo-400 bg-indigo-50':'border-slate-200 hover:border-indigo-300'}`
        },
          React.createElement('div', { className:'w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-2xl mx-auto mb-2' },
            avatar || user.name.split(' ').map(n=>n[0]).join('')),
          React.createElement('p', { className:'text-xs font-semibold text-slate-700' }, avatar ? 'Replace picture' : 'Upload a picture'),
          React.createElement('p', { className:'text-[11px] text-slate-400 mt-0.5' }, 'PNG or JPG \u00b7 square \u00b7 up to 2 MB')
        ),
        avatar && React.createElement('div', { className:'mt-2 flex justify-center' },
          React.createElement(Btn, { variant:'ghost', size:'xs', onClick:()=>{ setAvatar(null); toast('Picture removed'); } }, 'Remove picture'))
      )
    ),

    // ── MAILBOX ──
    tab === 'mailbox' && React.createElement('div', { className:'space-y-4' },
      React.createElement(Card, { className:'p-5' },
        React.createElement(CxLabel, { right: React.createElement(CxPill, { tone: mailbox.connected?'green':'amber' }, mailbox.connected?'Connected':'Not connected') }, 'Connect your mailbox'),
        React.createElement('p', { className:'text-xs text-slate-500 mb-3 leading-relaxed' },
          'Connecting pulls the mail in your inbox into CX42. Messages with an outside participant are matched to that customer\u2019s account and appear under Interactions; internal mail stays in My Work and is never attached to an account. Only you can authorise this \u2014 an admin can see the grant in Admin \u203a Email configuration but cannot create or change it.'),
        mailbox.connected
          ? React.createElement('div', null,
              React.createElement('div', { className:'flex items-center gap-3 border border-green-200 bg-green-50/60 rounded-xl p-3 flex-wrap' },
                React.createElement('span', { className:'w-9 h-9 rounded-lg bg-white border border-green-200 flex items-center justify-center text-base flex-shrink-0' }, '\u2709'),
                React.createElement('div', { className:'flex-1 min-w-0' },
                  React.createElement('p', { className:'text-sm font-semibold text-slate-800' },
                    (PROFILE_MAILBOXES.find(m=>m.id===mailbox.provider)||{}).label + ' \u2014 ' + mailbox.address),
                  React.createElement('p', { className:'text-[11px] text-slate-500' },
                    (mailbox.method || 'OAuth 2.0') + ' \u00b7 connected ' + (mailbox.connectedOn || 'earlier') + ' \u00b7 last synced ' + mailbox.synced)),
                React.createElement(Btn, { variant:'secondary', size:'xs', onClick:()=>dispatch({ type:'SYNC_MAILBOX' }) }, 'Sync now'),
                React.createElement(Btn, { variant:'ghost', size:'xs', onClick:()=>dispatch({ type:'DISCONNECT_MAILBOX' }) }, 'Revoke access')
              ),
              React.createElement('div', { className:'flex gap-1.5 flex-wrap mt-2' },
                (mailbox.scopes || ['Mail.Read','Mail.Send']).map(s=>React.createElement(CxPill,{key:s,tone:'slate'},s))),
              React.createElement('div', { className:'mt-3 space-y-0' },
                [['Sync sent mail to the customer timeline', true],
                 ['Capture replies against the account record', true],
                 ['Sync calendar for QBR scheduling', true],
                ].map(r =>
                  React.createElement('div', { key:r[0], className:'flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0' },
                    React.createElement('span', { className:'text-sm text-slate-700' }, r[0]),
                    React.createElement(AdminToggle, { on:r[1], onChange:()=>{}, label:r[1]?'On':'Off' })))
              )
            )
          : React.createElement('div', { className:'grid grid-cols-3 gap-3' },
              PROFILE_MAILBOXES.map(m => React.createElement('button', {
                key:m.id, onClick:()=>setOauth(m.id),
                className:'text-left border border-slate-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-sm transition-all'
              },
                React.createElement('div', { className:'w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-base mb-2' }, m.icon),
                React.createElement('p', { className:'text-sm font-semibold text-slate-800' }, m.label),
                React.createElement('p', { className:'text-[11px] text-slate-500 mt-0.5' }, m.note)
              ))
            )
      ),

      // OAuth consent — what the CSM is actually granting
      React.createElement(Modal, { open:!!oauth, onClose:()=>setOauth(null), title:'Authorise ' + ((PROFILE_MAILBOXES.find(m=>m.id===oauth)||{}).label || '') },
        React.createElement('div', { className:'space-y-3' },
          React.createElement('div', { className:'flex items-center gap-3 border border-slate-200 rounded-xl p-3' },
            React.createElement('span', { className:'w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-lg flex-shrink-0' },
              (PROFILE_MAILBOXES.find(m=>m.id===oauth)||{}).icon || '\u2709'),
            React.createElement('div', null,
              React.createElement('p', { className:'text-sm font-semibold text-slate-800' }, 'CX42 wants access to your mailbox'),
              React.createElement('p', { className:'text-[11px] text-slate-500' }, user.name + ' \u00b7 ' + (mailbox.address || 'maya.chen@cx42.io')))),
          React.createElement('div', null,
            React.createElement('p', { className:lbl }, 'CX42 will be able to'),
            React.createElement('div', { className:'mt-1.5 space-y-1.5' },
              [['Read messages in your inbox', 'Used to show your mail in My Work and on the matching account.'],
               ['Send mail on your behalf', 'Only when you press Send \u2014 automations use the support mailbox, not yours.'],
               ['Read your calendar', 'Used to schedule QBRs and show availability.']].map(r =>
                React.createElement('div', { key:r[0], className:'flex items-start gap-2' },
                  React.createElement('span', { className:'text-green-600 text-xs mt-0.5' }, '\u2713'),
                  React.createElement('div', null,
                    React.createElement('p', { className:'text-sm text-slate-800' }, r[0]),
                    React.createElement('p', { className:'text-[11px] text-slate-500' }, r[1])))))),
          React.createElement('div', { className:'bg-slate-50 rounded-lg px-3 py-2' },
            React.createElement('p', { className:'text-[11px] text-slate-500 leading-relaxed' },
              'CX42 never requests delete or admin scopes. You can revoke this at any time from this page, and your admin can see that the grant exists but cannot change or use it.')),
          React.createElement('div', { className:'flex justify-end gap-2 pt-1' },
            React.createElement(Btn, { variant:'secondary', onClick:()=>setOauth(null) }, 'Cancel'),
            React.createElement(Btn, { variant:'primary', onClick:()=>{
              const prov = PROFILE_MAILBOXES.find(m=>m.id===oauth) || {};
              dispatch({ type:'CONNECT_MAILBOX', provider:oauth,
                method: oauth==='gmail' ? 'OAuth 2.0' : oauth==='o365' ? 'Microsoft Graph' : 'IMAP / SMTP',
                scopes: oauth==='gmail' ? ['gmail.readonly','gmail.send','calendar.events'] : oauth==='o365' ? ['Mail.Read','Mail.Send','Calendars.ReadWrite'] : ['imap','smtp'],
                connectedOn:'Today' });
              setOauth(null);
            } }, 'Allow access')))
      )
    ),

    // ── SIGNATURE ──
    tab === 'signature' && React.createElement('div', { className:'grid grid-cols-2 gap-4 items-start' },
      React.createElement(Card, { className:'p-5' },
        React.createElement(CxLabel, { right:React.createElement(AdminToggle, { on:sigOn, onChange:setSigOn, label:sigOn?'Enabled':'Disabled' }) }, 'Email signature'),
        React.createElement('textarea', { value:sigHtml, onChange:e=>setSigHtml(e.target.value), rows:8,
          className:inp + ' font-mono resize-y', disabled:!sigOn }),
        React.createElement('div', { className:'mt-2' },
          React.createElement('p', { className:lbl }, 'Insert a merge field'),
          React.createElement('div', { className:'flex gap-1 flex-wrap mt-1' },
            ['{{my.name}}','{{my.role}}','{{my.email}}','{{my.phone}}','{{my.calendar}}','{{company.name}}'].map(t =>
              React.createElement('button', { key:t, onClick:()=>setSigHtml(v=>v+' '+t),
                className:'px-1.5 py-0.5 rounded-md text-[10px] font-mono bg-slate-100 text-slate-600 hover:bg-indigo-100 hover:text-indigo-700' }, t)))),
        React.createElement('div', { className:'flex items-center justify-between mt-3 pt-3 border-t border-slate-100' },
          React.createElement('div', { className:'flex items-center gap-2' },
            React.createElement(AdminToggle, { on:sigReplies, onChange:setSigReplies }),
            React.createElement('span', { className:'text-xs text-slate-600' }, 'Also append to replies and forwards')),
          React.createElement(Btn, { variant:'primary', size:'sm', onClick:()=>toast('Signature saved') }, 'Save signature'))
      ),
      React.createElement(Card, { className:'p-5' },
        React.createElement(CxLabel, null, 'Preview'),
        React.createElement('div', { className:'border border-slate-200 rounded-xl p-4 bg-white' },
          React.createElement('p', { className:'text-sm text-slate-700 mb-3' }, 'Hi Sarah,'),
          React.createElement('p', { className:'text-sm text-slate-700 mb-3' }, 'Thanks for the update \u2014 I\u2019ll pull the adoption numbers before we speak on Thursday.'),
          React.createElement('div', { className:'border-t border-slate-200 pt-3 mt-3' },
            sigOn
              ? sigHtml.split('\n').map((l,i)=>React.createElement('p', { key:i, className:`text-xs ${i===0?'font-bold text-slate-800':'text-slate-500'}` }, l))
              : React.createElement('p', { className:'text-xs text-slate-300 italic' }, 'Signature disabled'))
        )
      )
    ),

    // ── LOCALE / TIMEZONE ──
    tab === 'prefs' && React.createElement(Card, { className:'p-5' },
      React.createElement(CxLabel, null, 'Locale & timezone'),
      React.createElement('div', { className:'grid grid-cols-2 gap-3' },
        React.createElement('div', null, React.createElement('label',{className:lbl},'Timezone'),
          React.createElement('select', { value:tz, onChange:e=>{ setTz(e.target.value); toast('Timezone updated'); }, className:'mt-1 '+inp },
            PROFILE_TIMEZONES.map(z=>React.createElement('option',{key:z},z)))),
        React.createElement('div', null, React.createElement('label',{className:lbl},'Date format'),
          React.createElement('select', { value:dateFmt, onChange:e=>setDateFmt(e.target.value), className:'mt-1 '+inp },
            ['DD MMM YYYY','MMM DD, YYYY','YYYY-MM-DD','DD/MM/YYYY','MM/DD/YYYY'].map(f=>React.createElement('option',{key:f},f)))),
        React.createElement('div', null, React.createElement('label',{className:lbl},'Working hours start'),
          React.createElement('input', { type:'time', value:workStart, onChange:e=>setWorkStart(e.target.value), className:'mt-1 '+inp })),
        React.createElement('div', null, React.createElement('label',{className:lbl},'Working hours end'),
          React.createElement('input', { type:'time', value:workEnd, onChange:e=>setWorkEnd(e.target.value), className:'mt-1 '+inp }))
      ),
      React.createElement('p', { className:'text-[11px] text-slate-500 mt-3 pt-3 border-t border-slate-100' },
        'Due dates, reminders and Action run times are shown in this timezone. Working hours drive SLA pause rules and notification quiet hours.'),
      React.createElement('div', { className:'flex justify-end mt-3' },
        React.createElement(Btn, { variant:'primary', size:'sm', onClick:()=>toast('Preferences saved') }, 'Save preferences'))
    ),

    // ── CONFIGURATION (mirrors Admin > Field Manager > Agent fields) ──
    tab === 'agent' && React.createElement(Card, { className:'p-5' },
      React.createElement(CxLabel, { right:React.createElement('span',{className:'text-[11px] text-slate-400'}, 'Defined in Admin \u203a Field Manager \u203a Agent fields') }, 'Configuration'),
      React.createElement('div', { className:'grid grid-cols-2 gap-3' },
        agentFieldDefs.map(f => {
          const readOnly = f.system && f.key !== 'agent_name';
          return React.createElement('div', { key:f.key },
            React.createElement('div', { className:'flex items-center gap-2' },
              React.createElement('label', { className:lbl }, f.label),
              f.req && React.createElement(CxPill, { tone:'amber' }, 'Required'),
              readOnly && React.createElement(CxPill, { tone:'slate' }, '\u{1F512} Read-only')),
            f.key === 'role'
              ? React.createElement('select', { value:agent.role, onChange:e=>setAgent(a=>({...a,role:e.target.value})), className:'mt-1 '+inp },
                  roleOptions.map(r=>React.createElement('option',{key:r},r)))
              : React.createElement('input', {
                  value: agent[f.key] !== undefined ? agent[f.key] : '',
                  onChange: e=>setAgent(a=>({ ...a, [f.key]: e.target.value })),
                  disabled: readOnly,
                  className:'mt-1 '+inp + (readOnly ? ' bg-slate-50 text-slate-500 cursor-not-allowed' : '') }),
            React.createElement('p', { className:'text-[10px] text-slate-400 mt-1' }, f.type + ' \u00b7 used in ' + f.usage)
          );
        })
      ),
      agentFieldDefs.length === 0 && React.createElement('p', { className:'text-sm text-slate-400 italic' }, 'No agent fields defined'),
      React.createElement('div', { className:'flex justify-end mt-3 pt-3 border-t border-slate-100' },
        React.createElement(Btn, { variant:'primary', size:'sm', onClick:()=>toast('Configuration saved') }, 'Save configuration'))
    )
  );
}

function Sidebar({ activeRole }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, dispatch } = useApp();
  const persona = (state && state.persona) || 'csm';
  // Each persona sees a different nav, ordered around what it pivots on
  const order = NAV_BY_PERSONA[persona] || NAV_BY_PERSONA.csm;
  const navItems = order.map(p => NAV.find(n => n.path === p)).filter(Boolean);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const user = activeRole === 'manager' ? USERS.daniel : activeRole === 'executive' ? USERS.priya : USERS.maya;

  const handleRoleSwitch = (role, userId) => {
    dispatch({ type:'SWITCH_ROLE', role, userId });
    setShowRoleMenu(false);
    if(role === 'manager') navigate('/manager');
    else if(role === 'executive') navigate('/executive');
    else navigate('/dashboard');
  };

  return React.createElement('div', { className:'w-56 bg-slate-800 flex flex-col h-screen fixed left-0 top-0 z-30 flex-shrink-0' },
    // Logo
    React.createElement('div', { className:'px-4 py-4 border-b border-slate-700' },
      React.createElement('div', { className:'flex items-center gap-2' },
        React.createElement('div', { className:'w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm' }, 'CX'),
        React.createElement('span', { className:'text-white font-bold text-lg' }, '42')
      )
    ),
    // Nav
    React.createElement('div', { className:'flex-1 overflow-y-auto py-3 px-2' },
      navItems.map(item => {
        const isActive = item.path === '/admin' ? location.pathname.startsWith('/admin') : (location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path)));
        return React.createElement(NavLink, { key:item.path, to:item.path, className:() => `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors mb-1 ${isActive ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}` },
          React.createElement('span', { className:'text-base' }, item.icon),
          item.label
        );
      })
    ),
    // Manager/Exec shortcut (if CSM)
    activeRole === 'csm' && React.createElement('div', { className:'px-2 pb-2' },
      React.createElement('button', { onClick:() => navigate('/manager'), className:'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-400 hover:bg-slate-700 hover:text-white transition-colors' }, '📊 Manager view')
    ),
    // Profile settings — pinned to the bottom of the nav
    React.createElement('div', { className:'px-2 pb-2' },
      React.createElement('button', {
        onClick:() => navigate('/profile'),
        className:`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${location.pathname === '/profile' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`
      }, React.createElement('span', { className:'text-base' }, '\u2699'), 'Profile settings')
    ),
    // User
    React.createElement('div', { className:'px-3 py-3 border-t border-slate-700 relative' },
      React.createElement('button', { onClick:()=>setShowRoleMenu(!showRoleMenu), className:'flex items-center gap-2 w-full hover:opacity-80' },
        React.createElement(Avatar, { user }),
        React.createElement('div', { className:'flex-1 text-left' },
          React.createElement('p', { className:'text-white text-xs font-medium truncate' }, user.name),
          React.createElement('p', { className:'text-slate-400 text-xs capitalize' }, user.role)
        ),
        React.createElement('span', { className:'text-slate-400 text-xs' }, '⌄')
      ),
      showRoleMenu && React.createElement('div', { className:'absolute bottom-14 left-0 right-0 mx-2 bg-white rounded-lg shadow-xl border py-1 z-50' },
        React.createElement('p', { className:'px-3 py-1 text-xs text-slate-400 font-medium' }, 'Switch role'),
        [['csm','maya','CSM — Maya Chen'],['manager','daniel','Manager — Daniel Ortiz'],['executive','priya','Executive — Priya Raman']].map(([role,uid,label]) =>
          React.createElement('button', { key:role, onClick:()=>handleRoleSwitch(role,uid), className:`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 ${activeRole===role?'text-indigo-600 font-medium':'text-slate-700'}` }, label)
        )
      )
    )
  );
}


// ============================================================
// SPOTLIGHT SEARCH (\u2318K / Ctrl-K)
// ============================================================
function SpotlightSearch({ open, onClose }) {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => { if (open) { setQ(''); setCursor(0); setTimeout(()=>inputRef.current && inputRef.current.focus(), 30); } }, [open]);

  const go = (path) => { onClose(); navigate(path); };

  // ── Build the searchable index across every object type ──
  const results = (() => {
    const term = q.trim().toLowerCase();
    const groups = [];

    const NAV = [
      { label:'Dashboard', path:'/dashboard', icon:'\u25EB' },
      { label:'My Work', path:'/work', icon:'\u2713' },
      { label:'Customers', path:'/customers', icon:'\u{1F3E2}' },
      { label:'Risks', path:'/risks', icon:'\u26A0' },
      { label:'Expansion', path:'/expansion', icon:'\u2197' },
      { label:'Actions', path:'/actions', icon:'\u26A1' },
      { label:'Profile settings', path:'/profile', icon:'\u2699' },
      { label:'CX42 Drive', path:'/drive', icon:'\u{1F4C1}' },
      { label:'Admin', path:'/admin', icon:'\u2699' },
    ];
    const ACTIONS = [
      { label:'Ask CX42 assistant', icon:'\u2726', run:()=>{ onClose(); dispatch({type:'TOGGLE_ASSISTANT'}); } },
      { label:'Go to Field Manager', icon:'\u{1F5C3}', run:()=>go('/admin') },
      { label:'Go to Triggers', icon:'\u26A1', run:()=>go('/admin') },
      { label:'View my portfolio', icon:'\u{1F464}', run:()=>go('/customers?owner=' + (state.activeUser||'maya')) },
      { label:'Renewals in next 30 days', icon:'\u23F1', run:()=>go('/customers?owner=' + (state.activeUser||'maya') + '&renewalWithin=30') },
    ];

    if (!term) {
      groups.push({ label:'Jump to', items: NAV.slice(0,6).map(n=>({ icon:n.icon, title:n.label, sub:n.path, run:()=>go(n.path) })) });
      groups.push({ label:'Quick actions', items: ACTIONS.map(a=>({ icon:a.icon, title:a.label, sub:'Action', run:a.run })) });
      return groups;
    }
    const hit = (txt) => txt && txt.toLowerCase().includes(term);

    const custs = state.customers.filter(c => hit(c.name) || hit(c.domain) || hit(c.segment)).slice(0,6);
    if (custs.length) groups.push({ label:'Customers', items: custs.map(c => {
      const h = HEALTH_SIGNALS[c.healthId];
      return { icon:'\u{1F3E2}', title:c.name, sub:`${c.domain} \u00b7 ${formatARR(c.arr)} \u00b7 ${c.segment.replace('_',' ')}`,
               tag: h ? { text:h.band, tone: h.band==='red'?'red':h.band==='yellow'?'amber':'green' } : null,
               run:()=>go('/customers/' + c.id) };
    })});

    const goals = Object.values(state.goals).filter(g => hit(g.title) || hit(g.type)).slice(0,5);
    if (goals.length) groups.push({ label:'Goals', items: goals.map(g => {
      const c = state.customers.find(x=>x.id===g.customerId);
      return { icon:'\u{1F3AF}', title:g.title, sub:(c?c.name:'') + ' \u00b7 ' + g.status.replace('_',' '),
               run:()=>go('/customers/' + g.customerId + '?tab=goals&goal=' + g.id) };
    })});

    const tasks = Object.values(state.tasks).filter(t => hit(t.title)).slice(0,5);
    if (tasks.length) groups.push({ label:'Tasks', items: tasks.map(t => ({
      icon:'\u2713', title:t.title, sub:(t.type||'custom').replace('_',' ') + ' \u00b7 ' + t.status,
      run:()=>go('/work?task=' + t.id) })) });

    const contacts = Object.values(CONTACTS).filter(c => hit(c.name) || hit(c.role) || hit(c.email)).slice(0,4);
    if (contacts.length) groups.push({ label:'Contacts', items: contacts.map(c => {
      const cust = state.customers.find(x=>(x.contactIds||[]).includes(c.id));
      return { icon:'\u{1F464}', title:c.name, sub:c.role + (cust ? ' \u00b7 ' + cust.name : ''),
               run:()=>cust ? go('/customers/' + cust.id + '?tab=contacts') : go('/customers') };
    })});

    const risks = Object.values(state.risks).filter(r => hit(r.title)).slice(0,4);
    if (risks.length) groups.push({ label:'Risks', items: risks.map(r => ({
      icon:'\u26A0', title:r.title, sub:formatARR(r.amountAtRisk) + ' at risk \u00b7 ' + r.severity,
      tag:{ text:r.severity, tone:r.severity==='critical'?'red':'amber' }, run:()=>go('/risks') })) });

    const navHits = NAV.filter(n => hit(n.label));
    if (navHits.length) groups.push({ label:'Jump to', items: navHits.map(n=>({ icon:n.icon, title:n.label, sub:n.path, run:()=>go(n.path) })) });

    const actHits = ACTIONS.filter(a => hit(a.label));
    if (actHits.length) groups.push({ label:'Quick actions', items: actHits.map(a=>({ icon:a.icon, title:a.label, sub:'Action', run:a.run })) });

    return groups;
  })();

  const flat = results.flatMap(g => g.items);
  const safeCursor = Math.min(cursor, Math.max(0, flat.length - 1));

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor(c => Math.min(c + 1, flat.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setCursor(c => Math.max(c - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (flat[safeCursor]) flat[safeCursor].run(); }
    else if (e.key === 'Escape') { e.preventDefault(); onClose(); }
  };

  if (!open) return null;

  const toneCls = { red:'bg-red-100 text-red-700', amber:'bg-amber-100 text-amber-700', green:'bg-green-100 text-green-700', slate:'bg-slate-100 text-slate-600' };
  let idx = -1;

  return React.createElement('div', { className:'fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4' },
    React.createElement('div', { className:'absolute inset-0 bg-slate-900/40 backdrop-blur-sm', onClick:onClose }),
    React.createElement('div', { className:'relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in' },

      // Input row
      React.createElement('div', { className:'flex items-center gap-3 px-4 py-3.5 border-b border-slate-100' },
        React.createElement('span', { className:'text-slate-400 text-lg' }, '\u2315'),
        React.createElement('input', {
          ref:inputRef, value:q, onChange:e=>{ setQ(e.target.value); setCursor(0); }, onKeyDown,
          placeholder:'Search customers, goals, tasks, tickets, contacts\u2026',
          className:'flex-1 text-[15px] outline-none placeholder:text-slate-400'
        }),
        React.createElement('kbd', { className:'px-1.5 py-0.5 bg-slate-100 text-slate-400 text-[10px] font-semibold rounded border border-slate-200' }, 'ESC')
      ),

      // Results
      React.createElement('div', { className:'max-h-[52vh] overflow-y-auto' },
        flat.length === 0
          ? React.createElement('div', { className:'px-4 py-12 text-center' },
              React.createElement('p', { className:'text-3xl mb-2 opacity-30' }, '\u2315'),
              React.createElement('p', { className:'text-sm text-slate-400' }, 'No results for \u201c' + q + '\u201d')
            )
          : results.map(group => React.createElement('div', { key:group.label },
              React.createElement('p', { className:'px-4 pt-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider' }, group.label),
              group.items.map(item => {
                idx++;
                const active = idx === safeCursor;
                const myIdx = idx;
                return React.createElement('button', {
                  key:group.label + myIdx, onClick:item.run, onMouseEnter:()=>setCursor(myIdx),
                  className:`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors ${active ? 'bg-indigo-50' : 'hover:bg-slate-50'}`
                },
                  React.createElement('span', { className:`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${active?'bg-indigo-100':'bg-slate-100'}` }, item.icon),
                  React.createElement('span', { className:'flex-1 min-w-0' },
                    React.createElement('span', { className:'block text-sm font-medium text-slate-900 truncate' }, item.title),
                    React.createElement('span', { className:'block text-xs text-slate-400 truncate' }, item.sub)
                  ),
                  item.tag && React.createElement('span', { className:`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize flex-shrink-0 ${toneCls[item.tag.tone]}` }, item.tag.text),
                  active && React.createElement('span', { className:'text-[10px] text-indigo-400 font-semibold flex-shrink-0' }, '\u21B5')
                );
              })
            ))
      ),

      // Footer hints
      React.createElement('div', { className:'flex items-center gap-4 px-4 py-2 border-t border-slate-100 bg-slate-50' },
        [['\u2191\u2193','Navigate'],['\u21B5','Open'],['esc','Close']].map(h =>
          React.createElement('span', { key:h[1], className:'flex items-center gap-1.5 text-[11px] text-slate-400' },
            React.createElement('kbd', { className:'px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-semibold text-slate-500' }, h[0]),
            h[1])),
        React.createElement('span', { className:'ml-auto text-[11px] text-slate-400' }, flat.length + ' result' + (flat.length===1?'':'s'))
      )
    )
  );
}

function Header({ title, subtitle, actions, pageActions }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [showNotif, setShowNotif] = useState(false);
  const [spotlight, setSpotlight] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); setSpotlight(true); }
      if (e.key === '/' && !/input|textarea|select/i.test((e.target.tagName||''))) { e.preventDefault(); setSpotlight(true); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  
  return React.createElement('div', { className:'h-14 bg-white border-b border-slate-200 flex items-center px-6 gap-4 fixed top-0 right-0 left-56 z-20' },
    React.createElement('div', { className:'flex-1' },
      React.createElement('h1', { className:'text-base font-semibold text-slate-900' }, title),
      subtitle && React.createElement('p', { className:'text-xs text-slate-500' }, subtitle)
    ),
    // Spotlight trigger
    React.createElement('button', {
      onClick:()=>setSpotlight(true),
      className:'flex items-center gap-2 pl-2.5 pr-2 py-1.5 text-sm border border-slate-200 rounded-lg w-64 text-slate-400 hover:border-slate-300 hover:bg-slate-50 transition-colors'
    },
      React.createElement('span', { className:'text-slate-400' }, '\u2315'),
      React.createElement('span', { className:'flex-1 text-left' }, 'Search\u2026'),
      React.createElement('kbd', { className:'px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-semibold text-slate-500' }, '\u2318K')
    ),
    React.createElement(SpotlightSearch, { open:spotlight, onClose:()=>setSpotlight(false) }),
    // Notifications
    React.createElement('div', { className:'relative' },
      React.createElement('button', { onClick:()=>setShowNotif(!showNotif), className:'relative p-1.5 rounded-lg hover:bg-slate-100 text-slate-600' },
        '🔔',
        React.createElement('span', { className:'absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center' }, '5')
      )
    ),
    // Ask CX42 — hidden on customer detail, where the page header carries its own
    // account-scoped button. Two entry points there would be ambiguous.
    !/^\/customers\/[^/]+/.test(location.pathname) && React.createElement(Btn, { variant:'secondary', size:'sm', onClick:()=>dispatch({type:'TOGGLE_ASSISTANT'}) },
      '✦ Ask CX42'
    ),
    // Page actions
    ...(pageActions || [])
  );
}

// ============================================================
// SECTION 5: ASSISTANT PANEL
// ============================================================

const ASSISTANT_RESPONSES = {
  portfolio_attention: {
    text: "Three accounts need your attention today. Acme Analytics moved to red three days ago—a critical data sync failure is blocking 47 users and renewal is in 74 days. Globex Cloud's executive sponsor position is vacant with only 28 days to renewal. HelioWorks has a critical ticket open for 5 days without CSM follow-up.",
    chips: [{ label:'Acme: Health → Red', type:'usage' }, { label:'Globex: Renewal 28d', type:'commercial' }, { label:'HelioWorks: Critical ticket', type:'ticket' }],
    actions:['Review Acme recovery plan','Update Globex renewal forecast','Follow up on HelioWorks ticket']
  },
  portfolio_renewals: {
    text: "The most exposed renewals are Globex Cloud ($195K, 29 days, no exec sponsor, forecast At Risk) and CloudNine ($110K, 17 days, red health, no mitigation goal). Both lack adequate coverage and should be escalated immediately.",
    chips: [{ label:'Globex: $195K at risk', type:'commercial' }, { label:'CloudNine: 17 days', type:'commercial' }],
    actions:['Open Globex renewal','Escalate CloudNine']
  },
  portfolio_expansion: {
    text: "Northstar Labs is the strongest expansion candidate with high confidence: 94% seat utilization, 31% active user growth, Finance team now using the platform organically, and NPS of 9. No CRM opportunity exists yet. Orbit Systems also has a qualified ML Suite opportunity in draft.",
    chips: [{ label:'Northstar: $72K potential', type:'usage' }, { label:'Orbit: ML Suite draft opp', type:'commercial' }],
    actions:['Qualify Northstar','View Orbit expansion']
  },
  acme_health: {
    text: "Acme moved to red primarily because weekly active users fell 64% (from 78 to 28) and a critical synchronization ticket has remained open for nine days. Email sentiment also declined after two unanswered follow-ups. With renewal in 74 days, the highest-leverage next step is a recovery meeting involving the product administrator and executive sponsor.",
    chips: [{ label:'Usage: WAU decline 64%', type:'usage' }, { label:'Ticket SUP-1842', type:'ticket' }, { label:'Email: Data sync follow-up', type:'email' }, { label:'Renewal: 74 days', type:'commercial' }],
    actions:['Draft outreach','Review recovery Goal','Schedule meeting']
  },
  acme_meeting: {
    text: "For your recovery meeting with Acme, I recommend leading with the resolution timeline on SUP-1842, then showing the usage recovery plan with weekly check-ins. Key attendees: Sarah Mitchell (VP Analytics) and Raj Patel (Admin). Anticipate questions about data integrity during the sync gap and what compensatory steps are planned.",
    chips: [{ label:'SUP-1842 status', type:'ticket' }, { label:'Sarah Mitchell: VP Analytics', type:'meeting' }],
    actions:['Draft follow-up email','Create meeting task']
  },
  northstar_expand: {
    text: "Northstar shows strong expansion evidence: seat utilization is at 94% with 31% user growth over 60 days. The Finance team started using the platform organically—this is an unsolicited adoption signal. NPS is 9 and there are no support blockers. Estimated expansion potential is $72K ARR in additional seats. No CRM opportunity exists yet.",
    chips: [{ label:'94% seat utilization', type:'usage' }, { label:'+31% active users', type:'usage' }, { label:'Finance BU detected', type:'usage' }, { label:'NPS 9', type:'survey' }],
    actions:['Qualify opportunity','Run expansion discovery','Draft expansion proposal']
  },
  default: {
    text: "I can help you understand what's happening across your portfolio, prepare for meetings, draft communications, or analyze specific customer situations. Try asking about a specific customer or what needs your attention today.",
    chips: [],
    actions:['What needs my attention today?','Which renewals are exposed?','Where is expansion evidence?']
  }
};


// ============================================================
// ASK CX42 — page-aware scoping
// The assistant inherits the scope of wherever it was opened. Dashboard is
// global; every other module opens scoped to itself with a toggle to widen.
// ============================================================
const ASSISTANT_SCOPES = {
  global:      { id:'global',      label:'All of CX42',      short:'Global',       icon:'\u2726',
                 prompts:['What needs my attention today?','Which renewals are most exposed?','Where do we have expansion evidence?'] },
  work:        { id:'work',        label:'My Work',          short:'My Work',      icon:'\u2713',
                 prompts:['What should I pick up first today?','Which tasks are overdue?','Summarise my unread email'] },
  customers:   { id:'customers',   label:'Customer list',    short:'Customers',    icon:'\u{1F3E2}',
                 prompts:['Which accounts are trending down?','Who is renewing in the next 60 days?','Which accounts have no active goal?'] },
  customer:    { id:'customer',    label:'this account',     short:'This account', icon:'\u{1F3E2}',
                 prompts:["Why did this customer's health change?",'Prepare me for the next meeting','Draft a customer follow-up'] },
  health:      { id:'health',      label:'Customer Health',  short:'Health',       icon:'\u2665',
                 prompts:['Which accounts moved band this month?','What is driving the red accounts?','Where is health data stale?'] },
  renewals:    { id:'renewals',    label:'Renewals',         short:'Renewals',     icon:'\u{1F504}',
                 prompts:['Which renewals are at risk?','What is my forecast this quarter?','Which renewals have no owner action?'] },
  risks:       { id:'risks',       label:'Risks',            short:'Risks',        icon:'\u26A0',
                 prompts:['What are my highest-value open risks?','Which risks have no mitigation plan?','What changed on risks this week?'] },
  expansion:   { id:'expansion',   label:'Expansion',        short:'Expansion',    icon:'\u{1F4C8}',
                 prompts:['Where is the strongest expansion evidence?','Which opportunities are unqualified?','Draft a discovery outreach'] },
  actions:     { id:'actions',       label:'Actions',          short:'Actions',      icon:'\u26A1',
                 prompts:['Which actions fired most this month?','What does this action actually do?','Which actions send customer emails?'] },
  drive:       { id:'drive',       label:'CX42 Drive',       short:'Drive',        icon:'\u{1F4C1}',
                 prompts:['Which SOP applies to a churn risk?','What is in the onboarding SOP?','Find the QBR template for enterprise'] },
  admin:       { id:'admin',       label:'Admin',            short:'Admin',        icon:'\u2699',
                 prompts:['Which roles can edit SLA settings?','Who has not connected a mailbox?','What automations are active?'] },
};

// Resolve the scope from the route the assistant was opened on
function scopeForPath(path){
  const p = String(path || '');
  if (/^\/customers\/[^/]+/.test(p)) return 'customer';
  if (p.startsWith('/customers'))    return 'customers';
  if (p.startsWith('/work'))         return 'work';
  if (p.startsWith('/health'))       return 'health';
  if (p.startsWith('/renewals'))     return 'renewals';
  if (p.startsWith('/risks'))        return 'risks';
  if (p.startsWith('/expansion'))    return 'expansion';
  if (p.startsWith('/actions'))      return 'actions';
  if (p.startsWith('/drive'))        return 'drive';
  if (p.startsWith('/admin'))        return 'admin';
  if (p.startsWith('/goals'))        return 'work';
  return 'global';                                   // dashboard and anything else
}

function AssistantPanel() {
  const { state, dispatch } = useApp();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [showDraft, setShowDraft] = useState(false);
  const [draftTo, setDraftTo] = useState('Sarah Mitchell <sarah.mitchell@acme-analytics.io>');
  const [draftSubject, setDraftSubject] = useState('Update on data sync resolution — Acme Analytics');
  const [draftBody, setDraftBody] = useState(`Hi Sarah,

I wanted to reach out directly to share an update on the data synchronization issue affecting your analytics environment.

Our engineering team has identified the root cause — an API rate-limiting configuration in the ETL connector — and has a fix queued for deployment by end of week. We're monitoring the ticket hourly and will provide you a status update every 24 hours until full resolution.

In the meantime, I'd like to schedule a 30-minute call with you and Raj to walk through the recovery plan and address any questions. Would Thursday at 2 PM work?

I want to make sure you have full confidence in our resolution path ahead of your upcoming renewal.

Best,
Maya Chen
Customer Success Manager`);
  
  const location = useLocation();
  // The scope the assistant was opened in. Dashboard resolves to global; every
  // other module opens narrowed to itself, and the user can widen it.
  const pageScope = scopeForPath(location.pathname);
  const [scoped, setScoped] = useState(true);
  const activeScopeId = (pageScope === 'global' || !scoped) ? 'global' : pageScope;
  const scope = ASSISTANT_SCOPES[activeScopeId] || ASSISTANT_SCOPES.global;
  const canNarrow = pageScope !== 'global';

  // Customer detail resolves the account so the badge names it
  const customerId = (location.pathname.match(/^\/customers\/([^/?]+)/) || [])[1];
  const scopeCustomer = customerId ? state.customers.find(c=>c.id===customerId) : null;
  const isAcme = customerId === 'acme';
  const isNorthstar = customerId === 'northstar';

  if(!state.assistantOpen) return null;

  const scopeLabel = activeScopeId === 'customer' && scopeCustomer ? scopeCustomer.name : scope.label;
  const getSuggestions = () => scope.prompts;
  
  const handlePrompt = (prompt) => {
    let responseKey = 'default';
    if(prompt.includes('attention')) responseKey = 'portfolio_attention';
    else if(prompt.includes('renewal')) responseKey = 'portfolio_renewals';
    else if(prompt.includes('expansion') && !isNorthstar) responseKey = 'portfolio_expansion';
    else if(isAcme && prompt.includes('health')) responseKey = 'acme_health';
    else if(isAcme && prompt.includes('meeting')) responseKey = 'acme_meeting';
    else if(isAcme || prompt.includes('follow-up') || prompt.includes('outreach')) responseKey = 'acme_health';
    else if(isNorthstar) responseKey = 'northstar_expand';
    
    const response = ASSISTANT_RESPONSES[responseKey];
    setMessages([...messages, { role:'user', text:prompt }, { role:'assistant', ...response }]);
    setInput('');
  };
  
  const handleSendEmail = () => {
    dispatch({ type:'SEND_EMAIL', recipient:'Sarah Mitchell (Acme)', taskId:'t3' });
    setShowDraft(false);
    dispatch({ type:'TOGGLE_ASSISTANT' });
  };
  
  return React.createElement('div', { className:'fixed right-0 top-0 h-full w-96 bg-white border-l border-slate-200 shadow-2xl z-30 flex flex-col animate-slide-in' },
    // Header
    React.createElement('div', { className:'flex items-center justify-between px-4 py-3 border-b bg-slate-800' },
      React.createElement('div', { className:'flex items-center gap-2 min-w-0' },
        React.createElement('div', { className:'w-6 h-6 bg-indigo-500 rounded flex items-center justify-center text-white text-xs font-bold' }, '✦'),
        React.createElement('span', { className:'text-white font-semibold text-sm' }, 'Ask CX42'),
        React.createElement('span', { className:'px-2 py-0.5 bg-slate-700 text-slate-200 text-[11px] rounded-full truncate max-w-[150px]' },
          scope.icon + ' ' + scopeLabel)
      ),
      React.createElement('button', { onClick:()=>dispatch({type:'TOGGLE_ASSISTANT'}), className:'text-slate-400 hover:text-white' }, '×')
    ),
    // Scope control — only meaningful when the page itself is narrower than global
    canNarrow && React.createElement('div', { className:'px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-2.5' },
      React.createElement('button', {
        onClick:()=>setScoped(v=>!v),
        title: scoped ? 'Searching this module only \u2014 switch to search all of CX42' : 'Searching all of CX42 \u2014 switch back to this module',
        className:`w-9 h-5 rounded-full inline-flex items-center px-0.5 transition-colors flex-shrink-0 ${scoped?'bg-indigo-600 justify-end':'bg-slate-300 justify-start'}`
      }, React.createElement('span', { className:'w-4 h-4 bg-white rounded-full shadow' })),
      React.createElement('div', { className:'flex-1 min-w-0' },
        React.createElement('p', { className:'text-xs font-semibold text-slate-700 truncate' },
          scoped ? 'Searching within ' + scopeLabel : 'Searching all of CX42'),
        React.createElement('p', { className:'text-[10px] text-slate-400' },
          scoped ? 'Toggle off to widen the search' : 'Toggle on to narrow to ' + scopeLabel)),
      React.createElement('span', { className:`text-[10px] font-bold uppercase tracking-wider flex-shrink-0 ${scoped?'text-indigo-600':'text-slate-400'}` },
        scoped ? 'Scoped' : 'Global')
    ),
    // Messages
    React.createElement('div', { className:'flex-1 overflow-y-auto p-4 space-y-4' },
      messages.length === 0 && React.createElement('div', null,
        React.createElement('p', { className:'text-sm text-slate-500 mb-3' }, 'Suggested prompts for ' + scopeLabel + ':'),
        getSuggestions().map((s,i) => React.createElement('button', { key:i, onClick:()=>handlePrompt(s), className:'block w-full text-left px-3 py-2 text-sm text-slate-700 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg mb-2 transition-colors' }, s))
      ),
      messages.map((msg, i) => React.createElement('div', { key:i, className:`${msg.role==='user'?'flex justify-end':''}` },
        msg.role === 'user'
          ? React.createElement('div', { className:'bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm max-w-[80%]' }, msg.text)
          : React.createElement('div', { className:'space-y-2' },
              React.createElement('p', { className:'text-sm text-slate-700 leading-relaxed' }, msg.text),
              msg.chips && msg.chips.length > 0 && React.createElement('div', { className:'flex flex-wrap gap-1.5 mt-2' }, msg.chips.map((c,j) => React.createElement(EvidenceChip, { key:j, label:c.label, type:c.type }))),
              msg.actions && msg.actions.length > 0 && React.createElement('div', { className:'flex flex-col gap-1 mt-2' },
                msg.actions.map((a,j) => React.createElement('button', { key:j, onClick:()=>{ if(a.includes('Draft outreach')||a.includes('Draft a customer')||a.includes('Draft discovery')) setShowDraft(true); else handlePrompt(a); }, className:'text-left text-xs text-indigo-600 hover:text-indigo-800 font-medium px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors' }, '→ ' + a))
              )
            )
      ))
    ),
    // Input
    React.createElement('div', { className:'px-4 py-3 border-t' },
      React.createElement('div', { className:'flex gap-2' },
        React.createElement('input', { value:input, onChange:e=>setInput(e.target.value), onKeyDown:e=>e.key==='Enter'&&input&&handlePrompt(input), placeholder:'Ask anything about your portfolio...', className:'flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500' }),
        React.createElement('button', { onClick:()=>input&&handlePrompt(input), className:'px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700' }, '→')
      )
    ),
    // Draft modal
    showDraft && React.createElement(Modal, { open:true, onClose:()=>setShowDraft(false), title:'Draft outreach — Acme Analytics', size:'lg' },
      React.createElement('div', { className:'space-y-3' },
        React.createElement('div', null,
          React.createElement('label', { className:'text-xs font-medium text-slate-500' }, 'To'),
          React.createElement('input', { value:draftTo, onChange:e=>setDraftTo(e.target.value), className:'w-full text-sm border border-slate-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500' })
        ),
        React.createElement('div', null,
          React.createElement('label', { className:'text-xs font-medium text-slate-500' }, 'Subject'),
          React.createElement('input', { value:draftSubject, onChange:e=>setDraftSubject(e.target.value), className:'w-full text-sm border border-slate-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500' })
        ),
        React.createElement('div', null,
          React.createElement('label', { className:'text-xs font-medium text-slate-500' }, 'Message'),
          React.createElement('textarea', { value:draftBody, onChange:e=>setDraftBody(e.target.value), rows:10, className:'w-full text-sm border border-slate-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono' })
        ),
        React.createElement('p', { className:'text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg' }, '⚠ This email will be sent to the customer. Please review before sending.'),
        React.createElement('div', { className:'flex gap-2 pt-2' },
          React.createElement(Btn, { variant:'primary', onClick:handleSendEmail }, 'Send email'),
          React.createElement(Btn, { variant:'secondary', onClick:()=>setShowDraft(false) }, 'Cancel')
        )
      )
    )
  );
}

// ============================================================
// SECTION 6: (removed)
// ============================================================


// ── Support persona dashboard: everything pivots on the ticket queue ──
function Dashboard() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [healthView, setHealthView] = useState('arr');
  const [tasksTab, setGoalsTab] = useState('ack');

  const me = state.activeUser || 'maya';
  const dismissed = state.dismissedPriority;
  const snoozed = state.snoozedPriority;

  // Every item is a usage/health/expansion signal \u2014 opening one creates a task
  const priorityItems = [
    { id:'p1', kind:'usage',  severity:'critical', customer:'Acme Analytics', customerId:'acme',
      reason:'Health moved yellow \u2192 red. Weekly active users down 64% over 12 weeks.', arr:'$240K', due:'Renewal in 74d',
      taskTitle:'Investigate usage decline at Acme Analytics', taskType:'custom' },
    { id:'p2', kind:'usage',  severity:'high', customer:'Globex Cloud', customerId:'globex',
      reason:'Renewal in 28 days with no executive sponsor identified.', arr:'$195K', due:'Renewal in 28d',
      taskTitle:'Identify executive sponsor at Globex Cloud', taskType:'meeting' },
    { id:'p3', kind:'usage',  severity:'medium', customer:'Northstar Labs', customerId:'northstar',
      reason:'$72K expansion signal detected \u2014 no CRM opportunity exists yet.', arr:'$72K potential', due:'162d to renewal',
      taskTitle:'Qualify expansion signal at Northstar Labs', taskType:'custom' },
  ].filter(i => !dismissed.includes(i.id) && !snoozed.includes(i.id));

  // Open: creates a task (if one doesn't already exist) then jumps to it
  const openItem = (item) => {
    const existing = Object.values(state.tasks).find(t => t.source === 'priority_queue' && t.priorityItemId === item.id);
    if (existing) { navigate('/work?task=' + existing.id); return; }
    const taskId = 't_pq_' + item.id + '_' + Date.now();
    dispatch({ type:'CREATE_TASK', taskId, title:item.taskTitle, taskType:item.taskType,
      description:item.reason, customerId:item.customerId, ownerId:me, source:'priority_queue' });
    navigate('/work?task=' + taskId);
  };

  const healthDist = {
    arr: { green: 2100000, yellow: 1120000, red: 620000 },
    count: { green: 13, yellow: 7, red: 4 }
  };
  const totalArr = 3840000;

  // A goal is only a container for tasks, so the dashboard surfaces the tasks
  const myTasks = Object.values(state.tasks).filter(t => {
    const g = t.goalId ? state.goals[t.goalId] : null;
    return (g ? g.ownerId === me : t.ownerId === me);
  });
  const tasks_todo  = myTasks.filter(t => t.status === 'todo');
  const tasks_doing = myTasks.filter(t => t.status === 'in_progress');
  const tasks_due   = myTasks.filter(t => t.dueDate && daysUntil(t.dueDate) < 7 && t.status !== 'done' && t.status !== 'skipped');
  const tasksShown = tasksTab === 'ack' ? tasks_todo : tasksTab === 'risk' ? tasks_doing : tasks_due;

  const hv = healthView === 'arr' ? healthDist.arr : healthDist.count;
  const hvTotal = healthView === 'arr' ? totalArr : 24;
  const pct = n => (n / hvTotal * 100).toFixed(1) + '%';

  return React.createElement('div', { className:'space-y-6 max-w-[1400px]' },

    // \u2500\u2500 Header \u2500\u2500
    React.createElement('div', null,
      React.createElement('h2', { className:'text-xl font-semibold text-slate-900' }, 'Good morning, Maya \ud83d\udc4b'),
      React.createElement('p', { className:'text-slate-500 text-sm mt-0.5' }, "Here's what changed across your portfolio.")
    ),

    // \u2500\u2500 Metrics \u2014 each scoped to the signed-in CSM \u2500\u2500
    React.createElement('div', { className:'grid grid-cols-4 gap-4' },
      React.createElement(MetricCard, { label:'Managed ARR', value:'$3.84M', sub:'24 accounts',
        onClick:()=>navigate('/customers?owner=' + me) }),
      React.createElement(MetricCard, { label:'Revenue at risk', value:'$620K', sub:'\u2191 $80K from last week', subColor:'text-red-600',
        onClick:()=>navigate('/risks?owner=' + me) }),
      React.createElement(MetricCard, { label:'Upcoming renewals', value:'8', sub:'Next 30 days', subColor:'text-amber-600',
        onClick:()=>navigate('/customers?owner=' + me + '&renewalWithin=30') }),
      React.createElement(MetricCard, { label:'Expansion potential', value:'$410K', sub:'Across 6 accounts', subColor:'text-teal-600',
        onClick:()=>navigate('/expansion?owner=' + me) })
    ),

    // \u2500\u2500 Two-column working area \u2500\u2500
    React.createElement('div', { className:'grid grid-cols-3 gap-5 items-start' },

      // Priority queue
      React.createElement(Card, { className:'col-span-2 overflow-hidden' },
        React.createElement('div', { className:'px-5 py-3.5 border-b border-slate-100 flex items-center justify-between' },
          React.createElement('div', null,
            React.createElement('h3', { className:'font-semibold text-slate-900 text-sm' }, 'Priority queue'),
            React.createElement('p', { className:'text-xs text-slate-400 mt-0.5' }, 'Ranked by revenue exposure and urgency')
          ),
          React.createElement('div', { className:'flex items-center gap-3' },
            React.createElement('span', { className:'text-xs text-slate-400' }, priorityItems.length + ' open'),
            React.createElement('button', { onClick:()=>navigate('/work'), className:'text-xs text-indigo-600 hover:underline font-medium' }, 'View all \u2192')
          )
        ),
        priorityItems.length === 0
          ? React.createElement('div', { className:'px-5 py-12 text-center' },
              React.createElement('p', { className:'text-2xl mb-1' }, '\u2713'),
              React.createElement('p', { className:'text-sm text-slate-400' }, 'All caught up \u2014 nothing needs attention')
            )
          : React.createElement('div', null,
              priorityItems.map(item => React.createElement('div', { key:item.id, className:'group px-5 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/70 transition-colors flex items-center gap-3.5' },
                React.createElement(SeverityBadge, { severity:item.severity }),
                React.createElement('div', { className:'flex-1 min-w-0' },
                  React.createElement('div', { className:'flex items-baseline gap-2' },
                    React.createElement('p', { className:'font-medium text-slate-900 text-sm' }, item.customer),
                    React.createElement('span', { className:'text-slate-400 text-xs' }, item.arr + ' \u00b7 ' + item.due)
                  ),
                  React.createElement('p', { className:'text-xs text-slate-500 truncate mt-0.5' }, item.reason)
                ),
                React.createElement('div', { className:'flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity' },
                  React.createElement('button', { onClick:()=>dispatch({type:'SNOOZE_PRIORITY',itemId:item.id}), title:'Snooze 7 days', className:'p-1.5 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-lg text-xs' }, '\u23f0'),
                  React.createElement('button', { onClick:()=>dispatch({type:'DISMISS_PRIORITY',itemId:item.id}), title:'Dismiss', className:'p-1.5 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-lg text-xs' }, '\u2715')
                ),
                React.createElement(Btn, { variant:'secondary', size:'xs',
                  onClick:()=>openItem(item),
                  title: 'Create a task and open it'
                }, 'Open')
              ))
            )
      ),

      // Right rail
      React.createElement('div', { className:'space-y-5' },

        React.createElement(Card, { className:'p-4 border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-white' },
          React.createElement('div', { className:'flex items-center gap-2 mb-2' },
            React.createElement('div', { className:'w-5 h-5 bg-indigo-600 rounded flex items-center justify-center text-white text-xs' }, '\u2726'),
            React.createElement('h3', { className:'font-semibold text-slate-900 text-sm' }, 'CX42 Brief')
          ),
          React.createElement('p', { className:'text-sm text-slate-700 leading-relaxed' }, "Three accounts need attention today. Acme's usage decline and unresolved sync issue put $240K at risk. Northstar shows the strongest expansion evidence, but no opportunity exists.")
        ),

        React.createElement(Card, { className:'overflow-hidden' },
          React.createElement('div', { className:'px-4 py-3 border-b border-slate-100' },
            React.createElement('h3', { className:'font-semibold text-slate-900 text-sm' }, 'My tasks')
          ),
          React.createElement('div', { className:'flex border-b border-slate-100' },
            [['ack','To do',tasks_todo.length],['risk','In progress',tasks_doing.length],['due','Due soon',tasks_due.length]].map(([id,label,count]) =>
              React.createElement('button', { key:id, onClick:()=>setGoalsTab(id), className:'flex-1 py-2 text-xs font-medium transition-colors ' + (tasksTab===id ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600') },
                label, count > 0 ? ' \u00b7 ' + count : ''
              )
            )
          ),
          React.createElement('div', { className:'divide-y divide-slate-50' },
            tasksShown.slice(0,3).map(tk => {
              const c = state.customers.find(cu=>cu.id===tk.customerId);
              const parent = tk.goalId ? state.goals[tk.goalId] : null;
              return React.createElement('div', { key:tk.id, className:'px-4 py-3 hover:bg-slate-50 cursor-pointer',
                onClick:()=>navigate('/work?task=' + tk.id) },
                React.createElement('p', { className:'text-sm font-medium text-slate-900 leading-snug' }, tk.title),
                React.createElement('p', { className:'text-xs text-slate-400 mt-0.5' },
                  (c ? c.name : '') + (tk.dueDate ? ' \u00b7 Due ' + new Date(tk.dueDate).toLocaleDateString('en-US',{month:'short',day:'numeric'}) : '')),
                parent && React.createElement('p', { className:'text-[11px] text-indigo-600 mt-1 truncate' }, '\u25CE ' + parent.title)
              );
            }),
            tasksShown.length === 0 && React.createElement('div', { className:'px-4 py-6 text-xs text-slate-400 text-center' }, 'Nothing here')
          ),
          tasksShown.length > 3 && React.createElement('button', { onClick:()=>navigate('/work'), className:'w-full px-4 py-2.5 text-xs text-indigo-600 hover:bg-slate-50 border-t border-slate-100' }, 'View all ' + tasksShown.length)
        )
      )
    ),

    // \u2500\u2500 Portfolio health strip \u2500\u2500
    React.createElement(Card, { className:'p-5' },
      React.createElement('div', { className:'flex items-center justify-between mb-4' },
        React.createElement('h3', { className:'font-semibold text-slate-900 text-sm' }, 'Portfolio health'),
        React.createElement('div', { className:'flex items-center gap-3' },
          React.createElement('div', { className:'flex gap-0.5 bg-slate-100 rounded-lg p-0.5' },
            React.createElement('button', { onClick:()=>setHealthView('count'), className:'px-2.5 py-1 text-xs rounded-md transition-colors ' + (healthView==='count'?'bg-white text-slate-900 shadow-sm font-medium':'text-slate-500') }, 'Customers'),
            React.createElement('button', { onClick:()=>setHealthView('arr'), className:'px-2.5 py-1 text-xs rounded-md transition-colors ' + (healthView==='arr'?'bg-white text-slate-900 shadow-sm font-medium':'text-slate-500') }, 'ARR')
          ),
          React.createElement('button', { onClick:()=>navigate('/customers'), className:'text-xs text-indigo-600 hover:underline font-medium' }, 'View all \u2192')
        )
      ),
      React.createElement('div', { className:'w-full h-2 flex rounded-full overflow-hidden gap-0.5' },
        React.createElement('div', { className:'bg-green-500 h-full rounded-l-full', style:{width:pct(hv.green)} }),
        React.createElement('div', { className:'bg-amber-400 h-full', style:{width:pct(hv.yellow)} }),
        React.createElement('div', { className:'bg-red-500 h-full rounded-r-full', style:{width:pct(hv.red)} })
      ),
      React.createElement('div', { className:'flex gap-8 mt-4' },
        [['bg-green-500','Healthy', healthView==='arr'?'$2.10M':'13'],
         ['bg-amber-400','Needs attention', healthView==='arr'?'$1.12M':'7'],
         ['bg-red-500','At risk', healthView==='arr'?'$620K':'4']
        ].map(([color,label,value]) => React.createElement('div', { key:label, className:'flex items-center gap-2' },
          React.createElement('span', { className:'w-2 h-2 rounded-full ' + color }),
          React.createElement('span', { className:'text-xs text-slate-500' }, label),
          React.createElement('span', { className:'text-sm font-semibold text-slate-900' }, value)
        ))
      )
    )
  );
}

// ============================================================
// SECTION 8: CUSTOMERS LIST
// ============================================================

// ── Column catalogue. Customer is fixed and always rendered first. ──
const CUST_COLUMNS = [
  { id:'segment',   label:'Segment',        group:'Firmographic' },
  { id:'arr',       label:'ARR',            group:'Commercial', def:true },
  { id:'renewal',   label:'Renewal status', group:'Commercial', def:true },
  { id:'renewDate', label:'Renewal date',   group:'Commercial' },
  { id:'forecast',  label:'Renewal forecast', group:'Commercial' },
  { id:'health',    label:'Health',         group:'Health', def:true },
  { id:'adoption',  label:'Adoption',       group:'Health' },
  { id:'dataAge',   label:'Health data age',group:'Health' },
  { id:'risk',      label:'Active risk',    group:'Health' },
  { id:'goals',     label:'Goals',          group:'Engagement', def:true },
  { id:'lastQBR',   label:'Last QBR',       group:'Engagement' },
  { id:'contacts',  label:'Contacts',       group:'Engagement' },
  { id:'tickets',   label:'Open tickets',   group:'Engagement' },
  { id:'expansion', label:'Expansion',      group:'Commercial' },
  { id:'owner',     label:'Owner',          group:'Ownership', def:true },
];
const CUST_DEFAULT_COLS = CUST_COLUMNS.filter(c=>c.def).map(c=>c.id);

// Conversational filter parser — maps plain English onto the structured filter state
function parseCustomerPrompt(text){
  const p = (text||'').toLowerCase();
  const out = { health:null, segment:null, arrMin:null, arrMax:null, renewalWithin:null,
                risk:null, goals:null, owner:null, sort:null, matched:[] };
  const add = (label)=>out.matched.push(label);

  if (/\bat[- ]?risk|unhealthy|\bred\b|churn/.test(p))       { out.health='red';    add('Health is Red'); }
  else if (/needs attention|\byellow\b|amber/.test(p))       { out.health='yellow'; add('Health is Yellow'); }
  else if (/healthy|\bgreen\b/.test(p))                      { out.health='green';  add('Health is Green'); }

  if (/enterprise/.test(p))        { out.segment='enterprise';  add('Segment is Enterprise'); }
  else if (/mid[- ]?market/.test(p)){ out.segment='mid_market'; add('Segment is Mid-market'); }
  else if (/\bsmb\b|small business/.test(p)) { out.segment='smb'; add('Segment is SMB'); }

  // "over $100k", "above 250k", "more than 1m"
  const money = p.match(/(?:over|above|more than|greater than|>)\s*\$?\s*([\d.]+)\s*([km])?/);
  if (money) { const n = parseFloat(money[1]) * (money[2]==='m'?1e6:money[2]==='k'?1e3:1);
               out.arrMin = n; add('ARR over ' + formatARR(n)); }
  const moneyU = p.match(/(?:under|below|less than|<)\s*\$?\s*([\d.]+)\s*([km])?/);
  if (moneyU) { const n = parseFloat(moneyU[1]) * (moneyU[2]==='m'?1e6:moneyU[2]==='k'?1e3:1);
                out.arrMax = n; add('ARR under ' + formatARR(n)); }

  const days = p.match(/(?:renew|renewal|expiring)[^\d]{0,20}(\d{1,3})\s*(day|d\b|week|month)/);
  if (days) { const n = parseInt(days[1],10) * (/week/.test(days[2])?7:/month/.test(days[2])?30:1);
              out.renewalWithin = n; add('Renewing within ' + n + ' days'); }
  else if (/renewing soon|up for renewal|renewal soon/.test(p)) { out.renewalWithin = 90; add('Renewing within 90 days'); }
  else if (/this quarter/.test(p)) { out.renewalWithin = 90; add('Renewing this quarter'); }
  else if (/this month/.test(p))   { out.renewalWithin = 30; add('Renewing within 30 days'); }

  if (/with (an )?open risk|has risk|with risks/.test(p)) { out.risk='yes'; add('Has an open risk'); }
  if (/no risk|without risk/.test(p))                     { out.risk='no';  add('No open risk'); }
  if (/no (active )?(goal|success plan)|without (a )?goal/.test(p)) { out.goals='none'; add('No active goal'); }
  if (/with goals|has goals/.test(p))                     { out.goals='some'; add('Has active goals'); }

  if (/\bmine\b|my accounts|my portfolio|assigned to me/.test(p)) { out.owner='maya'; add("Maya's portfolio"); }

  if (/sort(ed)? by renewal|by renewal date|soonest renewal/.test(p)) { out.sort='renewal'; add('Sorted by renewal date'); }
  else if (/(largest|biggest|highest).{0,12}arr|by arr/.test(p))      { out.sort='arr';     add('Sorted by ARR'); }
  else if (/lowest health|worst health|by health/.test(p))            { out.sort='health';  add('Sorted by health'); }

  return out;
}

function CustomersList() {
  const { state } = useApp();
  const navigate = useNavigate();
  const { query } = useLocation();
  const ownerFilter = query.owner || null;
  const renewalWithinQ = query.renewalWithin ? Number(query.renewalWithin) : null;

  const [search, setSearch] = useState('');
  const [filterHealth, setFilterHealth] = useState('all');
  const [filterSegment, setFilterSegment] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');
  const [filterGoals, setFilterGoals] = useState('all');
  const [filterRenewal, setFilterRenewal] = useState('all');
  const [arrMin, setArrMin] = useState('');
  const [savedView, setSavedView] = useState('my_portfolio');
  const [previewCustomer, setPreviewCustomer] = useState(null);
  const [cols, setCols] = useState(CUST_DEFAULT_COLS);
  const [showCols, setShowCols] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [convo, setConvo] = useState('');
  const [convoChips, setConvoChips] = useState([]);
  const [sortBy, setSortBy] = useState(null);

  const savedViews = [
    { id:'my_portfolio', label:'My portfolio' },
    { id:'at_risk',      label:'At risk' },
    { id:'dormant',      label:'Dormant accounts' },
    { id:'no_plan',      label:'No active success plan' },
  ];
  const inPortfolio = savedView === 'my_portfolio';

  // Owner column is meaningless inside a single owner's portfolio
  const visibleCols = CUST_COLUMNS.filter(c => cols.includes(c.id) && !(inPortfolio && c.id === 'owner'));

  const toggleCol = (id) => setCols(cs => cs.includes(id) ? cs.filter(x=>x!==id) : cs.concat(id));

  const applyPrompt = () => {
    const r = parseCustomerPrompt(convo);
    if (r.health)  setFilterHealth(r.health);
    if (r.segment) setFilterSegment(r.segment);
    if (r.risk)    setFilterRisk(r.risk);
    if (r.goals)   setFilterGoals(r.goals);
    if (r.renewalWithin != null) setFilterRenewal(String(r.renewalWithin));
    if (r.arrMin != null) setArrMin(String(r.arrMin));
    if (r.sort)    setSortBy(r.sort);
    if (r.owner)   setSavedView('my_portfolio');
    setConvoChips(r.matched);
    if (r.matched.length) setShowFilters(true);
  };
  const clearAll = () => {
    setFilterHealth('all'); setFilterSegment('all'); setFilterRisk('all'); setFilterGoals('all');
    setFilterRenewal('all'); setArrMin(''); setSortBy(null); setConvoChips([]); setConvo(''); setSearch('');
  };

  const daysFor = (c) => {
    const r = state.renewals.find(rr => rr.customerId === c.id);
    if (r && r.daysRemaining != null) return r.daysRemaining;
    return c.renewalDate ? daysUntil(c.renewalDate) : null;
  };
  const openGoalsFor = (c) => c.goalIds.filter(id => state.goals[id] && ['not_started','in_progress','at_risk'].includes(state.goals[id].status)).length;

  let customers = state.customers;
  if (ownerFilter) customers = customers.filter(c => c.ownerId === ownerFilter);
  if (renewalWithinQ != null) customers = customers.filter(c => { const d = daysFor(c); return d != null && d <= renewalWithinQ; });

  // Saved views
  if (savedView === 'my_portfolio') {
    customers = customers.filter(c => c.ownerId === (state.activeUser || 'maya'));
  } else if (savedView === 'at_risk') {
    // Every at-risk account, ordered by soonest renewal first
    customers = customers.filter(c => {
      const h = HEALTH_SIGNALS[c.healthId];
      const hasRisk = (c.riskIds||[]).some(id => state.risks[id] && state.risks[id].status !== 'resolved');
      return h?.band === 'red' || hasRisk;
    }).slice().sort((a,b) => {
      const da = daysFor(a), db = daysFor(b);
      if (da == null && db == null) return 0;
      if (da == null) return 1;          // undated renewals sink to the bottom
      if (db == null) return -1;
      return da - db;
    });
  } else if (savedView === 'dormant') {
    customers = customers.filter(c => {
      const h = HEALTH_SIGNALS[c.healthId];
      return h?.dataQuality === 'stale' || h?.dataQuality === 'partial';
    });
  } else if (savedView === 'no_plan') {
    customers = customers.filter(c => c.goalIds.length === 0 || !Object.values(state.goals).some(g=>g.customerId===c.id && g.status === 'in_progress'));
  }

  if (search) customers = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.domain.toLowerCase().includes(search.toLowerCase()));
  if (filterHealth !== 'all') customers = customers.filter(c => HEALTH_SIGNALS[c.healthId]?.band === filterHealth);
  if (filterSegment !== 'all') customers = customers.filter(c => c.segment === filterSegment);
  if (filterRisk !== 'all') customers = customers.filter(c => {
    const has = (c.riskIds||[]).some(id => state.risks[id] && state.risks[id].status !== 'resolved');
    return filterRisk === 'yes' ? has : !has;
  });
  if (filterGoals !== 'all') customers = customers.filter(c => filterGoals === 'none' ? openGoalsFor(c) === 0 : openGoalsFor(c) > 0);
  if (filterRenewal !== 'all') customers = customers.filter(c => { const d = daysFor(c); return d != null && d <= Number(filterRenewal); });
  if (arrMin) customers = customers.filter(c => c.arr >= Number(arrMin));

  // Explicit sort overrides the view's natural order, except At risk which is renewal-ordered by design
  if (sortBy && savedView !== 'at_risk') {
    customers = customers.slice().sort((a,b) => {
      if (sortBy === 'arr') return b.arr - a.arr;
      if (sortBy === 'health') return (HEALTH_SIGNALS[a.healthId]?.compositeScore||0) - (HEALTH_SIGNALS[b.healthId]?.compositeScore||0);
      const da = daysFor(a), db = daysFor(b);
      if (da == null) return 1; if (db == null) return -1; return da - db;
    });
  }

  const activeFilterCount = [filterHealth,filterSegment,filterRisk,filterGoals,filterRenewal].filter(v=>v!=='all').length + (arrMin?1:0);
  const preview = previewCustomer ? state.customers.find(c=>c.id===previewCustomer) : null;
  const previewHealth = preview ? HEALTH_SIGNALS[preview.healthId] : null;
  const selCls = 'text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 outline-none focus:border-indigo-400';

  // ── Cell renderers, keyed by column id ──
  const cell = (id, c) => {
    const health = HEALTH_SIGNALS[c.healthId];
    const renewal = state.renewals.find(r=>r.customerId===c.id);
    const d = daysFor(c);
    switch(id){
      case 'segment': return React.createElement('span', { className:'text-slate-600 capitalize' }, c.segment.replace('_',' '));
      case 'arr': return React.createElement('span', { className:'font-medium' }, formatARR(c.arr));
      case 'renewal': return d == null ? React.createElement('span',{className:'text-slate-300'},'\u2014')
        : React.createElement('span', { className:`text-xs font-semibold ${d<30?'text-red-600':d<90?'text-amber-600':'text-slate-600'}` },
            d < 0 ? 'Overdue' : d + 'd left');
      case 'renewDate': return React.createElement('span', { className:'text-xs text-slate-600' },
        c.renewalDate ? new Date(c.renewalDate).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '\u2014');
      case 'forecast': return renewal ? React.createElement(CxPill, { tone:({commit:'green',likely:'green',upside:'blue',at_risk:'red',churn:'red'})[renewal.forecast]||'amber' },
        String(renewal.forecast).replace('_',' ')) : React.createElement('span',{className:'text-slate-300 text-xs'},'\u2014');
      case 'health': return React.createElement(HealthBadge, { band:health?.band, score:health?.compositeScore });
      case 'adoption': { const a = getCustomerDetail(c, health).adoption;
        return React.createElement('span', { className:`text-xs font-semibold ${a>=75?'text-green-600':a>=50?'text-amber-600':'text-red-600'}` }, a); }
      case 'dataAge': return React.createElement(CxPill, { tone: health?.dataQuality==='fresh'?'green':health?.dataQuality==='partial'?'amber':'red' },
        health?.dataQuality || 'unknown');
      case 'risk': { const r = (c.riskIds||[]).map(id=>state.risks[id]).find(x=>x && x.status!=='resolved');
        return r ? React.createElement(SeverityBadge,{severity:r.severity}) : React.createElement('span',{className:'text-slate-300 text-xs'},'None'); }
      case 'goals': { const n = openGoalsFor(c);
        return React.createElement('span',{className:`text-xs font-medium ${n>0?'text-indigo-600':'text-slate-400'}`}, n||'\u2014'); }
      case 'lastQBR': { const q = QBRS.filter(x=>x.customerId===c.id && x.status==='completed').slice(-1)[0];
        return React.createElement('span',{className:'text-xs text-slate-600'}, q ? q.date : React.createElement('span',{className:'text-slate-300'},'None')); }
      case 'contacts': return React.createElement('span',{className:'text-xs text-slate-600'}, (c.contactIds||[]).length || '\u2014');
      case 'tickets': { const n = TICKETS.filter(t=>t.customerId===c.id && t.status!=='resolved').length;
        return React.createElement('span',{className:`text-xs font-medium ${n>0?'text-slate-700':'text-slate-300'}`}, n||'\u2014'); }
      case 'expansion': { const e = c.expansionIds?.[0] ? state.expansionOpps[c.expansionIds[0]] : null;
        return e && e.qualificationStatus!=='dismissed' ? React.createElement('span',{className:'text-teal-700 text-xs font-medium'},'+'+formatARR(e.estimatedArr))
                                                       : React.createElement('span',{className:'text-slate-300 text-xs'},'\u2014'); }
      case 'owner': return React.createElement(Avatar, { user:USERS[c.ownerId] });
      default: return null;
    }
  };

  return React.createElement('div', { className:'space-y-4' },

    // Query-param chips
    (ownerFilter || renewalWithinQ != null) && React.createElement('div', { className:'flex items-center gap-2 flex-wrap' },
      React.createElement('span', { className:'text-xs text-slate-400' }, 'Filtered by:'),
      ownerFilter && React.createElement('span', { className:'inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold' },
        (USERS[ownerFilter] ? USERS[ownerFilter].name : ownerFilter) + "'s portfolio",
        React.createElement('button', { onClick:()=>navigate(renewalWithinQ != null ? '/customers?renewalWithin=' + renewalWithinQ : '/customers'), className:'text-indigo-400 hover:text-indigo-700' }, '\u2715')),
      renewalWithinQ != null && React.createElement('span', { className:'inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-semibold' },
        'Renewal within ' + renewalWithinQ + ' days',
        React.createElement('button', { onClick:()=>navigate(ownerFilter ? '/customers?owner=' + ownerFilter : '/customers'), className:'text-amber-400 hover:text-amber-700' }, '\u2715')),
      React.createElement('button', { onClick:()=>navigate('/customers'), className:'text-xs text-slate-400 hover:text-slate-600 underline' }, 'Clear all')
    ),

    // Views + toolbar
    React.createElement('div', { className:'flex items-center gap-3 flex-wrap' },
      React.createElement('div', { className:'flex gap-1 bg-white border border-slate-200 rounded-lg p-1' },
        savedViews.map(v => React.createElement('button', { key:v.id, onClick:()=>setSavedView(v.id),
          className:`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${savedView===v.id?'bg-indigo-600 text-white':'text-slate-600 hover:bg-slate-100'}` }, v.label))
      ),
      React.createElement('input', { placeholder:'Search customers\u2026', value:search, onChange:e=>setSearch(e.target.value),
        className:'px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500' }),
      React.createElement('button', { onClick:()=>setShowFilters(v=>!v),
        className:`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${showFilters||activeFilterCount?'bg-indigo-50 text-indigo-700 border-indigo-200':'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}` },
        '\u2699 Filters' + (activeFilterCount ? ' \u00b7 ' + activeFilterCount : '')),
      React.createElement('div', { className:'relative' },
        React.createElement('button', { onClick:()=>setShowCols(v=>!v),
          className:`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${showCols?'bg-indigo-50 text-indigo-700 border-indigo-200':'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}` },
          '\u25A6 Columns \u00b7 ' + (visibleCols.length + 1)),
        showCols && React.createElement('div', { className:'absolute right-0 mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-lg z-30 p-3' },
          React.createElement('div', { className:'flex items-center justify-between mb-2' },
            React.createElement('p', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider' }, 'Visible columns'),
            React.createElement('button', { onClick:()=>setCols(CUST_DEFAULT_COLS), className:'text-[11px] text-indigo-600 hover:underline' }, 'Reset')
          ),
          React.createElement('div', { className:'flex items-center gap-2 px-1 py-1.5 opacity-60' },
            React.createElement('input', { type:'checkbox', checked:true, disabled:true, className:'accent-indigo-600' }),
            React.createElement('span', { className:'text-xs text-slate-700 font-semibold' }, 'Customer'),
            React.createElement(CxPill, { tone:'slate' }, 'fixed')
          ),
          React.createElement('div', { className:'max-h-64 overflow-y-auto mt-1' },
            Array.from(new Set(CUST_COLUMNS.map(c=>c.group))).map(g =>
              React.createElement('div', { key:g, className:'mb-1.5' },
                React.createElement('p', { className:'text-[9px] font-bold text-slate-300 uppercase tracking-wider px-1 mb-0.5' }, g),
                CUST_COLUMNS.filter(c=>c.group===g).map(c =>
                  React.createElement('label', { key:c.id, className:'flex items-center gap-2 px-1 py-1 hover:bg-slate-50 rounded cursor-pointer' },
                    React.createElement('input', { type:'checkbox', checked:cols.includes(c.id), onChange:()=>toggleCol(c.id), className:'accent-indigo-600' }),
                    React.createElement('span', { className:'text-xs text-slate-700' }, c.label),
                    inPortfolio && c.id==='owner' && React.createElement('span', { className:'text-[10px] text-slate-400 ml-auto' }, 'hidden here')
                  ))
              ))
          )
        )
      ),
      React.createElement('span', { className:'text-sm text-slate-500 ml-auto' }, `${customers.length} customers`)
    ),

    // Conversational filter
    React.createElement(Card, { className:'p-3' },
      React.createElement('div', { className:'flex items-center gap-2 flex-wrap' },
        React.createElement('span', { className:'w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs flex-shrink-0' }, '\u2726'),
        React.createElement('input', { value:convo, onChange:e=>setConvo(e.target.value),
          onKeyDown:e=>{ if(e.key==='Enter') applyPrompt(); },
          placeholder:'Describe what you want to see \u2014 e.g. "enterprise accounts at risk renewing in 60 days over $100k"',
          className:'flex-1 min-w-[240px] text-sm px-2 py-1 outline-none placeholder:text-slate-400' }),
        React.createElement(Btn, { variant:'primary', size:'xs', onClick:applyPrompt, disabled:!convo.trim() }, 'Apply'),
        (activeFilterCount>0 || convoChips.length>0) && React.createElement(Btn, { variant:'ghost', size:'xs', onClick:clearAll }, 'Clear')
      ),
      convoChips.length > 0 && React.createElement('div', { className:'flex gap-1.5 flex-wrap mt-2 pl-8' },
        convoChips.map(ch => React.createElement(CxPill, { key:ch, tone:'blue' }, ch))),
      convo.trim() && convoChips.length === 0 && React.createElement('p', { className:'text-[11px] text-slate-400 mt-2 pl-8' },
        'Press Apply \u2014 try health, segment, ARR thresholds, renewal windows, risks, goals or sorting.')
    ),

    // Filter panel
    showFilters && React.createElement(Card, { className:'p-4' },
      React.createElement('div', { className:'grid grid-cols-6 gap-3' },
        React.createElement('div', null,
          React.createElement('label', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider' }, 'Health'),
          React.createElement('select', { value:filterHealth, onChange:e=>setFilterHealth(e.target.value), className:'w-full mt-1 ' + selCls },
            React.createElement('option',{value:'all'},'All health'), React.createElement('option',{value:'red'},'At risk'),
            React.createElement('option',{value:'yellow'},'Needs attention'), React.createElement('option',{value:'green'},'Healthy'))),
        React.createElement('div', null,
          React.createElement('label', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider' }, 'Segment'),
          React.createElement('select', { value:filterSegment, onChange:e=>setFilterSegment(e.target.value), className:'w-full mt-1 ' + selCls },
            React.createElement('option',{value:'all'},'All segments'), React.createElement('option',{value:'enterprise'},'Enterprise'),
            React.createElement('option',{value:'mid_market'},'Mid-market'), React.createElement('option',{value:'smb'},'SMB'))),
        React.createElement('div', null,
          React.createElement('label', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider' }, 'Renewal window'),
          React.createElement('select', { value:filterRenewal, onChange:e=>setFilterRenewal(e.target.value), className:'w-full mt-1 ' + selCls },
            React.createElement('option',{value:'all'},'Any'), React.createElement('option',{value:'30'},'Within 30 days'),
            React.createElement('option',{value:'60'},'Within 60 days'), React.createElement('option',{value:'90'},'Within 90 days'),
            React.createElement('option',{value:'180'},'Within 180 days'))),
        React.createElement('div', null,
          React.createElement('label', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider' }, 'Open risk'),
          React.createElement('select', { value:filterRisk, onChange:e=>setFilterRisk(e.target.value), className:'w-full mt-1 ' + selCls },
            React.createElement('option',{value:'all'},'Any'), React.createElement('option',{value:'yes'},'Has open risk'),
            React.createElement('option',{value:'no'},'No open risk'))),
        React.createElement('div', null,
          React.createElement('label', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider' }, 'Goals'),
          React.createElement('select', { value:filterGoals, onChange:e=>setFilterGoals(e.target.value), className:'w-full mt-1 ' + selCls },
            React.createElement('option',{value:'all'},'Any'), React.createElement('option',{value:'some'},'Has active goals'),
            React.createElement('option',{value:'none'},'No active goals'))),
        React.createElement('div', null,
          React.createElement('label', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider' }, 'Min ARR'),
          React.createElement('input', { value:arrMin, onChange:e=>setArrMin(e.target.value.replace(/[^\d]/g,'')), placeholder:'e.g. 100000',
            className:'w-full mt-1 ' + selCls }))
      ),
      React.createElement('div', { className:'flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 flex-wrap' },
        React.createElement('span', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider' }, 'Sort'),
        [['','Default'],['renewal','Renewal date'],['arr','ARR'],['health','Health score']].map(o =>
          React.createElement('button', { key:o[0], onClick:()=>setSortBy(o[0]||null),
            className:`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-colors ${(sortBy||'')===o[0]?'bg-slate-900 text-white border-slate-900':'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}` }, o[1])),
        savedView === 'at_risk' && React.createElement('span', { className:'text-[11px] text-slate-400 ml-2' }, 'At risk is always ordered by soonest renewal'),
        React.createElement('button', { onClick:clearAll, className:'ml-auto text-xs text-slate-400 hover:text-slate-600 underline' }, 'Reset filters')
      )
    ),

    // Table
    React.createElement(Card, { className:'overflow-hidden' },
      React.createElement('div', { className:'overflow-x-auto' },
        React.createElement('table', { className:'w-full text-sm' },
          React.createElement('thead', null, React.createElement('tr', { className:'bg-slate-50 border-b' },
            React.createElement('th', { className:'px-4 py-3 text-left text-xs font-medium text-slate-500 whitespace-nowrap' }, 'Customer'),
            visibleCols.map(c => React.createElement('th',{key:c.id,className:'px-4 py-3 text-left text-xs font-medium text-slate-500 whitespace-nowrap'},c.label))
          )),
          React.createElement('tbody', null,
            customers.length === 0
              ? React.createElement('tr', null, React.createElement('td', { colSpan:visibleCols.length+1, className:'px-4 py-10 text-center text-slate-400 text-sm' }, 'No customers match these filters'))
              : customers.map(c => React.createElement('tr', { key:c.id, className:'border-b last:border-0 hover:bg-indigo-50 cursor-pointer transition-colors', onClick:()=>navigate(`/customers/${c.id}`) },
                  React.createElement('td', { className:'px-4 py-3' },
                    React.createElement('div', { className:'flex items-center gap-2' },
                      React.createElement('div', { className:'w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0' }, c.name.slice(0,2).toUpperCase()),
                      React.createElement('div', { className:'min-w-0' },
                        React.createElement('p', { className:'font-medium text-slate-900 truncate' }, c.name),
                        React.createElement('p', { className:'text-xs text-slate-400 truncate' }, c.domain)
                      )
                    )
                  ),
                  visibleCols.map(col => React.createElement('td', { key:col.id, className:'px-4 py-3' }, cell(col.id, c)))
                ))
          )
        )
      )
    ),

    preview && React.createElement(Drawer, { open:!!previewCustomer, onClose:()=>setPreviewCustomer(null), title:preview.name },
      React.createElement(HealthBadge, { band:previewHealth?.band, score:previewHealth?.compositeScore }),
      React.createElement(Btn, { variant:'primary', size:'sm', className:'mt-4', onClick:()=>navigate(`/customers/${preview.id}`) }, 'Open Customer 360')
    )
  );
}

// ============================================================
// SECTION 9: CUSTOMER 360
// ============================================================


// ============================================================
// CUSTOMER 360 — EXTENDED DETAIL LAYER
// Deterministic per-customer enrichment data + shared atoms
// ============================================================
function cxInt(seed, min, max){ return min + (seed % (max - min + 1)); }
function cxPick(arr, seed){ return arr[seed % arr.length]; }

const CX_CURRENCIES = {
  usd: { sym:'$', rate:1,    code:'USD' },
  inr: { sym:'₹', rate:83.4, code:'INR' },
  gbp: { sym:'£', rate:0.79, code:'GBP' },
};
function cxMoney(amount, cur){
  const c = CX_CURRENCIES[cur] || CX_CURRENCIES.usd;
  const v = amount * c.rate;
  if (cur === 'inr') return v >= 10000000 ? `${c.sym}${(v/10000000).toFixed(2)}Cr` : `${c.sym}${(v/100000).toFixed(1)}L`;
  return v >= 1000000 ? `${c.sym}${(v/1000000).toFixed(2)}M` : `${c.sym}${Math.round(v/1000)}K`;
}

// Master enrichment record for any customer in the portfolio
function getCustomerDetail(customer, health){
  const s = cxHash(customer.id);
  const band = health ? health.band : 'yellow';
  const score = health ? health.compositeScore : 60;
  const adoption = Math.max(8, Math.min(97, score + cxInt(s, -14, 12)));

  const churn = band === 'red' ? 'likely' : band === 'yellow' ? (score < 50 ? 'likely' : 'healthy') : 'healthy';
  const renewalPossibility = band === 'red' || score < 52 ? 'at_risk' : 'on_track';
  const sentiment = band === 'red' ? 'negative' : band === 'green' ? 'positive' : 'neutral';

  const nps  = band === 'red' ? cxInt(s, -40, 5) : band === 'yellow' ? cxInt(s, 6, 38) : cxInt(s, 42, 74);
  const csat = band === 'red' ? (2.4 + (s % 9) / 10) : band === 'yellow' ? (3.5 + (s % 8) / 10) : (4.3 + (s % 6) / 10);
  const escalation = band === 'red' ? cxInt(s, 68, 94) : band === 'yellow' ? cxInt(s, 34, 62) : cxInt(s, 8, 30);

  const dauMau = band === 'red' ? cxInt(s, 22, 41) : band === 'yellow' ? cxInt(s, 44, 63) : cxInt(s, 66, 86);
  const sessionMin = cxInt(s, 12, 46);
  const sessionSec = cxInt(s * 3, 5, 58);
  const dropOffs = cxInt(s, 40, 320);
  const rageTotal = cxInt(s * 7, 12, 130);
  const stickiness = Math.max(12, Math.min(96, Math.round(dauMau * 0.6 + adoption * 0.4 + cxInt(s, -6, 6))));

  const featurePool = ['Analytics Dashboards','Custom Reports','Data Connectors','Scheduled Reports','Workspaces','AI Insights','API Access','Collaboration','Data Pipeline','Alerting'];
  const featureScores = featurePool.map((f,i)=>({ name:f, pct: Math.max(6, Math.min(98, adoption + cxInt(cxHash(customer.id + f), -46, 22) )) }))
                                   .sort((a,b)=>b.pct-a.pct);
  const topFeatures = featureScores.slice(0,5);
  const mostClicked = topFeatures[0];
  const leastClicked = featureScores[featureScores.length-1];

  const pagePool = ['/dashboards','/reports','/integrations','/settings/team','/auth/sso','/workspaces','/pipelines','/alerts'];
  const topPages = pagePool.map(p=>({ name:p, hits: cxInt(cxHash(customer.id + p), 380, 5200) }))
                           .sort((a,b)=>b.hits-a.hits).slice(0,5);

  const ragePool = ['Export button','SSO login button','Save dashboard','Invite member','Run query','Apply filters'];
  const rageClicks = ragePool.map(r=>({ name:r, n: cxInt(cxHash(customer.id + r), 3, 44) }))
                             .sort((a,b)=>b.n-a.n).slice(0,4);

  const errorPool = [
    { msg:'AuthenticationError: SSO token expired',    path:'/auth/sso/callback?provider=okta', sev:'critical' },
    { msg:'TimeoutError: Export exceeded 30s',         path:'/api/v2/reports/export',           sev:'high' },
    { msg:'RateLimitError: 429 on connector sync',     path:'/api/v2/connectors/sync',          sev:'high' },
    { msg:'ValidationError: Malformed schema payload', path:'/api/v2/pipelines/ingest',         sev:'medium' },
    { msg:'RenderError: Dashboard widget crashed',     path:'/dashboards/:id/widgets',          sev:'medium' },
  ];
  const errors = errorPool.slice(0, cxInt(s, 2, 4)).map((e,i)=>({
    ...e, count: cxInt(cxHash(customer.id + e.msg), 4, 62), ago: cxPick(['2h ago','5h ago','1d ago','2d ago','4h ago'], cxHash(customer.id + i))
  }));

  const objectives = [
    'Automate compliance reporting and reduce audit overhead by 60% before Q4',
    'Consolidate fragmented analytics stacks into a single source of truth',
    'Cut time-to-insight for revenue teams from days to under an hour',
    'Support 3× data volume growth without adding headcount',
    'Standardise executive reporting across all business units',
    'Reduce manual data preparation effort by 50% within two quarters',
  ];
  const objective = cxPick(objectives, s);

  const champion = (customer.contactIds||[]).map(id=>CONTACTS[id]).filter(Boolean)
                    .find(c=>c.role==='Champion' || c.role==='Executive Sponsor');

  const wordPool = [
    ['compliance',22],['audit',18],['integration',18],['export',16],['dashboard',15],['timeout',14],
    ['report',14],['connector',13],['scheduled',13],['API',12],['SSO',12],['latency',11],
    ['pipeline',11],['workspace',11],['webhook',10],['permissions',10],['bulk',10],['roles',10]
  ];
  const words = wordPool.map((w,i)=>({ w:w[0], size:w[1], seed: cxHash(customer.id + w[0]) }))
                        .sort((a,b)=>(a.seed%7)-(b.seed%7));

  const featureRequests = [
    { title:'Automated SOC 2 report export',  status:'In roadmap'   },
    { title:'Async bulk export queue',        status:'Under review' },
    { title:'Role-based report locking',      status:'Under review' },
    { title:'Native Snowflake reverse sync',  status:'Backlog'      },
  ].slice(0, cxInt(s, 2, 4));

  const emails = [
    { to: champion ? champion.name : 'Executive sponsor', subj:'Quarterly business review — agenda inside', opens: cxInt(s,1,5), rate: cxInt(s, 55, 96), when:'Jul 18' },
    { to: 'Product owner', subj:'Platform release notes + what changed for you',            opens: cxInt(s*3,0,4), rate: cxInt(s*3, 20, 88), when:'Jul 11' },
    { to: 'Admin team',    subj:'Action needed: connector credentials expiring',            opens: cxInt(s*5,0,3), rate: cxInt(s*5, 10, 74), when:'Jul 04' },
  ];

  // Community posts authored / commented by the customer
  const community = [
    { kind:'Initiated', title:'SSO with Okta — token refresh failures?',        replies: cxInt(s, 3, 18), tag:'Hot'    },
    { kind:'Commented', title:'Best practice for very large report exports',    replies: cxInt(s*2, 2, 12), tag:'Active' },
    { kind:'Commented', title:'Webhook payload schema change in v3.6?',         replies: cxInt(s*4, 1, 9),  tag:'New'    },
  ].slice(0, cxInt(s, 2, 3));

  // Session replays tied to the customer's most recent tickets
  const replayTickets = TICKETS.filter(t=>t.customerId===customer.id).slice(0,5);

  // Funding / M&A news
  const investors = ['Sequoia Capital','Andreessen Horowitz','General Catalyst','Tiger Global','Accel','Index Ventures','Bessemer'];
  const rounds = ['Series A','Series B','Series C','Series D'];
  const roundIdx = cxInt(s, 1, 3);
  const news = [];
  news.push({
    type:'funding', src:'Bloomberg', when: cxPick(['Jun 5, 2025','May 22, 2025','Apr 30, 2025'], s),
    title: `${customer.name} raises ${cxMoney(cxInt(s, 40, 190) * 1000000, 'usd')} ${rounds[roundIdx]} to accelerate platform expansion`,
    body: `Led by ${cxPick(investors, s)} with participation from ${cxPick(investors, s*3)}. Proceeds earmarked for engineering headcount and international expansion.`,
    tags: [rounds[roundIdx], cxMoney(cxInt(s, 40, 190)*1000000,'usd'), cxPick(investors, s)],
    impact:'high',
    signal:`Fresh capital signals headcount growth — seat expansion opportunity. Engage ${champion ? champion.name : 'the economic buyer'} before budget is allocated internally.`
  });
  if (s % 3 !== 0) news.push({
    type:'acquisition', src:'PR Newswire', when: cxPick(['May 14, 2025','Mar 8, 2025','Feb 19, 2025'], s*2),
    title: `${customer.name} acquires ${cxPick(['Poros Data','DataBridge Labs','Lumen Metrics','Corvus Systems'], s)} to expand product surface`,
    body: `All-cash-and-stock transaction valued near ${cxMoney(cxInt(s, 8, 60)*1000000,'usd')}. The acquired engineering team will operate as a dedicated business unit.`,
    tags:['Acquisition', cxMoney(cxInt(s, 8, 60)*1000000,'usd')],
    impact:'high',
    signal:'New teams and systems join the account — expect fresh stakeholders and integration requirements. Position onboarding and data-residency capabilities early.'
  });
  if (s % 4 === 0 || band === 'red') news.push({
    type:'merger', src:'Wall Street Journal', when:'Apr 22, 2025',
    title: `${customer.name} in early merger talks with ${cxPick(['Veridian Compliance','Halcyon Data','Meridian Group','Arclight Systems'], s)}`,
    body:'Preliminary discussions reported by people familiar with the matter. Neither company has commented officially. A combined entity would materially change procurement structure.',
    tags:['Merger','Unconfirmed'],
    impact:'risk',
    signal:null,
    risk:'A merger can trigger vendor consolidation review and procurement freeze. Prioritise getting the renewal signed before any announcement solidifies.'
  });
  news.push({
    type:'funding', src:'TechCrunch', when:'Nov 12, 2023',
    title: `${customer.name} closes ${cxMoney(cxInt(s*7, 15, 70)*1000000,'usd')} ${rounds[Math.max(0,roundIdx-1)]}`,
    body:'Earlier round that funded the current platform build-out and doubled engineering headcount over eighteen months.',
    tags:[rounds[Math.max(0,roundIdx-1)],'Historical'], impact:'neutral', signal:null
  });

  return {
    score, adoption, churn, renewalPossibility, sentiment,
    nps, csat: Math.min(5, csat), escalation,
    dauMau, sessionMin, sessionSec, dropOffs, rageTotal, stickiness,
    topFeatures, mostClicked, leastClicked, topPages, rageClicks, errors,
    objective, champion, words, featureRequests, emails, community, replayTickets, news,
    sessionsPerWeek: (2 + (s % 40) / 10).toFixed(1),
    mau: cxInt(s, 40, 620),
    retention90: cxInt(s, 58, 96),
    featureDepth: cxInt(s, 3, 11),
  };
}

// ── Small presentational atoms used across the new tabs ──
function CxPill({ tone='slate', children, className='' }){
  const map = {
    green:'bg-green-100 text-green-700', amber:'bg-amber-100 text-amber-700',
    red:'bg-red-100 text-red-700', blue:'bg-blue-100 text-blue-700',
    purple:'bg-purple-100 text-purple-700', slate:'bg-slate-100 text-slate-600',
    teal:'bg-teal-100 text-teal-700',
  };
  return React.createElement('span', { className:`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${map[tone]||map.slate} ${className}` }, children);
}

function CxLabel({ children, right }){
  return React.createElement('div', { className:'flex items-center justify-between mb-3' },
    React.createElement('p', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider' }, children),
    right || null
  );
}

function CxBarRow({ label, value, max, display, color='bg-indigo-500', labelWidth='w-36' }){
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return React.createElement('div', { className:'flex items-center gap-3 py-1.5 border-b border-slate-50 last:border-0' },
    React.createElement('p', { className:`text-xs text-slate-600 ${labelWidth} flex-shrink-0 truncate` }, label),
    React.createElement('div', { className:'flex-1 bg-slate-100 rounded-full h-1.5' },
      React.createElement('div', { className:`h-1.5 rounded-full ${color}`, style:{ width: pct + '%' } })
    ),
    React.createElement('span', { className:'text-xs font-semibold text-slate-700 w-12 text-right' }, display != null ? display : value)
  );
}

function CxAIBox({ title='AI generated', children, onRegenerate, right }){
  return React.createElement('div', { className:'bg-indigo-50/60 border border-indigo-100 rounded-xl p-4' },
    React.createElement('div', { className:'flex items-center gap-2 mb-2 flex-wrap' },
      React.createElement('span', { className:'w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse' }),
      React.createElement('p', { className:'text-[10px] font-bold text-indigo-700 uppercase tracking-wider' }, title),
      right || null,
      onRegenerate && React.createElement('button', { onClick:onRegenerate, className:'ml-auto text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 border border-indigo-200 rounded-md px-2 py-0.5 bg-white/70' }, '↻ Regenerate')
    ),
    React.createElement('div', { className:'text-sm text-slate-700 leading-relaxed' }, children)
  );
}

// ── Overview: editable account attributes panel ──
// Full-width attribute band \u2014 6 tiles in a single row, no wasted space
function AccountAttributesPanel({ customer, health, dispatch }){
  const d = getCustomerDetail(customer, health);
  const [churn, setChurn] = useState(d.churn);
  const [renewalPoss, setRenewalPoss] = useState(d.renewalPossibility);
  const [sentiment, setSentiment] = useState(d.sentiment);
  // Churn, renewal possibility and sentiment drive forecasting, so a change is
  // staged here and only committed once the user supplies a reason.
  const [pending, setPending] = useState(null);   // { field, from, to, apply }
  const requestChange = (field, from, to, apply) => {
    if (from === to) return;                      // selecting the current value is a no-op
    setPending({ field, from, to, apply });
  };
  const confirmChange = (reason) => {
    if (!pending) return;
    pending.apply(pending.to);
    dispatch && dispatch({ type:'LOG_ATTR_CHANGE', customerId:customer.id, field:pending.field,
      from:pending.from, to:pending.to, reason });
    setPending(null);
  };

  const healthScore = d.score, adoptionScore = d.adoption;
  const scoreTone = v => v >= 75 ? 'green' : v >= 50 ? 'amber' : 'red';
  const scoreWord = v => v >= 75 ? 'Good' : v >= 50 ? 'Moderate' : 'Low';
  const scoreText = v => v >= 75 ? 'text-green-600' : v >= 50 ? 'text-amber-600' : 'text-red-600';
  const selFull = 'w-full text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-700 outline-none focus:border-indigo-400 cursor-pointer';

  const tile = (label, content) => React.createElement('div', { className:'min-w-0' },
    React.createElement('p', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5' }, label),
    content
  );
  const scoreReadout = (value) => React.createElement('div', { className:'flex items-baseline gap-1.5' },
    React.createElement('span', { className:`text-xl font-bold tabular-nums leading-none ${scoreText(value)}` }, value),
    React.createElement('span', { className:'text-[11px] text-slate-300' }, '/100'),
    React.createElement(CxPill, { tone:scoreTone(value), className:'ml-0.5' }, scoreWord(value))
  );

  return React.createElement(Card, { className:'p-4' },
    React.createElement(CxLabel, null, 'Account health & status'),
    React.createElement('div', { className:'grid grid-cols-6 gap-x-5 gap-y-3' },
      tile('Health score', scoreReadout(healthScore)),
      tile('Adoption score', scoreReadout(adoptionScore)),
      tile('Adoption health', React.createElement('div', { className:'flex items-baseline gap-1.5' },
        React.createElement(CxPill, { tone:scoreTone(adoptionScore) }, scoreWord(adoptionScore)),
        React.createElement('span', { className:`text-sm font-bold tabular-nums ${scoreText(adoptionScore)}` }, adoptionScore),
        React.createElement('span', { className:'text-[11px] text-slate-300' }, '/100')
      )),
      tile('Customer churn', React.createElement('select', { value:churn, onChange:e=>requestChange('churn', churn, e.target.value, setChurn), className:selFull },
        React.createElement('option', { value:'healthy' }, 'Healthy'),
        React.createElement('option', { value:'likely' }, 'Likely to churn'),
        React.createElement('option', { value:'confirmed' }, 'Confirm churn')
      )),
      tile('Renewal possibility', React.createElement('select', { value:renewalPoss, onChange:e=>requestChange('renewal', renewalPoss, e.target.value, setRenewalPoss), className:selFull },
        React.createElement('option', { value:'on_track' }, 'On-track'),
        React.createElement('option', { value:'at_risk' }, 'At risk')
      )),
      tile('Sentiment', React.createElement('select', { value:sentiment, onChange:e=>requestChange('sentiment', sentiment, e.target.value, setSentiment), className:selFull },
        React.createElement('option', { value:'positive' }, 'Positive'),
        React.createElement('option', { value:'neutral' }, 'Neutral'),
        React.createElement('option', { value:'negative' }, 'Negative')
      ))
    )
    ,
    React.createElement(AttrReasonModal, { open:!!pending, field:pending && pending.field,
      from:pending && pending.from, to:pending && pending.to,
      onCancel:()=>setPending(null), onConfirm:confirmChange })
  );
}

// Revenue & renewal \u2014 standalone card so it can flow in the masonry
function RevenueRenewalCard({ customer, renewal, className='' }){
  const [currency, setCurrency] = useState('usd');
  const [renewDate, setRenewDate] = useState(customer.renewalDate);
  const selCls = 'text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-700 outline-none focus:border-indigo-400 cursor-pointer';
  const kv = (k, v) => React.createElement('div', { className:'flex items-center justify-between gap-3' },
    React.createElement('span', { className:'text-xs text-slate-500 flex-shrink-0' }, k),
    React.createElement('span', { className:'text-xs' }, v)
  );

  return React.createElement(Card, { className:'p-4 ' + className },
    React.createElement(CxLabel, { right: React.createElement('select', { value:currency, onChange:e=>setCurrency(e.target.value), className:selCls },
      React.createElement('option', { value:'usd' }, '$ USD'),
      React.createElement('option', { value:'inr' }, '\u20b9 INR'),
      React.createElement('option', { value:'gbp' }, '\u00a3 GBP')
    ) }, 'Revenue & renewal'),
    React.createElement('div', { className:'flex items-baseline gap-2' },
      React.createElement('p', { className:'text-2xl font-bold text-slate-900 leading-none' }, cxMoney(customer.arr, currency)),
      React.createElement('p', { className:'text-[11px] text-slate-400' }, 'ARR')
    ),
    React.createElement('div', { className:'mt-3 pt-3 border-t border-slate-100 space-y-1.5' },
      kv('Segment', React.createElement('span', { className:'font-semibold text-slate-800 capitalize' }, customer.segment.replace('_',' '))),
      React.createElement('div', { className:'flex items-start justify-between gap-3' },
        React.createElement('span', { className:'text-xs text-slate-500 flex-shrink-0' }, 'Products'),
        React.createElement('div', { className:'flex gap-1 flex-wrap justify-end' },
          (customer.products||[]).map(p=>React.createElement('span',{key:p,className:'px-1.5 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-semibold rounded'},p)))
      ),
      kv('Billing', React.createElement('span', { className:'font-semibold text-green-700' }, 'Current \u00b7 Auto-renew'))
    ),
    React.createElement('div', { className:'mt-3 pt-3 border-t border-slate-100' },
      React.createElement('p', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2' }, 'Renewal'),
      React.createElement('div', { className:'flex items-center justify-between gap-3 mb-1.5' },
        React.createElement('span', { className:'text-xs text-slate-500 flex-shrink-0' }, 'Date'),
        React.createElement('input', { type:'date', value:renewDate, onChange:e=>setRenewDate(e.target.value), className:'text-xs font-semibold text-slate-900 border border-slate-200 rounded-lg px-1.5 py-0.5 outline-none focus:border-indigo-400 cursor-pointer' })
      ),
      renewal
        ? React.createElement('div', { className:'space-y-1.5' },
            kv('Days remaining', React.createElement('span', { className: renewal.daysRemaining < 60 ? 'font-bold text-red-600' : 'font-semibold text-slate-800' }, renewal.daysRemaining + 'd')),
            kv('Contract value', React.createElement('span', { className:'font-semibold text-slate-800' }, cxMoney(renewal.arr, currency))),
            kv('Forecast', React.createElement(CxPill, { tone: ({commit:'green',likely:'green',upside:'blue',at_risk:'red',churn:'red'})[renewal.forecast] || 'amber' }, ({commit:'Commit',likely:'Likely',upside:'Upside',at_risk:'At risk',churn:'Churn'})[renewal.forecast] || renewal.forecast.replace('_',' '))),
            React.createElement('div', { className:'flex items-center justify-between gap-3' },
              React.createElement('span', { className:'text-xs text-slate-500' }, 'Probability'),
              React.createElement('div', { className:'flex items-center gap-2' },
                React.createElement('div', { className:'w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden' },
                  React.createElement('div', { className:`h-full rounded-full ${renewal.probability>=0.7?'bg-green-500':renewal.probability>=0.45?'bg-amber-500':'bg-red-500'}`, style:{ width:(renewal.probability*100)+'%' } })),
                React.createElement('span', { className:'text-xs font-semibold text-slate-800 tabular-nums' }, Math.round(renewal.probability*100)+'%')
              )
            ),
            renewal.riskAmount > 0 && kv('At risk', React.createElement('span', { className:'font-bold text-red-600' }, cxMoney(renewal.riskAmount, currency))),
            kv('Owner', React.createElement('span', { className:'font-semibold text-slate-800' }, (USERS[renewal.ownerId] && USERS[renewal.ownerId].name) || '\u2014')),
            kv('Goal coverage', React.createElement(CxPill, { tone: renewal.goalCoverage ? 'green' : 'amber' }, renewal.goalCoverage ? 'Covered' : 'No goal')),
            renewal.nextStep && React.createElement('div', { className:'pt-2 mt-0.5 border-t border-slate-50' },
              React.createElement('p', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5' }, 'Next step'),
              React.createElement('p', { className:'text-xs text-slate-700 leading-snug' }, renewal.nextStep)
            )
          )
        : React.createElement('p', { className:'text-xs text-slate-400 italic' }, 'No renewal record on file')
    )
  );
}

// Artifacts \u2014 standalone card
function ArtifactsCard({ customer, dispatch, className='' }){
  const artifacts = [
    { icon:'\ud83d\udcc4', name:`${customer.segment.replace('_',' ')} contract \u2014 FY2025`, meta:'PDF \u00b7 Jan 14, 2025' },
    { icon:'\ud83d\udcca', name:'QBR deck \u2014 latest quarter',                             meta:'PPTX \u00b7 Mar 18, 2025' },
    { icon:'\ud83d\udccb', name:'Success plan \u2014 2025',                                   meta:'XLSX \u00b7 Apr 2, 2025' },
  ];
  return React.createElement(Card, { className:'p-4 ' + className },
    React.createElement(CxLabel, null, 'Artifacts'),
    React.createElement('div', { className:'space-y-2.5' },
      artifacts.map(a => React.createElement('div', { key:a.name, className:'flex items-center gap-2.5 min-w-0' },
        React.createElement('div', { className:'w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-sm flex-shrink-0' }, a.icon),
        React.createElement('div', { className:'flex-1 min-w-0' },
          React.createElement('p', { className:'text-xs font-semibold text-slate-800 truncate capitalize' }, a.name),
          React.createElement('p', { className:'text-[10px] text-slate-400' }, a.meta)
        ),
        React.createElement('button', { onClick:()=>dispatch && dispatch({ type:'ADD_TOAST', msg:'Downloading '+a.name, toastType:'info' }), className:'text-slate-300 hover:text-indigo-600 text-sm flex-shrink-0' }, '\u2b07')
      ))
    )
  );
}

// ── SUPPORT TAB (enriched) ──
function SupportTab({ tickets, customer, health, dispatch }){
  const d = getCustomerDetail(customer, health);
  const [lookback, setLookback] = useState('10 tickets');
  const [regen, setRegen] = useState(0);
  const [activeReplay, setActiveReplay] = useState(0);
  const [playing, setPlaying] = useState(false);

  const open = tickets.filter(t=>t.status!=='resolved');
  const bySeverity = {
    critical: tickets.filter(t=>t.severity==='critical' && t.status!=='resolved').length,
    high:     tickets.filter(t=>t.severity==='high'     && t.status!=='resolved').length,
    medium:   tickets.filter(t=>t.severity==='medium'   && t.status!=='resolved').length,
    low:      tickets.filter(t=>t.severity==='low'      && t.status!=='resolved').length,
  };
  const maxSev = Math.max(1, ...Object.values(bySeverity));

  const summaryVariants = [
    `${customer.name} has filed ${tickets.length} ticket${tickets.length===1?'':'s'} in the selected window, clustering around integration reliability and export performance. ${open.length} remain${open.length===1?'s':''} unresolved${bySeverity.critical?`, including ${bySeverity.critical} critical`:''}. Escalation risk reads ${d.escalation}/100 — ${d.escalation>60?'elevated; proactive executive outreach is warranted before renewal':'manageable at current levels'}.`,
    `Ticket themes for ${customer.name} concentrate on authentication and data-pipeline stability. Median first response is holding, but repeat contacts on the same root cause suggest the underlying fix has not landed. With ${open.length} open item${open.length===1?'':'s'} and an escalation score of ${d.escalation}, ${d.escalation>60?'this account should be treated as a support-driven churn risk':'support is not currently the primary risk driver'}.`,
  ];
  const summary = summaryVariants[regen % summaryVariants.length];

  const replays = d.replayTickets.length ? d.replayTickets : [{ id:'sup-000', subject:'No recent sessions', severity:'low', age:0 }];
  const cur = replays[Math.min(activeReplay, replays.length-1)];

  return React.createElement('div', { className:'space-y-5' },
    // AI summary
    React.createElement(CxAIBox, {
      title:'AI summary — support',
      onRegenerate: ()=>setRegen(r=>r+1),
      right: React.createElement('div', { className:'flex items-center gap-2' },
        React.createElement('span', { className:'text-[11px] text-slate-500' }, 'Learning from'),
        React.createElement('select', {
          value:lookback, onChange:e=>setLookback(e.target.value),
          className:'text-[11px] border border-indigo-200 rounded-md px-1.5 py-0.5 bg-white text-slate-700 outline-none cursor-pointer'
        },
          ['10 tickets','25 tickets','Past 1 month','Past 3 months','Past 6 months'].map(o=>React.createElement('option',{key:o,value:o},o))
        )
      )
    }, summary),

    // Metrics
    React.createElement('div', { className:'grid grid-cols-5 gap-4' },
      React.createElement(MetricCard, { label:'NPS', value: (d.nps>0?'+':'') + d.nps, sub: d.nps>=50?'Promoter-led':d.nps>=0?'Mixed':'Detractor-led', subColor: d.nps>=50?'text-green-600':d.nps>=0?'text-amber-600':'text-red-600' }),
      React.createElement(MetricCard, { label:'CSAT', value: d.csat.toFixed(1)+'/5', sub:'Last 30 days' }),
      React.createElement(Card, { className:'p-4' },
        React.createElement('p', { className:'text-xs font-medium text-slate-500 uppercase tracking-wide' }, 'Sentiment'),
        React.createElement('div', { className:'mt-2' },
          React.createElement(CxPill, { tone: d.sentiment==='positive'?'green':d.sentiment==='negative'?'red':'slate', className:'text-xs px-2.5 py-1' },
            d.sentiment.charAt(0).toUpperCase()+d.sentiment.slice(1))
        )
      ),
      React.createElement(MetricCard, { label:'Escalation score', value: d.escalation+'/100', sub: d.escalation>60?'⚠ Elevated':'Within range', subColor: d.escalation>60?'text-red-600':'text-slate-500' }),
      React.createElement(MetricCard, { label:'Unresolved', value: open.length, sub: bySeverity.critical ? `${bySeverity.critical} critical` : 'None critical', subColor: bySeverity.critical?'text-red-600':'text-slate-500' })
    ),

    React.createElement('div', { className:'grid grid-cols-2 gap-5 items-stretch' },
      // Unresolved by priority
      React.createElement(Card, { className:'p-5' },
        React.createElement(CxLabel, null, 'Unresolved tickets by priority'),
        React.createElement(CxBarRow, { label:'Critical', value:bySeverity.critical, max:maxSev, color:'bg-red-500',   labelWidth:'w-20' }),
        React.createElement(CxBarRow, { label:'High',     value:bySeverity.high,     max:maxSev, color:'bg-amber-500', labelWidth:'w-20' }),
        React.createElement(CxBarRow, { label:'Medium',   value:bySeverity.medium,   max:maxSev, color:'bg-slate-400', labelWidth:'w-20' }),
        React.createElement(CxBarRow, { label:'Low',      value:bySeverity.low,      max:maxSev, color:'bg-slate-300', labelWidth:'w-20' })
      ),
      // Rage clicks
      React.createElement(Card, { className:'p-5' },
        React.createElement(CxLabel, { right: React.createElement('span',{className:'text-[11px] text-slate-400'}, d.rageTotal+' total') }, 'Rage clicks'),
        d.rageClicks.map(r => React.createElement(CxBarRow, { key:r.name, label:r.name, value:r.n, max:d.rageClicks[0].n, color:'bg-orange-500', labelWidth:'w-32' }))
      )
    ),

    // Session replay
    React.createElement(Card, { className:'p-5' },
      React.createElement(CxLabel, { right: React.createElement('span',{className:'text-[11px] text-slate-400'}, 'Past '+replays.length+' tickets') }, 'Session replay'),
      React.createElement('div', { className:'flex gap-2 mb-3 overflow-x-auto pb-1' },
        replays.map((t,i)=>React.createElement('button', {
          key:t.id, onClick:()=>{ setActiveReplay(i); setPlaying(false); },
          className:`flex-shrink-0 w-24 h-16 rounded-lg border-2 text-[10px] font-semibold leading-tight flex flex-col items-center justify-center transition-colors ${i===activeReplay ? 'border-indigo-500 bg-slate-900 text-indigo-200' : 'border-slate-200 bg-slate-900/90 text-slate-400 hover:border-slate-300'}`
        },
          React.createElement('span', null, t.id.toUpperCase()),
          React.createElement('span', { className:'opacity-70 capitalize' }, t.severity),
          React.createElement('span', { className:'opacity-50' }, (t.age||0)+'d old')
        ))
      ),
      React.createElement('div', { className:'relative rounded-xl overflow-hidden bg-slate-900 aspect-video cursor-pointer', onClick:()=>setPlaying(p=>!p) },
        React.createElement('div', { className:'absolute inset-0 p-3', style:{ background:'linear-gradient(135deg,#1e293b,#0f172a)' } },
          React.createElement('div', { className:'h-4 bg-white/10 rounded mb-2 flex items-center px-2 gap-1' },
            React.createElement('span',{className:'w-1.5 h-1.5 rounded-full bg-red-400'}),
            React.createElement('span',{className:'w-1.5 h-1.5 rounded-full bg-amber-400'}),
            React.createElement('span',{className:'w-1.5 h-1.5 rounded-full bg-green-400'}),
            React.createElement('div',{className:'flex-1 h-1.5 bg-white/5 rounded ml-2'})
          ),
          React.createElement('div', { className:'grid gap-2', style:{ gridTemplateColumns:'90px 1fr', height:'calc(100% - 24px)' } },
            React.createElement('div', { className:'bg-white/5 rounded' }),
            React.createElement('div', { className:'flex flex-col gap-1.5' },
              React.createElement('div', { className:'bg-white/10 rounded', style:{height:'18px'} }),
              React.createElement('div', { className:'bg-white/10 rounded flex-1' }),
              React.createElement('div', { className:'grid grid-cols-2 gap-1.5', style:{height:'34%'} },
                React.createElement('div', { className:'bg-white/10 rounded' }),
                React.createElement('div', { className:'bg-white/10 rounded' })
              )
            )
          )
        ),
        React.createElement('div', { className:'absolute rounded-full border-2 border-red-500 bg-red-500/40', style:{ width:'22px', height:'22px', top:'44%', right:'28%', animation:'cxRage .8s ease-out infinite' } }),
        React.createElement('div', { className:'absolute inset-0 flex items-center justify-center' },
          React.createElement('div', { className:'w-12 h-12 rounded-full bg-white/15 border border-white/25 backdrop-blur flex items-center justify-center text-white text-lg' }, playing ? '❚❚' : '▶')
        )
      ),
      React.createElement('div', { className:'flex items-center gap-3 bg-slate-900 rounded-b-xl px-3 py-2 -mt-1' },
        React.createElement('button', { onClick:()=>setPlaying(p=>!p), className:'w-6 h-6 rounded-full bg-white/10 text-white text-[10px] flex items-center justify-center hover:bg-white/20' }, playing ? '❚❚' : '▶'),
        React.createElement('div', { className:'flex-1 h-1 bg-white/15 rounded-full' },
          React.createElement('div', { className:'h-1 bg-indigo-400 rounded-full transition-all', style:{ width: playing ? '68%' : '32%' } })
        ),
        React.createElement('span', { className:'text-[10px] font-mono text-white/50' }, playing ? '2:51 / 4:12' : '1:22 / 4:12')
      ),
      React.createElement('p', { className:'text-xs text-slate-500 mt-2' }, `${cur.id.toUpperCase()} — ${cur.subject} · ${cur.severity} · ${(cur.age||0)}d old`)
    ),

    React.createElement('div', { className:'grid grid-cols-2 gap-5 items-stretch' },
      // Recent errors
      React.createElement(Card, { className:'p-5' },
        React.createElement(CxLabel, { right: React.createElement('button',{ onClick:()=>dispatch && dispatch({type:'ADD_TOAST',msg:'Opening error explorer',toastType:'info'}), className:'text-[11px] text-indigo-600 font-semibold hover:underline'}, 'All errors ↗') }, 'Recent errors encountered'),
        React.createElement('div', { className:'space-y-3' },
          d.errors.map(e=>React.createElement('div', { key:e.msg, className:'flex items-start gap-3' },
            React.createElement('div', { className:`w-6 h-6 rounded-md flex items-center justify-center text-[11px] flex-shrink-0 ${e.sev==='critical'?'bg-red-100 text-red-600':e.sev==='high'?'bg-amber-100 text-amber-600':'bg-slate-100 text-slate-500'}` }, '⚠'),
            React.createElement('div', { className:'flex-1 min-w-0' },
              React.createElement('p', { className:'text-xs font-semibold text-slate-800' }, e.msg),
              React.createElement('a', { href:'#', onClick:ev=>{ev.preventDefault(); dispatch && dispatch({type:'ADD_TOAST',msg:'Opening stack trace for '+e.path,toastType:'info'});}, className:'text-[11px] text-indigo-600 underline underline-offset-2 break-all' }, e.path),
              React.createElement('p', { className:'text-[10px] text-slate-400 mt-0.5' }, `${e.count} occurrences · ${e.ago}`)
            ),
            React.createElement(CxPill, { tone: e.sev==='critical'?'red':e.sev==='high'?'amber':'slate' }, e.sev)
          ))
        )
      ),
      // Community
      React.createElement(Card, { className:'p-5' },
        React.createElement(CxLabel, null, 'Community — posts & comments'),
        React.createElement('div', { className:'space-y-3' },
          d.community.map(c=>React.createElement('div', { key:c.title, className:'flex items-start gap-3' },
            React.createElement('div', { className:`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${c.kind==='Initiated'?'bg-indigo-100 text-indigo-600':'bg-slate-100 text-slate-500'}` }, c.kind==='Initiated'?'✍':'💬'),
            React.createElement('div', { className:'flex-1 min-w-0' },
              React.createElement('p', { className:'text-xs font-semibold text-slate-800' },
                React.createElement('span', { className:'text-slate-400 font-normal' }, c.kind+': '), c.title),
              React.createElement('p', { className:'text-[10px] text-slate-400 mt-0.5' },
                `${c.replies} replies · `,
                React.createElement('a', { href:'#', onClick:ev=>{ev.preventDefault(); dispatch && dispatch({type:'ADD_TOAST',msg:'Opening community thread',toastType:'info'});}, className:'text-indigo-600 underline underline-offset-2' }, 'View thread ↗'))
            ),
            React.createElement(CxPill, { tone: c.tag==='Hot'?'red':c.tag==='Active'?'amber':'slate' }, c.tag)
          ))
        )
      )
    ),

    // Ticket table (kept from original)
    React.createElement(Card, { className:'overflow-hidden' },
      React.createElement('div', { className:'px-5 pt-5' }, React.createElement(CxLabel, null, 'All tickets')),
      React.createElement('table', { className:'w-full text-sm' },
        React.createElement('thead', null, React.createElement('tr', { className:'bg-slate-50 border-b' },
          ['ID','Subject','Severity','Status','Age','SLA'].map(h=>React.createElement('th',{key:h,className:'px-4 py-3 text-left text-xs font-medium text-slate-500'},h))
        )),
        React.createElement('tbody', null,
          tickets.length === 0
            ? React.createElement('tr', null, React.createElement('td', { colSpan:6, className:'px-4 py-6 text-center text-slate-400 text-sm' }, 'No tickets for this customer'))
            : tickets.map(t => React.createElement('tr', { key:t.id, className:'border-b hover:bg-slate-50' },
                React.createElement('td', { className:'px-4 py-3 text-slate-500 font-mono text-xs' }, t.id.toUpperCase()),
                React.createElement('td', { className:'px-4 py-3 font-medium' }, t.subject),
                React.createElement('td', { className:'px-4 py-3' }, React.createElement(SeverityBadge, { severity:t.severity })),
                React.createElement('td', { className:'px-4 py-3 capitalize text-slate-600' }, t.status.replace('_',' ')),
                React.createElement('td', { className:'px-4 py-3 text-slate-500' }, t.age + 'd'),
                React.createElement('td', { className:'px-4 py-3' }, React.createElement('span', { className:`text-xs font-medium ${t.sla==='breached'?'text-red-600':t.sla==='at_risk'?'text-amber-600':'text-green-600'}` }, t.sla==='breached'?'⚠ Breached':t.sla==='at_risk'?'⚠ At risk':'✓ On track'))
              ))
        )
      )
    )
  );
}

// ── USAGE TAB (enriched) ──
function UsageTab({ customer, health, dispatch }){
  const d = getCustomerDetail(customer, health);
  const isAcme = customer.id === 'acme';
  const isNorthstar = customer.id === 'northstar';
  const seed = cxHash(customer.id);

  const wauData = isAcme
    ? [75,78,72,74,70,65,55,48,40,35,30,28].map((v,i)=>({week:`W${i+1}`,users:v}))
    : isNorthstar
    ? [52,55,58,62,65,70,72,75,78,82,88,94].map((v,i)=>({week:`W${i+1}`,users:v}))
    : Array.from({length:12},(_,i)=>({week:`W${i+1}`,users: cxInt(cxHash(customer.id+'w'+i), Math.max(10,d.adoption-18), d.adoption+10)}));

  const usageLink = (label) => React.createElement('a', {
    href:'#', onClick:e=>{e.preventDefault(); dispatch && dispatch({type:'ADD_TOAST',msg:'Opening usage data — '+label,toastType:'info'});},
    className:'text-[11px] text-indigo-600 font-semibold underline underline-offset-2 hover:text-indigo-800'
  }, 'Usage data ↗');

  const statCard = (label, value, sub, tone, linkLabel) => React.createElement(Card, { className:'p-4' },
    React.createElement('p', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider' }, label),
    React.createElement('p', { className:'text-base font-bold text-slate-900 mt-1.5' }, value),
    React.createElement('p', { className:'text-[11px] text-slate-500 mt-0.5' }, sub),
    React.createElement('div', { className:'flex items-center justify-between mt-2' },
      React.createElement(CxPill, { tone }, tone==='green'?'↑ Trending up':tone==='red'?'↓ Trending down':'→ Flat'),
      usageLink(label)
    )
  );

  const stickTone = d.stickiness >= 70 ? 'text-green-600' : d.stickiness >= 45 ? 'text-amber-600' : 'text-red-600';
  const stickWord = d.stickiness >= 70 ? 'Sticky' : d.stickiness >= 45 ? 'Moderate' : 'At risk';

  const params = [
    { l:'DAU/MAU',        v:d.dauMau+'%',            pct:d.dauMau,                 c:'bg-indigo-500' },
    { l:'Feature depth',  v:d.featureDepth+'/12',    pct:(d.featureDepth/12)*100,  c:'bg-blue-500' },
    { l:'Session freq',   v:d.sessionsPerWeek+'/wk', pct:Math.min(100,d.sessionsPerWeek*18), c:'bg-purple-500' },
    { l:'Retention 90d',  v:d.retention90+'%',       pct:d.retention90,            c:'bg-green-500' },
    { l:'Drop-off rate',  v:Math.round(100-d.dauMau)+'%', pct:100-d.dauMau,        c:'bg-red-400' },
    { l:'Rage clicks',    v:d.rageTotal,             pct:Math.min(100,d.rageTotal), c:'bg-orange-400' },
  ];

  return React.createElement('div', { className:'space-y-5' },
    // 4 headline usage stats
    React.createElement('div', { className:'grid grid-cols-4 gap-4' },
      statCard('Least clicked', d.leastClicked.name, d.leastClicked.pct + '% adoption', 'red'),
      statCard('Most clicked',  d.mostClicked.name,  d.mostClicked.pct + '% adoption', 'green'),
      statCard('Drop-offs',     d.dropOffs + ' drop-offs', d.topPages[0].name + ' top exit', 'amber'),
      statCard('Rage clicks',   d.rageTotal + ' rage clicks', d.rageClicks[0].name + ' (' + d.rageClicks[0].n + ')', 'amber')
    ),

    // Avg time spent
    React.createElement(Card, { className:'p-5' },
      React.createElement(CxLabel, null, 'Average time spent across the product'),
      React.createElement('div', { className:'flex items-end gap-10 flex-wrap' },
        React.createElement('div', null,
          React.createElement('p', { className:'text-4xl font-bold text-slate-900 leading-none' },
            d.sessionMin, React.createElement('span',{className:'text-lg font-normal text-slate-400'},'m'), ' ',
            d.sessionSec, React.createElement('span',{className:'text-lg font-normal text-slate-400'},'s')),
          React.createElement('p', { className:'text-xs text-slate-500 mt-1.5' }, 'Avg session length')
        ),
        React.createElement('div', { className:'flex gap-8 pb-1' },
          React.createElement('div', null, React.createElement('p',{className:'text-xl font-bold text-slate-800'},d.sessionsPerWeek), React.createElement('p',{className:'text-[11px] text-slate-500'},'Sessions/user/week')),
          React.createElement('div', null, React.createElement('p',{className:'text-xl font-bold text-slate-800'},d.mau), React.createElement('p',{className:'text-[11px] text-slate-500'},'Monthly active users')),
          React.createElement('div', null, React.createElement('p',{className:'text-xl font-bold text-slate-800'},d.dauMau+'%'), React.createElement('p',{className:'text-[11px] text-slate-500'},'DAU/MAU ratio'))
        )
      )
    ),

    // WAU chart (kept from original)
    React.createElement(Card, { className:'p-5' },
      React.createElement(CxLabel, null, 'Weekly active users — last 12 weeks'),
      React.createElement('div', { className:'h-48' },
        React.createElement(ResponsiveContainer, { width:'100%', height:'100%' },
          React.createElement(LineChart, { data:wauData },
            React.createElement(CartesianGrid, { strokeDasharray:'3 3', stroke:'#f1f5f9' }),
            React.createElement(XAxis, { dataKey:'week', tick:{fontSize:11} }),
            React.createElement(YAxis, { tick:{fontSize:11} }),
            React.createElement(Tooltip),
            React.createElement(Line, { type:'monotone', dataKey:'users', stroke: health && health.band==='red' ? '#ef4444' : health && health.band==='green' ? '#22c55e' : '#4f46e5', strokeWidth:2, dot:false })
          )
        )
      )
    ),

    React.createElement('div', { className:'grid grid-cols-2 gap-5 items-stretch' },
      React.createElement(Card, { className:'p-5' },
        React.createElement(CxLabel, { right: usageLink('Top pages') }, 'Top pages visited'),
        d.topPages.map((p,i)=>React.createElement(CxBarRow, {
          key:p.name, label:p.name, value:p.hits, max:d.topPages[0].hits, display:p.hits.toLocaleString(),
          color:['bg-indigo-500','bg-blue-500','bg-purple-500','bg-amber-500','bg-slate-400'][i], labelWidth:'w-32'
        }))
      ),
      React.createElement(Card, { className:'p-5' },
        React.createElement(CxLabel, { right: usageLink('Top features') }, 'Top features used'),
        d.topFeatures.map((f,i)=>React.createElement(CxBarRow, {
          key:f.name, label:f.name, value:f.pct, max:100, display:f.pct+'%',
          color: f.pct>70?'bg-green-500':f.pct>40?'bg-indigo-500':'bg-amber-400', labelWidth:'w-36'
        }))
      )
    ),

    // Stickiness
    React.createElement(Card, { className:'p-5' },
      React.createElement(CxLabel, { right: React.createElement(CxPill,{tone:'blue'},'AI generated') }, 'Stickiness score'),
      React.createElement('div', { className:'grid grid-cols-2 gap-8' },
        React.createElement('div', { className:'flex flex-col items-center justify-center' },
          React.createElement('svg', { width:200, height:120, viewBox:'0 0 200 120' },
            React.createElement('defs', null,
              React.createElement('linearGradient', { id:'cxGauge', x1:'0%', y1:'0%', x2:'100%', y2:'0%' },
                React.createElement('stop', { offset:'0%',   stopColor:'#ef4444' }),
                React.createElement('stop', { offset:'45%',  stopColor:'#f59e0b' }),
                React.createElement('stop', { offset:'100%', stopColor:'#16a34a' })
              )
            ),
            React.createElement('path', { d:'M25,105 A75,75 0 0,1 175,105', fill:'none', stroke:'#f1f5f9', strokeWidth:15, strokeLinecap:'round' }),
            React.createElement('path', { d:'M25,105 A75,75 0 0,1 175,105', fill:'none', stroke:'url(#cxGauge)', strokeWidth:15, strokeLinecap:'round',
              strokeDasharray:236, strokeDashoffset: 236 - (236 * d.stickiness / 100) }),
            React.createElement('text', { x:100, y:92, textAnchor:'middle', fontSize:34, fontWeight:'bold', fill:'#0f172a' }, d.stickiness),
            React.createElement('text', { x:100, y:110, textAnchor:'middle', fontSize:12, fill:'#94a3b8' }, '/100')
          ),
          React.createElement('p', { className:`text-sm font-bold mt-1 ${stickTone}` }, stickWord),
          React.createElement('p', { className:'text-[11px] text-slate-400 mt-1' }, 'Segment benchmark: 68')
        ),
        React.createElement('div', null,
          React.createElement('p', { className:'text-sm text-slate-700 leading-relaxed mb-4' },
            `${customer.name} scores ${d.stickiness}/100 on stickiness. DAU/MAU of ${d.dauMau}% is ${d.dauMau>=60?'above':'below'} the 60% healthy benchmark, and the account touches ${d.featureDepth} of 12 core features. `,
            d.rageTotal > 60 ? `Elevated rage clicks (${d.rageTotal}) on ${d.rageClicks[0].name.toLowerCase()} are suppressing the score — fixing that friction is the fastest lever. ` : `Friction signals are within normal range. `,
            `${d.leastClicked.name} at ${d.leastClicked.pct}% remains the largest untapped retention lever.`),
          React.createElement('div', { className:'grid grid-cols-3 gap-2' },
            params.map(p=>React.createElement('div', { key:p.l, className:'bg-slate-50 rounded-lg p-2.5' },
              React.createElement('p', { className:'text-[9px] font-bold text-slate-400 uppercase tracking-wide' }, p.l),
              React.createElement('p', { className:'text-sm font-bold text-slate-800 mt-0.5' }, p.v),
              React.createElement('div', { className:'h-1 bg-slate-200 rounded-full mt-1.5' },
                React.createElement('div', { className:`h-1 rounded-full ${p.c}`, style:{ width: Math.min(100,p.pct)+'%' } }))
            ))
          )
        )
      )
    )
  );
}

// ── SUCCESS TAB ──
function SuccessTab({ customer, health, contacts, goals, meetings, dispatch, navigate }){
  const d = getCustomerDetail(customer, health);
  const [showGoal, setShowGoal] = useState(false);
  const [gTitle, setGTitle] = useState('');
  const [gType, setGType] = useState('adoption');
  const [gDue, setGDue] = useState('');
  const [gMetric, setGMetric] = useState('');
  const [gTasks, setGTasks] = useState([{ title:'' }]);
  const GOAL_TYPES = [
    { id:'adoption',        label:'Adoption' },
    { id:'risk_mitigation', label:'Risk mitigation' },
    { id:'expansion',       label:'Expansion' },
    { id:'onboarding',      label:'Onboarding' },
    { id:'renewal',         label:'Renewal' },
  ];
  const resetGoal = () => { setGTitle(''); setGType('adoption'); setGDue(''); setGMetric(''); setGTasks([{ title:'' }]); };
  const saveGoal = () => {
    const id = 'g_' + customer.id + '_' + Date.now().toString(36);
    dispatch({ type:'CREATE_GOAL',
      goal:{ id, customerId:customer.id, title:gTitle.trim(),
        description:'Created from the Success tab on ' + customer.name + '.',
        type:gType, ownerId:customer.ownerId || 'maya', startDate:new Date().toISOString().slice(0,10),
        dueDate:gDue || null, status:'not_started', priority:'medium', visibility:'internal',
        publicationStatus:'draft', source:'manual', triggeringSignalId:null,
        successMetric:gMetric.trim(), outcomeNote:null, taskIds:[], riskId:null },
      tasks: gTasks.filter(t=>t.title.trim()).map(t=>({ title:t.title.trim() })) });
    setShowGoal(false); resetGoal();
  };
  const [stratVariant, setStratVariant] = useState(0);
  const [nbaVariant, setNbaVariant] = useState(0);
  const champ = d.champion || contacts[0];
  const seed = cxHash(customer.id);

  const qbrMeetings = (meetings||[]).filter(m=>/qbr|review|business/i.test(m.title||m.subject||''));
  const lastQBR = qbrMeetings[0] || (meetings||[])[0];

  const strategies = [
    [
      { ph:'Phase 1 — Stabilise (next 30 days)', txt:`Close out the open support surface so it stops shadowing every commercial conversation. Confirm a written fix ETA with ${champ ? champ.name : 'the champion'} and remove the single largest friction point in the product.` },
      { ph:'Phase 2 — Prove value (30–60 days)', txt:`Run a working session mapping "${d.objective}" to concrete platform capability. Land ${d.leastClicked.name}, currently at ${d.leastClicked.pct}% — it is the capability most directly tied to their stated objective.` },
      { ph:'Phase 3 — Expand (60–90 days)',      txt:`With adoption evidence in hand, open the expansion conversation ahead of renewal. Anchor it on measured outcomes rather than seat count.` },
    ],
    [
      { ph:'Executive alignment first', txt:`The stated objective — "${d.objective}" — is owned above the day-to-day contacts. Secure a 30-minute executive checkpoint to validate that this is still the priority for the coming quarter.` },
      { ph:'Close the adoption gap',    txt:`${d.featureDepth} of 12 core features are in active use. Target the two features that map directly to the objective and drive them through a structured enablement track.` },
      { ph:'Build the renewal case',    txt:`Assemble a value narrative from usage and support outcomes now, so the renewal conversation is a confirmation rather than a negotiation.` },
    ],
  ];
  const strategy = strategies[stratVariant % strategies.length];

  const nbaSets = [
    [
      { t:`Send a written status and ETA to ${champ ? champ.name : 'the champion'}`, w:'Unanswered issues erode renewal confidence faster than the issues themselves.', owner:'CSM', due:'This week' },
      { t:`Book an enablement session on ${d.leastClicked.name}`, w:`At ${d.leastClicked.pct}% adoption this is the clearest gap against their stated objective.`, owner:'CSM + SE', due:'Next 2 weeks' },
      { t:'Prepare the value narrative for the upcoming business review', w:'Usage and support outcomes should be assembled before the meeting, not during it.', owner:'CSM', due:'Before next QBR' },
    ],
    [
      { t:'Map the current stakeholder set against the buying committee', w:'Coverage gaps at executive level are the most common cause of surprise churn.', owner:'CSM', due:'This week' },
      { t:`Quantify progress against "${d.objective.slice(0,48)}…"`, w:'A measured baseline makes the expansion conversation evidence-led.', owner:'CSM + Analytics', due:'Next 3 weeks' },
      { t:'Review open feature requests with product and close the loop', w:'Customers who see their requests acknowledged renew at materially higher rates.', owner:'CSM + PM', due:'This month' },
    ],
  ];
  const actions = nbaSets[nbaVariant % nbaSets.length];

  const wordColors = ['text-indigo-600','text-blue-600','text-purple-600','text-teal-600','text-amber-600','text-slate-500','text-rose-500','text-green-600'];

  return React.createElement('div', { className:'space-y-5' },
    // Champion
    React.createElement(Card, { className:'p-5' },
      React.createElement('div', { className:'flex items-center gap-4 flex-wrap' },
        React.createElement('div', { className:'w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white flex-shrink-0', style:{ background:'linear-gradient(135deg,#4f46e5,#0ea5e9)' } },
          champ ? champ.name.split(' ').map(n=>n[0]).join('').slice(0,2) : '—'),
        React.createElement('div', { className:'flex-1 min-w-0' },
          React.createElement('p', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider' }, 'Customer champion / executive sponsor'),
          React.createElement('p', { className:'text-lg font-bold text-slate-900 mt-0.5' }, champ ? champ.name : 'No champion identified'),
          React.createElement('p', { className:'text-xs text-slate-500' }, champ ? champ.role : 'Identifying an executive sponsor should be the top priority for this account'),
          champ && React.createElement('div', { className:'flex gap-2 mt-2 flex-wrap' },
            React.createElement(CxPill, { tone:'green' }, champ.role),
            React.createElement(CxPill, { tone: champ.engagement==='high'?'green':champ.engagement==='medium'?'amber':'red' }, champ.engagement + ' engagement'),
            champ.email && React.createElement(CxPill, { tone:'slate' }, champ.email)
          )
        ),
        champ && React.createElement('div', { className:'text-right' },
          React.createElement('p', { className:'text-[11px] text-slate-400' }, 'Last activity'),
          React.createElement('p', { className:'text-sm font-semibold text-slate-800' }, champ.lastActivity)
        )
      )
    ),

    // Business objective
    React.createElement(Card, { className:'p-5' },
      React.createElement(CxLabel, null, 'Key business objective'),
      React.createElement('p', { className:'text-base font-bold text-slate-900 mb-1.5' }, d.objective),
      React.createElement('p', { className:'text-sm text-slate-600 leading-relaxed' },
        `This is the outcome ${customer.name} is measured on internally. Every success motion on this account should ladder back to it — adoption targets, enablement sessions, and the renewal narrative alike.`),
      React.createElement('div', { className:'flex gap-2 mt-3 flex-wrap' },
        (customer.products||[]).map(p=>React.createElement(CxPill,{key:p,tone:'slate'},p)),
        React.createElement(CxPill, { tone:'blue' }, customer.segment.replace('_',' '))
      )
    ),

    React.createElement('div', { className:'grid grid-cols-2 gap-5 items-stretch' },
      // Strategy
      React.createElement(Card, { className:'p-5' },
        React.createElement(CxLabel, { right: React.createElement('div',{className:'flex items-center gap-2'},
          React.createElement(CxPill,{tone:'blue'},'AI generated'),
          React.createElement('button',{ onClick:()=>setStratVariant(v=>v+1), className:'text-[11px] font-semibold text-indigo-600 border border-indigo-200 rounded-md px-2 py-0.5 hover:bg-indigo-50' },'↻')
        ) }, 'Strategy — based on business objective'),
        React.createElement('div', { className:'space-y-3' },
          strategy.map(s=>React.createElement('div', { key:s.ph },
            React.createElement('p', { className:'text-xs font-bold text-slate-800' }, s.ph),
            React.createElement('p', { className:'text-sm text-slate-600 leading-relaxed mt-0.5' }, s.txt)
          ))
        )
      ),
      // Engagement
      React.createElement(Card, { className:'p-5' },
        React.createElement(CxLabel, null, 'Engagement'),
        React.createElement('div', { className:'space-y-3' },
          React.createElement('div', { className:'flex items-start gap-3 pb-3 border-b border-slate-50' },
            React.createElement('div', { className:'w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-sm flex-shrink-0' }, '📊'),
            React.createElement('div', { className:'flex-1 min-w-0' },
              React.createElement('p', { className:'text-sm font-semibold text-slate-800' }, 'Last QBR'),
              React.createElement('p', { className:'text-[11px] text-slate-500' }, lastQBR ? (lastQBR.title || lastQBR.subject) + ' · ' + (lastQBR.date || 'recent') : 'No QBR recorded yet'),
              React.createElement('div', { className:'flex gap-3 mt-1' },
                React.createElement('a', { href:'#', onClick:e=>{e.preventDefault(); dispatch && dispatch({type:'ADD_TOAST',msg:'Opening QBR recording',toastType:'info'});}, className:'text-[11px] text-indigo-600 underline underline-offset-2' }, 'Recording ↗'),
                React.createElement('a', { href:'#', onClick:e=>{e.preventDefault(); navigate && navigate('/drive');}, className:'text-[11px] text-indigo-600 underline underline-offset-2' }, 'Slides ↗')
              )
            ),
            React.createElement(CxPill, { tone: lastQBR ? 'green':'slate' }, lastQBR ? 'Completed' : 'None')
          ),
          React.createElement('div', null,
            React.createElement('p', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2' }, 'QBRs conducted'),
            React.createElement('div', { className:'flex gap-1.5 flex-wrap' },
              ['Q1 2025','Q4 2024','Q3 2024','Q2 2024'].map((q,i)=>React.createElement(CxPill, {
                key:q, tone: (cxHash(customer.id+q) % 5) === 0 ? 'slate' : 'green'
              }, (cxHash(customer.id+q) % 5) === 0 ? q + ' skipped' : q + ' ✓'))
            )
          ),
          React.createElement('div', { className:'pt-3 border-t border-slate-50' },
            React.createElement('p', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2' }, 'Recent interactions'),
            (meetings||[]).length === 0
              ? React.createElement('p', { className:'text-xs text-slate-400' }, 'No meetings logged')
              : React.createElement('div', { className:'space-y-1.5' },
                  (meetings||[]).slice(0,3).map((m,i)=>React.createElement('div', { key:i, className:'flex items-center gap-2 text-xs' },
                    React.createElement('span', { className:'w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0' }),
                    React.createElement('span', { className:'text-slate-700 font-medium truncate flex-1' }, m.title || m.subject),
                    React.createElement('span', { className:'text-slate-400' }, m.date || '')
                  ))
                )
          )
        )
      )
    ),

    // Goals on this account, and the create-goal flow
    React.createElement(Card, { className:'p-5' },
      React.createElement(CxLabel, { right: React.createElement(Btn, { variant:'primary', size:'xs',
        onClick:()=>setShowGoal(true) }, '+ Create goal') }, 'Success plan goals'),
      (goals || []).length === 0
        ? React.createElement('p', { className:'text-sm text-slate-400 italic py-3' },
            'No goals on this account yet. A goal groups the tasks needed to reach one outcome.')
        : React.createElement('div', { className:'space-y-2' },
            (goals || []).map(g => React.createElement('div', { key:g.id,
              onClick:()=>navigate('/goals/' + g.id),
              className:'flex items-center gap-3 border border-slate-200 rounded-lg p-2.5 hover:border-indigo-300 cursor-pointer' },
              React.createElement(StatusBadge, { status:g.status }),
              React.createElement('div', { className:'flex-1 min-w-0' },
                React.createElement('p', { className:'text-sm font-medium text-slate-800 truncate' }, g.title),
                React.createElement('p', { className:'text-[11px] text-slate-400' },
                  (g.taskIds || []).length + ' task' + ((g.taskIds||[]).length===1?'':'s') +
                  (g.dueDate ? ' \u00b7 due ' + new Date(g.dueDate).toLocaleDateString('en-US',{month:'short',day:'numeric'}) : ''))),
              React.createElement('span', { className:'text-slate-300' }, '\u2192')))),

      // Create goal
      showGoal && React.createElement(Modal, { open:true, onClose:()=>{ setShowGoal(false); resetGoal(); }, title:'Create a goal on ' + customer.name },
        React.createElement('div', { className:'space-y-3' },
          React.createElement('p', { className:'text-xs text-slate-500 leading-relaxed' },
            'A goal is a container for the tasks needed to reach one outcome. Add the tasks now, or leave them and add them later from the goal.'),
          React.createElement('div', null,
            React.createElement('label', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider' }, 'Goal title'),
            React.createElement('input', { value:gTitle, onChange:e=>setGTitle(e.target.value), autoFocus:true,
              placeholder:'e.g. Recover adoption in the Finance team',
              className:'w-full mt-1 text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400' })),
          React.createElement('div', { className:'grid grid-cols-3 gap-3' },
            React.createElement('div', null,
              React.createElement('label', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider' }, 'Type'),
              React.createElement('select', { value:gType, onChange:e=>setGType(e.target.value),
                className:'w-full mt-1 text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400' },
                GOAL_TYPES.map(t=>React.createElement('option',{key:t.id,value:t.id},t.label)))),
            React.createElement('div', null,
              React.createElement('label', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider' }, 'Target date'),
              React.createElement('input', { type:'date', value:gDue, onChange:e=>setGDue(e.target.value),
                className:'w-full mt-1 text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400' })),
            React.createElement('div', null,
              React.createElement('label', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider' }, 'From template'),
              React.createElement('select', { className:'w-full mt-1 text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400',
                onChange:e=>{ const v=e.target.value; if(v) setGTitle(v); } },
                React.createElement('option', { value:'' }, 'None'),
                (typeof DRIVE_FILES !== 'undefined' ? DRIVE_FILES.filter(f=>f.kind==='goal') : []).map(f=>
                  React.createElement('option',{key:f.id,value:f.name},f.name))))),
          React.createElement('div', null,
            React.createElement('label', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider' }, 'Success criteria'),
            React.createElement('input', { value:gMetric, onChange:e=>setGMetric(e.target.value),
              placeholder:'How you will know this is done \u2014 e.g. WAU back above 60',
              className:'w-full mt-1 text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400' })),
          React.createElement('div', null,
            React.createElement('div', { className:'flex items-center justify-between mb-1' },
              React.createElement('label', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider' }, 'Tasks'),
              React.createElement('button', { onClick:()=>setGTasks(l=>l.concat({ title:'' })),
                className:'text-[11px] text-indigo-600 hover:underline' }, '+ Add task')),
            React.createElement('div', { className:'space-y-1.5' },
              gTasks.map((t,i)=>React.createElement('div', { key:i, className:'flex gap-2 items-center' },
                React.createElement('span', { className:'w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold flex items-center justify-center flex-shrink-0' }, i+1),
                React.createElement('input', { value:t.title, placeholder:'Task ' + (i+1),
                  onChange:e=>setGTasks(l=>l.map((x,j)=>j===i?{ title:e.target.value }:x)),
                  className:'flex-1 text-sm border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-indigo-400' }),
                gTasks.length > 1 && React.createElement('button', { onClick:()=>setGTasks(l=>l.filter((_,j)=>j!==i)),
                  className:'text-slate-300 hover:text-red-500 text-sm' }, '\u2715'))))),
          React.createElement('div', { className:'flex justify-end gap-2 pt-1' },
            React.createElement(Btn, { variant:'secondary', onClick:()=>{ setShowGoal(false); resetGoal(); } }, 'Cancel'),
            React.createElement(Btn, { variant:'primary', disabled:!gTitle.trim(), onClick:saveGoal }, 'Create goal')))
      )
    ),

    // Next best actions
    React.createElement(Card, { className:'p-5' },
      React.createElement(CxLabel, { right: React.createElement('div',{className:'flex items-center gap-2'},
        React.createElement(CxPill,{tone:'blue'},'AI generated'),
        React.createElement('button',{ onClick:()=>setNbaVariant(v=>v+1), className:'text-[11px] font-semibold text-indigo-600 border border-indigo-200 rounded-md px-2 py-0.5 hover:bg-indigo-50' },'↻')
      ) }, 'Next best actions'),
      React.createElement('div', { className:'space-y-3' },
        actions.map((a,i)=>React.createElement('div', { key:i, className:'flex gap-3 pb-3 border-b border-slate-50 last:border-0 last:pb-0' },
          React.createElement('div', { className:'w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5' }, i+1),
          React.createElement('div', { className:'flex-1' },
            React.createElement('p', { className:'text-sm font-semibold text-slate-800' }, a.t),
            React.createElement('p', { className:'text-xs text-slate-500 mt-0.5 leading-relaxed' }, a.w),
            React.createElement('p', { className:'text-[10px] text-slate-400 mt-1' }, `Owner: ${a.owner} · ${a.due}`)
          ),
          React.createElement(Btn, { variant:'secondary', size:'sm', onClick:()=>dispatch && dispatch({type:'ADD_TOAST',msg:'Task drafted from next best action',toastType:'success'}) }, 'Create task')
        ))
      )
    ),

    React.createElement('div', { className:'grid grid-cols-2 gap-5 items-stretch' },
      // Feature requests
      React.createElement(Card, { className:'p-5' },
        React.createElement(CxLabel, { right: React.createElement('a',{ href:'#', onClick:e=>{e.preventDefault(); dispatch && dispatch({type:'ADD_TOAST',msg:'Opening raw feature request data',toastType:'info'});}, className:'text-[11px] text-indigo-600 font-semibold underline underline-offset-2'},'Raw data ↗') }, 'Feature requests'),
        React.createElement(CxAIBox, { title:'AI summary' },
          `${d.featureRequests.length} open request${d.featureRequests.length===1?'':'s'} from this account. The dominant theme is control and governance — export automation, permissioning, and audit-grade reporting. These map closely to the stated business objective, which makes them unusually good renewal leverage if any ship.`),
        React.createElement('div', { className:'mt-3 space-y-0' },
          d.featureRequests.map(f=>React.createElement('div', { key:f.title, className:'flex items-center justify-between py-2 border-b border-slate-50 last:border-0' },
            React.createElement('p', { className:'text-sm font-medium text-slate-700' }, f.title),
            React.createElement(CxPill, { tone: f.status==='In roadmap'?'green':f.status==='Under review'?'amber':'slate' }, f.status)
          ))
        )
      ),
      React.createElement('div', { className:'flex flex-col gap-5' },
        // Word cloud
        React.createElement(Card, { className:'p-5' },
          React.createElement(CxLabel, null, 'Word cloud — most used terms by customer'),
          React.createElement('div', { className:'flex flex-wrap gap-2 items-center justify-center py-2 min-h-[90px]' },
            d.words.map((w,i)=>React.createElement('span', {
              key:w.w,
              className:`font-bold leading-none ${wordColors[i % wordColors.length]}`,
              style:{ fontSize: w.size + 'px', opacity: 0.55 + (w.size/40) }
            }, w.w))
          )
        ),
        // Emails opened
        React.createElement(Card, { className:'p-5' },
          React.createElement(CxLabel, { right: React.createElement('span',{className:'text-[11px] text-slate-400'},'Last 30 days') }, 'Emails opened by customer'),
          React.createElement('div', { className:'space-y-2.5' },
            d.emails.map(e=>React.createElement('div', { key:e.subj, className:'flex items-center gap-3' },
              React.createElement('div', { className:'w-7 h-7 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold flex items-center justify-center flex-shrink-0' },
                e.to.split(' ').map(n=>n[0]).join('').slice(0,2)),
              React.createElement('div', { className:'flex-1 min-w-0' },
                React.createElement('p', { className:'text-xs font-semibold text-slate-800 truncate' }, e.subj),
                React.createElement('p', { className:'text-[10px] text-slate-400' }, `Opened ${e.opens}× · ${e.when}`),
                React.createElement('div', { className:'h-1 bg-slate-100 rounded-full mt-1' },
                  React.createElement('div', { className:`h-1 rounded-full ${e.rate>70?'bg-green-500':e.rate>40?'bg-amber-500':'bg-red-400'}`, style:{width:e.rate+'%'} }))
              ),
              React.createElement(CxPill, { tone: e.rate>70?'green':e.rate>40?'amber':'red' }, e.rate+'%')
            ))
          )
        )
      )
    )
  );
}

// ── CONTACTS TAB ──
function ContactsTab({ customer, contacts, dispatch }){
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const roleTone = r => /champion/i.test(r) ? 'green' : /sponsor|executive/i.test(r) ? 'blue' : /admin/i.test(r) ? 'purple' : 'slate';
  const engTone  = e => e==='high' ? 'green' : e==='medium' ? 'amber' : e==='none' ? 'slate' : 'red';
  const sentTone = s => s==='positive' ? 'green' : s==='negative' ? 'red' : 'slate';

  const roles = ['all', ...Array.from(new Set(contacts.map(c=>c.role)))];
  const filtered = contacts.filter(c=>{
    const matchQ = !q || c.name.toLowerCase().includes(q.toLowerCase()) || (c.role||'').toLowerCase().includes(q.toLowerCase());
    const matchR = roleFilter==='all' || c.role===roleFilter;
    return matchQ && matchR;
  });

  return React.createElement('div', { className:'space-y-5' },
    React.createElement('div', { className:'flex items-center justify-between gap-3 flex-wrap' },
      React.createElement('div', null,
        React.createElement('p', { className:'text-base font-bold text-slate-900' }, `${contacts.length} contact${contacts.length===1?'':'s'}`),
        React.createElement('p', { className:'text-xs text-slate-500 mt-0.5' }, `${customer.name} · ${customer.domain}`)
      ),
      React.createElement('div', { className:'flex gap-2 flex-wrap' },
        React.createElement('input', {
          value:q, onChange:e=>setQ(e.target.value), placeholder:'Search contacts…',
          className:'text-xs border border-slate-200 rounded-lg px-3 py-1.5 w-48 outline-none focus:border-indigo-400'
        }),
        React.createElement('select', { value:roleFilter, onChange:e=>setRoleFilter(e.target.value), className:'text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white outline-none focus:border-indigo-400 cursor-pointer' },
          roles.map(r=>React.createElement('option',{key:r,value:r}, r==='all'?'All roles':r))
        ),
        React.createElement(Btn, { variant:'primary', size:'sm', onClick:()=>dispatch && dispatch({type:'ADD_TOAST',msg:'Contact form opened',toastType:'info'}) }, '+ Add contact')
      )
    ),

    filtered.length === 0
      ? React.createElement(Card, { className:'p-10 text-center text-slate-400 text-sm' }, 'No contacts match that search')
      : React.createElement('div', { className:'grid grid-cols-3 gap-4' },
          filtered.map(c=>React.createElement(Card, { key:c.id, className:'p-5 hover:shadow-md transition-shadow' },
            React.createElement('div', { className:'flex items-start gap-3 mb-3' },
              React.createElement('div', { className:'w-11 h-11 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center flex-shrink-0' },
                c.name === 'TBD' ? '?' : c.name.split(' ').map(n=>n[0]).join('').slice(0,2)),
              React.createElement('div', { className:'min-w-0' },
                React.createElement('p', { className:'text-sm font-bold text-slate-900 truncate' }, c.name),
                React.createElement('p', { className:'text-[11px] text-slate-500' }, c.role)
              )
            ),
            React.createElement('div', { className:'flex gap-1.5 flex-wrap mb-3' },
              React.createElement(CxPill, { tone:roleTone(c.role) }, c.role),
              React.createElement(CxPill, { tone:engTone(c.engagement) }, c.engagement + ' engagement'),
              React.createElement(CxPill, { tone:sentTone(c.sentiment) }, c.sentiment)
            ),
            React.createElement('div', { className:'space-y-1 text-[11px] text-slate-500' },
              React.createElement('div', { className:'flex items-center gap-1.5' }, '✉ ',
                c.email
                  ? React.createElement('a', { href:'#', onClick:e=>{e.preventDefault(); dispatch && dispatch({type:'ADD_TOAST',msg:'Composing email to '+c.name,toastType:'info'});}, className:'text-indigo-600 underline underline-offset-2 truncate' }, c.email)
                  : React.createElement('span', { className:'text-slate-400 italic' }, 'No email on file')),
              React.createElement('div', { className:'flex items-center gap-1.5' }, '🔗 ',
                React.createElement('a', { href:'#', onClick:e=>{e.preventDefault(); dispatch && dispatch({type:'ADD_TOAST',msg:'Opening LinkedIn profile',toastType:'info'});}, className:'text-blue-600 font-semibold' }, 'LinkedIn ↗')),
              React.createElement('div', null, 'Last activity: ', React.createElement('span',{className:'font-semibold text-slate-700'}, c.lastActivity))
            )
          ))
        )
  );
}

// ── INTELLIGENCE TAB (org chart + news) ──
function IntelligenceTab({ customer, contacts, health, dispatch }){
  const d = getCustomerDetail(customer, health);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [newsFilter, setNewsFilter] = useState('all');

  // Derive an org from real contacts, padded with synthesised leadership
  const classify = (role) => /champion/i.test(role) ? 'champion'
                          : /sponsor|executive/i.test(role) ? 'decision'
                          : /admin|manager|lead/i.test(role) ? 'influencer' : 'user';

  const synthNames = ['Robert Kim','Diana Walsh','Ben Nakamura','Lena Torres','Arjun Kumar','Maya Chen','Priya Sharma','Tom Aldridge'];
  const org = [];
  const seed = cxHash(customer.id);

  org.push({ id:'ceo', name: cxPick(synthNames, seed), title:'Chief Executive Officer', type:'decision', level:1, dept:'Executive', synth:true });

  const realExec = contacts.find(c=>/sponsor|executive/i.test(c.role));
  const realChamp = contacts.find(c=>/champion/i.test(c.role));
  const others = contacts.filter(c=>c!==realExec && c!==realChamp);

  org.push(realExec
    ? { id:realExec.id, name:realExec.name, title:realExec.role, type:'decision', level:2, dept:'Executive', email:realExec.email, engagement:realExec.engagement, sentiment:realExec.sentiment, lastActivity:realExec.lastActivity }
    : { id:'cto', name: cxPick(synthNames, seed*3), title:'Chief Technology Officer', type:'decision', level:2, dept:'Engineering', synth:true });

  org.push(realChamp
    ? { id:realChamp.id, name:realChamp.name, title:realChamp.role, type:'champion', level:2, dept:'Product', email:realChamp.email, engagement:realChamp.engagement, sentiment:realChamp.sentiment, lastActivity:realChamp.lastActivity }
    : { id:'champ', name: cxPick(synthNames, seed*5), title:'VP of Product', type:'champion', level:2, dept:'Product', synth:true });

  org.push({ id:'cfo', name: cxPick(synthNames, seed*7), title:'Chief Financial Officer', type:'influencer', level:2, dept:'Finance', synth:true });

  others.slice(0,3).forEach((c,i)=>org.push({ id:c.id, name:c.name, title:c.role, type:classify(c.role), level:3, dept:'Operations', email:c.email, engagement:c.engagement, sentiment:c.sentiment, lastActivity:c.lastActivity }));
  if (others.length < 2) {
    org.push({ id:'eng', name: cxPick(synthNames, seed*11), title:'Head of Engineering', type:'influencer', level:3, dept:'Engineering', synth:true });
    org.push({ id:'sec', name: cxPick(synthNames, seed*13), title:'Head of Security', type: health && health.band==='red' ? 'blocker' : 'user', level:3, dept:'Security', synth:true });
  }

  const typeMeta = {
    champion:   { label:'★ Champion',      ring:'ring-green-300  border-green-500',  chip:'bg-green-100 text-green-700' },
    decision:   { label:'Decision maker',  ring:'ring-blue-300   border-blue-500',   chip:'bg-blue-100 text-blue-700' },
    influencer: { label:'Influencer',      ring:'ring-purple-300 border-purple-500', chip:'bg-purple-100 text-purple-700' },
    blocker:    { label:'⚠ Blocker',       ring:'ring-red-300    border-red-500',    chip:'bg-red-100 text-red-700' },
    user:       { label:'End user',        ring:'ring-slate-200  border-slate-300',  chip:'bg-slate-100 text-slate-500' },
  };

  const LinkedInSVG = React.createElement('svg', { width:10, height:10, viewBox:'0 0 24 24', fill:'#0A66C2' },
    React.createElement('path', { d:'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' })
  );

  const OrgCard = (p) => {
    const m = typeMeta[p.type];
    const dim = filter !== 'all' && p.type !== filter;
    return React.createElement('div', {
      key:p.id, onClick:()=>setSelected(p),
      className:`w-36 bg-white border-2 rounded-xl p-3 text-center cursor-pointer transition-all hover:shadow-lg ring-2 ${m.ring} ${dim ? 'opacity-25' : 'opacity-100'}`
    },
      React.createElement('div', { className:'w-9 h-9 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center mx-auto mb-1.5' },
        p.name === 'TBD' ? '?' : p.name.split(' ').map(n=>n[0]).join('').slice(0,2)),
      React.createElement('p', { className:'text-[11px] font-bold text-slate-800 leading-tight' }, p.name),
      React.createElement('p', { className:'text-[10px] text-slate-400 leading-tight mt-0.5 mb-1.5' }, p.title),
      React.createElement('span', { className:`inline-block px-1.5 py-0.5 rounded-full text-[9px] font-bold ${m.chip}` }, m.label),
      React.createElement('div', { className:'mt-1.5' },
        React.createElement('a', {
          href:'#', onClick:e=>{ e.preventDefault(); e.stopPropagation(); dispatch && dispatch({type:'ADD_TOAST',msg:'Opening LinkedIn — '+p.name,toastType:'info'}); },
          className:'inline-flex items-center gap-1 text-[9px] font-bold text-[#0A66C2] bg-blue-50 rounded px-1.5 py-0.5'
        }, LinkedInSVG, 'LinkedIn')
      )
    );
  };

  const l1 = org.filter(p=>p.level===1);
  const l2 = org.filter(p=>p.level===2);
  const l3 = org.filter(p=>p.level===3);

  const newsTypes = [
    { id:'all', label:'All news' },
    { id:'funding', label:'💰 Funding' },
    { id:'acquisition', label:'🤝 Acquisition' },
    { id:'merger', label:'🔄 Merger' },
  ];
  const visibleNews = d.news.filter(n=>newsFilter==='all' || n.type===newsFilter);

  return React.createElement('div', { className:'space-y-5' },
    // ORG CHART
    React.createElement(Card, { className:'p-5' },
      React.createElement('div', { className:'flex items-center justify-between mb-5 flex-wrap gap-2' },
        React.createElement('div', null,
          React.createElement('p', { className:'text-sm font-bold text-slate-900' }, 'Org chart — ' + customer.name),
          React.createElement('p', { className:'text-[11px] text-slate-400 mt-0.5' }, 'Reporting structure with buying-role markings · click any card for detail')
        ),
        React.createElement('div', { className:'flex gap-1.5 flex-wrap' },
          [['all','All'],['champion','★ Champion'],['decision','Decision maker'],['influencer','Influencer'],['blocker','Blocker']].map(f=>
            React.createElement('button', {
              key:f[0], onClick:()=>setFilter(f[0]),
              className:`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-colors ${filter===f[0] ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`
            }, f[1]))
        )
      ),
      React.createElement('div', { className:'overflow-x-auto pb-2' },
        React.createElement('div', { className:'flex flex-col items-center gap-0 min-w-[760px]' },
          // Level 1
          React.createElement('div', { className:'flex justify-center' }, l1.map(OrgCard)),
          React.createElement('div', { className:'w-0.5 h-5 bg-slate-200' }),
          React.createElement('div', { className:'h-0.5 bg-slate-200', style:{ width: (l2.length * 160) + 'px' } }),
          // Level 2
          React.createElement('div', { className:'flex justify-center gap-6 items-start' },
            l2.map(p=>React.createElement('div', { key:p.id, className:'flex flex-col items-center' },
              React.createElement('div', { className:'w-0.5 h-5 bg-slate-200' }), OrgCard(p)))
          ),
          l3.length > 0 && React.createElement('div', { className:'w-0.5 h-5 bg-slate-200' }),
          l3.length > 0 && React.createElement('div', { className:'h-0.5 bg-slate-200', style:{ width: (l3.length * 160) + 'px' } }),
          // Level 3
          l3.length > 0 && React.createElement('div', { className:'flex justify-center gap-6 items-start' },
            l3.map(p=>React.createElement('div', { key:p.id, className:'flex flex-col items-center' },
              React.createElement('div', { className:'w-0.5 h-5 bg-slate-200' }), OrgCard(p)))
          )
        )
      ),
      React.createElement('div', { className:'flex flex-wrap gap-4 pt-4 mt-4 border-t border-slate-100' },
        Object.keys(typeMeta).map(k=>React.createElement('div', { key:k, className:'flex items-center gap-1.5 text-[11px] text-slate-500' },
          React.createElement('span', { className:`w-2.5 h-2.5 rounded-full ${typeMeta[k].chip.split(' ')[0]}` }),
          typeMeta[k].label))
      )
    ),

    // Selected person detail
    selected && React.createElement(Card, { className:'p-5' },
      React.createElement('div', { className:'flex items-center gap-3 mb-4' },
        React.createElement('div', { className:'w-11 h-11 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center' },
          selected.name.split(' ').map(n=>n[0]).join('').slice(0,2)),
        React.createElement('div', null,
          React.createElement('p', { className:'text-base font-bold text-slate-900' }, selected.name),
          React.createElement('p', { className:'text-xs text-slate-500' }, selected.title + ' · ' + selected.dept)
        ),
        React.createElement('span', { className:`px-2 py-0.5 rounded-full text-[10px] font-bold ${typeMeta[selected.type].chip}` }, typeMeta[selected.type].label),
        React.createElement('button', { onClick:()=>setSelected(null), className:'ml-auto text-slate-400 hover:text-slate-700 text-xl leading-none' }, '×')
      ),
      React.createElement('div', { className:'grid grid-cols-4 gap-3' },
        [
          ['Email', selected.email || 'Not on file'],
          ['Department', selected.dept],
          ['Engagement', selected.engagement || 'Unknown'],
          ['Last activity', selected.lastActivity || 'No recorded activity'],
        ].map(f=>React.createElement('div', { key:f[0], className:'bg-slate-50 rounded-lg p-3' },
          React.createElement('p', { className:'text-[9px] font-bold text-slate-400 uppercase tracking-wide' }, f[0]),
          React.createElement('p', { className:'text-xs font-semibold text-slate-700 mt-0.5 break-all capitalize' }, f[1])
        ))
      ),
      selected.synth && React.createElement('p', { className:'text-[11px] text-slate-400 mt-3 italic' }, 'Inferred from public company data — not yet verified against CRM.')
    ),

    // NEWS
    React.createElement(Card, { className:'overflow-hidden' },
      React.createElement('div', { className:'flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-wrap gap-2' },
        React.createElement('div', null,
          React.createElement('p', { className:'text-sm font-bold text-slate-900' }, 'Company news'),
          React.createElement('p', { className:'text-[11px] text-slate-400 mt-0.5' }, 'Funding, acquisition and merger activity')
        ),
        React.createElement('div', { className:'flex gap-1.5 flex-wrap' },
          newsTypes.map(t=>React.createElement('button', {
            key:t.id, onClick:()=>setNewsFilter(t.id),
            className:`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-colors ${newsFilter===t.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`
          }, t.label))
        )
      ),
      visibleNews.length === 0
        ? React.createElement('p', { className:'px-5 py-8 text-center text-sm text-slate-400' }, 'No news in this category')
        : React.createElement('div', null,
            visibleNews.map((n,i)=>React.createElement('div', { key:i, className:'px-5 py-4 border-b border-slate-50 last:border-0' },
              React.createElement('div', { className:'flex items-start gap-3' },
                React.createElement('div', { className:'w-9 h-9 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-[10px] font-bold text-slate-500 flex-shrink-0' },
                  n.src.slice(0,3).toUpperCase()),
                React.createElement('div', { className:'flex-1 min-w-0' },
                  React.createElement('p', { className:'text-[11px] text-slate-400 mb-1' },
                    React.createElement('span',{className:'font-bold text-slate-500'},n.src), ' · ', n.when),
                  React.createElement('p', { className:'text-sm font-bold text-slate-900 leading-snug' }, n.title),
                  React.createElement('p', { className:'text-xs text-slate-600 leading-relaxed mt-1' }, n.body),
                  React.createElement('div', { className:'flex gap-1.5 flex-wrap mt-2' },
                    n.tags.map(t=>React.createElement(CxPill,{key:t,tone:'slate'},t)))
                ),
                React.createElement('div', { className:'flex flex-col items-end gap-1.5 flex-shrink-0' },
                  React.createElement(CxPill, { tone: n.impact==='high'?'green':n.impact==='risk'?'red':'slate' },
                    n.impact==='high'?'High impact':n.impact==='risk'?'Watch closely':'Historical'),
                  React.createElement('a', { href:'#', onClick:e=>{e.preventDefault(); dispatch && dispatch({type:'ADD_TOAST',msg:'Opening article at '+n.src,toastType:'info'});}, className:'text-[11px] text-indigo-600 underline underline-offset-2' }, 'Read ↗')
                )
              ),
              n.signal && React.createElement('div', { className:'mt-3 ml-12 bg-green-50 border border-green-100 rounded-lg px-3 py-2 text-xs text-green-800 leading-relaxed' },
                React.createElement('span',{className:'font-bold'},'✦ Account signal: '), n.signal),
              n.risk && React.createElement('div', { className:'mt-3 ml-12 bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-xs text-red-800 leading-relaxed' },
                React.createElement('span',{className:'font-bold'},'⚠ Renewal risk: '), n.risk)
            ))
          )
    )
  );
}


// ============================================================
// CUSTOMER ACTION RUNS — which published Actions have fired on this account
// Deterministic per customer so the record is stable across renders.
// ============================================================
const ACTION_STEP_OUTCOMES = {
  n_slack:   (c)=>`Posted to #cs-alerts with ${c.name} context`,
  n_teams:   (c)=>`Message delivered to the CS channel`,
  n_email:   (c)=>`Email delivered to the account owner`,
  p_email:   (c)=>`Email sent to the primary contact`,
  n_manager: ()=>`Manager notified`,
  n_task:    ()=>`Task created and assigned`,
  n_webhook: ()=>`Webhook accepted (HTTP 200)`,
  c_goal:    ()=>`Goal drafted from template \u2014 awaiting acknowledgement`,
  c_risk:    ()=>`Risk record opened`,
  c_churn:   ()=>`Churn status updated`,
  c_health:  ()=>`Health band updated`,
  c_qbr:     ()=>`QBR scheduling request sent`,
  c_owner:   ()=>`Account owner reassigned`,
  t_escalate:()=>`Ticket escalated to tier 2`,
  t_priority:()=>`Ticket priority updated`,
  t_status:  ()=>`Ticket status updated`,
  t_assign:  ()=>`Ticket reassigned`,
  t_note:    ()=>`Private note added to the ticket`,
  p_engage:  ()=>`Engagement level updated`,
  p_role:    ()=>`Buying role updated`,
  p_flag:    ()=>`Champion departure flagged`,
};

// Curated history for the flagship red account so the story is coherent
const ACME_ACTION_RUNS = [
  { actionSourceId:'a4', when:'Aug 14, 2025 \u00b7 06:12', ago:'3 days ago', trigger:'Health band changed to Red',
    status:'completed', steps:[
      { id:'c_goal',   note:'Created goal "Adoption recovery \u2014 Acme Analytics" from template' },
      { id:'n_manager',note:'Notified Priya Raman (CS Manager)' },
      { id:'n_slack',  note:'Posted to #cs-health with ARR $240K and 74-day renewal flagged' },
    ]},
  { actionSourceId:'a6', when:'Aug 12, 2025 \u00b7 21:40', ago:'5 days ago', trigger:'Sentiment changed to Negative',
    status:'completed', steps:[
      { id:'n_slack', note:'Posted to #cs-alerts \u2014 3 consecutive negative ticket replies detected' },
      { id:'c_churn', note:'Churn status set to "Likely to churn"' },
    ]},
  { actionSourceId:'a5', when:'Aug 09, 2025 \u00b7 14:05', ago:'8 days ago', trigger:'Adoption score dropped below 60',
    status:'completed', steps:[
      { id:'c_goal', note:'Drafted goal "Pre-renewal adoption push"' },
      { id:'n_task', note:'Task created: Book enablement session with James Mok' },
    ]},
  { actionSourceId:'a6', when:'Aug 02, 2025 \u00b7 09:18', ago:'2 weeks ago', trigger:'Sentiment changed to Negative',
    status:'suppressed', suppressedReason:'Cooldown \u2014 same action fired 4 days earlier', steps:[] },
  { actionSourceId:'a4', when:'Jul 21, 2025 \u00b7 11:02', ago:'4 weeks ago', trigger:'Health band changed to Red',
    status:'completed', steps:[
      { id:'n_slack',  note:'Posted to #cs-health' },
      { id:'n_manager',note:'Manager notified' },
    ]},
];

// Build the run history for any customer
function getCustomerActionRuns(customer, health, actions){
  const lib = (actions || []).filter(a => a.pillar === 'customer');
  if (!lib.length) return [];

  if (customer.id === 'acme') {
    return ACME_ACTION_RUNS.map((r, i) => {
      const act = lib.find(a => a.sourceId === r.actionSourceId) || lib[i % lib.length];
      return Object.assign({}, r, { id:'run_acme_'+i, action:act,
        steps: r.steps.map(st => Object.assign({}, st, { meta: actionMeta(st.id) })) });
    });
  }

  // Everyone else: seeded from customer id + health band, so red accounts show more activity
  const s = cxHash(customer.id);
  const band = health ? health.band : 'yellow';
  const count = band === 'red' ? cxInt(s, 3, 5) : band === 'yellow' ? cxInt(s, 1, 3) : cxInt(s, 0, 2);
  if (count === 0) return [];

  const whenPool = ['Aug 15, 2025 \u00b7 08:30','Aug 11, 2025 \u00b7 16:22','Aug 04, 2025 \u00b7 10:47',
                    'Jul 28, 2025 \u00b7 13:15','Jul 19, 2025 \u00b7 09:03'];
  const agoPool   = ['2 days ago','6 days ago','13 days ago','3 weeks ago','4 weeks ago'];

  return Array.from({ length: count }, (_, i) => {
    const act = lib[(s + i) % lib.length];
    const f = fieldMeta('customer', act.event.field);
    const suppressed = i > 0 && ((s + i) % 7 === 0);
    return {
      id: 'run_' + customer.id + '_' + i,
      action: act,
      when: whenPool[i % whenPool.length],
      ago: agoPool[i % agoPool.length],
      trigger: `${f ? f.label : act.event.field} ${modeLabel(act.event.mode)}${act.event.to ? ' ' + act.event.to : ''}`,
      status: suppressed ? 'suppressed' : 'completed',
      suppressedReason: suppressed ? 'Cooldown \u2014 same action fired recently' : null,
      steps: suppressed ? [] : act.steps.map(st => ({
        id: st.id, meta: actionMeta(st.id),
        note: (ACTION_STEP_OUTCOMES[st.id] || (()=> (actionMeta(st.id)||{}).label || 'Step executed'))(customer),
      })),
    };
  });
}

// ── Customer 360 → Actions tab ──
function CustomerActionsTab({ customer, health, state, dispatch, navigate }){
  const runs = getCustomerActionRuns(customer, health, state.actions);
  const [openRun, setOpenRun] = useState(null);
  const [filter, setFilter] = useState('all');

  const applied = [];
  runs.forEach(r => { if (!applied.some(a => a.id === r.action.id)) applied.push(r.action); });
  const shown = filter === 'all' ? runs : runs.filter(r => r.action.id === filter);
  const totalSteps = runs.reduce((n,r)=>n+r.steps.length, 0);
  const suppressed = runs.filter(r=>r.status === 'suppressed').length;

  if (runs.length === 0) {
    return React.createElement(Card, { className:'p-12 text-center' },
      React.createElement('p', { className:'text-3xl mb-2' }, '\u26A1'),
      React.createElement('p', { className:'text-sm text-slate-500' }, 'No actions have run on this account yet'),
      React.createElement('p', { className:'text-xs text-slate-400 mt-1' }, 'Published actions run automatically when their trigger conditions are met'),
      React.createElement('div', { className:'mt-3' },
        React.createElement(Btn, { variant:'secondary', size:'xs', onClick:()=>navigate('/actions') }, 'View the action library'))
    );
  }

  return React.createElement('div', { className:'space-y-4' },

    React.createElement('div', { className:'grid grid-cols-4 gap-4' },
      React.createElement(MetricCard, { label:'Actions applied', value:applied.length, sub:'distinct actions' }),
      React.createElement(MetricCard, { label:'Total runs', value:runs.length, sub:'on this account' }),
      React.createElement(MetricCard, { label:'Activities performed', value:totalSteps, sub:'individual steps' }),
      React.createElement(MetricCard, { label:'Suppressed', value:suppressed, sub: suppressed ? 'cooldown blocked' : 'none blocked',
        subColor: suppressed ? 'text-amber-600' : 'text-slate-500' })
    ),

    // Which actions are applied to this account
    React.createElement(Card, { className:'p-4' },
      React.createElement(CxLabel, { right:React.createElement('button', { onClick:()=>navigate('/actions'),
        className:'text-[11px] text-indigo-600 hover:underline' }, 'Action library \u2192') }, 'Actions applied to this account'),
      React.createElement('div', { className:'space-y-2' },
        applied.map(a => {
          const n = runs.filter(r=>r.action.id===a.id).length;
          const comms = a.steps.filter(s=>s.editable).length;
          return React.createElement('div', { key:a.id, className:'flex items-center gap-3 border border-slate-200 rounded-lg p-2.5' },
            React.createElement('span', { className:'w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-sm flex-shrink-0' }, '\u26A1'),
            React.createElement('div', { className:'flex-1 min-w-0' },
              React.createElement('p', { className:'text-sm font-semibold text-slate-800' }, a.name),
              React.createElement('p', { className:'text-[11px] text-slate-500' },
                a.steps.length + ' step' + (a.steps.length===1?'':'s') +
                (comms ? ' \u00b7 ' + comms + ' editable message' + (comms===1?'':'s') : '') +
                ' \u00b7 fired ' + n + '\u00d7 here')
            ),
            React.createElement(CxPill, { tone:a.enabled?'green':'slate' }, a.enabled?'Active':'Paused'),
            React.createElement(Btn, { variant:'secondary', size:'xs', onClick:()=>navigate('/actions') }, 'View')
          );
        })
      )
    ),

    // Activity log
    React.createElement(Card, { className:'p-4' },
      React.createElement(CxLabel, { right: React.createElement('select', {
        value:filter, onChange:e=>setFilter(e.target.value),
        className:'text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white outline-none focus:border-indigo-400'
      }, React.createElement('option',{value:'all'},'All actions'),
         applied.map(a=>React.createElement('option',{key:a.id,value:a.id},a.name))) }, 'Activity performed'),

      React.createElement('div', { className:'space-y-3' },
        shown.map((r, idx) => {
          const open = openRun === r.id;
          const isSup = r.status === 'suppressed';
          return React.createElement('div', { key:r.id, className:'flex gap-3' },
            React.createElement('div', { className:'flex flex-col items-center flex-shrink-0' },
              React.createElement('span', { className:`w-7 h-7 rounded-full flex items-center justify-center text-xs ${isSup?'bg-slate-100 text-slate-400':'bg-indigo-100 text-indigo-600'}` }, isSup ? '\u23F8' : '\u26A1'),
              idx < shown.length-1 && React.createElement('span', { className:'w-px flex-1 bg-slate-200 mt-1' })
            ),
            React.createElement('div', { className:'flex-1 min-w-0 pb-3' },
              React.createElement('div', { className:'flex items-center gap-2 flex-wrap' },
                React.createElement('p', { className:'text-sm font-semibold text-slate-800' }, r.action.name),
                React.createElement(CxPill, { tone:isSup?'slate':'green' }, isSup ? 'Suppressed' : 'Completed'),
                React.createElement('span', { className:'text-[11px] text-slate-400' }, r.when + ' \u00b7 ' + r.ago)
              ),
              React.createElement('p', { className:'text-xs text-slate-500 mt-0.5' },
                React.createElement('span', { className:'font-semibold text-slate-600' }, 'Triggered by: '), r.trigger),
              isSup
                ? React.createElement('p', { className:'text-xs text-amber-600 mt-1' }, '\u23F8 ' + r.suppressedReason)
                : React.createElement(React.Fragment, null,
                    React.createElement('button', { onClick:()=>setOpenRun(open?null:r.id),
                      className:'text-[11px] text-indigo-600 hover:underline mt-1' },
                      (open?'Hide ':'Show ') + r.steps.length + ' activit' + (r.steps.length===1?'y':'ies')),
                    open && React.createElement('div', { className:'mt-2 space-y-1.5 bg-slate-50 rounded-lg p-2.5' },
                      r.steps.map((st,i)=>React.createElement('div', { key:i, className:'flex items-start gap-2.5' },
                        React.createElement('span', { className:'w-5 h-5 rounded-md bg-white border border-slate-200 flex items-center justify-center text-[10px] flex-shrink-0' },
                          st.meta ? st.meta.icon : '\u2713'),
                        React.createElement('div', { className:'flex-1 min-w-0' },
                          React.createElement('p', { className:'text-xs font-semibold text-slate-700' }, st.meta ? st.meta.label : st.id),
                          React.createElement('p', { className:'text-[11px] text-slate-500' }, st.note)),
                        React.createElement('span', { className:'text-green-500 text-xs flex-shrink-0' }, '\u2713')
                      ))
                    )
                  )
            )
          );
        })
      )
    )
  );
}


// ============================================================
// INTERACTIONS & ACCOUNT AUDIT
// ============================================================

// Seeded audit entries so the timeline has history on day one

// Meetings + emails become touchpoints; goals/risks/health/attribute edits are account activity
function getAccountActivity(customer, goals, risks, attrChanges){
  const out = [];
  const h = HEALTH_SIGNALS[customer.healthId];
  if (h) out.push({ at:'2025-08-16T09:00:00', kind:'health', icon:'\u2665', tone:'blue',
    title:'Health score computed: ' + h.compositeScore, detail:'Band ' + h.band + (h.previousBand ? ' (was ' + h.previousBand + ')' : '') });
  (risks||[]).forEach(r => out.push({ at:r.createdAt, kind:'risk', icon:'\u26A0', tone:'red',
    title:'Risk opened: ' + r.title, detail: r.amountAtRisk ? formatARR(r.amountAtRisk) + ' at risk' : null }));
  (goals||[]).forEach(g => out.push({ at:g.startDate||g.dueDate, kind:'goal', icon:'\u25CE', tone:'purple',
    title:'Goal ' + String(g.status).replace('_',' ') + ': ' + g.title, detail:null }));
  (attrChanges||[]).filter(c=>c.customerId===customer.id).forEach(c => {
    const m = ATTR_LABELS[c.field] || { label:c.field, values:{} };
    out.push({ at:c.at, kind:'attribute', icon:'\u270E', tone:'amber',
      title:m.label + ' changed: ' + (m.values[c.from]||c.from) + ' \u2192 ' + (m.values[c.to]||c.to),
      detail:c.reason, by:c.by, isReason:true });
  });
  return out.filter(e=>e.at).sort((a,b)=>new Date(b.at)-new Date(a.at));
}

function getTouchpoints(customer, emails, meetings){
  const out = [];
  // Ticket conversations are customer touchpoints too, so surface the inbound
  // and outbound messages from every ticket raised by this account.
  const TK = (typeof TICKETS !== 'undefined') ? TICKETS : [];
  TK.filter(function(t){ return t.customerId === customer.id; }).forEach(function(t){
    const acts = (typeof getTicketActivity === 'function' ? getTicketActivity(t, customer) : [])
      .filter(function(a){ return a.kind === 'interaction'; });
    acts.forEach(function(a, i){
      const d = new Date('2025-08-17T09:00:00');
      d.setDate(d.getDate() - Math.max(0, (t.age || 3) - i));
      out.push({
        at: d.toISOString(), kind:'ticket',
        icon: a.dir === 'inbound' ? '\u{1F3AB}' : '\u21A9',
        tone: a.dir === 'inbound' ? 'red' : 'blue',
        title: a.dir === 'inbound' ? ('Ticket message from ' + a.who) : ('Agent replied on ' + t.id.toUpperCase()),
        detail: a.dir === 'inbound' ? t.subject : a.body,
        meta: a.at + ' \u00b7 ' + t.id.toUpperCase(),
        ticketId: t.id, direction: a.dir
      });
    });
  });
  (emails||[]).filter(e=>e.customerId===customer.id).forEach(e => out.push({
    at:e.receivedIso || '2025-08-17T08:12:00', kind:'email', icon:'\u2709', tone:'purple',
    title:'Email received from ' + e.from, detail:e.subject, meta:e.received, emailId:e.id,
    direction:'inbound' }));
  (meetings||[]).forEach(m => out.push({
    at:(m.date||'') + 'T10:00:00', kind:'meeting', icon:'\u{1F4C5}', tone:'blue',
    title:(m.type === 'QBR' ? 'QBR' : 'Meeting') + ' ' + (m.status==='completed'?'held':'scheduled') + ': ' + m.title,
    detail:(m.participants||[]).slice(0,3).join(', ') || null, meta:m.date, direction:'meeting' }));
  return out.filter(e=>e.at && !isNaN(new Date(e.at))).sort((a,b)=>new Date(b.at)-new Date(a.at));
}

const fmtWhen = (iso) => { const d = new Date(iso);
  return isNaN(d) ? String(iso) : d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) +
    ' \u00b7 ' + d.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'}); };

// ── Reason-for-change modal ──
function AttrReasonModal({ open, field, from, to, onCancel, onConfirm }){
  const [reason, setReason] = useState('');
  if (!open) return null;
  const m = ATTR_LABELS[field] || { label:field, values:{} };
  const MIN = 15;
  const ok = reason.trim().length >= MIN;

  return React.createElement(Modal, { open:true, onClose:onCancel, title:'Reason for change required' },
    React.createElement('div', { className:'space-y-3' },
      React.createElement('div', { className:'flex items-center gap-2 flex-wrap bg-slate-50 rounded-lg px-3 py-2' },
        React.createElement('span', { className:'text-xs font-semibold text-slate-600' }, m.label),
        React.createElement(CxPill, { tone:'slate' }, m.values[from] || from),
        React.createElement('span', { className:'text-slate-400' }, '\u2192'),
        React.createElement(CxPill, { tone:'blue' }, m.values[to] || to)
      ),
      React.createElement('p', { className:'text-xs text-slate-500 leading-relaxed' },
        'This field drives forecasting and reporting, so the change is recorded in the account timeline with your name against it. Explain what prompted it.'),
      React.createElement('div', null,
        React.createElement('label', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider' }, 'Reason'),
        React.createElement('textarea', { value:reason, onChange:e=>setReason(e.target.value), rows:4, autoFocus:true,
          placeholder:'e.g. Sponsor confirmed budget was cut for next year and asked about exit terms.',
          className:'w-full mt-1 text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 resize-y' }),
        React.createElement('p', { className:`text-[11px] mt-1 ${ok?'text-slate-400':'text-amber-600'}` },
          ok ? reason.trim().length + ' characters' : 'At least ' + MIN + ' characters \u2014 ' + reason.trim().length + ' so far')
      ),
      React.createElement('div', { className:'flex justify-end gap-2 pt-1' },
        React.createElement(Btn, { variant:'secondary', onClick:onCancel }, 'Cancel'),
        React.createElement(Btn, { variant:'primary', disabled:!ok, onClick:()=>onConfirm(reason.trim()) }, 'Save change')
      )
    )
  );
}

// ── Customer 360 \u203a Interactions ──
function InteractionsTab({ customer, state, dispatch, navigate, meetings }){
  const [filter, setFilter] = useState('all');
  const [openId, setOpenId] = useState(null);
  const emails = (state.emails || []).filter(e => e.customerId === customer.id);
  const open = openId ? emails.find(e=>e.id===openId) : null;

  if (open) return React.createElement(EmailDetail, { email:open, onBack:()=>setOpenId(null), dispatch, navigate, customers:state.customers });

  const points = getTouchpoints(customer, state.emails, meetings);
  const shown = filter === 'all' ? points : points.filter(p=>p.kind===filter);
  const emailCount = points.filter(p=>p.kind==='email').length;
  const meetingCount = points.filter(p=>p.kind==='meeting').length;

  return React.createElement('div', { className:'space-y-4' },
    React.createElement('div', { className:'grid grid-cols-3 gap-4' },
      React.createElement(MetricCard, { label:'Emails from customer', value:emailCount, sub: emailCount ? 'most recent ' + (points.find(p=>p.kind==='email')||{}).meta : 'none received' }),
      React.createElement(MetricCard, { label:'Meetings', value:meetingCount, sub:'QBRs and calls' }),
      React.createElement(MetricCard, { label:'Total touchpoints', value:points.length, sub:'logged to the timeline' })
    ),

    React.createElement('div', { className:'flex items-center gap-3 flex-wrap' },
      React.createElement('div', { className:'flex gap-1 bg-white border border-slate-200 rounded-lg p-1' },
        [['all','All'],['email','Emails'],['ticket','Ticket messages'],['meeting','Meetings']].map(f =>
          React.createElement('button', { key:f[0], onClick:()=>setFilter(f[0]),
            className:`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${filter===f[0]?'bg-indigo-600 text-white':'text-slate-600 hover:bg-slate-100'}` }, f[1]))),
      React.createElement('span', { className:'text-xs text-slate-400 ml-auto' }, 'Every interaction here is also written to the account timeline')
    ),

    shown.length === 0
      ? React.createElement(Card, { className:'p-12 text-center' },
          React.createElement('p', { className:'text-3xl mb-2' }, '\u2709'),
          React.createElement('p', { className:'text-sm text-slate-500' }, 'No interactions recorded for this account yet'))
      : React.createElement(Card, { className:'overflow-hidden' },
          shown.map((p,i) => React.createElement('div', { key:i,
            onClick:()=>{ if(p.emailId) setOpenId(p.emailId); },
            className:`px-4 py-3 border-b border-slate-50 last:border-0 flex items-start gap-3 ${p.emailId?'cursor-pointer hover:bg-slate-50':''}` },
            React.createElement('span', { className:`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${ADMIN_TONES[p.tone]}` }, p.icon),
            React.createElement('div', { className:'flex-1 min-w-0' },
              React.createElement('p', { className:'text-sm font-semibold text-slate-800' }, p.title),
              p.detail && React.createElement('p', { className:'text-xs text-slate-500 mt-0.5 truncate' }, p.detail),
              React.createElement('p', { className:'text-[11px] text-slate-400 mt-0.5' }, p.meta || fmtWhen(p.at))),
            React.createElement(CxPill, { tone: p.kind==='email'?'purple':p.kind==='ticket'?'red':'blue' }, p.kind),
            p.emailId && React.createElement('span', { className:'text-slate-300 flex-shrink-0' }, '\u2192')
          ))
        )
  );
}

// ============================================================
// TRANSCRIPTS TAB
// Deterministic per-customer call transcripts + AI highlights.
// Seeded from the customer id, so the same account always shows
// the same calls. Real completed meetings are used where they exist.
// ============================================================

function txDate(daysAgo){
  const d = new Date('2024-07-24T00:00:00Z');
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d.toISOString().split('T')[0];
}
function txClock(startMin, offsetSec){
  const total = startMin * 60 + offsetSec;
  return Math.floor(total / 60) + ':' + String(total % 60).padStart(2, '0');
}
function txLines(pairs){
  // pairs: [speakerKey, text] -> adds running timestamps
  let t = 0;
  return pairs.map(([who, text], i) => {
    const line = { who, text, at: txClock(Math.floor(t / 60), t % 60) };
    t += 45 + ((text.length + i * 7) % 90);
    return line;
  });
}

// One script per call type. ctx = { name, csm, contact, role, arr, days }
const TX_SCRIPTS = {
  'Escalation': ctx => ({
    sentiment: 'negative',
    summary: `${ctx.contact} opened with frustration about the open issue and the time it has taken to get a fix date. ${ctx.csm} committed to a written timeline and a daily update until it is closed.`,
    keyMoments: [
      { line:0, text:`${ctx.contact} says the team has lost confidence in the data` },
      { line:3, text:'Agreement on daily updates and a written fix date' },
      { line:6, text:'Business impact quantified for the first time on a call' },
    ],
    risks: ['Trust damage with the day to day users', 'Issue is now visible to the executive team'],
    actions: [
      { text:'Send written fix timeline by end of day', owner:'csm', status:'done' },
      { text:'Set up daily status email until resolution', owner:'csm', status:'done' },
      { text:`Confirm business impact numbers with ${ctx.contact}`, owner:'customer', status:'open' },
    ],
    lines: txLines([
      ['contact', `Thanks for making time. I will be straight with you, the team is losing patience. This has been open long enough that people have gone back to the old reports.`],
      ['csm', `That is fair and I am not going to defend the timeline. Let me tell you what I know and what I am still chasing.`],
      ['contact', `What I need is a date. Not a status, a date. I have to tell my leadership something on Thursday.`],
      ['csm', `Understood. Engineering has the root cause identified. I will have a written fix date to you by end of day today, and I will send a short status every morning until it is closed.`],
      ['contact', `Okay. And I want to understand how this got missed for as long as it did.`],
      ['csm', `Reasonable. I will include that in the write up. Can I ask what the impact has looked like on your side, in numbers? It helps me push internally.`],
      ['contact', `Roughly a third of the team stopped using it. Two of my analysts are back in spreadsheets.`],
      ['csm', `That is exactly what I needed. I will get that in front of the right people today.`],
      ['contact', `Appreciated. Let us talk again Thursday once you have the date.`],
    ]),
  }),
  'Exec sync': ctx => ({
    sentiment: 'neutral',
    summary: `Executive level review of the account. The sponsor asked for a clear view of value delivered to date before the renewal conversation opens. ${ctx.csm} agreed to bring a one page summary to the next session.`,
    keyMoments: [
      { line:0, text:'Sponsor sets the agenda around value, not features' },
      { line:2, text:'Budget cycle moves up a quarter this year' },
      { line:6, text:'Request for a one page value summary' },
    ],
    risks: ['Value story is not yet documented', 'Budget review happens before our renewal date'],
    actions: [
      { text:'Build one page value summary', owner:'csm', status:'open' },
      { text:'Share renewal timeline with procurement', owner:'customer', status:'open' },
    ],
    lines: txLines([
      ['contact', `I have thirty minutes. I would rather spend it on outcomes than on the product roadmap.`],
      ['csm', `That works for me. Let me start with what has changed since we last spoke.`],
      ['contact', `Before you do, one thing you should know. Our budget review moves up this year. Decisions get made a quarter earlier than they used to.`],
      ['csm', `That is useful. It means we should have the value conversation now rather than closer to the date.`],
      ['contact', `Agreed. And I will be honest, I cannot repeat back to my CFO what we get from this today. That is a gap on my side as much as yours.`],
      ['csm', `Let me fix that. I will put together a single page. What we set out to do, what has actually happened, and what it is worth. No product detail.`],
      ['contact', `If you can do that, bring it to the next session and I will take it into the review myself.`],
      ['csm', `Done. I will have it to you before then so you can push back on anything that does not ring true.`],
    ]),
  }),
  'Check-in': ctx => ({
    sentiment: 'neutral',
    summary: `Routine working session. Mostly operational. A few smaller asks came up around reporting and user access, nothing that changes the shape of the account.`,
    keyMoments: [
      { line:1, text:'Request for scheduled reports to a wider group' },
      { line:3, text:'New starters need access next month' },
    ],
    risks: ['Onboarding of new users is unplanned'],
    actions: [
      { text:'Share scheduled report setup guide', owner:'csm', status:'done' },
      { text:'Confirm seat count for new starters', owner:'customer', status:'open' },
    ],
    lines: txLines([
      ['csm', `Nothing dramatic from my side this week. How are things looking with you?`],
      ['contact', `Steady. The team is using it. One thing, can we get the weekly report going out to a wider group automatically?`],
      ['csm', `Yes, that is a scheduled report. I will send you the setup so you can control who is on it.`],
      ['contact', `Good. Also we have a few people joining next month and they will need access.`],
      ['csm', `How many roughly? I want to make sure we are not going to bump into the seat count.`],
      ['contact', `Four, maybe five. I will confirm once the offers are signed.`],
      ['csm', `Let me know and I will check where we land. Better to sort it before they start than after.`],
    ]),
  }),
  'Adoption review': ctx => ({
    sentiment: 'neutral',
    summary: `Reviewed usage across the team. Core reporting is well used, the more advanced capability is not. The blocker is training time rather than any product gap.`,
    keyMoments: [
      { line:1, text:'Core reporting confirmed as embedded in the weekly routine' },
      { line:3, text:'Advanced features unused, cited as a training issue' },
      { line:4, text:'Agreement to run a short enablement session' },
    ],
    risks: ['Paid capability sitting unused', 'No internal owner for training'],
    actions: [
      { text:'Schedule a 60 minute enablement session', owner:'csm', status:'open' },
      { text:'Nominate an internal champion for training', owner:'customer', status:'open' },
    ],
    lines: txLines([
      ['csm', `I pulled the usage before this call. The headline is that the core reporting is genuinely embedded, people are in it every week.`],
      ['contact', `That matches what I see. It has become part of the Monday routine.`],
      ['csm', `Where it drops off is everything past that. The more advanced pieces are barely touched. I wanted to understand why before I assume anything.`],
      ['contact', `Honestly, nobody has had the time to learn them. It is not that they do not work, it is that we never sat down and got taught.`],
      ['csm', `That I can solve. Give me an hour with the team and I will walk them through the two or three things that would actually save them time.`],
      ['contact', `That would land well. Can you do it in a way that is specific to how we work rather than generic?`],
      ['csm', `Yes, I will build it around your own reports. One ask back, can you nominate someone internally to keep it going after the session?`],
      ['contact', `I have someone in mind. Let me talk to her first.`],
    ]),
  }),
  'Renewal planning': ctx => ({
    sentiment: 'neutral',
    summary: `Opened the renewal conversation early. Commercial terms were not discussed in detail. The customer flagged that procurement will want a competitive comparison this time around.`,
    keyMoments: [
      { line:1, text:'Renewal process starts ninety days out' },
      { line:3, text:'Procurement will request a comparison, but nobody wants to move' },
      { line:5, text:'Usage and value evidence is what carries weight internally' },
    ],
    risks: ['Procurement led competitive review', 'Decision maker may change before the date'],
    actions: [
      { text:'Prepare renewal pack with usage evidence', owner:'csm', status:'open' },
      { text:'Introduce procurement contact', owner:'customer', status:'open' },
    ],
    lines: txLines([
      ['csm', `I wanted to open this early rather than land on you in the last few weeks. Roughly where does the process start on your side?`],
      ['contact', `Earlier than you would like. Procurement gets involved about ninety days out.`],
      ['csm', `Then we should get ahead of it. What do they usually ask for?`],
      ['contact', `They will want a comparison against at least two alternatives. It is process, not a signal. Nobody here is looking to move.`],
      ['csm', `Understood, and I would rather help you fill that in accurately than have it done without us.`],
      ['contact', `That is sensible. Put together whatever evidence you have on usage and value, that is what carries weight internally.`],
      ['csm', `I will. Can you introduce me to whoever owns it in procurement so I am not a stranger when it starts?`],
      ['contact', `I can do that next week.`],
    ]),
  }),
  'Business review': ctx => ({
    sentiment: 'positive',
    summary: `Quarterly review with a positive tone. Results were accepted without much challenge and the conversation moved quickly onto what to do next rather than defending what has been done.`,
    keyMoments: [
      { line:1, text:'Results accepted without challenge' },
      { line:3, text:'Sponsor raises extending to a second team' },
      { line:7, text:'Reference and case study interest' },
    ],
    risks: ['None raised on the call'],
    actions: [
      { text:'Scope the second team rollout', owner:'csm', status:'open' },
      { text:'Check internal approval for a case study', owner:'customer', status:'open' },
    ],
    lines: txLines([
      ['csm', `I will keep the review short because the numbers speak for themselves this quarter.`],
      ['contact', `They do. I have already shared them internally, so no arguments from me.`],
      ['csm', `Then let me use the time on what comes next rather than on the last three months.`],
      ['contact', `Good, because there is something I want to raise. The other team has seen what we are doing and asked whether they can get on it.`],
      ['csm', `That is worth doing properly rather than informally. Let me scope what it would take.`],
      ['contact', `Please do. Different data, different reporting needs, so do not assume it is a copy of ours.`],
      ['csm', `Noted. One other thing, would you be open to us writing this up as a case study? No commitment yet, just checking if it is possible.`],
      ['contact', `I would have to ask, but I do not see it being a problem.`],
    ]),
  }),
  'Expansion discovery': ctx => ({
    sentiment: 'positive',
    summary: `Discovery session on extending the deployment. There is a real need and a willing sponsor. Timing depends on the budget cycle rather than on appetite.`,
    keyMoments: [
      { line:1, text:'Clear use case described for the wider team' },
      { line:5, text:'Budget available in the next cycle, not this one' },
      { line:7, text:'Sponsor offers to build the internal case' },
    ],
    risks: ['Timing tied to the next budget cycle'],
    actions: [
      { text:'Prepare sizing and commercials', owner:'csm', status:'open' },
      { text:'Build internal business case', owner:'customer', status:'open' },
    ],
    lines: txLines([
      ['csm', `You mentioned last time that this could go wider. I wanted to understand what that actually looks like before I put any numbers around it.`],
      ['contact', `The clearest case is the regional team. They are doing the same work manually and it is slow.`],
      ['csm', `How many people, roughly, and what would good look like for them?`],
      ['contact', `Fifteen or so. Good would be them not spending two days a month assembling a report by hand.`],
      ['csm', `That is a straightforward fit. The honest question is timing. Is there budget this cycle?`],
      ['contact', `Not this one. Next one, yes, if I put the case in early enough.`],
      ['csm', `Then let me give you what you need to build that case rather than pushing a proposal at you now.`],
      ['contact', `That is the right way round. Send me the sizing and I will start shaping it internally.`],
    ]),
  }),
};

const TX_PLAN = {
  red:    [['Escalation', 3], ['Exec sync', 12], ['Check-in', 26]],
  yellow: [['Adoption review', 5], ['Renewal planning', 16], ['Check-in', 31]],
  green:  [['Business review', 8], ['Expansion discovery', 19], ['Check-in', 34]],
};

function getCustomerTranscripts(customer, health, meetings){
  const s = cxHash(customer.id);
  const band = health ? health.band : 'yellow';
  const csm = USERS[customer.ownerId] || USERS.maya;
  const realContacts = (customer.contactIds || []).map(id => CONTACTS[id]).filter(c => c && c.name && c.name !== 'TBD');
  const primary = realContacts[0];
  const contactName = primary ? primary.name : cxPick(['Alex Doyle','Nadia Farr','Tom Whelan','Rachel Adeyemi','Ben Castellano','Hannah Reid'], s);
  const contactRole = primary ? primary.role : 'Programme Lead';
  const doneMeetings = (meetings || []).filter(m => m.status === 'completed');

  const ctx = { name: customer.name, csm: csm.name, contact: contactName, role: contactRole };

  return (TX_PLAN[band] || TX_PLAN.yellow).map(([type, daysAgo], i) => {
    const body = TX_SCRIPTS[type](ctx);
    const real = doneMeetings[i];
    const seed = cxHash(customer.id + type);
    return {
      id: customer.id + '_tx' + i,
      type,
      title: real ? real.title : `${customer.name} — ${type}`,
      date: real ? real.date : txDate(daysAgo),
      durationMin: cxInt(seed, 22, 51),
      source: cxPick(['Zoom','Gong','Google Meet','Teams'], seed),
      participants: real && real.participants && real.participants.length
        ? real.participants
        : [`${contactName} - ${contactRole}`, `${csm.name} - CSM`],
      csmName: csm.name,
      contactName,
      summary: real && real.summary ? real.summary : body.summary,
      sentiment: body.sentiment,
      // Each moment points at a real line in the transcript, so the timestamp
      // shown is the timestamp of that line and clicking it can jump there.
      keyMoments: body.keyMoments.map(m => ({
        text: m.text,
        lineIndex: m.line,
        at: (body.lines[m.line] && body.lines[m.line].at) || '0:00',
      })),
      risks: body.risks,
      actions: body.actions,
      lines: body.lines,
    };
  });
}

// Turn pasted or uploaded plain text into transcript lines.
// Handles "Name: text" and optional leading timestamps like [00:01:23].
function parseTranscriptText(raw){
  const out = [];
  String(raw || '').split(/\r?\n/).forEach(row => {
    const row2 = row.trim();
    if(!row2) return;
    let at = null, rest = row2;
    const ts = row2.match(/^\[?(\d{1,2}:\d{2}(?::\d{2})?)\]?\s+(.*)$/);
    if(ts){ at = ts[1]; rest = ts[2]; }
    const spk = rest.match(/^([A-Za-z][A-Za-z.'’\- ]{1,40}?)\s*:\s*(.+)$/);
    if(spk) out.push({ speaker: spk[1].trim(), text: spk[2].trim(), at });
    else if(out.length) out[out.length - 1].text += ' ' + rest;
    else out.push({ speaker:'Speaker 1', text: rest, at });
  });
  return out;
}

const TX_CONNECTORS = [
  { id:'granola',   name:'Granola',       icon:'🥣', note:'AI meeting notes' },
  { id:'gong',      name:'Gong',          icon:'🎙', note:'Revenue intelligence' },
  { id:'fireflies', name:'Fireflies.ai',  icon:'🪰', note:'Meeting recorder' },
  { id:'otter',     name:'Otter.ai',      icon:'🦦', note:'Live transcription' },
  { id:'zoom',      name:'Zoom',          icon:'🎥', note:'Cloud recordings' },
  { id:'teams',     name:'Microsoft Teams',icon:'👥', note:'Meeting transcripts' },
  { id:'meet',      name:'Google Meet',   icon:'📹', note:'Gemini notes' },
  { id:'chorus',    name:'Chorus by ZoomInfo', icon:'📊', note:'Conversation intel' },
];

function TranscriptsTab({ customer, health, meetings, dispatch }){
  const generated = getCustomerTranscripts(customer, health, meetings);
  const [added, setAdded] = useState([]);
  const transcripts = added.concat(generated);
  const [openId, setOpenId] = useState(generated.length ? generated[0].id : null);
  const [search, setSearch] = useState('');
  const [createdTasks, setCreatedTasks] = useState({});

  // Upload / paste / connect
  const [showUpload, setShowUpload] = useState(false);
  const [uploadMode, setUploadMode] = useState('upload');
  const [pastedText, setPastedText] = useState('');
  const [pasteTitle, setPasteTitle] = useState('');
  const [pickedFile, setPickedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const sentTone = { positive:'green', neutral:'blue', negative:'red' };

  // Highlights cover the three most recent calls only.
  const recent = transcripts.slice(0, 3);
  const allActions = recent.flatMap(t => t.actions.map((a, i) => Object.assign({}, a, { from:t.type, date:t.date, key:t.id + '#' + i })));
  const openActions = allActions.filter(a => a.status !== 'done');
  const allRisks = Array.from(new Set(recent.flatMap(t => t.risks).filter(r => r && r !== 'None raised on the call')));
  const allMoments = recent.flatMap(t => t.keyMoments.map(m => Object.assign({}, m, { from:t.type, date:t.date, txId:t.id })));

  // Jump from a key moment to the exact line in the transcript below.
  const [jumpTo, setJumpTo] = useState(null);
  const goToMoment = (m) => {
    setSearch('');
    setOpenId(m.txId);
    setJumpTo({ txId:m.txId, lineIndex:m.lineIndex, at:Date.now() });
  };
  useEffect(() => {
    if(!jumpTo) return;
    const scroll = setTimeout(() => {
      const node = document.getElementById('txline-' + jumpTo.txId + '-' + jumpTo.lineIndex);
      if(node && node.scrollIntoView) node.scrollIntoView({ behavior:'smooth', block:'center' });
    }, 80);
    const fade = setTimeout(() => setJumpTo(cur => (cur && cur.at === jumpTo.at ? null : cur)), 3000);
    return () => { clearTimeout(scroll); clearTimeout(fade); };
  }, [jumpTo]);
  const positives = recent.filter(t => t.sentiment === 'positive').length;
  const negatives = recent.filter(t => t.sentiment === 'negative').length;
  const mood = negatives > positives ? 'negative' : positives > negatives ? 'positive' : 'neutral';
  const moodWord = { positive:'Positive', neutral:'Mixed', negative:'Strained' }[mood];

  // Turn an action item from a call into a real task on the account.
  const createTaskFromAction = (a) => {
    if(createdTasks[a.key]) return;
    const taskId = 't_tx_' + customer.id + '_' + Date.now();
    dispatch && dispatch({
      type:'CREATE_TASK',
      taskId,
      title: a.text,
      description: 'Captured from the ' + a.from + ' call on ' + new Date(a.date).toLocaleDateString() + '.',
      taskType: 'custom',
      customerId: customer.id,
      ownerId: customer.ownerId,
      source: 'transcript'
    });
    setCreatedTasks(prev => Object.assign({}, prev, { [a.key]: taskId }));
  };

  const createTaskBtn = (a) => createdTasks[a.key]
    ? React.createElement('span', { className:'text-[10px] font-semibold text-green-600 whitespace-nowrap flex-shrink-0' }, '✓ Task created')
    : React.createElement('button', {
        onClick:()=>createTaskFromAction(a),
        className:'text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline whitespace-nowrap flex-shrink-0'
      }, '+ Create task');

  const addTranscript = (title, source, lines) => {
    if(!lines.length){
      dispatch && dispatch({ type:'ADD_TOAST', msg:'Nothing to import, the transcript was empty', toastType:'info' });
      return;
    }
    const id = 'tx_up_' + Date.now();
    const words = lines.reduce((n,l)=>n + l.text.split(/\s+/).length, 0);
    const tx = {
      id,
      type:'Uploaded',
      title,
      date: new Date().toISOString().split('T')[0],
      durationMin: Math.max(2, Math.round(words / 140)),
      source,
      participants: Array.from(new Set(lines.map(l=>l.speaker).filter(Boolean))).slice(0,6),
      csmName: (USERS[customer.ownerId] || USERS.maya).name,
      contactName: customer.name,
      summary: lines.map(l=>l.text).join(' ').slice(0, 220) + '...',
      sentiment:'neutral',
      keyMoments: [],
      risks: [],
      actions: [],
      lines,
      isUpload: true,
    };
    setAdded(prev => [tx].concat(prev));
    setOpenId(id);
    setShowUpload(false);
    setPastedText(''); setPasteTitle(''); setPickedFile(null);
    dispatch && dispatch({ type:'ADD_TOAST', msg:'Transcript imported: ' + title, toastType:'success' });
  };

  const readFile = (file) => {
    if(!file) return;
    setPickedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      const lines = parseTranscriptText(reader.result);
      addTranscript(file.name.replace(/\.[^.]+$/, ''), 'Upload', lines);
    };
    reader.onerror = () => dispatch && dispatch({ type:'ADD_TOAST', msg:'Could not read that file', toastType:'error' });
    reader.readAsText(file);
  };

  const q = search.trim().toLowerCase();
  const visible = q
    ? transcripts.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.summary.toLowerCase().includes(q) ||
        t.lines.some(l => l.text.toLowerCase().includes(q)))
    : transcripts;

  const highlight = (text) => {
    if(!q) return text;
    const i = text.toLowerCase().indexOf(q);
    if(i === -1) return text;
    return React.createElement(React.Fragment, null,
      text.slice(0, i),
      React.createElement('mark', { className:'bg-amber-200 rounded px-0.5' }, text.slice(i, i + q.length)),
      text.slice(i + q.length)
    );
  };

  return React.createElement('div', { className:'space-y-4' },

    // ── AI highlights across all calls ──
    React.createElement(Card, { className:'p-4' },
      React.createElement('div', { className:'flex items-center justify-between mb-3' },
        React.createElement('div', { className:'flex items-center gap-2' },
          React.createElement('div', { className:'w-4 h-4 bg-indigo-600 rounded flex items-center justify-center text-white text-[10px]' }, '✦'),
          React.createElement('h4', { className:'font-semibold text-slate-900 text-sm' }, 'AI highlights across last ' + recent.length + ' calls'),
          React.createElement(CxPill, { tone: sentTone[mood] }, moodWord + ' tone')
        ),
        React.createElement('span', { className:'text-[11px] text-slate-400' }, 'Generated from transcripts · not verified')
      ),
      React.createElement('div', { className:'grid grid-cols-1 lg:grid-cols-3 gap-4' },

        React.createElement('div', null,
          React.createElement('p', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2' }, 'Key moments'),
          React.createElement('div', { className:'space-y-2' },
            allMoments.slice(0, 5).map((m, i) => React.createElement('button', {
              key:i,
              onClick:()=>goToMoment(m),
              title:'Jump to this point in the transcript',
              className:'w-full text-left flex items-start gap-2 p-1 -m-1 rounded-lg hover:bg-indigo-50 transition-colors group'
            },
              React.createElement('span', { className:'text-[10px] font-mono text-indigo-500 bg-indigo-50 group-hover:bg-indigo-100 rounded px-1 py-0.5 flex-shrink-0 mt-0.5' }, m.at),
              React.createElement('div', { className:'min-w-0 flex-1' },
                React.createElement('p', { className:'text-xs text-slate-700 leading-snug' }, m.text),
                React.createElement('p', { className:'text-[10px] text-slate-400' }, m.from + ' · ' + new Date(m.date).toLocaleDateString())
              ),
              React.createElement('span', { className:'text-[10px] font-semibold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap flex-shrink-0 mt-0.5' }, 'Jump to ↓')
            ))
          )
        ),

        React.createElement('div', null,
          React.createElement('p', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2' }, 'Risks mentioned'),
          allRisks.length === 0
            ? React.createElement('p', { className:'text-xs text-slate-400' }, 'No risks raised on these calls')
            : React.createElement('div', { className:'space-y-1.5' },
                allRisks.slice(0, 5).map((r, i) => React.createElement('div', { key:i, className:'flex items-start gap-2 p-2 bg-red-50 rounded-lg' },
                  React.createElement('span', { className:'text-red-500 text-xs flex-shrink-0' }, '⚠'),
                  React.createElement('p', { className:'text-xs text-slate-700 leading-snug' }, r)
                ))
              )
        ),

        React.createElement('div', null,
          React.createElement('p', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2' },
            'Action items · ' + openActions.length + ' open'),
          React.createElement('div', { className:'space-y-1.5' },
            allActions.slice(0, 6).map((a, i) => React.createElement('div', { key:a.key, className:'flex items-start gap-2 group' },
              React.createElement('span', { className:`w-4 h-4 rounded-full border flex items-center justify-center text-[9px] flex-shrink-0 mt-0.5 ${a.status==='done'?'bg-green-500 border-green-500 text-white':'border-slate-300 text-transparent'}` }, '✓'),
              React.createElement('div', { className:'min-w-0 flex-1' },
                React.createElement('p', { className:`text-xs leading-snug ${a.status==='done'?'text-slate-400 line-through':'text-slate-700'}` }, a.text),
                React.createElement('p', { className:'text-[10px] text-slate-400' }, a.owner === 'csm' ? 'Us' : customer.name)
              ),
              a.status !== 'done' && createTaskBtn(a)
            ))
          )
        )
      )
    ),

    // ── Toolbar ──
    React.createElement('div', { className:'flex items-center gap-3 flex-wrap' },
      React.createElement('input', {
        placeholder:'Search across transcripts...',
        value:search,
        onChange:e=>setSearch(e.target.value),
        className:'flex-1 min-w-[200px] max-w-sm px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500'
      }),
      React.createElement('span', { className:'text-xs text-slate-500' }, visible.length + ' of ' + transcripts.length + ' calls'),
      React.createElement(Btn, {
        variant:'secondary', size:'sm', className:'ml-auto',
        onClick:()=>{ setUploadMode('upload'); setShowUpload(true); }
      }, '⬆ Upload transcript')
    ),

    // ── Transcript list ──
    visible.length === 0 && React.createElement(Card, { className:'p-8 text-center' },
      React.createElement('p', { className:'text-sm text-slate-400' }, 'No transcript matches "' + search + '"')
    ),

    visible.map(t => {
      const isOpen = openId === t.id;
      return React.createElement(Card, { key:t.id, className:'overflow-hidden' },
        React.createElement('button', {
          onClick:()=>setOpenId(isOpen ? null : t.id),
          className:'w-full text-left p-4 hover:bg-slate-50 transition-colors'
        },
          React.createElement('div', { className:'flex items-start justify-between gap-4' },
            React.createElement('div', { className:'min-w-0 flex-1' },
              React.createElement('div', { className:'flex items-center gap-2 flex-wrap' },
                React.createElement('span', { className:'px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-semibold rounded' }, t.type),
                React.createElement('h4', { className:'font-semibold text-slate-900 text-sm' }, t.title),
                React.createElement(CxPill, { tone: sentTone[t.sentiment] }, t.sentiment)
              ),
              React.createElement('p', { className:'text-[11px] text-slate-400 mt-1' },
                new Date(t.date).toLocaleDateString() + ' · ' + t.durationMin + ' min · ' + t.source + ' · ' + t.participants.join(', ')),
              React.createElement('p', { className:'text-xs text-slate-600 leading-snug mt-1.5' }, highlight(t.summary))
            ),
            React.createElement('span', { className:'text-slate-300 text-xs flex-shrink-0 mt-1' }, isOpen ? '▲ Hide' : '▼ Read')
          )
        ),

        isOpen && React.createElement('div', { className:'border-t bg-slate-50/60 px-4 py-4' },
          React.createElement('div', { className:'flex items-center justify-between mb-3' },
            React.createElement('p', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider' }, 'Full transcript'),
            React.createElement('button', {
              onClick:()=>dispatch && dispatch({ type:'ADD_TOAST', msg:'Transcript copied', toastType:'success' }),
              className:'text-[11px] text-indigo-600 hover:underline'
            }, 'Copy transcript')
          ),
          React.createElement('div', { className:'space-y-3 max-h-96 overflow-y-auto pr-1' },
            t.lines.map((l, i) => {
              const isCsm = l.speaker ? l.speaker === t.csmName : l.who === 'csm';
              const speaker = l.speaker || (isCsm ? t.csmName : t.contactName);
              const isTarget = jumpTo && jumpTo.txId === t.id && jumpTo.lineIndex === i;
              const moment = t.keyMoments.find(m => m.lineIndex === i);
              return React.createElement('div', {
                key:i,
                id:'txline-' + t.id + '-' + i,
                className:'flex items-start gap-2.5 rounded-lg transition-all duration-500 ' +
                  (isTarget ? 'bg-amber-100 ring-2 ring-amber-300 p-2 -mx-1' : 'p-2 -mx-1')
              },
                React.createElement('span', {
                  className:`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold ${isCsm?'bg-indigo-100 text-indigo-700':'bg-slate-200 text-slate-600'}`
                }, speaker.split(' ').map(n=>n[0]).join('').slice(0,2)),
                React.createElement('div', { className:'min-w-0 flex-1' },
                  React.createElement('div', { className:'flex items-baseline gap-2' },
                    React.createElement('span', { className:'text-xs font-semibold text-slate-800' }, speaker),
                    React.createElement('span', { className:'text-[10px] text-slate-400' }, l.speaker ? '' : (isCsm ? 'CSM' : customer.name)),
                    moment && React.createElement('span', {
                      className:'text-[9px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 rounded px-1 py-0.5',
                      title:moment.text
                    }, '★ Key moment'),
                    React.createElement('span', { className:'text-[10px] font-mono text-slate-300 ml-auto' }, l.at || '')
                  ),
                  React.createElement('p', { className:'text-xs text-slate-700 leading-relaxed mt-0.5' }, highlight(l.text))
                )
              );
            })
          ),
          React.createElement('div', { className:'mt-4 pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4' },
            React.createElement('div', null,
              React.createElement('p', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5' }, 'Action items from this call'),
              t.actions.length === 0
                ? React.createElement('p', { className:'text-xs text-slate-400' }, 'None captured')
                : React.createElement('div', { className:'space-y-1.5' },
                    t.actions.map((a, i) => {
                      const item = Object.assign({}, a, { from:t.type, date:t.date, key:t.id + '#' + i });
                      return React.createElement('div', { key:item.key, className:'flex items-start gap-2' },
                        React.createElement('span', { className:'text-slate-300 text-xs mt-0.5' }, '→'),
                        React.createElement('p', { className:`text-xs flex-1 leading-snug ${a.status==='done'?'text-slate-400 line-through':'text-slate-600'}` }, a.text),
                        a.status !== 'done' && createTaskBtn(item)
                      );
                    })
                  )
            ),
            React.createElement('div', null,
              React.createElement('p', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5' }, 'Risks mentioned'),
              t.risks.length === 0
                ? React.createElement('p', { className:'text-xs text-slate-400' }, 'None captured')
                : t.risks.map((r, i) => React.createElement('p', { key:i, className:'text-xs text-slate-600 flex items-start gap-1.5' },
                    React.createElement('span', { className:'text-red-400' }, '⚠'), r))
            )
          )
        )
      );
    }),

    // ── Upload / paste / connect modal ──
    showUpload && React.createElement(Modal, { open:true, onClose:()=>setShowUpload(false), title:'Add a transcript', size:'lg' },

      React.createElement('div', { className:'flex gap-1 bg-slate-100 rounded-lg p-1 mb-5' },
        [['upload','⬆ Upload a file'],['paste','📋 Paste text'],['connect','🔗 Connect an app']].map(([id, label]) =>
          React.createElement('button', {
            key:id,
            onClick:()=>setUploadMode(id),
            className:`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${uploadMode===id?'bg-white text-slate-900 shadow-sm':'text-slate-500 hover:text-slate-700'}`
          }, label)
        )
      ),

      // Upload a file
      uploadMode === 'upload' && React.createElement('div', null,
        React.createElement('div', {
          onClick:()=>fileInputRef.current && fileInputRef.current.click(),
          onDragOver:e=>{ e.preventDefault(); setDragOver(true); },
          onDragLeave:()=>setDragOver(false),
          onDrop:e=>{ e.preventDefault(); setDragOver(false); readFile(e.dataTransfer.files && e.dataTransfer.files[0]); },
          className:`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${dragOver?'border-indigo-400 bg-indigo-50':'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'}`
        },
          React.createElement('div', { className:'text-3xl mb-2' }, '📄'),
          React.createElement('p', { className:'text-sm font-medium text-slate-700' }, 'Drop a transcript here, or click to browse'),
          React.createElement('p', { className:'text-xs text-slate-400 mt-1' }, 'TXT, VTT, SRT or MD · up to 25 MB'),
          pickedFile && React.createElement('p', { className:'text-xs text-indigo-600 font-medium mt-3' }, 'Selected: ' + pickedFile.name)
        ),
        React.createElement('input', {
          ref:fileInputRef,
          type:'file',
          accept:'.txt,.vtt,.srt,.md,.json,text/plain',
          className:'hidden',
          onChange:e=>readFile(e.target.files && e.target.files[0])
        }),
        React.createElement('p', { className:'text-xs text-slate-400 mt-3' },
          'Speaker labels in the format "Name: what they said" are picked up automatically. Timestamps at the start of a line are kept.')
      ),

      // Paste text
      uploadMode === 'paste' && React.createElement('div', null,
        React.createElement('label', { className:'block text-xs font-medium text-slate-500 mb-1' }, 'Call title'),
        React.createElement('input', {
          value:pasteTitle,
          onChange:e=>setPasteTitle(e.target.value),
          placeholder:customer.name + ' — Check-in',
          className:'w-full text-sm border border-slate-200 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500'
        }),
        React.createElement('label', { className:'block text-xs font-medium text-slate-500 mb-1' }, 'Transcript'),
        React.createElement('textarea', {
          value:pastedText,
          onChange:e=>setPastedText(e.target.value),
          rows:10,
          placeholder:'Maya Chen: Thanks for making time today.\nAlex Doyle: No problem, we have half an hour.\n...',
          className:'w-full text-xs font-mono border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500'
        }),
        React.createElement('div', { className:'flex items-center gap-2 mt-4' },
          React.createElement(Btn, {
            variant:'primary',
            disabled:!pastedText.trim(),
            onClick:()=>addTranscript(pasteTitle.trim() || (customer.name + ' — Pasted transcript'), 'Pasted', parseTranscriptText(pastedText))
          }, 'Add transcript'),
          React.createElement(Btn, { variant:'ghost', onClick:()=>setShowUpload(false) }, 'Cancel'),
          React.createElement('span', { className:'text-xs text-slate-400 ml-auto' },
            pastedText.trim() ? parseTranscriptText(pastedText).length + ' lines detected' : '')
        )
      ),

      // Connect an app
      uploadMode === 'connect' && React.createElement('div', null,
        React.createElement('p', { className:'text-sm text-slate-600 mb-4' },
          'Connect a note taker and calls for ' + customer.name + ' will land here automatically after every meeting.'),
        React.createElement('div', { className:'grid grid-cols-2 gap-2.5' },
          TX_CONNECTORS.map(c => React.createElement('div', {
            key:c.id,
            className:'flex items-center gap-3 p-3 border border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-slate-50 transition-colors'
          },
            React.createElement('div', { className:'w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-lg flex-shrink-0' }, c.icon),
            React.createElement('div', { className:'min-w-0 flex-1' },
              React.createElement('p', { className:'text-sm font-semibold text-slate-800 truncate' }, c.name),
              React.createElement('p', { className:'text-[11px] text-slate-400 truncate' }, c.note)
            ),
            React.createElement('button', {
              onClick:()=>dispatch && dispatch({ type:'ADD_TOAST', msg:'Connecting to ' + c.name + '...', toastType:'info' }),
              className:'text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline flex-shrink-0'
            }, 'Connect')
          ))
        ),
        React.createElement('p', { className:'text-xs text-slate-400 mt-4' },
          'Do not see your tool? Any recorder that exports a text or VTT transcript can be uploaded on the first tab.')
      )
    )
  );
}

function Customer360() {
  const { state, dispatch } = useApp();
  const { customerId } = useParams();
  const { query } = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState(query.tab || 'overview');
  const focusGoalId = query.goal || null;
  
  const customer = state.customers.find(c=>c.id===customerId);
  if(!customer) return React.createElement('div', { className:'p-8 text-slate-500' }, 'Customer not found');
  
  const health = HEALTH_SIGNALS[customer.healthId];
  const risks = customer.riskIds.map(id=>state.risks[id]).filter(Boolean);
  const expOpps = (customer.expansionIds||[]).map(id=>state.expansionOpps[id]).filter(Boolean);
  const goals = customer.goalIds.map(id=>state.goals[id]).filter(Boolean);
  const contacts = (customer.contactIds||[]).map(id=>CONTACTS[id]).filter(Boolean);
  const renewal = state.renewals.find(r=>r.customerId===customerId);
  const tickets = TICKETS.filter(t=>t.customerId===customerId);
  const meetings = MEETINGS.filter(m=>m.customerId===customerId);
  
  return React.createElement('div', { className:'space-y-4' },
    // Customer header
    React.createElement(Card, { className:'p-4' },
      React.createElement('div', { className:'flex items-start justify-between' },
        React.createElement('div', { className:'flex items-start gap-4' },
          React.createElement('div', { className:'w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-lg font-bold text-slate-600' }, customer.name.slice(0,2)),
          React.createElement('div', null,
            React.createElement('div', { className:'flex items-center gap-3' },
              React.createElement('h2', { className:'text-xl font-bold text-slate-900' }, customer.name),
              React.createElement(HealthBadge, { band:health?.band, score:health?.compositeScore })
            ),
            React.createElement('p', { className:'text-slate-500 text-sm' }, customer.domain + ' · ' + customer.segment.replace('_',' ')),
            React.createElement('div', { className:'flex items-center gap-4 mt-2 text-sm' },
              React.createElement('span', { className:'text-slate-600' }, React.createElement('span',{className:'font-semibold text-slate-900'},formatARR(customer.arr)), ' ARR'),
              renewal && React.createElement('span', { className:`${renewal.daysRemaining < 60 ? 'text-red-600 font-semibold' : 'text-slate-600'}` }, 'Renews in ', renewal.daysRemaining, 'd'),
              risks.length > 0 && React.createElement('span', { className:'text-red-600' }, formatARR(risks.reduce((s,r)=>s+r.amountAtRisk,0)) + ' at risk'),
              expOpps.filter(e=>e.qualificationStatus!=='dismissed').length > 0 && React.createElement('span', { className:'text-teal-600' }, '+' + formatARR(expOpps.filter(e=>e.qualificationStatus!=='dismissed').reduce((s,e)=>s+e.estimatedArr,0)) + ' potential')
            )
          )
        ),
        React.createElement('div', { className:'flex gap-2' },
          React.createElement(Btn, { variant:'secondary', size:'sm', onClick:()=>dispatch({type:'TOGGLE_ASSISTANT'}) }, '✦ Ask CX42 about ' + customer.name.split(' ')[0]),
          React.createElement(Btn, { variant:'secondary', size:'sm', onClick:()=>navigate(`/portal-preview/${customerId}`) }, '👁 Portal preview'),
        )
      )
    ),
    
    // Tabs — must-have scope only
    React.createElement(Tabs, { tabs:[{id:'overview',label:'Overview'},{id:'health',label:'Health'},{id:'goals',label:'Goals'},{id:'contacts',label:'Contacts'},{id:'usage',label:'Usage'},{id:'interactions',label:'Interactions'}], active:tab, onChange:setTab }),
    
    tab === 'overview' && React.createElement(OverviewTab, { customer, health, risks, expOpps, goals, contacts, renewal, tickets, meetings, state, dispatch, navigate }),
    tab === 'health' && React.createElement(HealthTab, { health, customer }),
    tab === 'goals' && React.createElement(GoalsTab, { customer, goals, state, dispatch, navigate, focusGoalId }),
    tab === 'contacts' && React.createElement(ContactsTab, { customer, contacts, dispatch }),
    tab === 'usage' && React.createElement(UsageTab, { customer, health, dispatch }),
    tab === 'interactions' && React.createElement(InteractionsTab, { customer, state, dispatch, navigate, meetings }),
    
  );
}

function OverviewTab({ customer, health, risks, expOpps, goals, contacts, renewal, tickets, meetings, state, dispatch, navigate }) {
  const activeGoals = goals.filter(g=>['not_started','in_progress','at_risk'].includes(g.status));
  const summaries = {
    acme: 'Acme Analytics is experiencing a critical adoption setback. Weekly active users dropped 64% following a data synchronization failure that has been open for 9 days. With renewal in 74 days, immediate recovery action is needed. An action has created a draft recovery plan awaiting your acknowledgement.',
    northstar: 'Northstar Labs is performing exceptionally well. Seat utilization reached 94% with 31% active user growth over 60 days. The Finance team has organically adopted the platform, signaling strong expansion potential of $72K ARR. Health improved from yellow to green 12 days ago.',
    orbit: 'Orbit Systems is a model customer — green health, strong adoption, and an active executive sponsor. The Revenue Operations enablement goal is 67% complete. Q2 QBR delivered positive results and an ML Suite evaluation is now in progress.',
    default: `${customer.name} is ${health?.band === 'green' ? 'performing well with healthy adoption metrics' : health?.band === 'yellow' ? 'showing some areas requiring attention' : 'at risk and requiring immediate intervention'}. ${renewal ? `Renewal is in ${renewal.daysRemaining} days.` : ''}`
  };
  const summary = summaries[customer.id] || summaries.default;
  
  const nextBestActions = {
    acme: [
      { rank:1, text:'Accept the Adoption Recovery goal to start coordinating the response', action:'Go to Goals', target:()=>navigate(`/customers/${customer.id}?tab=goals`) },
      { rank:2, text:'Review the usage decline dimension — weekly active users are down 64% over 12 weeks', action:'View Health', target:()=>navigate(`/customers/${customer.id}?tab=health`) },
      { rank:3, text:'Draft executive outreach to David Park before the renewal conversation stalls', action:'Draft with CX42', target:()=>dispatch({type:'TOGGLE_ASSISTANT'}) },
    ],
    northstar: [
      { rank:1, text:'Qualify the expansion opportunity — all evidence is in place', action:'View expansion', target:()=>navigate('/expansion') },
      { rank:2, text:'Run expansion discovery to structure the conversation', action:'Open account', target:()=>{} },
      { rank:3, text:'Schedule expansion discovery call with Emily Chen before seat pressure forces an awkward conversation', action:'Create task', target:()=>{} },
    ],
    default: [
      { rank:1, text:'Review open goals and ensure all tasks have owners and due dates', action:'View Goals', target:()=>navigate(`/customers/${customer.id}`) },
      { rank:2, text:'Check renewal status and confirm forecast', action:'View renewals', target:()=>navigate('/renewals') },
      { rank:3, text:'Review recent product usage for adoption gaps', action:'View Usage', target:()=>navigate(`/customers/${customer.id}?tab=usage`) },
    ]
  };
  const actions = nextBestActions[customer.id] || nextBestActions.default;
  
  // Every card below flows in a masonry column layout: cards pack against each
  // other regardless of height, so no ragged bottom edges or dead space.
  const brk = 'break-inside-avoid mb-4';

  return React.createElement('div', { className:'space-y-4' },

    // Full-width attribute band
    React.createElement(AccountAttributesPanel, { customer, health, dispatch }),

    // Masonry card flow
    React.createElement('div', { className:'columns-1 lg:columns-2 xl:columns-3 gap-4 [column-fill:balance]' },

      // Account summary
      React.createElement(Card, { className:'p-4 ' + brk },
        React.createElement('div', { className:'flex items-center gap-2 mb-2' },
          React.createElement('div', { className:'w-4 h-4 bg-indigo-600 rounded flex items-center justify-center text-white text-xs' }, '\u2726'),
          React.createElement('h4', { className:'font-semibold text-slate-900 text-sm' }, 'Account summary')
        ),
        React.createElement('p', { className:'text-sm text-slate-700 leading-relaxed' }, summary)
      ),

      // Revenue & renewal
      React.createElement(RevenueRenewalCard, { customer, renewal, className:brk }),

      // Health snapshot
      health && React.createElement(Card, { className:'p-4 ' + brk },
        React.createElement('div', { className:'flex items-center justify-between mb-3' },
          React.createElement('h4', { className:'font-semibold text-slate-900 text-sm' }, 'Health snapshot'),
          React.createElement('button', { onClick:()=>navigate(`/customers/${customer.id}?tab=health`), className:'text-xs text-indigo-600 hover:underline' }, 'Full health \u2192')
        ),
        React.createElement('div', { className:'flex items-center gap-4 mb-3' },
          React.createElement('div', null,
            React.createElement(HealthBadge, { band:health.band, score:health.compositeScore }),
            React.createElement('p', { className:'text-xs text-slate-400 mt-1' }, `was ${health.previousScore} (${health.previousBand})`)
          ),
          health.transitionedAt && React.createElement('p', { className:'text-xs text-slate-500' }, 'Band changed ' + new Date(health.transitionedAt).toLocaleDateString())
        ),
        health.dimensions.length > 0 && React.createElement('div', { className:'space-y-2' },
          health.dimensions.map(dim => React.createElement('div', { key:dim.key, className:'flex items-center gap-3' },
            React.createElement('p', { className:'text-xs text-slate-600 w-28 flex-shrink-0 truncate' }, dim.label),
            React.createElement('div', { className:'flex-1 bg-slate-100 rounded-full h-2' },
              React.createElement('div', { className:`h-2 rounded-full ${dim.effectiveScore > 66 ? 'bg-green-500' : dim.effectiveScore > 33 ? 'bg-amber-400' : 'bg-red-500'}`, style:{width:`${dim.effectiveScore}%`} })
            ),
            React.createElement('span', { className:'text-xs font-medium text-slate-700 w-7 text-right' }, dim.effectiveScore)
          ))
        )
      ),

      // Actions — what has already run, then what is recommended next
      (function(){
        const runs = getCustomerActionRuns(customer, health, state.actions);
        const applied = [];
        runs.forEach(r => { if (!applied.some(a=>a.id===r.action.id)) applied.push(r.action); });
        return React.createElement(Card, { className:'p-4 ' + brk },
          React.createElement('div', { className:'flex items-center justify-between mb-3' },
            React.createElement('h4', { className:'font-semibold text-slate-900 text-sm' }, 'Actions'),
            runs.length > 0 && React.createElement('button', {
              onClick:()=>navigate('/actions'),
              className:'text-xs text-indigo-600 hover:underline' }, 'Action library \u2192')
          ),
          runs.length > 0 && React.createElement('div', { className:'mb-3' },
            React.createElement('p', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5' },
              'Applied \u00b7 ' + applied.length + ' action' + (applied.length===1?'':'s') + ', ' + runs.length + ' run' + (runs.length===1?'':'s')),
            React.createElement('div', { className:'space-y-1.5' },
              runs.slice(0,3).map(r => React.createElement('div', { key:r.id, className:'flex items-start gap-2.5 p-2 bg-slate-50 rounded-lg' },
                React.createElement('span', { className:`w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 ${r.status==='suppressed'?'bg-slate-200 text-slate-500':'bg-indigo-100 text-indigo-600'}` },
                  r.status==='suppressed' ? '\u23F8' : '\u26A1'),
                React.createElement('div', { className:'flex-1 min-w-0' },
                  React.createElement('p', { className:'text-xs font-semibold text-slate-800 truncate' }, r.action.name),
                  React.createElement('p', { className:'text-[10px] text-slate-500' },
                    r.ago + (r.status==='suppressed' ? ' \u00b7 suppressed' : ' \u00b7 ' + r.steps.length + ' activit' + (r.steps.length===1?'y':'ies')))
                )
              ))
            )
          ),
          React.createElement('p', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5' }, 'Recommended next'),
          React.createElement('div', { className:'space-y-2' },
            actions.map(a => React.createElement('div', { key:a.rank, className:'flex items-start gap-2.5 p-2.5 border border-slate-200 rounded-lg' },
              React.createElement('span', { className:'w-5 h-5 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0' }, a.rank),
              React.createElement('div', { className:'flex-1 min-w-0' },
                React.createElement('p', { className:'text-sm text-slate-700 leading-snug' }, a.text),
                React.createElement('button', { onClick:a.target, className:'text-xs text-indigo-600 hover:underline mt-1' }, a.action)
              )
            ))
          )
        );
      })(),

      // Key contacts
      React.createElement(Card, { className:'p-4 ' + brk },
        React.createElement('div', { className:'flex items-center justify-between mb-3' },
          React.createElement('h4', { className:'font-semibold text-slate-900 text-sm' }, 'Key contacts'),
          React.createElement('button', { onClick:()=>navigate(`/customers/${customer.id}?tab=contacts`), className:'text-xs text-indigo-600 hover:underline' }, 'All contacts \u2192')
        ),
        contacts.length === 0
          ? React.createElement('p', { className:'text-sm text-slate-400' }, 'No contacts recorded')
          : React.createElement('div', { className:'space-y-2.5' },
              contacts.map(c => React.createElement('div', { key:c.id, className:'flex items-center gap-2' },
                React.createElement('div', { className:'w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0' }, c.name.split(' ').map(n=>n[0]).join('')),
                React.createElement('div', { className:'flex-1 min-w-0' },
                  React.createElement('p', { className:'text-sm font-medium text-slate-900 truncate' }, c.name),
                  React.createElement('p', { className:'text-xs text-slate-500 truncate' }, c.role)
                ),
                React.createElement('span', { className:`w-2 h-2 rounded-full flex-shrink-0 ${c.engagement==='high'?'bg-green-500':c.engagement==='medium'?'bg-amber-400':c.engagement==='none'?'bg-gray-300':'bg-red-400'}` })
              ))
            )
      ),

      // Active goals
      activeGoals.length > 0 && React.createElement(Card, { className:'p-4 ' + brk },
        React.createElement('div', { className:'flex items-center justify-between mb-3' },
          React.createElement('h4', { className:'font-semibold text-slate-900 text-sm' }, 'Active goals'),
          React.createElement('button', { onClick:()=>navigate(`/customers/${customer.id}?tab=goals`), className:'text-xs text-indigo-600 hover:underline' }, 'View all \u2192')
        ),
        React.createElement('div', { className:'space-y-2.5' },
          activeGoals.map(g => {
            const prog = goalProgress(g, state.tasks);
            return React.createElement('div', { key:g.id, className:'flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-lg hover:bg-indigo-50 cursor-pointer', onClick:()=>navigate(`/goals/${g.id}`) },
              React.createElement(StatusBadge, { status:g.status }),
              React.createElement('div', { className:'flex-1 min-w-0' },
                React.createElement('p', { className:'text-sm font-medium text-slate-900 leading-snug' }, g.title),
                React.createElement('div', { className:'flex items-center gap-2 mt-1.5' },
                  React.createElement('div', { className:'flex-1 bg-slate-200 rounded-full h-1.5' },
                    React.createElement('div', { className:'h-1.5 rounded-full bg-indigo-500', style:{width:`${prog}%`} })
                  ),
                  React.createElement('span', { className:'text-xs text-slate-500' }, `${prog}%`)
                ),
                g.status === 'not_started' && g.source === 'signal_triggered' && React.createElement('p', { className:'text-xs text-amber-600 font-medium mt-1' }, '\u26a0 Needs acknowledgement')
              )
            );
          })
        )
      ),

      // Open risks
      risks.filter(r=>r.status!=='resolved').length > 0 && React.createElement(Card, { className:'p-4 ' + brk },
        React.createElement('h4', { className:'font-semibold text-slate-900 text-sm mb-2.5' }, 'Open risks'),
        React.createElement('div', { className:'space-y-2' },
          risks.filter(r=>r.status!=='resolved').map(r => React.createElement('div', { key:r.id, className:'p-2.5 bg-red-50 rounded-lg' },
            React.createElement('div', { className:'flex items-start gap-2' },
              React.createElement(SeverityBadge, { severity:r.severity }),
              React.createElement('p', { className:'text-xs text-slate-700 font-medium leading-snug' }, r.title)
            ),
            React.createElement('p', { className:'text-xs text-slate-500 mt-1' }, formatARR(r.amountAtRisk) + ' at risk')
          ))
        )
      ),

      // Expansion potential
      expOpps.filter(e=>e.qualificationStatus!=='dismissed').length > 0 && React.createElement(Card, { className:'p-4 ' + brk },
        React.createElement('h4', { className:'font-semibold text-slate-900 text-sm mb-2.5' }, 'Expansion potential'),
        React.createElement('div', { className:'space-y-2' },
          expOpps.filter(e=>e.qualificationStatus!=='dismissed').map(e => React.createElement('div', { key:e.id, className:'p-2.5 bg-teal-50 rounded-lg' },
            React.createElement('p', { className:'text-sm font-semibold text-teal-700' }, '+' + formatARR(e.estimatedArr) + ' potential'),
            React.createElement('p', { className:'text-xs text-slate-600 capitalize mt-0.5' }, e.type.replace('_',' ') + ' \u00b7 ' + e.confidence + ' confidence'),
            React.createElement('div', { className:'flex flex-wrap gap-1 mt-1' }, e.evidence.slice(0,3).map((ev,i)=>React.createElement('span',{key:i,className:'text-xs text-teal-600'},ev.substring(0,30)+(ev.length>30?'...':''))))
          ))
        )
      ),

      // Artifacts
      React.createElement(ArtifactsCard, { customer, dispatch, className:brk })
    )
  );
}

function HealthTab({ health, customer }) {
  if(!health) return React.createElement('div', { className:'p-8 text-center text-slate-400' }, 'No health data available');
  
  const histData = health.history.filter((_,i)=>i%7===0); // weekly
  
  return React.createElement('div', { className:'space-y-5' },
    // Score summary
    React.createElement(Card, { className:'p-5' },
      React.createElement('div', { className:'flex items-start gap-8' },
        React.createElement('div', null,
          React.createElement('p', { className:'text-xs text-slate-500 uppercase tracking-wide' }, 'Current score'),
          React.createElement('div', { className:'flex items-end gap-3 mt-1' },
            React.createElement('span', { className:'text-5xl font-bold ' + (health.band==='red'?'text-red-600':health.band==='yellow'?'text-amber-500':'text-green-600') }, health.compositeScore),
            React.createElement(HealthBadge, { band:health.band })
          ),
          React.createElement('p', { className:'text-xs text-slate-400 mt-1' }, `Was ${health.previousScore} (${health.previousBand}) · Computed ${new Date(health.computedAt).toLocaleString()}`)
        ),
        health.transitionedAt && React.createElement('div', { className:'px-4 py-3 bg-red-50 rounded-xl border border-red-200' },
          React.createElement('p', { className:'text-xs font-medium text-red-700' }, 'Band transition'),
          React.createElement('p', { className:'text-sm font-semibold text-red-900 mt-0.5' }, `${health.previousBand} → ${health.band}`),
          React.createElement('p', { className:'text-xs text-red-600 mt-0.5' }, 'Score change: ' + (health.compositeScore - health.previousScore))
        ),
        React.createElement('div', { className:'px-4 py-3 bg-slate-50 rounded-xl' },
          React.createElement('p', { className:'text-xs font-medium text-slate-500' }, 'Data quality'),
          React.createElement('p', { className:'text-sm font-semibold text-slate-900 capitalize mt-0.5' }, health.dataQuality)
        )
      )
    ),
    
    // Dimension breakdown
    React.createElement(Card, { className:'p-5' },
      React.createElement('h4', { className:'font-semibold text-slate-900 mb-4' }, 'Health dimension breakdown'),
      health.dimensions.length === 0 && React.createElement('p',{className:'text-sm text-slate-400'},'No dimension data available for this customer'),
      health.dimensions.length > 0 && React.createElement('div', { className:'overflow-x-auto' },
        React.createElement('table', { className:'w-full text-sm' },
          React.createElement('thead', null, React.createElement('tr', { className:'text-xs font-medium text-slate-500 border-b' },
            ['Dimension','Raw score','Effective score*','Weight','Contribution','Trend','Freshness','Evidence'].map(h=>React.createElement('th',{key:h,className:'py-2 pr-4 text-left'},h))
          )),
          React.createElement('tbody', null,
            health.dimensions.map(dim => React.createElement('tr', { key:dim.key, className:'border-b' },
              React.createElement('td', { className:'py-3 pr-4 font-medium text-slate-900' }, dim.label),
              React.createElement('td', { className:'py-3 pr-4' }, dim.rawScore),
              React.createElement('td', { className:'py-3 pr-4 font-semibold' },
                dim.key === 'support_pressure' ? React.createElement('span', null, dim.effectiveScore, React.createElement('span',{className:'text-xs text-slate-400 ml-1'},'(100-'+dim.rawScore+')'))
                  : dim.effectiveScore
              ),
              React.createElement('td', { className:'py-3 pr-4' }, Math.round(dim.weight*100) + '%'),
              React.createElement('td', { className:'py-3 pr-4 font-semibold text-indigo-700' }, dim.contribution.toFixed(1)),
              React.createElement('td', { className:'py-3 pr-4' }, React.createElement('span',{className:dim.trend==='up'?'text-green-600':dim.trend==='down'?'text-red-600':'text-slate-500'}, dim.trend==='up'?'↑':dim.trend==='down'?'↓':'→')),
              React.createElement('td', { className:'py-3 pr-4 text-slate-400 text-xs' }, dim.freshness),
              React.createElement('td', { className:'py-3' },
                React.createElement('div', { className:'flex flex-wrap gap-1' },
                  dim.evidence.map((ev,i) => React.createElement(EvidenceChip,{key:i,label:ev.label,type:ev.type}))
                )
              )
            )),
            // Total row
            React.createElement('tr', { className:'bg-slate-50 font-semibold' },
              React.createElement('td', { className:'py-3 pr-4', colSpan:3 }, 'Composite score'),
              React.createElement('td', { className:'py-3 pr-4' }, '100%'),
              React.createElement('td', { className:'py-3 pr-4 text-lg text-slate-900' }, health.dimensions.reduce((s,d)=>s+d.contribution,0).toFixed(1) + ' → ' + health.compositeScore),
              React.createElement('td', { colSpan:3 })
            )
          )
        ),
        React.createElement('p', { className:'text-xs text-slate-400 mt-2' }, '* For Support pressure: effective score = 100 − raw score (higher pressure = lower health contribution)')
      )
    ),
    
    // 90-day trend chart
    React.createElement(Card, { className:'p-5' },
      React.createElement('h4', { className:'font-semibold text-slate-900 mb-4' }, '90-day health trend'),
      React.createElement('div', { className:'h-48' },
        React.createElement(ResponsiveContainer, { width:'100%', height:'100%' },
          React.createElement(AreaChart, { data:histData },
            React.createElement(CartesianGrid, { strokeDasharray:'3 3', stroke:'#f1f5f9' }),
            React.createElement(XAxis, { dataKey:'date', tick:{fontSize:10}, tickFormatter:d=>d.slice(5) }),
            React.createElement(YAxis, { domain:[0,100], tick:{fontSize:10} }),
            React.createElement(Tooltip, { formatter:v=>[v,'Score'] }),
            React.createElement('defs', null, React.createElement('linearGradient', {id:'healthGrad',x1:'0',y1:'0',x2:'0',y2:'1'}, React.createElement('stop',{offset:'5%',stopColor:health.band==='red'?'#ef4444':health.band==='yellow'?'#f59e0b':'#22c55e',stopOpacity:0.3}), React.createElement('stop',{offset:'95%',stopColor:'#ffffff',stopOpacity:0}))),
            React.createElement(Area, { type:'monotone', dataKey:'score', stroke:health.band==='red'?'#ef4444':health.band==='yellow'?'#f59e0b':'#22c55e', fill:'url(#healthGrad)', strokeWidth:2 }),
            React.createElement('line', { x1:'0', y1:'33', x2:'100%', y2:'33', stroke:'#ef4444', strokeDasharray:'4 4' })
          )
        )
      )
    )
  );
}

function GoalsTab({ customer, goals, state, dispatch, navigate, focusGoalId }) {
  const [showNewTask, setShowNewTask] = useState(null);
  const [skipReason, setSkipReason] = useState('');
  const [showSkip, setShowSkip] = useState(null);
  const [showPublish, setShowPublish] = useState(null);
  
  return React.createElement('div', { className:'space-y-4' },
    goals.length === 0 && React.createElement(Card, { className:'p-8 text-center' },
      React.createElement('p', { className:'text-slate-500 mb-4' }, 'No goals for this customer yet.'),
      React.createElement(Btn, { variant:'primary' }, '+ Create goal')
    ),
    goals.map(g => {
      const tasks = g.taskIds.map(id=>state.tasks[id]).filter(Boolean);
      const prog = goalProgress(g, state.tasks);
      const sharedProg = sharedGoalProgress(g, state.tasks);
      const isAcceptable = g.status === 'not_started' && g.source === 'signal_triggered';
      
      const isFocused = focusGoalId === g.id;
      return React.createElement(Card, { key:g.id, className:'overflow-hidden ' + (isFocused ? 'ring-2 ring-indigo-400 border-indigo-300' : '') },
        isFocused && React.createElement('div', { className:'px-4 py-1.5 bg-indigo-50 border-b border-indigo-100 text-[10px] font-bold text-indigo-700 uppercase tracking-wider' }, 'Opened from your dashboard'),
        // Goal header
        React.createElement('div', { className:'p-4 border-b' },
          React.createElement('div', { className:'flex items-start justify-between' },
            React.createElement('div', { className:'flex-1 min-w-0' },
              React.createElement('div', { className:'flex items-center gap-2 flex-wrap' },
                React.createElement('h4', { className:'font-semibold text-slate-900' }, g.title),
                React.createElement(StatusBadge, { status:g.status }),
                React.createElement(SeverityBadge, { severity:g.priority }),
                g.visibility === 'shared' && React.createElement('span', { className:`px-2 py-0.5 text-xs rounded-full font-medium ${g.publicationStatus==='published'?'bg-teal-100 text-teal-700':'bg-amber-100 text-amber-700'}` }, g.publicationStatus === 'published' ? '👁 Published' : '👁 Shared draft'),
                g.source === 'signal_triggered' && React.createElement('span', { className:'px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full' }, '⚡ Auto-created')
              ),
              React.createElement('p', { className:'text-xs text-slate-500 mt-1' }, `Due: ${g.dueDate ? new Date(g.dueDate).toLocaleDateString() : 'No date'} · Owner: ${USERS[g.ownerId]?.name}`),
              React.createElement('p', { className:'text-sm text-slate-600 mt-1.5' }, g.description.substring(0,120) + (g.description.length > 120 ? '...' : ''))
            ),
            React.createElement('div', { className:'flex gap-2 ml-4' },
              isAcceptable && React.createElement(Btn, { variant:'success', size:'sm', onClick:()=>dispatch({type:'ACCEPT_GOAL',goalId:g.id}) }, '✓ Accept plan'),
              !isAcceptable && g.status !== 'completed' && g.status !== 'abandoned' && g.visibility === 'internal' && React.createElement(Btn, { variant:'secondary', size:'xs', onClick:()=>dispatch({type:'CHANGE_GOAL_VISIBILITY',goalId:g.id,visibility:'shared'}) }, 'Share with customer'),
              g.visibility === 'shared' && g.publicationStatus === 'draft' && React.createElement(Btn, { variant:'teal', size:'xs', onClick:()=>setShowPublish(g.id) }, '📢 Publish'),
              React.createElement(Btn, { variant:'ghost', size:'xs', onClick:()=>navigate(`/goals/${g.id}`) }, 'Full detail →')
            )
          ),
          // Progress
          React.createElement('div', { className:'flex items-center gap-3 mt-3' },
            React.createElement('div', { className:'flex-1 bg-slate-100 rounded-full h-2' },
              React.createElement('div', { className:'h-2 rounded-full bg-indigo-500 transition-all', style:{width:`${prog}%`} })
            ),
            React.createElement('span', { className:'text-xs text-slate-600 whitespace-nowrap' }, `${prog}% complete`),
            g.visibility === 'shared' && React.createElement('span', { className:'text-xs text-teal-600 whitespace-nowrap' }, `Customer sees ${sharedProg}%`)
          )
        ),
        
        // Tasks
        React.createElement('div', { className:'divide-y' },
          tasks.map(t => React.createElement('div', { key:t.id, className:'px-4 py-3 flex items-center gap-3 hover:bg-slate-50' },
            React.createElement('div', { className:`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${t.status==='done'?'bg-green-500 border-green-500':t.status==='skipped'?'bg-gray-200 border-gray-300':'border-slate-300'}` },
              t.status === 'done' && React.createElement('span', { className:'text-white text-xs' }, '✓'),
              t.status === 'skipped' && React.createElement('span', { className:'text-gray-400 text-xs' }, '—')
            ),
            React.createElement('div', { className:'flex-1 min-w-0' },
              React.createElement('p', { className:`text-sm ${t.status==='skipped'?'line-through text-slate-400':'text-slate-800'}` }, t.title),
              React.createElement('div', { className:'flex items-center gap-2 mt-0.5' },
                React.createElement('span', { className:`px-1.5 py-0.5 text-xs rounded ${t.visibility==='shared'?'bg-teal-100 text-teal-700':'bg-gray-100 text-gray-500'}` }, t.visibility === 'shared' ? '👁 Shared' : '🔒 Internal'),
                t.dueDate && React.createElement('span', { className:'text-xs text-slate-400' }, 'Due ' + new Date(t.dueDate).toLocaleDateString('en-US',{month:'short',day:'numeric'})),
                t.outcomeNote && React.createElement('span', { className:'text-xs text-green-600' }, '✓ ' + t.outcomeNote.substring(0,40))
              )
            ),
            React.createElement('div', { className:'flex gap-1 flex-shrink-0' },
              t.status === 'todo' && React.createElement(Btn, { variant:'primary', size:'xs', onClick:()=>dispatch({type:'START_TASK',taskId:t.id}) }, 'Start'),
              t.status === 'in_progress' && React.createElement(Btn, { variant:'success', size:'xs', onClick:()=>dispatch({type:'COMPLETE_TASK',taskId:t.id}) }, '✓ Done'),
              t.status !== 'done' && t.status !== 'skipped' && React.createElement(Btn, { variant:'ghost', size:'xs', onClick:()=>setShowSkip(t.id) }, 'Skip')
            )
          ))
        )
      );
    }),
    
    // Skip modal
    showSkip && React.createElement(Modal, { open:true, onClose:()=>setShowSkip(null), title:'Skip task' },
      React.createElement('p', { className:'text-sm text-slate-600 mb-3' }, 'Please provide a reason for skipping this task.'),
      React.createElement('textarea', { value:skipReason, onChange:e=>setSkipReason(e.target.value), placeholder:'Reason for skipping...', rows:3, className:'w-full text-sm border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500' }),
      React.createElement('div', { className:'flex gap-2 mt-4' },
        React.createElement(Btn, { variant:'secondary', onClick:()=>{ dispatch({type:'SKIP_TASK',taskId:showSkip,reason:skipReason||'No reason provided'}); setShowSkip(null); setSkipReason(''); } }, 'Skip task'),
        React.createElement(Btn, { variant:'ghost', onClick:()=>setShowSkip(null) }, 'Cancel')
      )
    ),
    
    // Publish modal
    showPublish && React.createElement(Modal, { open:true, onClose:()=>setShowPublish(null), title:'Publish success plan' },
      React.createElement('p', { className:'text-sm text-slate-600 mb-4' }, 'Publishing this goal will make it visible to the customer in their portal. Only shared tasks will be shown. Internal tasks remain hidden.'),
      React.createElement('p', { className:'text-xs text-amber-600 bg-amber-50 p-3 rounded-lg' }, '⚠ This cannot be undone without explicitly unpublishing.'),
      React.createElement('div', { className:'flex gap-2 mt-4' },
        React.createElement(Btn, { variant:'teal', onClick:()=>{ dispatch({type:'PUBLISH_GOAL',goalId:showPublish}); setShowPublish(null); } }, '📢 Publish plan'),
        React.createElement(Btn, { variant:'ghost', onClick:()=>setShowPublish(null) }, 'Cancel')
      )
    )
  );
}

function TimelineTab({ customer, goals, risks, state, meetings, navigate }) {
  const [view, setView] = useState('account');
  const attrChanges = (state && state.attrChanges) || [];
  const account = getAccountActivity(customer, goals, risks, attrChanges);
  const touch = getTouchpoints(customer, state && state.emails, meetings);
  const events = view === 'account' ? account : touch;

  return React.createElement('div', { className:'space-y-4' },
    React.createElement('div', { className:'flex items-center gap-3 flex-wrap' },
      React.createElement('div', { className:'flex gap-1 bg-white border border-slate-200 rounded-lg p-1' },
        [['account','Account activity',account.length],['touchpoints','Touchpoints',touch.length]].map(v =>
          React.createElement('button', { key:v[0], onClick:()=>setView(v[0]),
            className:`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${view===v[0]?'bg-indigo-600 text-white':'text-slate-600 hover:bg-slate-100'}` },
            v[1] + ' \u00b7 ' + v[2]))),
      React.createElement('span', { className:'text-xs text-slate-400 ml-auto' },
        view === 'account'
          ? 'Health, goals, risks and attribute changes \u2014 including the reason given'
          : 'When the customer emailed, and when meetings were held')
    ),

    React.createElement(Card, { className:'p-5' },
      events.length === 0
        ? React.createElement('p', { className:'text-sm text-slate-400 text-center py-8' },
            view === 'account' ? 'No account activity recorded yet' : 'No touchpoints recorded yet')
        : React.createElement('div', null,
            events.map((e,i) => React.createElement('div', { key:i, className:'flex gap-3' },
              React.createElement('div', { className:'flex flex-col items-center flex-shrink-0' },
                React.createElement('span', { className:`w-8 h-8 rounded-full flex items-center justify-center text-sm ${ADMIN_TONES[e.tone]||ADMIN_TONES.slate}` }, e.icon),
                i < events.length-1 && React.createElement('span', { className:'w-px flex-1 bg-slate-200 my-1' })),
              React.createElement('div', { className:'flex-1 min-w-0 pb-5' },
                React.createElement('div', { className:'flex items-center gap-2 flex-wrap' },
                  React.createElement('p', { className:'text-sm font-semibold text-slate-800' }, e.title),
                  React.createElement(CxPill, { tone: e.tone }, e.kind)),
                React.createElement('p', { className:'text-[11px] text-slate-400 mt-0.5' },
                  (e.meta || fmtWhen(e.at)) + (e.by ? ' \u00b7 by ' + ((USERS[e.by]||{}).name || e.by) : '')),
                // A recorded reason is the point of the audit trail, so it gets its own block
                e.isReason && e.detail
                  ? React.createElement('div', { className:'mt-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2' },
                      React.createElement('p', { className:'text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-0.5' }, 'Reason given'),
                      React.createElement('p', { className:'text-xs text-amber-900 leading-relaxed' }, e.detail))
                  : e.detail && React.createElement('p', { className:'text-xs text-slate-500 mt-0.5' }, e.detail)
              )
            ))
          )
    )
  );
}

// ============================================================
// SECTION 10: GOAL DETAIL PAGE
// ============================================================

function GoalDetail() {
  const { state, dispatch } = useApp();
  const { goalId } = useParams();
  const navigate = useNavigate();
  const [showSkip, setShowSkip] = useState(null);
  const [skipReason, setSkipReason] = useState('');
  const [showPublish, setShowPublish] = useState(false);
  
  const goal = state.goals[goalId];
  if(!goal) return React.createElement('div', { className:'p-8 text-slate-400' }, 'Goal not found');
  
  const customer = state.customers.find(c=>c.id===goal.customerId);
  const tasks = goal.taskIds.map(id=>state.tasks[id]).filter(Boolean);
  const prog = goalProgress(goal, state.tasks);
  const sharedProg = sharedGoalProgress(goal, state.tasks);
  const isAcceptable = goal.status === 'not_started' && goal.source === 'signal_triggered';
  
  return React.createElement('div', { className:'space-y-5' },
    // Breadcrumb
    React.createElement('div', { className:'flex items-center gap-2 text-sm text-slate-500' },
      React.createElement('button', { onClick:()=>navigate(`/customers/${goal.customerId}`), className:'hover:text-indigo-600' }, customer?.name),
      React.createElement('span', null, '/'),
      React.createElement('span', { className:'text-slate-900 font-medium' }, 'Goal')
    ),
    
    React.createElement('div', { className:'grid grid-cols-3 gap-5' },
      // Main column
      React.createElement('div', { className:'col-span-2 space-y-4' },
        // Header card
        React.createElement(Card, { className:'p-5' },
          React.createElement('div', { className:'flex items-start gap-4' },
            React.createElement('div', { className:'flex-1' },
              React.createElement('div', { className:'flex items-center gap-2 flex-wrap mb-2' },
                React.createElement(StatusBadge, { status:goal.status }),
                React.createElement(SeverityBadge, { severity:goal.priority }),
                goal.visibility === 'shared' && React.createElement('span', { className:`px-2 py-0.5 text-xs rounded-full font-medium ${goal.publicationStatus==='published'?'bg-teal-100 text-teal-700':'bg-amber-100 text-amber-700'}` }, goal.publicationStatus === 'published' ? '👁 Published' : '📋 Shared draft'),
                goal.source === 'signal_triggered' && React.createElement('span', { className:'px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full' }, '⚡ Auto-created')
              ),
              React.createElement('h2', { className:'text-xl font-bold text-slate-900' }, goal.title),
              React.createElement('p', { className:'text-sm text-slate-500 mt-1' }, customer?.name + ' · ' + goal.type.replace('_',' ')),
              React.createElement('div', { className:'flex items-center gap-3 mt-3' },
                React.createElement('div', { className:'flex-1 bg-slate-100 rounded-full h-2.5' },
                  React.createElement('div', { className:'h-2.5 rounded-full bg-indigo-500 transition-all', style:{width:`${prog}%`} })
                ),
                React.createElement('span', { className:'text-sm font-semibold text-slate-700' }, prog + '% complete')
              ),
              goal.visibility === 'shared' && React.createElement('p', { className:'text-xs text-teal-600 mt-1' }, `Customer sees: ${sharedProg}% (shared tasks only)`)
            ),
            React.createElement('div', { className:'flex flex-col gap-2' },
              isAcceptable && React.createElement(Btn, { variant:'success', onClick:()=>dispatch({type:'ACCEPT_GOAL',goalId}) }, '✓ Accept plan'),
              goal.visibility === 'shared' && goal.publicationStatus === 'draft' && React.createElement(Btn, { variant:'teal', size:'sm', onClick:()=>setShowPublish(true) }, '📢 Publish'),
              goal.visibility === 'internal' && goal.status !== 'completed' && React.createElement(Btn, { variant:'secondary', size:'sm', onClick:()=>dispatch({type:'CHANGE_GOAL_VISIBILITY',goalId,visibility:'shared'}) }, 'Share with customer'),
              React.createElement(Btn, { variant:'secondary', size:'sm', onClick:()=>navigate(`/portal-preview/${goal.customerId}`) }, '👁 Preview portal')
            )
          )
        ),
        
        // Description
        React.createElement(Card, { className:'p-5' },
          React.createElement('h4', { className:'font-semibold text-slate-900 mb-2' }, 'Description'),
          React.createElement('p', { className:'text-sm text-slate-700 leading-relaxed' }, goal.description),
          React.createElement('div', { className:'mt-3 p-3 bg-green-50 rounded-lg' },
            React.createElement('p', { className:'text-xs font-medium text-green-700' }, 'Success metric'),
            React.createElement('p', { className:'text-sm text-green-900 mt-0.5' }, goal.successMetric)
          )
        ),
        
        // Tasks
        React.createElement(Card, { className:'overflow-hidden' },
          React.createElement('div', { className:'px-5 py-3 border-b flex items-center justify-between' },
            React.createElement('h4', { className:'font-semibold text-slate-900' }, 'Tasks'),
            React.createElement('span', { className:'text-xs text-slate-500' }, tasks.filter(t=>t.status==='done').length + '/' + tasks.length + ' done')
          ),
          React.createElement('div', { className:'divide-y' },
            tasks.map(t => React.createElement('div', { key:t.id, className:'px-5 py-4' },
              React.createElement('div', { className:'flex items-start gap-3' },
                React.createElement('div', { className:`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${t.status==='done'?'bg-green-500 border-green-500 text-white':t.status==='in_progress'?'border-indigo-500':t.status==='skipped'?'border-gray-300 bg-gray-100':'border-slate-300'}` },
                  t.status === 'done' && '✓',
                  t.status === 'in_progress' && React.createElement('div',{className:'w-2 h-2 bg-indigo-500 rounded-full'}),
                  t.status === 'skipped' && React.createElement('span',{className:'text-xs text-gray-400'},'—')
                ),
                React.createElement('div', { className:'flex-1' },
                  React.createElement('p', { className:`text-sm font-medium ${t.status==='skipped'?'line-through text-slate-400':'text-slate-900'}` }, t.title),
                  React.createElement('p', { className:'text-xs text-slate-500 mt-0.5' }, t.description.substring(0,100) + (t.description.length>100?'...':'')),
                  React.createElement('div', { className:'flex items-center gap-2 mt-1' },
                    React.createElement(StatusBadge, { status:t.status }),
                    React.createElement('span', { className:`px-1.5 py-0.5 text-xs rounded ${t.visibility==='shared'?'bg-teal-100 text-teal-700':'bg-gray-100 text-gray-500'}` }, t.visibility === 'shared' ? '👁 Customer-visible' : '🔒 Internal'),
                    t.dueDate && React.createElement('span', { className:'text-xs text-slate-400' }, 'Due ' + new Date(t.dueDate).toLocaleDateString('en-US',{month:'short',day:'numeric'})),
                    React.createElement('span', { className:'text-xs text-slate-400' }, USERS[t.ownerId]?.name)
                  ),
                  t.outcomeNote && React.createElement('p', { className:'text-xs text-green-600 mt-1 font-medium' }, '✓ ' + t.outcomeNote)
                ),
                React.createElement('div', { className:'flex gap-1' },
                  t.status === 'todo' && React.createElement(Btn, { variant:'primary', size:'xs', onClick:()=>dispatch({type:'START_TASK',taskId:t.id}) }, 'Start'),
                  t.status === 'in_progress' && React.createElement(Btn, { variant:'success', size:'xs', onClick:()=>dispatch({type:'COMPLETE_TASK',taskId:t.id}) }, '✓ Done'),
                  t.status !== 'done' && t.status !== 'skipped' && React.createElement(Btn, { variant:'ghost', size:'xs', onClick:()=>setShowSkip(t.id) }, 'Skip')
                )
              )
            )),
            tasks.length === 0 && React.createElement('div', { className:'px-5 py-6 text-sm text-slate-400 text-center' }, 'No tasks yet')
          )
        )
      ),
      
      // Right rail
      React.createElement('div', { className:'space-y-4' },
        // Details
        React.createElement(Card, { className:'p-4' },
          React.createElement('h4', { className:'font-semibold text-slate-900 text-sm mb-3' }, 'Details'),
          React.createElement('div', { className:'space-y-2 text-sm' },
            React.createElement('div', { className:'flex justify-between' }, React.createElement('span',{className:'text-slate-500'},'Customer'), React.createElement('span',{className:'font-medium'},customer?.name)),
            React.createElement('div', { className:'flex justify-between' }, React.createElement('span',{className:'text-slate-500'},'Owner'), React.createElement('span',{className:'font-medium'},USERS[goal.ownerId]?.name)),
            goal.dueDate && React.createElement('div', { className:'flex justify-between' }, React.createElement('span',{className:'text-slate-500'},'Due date'), React.createElement('span',{className:'font-medium'},new Date(goal.dueDate).toLocaleDateString())),
            React.createElement('div', { className:'flex justify-between' }, React.createElement('span',{className:'text-slate-500'},'Type'), React.createElement('span',{className:'font-medium capitalize'},goal.type.replace('_',' '))),
            React.createElement('div', { className:'flex justify-between' }, React.createElement('span',{className:'text-slate-500'},'Visibility'), React.createElement('span',{className:'font-medium capitalize'},goal.visibility)),
            React.createElement('div', { className:'flex justify-between' }, React.createElement('span',{className:'text-slate-500'},'Publication'), React.createElement('span',{className:'font-medium capitalize'},goal.publicationStatus))
          )
        ),
        
        // Source
        goal.source === 'signal_triggered' && React.createElement(Card, { className:'p-4' },
          React.createElement('h4', { className:'font-semibold text-slate-900 text-sm mb-2' }, 'Source'),
          React.createElement('div', { className:'p-2 bg-purple-50 rounded-lg' },
            React.createElement('p', { className:'text-xs font-medium text-purple-700' }, '⚡ Signal-triggered'),
          )
        ),
        
        // Linked risk
        goal.riskId && state.risks[goal.riskId] && React.createElement(Card, { className:'p-4' },
          React.createElement('h4', { className:'font-semibold text-slate-900 text-sm mb-2' }, 'Mitigating risk'),
          React.createElement('div', { className:'p-2 bg-red-50 rounded-lg' },
            React.createElement(SeverityBadge, { severity:state.risks[goal.riskId].severity }),
            React.createElement('p', { className:'text-xs text-slate-700 mt-1' }, state.risks[goal.riskId].title),
            React.createElement('p', { className:'text-xs text-red-600 mt-1' }, formatARR(state.risks[goal.riskId].amountAtRisk) + ' at risk')
          )
        )
      )
    ),
    
    showSkip && React.createElement(Modal, { open:true, onClose:()=>setShowSkip(null), title:'Skip task' },
      React.createElement('textarea', { value:skipReason, onChange:e=>setSkipReason(e.target.value), placeholder:'Reason for skipping...', rows:3, className:'w-full text-sm border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500' }),
      React.createElement('div', { className:'flex gap-2 mt-4' },
        React.createElement(Btn, { variant:'secondary', onClick:()=>{ dispatch({type:'SKIP_TASK',taskId:showSkip,reason:skipReason||'No reason provided'}); setShowSkip(null); setSkipReason(''); } }, 'Skip task'),
        React.createElement(Btn, { variant:'ghost', onClick:()=>setShowSkip(null) }, 'Cancel')
      )
    ),
    
    showPublish && React.createElement(Modal, { open:true, onClose:()=>setShowPublish(false), title:'Publish success plan' },
      React.createElement('p', { className:'text-sm text-slate-600 mb-4' }, 'Publishing makes this goal visible to the customer. Only shared tasks will be shown.'),
      React.createElement('p', { className:'text-xs text-amber-600 bg-amber-50 p-3 rounded-lg' }, '⚠ Requires explicit confirmation. Customer can view this in their portal after publishing.'),
      React.createElement('div', { className:'flex gap-2 mt-4' },
        React.createElement(Btn, { variant:'teal', onClick:()=>{ dispatch({type:'PUBLISH_GOAL',goalId}); setShowPublish(false); } }, '📢 Publish plan'),
        React.createElement(Btn, { variant:'ghost', onClick:()=>setShowPublish(false) }, 'Cancel')
      )
    )
  );
}

// ============================================================
// SECTION 11: HEALTH PORTFOLIO
// ============================================================

function HealthPortfolio() {
  const { state } = useApp();
  const navigate = useNavigate();
  
  const customers = state.customers;
  const healthData = customers.map(c => ({ ...c, health: HEALTH_SIGNALS[c.healthId] })).filter(c=>c.health);
  
  const byBand = {
    red: healthData.filter(c=>c.health.band==='red'),
    yellow: healthData.filter(c=>c.health.band==='yellow'),
    green: healthData.filter(c=>c.health.band==='green'),
  };
  
  const weeklyTrend = Array.from({length:8},(_,i)=>({
    week:`W${i+1}`,
    red: [4,5,5,4,5,4,4,4][i],
    yellow: [8,7,8,7,7,7,7,7][i],
    green: [12,12,11,13,12,13,13,13][i],
  }));
  
  return React.createElement('div', { className:'space-y-5' },
    // Summary
    React.createElement('div', { className:'grid grid-cols-4 gap-4' },
      React.createElement(MetricCard, { label:'Total customers', value:customers.length }),
      React.createElement(MetricCard, { label:'At risk (red)', value:byBand.red.length, sub:formatARR(byBand.red.reduce((s,c)=>s+c.arr,0)) + ' ARR', subColor:'text-red-600' }),
      React.createElement(MetricCard, { label:'Needs attention (yellow)', value:byBand.yellow.length, sub:formatARR(byBand.yellow.reduce((s,c)=>s+c.arr,0)) + ' ARR', subColor:'text-amber-600' }),
      React.createElement(MetricCard, { label:'Healthy (green)', value:byBand.green.length, sub:formatARR(byBand.green.reduce((s,c)=>s+c.arr,0)) + ' ARR', subColor:'text-green-600' })
    ),
    
    React.createElement('div', { className:'grid grid-cols-2 gap-5 items-stretch' },
      // Trend chart
      React.createElement(Card, { className:'p-5' },
        React.createElement('h4', { className:'font-semibold text-slate-900 mb-4' }, 'Health distribution over time'),
        React.createElement('div', { className:'h-48' },
          React.createElement(ResponsiveContainer, { width:'100%', height:'100%' },
            React.createElement(BarChart, { data:weeklyTrend },
              React.createElement(CartesianGrid, { strokeDasharray:'3 3', stroke:'#f1f5f9' }),
              React.createElement(XAxis, { dataKey:'week', tick:{fontSize:11} }),
              React.createElement(YAxis, { tick:{fontSize:11} }),
              React.createElement(Tooltip),
              React.createElement(Legend, { wrapperStyle:{fontSize:11} }),
              React.createElement(Bar, { dataKey:'red', name:'At risk', fill:'#ef4444', stackId:'a' }),
              React.createElement(Bar, { dataKey:'yellow', name:'Needs attention', fill:'#f59e0b', stackId:'a' }),
              React.createElement(Bar, { dataKey:'green', name:'Healthy', fill:'#22c55e', stackId:'a' })
            )
          )
        )
      ),
      
      // ARR by band
      React.createElement(Card, { className:'p-5' },
        React.createElement('h4', { className:'font-semibold text-slate-900 mb-4' }, 'ARR by health band'),
        React.createElement('div', { className:'h-48' },
          React.createElement(ResponsiveContainer, { width:'100%', height:'100%' },
            React.createElement(PieChart, null,
              React.createElement(Pie, { data:[{name:'At risk',value:byBand.red.reduce((s,c)=>s+c.arr,0)},{name:'Needs attention',value:byBand.yellow.reduce((s,c)=>s+c.arr,0)},{name:'Healthy',value:byBand.green.reduce((s,c)=>s+c.arr,0)}], cx:'50%', cy:'50%', outerRadius:80, dataKey:'value', label:({name,percent})=>`${name} ${Math.round(percent*100)}%`, labelLine:false },
                React.createElement(Cell, { key:'red', fill:'#ef4444' }),
                React.createElement(Cell, { key:'yellow', fill:'#f59e0b' }),
                React.createElement(Cell, { key:'green', fill:'#22c55e' })
              ),
              React.createElement(Tooltip, { formatter:v=>formatARR(v) })
            )
          )
        )
      )
    ),
    
    // Customer table
    React.createElement(Card, { className:'overflow-hidden' },
      React.createElement('div', { className:'px-4 py-3 border-b' }, React.createElement('h4',{className:'font-semibold text-slate-900'},'Customer health detail')),
      React.createElement('div', { className:'overflow-x-auto' },
        React.createElement('table', { className:'w-full text-sm' },
          React.createElement('thead', null, React.createElement('tr', { className:'bg-slate-50 border-b' },
            ['Customer','Health','Score','Change','ARR','Renewal','Data quality','Owner'].map(h=>React.createElement('th',{key:h,className:'px-4 py-3 text-left text-xs font-medium text-slate-500'},h))
          )),
          React.createElement('tbody', null,
            healthData.sort((a,b)=>a.health.compositeScore-b.health.compositeScore).map(c => React.createElement('tr', { key:c.id, className:'border-b hover:bg-indigo-50 cursor-pointer', onClick:()=>navigate(`/customers/${c.id}`) },
              React.createElement('td', { className:'px-4 py-3 font-medium text-slate-900' }, c.name),
              React.createElement('td', { className:'px-4 py-3' }, React.createElement(HealthBadge, { band:c.health.band })),
              React.createElement('td', { className:'px-4 py-3 font-semibold' }, c.health.compositeScore),
              React.createElement('td', { className:'px-4 py-3 font-medium ' + (c.health.compositeScore-(c.health.previousScore||c.health.compositeScore)>0?'text-green-600':'text-red-600') }, c.health.previousScore != null ? ((c.health.compositeScore-c.health.previousScore)>0?'+':'')+(c.health.compositeScore-c.health.previousScore) : '—'),
              React.createElement('td', { className:'px-4 py-3' }, formatARR(c.arr)),
              React.createElement('td', { className:'px-4 py-3 text-slate-500' }, (() => { const r = state.renewals.find(r=>r.customerId===c.id); return r ? r.daysRemaining + 'd' : '—'; })()),
              React.createElement('td', { className:'px-4 py-3 capitalize' }, React.createElement('span',{className:`text-xs ${c.health.dataQuality==='complete'?'text-green-600':c.health.dataQuality==='partial'?'text-amber-600':'text-red-600'}`},c.health.dataQuality)),
              React.createElement('td', { className:'px-4 py-3' }, React.createElement(Avatar, { user:USERS[c.ownerId] }))
            ))
          )
        )
      )
    )
  );
}

// ============================================================
// SECTION 12: RISKS
// ============================================================

function Risks() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const { query } = useLocation();
  const ownerFilter = query.owner || null;
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [sigFilter, setSigFilter] = useState('all');
  
  const ownedCustomerIds = ownerFilter ? state.customers.filter(c=>c.ownerId===ownerFilter).map(c=>c.id) : null;
  const risks = Object.values(state.risks).filter(r => !ownedCustomerIds || ownedCustomerIds.includes(r.customerId));
  const totalAtRisk = risks.filter(r=>r.status!=='resolved').reduce((s,r)=>s+r.amountAtRisk,0);
  const critical = risks.filter(r=>r.severity==='critical' && r.status!=='resolved');
  const noMitigation = risks.filter(r=>!r.mitigationGoalId && r.status==='open');
  const bySignal = {};
  risks.forEach(r => { if(r.signal) bySignal[r.signal] = (bySignal[r.signal]||0) + 1; });
  const shownRisks = sigFilter === 'all' ? risks : risks.filter(r => r.signal === sigFilter);
  
  const drawer = selectedRisk ? state.risks[selectedRisk] : null;
  const drawerCustomer = drawer ? state.customers.find(c=>c.id===drawer.customerId) : null;
  const drawerGoal = drawer?.mitigationGoalId ? state.goals[drawer.mitigationGoalId] : null;
  
  return React.createElement('div', { className:'space-y-5' },
    ownerFilter && React.createElement('div', { className:'flex items-center gap-2' },
      React.createElement('span', { className:'text-xs text-slate-400' }, 'Filtered by:'),
      React.createElement('span', { className:'inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold' },
        (USERS[ownerFilter] ? USERS[ownerFilter].name : ownerFilter) + "'s portfolio",
        React.createElement('button', { onClick:()=>navigate('/risks'), className:'text-indigo-400 hover:text-indigo-700' }, '\u2715'))
    ),
    // Summary
    React.createElement('div', { className:'grid grid-cols-4 gap-4' },
      React.createElement(MetricCard, { label:'Total at risk', value:formatARR(totalAtRisk), subColor:'text-red-600' }),
      React.createElement(MetricCard, { label:'Critical risks', value:critical.length }),
      React.createElement(MetricCard, { label:'No mitigation goal', value:noMitigation.length, subColor:'text-red-600' }),
      React.createElement(MetricCard, { label:'Resolved this quarter', value:risks.filter(r=>r.status==='resolved').length })
    ),
    
    // Table
    React.createElement(Card, { className:'p-4' },
      React.createElement(CxLabel, { right:React.createElement('span',{className:'text-[11px] text-slate-400'},
        shownRisks.filter(r=>r.status!=='resolved').length + ' of ' + risks.filter(r=>r.status!=='resolved').length + ' shown') }, 'Risk signals'),
      React.createElement('div', { className:'grid grid-cols-9 gap-2' },
        [{ id:'all', label:'All signals', icon:'\u25C9', tone:'slate', what:'Every open risk across the eight signal types.' }]
          .concat(Object.values(RISK_SIGNALS)).map(sig => {
            const n = sig.id==='all' ? risks.filter(r=>r.status!=='resolved').length : (bySignal[sig.id]||0);
            const on = sigFilter === sig.id;
            return React.createElement('button', { key:sig.id, onClick:()=>setSigFilter(sig.id), title:sig.what,
              className:`text-left rounded-xl border p-2 transition-all ${on?'border-indigo-400 bg-indigo-50/60 ring-1 ring-indigo-200':'border-slate-200 hover:border-slate-300'}` },
              React.createElement('span', { className:`inline-flex w-6 h-6 rounded-lg items-center justify-center text-xs mb-1 ${ADMIN_TONES[sig.tone]||ADMIN_TONES.slate}` }, sig.icon),
              React.createElement('p', { className:'text-[10px] font-bold text-slate-800 leading-tight' }, sig.label),
              React.createElement('p', { className:'text-[10px] text-slate-400 mt-0.5' }, n));
          })),
      sigFilter !== 'all' && RISK_SIGNALS[sigFilter] && React.createElement('div', { className:'mt-3 pt-3 border-t border-slate-100' },
        React.createElement('p', { className:'text-sm font-semibold text-slate-800' }, RISK_SIGNALS[sigFilter].what),
        React.createElement('p', { className:'text-xs text-slate-600 mt-1 leading-relaxed' }, RISK_SIGNALS[sigFilter].why),
        React.createElement('p', { className:'text-xs text-slate-700 mt-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5' },
          React.createElement('span',{className:'font-semibold'},'Recommended play: '), RISK_SIGNALS[sigFilter].play))),

    React.createElement(Card, { className:'overflow-hidden' },
      React.createElement('div', { className:'overflow-x-auto' },
        React.createElement('table', { className:'w-full text-sm' },
          React.createElement('thead', null, React.createElement('tr', { className:'bg-slate-50 border-b' },
            ['Customer','Risk','Signal','Severity','Amount at risk','Probability','Owner','Mitigation Goal','Status'].map(h=>React.createElement('th',{key:h,className:'px-4 py-3 text-left text-xs font-medium text-slate-500 whitespace-nowrap'},h))
          )),
          React.createElement('tbody', null,
            shownRisks.filter(r=>r.status!=='resolved').sort((a,b)=>['critical','high','medium','low'].indexOf(a.severity)-['critical','high','medium','low'].indexOf(b.severity)).map(r => {
              const customer = state.customers.find(c=>c.id===r.customerId);
              const goal = r.mitigationGoalId ? state.goals[r.mitigationGoalId] : null;
              return React.createElement('tr', { key:r.id, className:'border-b hover:bg-red-50 cursor-pointer transition-colors', onClick:()=>setSelectedRisk(r.id) },
                React.createElement('td', { className:'px-4 py-3 font-medium' }, customer?.name),
                React.createElement('td', { className:'px-4 py-3 text-slate-700 max-w-xs' },
                  React.createElement('p', { className:'truncate' }, r.title)
                ),
                React.createElement('td', { className:'px-4 py-3' },
                  (function(){ const sig = RISK_SIGNALS[r.signal];
                    return sig ? React.createElement(CxPill, { tone:sig.tone }, sig.icon + ' ' + sig.label)
                               : React.createElement('span', { className:'capitalize text-slate-600' }, r.category); })()),
                React.createElement('td', { className:'px-4 py-3' }, React.createElement(SeverityBadge, { severity:r.severity })),
                React.createElement('td', { className:'px-4 py-3 font-medium text-red-700' }, formatARR(r.amountAtRisk)),
                React.createElement('td', { className:'px-4 py-3' }, Math.round(r.probability*100) + '%'),
                React.createElement('td', { className:'px-4 py-3' }, React.createElement(Avatar, { user:USERS[r.ownerId] })),
                React.createElement('td', { className:'px-4 py-3' }, goal ? React.createElement('span',{className:'text-xs text-indigo-600 font-medium'},'✓ Covered') : React.createElement('span',{className:'text-xs text-red-600 font-medium'},'⚠ None')),
                React.createElement('td', { className:'px-4 py-3 capitalize' }, React.createElement('span',{className:`text-xs px-2 py-0.5 rounded-full font-medium ${r.status==='open'?'bg-red-100 text-red-700':r.status==='mitigating'?'bg-blue-100 text-blue-700':'bg-green-100 text-green-700'}`},r.status))
              );
            })
          )
        )
      )
    ),
    
    drawer && React.createElement(Drawer, { open:true, onClose:()=>setSelectedRisk(null), title:drawer.title },
      React.createElement('div', { className:'space-y-4' },
        React.createElement('div', { className:'flex items-center gap-2 flex-wrap' },
          React.createElement(SeverityBadge, { severity:drawer.severity }),
          React.createElement('span',{className:`px-2 py-0.5 text-xs rounded-full font-medium ${drawer.status==='open'?'bg-red-100 text-red-700':drawer.status==='mitigating'?'bg-blue-100 text-blue-700':'bg-green-100 text-green-700'}`},drawer.status),
          (function(){ const sig = RISK_SIGNALS[drawer.signal];
            return sig ? React.createElement(CxPill, { tone:sig.tone }, sig.icon + ' ' + sig.label) : null; })()
        ),

        // Measured signal detail
        drawer.metrics && React.createElement('div', { className:'grid grid-cols-3 gap-2' },
          drawer.metrics.map(m => React.createElement('div', { key:m[0], className:'bg-slate-50 rounded-lg px-2.5 py-2' },
            React.createElement('p', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider' }, m[0]),
            React.createElement('p', { className:'text-sm font-bold text-slate-800 mt-0.5' }, m[1])))),

        drawer.evidence && React.createElement('div', null,
          React.createElement('p', { className:'text-xs font-medium text-slate-500 mb-1.5' }, 'Evidence'),
          React.createElement('div', { className:'space-y-1' },
            drawer.evidence.map((ev,i)=>React.createElement('div', { key:i, className:'flex items-start gap-2' },
              React.createElement('span', { className:'text-red-400 text-xs mt-0.5' }, '\u2022'),
              React.createElement('p', { className:'text-xs text-slate-700 leading-relaxed' }, ev))))),

        (function(){ const sig = RISK_SIGNALS[drawer.signal];
          return sig ? React.createElement('div', { className:'bg-amber-50 border border-amber-100 rounded-lg px-3 py-2' },
            React.createElement('p', { className:'text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-0.5' }, 'Recommended play'),
            React.createElement('p', { className:'text-xs text-amber-900 leading-relaxed' }, sig.play)) : null; })(),
        React.createElement('div', null, React.createElement('p',{className:'text-xs font-medium text-slate-500'},'Customer'), React.createElement('p',{className:'font-medium'},drawerCustomer?.name)),
        React.createElement('div', null, React.createElement('p',{className:'text-xs font-medium text-slate-500'},'Amount at risk'), React.createElement('p',{className:'font-semibold text-red-700 text-lg'},formatARR(drawer.amountAtRisk))),
        React.createElement('div', null, React.createElement('p',{className:'text-xs font-medium text-slate-500'},'Probability'), React.createElement('p',{className:'font-medium'},Math.round(drawer.probability*100)+'%')),
        React.createElement('div', null, React.createElement('p',{className:'text-xs font-medium text-slate-500 mb-1'},'Root cause'), React.createElement('p',{className:'text-sm text-slate-700 leading-relaxed'},drawer.rootCause)),
        drawerGoal && React.createElement('div', { className:'p-3 bg-blue-50 rounded-lg' },
          React.createElement('p',{className:'text-xs font-medium text-blue-700'},'Mitigation goal'),
          React.createElement('p',{className:'text-sm font-medium text-slate-900 mt-0.5'},drawerGoal.title),
          React.createElement(StatusBadge,{status:drawerGoal.status})
        ),
        !drawerGoal && React.createElement('div', { className:'p-3 bg-red-50 rounded-lg' },
          React.createElement('p',{className:'text-sm text-red-700 font-medium'},'⚠ No mitigation goal'),
          React.createElement('p',{className:'text-xs text-red-600 mt-0.5'},'This risk has no active mitigation plan. Consider creating a goal.')
        ),
        React.createElement('div', { className:'flex flex-col gap-2 pt-2' },
          React.createElement(Btn, { variant:'primary', onClick:()=>{ setSelectedRisk(null); navigate(`/customers/${drawer.customerId}`); } }, 'Open customer'),
          !drawerGoal && React.createElement(Btn, { variant:'secondary' }, '+ Create mitigation goal'),
          React.createElement(Btn, { variant:'secondary', onClick:()=>dispatch({type:'DISMISS_PRIORITY',itemId:drawer.id}) }, 'Mark resolved')
        )
      )
    )
  );
}

// ============================================================
// SECTION 13: EXPANSION
// ============================================================

function Expansion() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const { query } = useLocation();
  const ownerFilter = query.owner || null;
  const [confirmQualify, setConfirmQualify] = useState(null);
  const [sigFilter, setSigFilter] = useState('all');
  
  const ownedIds = ownerFilter ? state.customers.filter(c=>c.ownerId===ownerFilter).map(c=>c.id) : null;
  const opps = Object.values(state.expansionOpps).filter(e=>e.qualificationStatus !== 'dismissed' && (!ownedIds || ownedIds.includes(e.customerId)));
  const potential = opps.reduce((s,e)=>s+e.estimatedArr,0);
  const qualified = opps.filter(e=>e.qualificationStatus==='qualified');
  const noOpp = opps.filter(e=>e.crmOpportunityState==='none');
  const bySignal = {};
  opps.forEach(o => { if(o.signal) bySignal[o.signal] = (bySignal[o.signal]||0) + 1; });
  const shownOpps = sigFilter === 'all' ? opps : opps.filter(o => o.signal === sigFilter);
  
  return React.createElement('div', { className:'space-y-5' },
    ownerFilter && React.createElement('div', { className:'flex items-center gap-2' },
      React.createElement('span', { className:'text-xs text-slate-400' }, 'Filtered by:'),
      React.createElement('span', { className:'inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold' },
        (USERS[ownerFilter] ? USERS[ownerFilter].name : ownerFilter) + "'s portfolio",
        React.createElement('button', { onClick:()=>navigate('/expansion'), className:'text-indigo-400 hover:text-indigo-700' }, '\u2715'))
    ),
    // Summary
    React.createElement('div', { className:'grid grid-cols-4 gap-4' },
      React.createElement(MetricCard, { label:'Expansion potential', value:formatARR(potential) }),
      React.createElement(MetricCard, { label:'Qualified pipeline', value:formatARR(qualified.reduce((s,e)=>s+e.estimatedArr,0)) }),
      React.createElement(MetricCard, { label:'No CRM opportunity', value:noOpp.length }),
      React.createElement(MetricCard, { label:'Conversion rate', value:'35%' })
    ),
    
    // Signal taxonomy — filter the pipeline by what triggered it
    React.createElement(Card, { className:'p-4' },
      React.createElement(CxLabel, { right:React.createElement('span',{className:'text-[11px] text-slate-400'},
        shownOpps.length + ' of ' + opps.length + ' shown') }, 'Expansion signals'),
      React.createElement('div', { className:'grid grid-cols-6 gap-2' },
        [{ id:'all', label:'All signals', icon:'\u25C9', tone:'slate',
           what:'Every open expansion candidate across the five signal types.' }]
          .concat(Object.values(EXPANSION_SIGNALS)).map(sig => {
            const n = sig.id==='all' ? opps.length : (bySignal[sig.id]||0);
            const on = sigFilter === sig.id;
            return React.createElement('button', { key:sig.id, onClick:()=>setSigFilter(sig.id), title:sig.what,
              className:`text-left rounded-xl border p-2.5 transition-all ${on?'border-indigo-400 bg-indigo-50/60 ring-1 ring-indigo-200':'border-slate-200 hover:border-slate-300'}` },
              React.createElement('span', { className:`inline-flex w-7 h-7 rounded-lg items-center justify-center text-sm mb-1.5 ${ADMIN_TONES[sig.tone]||ADMIN_TONES.slate}` }, sig.icon),
              React.createElement('p', { className:'text-[11px] font-bold text-slate-800 leading-tight' }, sig.label),
              React.createElement('p', { className:'text-[10px] text-slate-400 mt-0.5' }, n + ' account' + (n===1?'':'s')));
          })),
      sigFilter !== 'all' && EXPANSION_SIGNALS[sigFilter] && React.createElement('div', { className:'mt-3 pt-3 border-t border-slate-100' },
        React.createElement('p', { className:'text-sm font-semibold text-slate-800' }, EXPANSION_SIGNALS[sigFilter].what),
        React.createElement('p', { className:'text-xs text-slate-600 mt-1 leading-relaxed' }, EXPANSION_SIGNALS[sigFilter].why))),

    // Candidates
    React.createElement('div', { className:'space-y-3' },
      shownOpps.length === 0
        ? React.createElement(Card, { className:'p-10 text-center text-sm text-slate-400' }, 'No accounts are showing this signal right now')
        : shownOpps.slice().sort((a,b)=>b.estimatedArr-a.estimatedArr).map(opp => {
        const customer = state.customers.find(c=>c.id===opp.customerId);
        const health = HEALTH_SIGNALS[customer?.healthId];
        return React.createElement(Card, { key:opp.id, className:'p-5' },
          React.createElement('div', { className:'flex items-start justify-between gap-4' },
            React.createElement('div', { className:'flex-1' },
              React.createElement('div', { className:'flex items-center gap-3 flex-wrap' },
                React.createElement('h4', { className:'font-semibold text-slate-900' }, customer?.name),
                React.createElement(HealthBadge, { band:health?.band, score:health?.compositeScore }),
                React.createElement('span', { className:`px-2 py-0.5 text-xs rounded-full font-medium ${opp.qualificationStatus==='qualified'?'bg-teal-100 text-teal-700':'bg-amber-100 text-amber-700'}` }, opp.qualificationStatus),
                React.createElement('span', { className:`px-2 py-0.5 text-xs rounded-full font-medium ${opp.confidence==='high'?'bg-green-100 text-green-700':opp.confidence==='medium'?'bg-amber-100 text-amber-700':'bg-gray-100 text-gray-600'}` }, opp.confidence + ' confidence')
              ),
              React.createElement('p', { className:'text-2xl font-bold text-teal-700 mt-1' }, '+' + formatARR(opp.estimatedArr) + ' estimated ARR'),
              (function(){
                const sig = EXPANSION_SIGNALS[opp.signal];
                if (!sig) return React.createElement('p', { className:'text-sm text-slate-500 capitalize mt-0.5' }, opp.type.replace('_',' ') + ' expansion');
                return React.createElement('div', { className:'mt-1.5' },
                  React.createElement('div', { className:'flex items-center gap-2 flex-wrap' },
                    React.createElement(CxPill, { tone:sig.tone }, sig.icon + ' ' + sig.label),
                    React.createElement('span', { className:'text-xs text-slate-400 capitalize' }, opp.type.replace('_',' ') + ' expansion')),
                  opp.headline && React.createElement('p', { className:'text-sm font-semibold text-slate-800 mt-1.5' }, opp.headline),
                  opp.metrics && React.createElement('div', { className:'flex gap-5 mt-2 flex-wrap' },
                    opp.metrics.map(m => React.createElement('div', { key:m[0] },
                      React.createElement('p', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider' }, m[0]),
                      React.createElement('p', { className:'text-sm font-bold text-slate-800' }, m[1])))));
              })(),
              React.createElement('div', { className:'mt-3' },
                React.createElement('p', { className:'text-xs font-medium text-slate-500 mb-1.5' }, 'Evidence'),
                React.createElement('div', { className:'flex flex-wrap gap-1.5' },
                  opp.evidence.map((ev,i) => React.createElement('span', { key:i, className:'px-2 py-1 bg-teal-50 text-teal-800 text-xs rounded-lg font-medium' }, ev))
                )
              ),
              (function(){
                const sig = EXPANSION_SIGNALS[opp.signal];
                return sig ? React.createElement('div', { className:'mt-3 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2' },
                  React.createElement('p', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5' }, 'Recommended play'),
                  React.createElement('p', { className:'text-xs text-slate-700 leading-relaxed' }, sig.play)) : null;
              })(),
              opp.crmOpportunityState !== 'none' && React.createElement('p', { className:'text-xs text-indigo-600 font-medium mt-2' }, 'CRM: ' + opp.crmOpportunityState.replace('_',' '))
            ),
            React.createElement('div', { className:'flex flex-col gap-2 flex-shrink-0' },
              opp.qualificationStatus === 'candidate' && React.createElement(Btn, { variant:'teal', size:'sm', onClick:()=>setConfirmQualify(opp.id) }, '✓ Qualify'),
              opp.crmOpportunityState === 'none' && React.createElement(Btn, { variant:'secondary', size:'sm', onClick:()=>dispatch({type:'CREATE_CRM_OPP',oppId:opp.id}) }, 'Create CRM opp'),
              React.createElement(Btn, { variant:'secondary', size:'sm', onClick:()=>navigate(`/customers/${opp.customerId}`) }, 'Open customer')
            )
          )
        );
      })
    ),
    
    // Confirm qualify modal
    confirmQualify && React.createElement(Modal, { open:true, onClose:()=>setConfirmQualify(null), title:'Qualify expansion opportunity' },
      React.createElement('p', { className:'text-sm text-slate-600 mb-4' }, 'Qualifying this opportunity means you have reviewed the evidence and believe it is ready for discovery conversations. This will move it to your qualified pipeline.'),
      React.createElement('div', { className:'p-3 bg-teal-50 rounded-lg mb-4' },
        React.createElement('p', { className:'text-xs font-medium text-teal-700' }, 'Expansion evidence:'),
        Object.values(state.expansionOpps).find(e=>e.id===confirmQualify)?.evidence.map((ev,i)=>React.createElement('p',{key:i,className:'text-xs text-teal-800 mt-0.5'},'• '+ev))
      ),
      React.createElement('div', { className:'flex gap-2' },
        React.createElement(Btn, { variant:'teal', onClick:()=>{ dispatch({type:'QUALIFY_EXPANSION',oppId:confirmQualify}); setConfirmQualify(null); } }, '✓ Confirm qualification'),
        React.createElement(Btn, { variant:'ghost', onClick:()=>setConfirmQualify(null) }, 'Cancel')
      )
    ),
  );
}

// ============================================================
// SECTION 14: MANAGER DASHBOARD
// ============================================================

function ManagerDashboard() {
  const { state } = useApp();
  const navigate = useNavigate();
  
  const allCustomers = state.customers;
  const allRisks = Object.values(state.risks);
  const allGoals = Object.values(state.goals);
  
  const blindSpots = allCustomers.filter(c => {
    const health = HEALTH_SIGNALS[c.healthId];
    const hasActiveMitigationGoal = allGoals.some(g=>g.customerId===c.id && g.type==='risk_mitigation' && ['in_progress','not_started'].includes(g.status));
    return health?.band === 'red' && !hasActiveMitigationGoal;
  });
  
  const teamData = [
    { csm:'Maya Chen', id:'maya', accounts:8, arr:3840000, redArr:620000, renewals90d:4, openGoals:5, overdueTasks:2, expansionPotential:155000, coverage:'82%' },
    { csm:'James Park', id:'james', accounts:8, arr:4200000, redArr:470000, renewals90d:3, openGoals:4, overdueTasks:3, expansionPotential:147000, coverage:'67%' },
    { csm:'Sarah Kim', id:'sarah', accounts:8, arr:4360000, redArr:108000, renewals90d:2, openGoals:5, overdueTasks:1, expansionPotential:108000, coverage:'90%' },
  ];
  
  const weeklyMovement = [
    {week:'W1',toRed:2,fromRed:1},{week:'W2',toRed:1,fromRed:2},{week:'W3',toRed:3,fromRed:1},{week:'W4',toRed:1,fromRed:3},
    {week:'W5',toRed:2,fromRed:2},{week:'W6',toRed:1,fromRed:1},{week:'W7',toRed:2,fromRed:0},{week:'W8',toRed:0,fromRed:2}
  ];
  
  const goalsNeedingAck = allGoals.filter(g=>g.status==='not_started'&&g.source==='signal_triggered');
  
  return React.createElement('div', { className:'space-y-5' },
    // Header
    React.createElement('div', null,
      React.createElement('h2', { className:'text-xl font-semibold text-slate-900' }, 'Manager view — Daniel Ortiz'),
      React.createElement('p', { className:'text-slate-500 text-sm' }, 'Portfolio risk overview across 24 accounts and 3 CSMs')
    ),
    
    // Summary
    React.createElement('div', { className:'grid grid-cols-3 gap-4' },
      React.createElement(MetricCard, { label:'Total managed ARR', value:'$12.4M' }),
      React.createElement(MetricCard, { label:'Revenue at risk', value:'$1.8M', subColor:'text-red-600' }),
      React.createElement(MetricCard, { label:'Mitigation coverage', value:'67%', sub:'Of red ARR has active mitigation goal', subColor:'text-amber-600' })
    ),
    
    React.createElement('div', { className:'grid grid-cols-2 gap-5 items-stretch' },
      // Weekly movement
      React.createElement(Card, { className:'p-5' },
        React.createElement('h4', { className:'font-semibold text-slate-900 mb-4' }, 'Health movement by week'),
        React.createElement('div', { className:'h-48' },
          React.createElement(ResponsiveContainer, { width:'100%', height:'100%' },
            React.createElement(BarChart, { data:weeklyMovement },
              React.createElement(CartesianGrid, { strokeDasharray:'3 3', stroke:'#f1f5f9' }),
              React.createElement(XAxis, { dataKey:'week', tick:{fontSize:11} }),
              React.createElement(YAxis, { tick:{fontSize:11} }),
              React.createElement(Tooltip),
              React.createElement(Legend, { wrapperStyle:{fontSize:11} }),
              React.createElement(Bar, { dataKey:'toRed', name:'→ Red', fill:'#ef4444' }),
              React.createElement(Bar, { dataKey:'fromRed', name:'← From red', fill:'#22c55e' })
            )
          )
        )
      ),
      
      // Blind spots
      React.createElement(Card, { className:'p-5' },
        React.createElement('div', { className:'flex items-center justify-between mb-3' },
          React.createElement('h4', { className:'font-semibold text-slate-900' }, 'Blind spots'),
          React.createElement('span', { className:'px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium' }, blindSpots.length + ' accounts')
        ),
        React.createElement('p', { className:'text-xs text-slate-500 mb-3' }, 'Red health with no active mitigation goal'),
        blindSpots.length === 0 ? React.createElement('p',{className:'text-sm text-green-600'},'✓ No blind spots — all red accounts have active mitigation goals') :
        React.createElement('div', { className:'space-y-2' },
          blindSpots.map(c => {
            const health = HEALTH_SIGNALS[c.healthId];
            return React.createElement('div', { key:c.id, className:'flex items-center justify-between p-2 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100', onClick:()=>navigate(`/customers/${c.id}`) },
              React.createElement('div', null,
                React.createElement('p', { className:'text-sm font-medium text-slate-900' }, c.name),
                React.createElement('p', { className:'text-xs text-slate-500' }, formatARR(c.arr) + ' · Score ' + health?.compositeScore)
              ),
              React.createElement('span', { className:'text-xs text-red-700 font-medium' }, 'No plan →')
            );
          })
        )
      )
    ),
    
    // Team table
    React.createElement(Card, { className:'overflow-hidden' },
      React.createElement('div', { className:'px-4 py-3 border-b' }, React.createElement('h4',{className:'font-semibold text-slate-900'},'Team portfolio')),
      React.createElement('table', { className:'w-full text-sm' },
        React.createElement('thead', null, React.createElement('tr', { className:'bg-slate-50 border-b' },
          ['CSM','Accounts','ARR','Red ARR','Renewals 90d','Open Goals','Overdue Tasks','Expansion','Coverage'].map(h=>React.createElement('th',{key:h,className:'px-4 py-3 text-left text-xs font-medium text-slate-500 whitespace-nowrap'},h))
        )),
        React.createElement('tbody', null,
          teamData.map(row => React.createElement('tr', { key:row.id, className:'border-b hover:bg-slate-50 cursor-pointer', onClick:()=>navigate('/customers') },
            React.createElement('td', { className:'px-4 py-3' }, React.createElement('div',{className:'flex items-center gap-2'}, React.createElement(Avatar,{user:USERS[row.id]}), React.createElement('span',{className:'font-medium'},row.csm))),
            React.createElement('td', { className:'px-4 py-3' }, row.accounts),
            React.createElement('td', { className:'px-4 py-3 font-medium' }, formatARR(row.arr)),
            React.createElement('td', { className:'px-4 py-3 text-red-700 font-medium' }, formatARR(row.redArr)),
            React.createElement('td', { className:'px-4 py-3' }, row.renewals90d),
            React.createElement('td', { className:'px-4 py-3' }, row.openGoals),
            React.createElement('td', { className:'px-4 py-3 ' + (row.overdueTasks>2?'text-red-600 font-semibold':'') }, row.overdueTasks),
            React.createElement('td', { className:'px-4 py-3 text-teal-700' }, formatARR(row.expansionPotential)),
            React.createElement('td', { className:'px-4 py-3 font-medium' }, row.coverage)
          ))
        )
      )
    ),
    
    // Goals needing acknowledgement
    goalsNeedingAck.length > 0 && React.createElement(Card, { className:'p-5' },
      React.createElement('h4', { className:'font-semibold text-slate-900 mb-3' }, 'Goals needing acknowledgement'),
      React.createElement('div', { className:'space-y-2' },
        goalsNeedingAck.map(g => {
          const c = state.customers.find(cu=>cu.id===g.customerId);
          return React.createElement('div', { key:g.id, className:'flex items-center justify-between p-3 border border-amber-200 bg-amber-50 rounded-lg' },
            React.createElement('div', null,
              React.createElement('p', { className:'text-sm font-medium text-slate-900' }, g.title),
              React.createElement('p', { className:'text-xs text-slate-500' }, c?.name + ' · ' + USERS[g.ownerId]?.name)
            ),
            React.createElement('span', { className:'text-xs text-amber-600 font-medium' }, '⚠ Awaiting acknowledgement')
          );
        })
      )
    )
  );
}

// ============================================================
// SECTION 15: EXECUTIVE DASHBOARD
// ============================================================

function ExecutiveDashboard() {
  const retentionTrend = [{month:'Jan',grr:95,nrr:109},{month:'Feb',grr:94,nrr:108},{month:'Mar',grr:96,nrr:111},{month:'Apr',grr:95,nrr:110},{month:'May',grr:94,nrr:109},{month:'Jun',grr:93,nrr:107},{month:'Jul',grr:94,nrr:109}];
  
  return React.createElement('div', { className:'space-y-5' },
    React.createElement('div', null,
      React.createElement('h2', { className:'text-xl font-semibold text-slate-900' }, 'Executive overview — Priya Raman'),
      React.createElement('p', { className:'text-slate-500 text-sm' }, 'Revenue health, retention, and expansion summary')
    ),
    
    React.createElement('div', { className:'grid grid-cols-3 gap-4' },
      React.createElement(MetricCard, { label:'Gross Revenue Retention', value:'94.2%', sub:'Target: 93%', subColor:'text-green-600' }),
      React.createElement(MetricCard, { label:'Net Revenue Retention', value:'108.5%', sub:'Target: 105%', subColor:'text-green-600' }),
      React.createElement(MetricCard, { label:'Renewal forecast', value:'$6.2M', sub:'vs $7.1M target (87%)', subColor:'text-amber-600' })
    ),
    React.createElement('div', { className:'grid grid-cols-3 gap-4' },
      React.createElement(MetricCard, { label:'Revenue at risk', value:'$1.8M', subColor:'text-red-600' }),
      React.createElement(MetricCard, { label:'Expansion ARR', value:'$890K', subColor:'text-teal-600' }),
      React.createElement(MetricCard, { label:'Forecast accuracy', value:'91%', subColor:'text-green-600' })
    ),
    
    React.createElement('div', { className:'grid grid-cols-2 gap-5 items-stretch' },
      React.createElement(Card, { className:'p-5' },
        React.createElement('h4', { className:'font-semibold text-slate-900 mb-4' }, 'Retention trend'),
        React.createElement('div', { className:'h-48' },
          React.createElement(ResponsiveContainer, { width:'100%', height:'100%' },
            React.createElement(LineChart, { data:retentionTrend },
              React.createElement(CartesianGrid, { strokeDasharray:'3 3', stroke:'#f1f5f9' }),
              React.createElement(XAxis, { dataKey:'month', tick:{fontSize:11} }),
              React.createElement(YAxis, { domain:[85,115], tick:{fontSize:11} }),
              React.createElement(Tooltip, { formatter:v=>[v+'%'] }),
              React.createElement(Legend, { wrapperStyle:{fontSize:11} }),
              React.createElement(Line, { type:'monotone', dataKey:'grr', name:'GRR %', stroke:'#4f46e5', strokeWidth:2 }),
              React.createElement(Line, { type:'monotone', dataKey:'nrr', name:'NRR %', stroke:'#22c55e', strokeWidth:2 })
            )
          )
        )
      ),
      React.createElement(Card, { className:'p-5' },
        React.createElement('h4', { className:'font-semibold text-slate-900 mb-4' }, 'Top strategic risks'),
        React.createElement('div', { className:'space-y-2' },
          Object.values(RISKS).filter(r=>r.status!=='resolved').slice(0,5).map(r => {
            const c = CUSTOMERS.find(cu=>cu.id===r.customerId);
            return React.createElement('div', { key:r.id, className:'flex items-center justify-between p-2 rounded-lg bg-slate-50' },
              React.createElement('div', null,
                React.createElement('p', { className:'text-sm font-medium' }, c?.name + ' — ' + r.category),
                React.createElement(SeverityBadge, { severity:r.severity })
              ),
              React.createElement('span', { className:'text-sm font-semibold text-red-700' }, formatARR(r.amountAtRisk))
            );
          })
        )
      )
    )
  );
}

// ============================================================
// SECTION 16: CUSTOMER PORTAL PREVIEW
// ============================================================

function PortalPreview() {
  const { state, dispatch } = useApp();
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [showPublish, setShowPublish] = useState(null);
  
  const customer = state.customers.find(c=>c.id===customerId);
  const goals = Object.values(state.goals).filter(g => g.customerId === customerId && g.visibility === 'shared' && g.publicationStatus === 'published');
  
  return React.createElement('div', { className:'min-h-screen bg-slate-100' },
    // Preview banner
    React.createElement('div', { className:'bg-amber-500 text-white text-center py-2 text-sm font-semibold' },
      '👁 PREVIEWING AS CUSTOMER — This is how ' + (customer?.name || 'the customer') + ' sees their portal',
      React.createElement('button', { onClick:()=>navigate(-1), className:'ml-4 underline text-xs' }, 'Exit preview')
    ),
    
    // Portal header (customer-facing)
    React.createElement('div', { className:'bg-white border-b px-6 py-4' },
      React.createElement('div', { className:'flex items-center gap-3' },
        React.createElement('div', { className:'w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold' }, 'CX'),
        React.createElement('div', null,
          React.createElement('p', { className:'font-semibold text-slate-900' }, 'Success Hub'),
          React.createElement('p', { className:'text-xs text-slate-500' }, customer?.name)
        )
      )
    ),
    
    // Portal content
    React.createElement('div', { className:'max-w-3xl mx-auto px-6 py-8 space-y-6' },
      React.createElement('div', null,
        React.createElement('h2', { className:'text-2xl font-bold text-slate-900' }, 'Welcome, ' + (customer?.name || 'Customer')),
        React.createElement('p', { className:'text-slate-500 mt-1' }, 'Your dedicated success plan, updated by Maya Chen')
      ),
      
      goals.length === 0 ? React.createElement(Card, { className:'p-6 text-center' },
        React.createElement('p', { className:'text-slate-500 mb-2' }, 'No published goals yet.'),
        React.createElement('p', { className:'text-sm text-slate-400' }, "Your CSM will share your success plan here once it's ready.")
      ) :
      goals.map(g => {
        const tasks = g.taskIds.map(id=>state.tasks[id]).filter(t => t && t.visibility === 'shared'); // ONLY shared tasks
        const sharedProg = sharedGoalProgress(g, state.tasks);
        return React.createElement(Card, { key:g.id, className:'p-6' },
          React.createElement('div', { className:'flex items-start justify-between' },
            React.createElement('div', null,
              React.createElement('h3', { className:'text-xl font-bold text-slate-900' }, g.title),
              React.createElement('p', { className:'text-sm text-slate-500 mt-1' }, g.description.substring(0,120) + '...')
            ),
            React.createElement('span', { className:'px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full' }, 'Active')
          ),
          React.createElement('div', { className:'mt-4' },
            React.createElement('div', { className:'flex items-center justify-between text-sm mb-1' },
              React.createElement('span', { className:'text-slate-600' }, 'Progress'),
              React.createElement('span', { className:'font-bold text-slate-900' }, sharedProg + '%')
            ),
            React.createElement('div', { className:'w-full bg-slate-100 rounded-full h-3' },
              React.createElement('div', { className:'h-3 rounded-full bg-indigo-500 transition-all', style:{width:`${sharedProg}%`} })
            )
          ),
          React.createElement('div', { className:'mt-5' },
            React.createElement('h4', { className:'font-semibold text-slate-800 mb-3' }, 'Milestones'),
            React.createElement('div', { className:'space-y-2' },
              tasks.map(t => React.createElement('div', { key:t.id, className:'flex items-center gap-3 p-3 bg-slate-50 rounded-lg' },
                React.createElement('div', { className:`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${t.status==='done'?'bg-green-500 border-green-500 text-white':t.status==='in_progress'?'border-indigo-500':'border-slate-300'}` },
                  t.status === 'done' && '✓',
                  t.status === 'in_progress' && React.createElement('div',{className:'w-2 h-2 bg-indigo-500 rounded-full'})
                ),
                React.createElement('div', null,
                  React.createElement('p', { className:'text-sm font-medium text-slate-900' }, t.title),
                  t.dueDate && React.createElement('p', { className:'text-xs text-slate-400' }, 'Due ' + new Date(t.dueDate).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}))
                ),
                React.createElement('span', { className:`ml-auto text-xs font-medium ${t.status==='done'?'text-green-600':t.status==='in_progress'?'text-indigo-600':'text-slate-400'}` }, t.status==='done'?'Complete':t.status==='in_progress'?'In progress':'Upcoming')
              ))
            )
          ),
          React.createElement('div', { className:'mt-4 p-3 bg-blue-50 rounded-lg flex items-center gap-3' },
            React.createElement(Avatar, { user:USERS.maya }),
            React.createElement('div', null,
              React.createElement('p', { className:'text-sm font-medium text-slate-900' }, 'Maya Chen'),
              React.createElement('p', { className:'text-xs text-slate-500' }, 'Your Customer Success Manager')
            )
          )
        );
      }),
      
      // NOTE: No risks, health scores, internal tasks, sentiment, or discounts shown
      goals.length === 0 && React.createElement('div', null)
    )
  );
}


// ============================================================
// SECTION 17: SUPPORTING SCREENS
// ============================================================


// ── Email reader + reply composer ──
function EmailDetail({ email, onBack, dispatch, navigate, customers }){
  const customer = customers.find(c=>c.id===email.customerId);
  const [reply, setReply] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [tplOpen, setTplOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('Follow up: ' + email.subject.replace(/^Re:\s*/i,''));
  const [taskDue, setTaskDue] = useState('');

  const applyTemplate = (t) => {
    const filled = t.body
      .replace(/\{\{contact\.first_name\}\}/g, email.from.split(' ')[0])
      .replace(/\{\{my\.name\}\}/g, 'Maya Chen')
      .replace(/\{\{my\.calendar\}\}/g, 'cx42.io/maya');
    setReply(filled); setTplOpen(false);
    dispatch({ type:'ADD_TOAST', msg:'Template applied \u2014 "' + t.name + '"', toastType:'info' });
  };
  const addAttachment = () => {
    const n = attachments.length + 1;
    setAttachments(a => a.concat({ name:'attachment-' + n + '.pdf', size:(120 * n) + ' KB' }));
    dispatch({ type:'ADD_TOAST', msg:'Attachment added', toastType:'info' });
  };
  const send = () => {
    dispatch({ type:'ADD_TOAST', msg:'Reply sent to ' + email.fromEmail, toastType:'success' });
    setReply(''); setAttachments([]); onBack();
  };
  const createTask = () => {
    dispatch({ type:'CREATE_TASK', taskId:'t_em_' + email.id + '_' + Date.now().toString(36),
      title:taskTitle, description:'Raised from the email \u201c' + email.subject + '\u201d from ' + email.from + ' (' + email.fromEmail + ').',
      customerId:email.customerId, ownerId:'maya', dueDate:taskDue || null,
      source:'email', emailId:email.id, emailSubject:email.subject, emailFrom:email.from });
    setTaskOpen(false);
  };

  const inp = 'w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400';

  return React.createElement('div', { className:'space-y-4' },
    React.createElement('div', { className:'flex items-center justify-between gap-3 flex-wrap' },
      React.createElement('button', { onClick:onBack, className:'text-sm text-indigo-600 hover:underline' }, '\u2190 Back to inbox'),
      React.createElement('div', { className:'flex gap-2' },
        React.createElement(Btn, { variant:'secondary', size:'xs', onClick:()=>setTaskOpen(v=>!v) }, '\u2713 Create task'),
        customer && React.createElement(Btn, { variant:'secondary', size:'xs', onClick:()=>navigate('/customers/'+customer.id) }, 'Open account')
      )
    ),

    // Why this message did or did not attach to an account
    React.createElement(Card, { className:`p-3 ${customer ? 'bg-green-50/50 border-green-100' : 'bg-slate-50 border-slate-200'}` },
      React.createElement('div', { className:'flex items-start gap-3 flex-wrap' },
        React.createElement(CxPill, { tone: customer ? 'green' : (email.routing && email.routing.bucket==='internal') ? 'slate' : 'amber' },
          customer ? 'Mapped to ' + customer.name : (email.routing && email.routing.bucket==='internal') ? 'Internal \u2014 not mapped' : 'Not mapped to an account'),
        React.createElement('p', { className:'flex-1 min-w-[240px] text-xs text-slate-600 leading-relaxed' },
          (email.routing && email.routing.reason) || 'No routing decision recorded for this message.'),
        !customer && (!email.routing || email.routing.bucket !== 'internal') &&
          React.createElement('select', { defaultValue:'', className:'text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white outline-none focus:border-indigo-400',
            onChange:e=>{ if (e.target.value) dispatch({ type:'MAP_EMAIL_TO_ACCOUNT', emailId:email.id, customerId:e.target.value, by:'Maya Chen' }); } },
            [React.createElement('option',{key:'_',value:''},'Map to an account\u2026')].concat(
              customers.slice(0,20).map(c=>React.createElement('option',{key:c.id,value:c.id},c.name))))
      )
    ),

    React.createElement(Card, { className:'p-5' },
      React.createElement('div', { className:'flex items-start gap-3 pb-3 border-b border-slate-100' },
        React.createElement('div', { className:'w-10 h-10 rounded-full bg-slate-200 text-slate-600 font-bold flex items-center justify-center flex-shrink-0' },
          email.from.split(' ').map(n=>n[0]).join('')),
        React.createElement('div', { className:'flex-1 min-w-0' },
          React.createElement('p', { className:'text-base font-bold text-slate-900' }, email.subject),
          React.createElement('p', { className:'text-xs text-slate-500 mt-0.5' },
            email.from + ' \u00b7 ' + email.fromEmail + ' \u2192 ' + email.to),
          React.createElement('div', { className:'flex gap-2 mt-1.5 flex-wrap' },
            React.createElement('span', { className:'text-[11px] text-slate-400' }, email.received),
            customer && React.createElement('button', { onClick:()=>navigate('/customers/'+customer.id),
              className:'text-[11px] text-indigo-600 hover:underline font-medium' }, customer.name))
        )
      ),
      React.createElement('div', { className:'py-4 text-sm text-slate-700 leading-relaxed whitespace-pre-line' }, email.body),
      email.attachments.length > 0 && React.createElement('div', { className:'pt-3 border-t border-slate-100' },
        React.createElement('p', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5' }, 'Attachments'),
        React.createElement('div', { className:'flex gap-2 flex-wrap' },
          email.attachments.map(a=>React.createElement('button', { key:a.name,
            onClick:()=>dispatch({type:'ADD_TOAST',msg:'Downloading '+a.name,toastType:'info'}),
            className:'flex items-center gap-2 border border-slate-200 rounded-lg px-2.5 py-1.5 hover:border-indigo-300' },
            React.createElement('span', null, '\u{1F4CE}'),
            React.createElement('span', { className:'text-xs font-medium text-slate-700' }, a.name),
            React.createElement('span', { className:'text-[10px] text-slate-400' }, a.size))))
      )
    ),

    // Create-task panel
    taskOpen && React.createElement(Card, { className:'p-4 border-indigo-200 bg-indigo-50/40' },
      React.createElement(CxLabel, null, 'Create a task from this email'),
      React.createElement('div', { className:'grid grid-cols-3 gap-3' },
        React.createElement('div', { className:'col-span-2' },
          React.createElement('label', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider' }, 'Task title'),
          React.createElement('input', { value:taskTitle, onChange:e=>setTaskTitle(e.target.value), className:'mt-1 '+inp })),
        React.createElement('div', null,
          React.createElement('label', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider' }, 'Due date'),
          React.createElement('input', { type:'date', value:taskDue, onChange:e=>setTaskDue(e.target.value), className:'mt-1 '+inp }))
      ),
      React.createElement('div', { className:'flex items-center gap-2 mt-3' },
        React.createElement(Btn, { variant:'primary', size:'xs', onClick:createTask }, 'Create task'),
        React.createElement(Btn, { variant:'ghost', size:'xs', onClick:()=>setTaskOpen(false) }, 'Cancel'),
        React.createElement('span', { className:'text-[11px] text-slate-500' },
          'Source will be recorded as \u201cConverted from Email\u201d' + (customer ? ' and linked to ' + customer.name : ''))
      )
    ),

    // Reply composer
    React.createElement(Card, { className:'p-4' },
      React.createElement(CxLabel, { right: React.createElement('div', { className:'relative' },
        React.createElement(Btn, { variant:'secondary', size:'xs', onClick:()=>setTplOpen(v=>!v) }, '\u{1F4C4} Apply template'),
        tplOpen && React.createElement('div', { className:'absolute right-0 mt-1 w-72 bg-white border border-slate-200 rounded-xl shadow-lg z-30 p-1.5' },
          EMAIL_TEMPLATES.map(t=>React.createElement('button', { key:t.id, onClick:()=>applyTemplate(t),
            className:'w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-50' },
            React.createElement('p', { className:'text-xs font-semibold text-slate-800' }, t.name),
            React.createElement('p', { className:'text-[10px] text-slate-400 truncate' }, t.body.split('\n')[0]))))
      ) }, 'Reply to ' + email.from),
      React.createElement('textarea', { value:reply, onChange:e=>setReply(e.target.value), rows:9,
        placeholder:'Write your reply\u2026 or apply a template to start from a draft',
        className:inp + ' resize-y' }),
      attachments.length > 0 && React.createElement('div', { className:'flex gap-2 flex-wrap mt-2' },
        attachments.map((a,i)=>React.createElement('span', { key:i, className:'inline-flex items-center gap-1.5 bg-slate-100 rounded-lg px-2 py-1' },
          React.createElement('span', { className:'text-xs text-slate-600' }, '\u{1F4CE} ' + a.name),
          React.createElement('button', { onClick:()=>setAttachments(l=>l.filter((_,j)=>j!==i)),
            className:'text-slate-400 hover:text-red-500 text-xs' }, '\u2715')))),
      React.createElement('div', { className:'flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 flex-wrap' },
        React.createElement(Btn, { variant:'primary', size:'sm', onClick:send, disabled:!reply.trim() }, 'Send reply'),
        React.createElement(Btn, { variant:'secondary', size:'sm', onClick:addAttachment }, '\u{1F4CE} Attach file'),
        React.createElement(Btn, { variant:'secondary', size:'sm', onClick:()=>setTaskOpen(true) }, '\u2713 Create task'),
        React.createElement('span', { className:'text-[11px] text-slate-400 ml-auto' },
          attachments.length ? attachments.length + ' attachment(s)' : 'No attachments')
      )
    )
  );
}

// ── Inbox list for the Email tab ──
function EmailInbox({ state, dispatch, navigate }){
  const [openId, setOpenId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');
  const mailbox = state.mailbox || { connected:false };

  if (!mailbox.connected) {
    return React.createElement(Card, { className:'p-12 text-center' },
      React.createElement('p', { className:'text-3xl mb-2' }, '\u2709'),
      React.createElement('p', { className:'text-sm font-semibold text-slate-700' }, 'Your mailbox is not connected'),
      React.createElement('p', { className:'text-xs text-slate-500 mt-1 max-w-md mx-auto' },
        'Connect a mailbox to pull emails addressed to you into CX42, reply without leaving the product, and convert messages into tasks.'),
      React.createElement('div', { className:'mt-4' },
        React.createElement(Btn, { variant:'primary', size:'sm', onClick:()=>navigate('/profile') }, 'Connect a mailbox'))
    );
  }

  const emails = state.emails || [];
  const open = openId ? emails.find(e=>e.id===openId) : null;
  if (open) return React.createElement(EmailDetail, { email:open, onBack:()=>setOpenId(null), dispatch, navigate, customers:state.customers });

  const bucketOf = (e) => (e.routing && e.routing.bucket) || (e.customerId ? 'mapped' : 'unmatched');
  const matchesFilter = (e) =>
    filter==='all' ? true
    : filter==='mapped' ? bucketOf(e)==='mapped'
    : filter==='unmapped' ? bucketOf(e)!=='mapped'
    : filter==='unread' ? e.unread
    : filter==='starred' ? e.starred
    : filter==='attach' ? e.hasAttachment : true;

  const shown = emails.filter(e => matchesFilter(e) &&
    (!q || e.subject.toLowerCase().includes(q.toLowerCase()) || e.from.toLowerCase().includes(q.toLowerCase())));
  const unread = emails.filter(e=>e.unread).length;
  const mappedN = emails.filter(e=>bucketOf(e)==='mapped').length;
  const unmappedN = emails.length - mappedN;

  return React.createElement('div', { className:'space-y-3' },
    React.createElement('div', { className:'flex items-center gap-3 flex-wrap' },
      React.createElement('div', { className:'flex gap-1 bg-white border border-slate-200 rounded-lg p-1 flex-wrap' },
        [['all','All'],['mapped','Mapped to an account \u00b7 ' + mappedN],['unmapped','Not mapped \u00b7 ' + unmappedN],
         ['unread','Unread' + (unread ? ' \u00b7 ' + unread : '')],['starred','Starred'],['attach','With attachments']].map(f =>
          React.createElement('button', { key:f[0], onClick:()=>setFilter(f[0]),
            className:`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${filter===f[0]?'bg-indigo-600 text-white':'text-slate-600 hover:bg-slate-100'}` },
            f[1]))),
      React.createElement('input', { value:q, onChange:e=>setQ(e.target.value), placeholder:'Search mail\u2026',
        className:'px-3 py-1.5 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500' }),
      React.createElement('span', { className:'text-xs text-slate-400 ml-auto' },
        mailbox.address + ' \u00b7 synced ' + mailbox.synced),
      React.createElement(Btn, { variant:'secondary', size:'xs', onClick:()=>dispatch({type:'SYNC_MAILBOX'}) }, '\u21BB Sync')
    ),

    filter === 'unmapped' && React.createElement(Card, { className:'p-3 bg-slate-50 border-slate-200' },
      React.createElement('p', { className:'text-xs text-slate-600 leading-relaxed' },
        'These messages have no participant outside your company domains, or the outside address is on an excluded domain, or its domain matches no account. They stay here and are never written to a customer record. Domains are managed in Admin \u203a Email configuration \u203a Domains.')),

    React.createElement(Card, { className:'overflow-hidden' },
      shown.length === 0
        ? React.createElement('p', { className:'px-4 py-10 text-center text-sm text-slate-400' }, 'No messages match')
        : shown.map(e => {
            const c = state.customers.find(x=>x.id===e.customerId);
            return React.createElement('div', { key:e.id,
              onClick:()=>{ setOpenId(e.id); if(e.unread) dispatch({type:'MARK_EMAIL_READ', emailId:e.id}); },
              className:`px-4 py-3 border-b border-slate-50 last:border-0 flex items-start gap-3 cursor-pointer transition-colors ${e.unread?'bg-indigo-50/40 hover:bg-indigo-50':'hover:bg-slate-50'}` },
              React.createElement('span', { className:`w-2 h-2 rounded-full flex-shrink-0 mt-2 ${e.unread?'bg-indigo-500':'bg-transparent'}` }),
              React.createElement('div', { className:'w-8 h-8 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0' },
                e.from.split(' ').map(n=>n[0]).join('')),
              React.createElement('div', { className:'flex-1 min-w-0' },
                React.createElement('div', { className:'flex items-center gap-2 flex-wrap' },
                  React.createElement('p', { className:`text-sm truncate ${e.unread?'font-bold text-slate-900':'font-medium text-slate-700'}` }, e.from),
                  c
                    ? React.createElement(CxPill, { tone:'green' }, c.name)
                    : React.createElement(CxPill, { tone: bucketOf(e)==='internal' ? 'slate' : 'amber' },
                        bucketOf(e)==='internal' ? 'Internal \u00b7 no account' : 'No account match'),
                  e.starred && React.createElement('span', { className:'text-amber-400 text-xs' }, '\u2605'),
                  e.hasAttachment && React.createElement('span', { className:'text-slate-400 text-xs' }, '\u{1F4CE}')),
                React.createElement('p', { className:`text-sm truncate mt-0.5 ${e.unread?'font-semibold text-slate-800':'text-slate-600'}` }, e.subject),
                React.createElement('p', { className:'text-xs text-slate-400 truncate mt-0.5' }, e.preview)),
              React.createElement('span', { className:'text-[11px] text-slate-400 flex-shrink-0 whitespace-nowrap' }, e.ago)
            );
          })
    )
  );
}

// ── Task detail drawer opened from My Work ──
function TaskDetailDrawer({ task, state, dispatch, navigate, onClose }){
  if (!task) return null;
  const customer = state.customers.find(c=>c.id===task.customerId);
  const src = taskSourceMeta(task);
  const goal = task.goalId ? state.goals[task.goalId] : null;
  const row = (k, v) => React.createElement('div', { className:'flex items-start justify-between gap-3 py-2.5 border-b border-slate-50 last:border-0' },
    React.createElement('span', { className:'text-xs text-slate-500 flex-shrink-0 w-28' }, k),
    React.createElement('div', { className:'text-sm text-right flex-1 min-w-0' }, v));

  return React.createElement(Drawer, { open:true, onClose, title:'Task detail' },
    React.createElement('div', { className:'space-y-4' },
      React.createElement('div', null,
        React.createElement('p', { className:'text-base font-bold text-slate-900 leading-snug' }, task.title),
        task.description && React.createElement('p', { className:'text-sm text-slate-600 mt-1.5 leading-relaxed' }, task.description)),

      React.createElement(Card, { className:'p-4' },
        React.createElement(CxLabel, null, 'Task fields'),
        // Source \u2014 where this task came from
        row('Source', React.createElement('span', { className:'inline-flex items-center gap-1.5' },
          React.createElement(CxPill, { tone:src.tone }, src.icon + ' ' + src.label),
          task.source === 'action' && task.actionName &&
            React.createElement('span', { className:'text-[11px] text-slate-500' }, '\u201c' + task.actionName + '\u201d'),
          task.source === 'email' && task.emailSubject &&
            React.createElement('span', { className:'text-[11px] text-slate-500 truncate' }, '\u201c' + task.emailSubject + '\u201d')
        )),
        // Customer \u2014 links through to the account
        row('Customer', customer
          ? React.createElement('button', { onClick:()=>{ onClose(); navigate('/customers/' + customer.id); },
              className:'text-indigo-600 hover:underline font-medium' }, customer.name)
          : React.createElement('span', { className:'text-slate-300' }, 'Not linked')),
        row('Status', React.createElement(StatusBadge, { status:task.status })),
        row('Owner', React.createElement('span', { className:'text-slate-700' }, (USERS[task.ownerId]||{}).name || task.ownerId)),
        row('Due', React.createElement('span', { className:'text-slate-700' },
          task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '\u2014')),
        row('Type', React.createElement('span', { className:'text-slate-700 capitalize' }, (task.type||'custom').replace('_',' '))),
        goal && row('Parent goal', React.createElement('button', { onClick:()=>{ onClose(); navigate('/goals/'+goal.id); },
          className:'text-indigo-600 hover:underline' }, goal.title))
      ),

      // Provenance detail per source
      task.source === 'action' && React.createElement(Card, { className:'p-4 bg-blue-50/60 border-blue-200' },
        React.createElement('div', { className:'flex items-center gap-2 mb-2.5' },
          React.createElement('span', { className:'w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs' }, '\u26A1'),
          React.createElement('p', { className:'text-[10px] font-bold text-blue-700 uppercase tracking-wider' }, 'Why this task was raised')),

        // What fired it
        React.createElement('div', { className:'bg-white border border-blue-100 rounded-lg px-3 py-2 mb-2' },
          React.createElement('p', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5' }, 'Trigger'),
          React.createElement('p', { className:'text-sm font-semibold text-slate-800' }, task.trigger || 'Not recorded'),
          task.firedAt && React.createElement('p', { className:'text-[11px] text-slate-500 mt-0.5' }, 'Fired ' + task.firedAt)),

        // Which action, and the reasoning it carried
        React.createElement('div', { className:'bg-white border border-blue-100 rounded-lg px-3 py-2' },
          React.createElement('p', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5' }, 'Action'),
          React.createElement('p', { className:'text-sm font-semibold text-slate-800' }, task.actionName || '\u2014'),
          task.description && React.createElement('p', { className:'text-xs text-slate-600 mt-1 leading-relaxed' }, task.description)),

        React.createElement('div', { className:'mt-2.5' },
          React.createElement(Btn, { variant:'secondary', size:'xs', onClick:()=>{ onClose(); navigate('/actions'); } }, 'View the action'))
      ),
      task.source === 'email' && React.createElement(Card, { className:'p-4 bg-purple-50/50 border-purple-100' },
        React.createElement(CxLabel, null, 'Converted from email'),
        React.createElement('p', { className:'text-sm text-slate-700' }, '\u201c' + (task.emailSubject||'\u2014') + '\u201d'),
        task.emailFrom && React.createElement('p', { className:'text-xs text-slate-500 mt-1' }, 'From ' + task.emailFrom),
        React.createElement('div', { className:'mt-2' },
          React.createElement(Btn, { variant:'secondary', size:'xs', onClick:()=>{ onClose(); navigate('/work'); } }, 'Back to inbox'))
      ),

      React.createElement('div', { className:'flex gap-2' },
        task.status === 'todo' && React.createElement(Btn, { variant:'primary', size:'sm',
          onClick:()=>{ dispatch({type:'START_TASK',taskId:task.id}); onClose(); } }, 'Start task'),
        task.status === 'in_progress' && React.createElement(Btn, { variant:'success', size:'sm',
          onClick:()=>{ dispatch({type:'COMPLETE_TASK',taskId:task.id}); onClose(); } }, 'Mark done'),
        React.createElement(Btn, { variant:'ghost', size:'sm', onClick:onClose }, 'Close')
      )
    )
  );
}

function MyWork() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const { query } = useLocation();
  const focusTaskId = query.task || null;
  const focusTask = focusTaskId ? state.tasks[focusTaskId] : null;
  const [rawTab, setTab] = useState('all');
  const [openTaskId, setOpenTaskId] = useState(null);
  const isSupport = (state.persona || 'csm') === 'support';
  const myTickets = TICKETS.filter(t => t.status !== 'resolved');
  // Support agents work tickets, tasks and meetings. "All work" and Email are
  // CSM constructs, so they are not offered here; fall back if the persona is
  // switched while sitting on a tab that no longer exists.
  const SUPPORT_TABS = ['tickets','tasks','meetings'];
  const tab = isSupport && !SUPPORT_TABS.includes(rawTab) ? 'tickets' : rawTab;
  const [showHistory, setShowHistory] = useState(false);
  const [datePreset, setDatePreset] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  const DATE_PRESETS = [
    { id:'all', label:'All dates' },
    { id:'today', label:'Today' },
    { id:'tomorrow', label:'Tomorrow' },
    { id:'this_week', label:'This week' },
    { id:'next_week', label:'Next week' },
    { id:'this_month', label:'This month' },
    { id:'custom', label:'Custom range' },
  ];
  
  const handlePresetChange = (preset) => {
    setDatePreset(preset);
    if(preset === 'all') { setDateFrom(''); setDateTo(''); }
    else if(preset !== 'custom') { const r = getDatePresetRange(preset); setDateFrom(r.from); setDateTo(r.to); }
    // 'custom' leaves dateFrom/dateTo as-is for manual entry
  };
  
  const mapGoal = g => ({ ...g, itemType:'goal' });
  const mapTask = t => ({ ...t, itemType:'task' });
  const mapMeeting = m => ({ ...m, itemType:'meeting', dueDate:m.date, priority:null });
  
  const activeGoals = Object.values(state.goals).filter(g=>g.ownerId==='maya' && g.status !== 'completed' && g.status !== 'abandoned').map(mapGoal);
  const doneGoals = Object.values(state.goals).filter(g=>g.ownerId==='maya' && (g.status === 'completed' || g.status === 'abandoned')).map(mapGoal);
  
  // A task belongs to Maya either through its parent goal or, for action- and
  // queue-generated tasks that have no goal, through its own owner.
  const ownsTask = (t) => {
    const g = t.goalId ? state.goals[t.goalId] : null;
    return g ? g.ownerId === 'maya' : t.ownerId === 'maya';
  };
  const activeTasks = Object.values(state.tasks)
    .filter(t => ownsTask(t) && t.status !== 'done' && t.status !== 'skipped').map(mapTask);
  const doneTasks = Object.values(state.tasks)
    .filter(t => ownsTask(t) && (t.status === 'done' || t.status === 'skipped')).map(mapTask);
  
  const activeMeetings = MEETINGS.filter(m=>m.status !== 'completed').map(mapMeeting);
  const doneMeetings = MEETINGS.filter(m=>m.status === 'completed').map(mapMeeting);
  
  // A goal is a container for tasks, so the work list shows tasks and carries
  // the parent goal as a column rather than listing goals as separate rows.
  const pool = showHistory
    ? { all:[...doneTasks,...doneMeetings], tasks:doneTasks, meetings:doneMeetings }
    : { all:[...activeTasks,...activeMeetings], tasks:activeTasks, meetings:activeMeetings };
  
  let items = pool[tab] || pool.all;
  if(dateFrom) items = items.filter(i => i.dueDate && i.dueDate >= dateFrom);
  if(dateTo) items = items.filter(i => i.dueDate && i.dueDate <= dateTo);
  
  const readItems = state.readItems;
  
  return React.createElement('div', { className:'space-y-4' },
    focusTask && React.createElement(Card, { className:'p-4 border-indigo-200 bg-indigo-50/60' },
      React.createElement('div', { className:'flex items-start gap-3' },
        React.createElement('div', { className:'w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-sm flex-shrink-0' }, '\u2713'),
        React.createElement('div', { className:'flex-1 min-w-0' },
          React.createElement('p', { className:'text-[10px] font-bold text-indigo-600 uppercase tracking-wider' }, 'Opened from priority queue'),
          React.createElement('p', { className:'text-sm font-semibold text-slate-900 mt-0.5' }, focusTask.title),
          focusTask.description && React.createElement('p', { className:'text-xs text-slate-600 mt-1 leading-relaxed' }, focusTask.description),
          React.createElement('div', { className:'flex gap-2 mt-2 flex-wrap' },
            React.createElement('span', { className:'px-2 py-0.5 bg-white border border-indigo-200 rounded text-[10px] font-semibold text-indigo-700 capitalize' }, (focusTask.type||'custom').replace('_',' ')),
            focusTask.customerId && React.createElement('button', { onClick:()=>navigate('/customers/' + focusTask.customerId), className:'px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-semibold text-slate-600 hover:border-indigo-300' },
              (state.customers.find(c=>c.id===focusTask.customerId)||{}).name || focusTask.customerId),
            React.createElement('span', { className:'px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-semibold text-slate-500 capitalize' }, focusTask.status)
          )
        ),
        React.createElement('button', { onClick:()=>navigate('/work'), className:'text-slate-400 hover:text-slate-700 text-lg leading-none' }, '\u00d7')
      )
    ),
    React.createElement('div', { className:'flex items-center justify-between flex-wrap gap-3' },
      React.createElement(Tabs, { tabs: (function(){
      const unread = (state.emails||[]).filter(e=>e.unread).length;
      const emailTab = { id:'email', label:'Email' + (unread ? ' \u00b7 ' + unread : '') };
      // Support agents work tickets, not goals
      return isSupport
        ? [{id:'tickets',label:'Tickets \u00b7 ' + myTickets.length},{id:'tasks',label:'Tasks'},{id:'meetings',label:'Meetings'}]
        : [{id:'all',label:'All work'},{id:'tasks',label:'Tasks'},{id:'meetings',label:'Meetings'},emailTab];
    })(), active:tab, onChange:setTab }),
      React.createElement('div', { className:'flex items-center gap-2 flex-wrap' },
        React.createElement('select', { value:datePreset, onChange:e=>handlePresetChange(e.target.value), className:'border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500' },
          DATE_PRESETS.map(p => React.createElement('option', { key:p.id, value:p.id }, p.label))
        ),
        datePreset === 'custom' && React.createElement(React.Fragment, null,
          React.createElement('label', { className:'text-xs text-slate-500' }, 'From'),
          React.createElement('input', { type:'date', value:dateFrom, onChange:e=>setDateFrom(e.target.value), className:'border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500' }),
          React.createElement('label', { className:'text-xs text-slate-500' }, 'To'),
          React.createElement('input', { type:'date', value:dateTo, onChange:e=>setDateTo(e.target.value), className:'border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500' })
        ),
        datePreset !== 'all' && React.createElement(Btn, { variant:'ghost', size:'xs', onClick:()=>handlePresetChange('all') }, 'Clear dates'),
        React.createElement(Btn, { variant: showHistory ? 'primary' : 'secondary', size:'xs', onClick:()=>setShowHistory(h=>!h) }, showHistory ? '← Back to active' : 'View history')
      )
    ),
    showHistory && React.createElement('p', { className:'text-xs text-slate-500 -mt-2' }, 'History log — showing items already marked done, completed, or skipped.'),
    (function(){
      const n = items.filter(i => i.itemType === 'task' && i.source === 'action').length;
      return n > 0 && React.createElement('div', { className:'flex items-center gap-2 -mt-1' },
        React.createElement('span', { className:'inline-flex items-center gap-1 px-2 py-0.5 text-[10px] rounded font-semibold bg-indigo-100 text-indigo-700' }, '\u26A1 action'),
        React.createElement('span', { className:'text-xs text-slate-500' },
          n + ' task' + (n===1?'':'s') + ' raised automatically by an Action \u2014 each shows the customer and why it was created. Tasks you create yourself appear plain.')
      );
    })(),
    tab === 'email' && React.createElement(EmailInbox, { state, dispatch, navigate }),

    // Support: the ticket queue lives inside My Work
    tab === 'tickets' && React.createElement(Card, { className:'overflow-hidden' },
      React.createElement('div', { className:'overflow-x-auto' },
        React.createElement('table', { className:'w-full text-sm min-w-[900px]' },
          React.createElement('thead', null, React.createElement('tr', { className:'bg-slate-50 border-b' },
            ['ID','Customer','Subject','Severity','Sentiment','SLA','Actions',''].map(h=>
              React.createElement('th',{key:h,className:'px-4 py-3 text-left text-xs font-medium text-slate-500 whitespace-nowrap'},h)))),
          React.createElement('tbody', null,
            myTickets.length === 0
              ? React.createElement('tr', null, React.createElement('td',{colSpan:8,className:'px-4 py-10 text-center text-slate-400 text-sm'},'No open tickets'))
              : myTickets.map(t => { const c = state.customers.find(x=>x.id===t.customerId);
                  const sla = ticketSla(t); const sops = actionsForTicket(t);
                  return React.createElement('tr', { key:t.id, onClick:()=>navigate('/tickets?ticket=' + t.id),
                    className:'border-b last:border-0 hover:bg-indigo-50 cursor-pointer transition-colors' },
                    React.createElement('td', { className:'px-4 py-3 font-mono text-xs text-slate-500' }, t.id.toUpperCase()),
                    React.createElement('td', { className:'px-4 py-3 font-medium text-slate-800 whitespace-nowrap' }, c ? c.name : '\u2014'),
                    React.createElement('td', { className:'px-4 py-3 text-slate-700 max-w-xs' }, React.createElement('p',{className:'truncate'},t.subject)),
                    React.createElement('td', { className:'px-4 py-3' }, React.createElement(SeverityBadge, { severity:t.severity })),
                    React.createElement('td', { className:'px-4 py-3' }, React.createElement(TicketSentiment, { sentiment:t.sentiment })),
                    React.createElement('td', { className:'px-4 py-3' },
                      React.createElement('span', { className:`text-xs font-semibold ${sla.breached?'text-red-600':sla.atRisk?'text-amber-600':'text-green-600'}` }, sla.label)),
                    React.createElement('td', { className:'px-4 py-3' },
                      sops.length ? React.createElement(CxPill, { tone:'blue' }, '\u26A1 ' + sops.length + ' SOP' + (sops.length===1?'':'s'))
                                  : React.createElement('span',{className:'text-slate-300 text-xs'},'\u2014')),
                    React.createElement('td', { className:'px-4 py-3 text-right text-slate-300' }, '\u2192')
                  );
                })
          )
        )
      )
    ),

    tab !== 'email' && tab !== 'tickets' && React.createElement(Card, { className:'overflow-hidden' },
      React.createElement('div', { className:'overflow-x-auto' },
      React.createElement('table', { className:'w-full text-sm min-w-[860px]' },
        React.createElement('thead', null, React.createElement('tr', { className:'bg-slate-50 border-b' },
          ['Read','Task','Goal','Source','Customer','Due','Priority','Status',''].map(h=>React.createElement('th',{key:h,className:'px-4 py-3 text-left text-xs font-medium text-slate-500'},h))
        )),
        React.createElement('tbody', null,
          items.length === 0 && React.createElement('tr', null, React.createElement('td', { colSpan:9, className:'px-4 py-10 text-center text-slate-400 text-sm' }, showHistory ? 'No completed items in this date range' : 'No items in this date range')),
          items.map((item) => {
            const customer = state.customers.find(c=>c.id===item.customerId);
            const rowKey = item.itemType + '-' + item.id;
            const isRead = readItems.includes(rowKey);
            // Tasks raised by a published Action carry provenance and are called out;
            // manually created tasks render exactly as before, with no extra chrome.
            const fromAction = item.itemType === 'task' && item.source === 'action';
            const openable = item.itemType === 'task';
            return React.createElement('tr', { key:rowKey,
              onClick: openable ? (()=>setOpenTaskId(item.id)) : undefined,
              title: openable ? 'Open task' : undefined,
              className:`border-b hover:bg-slate-50 ${openable ? 'cursor-pointer' : ''} ${fromAction ? 'bg-indigo-50/30' : ''}` },
              React.createElement('td', { className:`px-4 py-3 ${fromAction ? 'border-l-2 border-indigo-500' : ''}` }, React.createElement('input', { type:'checkbox', checked:isRead, onClick:e=>e.stopPropagation(), onChange:()=>dispatch({type:'TOGGLE_READ', itemId:rowKey}), className:'w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer' })),
              React.createElement('td', { className:'px-4 py-3 font-medium max-w-md' },
                React.createElement('p',{className:`truncate ${isRead ? 'text-slate-400' : 'text-slate-900'}`},item.title),
                fromAction && React.createElement('p', { className:'text-[11px] text-indigo-700 font-medium mt-0.5 truncate' },
                  '\u26A1 ' + item.actionName)
              ),
              // A task belongs to a goal \u2014 goals are no longer listed on their own
              React.createElement('td', { className:'px-4 py-3 max-w-[200px]' },
                (function(){
                  const g = item.itemType === 'task' && item.goalId ? state.goals[item.goalId] : null;
                  if (g) return React.createElement('button', {
                    onClick:e=>{ e.stopPropagation(); navigate('/goals/' + g.id); },
                    className:'text-xs text-indigo-600 hover:underline truncate block max-w-full text-left', title:g.title },
                    '\u25CE ' + g.title);
                  return React.createElement('span', { className:'text-xs text-slate-300' },
                    item.itemType === 'task' ? 'Standalone' : '\u2014');
                })()),
              React.createElement('td', { className:'px-4 py-3' },
                item.itemType === 'task'
                  ? (function(){ const sm = taskSourceMeta(item);
                      return React.createElement(CxPill, { tone:sm.tone }, sm.icon + ' ' + sm.label); })()
                  : React.createElement('span', { className:'text-slate-300 text-xs' }, '—')),
              React.createElement('td', { className:'px-4 py-3 text-slate-600' },
                customer
                  ? React.createElement('button', { onClick:e=>{ e.stopPropagation(); navigate('/customers/' + customer.id); },
                      className:'text-indigo-600 hover:underline font-medium text-left' }, customer.name)
                  : React.createElement('span', { className:'text-slate-300' }, '—')),
              React.createElement('td', { className:'px-4 py-3 text-slate-500 text-xs' }, item.dueDate ? new Date(item.dueDate).toLocaleDateString('en-US',{month:'short',day:'numeric'}) : '—'),
              React.createElement('td', { className:'px-4 py-3' }, item.priority ? React.createElement(SeverityBadge, { severity:item.priority }) : React.createElement('span',{className:'text-slate-300 text-xs'},'—')),
              React.createElement('td', { className:'px-4 py-3' }, React.createElement(StatusBadge, { status:item.status })),
              React.createElement('td', { className:'px-4 py-3' },
                item.itemType === 'task' && React.createElement(Btn, { variant:'secondary', size:'xs', onClick:e=>{ e.stopPropagation(); setOpenTaskId(item.id); } }, 'Open'),
                !showHistory && item.itemType === 'task' && item.status === 'todo' && React.createElement(Btn, { variant:'primary', size:'xs', onClick:e=>{ e.stopPropagation(); dispatch({type:'START_TASK',taskId:item.id}); } }, 'Start'),
                !showHistory && item.itemType === 'task' && item.status === 'in_progress' && React.createElement(Btn, { variant:'success', size:'xs', onClick:e=>{ e.stopPropagation(); dispatch({type:'COMPLETE_TASK',taskId:item.id}); } }, 'Done'),
                item.itemType === 'goal' && React.createElement(Btn, { variant:'ghost', size:'xs', onClick:e=>{ e.stopPropagation(); navigate(`/goals/${item.id}`); } }, 'Open'),
                item.itemType === 'meeting' && React.createElement(Btn, { variant:'ghost', size:'xs', onClick:e=>{ e.stopPropagation(); navigate(`/customers/${item.customerId}`); } }, 'View')
              )
            );
          })
        )
      )
      )
    )
    ,
    openTaskId && React.createElement(TaskDetailDrawer, { task:state.tasks[openTaskId], state, dispatch, navigate, onClose:()=>setOpenTaskId(null) })
  );
}

function Renewals() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [showForecast, setShowForecast] = useState(null);
  const [newForecast, setNewForecast] = useState('');
  
  return React.createElement('div', { className:'space-y-5' },
    React.createElement('div', { className:'grid grid-cols-4 gap-4' },
      React.createElement(MetricCard, { label:'Total renewals tracked', value:state.renewals.length }),
      React.createElement(MetricCard, { label:'Next 30 days', value:state.renewals.filter(r=>r.daysRemaining<=30).length, subColor:'text-red-600' }),
      React.createElement(MetricCard, { label:'At risk', value:state.renewals.filter(r=>r.forecast==='at_risk').length }),
      React.createElement(MetricCard, { label:'Commit', value:state.renewals.filter(r=>r.forecast==='commit').length })
    ),
    React.createElement(Card, { className:'overflow-hidden' },
      React.createElement('table', { className:'w-full text-sm' },
        React.createElement('thead', null, React.createElement('tr', { className:'bg-slate-50 border-b' },
          ['Customer','ARR','Renewal date','Days','Health','Forecast','Probability','Risk','Goal coverage','Owner','Next step',''].map(h=>React.createElement('th',{key:h,className:'px-3 py-3 text-left text-xs font-medium text-slate-500 whitespace-nowrap'},h))
        )),
        React.createElement('tbody', null,
          state.renewals.sort((a,b)=>a.daysRemaining-b.daysRemaining).map(r => {
            const c = state.customers.find(cu=>cu.id===r.customerId);
            return React.createElement('tr', { key:r.id, className:'border-b hover:bg-slate-50' },
              React.createElement('td', { className:'px-3 py-3 font-medium cursor-pointer hover:text-indigo-600', onClick:()=>navigate(`/customers/${r.customerId}`) }, c?.name),
              React.createElement('td', { className:'px-3 py-3' }, formatARR(r.arr)),
              React.createElement('td', { className:'px-3 py-3 text-slate-600' }, new Date(r.renewalDate).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})),
              React.createElement('td', { className:`px-3 py-3 font-semibold ${r.daysRemaining<30?'text-red-600':r.daysRemaining<60?'text-amber-600':'text-slate-700'}` }, r.daysRemaining),
              React.createElement('td', { className:'px-3 py-3' }, React.createElement(HealthBadge, { band:r.healthBand })),
              React.createElement('td', { className:'px-3 py-3' }, React.createElement('span', { className:`px-2 py-0.5 text-xs rounded-full font-medium capitalize ${r.forecast==='commit'?'bg-green-100 text-green-700':r.forecast==='likely'?'bg-blue-100 text-blue-700':r.forecast==='at_risk'?'bg-red-100 text-red-700':'bg-amber-100 text-amber-700'}` }, r.forecast.replace('_',' '))),
              React.createElement('td', { className:'px-3 py-3 text-slate-600' }, Math.round(r.probability*100) + '%'),
              React.createElement('td', { className:'px-3 py-3 text-red-700' }, r.riskAmount > 0 ? formatARR(r.riskAmount) : React.createElement('span',{className:'text-slate-400'},'—')),
              React.createElement('td', { className:'px-3 py-3' }, r.goalCoverage ? React.createElement('span',{className:'text-green-600 text-xs'},'✓') : React.createElement('span',{className:'text-red-600 text-xs'},'✗')),
              React.createElement('td', { className:'px-3 py-3' }, React.createElement(Avatar, { user:USERS[r.ownerId] })),
              React.createElement('td', { className:'px-3 py-3 text-xs text-slate-600 max-w-xs' }, React.createElement('p',{className:'truncate'},r.nextStep)),
              React.createElement('td', { className:'px-3 py-3' }, React.createElement(Btn, { variant:'secondary', size:'xs', onClick:()=>{ setShowForecast(r.id); setNewForecast(r.forecast); } }, 'Update'))
            );
          })
        )
      )
    ),
    showForecast && React.createElement(Modal, { open:true, onClose:()=>setShowForecast(null), title:'Update renewal forecast' },
      React.createElement('div', { className:'space-y-4' },
        React.createElement('div', null,
          React.createElement('label', { className:'text-sm font-medium text-slate-700' }, 'Forecast category'),
          React.createElement('select', { value:newForecast, onChange:e=>setNewForecast(e.target.value), className:'w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500' },
            ['commit','likely','upside','at_risk','omitted'].map(f=>React.createElement('option',{key:f,value:f},f.charAt(0).toUpperCase()+f.slice(1).replace('_',' ')))
          )
        ),
        React.createElement('div', { className:'flex gap-2' },
          React.createElement(Btn, { variant:'primary', onClick:()=>{ dispatch({type:'UPDATE_RENEWAL_FORECAST',renewalId:showForecast,forecast:newForecast}); setShowForecast(null); } }, 'Update forecast'),
          React.createElement(Btn, { variant:'ghost', onClick:()=>setShowForecast(null) }, 'Cancel')
        )
      )
    )
  );
}


// ============================================================
// TICKETS — views, filters, SLA and field suggestions
// ============================================================

// ============================================================
// PERSONAS — the product reorients around Customers or Tickets
// ============================================================

// Which nav items each persona sees, and in what order

// ============================================================
// TICKET ACTIONS — repeatable SOPs a support agent runs on a ticket
// ============================================================

// Ticket automations decide which SOP applies to which ticket
const ticketActionSteps = (a) => a.steps.length;


// Plain-English filter parser for the ticket list
function parseTicketPrompt(text){
  const p = (text||'').toLowerCase();
  const out = { severity:null, status:null, sla:null, sentiment:null, ageMin:null, revMin:null, customer:null, matched:[] };
  const add = l => out.matched.push(l);
  if (/critical|p1/.test(p))        { out.severity='critical'; add('Severity is Critical'); }
  else if (/high|p2/.test(p))       { out.severity='high';     add('Severity is High'); }
  if (/breach/.test(p))             { out.sla='breached';      add('SLA breached'); }
  else if (/at risk|nearly|about to breach/.test(p)) { out.sla='at_risk'; add('SLA at risk'); }
  if (/unresolved|still open|\bopen\b/.test(p)) { out.status='open';     add('Still open'); }
  else if (/resolved|closed/.test(p))           { out.status='resolved'; add('Resolved'); }
  if (/angry|unhappy|negative|frustrat/.test(p)){ out.sentiment='negative'; add('Negative sentiment'); }
  else if (/happy|positive/.test(p))            { out.sentiment='positive'; add('Positive sentiment'); }
  const age = p.match(/(?:older than|more than|over)\s*(\d{1,3})\s*day/);
  if (age) { out.ageMin=parseInt(age[1],10); add('Older than ' + age[1] + ' days'); }
  else if (/ageing|aging|stale/.test(p)) { out.ageMin=5; add('Older than 5 days'); }
  const rev = p.match(/(?:over|above|more than)\s*\$?\s*([\d.]+)\s*([km])?/);
  if (rev) { const n=parseFloat(rev[1])*(rev[2]==='m'?1e6:rev[2]==='k'?1e3:1); out.revMin=n; add('Revenue impact over ' + formatARR(n)); }
  return out;
}

// SLA clock. Ticket data carries a state, not a countdown, so derive one.

// Suggested field values the agent can accept onto the ticket
function suggestTicketFields(t, customer){
  const s = cxHash(t.id);
  const cats = ['Data pipeline','Authentication','Reporting','Integrations','Performance','Billing'];
  const causes = ['Bug','Configuration','Third-party','User error','Capacity'];
  const text = (t.subject + ' ' + (t.summary||'')).toLowerCase();
  const cat = /sync|etl|pipeline|data/.test(text) ? 'Data pipeline'
            : /sso|login|auth|token/.test(text) ? 'Authentication'
            : /report|dashboard|export/.test(text) ? 'Reporting'
            : /api|webhook|connector|integration/.test(text) ? 'Integrations'
            : /slow|timeout|latency|performance/.test(text) ? 'Performance'
            : cxPick(cats, s);
  const cause = /rate-limit|bug|failure|error|crash/.test(text) ? 'Bug'
              : /config|setting|permission/.test(text) ? 'Configuration'
              : /third|vendor|upstream/.test(text) ? 'Third-party'
              : cxPick(causes, s);
  const escalate = t.severity==='critical' || t.sla==='breached' || (t.revenueImpact||0) >= 200000;
  return [
    { field:'Category',        value:cat,    confidence: 0.92, why:'Matched keywords in the subject and summary.' },
    { field:'Root cause',      value:cause,  confidence: 0.78, why:'Inferred from the described failure mode.' },
    { field:'Priority',        value: t.severity==='critical' ? 'P1 \u2014 Critical' : t.severity==='high' ? 'P2 \u2014 High' : 'P3 \u2014 Normal',
      confidence: 0.88, why:'Derived from severity and revenue exposure.' },
    { field:'Escalate to tier 2', value: escalate ? 'Yes' : 'No', confidence: escalate ? 0.84 : 0.71,
      why: escalate ? 'Critical severity or SLA breach on a high-value account.' : 'Within normal handling range.' },
    { field:'Product area',    value: cat === 'Data pipeline' ? 'Data Pipeline' : cat === 'Authentication' ? 'Platform' : 'Analytics',
      confidence: 0.69, why:'Mapped from the detected category.' },
  ];
}

// Next best actions for a ticket
// Auto-drafted composer content. Everything here is assembled from the ticket
// record itself (severity, SLA state, age, sentiment, revenue, summary) so the
// draft states facts the agent can verify rather than inventing a commitment.
function draftComposerHtml(mode, ticket, customer, sla){
  const esc = (s) => String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const contactName = (getTicketEmails(ticket, customer).find(e=>e.dir==='inbound') || {}).sender || 'there';
  const first = String(contactName).replace(/\(.*?\)/g,'').trim().split(/\s+/)[0] || 'there';
  const sev = ticket.severity === 'critical' ? 'critical' : ticket.severity === 'high' ? 'high priority' : 'standard priority';
  const target = SLA_TARGET_HOURS[ticket.severity] || 24;

  if (mode === 'note') {
    const bits = [
      '<p><b>Internal note \u2014 ' + esc(ticket.id.toUpperCase()) + '</b></p>',
      '<p>' + esc(ticket.summary || 'No summary on file.') + '</p>',
      '<ul>',
      '<li>Open ' + ticket.age + ' days against a ' + target + 'h ' + esc(sev) + ' target' + (sla.breached ? ' \u2014 <b>SLA breached</b>' : sla.atRisk ? ' \u2014 SLA at risk' : '') + '.</li>',
      ticket.revenueImpact ? '<li>' + esc(formatARR(ticket.revenueImpact)) + ' of ARR exposed on ' + esc(customer ? customer.name : 'this account') + '.</li>' : '',
      ticket.sentiment === 'negative' ? '<li>Customer sentiment is negative \u2014 recommend a call over a written reply.</li>' : '',
      '<li>Next check-in: confirm owner and committed date before the next update.</li>',
      '</ul>',
      '<p><i>Replace this with what you actually know \u2014 the draft only restates the ticket record.</i></p>',
    ];
    return bits.filter(Boolean).join('');
  }

  if (mode === 'forward') {
    return [
      '<p>Hi \u2014 forwarding ' + esc(ticket.id.toUpperCase()) + ' from ' + esc(customer ? customer.name : 'a customer') + ' for your input.</p>',
      '<p><b>What we need:</b> a root-cause read and a realistic fix date we can commit to in writing.</p>',
      '<ul>',
      '<li>Severity: ' + esc(sev) + ', open ' + ticket.age + ' days' + (sla.breached ? ' (SLA breached)' : '') + '.</li>',
      ticket.revenueImpact ? '<li>Commercial exposure: ' + esc(formatARR(ticket.revenueImpact)) + ' ARR.</li>' : '',
      '<li>Summary: ' + esc(ticket.summary || ticket.subject) + '</li>',
      '</ul>',
      '<p>Full thread is quoted below. Thanks,<br/>Maya</p>',
    ].filter(Boolean).join('');
  }

  const opener = sla.breached
    ? '<p>Hi ' + esc(first) + ',</p><p>I owe you an update on this, and an apology for the delay \u2014 we passed our ' + target + '-hour response target on this one.</p>'
    : ticket.sentiment === 'negative'
      ? '<p>Hi ' + esc(first) + ',</p><p>Thank you for staying with us on this, and I am sorry it has taken this long to resolve.</p>'
      : '<p>Hi ' + esc(first) + ',</p><p>Thanks for raising this \u2014 here is where things stand.</p>';

  return [
    opener,
    '<p><b>Where we are:</b> ' + esc(ticket.summary || ticket.subject) + '</p>',
    '<p><b>What happens next:</b></p>',
    '<ul>',
    '<li>[Confirm the specific fix or workaround here.]</li>',
    '<li>[Add the date and time you can commit to.]</li>',
    '<li>I will send you the next update by [date], whether or not it is resolved.</li>',
    '</ul>',
    ticket.severity === 'critical' ? '<p>This is being tracked as a critical issue on our side and has engineering attention.</p>' : '',
    '<p>If it is easier to talk it through, I am happy to get on a call.</p>',
    '<p>Best regards,<br/>Maya Chen<br/>CX42 Support</p>',
  ].filter(Boolean).join('');
}

// Rich text editor used by the ticket composer. Uncontrolled on purpose: React
// re-rendering a contentEditable on every keystroke destroys the caret, so the
// DOM owns the content and we only push HTML in when something else writes it.
function RichTextEditor({ html, onChange, placeholder, accent='indigo' }){
  const ref = useRef(null);
  const last = useRef(html);

  useEffect(() => {
    if (ref.current && html !== last.current && html !== ref.current.innerHTML) {
      ref.current.innerHTML = html || '';
      last.current = html;
    }
  }, [html]);

  const exec = (cmd, val) => {
    if (ref.current) ref.current.focus();
    try { document.execCommand(cmd, false, val==null ? null : val); } catch(e) {}
    if (ref.current) { last.current = ref.current.innerHTML; onChange(ref.current.innerHTML); }
  };
  const input = () => { if (ref.current) { last.current = ref.current.innerHTML; onChange(ref.current.innerHTML); } };
  const pastePlain = (e) => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text/plain');
    try { document.execCommand('insertText', false, text); } catch(err) {}
    input();
  };

  const btn = (label, cmd, val, title) => React.createElement('button', {
    key: title || label + cmd, type:'button', title: title || label,
    onMouseDown: (e)=>{ e.preventDefault(); exec(cmd, val); },
    className:'w-7 h-7 rounded-md text-slate-600 hover:bg-slate-100 text-xs flex items-center justify-center flex-shrink-0'
  }, label);

  const sel = (opts, cmd, width, title) => React.createElement('select', {
    key: title, title, defaultValue:'', onChange:(e)=>{ const v=e.target.value; e.target.value=''; if (v) exec(cmd, v); },
    className:`${width} text-[11px] border border-slate-200 rounded-md px-1 py-1 bg-white text-slate-600 outline-none cursor-pointer flex-shrink-0`
  }, [React.createElement('option', { key:'_', value:'' }, title)].concat(
      opts.map(o => React.createElement('option', { key:o[1], value:o[1] }, o[0]))));

  const divider = (k) => React.createElement('span', { key:k, className:'w-px h-5 bg-slate-200 mx-0.5 flex-shrink-0' });

  return React.createElement('div', { className:'border border-slate-200 rounded-lg overflow-hidden bg-white' },
    React.createElement('div', { className:'flex items-center gap-0.5 flex-wrap px-1.5 py-1.5 border-b border-slate-200 bg-slate-50' },
      sel([['Sans serif','Arial, Helvetica, sans-serif'],['Serif','Georgia, serif'],['Monospace','ui-monospace, Menlo, monospace'],['System','-apple-system, Segoe UI, sans-serif']], 'fontName', 'w-24', 'Font'),
      sel([['Small','2'],['Normal','3'],['Medium','4'],['Large','5'],['Huge','6']], 'fontSize', 'w-20', 'Size'),
      sel([['Paragraph','<p>'],['Heading 1','<h1>'],['Heading 2','<h2>'],['Heading 3','<h3>'],['Quote','<blockquote>'],['Code block','<pre>']], 'formatBlock', 'w-24', 'Style'),
      divider('d1'),
      btn(React.createElement('b',null,'B'), 'bold', null, 'Bold'),
      btn(React.createElement('i',null,'I'), 'italic', null, 'Italic'),
      btn(React.createElement('u',null,'U'), 'underline', null, 'Underline'),
      btn(React.createElement('s',null,'S'), 'strikeThrough', null, 'Strikethrough'),
      divider('d2'),
      React.createElement('label', { key:'fg', title:'Text colour',
        className:'w-7 h-7 rounded-md hover:bg-slate-100 flex items-center justify-center cursor-pointer flex-shrink-0 text-xs font-bold text-slate-600' },
        'A',
        React.createElement('input', { type:'color', defaultValue:'#0f172a', onChange:e=>exec('foreColor', e.target.value),
          className:'w-0 h-0 opacity-0 absolute' })),
      React.createElement('label', { key:'bg', title:'Highlight',
        className:'w-7 h-7 rounded-md hover:bg-slate-100 flex items-center justify-center cursor-pointer flex-shrink-0 text-xs' },
        '\u{1F58D}',
        React.createElement('input', { type:'color', defaultValue:'#fef08a', onChange:e=>exec('hiliteColor', e.target.value),
          className:'w-0 h-0 opacity-0 absolute' })),
      divider('d3'),
      btn('\u2022', 'insertUnorderedList', null, 'Bulleted list'),
      btn('1.', 'insertOrderedList', null, 'Numbered list'),
      btn('\u21E5', 'indent', null, 'Indent'),
      btn('\u21E4', 'outdent', null, 'Outdent'),
      divider('d4'),
      btn('\u2261', 'justifyLeft', null, 'Align left'),
      btn('\u2016', 'justifyCenter', null, 'Align centre'),
      btn('\u2637', 'justifyFull', null, 'Justify'),
      divider('d5'),
      React.createElement('button', { key:'link', type:'button', title:'Insert link',
        onMouseDown:(e)=>{ e.preventDefault(); const u = window.prompt('Link URL', 'https://'); if (u) exec('createLink', u); },
        className:'w-7 h-7 rounded-md text-slate-600 hover:bg-slate-100 text-xs flex items-center justify-center flex-shrink-0' }, '\u{1F517}'),
      btn('\u2702', 'unlink', null, 'Remove link'),
      btn('\u2014', 'insertHorizontalRule', null, 'Divider'),
      divider('d6'),
      btn('\u21B6', 'undo', null, 'Undo'),
      btn('\u21B7', 'redo', null, 'Redo'),
      btn('\u2327', 'removeFormat', null, 'Clear formatting')
    ),
    React.createElement('div', {
      ref, contentEditable:true, suppressContentEditableWarning:true,
      onInput:input, onBlur:input, onPaste:pastePlain,
      'data-placeholder': placeholder || '',
      className:'cx-editor px-3 py-2.5 text-sm text-slate-800 leading-relaxed ' +
        (accent==='amber' ? 'bg-white' : accent==='sky' ? 'bg-white' : 'bg-white')
    })
  );
}

function ticketNextActions(t, customer, sla){
  const out = [];
  if (sla.breached) out.push({ t:'Send a written status update with a committed fix date', why:'SLA has already breached \u2014 silence is what damages trust from here.', owner:'You', due:'Today' });
  else if (sla.atRisk) out.push({ t:'Acknowledge with a next-update time before the SLA lapses', why:sla.label + ' on a ' + t.severity + ' ticket.', owner:'You', due:'Within ' + Math.max(1, sla.remaining) + 'h' });
  if (t.sentiment === 'negative') out.push({ t:'Call the contact rather than replying by email', why:'Sentiment is negative; a written reply is unlikely to reset the relationship.', owner:'You', due:'Today' });
  if ((t.revenueImpact||0) >= 150000) out.push({ t:'Flag to the account owner and log a risk', why:formatARR(t.revenueImpact) + ' of ARR is exposed by this issue.', owner:'CSM', due:'Today' });
  if (t.age > 5) out.push({ t:'Escalate to engineering with a business-impact summary', why:'Open ' + t.age + ' days without resolution.', owner:'Support lead', due:'This week' });
  out.push({ t:'Attach the resolution to the account timeline', why:'Keeps the customer record complete for the next review.', owner:'You', due:'On close' });
  return out.slice(0,4);
}

// ── Sentiment chip, shown in every ticket view ──
function TicketSentiment({ sentiment, size='sm' }){
  const m = { positive:{t:'green',i:'\u{1F642}',l:'Positive'}, neutral:{t:'slate',i:'\u{1F610}',l:'Neutral'},
              negative:{t:'red',i:'\u{1F641}',l:'Negative'} }[sentiment] || { t:'slate', i:'\u{1F610}', l:'Unknown' };
  return React.createElement(CxPill, { tone:m.t }, m.i + (size==='sm' ? ' ' + m.l : ''));
}

// ── Ticket detail ──

// ── Ticket detail \u203a Actions tab: the SOPs an agent runs on this ticket ──

// ============================================================
// TICKET ACTIVITY, TEAM CHAT AND FOLLOWING
// ============================================================
// Activity is one stream with three lenses: what the customer and agent said to
// each other, what the system did on its own, and what the agent changed.
function getTicketActivity(ticket, customer){
  if (!ticket) return [];
  const s = cxHash(ticket.id);
  const who = customer ? customer.name : 'Customer';
  const contact = ['Sarah Mitchell','Tom Rivera','Priya Anand','James Okafor','Elena Fischer'][s % 5];
  const agent = 'Maya Chen';
  const day = (n) => { const d = new Date('2025-08-17T09:00:00'); d.setDate(d.getDate() - n); return d; };
  const fmt = (d, h) => d.toLocaleDateString('en-US',{month:'short',day:'numeric'}) + ' \u00b7 ' + h;

  const out = [
    { kind:'interaction', dir:'inbound',  at:fmt(day(ticket.age||3),'09:14'), who:contact,
      title:'Customer raised the ticket', body:ticket.subject, icon:'\u2709', tone:'purple' },
    { kind:'system',      at:fmt(day(ticket.age||3),'09:14'), who:'System',
      title:'Ticket created from ' + cxPick(['support@cx42.io','the customer portal','the in-app widget'], s),
      body:'Priority set to ' + ticket.severity + ' by the assignment policy.', icon:'\u2699', tone:'slate' },
    { kind:'system',      at:fmt(day(ticket.age||3),'09:15'), who:'System',
      title:'Assigned to ' + agent, body:'Round-robin within the ' + (ticket.severity==='critical'?'escalation':'standard') + ' queue.', icon:'\u2699', tone:'slate' },
    { kind:'interaction', dir:'outbound', at:fmt(day(Math.max(0,(ticket.age||3)-1)),'10:02'), who:agent,
      title:'Agent replied', body:'Acknowledged and asked for the error log plus the affected user count.', icon:'\u21A9', tone:'blue' },
    { kind:'agent',       at:fmt(day(Math.max(0,(ticket.age||3)-1)),'10:05'), who:agent,
      title:'Private note added', body:'Suspect the same root cause as the connector issue reported last month.', icon:'\u{1F4DD}', tone:'amber' },
  ];

  if (ticket.sentiment === 'negative')
    out.push({ kind:'interaction', dir:'inbound', at:fmt(day(1),'21:40'), who:contact,
      title:'Customer chased for an update', body:'Tone has turned \u2014 sentiment scored negative on this reply.', icon:'\u2709', tone:'red' });

  if (ticket.sla === 'breached')
    out.push({ kind:'system', at:fmt(day(1),'13:00'), who:'System',
      title:'SLA breached', body:'First-response target of ' + (SLA_TARGET_HOURS[ticket.severity]||24) + 'h was exceeded.', icon:'\u26A0', tone:'red' });
  else if (ticket.sla === 'at_risk')
    out.push({ kind:'system', at:fmt(day(0),'07:30'), who:'System',
      title:'SLA warning raised', body:'Ticket is inside 20% of its response target.', icon:'\u23F1', tone:'amber' });

  const sops = (typeof actionsForTicket === 'function') ? actionsForTicket(ticket) : [];
  if (sops.length) out.push({ kind:'system', at:fmt(day(0),'07:31'), who:'Automation',
    title:sops.length + ' action' + (sops.length===1?'':'s') + ' applied',
    body:sops.map(a=>a.name).join(', '), icon:'\u26A1', tone:'blue' });

  if (ticket.severity === 'critical')
    out.push({ kind:'agent', at:fmt(day(0),'08:10'), who:agent,
      title:'Priority raised to critical', body:'Production impact confirmed across ' + (20 + (s % 40)) + ' users.', icon:'\u2191', tone:'red' });

  out.push({ kind:'agent', at:fmt(day(0),'08:22'), who:agent,
    title:'Category set to ' + cxPick(['Data pipeline','Authentication','Reporting','Integrations'], s),
    body:'Applied from the field suggester.', icon:'\u{1F3F7}', tone:'slate' });

  if (ticket.status === 'resolved')
    out.push({ kind:'system', at:fmt(day(0),'11:00'), who:'System', title:'Ticket resolved',
      body:'CSAT survey queued for delivery.', icon:'\u2713', tone:'green' });

  return out;
}
// Email address for a name mentioned in the ticket conversation log.
// Support-side names resolve to the shared support mailbox; everyone else
// resolves against the customer's own domain.
function ticketEmailAddress(sender, customer){
  if (/support|cx42|maya|agent/i.test(sender||'')) return 'support@cx42.io';
  const domain = customer ? customer.domain : 'customer.com';
  const clean = String(sender||'').replace(/\(.*?\)/g,'').replace(/[^A-Za-z\s.]/g,'').trim();
  const parts = clean.toLowerCase().split(/\s+/).filter(Boolean);
  const local = parts.length > 1
    ? parts[0] + '.' + parts[parts.length-1].replace(/\.+$/,'')
    : (parts[0] || 'contact');
  return local + '@' + domain;
}

// The email thread on the ticket. Each line of the seeded conversation log
// ("Jul 15: Sarah M. (Acme): message") becomes one message with a sender,
// an address and a direction, so the tab reads like a real mailbox thread.
function getTicketEmails(ticket, customer){
  if (!ticket) return [];
  const lines = String(ticket.conversation || '').split('\n').map(l=>l.trim()).filter(Boolean);
  const out = [];
  let contactAddr = null;
  lines.forEach((line, i) => {
    const m = line.match(/^([A-Za-z]{3}\s+\d{1,2})\s*:\s*([\s\S]*)$/);
    const when = m ? m[1] : null;
    const rest = m ? m[2] : line;
    const p = rest.match(/^([^:]{2,60}?)\s*:\s*([\s\S]+)$/);
    const rawSender = p ? p[1].trim() : (customer ? customer.name : 'Customer');
    const body = (p ? p[2] : rest).trim();
    const outbound = /support|cx42|maya|agent/i.test(rawSender);
    const address = ticketEmailAddress(rawSender, customer);
    if (!outbound && !contactAddr) contactAddr = address;
    out.push({
      id: ticket.id + '_m' + i,
      when: when || 'Earlier',
      dir: outbound ? 'outbound' : 'inbound',
      sender: outbound ? 'Maya Chen \u00b7 Support' : rawSender,
      address: outbound ? 'support@cx42.io' : address,
      to: outbound ? (contactAddr || ('contact@' + (customer ? customer.domain : 'customer.com'))) : 'support@cx42.io',
      subject: i === 0 ? ticket.subject : 'Re: ' + ticket.subject,
      body,
    });
  });
  return out;
}

const ACTIVITY_LENSES = [
  { id:'all',         label:'All activity' },
  { id:'interaction', label:'Interactions' },
  { id:'system',      label:'System updates' },
  { id:'agent',       label:'Agent updates' },
];

// Slack / Teams threads about the customer who raised the ticket
function getChatThreads(customer){
  if (!customer) return [];
  const s = cxHash(customer.id);
  const first = customer.name.split(' ')[0].toLowerCase();
  return [
    { id:'ch1', channel:'#cs-escalations', platform:'Slack', when:'Today \u00b7 08:04', replies:6 + (s % 5),
      opener:'Maya Chen', text:'Raising ' + customer.name + ' \u2014 the sync failure is now nine days old and the sponsor is asking for a board-ready answer.',
      replyPreview:[{ who:'Priya Raman', text:'Engineering has a fix queued. I can join the call if it helps.' },
                    { who:'James Park',  text:'Worth checking whether this is the same connector defect as last month.' }] },
    { id:'ch2', channel:'#account-' + first, platform:'Slack', when:'Yesterday \u00b7 16:22', replies:3 + (s % 4),
      opener:'Sam Rivera', text:'Renewal for ' + customer.name + ' is inside the window. Anything open on support I should know about before the call?',
      replyPreview:[{ who:'Maya Chen', text:'One critical still open. I will send you the status before Thursday.' }] },
    { id:'ch3', channel:'Support \u2014 Tier 2', platform:'Teams', when:'2 days ago \u00b7 11:47', replies:2 + (s % 3),
      opener:'Amara Osei', text:'Tier 2 review for ' + customer.name + ': confirming whether the rate-limit change needs a config push or a release.',
      replyPreview:[{ who:'Engineering', text:'Config push. We can ship it without waiting for the release train.' }] },
  ].slice(0, 2 + (s % 2));
}


// Editable ticket fields shown on the detail page. Status leads because the
// agent needs to move it the moment they action something.
// ============================================================
// GATED TICKET FIELDS
// ------------------------------------------------------------
// Two sets of fields that must be captured at a specific moment in the
// ticket's life, rather than whenever someone gets round to it:
//   1. First response — captured before the first reply leaves the ticket.
//   2. Resolution     — captured before the ticket moves to Resolved/Closed.
// Both are enforced by a review modal at the moment of the action, because a
// field that is merely "required" on a form is a field that gets filled with
// the first option in the list. Asking at the point of the action is the only
// place the agent actually has the answer in mind.
// ============================================================


function gateDefFor(key){ return TICKET_FIELD_DEFS.find(f=>f.key===key) || { key, type:'text' }; }
function gateFields(cfg, phase){ return ((cfg||TICKET_GATE_DEFAULTS)[phase] || {}).fields || []; }

// Which required keys are still empty for this phase.
function missingGateFields(cfg, phase, values){
  return gateFields(cfg, phase)
    .filter(f => f.required && !String((values||{})[f.key] || '').trim())
    .map(f => f.key);
}

const statusToneOf = (v) => /resolved|closed/i.test(v||'') ? 'green'
  : /awaiting|pending/i.test(v||'') ? 'amber'
  : /in progress/i.test(v||'') ? 'blue' : 'red';

// The five fields an agent needs at a glance. Everything else is a click away
// behind "Show all ticket fields" — a panel of fifteen dropdowns is a panel
// nobody reads.

// Seed the editable fields from the ticket record
function initialTicketFields(t){
  const sev = t.severity;
  return {
    'Status': ({ open:'Open', in_progress:'In progress', resolved:'Resolved' })[t.status] || 'Open',
    'Priority': sev==='critical' ? 'P1 \u2014 Critical' : sev==='high' ? 'P2 \u2014 High' : sev==='medium' ? 'P3 \u2014 Normal' : 'P4 \u2014 Low',
    'Assignee': 'Maya Chen',
    'Group': sev==='critical' || sev==='high' ? 'Tier 2 Support' : 'Tier 1 Support',
    'Category': '', 'Root cause': '', 'Product area': '',
    'Escalate to tier 2': 'No', 'Error type': t.errorType || '',
  };
}

// The review modal that stands between the agent and the action. Prefilled
// from what the ticket already knows plus the AI suggestions, so the common
// case is "read it, correct one thing, confirm" rather than data entry.
function TicketFieldGateModal({ open, phase, cfg, ticket, customer, values, onChange, onCancel, onConfirm, actionLabel }){
  if (!open) return null;
  const conf = (cfg || TICKET_GATE_DEFAULTS)[phase] || {};
  const defs = gateFields(cfg, phase);
  const missing = missingGateFields(cfg, phase, values);
  const suggested = {};
  suggestTicketFields(ticket, customer).forEach(s => { suggested[s.field] = s; });
  const isResolution = phase === 'resolution';

  const lbl = 'text-[10px] font-bold text-slate-400 uppercase tracking-wider';
  const inp = 'w-full mt-1 text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400';

  return React.createElement(Modal, { open:true, onClose:onCancel,
    title: isResolution ? 'Before you resolve this ticket' : 'Before your first reply goes out', size:'lg' },
    React.createElement('div', { className:'space-y-3' },

      React.createElement('div', { className:`rounded-xl p-3 ${isResolution?'bg-green-50/60 border border-green-100':'bg-indigo-50/50 border border-indigo-100'}` },
        React.createElement('p', { className:'text-sm text-slate-700 leading-relaxed' },
          isResolution
            ? 'These fields close the loop on ' + ticket.id.toUpperCase() + '. They drive root-cause reporting and knowledge coverage, so they are captured here rather than chased down afterwards.'
            : 'This is the first reply going out on ' + ticket.id.toUpperCase() + '. Confirm how it has been classified \u2014 these fields drive routing, SLA and reporting, and after this they are far harder to get right from memory.'),
        missing.length > 0 && React.createElement('p', { className:'text-xs font-semibold text-amber-700 mt-2' },
          missing.length + ' mandatory field' + (missing.length===1?'':'s') + ' still to complete: ' + missing.join(', ')),
        missing.length === 0 && React.createElement('p', { className:'text-xs font-semibold text-green-700 mt-2' },
          '\u2713 All mandatory fields complete')),

      React.createElement('div', { className:'space-y-2.5 max-h-[46vh] overflow-y-auto pr-1' },
        defs.map(f => {
          const def = gateDefFor(f.key);
          const val = (values || {})[f.key] || '';
          const isMissing = f.required && !String(val).trim();
          const sug = suggested[f.key];
          return React.createElement('div', { key:f.key,
            className:`border rounded-xl p-3 ${isMissing?'border-amber-300 bg-amber-50/40':'border-slate-200'}` },
            React.createElement('div', { className:'flex items-center gap-2 flex-wrap' },
              React.createElement('span', { className:lbl }, f.key),
              f.required
                ? React.createElement(CxPill, { tone:'red' }, 'Mandatory')
                : React.createElement(CxPill, { tone:'slate' }, 'Optional'),
              sug && sug.value === val && React.createElement(CxPill, { tone:'blue' }, 'AI suggested')),
            f.help && React.createElement('p', { className:'text-[11px] text-slate-500 mt-0.5 leading-relaxed' }, f.help),
            def.type === 'textarea'
              ? React.createElement('textarea', { value:val, rows:3, onChange:e=>onChange(f.key, e.target.value),
                  placeholder:'What was wrong, what fixed it, and what the customer should expect next\u2026',
                  className:inp + ' resize-y' })
              : def.type === 'select'
                ? React.createElement('select', { value:val, onChange:e=>onChange(f.key, e.target.value), className:inp },
                    [React.createElement('option',{key:'_',value:''},'Select\u2026')].concat(
                      (def.options||[]).map(o=>React.createElement('option',{key:o,value:o},o))))
                : React.createElement('input', { value:val, onChange:e=>onChange(f.key, e.target.value), className:inp }),
            sug && sug.value && sug.value !== val && React.createElement('button', {
              onClick:()=>onChange(f.key, sug.value),
              className:'text-[11px] text-indigo-600 hover:underline mt-1.5' },
              'Use suggestion: ' + sug.value + ' \u00b7 ' + Math.round(sug.confidence*100) + '% \u2014 ' + sug.why)
          );
        })),

      React.createElement('div', { className:'flex justify-between items-center gap-2 pt-2 border-t border-slate-100 flex-wrap' },
        React.createElement('span', { className:'text-[11px] text-slate-400' },
          conf.blocking ? 'Mandatory fields must be complete to continue.' : 'You can continue without these, but they will be flagged.'),
        React.createElement('div', { className:'flex gap-2' },
          React.createElement(Btn, { variant:'secondary', onClick:onCancel },
            isResolution ? 'Cancel' : 'Back to editing'),
          React.createElement(Btn, { variant:'primary', onClick:onConfirm,
            disabled: conf.blocking && missing.length > 0 },
            actionLabel || (isResolution ? 'Save and resolve' : 'Save and send reply'))))
    )
  );
}

function TicketActionsPane({ ticket, customer, dispatch }){
  const applicable = actionsForTicket(ticket);
  const [openId, setOpenId] = useState(applicable.length ? applicable[0].id : null);
  const [done, setDone] = useState({});

  const toggle = (k) => setDone(d=>({ ...d, [k]: !d[k] }));
  const totalSteps = applicable.reduce((n,a)=>n+a.steps.length, 0);
  const doneCount = Object.values(done).filter(Boolean).length;

  if (applicable.length === 0)
    return React.createElement(Card, { className:'p-10 text-center' },
      React.createElement('p', { className:'text-2xl mb-2' }, '\u26A1'),
      React.createElement('p', { className:'text-sm text-slate-500' }, 'No actions apply to this ticket'));

  return React.createElement('div', { className:'space-y-3' },
    React.createElement(Card, { className:'p-3 bg-indigo-50/50 border-indigo-100' },
      React.createElement('div', { className:'flex items-center gap-3 flex-wrap' },
        React.createElement('div', { className:'flex-1 min-w-0' },
          React.createElement('p', { className:'text-sm font-semibold text-slate-800' },
            applicable.length + ' action' + (applicable.length===1?'':'s') + ' apply to this ticket'),
          React.createElement('p', { className:'text-[11px] text-slate-500 mt-0.5' },
            'Applied automatically by ticket automations \u00b7 ' + doneCount + ' of ' + totalSteps + ' tasks complete')),
        React.createElement('div', { className:'w-28 h-1.5 bg-white rounded-full overflow-hidden' },
          React.createElement('div', { className:'h-full bg-indigo-500 rounded-full', style:{ width:(totalSteps?Math.round(doneCount/totalSteps*100):0)+'%' } })))
    ),

    applicable.map(a => {
      const open = openId === a.id;
      const aDone = a.steps.filter((_,i)=>done[a.id+'_'+i]).length;
      return React.createElement(Card, { key:a.id, className:'overflow-hidden' },
        React.createElement('button', { onClick:()=>setOpenId(open?null:a.id),
          className:'w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-slate-50' },
          React.createElement('span', { className:`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${ADMIN_TONES[a.tone]}` }, a.icon),
          React.createElement('span', { className:'flex-1 min-w-0' },
            React.createElement('span', { className:'flex items-center gap-2 flex-wrap' },
              React.createElement('span', { className:'text-sm font-semibold text-slate-900' }, a.name),
              React.createElement(CxPill, { tone:'slate' }, a.category),
              aDone === a.steps.length && React.createElement(CxPill, { tone:'green' }, '\u2713 Complete')),
            React.createElement('span', { className:'block text-[11px] text-slate-500 mt-0.5' },
              React.createElement('span', { className:'font-semibold text-slate-600' }, 'Applies when: '), a.when)),
          React.createElement('span', { className:'text-[11px] text-slate-400 flex-shrink-0' }, aDone + '/' + a.steps.length),
          React.createElement('span', { className:'text-slate-300 flex-shrink-0' }, open ? '\u2227' : '\u2228')),

        open && React.createElement('div', { className:'border-t border-slate-100' },
          React.createElement('p', { className:'px-4 py-2.5 text-xs text-slate-600 leading-relaxed bg-slate-50' }, a.summary),
          a.steps.map((st,i) => {
            const key = a.id + '_' + i;
            return React.createElement('div', { key:i, className:'px-4 py-2.5 border-b border-slate-50 last:border-0 flex items-start gap-3 hover:bg-slate-50' },
              React.createElement('button', { onClick:()=>toggle(key),
                className:`w-4 h-4 rounded border flex-shrink-0 mt-0.5 flex items-center justify-center text-[10px] ${done[key]?'bg-green-500 border-green-500 text-white':'border-slate-300 text-transparent hover:border-slate-400'}` }, '\u2713'),
              React.createElement('div', { className:'flex-1 min-w-0' },
                React.createElement('p', { className:`text-sm leading-snug ${done[key]?'text-slate-400 line-through':'text-slate-700'}` }, st.t),
                React.createElement('p', { className:'text-[10px] text-slate-400 mt-0.5' }, st.owner + ' \u00b7 ' + st.due)),
              React.createElement('button', {
                onClick:()=>dispatch({ type:'CREATE_TASK', taskId:'t_sop_'+key+'_'+Date.now().toString(36),
                  title:st.t, description:'From the \u201c' + a.name + '\u201d on ticket ' + ticket.id.toUpperCase() + '.',
                  customerId:ticket.customerId, ownerId:'maya', source:'action',
                  actionName:a.name, trigger:a.when, firedAt:'Applied to ' + ticket.id.toUpperCase() }),
                className:'text-[11px] text-indigo-600 hover:underline flex-shrink-0' }, '+ Task')
            );
          })
        )
      );
    })
  );
}

function TicketDetail({ ticket, customer, state, dispatch, navigate, onBack }){
  const [pane, setPane] = useState('conversation');
  const [sentEmails, setSentEmails] = useState([]);
  const [applied, setApplied] = useState({});
  // AI fills the ticket fields on open; the agent overrides what it got wrong.
  const [fields, setFields] = useState(()=>{
    const base = initialTicketFields(ticket);
    suggestTicketFields(ticket, customer).forEach(f => { if (!base[f.field]) base[f.field] = f.value; });
    return base;
  });
  const [overridden, setOverridden] = useState({});
  const [lens, setLens] = useState('all');
  const [replyOpen, setReplyOpen] = useState(false);
  // Composer mode: reply to the customer, add an internal note, or forward the
  // thread out to a third party. Reply is the default whenever it opens.
  const [mode, setMode] = useState('reply');
  const [fwdTo, setFwdTo] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [ccOpen, setCcOpen] = useState(false);
  const [bccOpen, setBccOpen] = useState(false);
  const [drafted, setDrafted] = useState(false);
  const openComposer = (m) => { setMode(m || 'reply'); setReplyOpen(true); };
  const [reply, setReply] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [tplOpen, setTplOpen] = useState(false);
  const following = (state.followedTickets || []).includes(ticket.id);

  // ── Gated field sets ──
  const gateCfg = state.gateConfig || TICKET_GATE_DEFAULTS;
  const captured = (state.ticketGates || {})[ticket.id] || {};
  // gate = null | { phase, pendingStatus }  — what the modal is standing in front of
  const [gate, setGate] = useState(null);
  const [statusOpen, setStatusOpen] = useState(false);
  const [allFields, setAllFields] = useState(false);   // ticket fields panel: primary five vs everything

  const activity = getTicketActivity(ticket, customer);
  const shownActivity = lens === 'all' ? activity : activity.filter(a=>a.kind===lens);
  const emails = getTicketEmails(ticket, customer).concat(sentEmails);
  const chats = getChatThreads(customer);

  // The composer is now rich text, so its value is HTML. htmlToText strips it
  // back for the disabled check and for anything that needs plain text.
  const htmlToText = (h) => String(h||'')
    .replace(/<br\s*\/?>/gi, '\n').replace(/<\/(p|div|li|h[1-6]|blockquote|pre)>/gi, '\n')
    .replace(/<[^>]+>/g, '').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').trim();
  const textToHtml = (t) => String(t||'').split(/\n{2,}/).map(p =>
    '<p>' + p.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br/>') + '</p>').join('');
  const replyText = htmlToText(reply);

  const applyTemplate = (t) => {
    setReply(textToHtml(String(t.body)
      .replace(/\{\{contact\.first_name\}\}/g, (customer ? customer.name.split(' ')[0] : 'there'))
      .replace(/\{\{my\.name\}\}/g, 'Maya Chen')
      .replace(/\{\{my\.calendar\}\}/g, 'cx42.io/maya')));
    setTplOpen(false); setDrafted(false);
    dispatch({ type:'ADD_TOAST', msg:'Template applied \u2014 \u201c' + t.name + '\u201d', toastType:'info' });
  };
  const contactAddress = () => (getTicketEmails(ticket, customer).find(e=>e.dir==='inbound') || {}).address
    || ('contact@' + (customer ? customer.domain : 'customer.com'));

  const autoDraft = () => {
    if (replyText && !window.confirm('Replace what you have written with a fresh draft?')) return;
    setReply(draftComposerHtml(mode, ticket, customer, ticketSla(ticket)));
    setDrafted(true);
    dispatch({ type:'ADD_TOAST', msg:'Draft generated from the ticket record \u2014 review before sending', toastType:'info' });
  };

  const submitComposer = () => {
    // Only a customer-facing reply is gated. Internal notes and forwards to a
    // third party are not the first response, so they go straight out.
    const conf = gateCfg.firstResponse || {};
    if (mode === 'reply' && conf.enabled && !captured.firstResponse) {
      setGate({ phase:'firstResponse' });
      return;
    }
    doSend();
  };

  const doSend = () => {
    const html = reply;
    const body = replyText;
    if (mode === 'note') {
      setSentEmails(list => list.concat({
        id: ticket.id + '_note' + list.length,
        when:'Just now', dir:'note', sender:'Maya Chen \u00b7 Internal note',
        address:'Internal \u2014 not sent to the customer', to:'Visible to the support team only',
        subject:'Note on ' + ticket.id.toUpperCase(), body, html, attachments: attachments.slice(),
      }));
      dispatch({ type:'ADD_TOAST', msg:'Internal note added to ' + ticket.id.toUpperCase(), toastType:'info' });
    } else if (mode === 'forward') {
      const seeded = getTicketEmails(ticket, customer);
      const threadText = seeded.map(e => e.when + ' \u2014 ' + e.sender + ': ' + e.body).join('\n');
      const threadHtml = '<hr/><p><b>\u2014\u2014\u2014 Forwarded thread \u2014\u2014\u2014</b></p>' +
        seeded.map(e => '<p><b>' + e.when + ' \u00b7 ' + e.sender + '</b><br/>' +
          String(e.body).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</p>').join('');
      setSentEmails(list => list.concat({
        id: ticket.id + '_fwd' + list.length,
        when:'Just now', dir:'forward', sender:'Maya Chen \u00b7 Forwarded', address:'support@cx42.io',
        to: fwdTo.trim(), cc: cc.trim(), bcc: bcc.trim(), subject:'Fwd: ' + ticket.subject,
        body: body + '\n\n\u2014\u2014\u2014 Forwarded thread \u2014\u2014\u2014\n' + threadText,
        html: html + threadHtml,
        attachments: attachments.slice(),
      }));
      dispatch({ type:'ADD_TOAST', msg:'Thread forwarded to ' + fwdTo.trim(), toastType:'success' });
      setFwdTo('');
    } else {
      setSentEmails(list => list.concat({
        id: ticket.id + '_sent' + list.length,
        when:'Just now', dir:'outbound', sender:'Maya Chen \u00b7 Support', address:'support@cx42.io',
        to: contactAddress(), cc: cc.trim(), bcc: bcc.trim(),
        subject:'Re: ' + ticket.subject, body, html,
        attachments: attachments.slice(),
      }));
      dispatch({ type:'ADD_TOAST', msg:'Reply sent on ' + ticket.id.toUpperCase(), toastType:'success' });
    }
    setReply(''); setAttachments([]); setReplyOpen(false); setMode('reply'); setDrafted(false);
    setCc(''); setBcc(''); setCcOpen(false); setBccOpen(false); setPane('conversation');
  };
  const sendReply = submitComposer;
  const sla = ticketSla(ticket);
  const suggestions = suggestTicketFields(ticket, customer);
  const actions = ticketNextActions(ticket, customer, sla);
  const health = customer ? HEALTH_SIGNALS[customer.healthId] : null;

  // Accepting a suggestion writes it straight onto the ticket field below
  const apply = (f) => {
    setApplied(a=>({...a,[f.field]:true}));
    setFields(v=>({...v,[f.field]:f.value}));
    dispatch({ type:'ADD_TOAST', msg:f.field + ' set to \u201c' + f.value + '\u201d', toastType:'success' }); };
  const applyAll = () => {
    const n={}, v={}; suggestions.forEach(f=>{ n[f.field]=true; v[f.field]=f.value; });
    setApplied(n); setFields(x=>({...x,...v}));
    dispatch({ type:'ADD_TOAST', msg:'All ' + suggestions.length + ' suggested fields applied', toastType:'success' }); };
  const setField = (k, val) => {
    setFields(v=>({...v,[k]:val}));
    const wasSuggested = suggestTicketFields(ticket, customer).some(f=>f.field===k && f.value !== val);
    if (wasSuggested) setOverridden(o=>({...o,[k]:true}));
    dispatch({ type:'ADD_TOAST', msg: k + ' updated to \u201c' + val + '\u201d', toastType:'success' }); };

  // Status changes to Resolved/Closed go through the resolution gate first.
  const requestStatus = (val) => {
    const conf = gateCfg.resolution || {};
    const triggers = conf.triggerStatuses || ['Resolved','Closed'];
    if (conf.enabled && triggers.includes(val) && !captured.resolution) {
      setGate({ phase:'resolution', pendingStatus: val });
      return;
    }
    setField('Status', val);
  };

  // The gate modal edits the same `fields` object the ticket already uses, so
  // whatever is captured here shows up in the ticket fields panel afterwards.
  const confirmGate = () => {
    if (!gate) return;
    const values = {};
    gateFields(gateCfg, gate.phase).forEach(f => { values[f.key] = fields[f.key] || ''; });
    dispatch({ type:'SAVE_TICKET_GATE', ticketId:ticket.id, phase:gate.phase, values });
    if (gate.phase === 'resolution') {
      setFields(v => ({ ...v, Status: gate.pendingStatus }));
      dispatch({ type:'ADD_TOAST', msg: ticket.id.toUpperCase() + ' marked ' + gate.pendingStatus, toastType:'success' });
      setGate(null);
    } else {
      setGate(null);
      doSend();                     // the reply the agent was trying to send
    }
  };

  return React.createElement('div', { className:'space-y-4' },

    React.createElement(TicketFieldGateModal, {
      open: !!gate, phase: gate && gate.phase, cfg: gateCfg, ticket, customer,
      values: fields, onChange: (k,v)=>setFields(x=>({...x,[k]:v})),
      onCancel: ()=>setGate(null), onConfirm: confirmGate }),
    React.createElement('div', { className:'flex items-center justify-between gap-3 flex-wrap' },
      React.createElement('button', { onClick:onBack, className:'text-sm text-indigo-600 hover:underline' }, '\u2190 Back to tickets'),
      React.createElement('div', { className:'flex gap-2 flex-wrap items-center' },

        // Status menu — change to any status, from anywhere on the page
        React.createElement('div', { className:'relative' },
          React.createElement('button', { onClick:()=>setStatusOpen(v=>!v),
            title:'Change the status of this ticket',
            className:`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
              statusToneOf(fields['Status'])==='green' ? 'bg-green-50 text-green-700 border-green-200 hover:border-green-400'
              : statusToneOf(fields['Status'])==='amber' ? 'bg-amber-50 text-amber-700 border-amber-200 hover:border-amber-400'
              : statusToneOf(fields['Status'])==='blue' ? 'bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-400'
              : 'bg-red-50 text-red-700 border-red-200 hover:border-red-400'}` },
            React.createElement('span', { className:'w-1.5 h-1.5 rounded-full bg-current opacity-70' }),
            fields['Status'] || 'Set status',
            React.createElement('span', { className:'opacity-50' }, '\u25BE')),
          statusOpen && React.createElement('div', { className:'absolute left-0 mt-1 w-60 bg-white border border-slate-200 rounded-xl shadow-lg z-40 p-1.5' },
            React.createElement('p', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1' }, 'Change status to'),
            TICKET_FIELD_DEFS[0].options.map(o => {
              const isCurrent = fields['Status'] === o;
              const gated = (gateCfg.resolution||{}).enabled
                && ((gateCfg.resolution||{}).triggerStatuses || ['Resolved','Closed']).includes(o)
                && !captured.resolution;
              return React.createElement('button', { key:o,
                onClick:()=>{ setStatusOpen(false); if (!isCurrent) requestStatus(o); },
                disabled: isCurrent,
                className:`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between gap-2 ${
                  isCurrent ? 'bg-slate-50 cursor-default' : 'hover:bg-slate-50'}` },
                React.createElement('span', { className:'flex items-center gap-2 min-w-0' },
                  React.createElement(CxPill, { tone:statusToneOf(o) }, o),
                  isCurrent && React.createElement('span', { className:'text-[10px] text-slate-400' }, 'current')),
                gated && React.createElement('span', { className:'text-[10px] text-amber-600 flex-shrink-0' }, 'needs fields'));
            }))),

        React.createElement(Btn, { variant: following ? 'primary' : 'secondary', size:'xs',
          onClick:()=>dispatch({ type:'TOGGLE_FOLLOW_TICKET', ticketId:ticket.id }),
          title: following ? 'You are notified of every update on this ticket' : 'Get notified when this ticket is updated' },
          following ? '\u{1F514} Following' : '\u{1F515} Follow'),
        React.createElement(Btn, { variant: (replyOpen && mode==='reply') ? 'primary' : 'primary', size:'xs',
          onClick:()=>{ if (replyOpen && mode==='reply') { setReplyOpen(false); } else openComposer('reply'); } },
          (replyOpen && mode==='reply') ? '\u2715 Close reply' : '\u21A9 Reply'),
        React.createElement(Btn, { variant:'secondary', size:'xs',
          onClick:()=>{ if (replyOpen && mode==='note') { setReplyOpen(false); setMode('reply'); } else openComposer('note'); },
          title:'Add an internal note \u2014 never sent to the customer' },
          (replyOpen && mode==='note') ? '\u2715 Close note' : '\u{1F4DD} Add note'),
        React.createElement(Btn, { variant:'secondary', size:'xs',
          onClick:()=>{ if (replyOpen && mode==='forward') { setReplyOpen(false); setMode('reply'); } else openComposer('forward'); },
          title:'Forward the whole thread to a third party' },
          (replyOpen && mode==='forward') ? '\u2715 Close forward' : '\u27A6 Forward'))
    ),

    // Header
    React.createElement(Card, { className:'p-5' },
      React.createElement('div', { className:'flex items-start gap-3 flex-wrap' },
        React.createElement('div', { className:'flex-1 min-w-0' },
          React.createElement('div', { className:'flex items-center gap-2 flex-wrap' },
            React.createElement('span', { className:'font-mono text-xs text-slate-400' }, ticket.id.toUpperCase()),
            React.createElement(SeverityBadge, { severity:ticket.severity }),
            // Status here is a read-out, not a third control. The button at the
            // top of the page is the one place status is changed, so this shows
            // state at a glance without competing with it.
            React.createElement('span', { title:'Change the status from the button at the top of the page',
              className:`inline-flex items-center gap-1.5 text-[11px] font-bold rounded-full pl-2 pr-2.5 py-1 border ${
                statusToneOf(fields['Status'])==='green' ? 'bg-green-100 text-green-700 border-green-200'
                : statusToneOf(fields['Status'])==='amber' ? 'bg-amber-100 text-amber-700 border-amber-200'
                : statusToneOf(fields['Status'])==='blue' ? 'bg-blue-100 text-blue-700 border-blue-200'
                : 'bg-red-100 text-red-700 border-red-200'}` },
              React.createElement('span', { className:'w-1.5 h-1.5 rounded-full bg-current' }),
              fields['Status'] || 'No status'),
            React.createElement(TicketSentiment, { sentiment:ticket.sentiment })),
          React.createElement('p', { className:'text-base font-bold text-slate-900 mt-1.5' }, ticket.subject),
          React.createElement('p', { className:'text-xs text-slate-500 mt-1' }, 'Open ' + ticket.age + ' days'),
          React.createElement('div', { className:'flex gap-1.5 flex-wrap mt-2' },
            [['firstResponse','First response fields'],['resolution','Resolution fields']].map(g => {
              const conf = gateCfg[g[0]] || {};
              if (!conf.enabled) return null;
              const cap = captured[g[0]];
              return React.createElement('button', { key:g[0],
                onClick:()=>setGate({ phase:g[0], pendingStatus: fields['Status'] }),
                title: cap ? 'Captured by ' + cap.by + ' \u00b7 ' + cap.at + ' \u2014 click to review'
                           : 'Not captured yet \u2014 click to fill them in now',
                className:`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-semibold border transition-colors ${
                  cap ? 'bg-green-50 text-green-700 border-green-200 hover:border-green-400'
                      : 'bg-amber-50 text-amber-700 border-amber-200 hover:border-amber-400'}` },
                (cap ? '\u2713 ' : '\u25CB ') + g[1],
                React.createElement('span', { className:'font-normal opacity-70' },
                  cap ? cap.at : missingGateFields(gateCfg, g[0], fields).length + ' outstanding'));
            }))
        )
      )
    ),

    React.createElement('div', { className:'grid grid-cols-3 gap-4 items-start' },

      // ── Left: interaction, summary, next best actions ──
      React.createElement('div', { className:'col-span-2 space-y-4' },

        // Composer — reply to the customer, add an internal note, or forward out
        replyOpen && React.createElement(Card, { className:`p-4 ${mode==='note'?'border-amber-200 bg-amber-50/40':mode==='forward'?'border-sky-200':'border-indigo-200'}` },
          React.createElement(CxLabel, { right: mode !== 'note' && React.createElement('div', { className:'relative' },
            React.createElement(Btn, { variant:'secondary', size:'xs', onClick:()=>setTplOpen(v=>!v) }, '\u{1F4C4} Template'),
            tplOpen && React.createElement('div', { className:'absolute right-0 mt-1 w-72 bg-white border border-slate-200 rounded-xl shadow-lg z-30 p-1.5' },
              EMAIL_TEMPLATES.map(t=>React.createElement('button', { key:t.id, onClick:()=>applyTemplate(t),
                className:'w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-50' },
                React.createElement('p', { className:'text-xs font-semibold text-slate-800' }, t.name))))
          ) },
            mode === 'note' ? 'Internal note on ' + ticket.id.toUpperCase()
              : mode === 'forward' ? 'Forward this thread'
              : 'Reply to ' + (customer ? customer.name : 'the customer')),

          React.createElement('div', { className:'flex gap-1 flex-wrap mb-3' },
            [['reply','\u21A9 Reply'],['note','\u{1F4DD} Add note'],['forward','\u27A6 Forward']].map(m =>
              React.createElement('button', { key:m[0], onClick:()=>{ setMode(m[0]); setDrafted(false); },
                className:`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-colors ${mode===m[0]?'bg-slate-900 text-white border-slate-900':'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}` }, m[1]))),

          // Recipients — who this is actually going to, before it goes
          mode !== 'note' && React.createElement('div', { className:'border border-slate-200 rounded-lg divide-y divide-slate-100 mb-3 bg-white' },

            React.createElement('div', { className:'flex items-center gap-2 px-2.5 py-1.5' },
              React.createElement('span', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider w-8 flex-shrink-0' }, 'To'),
              mode === 'forward'
                ? React.createElement('input', { type:'email', value:fwdTo, onChange:e=>setFwdTo(e.target.value), autoFocus:true,
                    placeholder:'name@partner.com \u2014 engineering, a vendor or a third party',
                    className:'flex-1 min-w-0 text-xs outline-none bg-transparent text-slate-800' })
                : React.createElement('span', { className:'flex-1 min-w-0 text-xs text-slate-800 truncate' },
                    React.createElement('span', { className:'font-medium' }, (getTicketEmails(ticket, customer).find(e=>e.dir==='inbound')||{}).sender || (customer ? customer.name : 'Customer')),
                    React.createElement('span', { className:'text-slate-400' }, ' \u00b7 ' + contactAddress())),
              React.createElement('div', { className:'flex gap-1 flex-shrink-0' },
                !ccOpen && React.createElement('button', { onClick:()=>setCcOpen(true),
                  className:'px-1.5 py-0.5 rounded text-[10px] font-bold text-indigo-600 hover:bg-indigo-50' }, 'CC'),
                !bccOpen && React.createElement('button', { onClick:()=>setBccOpen(true),
                  className:'px-1.5 py-0.5 rounded text-[10px] font-bold text-indigo-600 hover:bg-indigo-50' }, 'BCC'))),

            ccOpen && React.createElement('div', { className:'flex items-center gap-2 px-2.5 py-1.5' },
              React.createElement('span', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider w-8 flex-shrink-0' }, 'Cc'),
              React.createElement('input', { type:'text', value:cc, onChange:e=>setCc(e.target.value), autoFocus:true,
                placeholder:'Comma-separated \u2014 visible to everyone on the thread',
                className:'flex-1 min-w-0 text-xs outline-none bg-transparent text-slate-800' }),
              React.createElement('button', { onClick:()=>{ setCc(''); setCcOpen(false); },
                className:'text-slate-300 hover:text-red-500 text-xs flex-shrink-0' }, '\u2715')),

            bccOpen && React.createElement('div', { className:'flex items-center gap-2 px-2.5 py-1.5' },
              React.createElement('span', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider w-8 flex-shrink-0' }, 'Bcc'),
              React.createElement('input', { type:'text', value:bcc, onChange:e=>setBcc(e.target.value), autoFocus:true,
                placeholder:'Comma-separated \u2014 hidden from other recipients',
                className:'flex-1 min-w-0 text-xs outline-none bg-transparent text-slate-800' }),
              React.createElement('button', { onClick:()=>{ setBcc(''); setBccOpen(false); },
                className:'text-slate-300 hover:text-red-500 text-xs flex-shrink-0' }, '\u2715')),

            React.createElement('div', { className:'flex items-center gap-2 px-2.5 py-1.5 bg-slate-50/60' },
              React.createElement('span', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider w-8 flex-shrink-0' }, 'From'),
              React.createElement('span', { className:'text-xs text-slate-500' }, 'support@acme.com'),
              React.createElement('span', { className:'text-[10px] text-slate-400 ml-auto truncate' },
                mode === 'forward' ? 'Fwd: ' + ticket.subject : 'Re: ' + ticket.subject))
          ),

          mode === 'note' && React.createElement('p', { className:'text-[11px] text-amber-700 mb-2' },
            'Notes stay inside CX42. Nothing here is sent to ' + (customer ? customer.name : 'the customer') + '.'),

          React.createElement('div', { className:'flex items-center gap-2 flex-wrap mb-2' },
            React.createElement(Btn, { variant:'teal', size:'sm', onClick:autoDraft },
              '\u2728 ' + (mode==='note' ? 'Draft note automatically' : mode==='forward' ? 'Draft forward automatically' : 'Draft reply automatically')),
            React.createElement('span', { className:'text-[11px] text-slate-400' },
              drafted ? 'Draft generated \u2014 edit before sending' : 'Builds a draft from the ticket record')),

          React.createElement(RichTextEditor, {
            html: reply, onChange: setReply,
            accent: mode==='note' ? 'amber' : mode==='forward' ? 'sky' : 'indigo',
            placeholder: mode==='note' ? 'Record context for whoever picks this up next\u2026'
              : mode==='forward' ? 'Add a line of context above the forwarded thread\u2026'
              : 'Write your reply\u2026 draft it automatically, or start from a template' }),

          attachments.length > 0 && React.createElement('div', { className:'flex gap-2 flex-wrap mt-2' },
            attachments.map((a,i)=>React.createElement('span', { key:i, className:'inline-flex items-center gap-1.5 bg-slate-100 rounded-lg px-2 py-1' },
              React.createElement('span', { className:'text-xs text-slate-600' }, '\u{1F4CE} ' + a),
              React.createElement('button', { onClick:()=>setAttachments(l=>l.filter((_,j)=>j!==i)), className:'text-slate-400 hover:text-red-500 text-xs' }, '\u2715')))),

          React.createElement('div', { className:'flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 flex-wrap' },
            React.createElement(Btn, { variant:'primary', size:'sm', onClick:submitComposer,
              disabled: !replyText || (mode==='forward' && !fwdTo.trim()) },
              mode==='note' ? 'Save note' : mode==='forward' ? 'Forward thread' : 'Send reply'),
            React.createElement(Btn, { variant:'secondary', size:'sm',
              onClick:()=>setAttachments(a=>a.concat('attachment-' + (a.length+1) + '.pdf')) }, '\u{1F4CE} Attach'),
            React.createElement(Btn, { variant:'ghost', size:'sm', onClick:()=>{ setReply(''); setFwdTo(''); setCc(''); setBcc(''); setCcOpen(false); setBccOpen(false); setReplyOpen(false); setMode('reply'); setDrafted(false); } }, 'Discard'),
            mode === 'forward' && React.createElement('span', { className:'text-[11px] text-slate-400' },
              'The full thread is attached below your note'),
            !following && React.createElement('button', { onClick:()=>dispatch({type:'TOGGLE_FOLLOW_TICKET', ticketId:ticket.id}),
              className:'text-[11px] text-indigo-600 hover:underline ml-auto' }, 'Follow this ticket'))
        ),

        // Summary of the issue — always visible, sits above the pane tabs
        React.createElement(Card, { className:'p-4' },
          React.createElement(CxLabel, { right:React.createElement(CxPill,{tone:'blue'},'AI') }, 'Summary of the issue'),
          React.createElement('p', { className:'text-sm text-slate-700 leading-relaxed' }, ticket.summary || 'No summary available for this ticket.'),
          React.createElement('div', { className:'grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-100' },
            [['Revenue impact', ticket.revenueImpact ? formatARR(ticket.revenueImpact) : '\u2014'],
             ['Age', ticket.age + ' days'],
             ['Sentiment', String(ticket.sentiment||'unknown')]].map(r =>
              React.createElement('div', { key:r[0] },
                React.createElement('p', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider' }, r[0]),
                React.createElement('p', { className:'text-sm font-semibold text-slate-800 mt-0.5 capitalize' }, r[1])))
          )
        ),

        React.createElement('div', { className:'flex gap-1 flex-wrap' },
          [['conversation','Email conversation'],['actions','Actions'],['activity','Activities']].map(p =>
            React.createElement('button', { key:p[0], onClick:()=>setPane(p[0]),
              className:`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${pane===p[0]?'bg-slate-900 text-white border-slate-900':'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}` }, p[1]))),

        // Email conversation — the real thread between the customer and support
        pane === 'conversation' && React.createElement(Card, { className:'p-4' },
          React.createElement(CxLabel, { right:React.createElement('span',{className:'text-[11px] text-slate-400'},
            emails.length + ' message' + (emails.length===1?'':'s')) }, 'Email conversation'),
          emails.length === 0
            ? React.createElement('p', { className:'text-sm text-slate-400 italic py-6 text-center' }, 'No email correspondence on this ticket yet')
            : React.createElement('div', { className:'space-y-3' },
                emails.map(e => React.createElement('div', { key:e.id,
                  className:`border rounded-xl overflow-hidden ${
                    e.dir==='note' ? 'border-amber-200 bg-amber-50/50'
                    : e.dir==='forward' ? 'border-sky-200 bg-sky-50/40'
                    : e.dir==='outbound' ? 'border-indigo-100 bg-indigo-50/40'
                    : 'border-slate-200 bg-white'}` },
                  React.createElement('div', { className:'px-3.5 py-2.5 flex items-start gap-3 border-b border-slate-100' },
                    React.createElement('span', { className:`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      e.dir==='note' ? 'bg-amber-500 text-white'
                      : e.dir==='forward' ? 'bg-sky-600 text-white'
                      : e.dir==='outbound' ? 'bg-indigo-600 text-white'
                      : 'bg-slate-200 text-slate-600'}` },
                      e.dir==='note' ? '\u{1F4DD}' : e.dir==='forward' ? '\u27A6'
                        : (String(e.sender).replace(/[^A-Za-z ]/g,'').trim().split(/\s+/).slice(0,2).map(w=>w[0]||'').join('').toUpperCase() || '?')),
                    React.createElement('div', { className:'flex-1 min-w-0' },
                      React.createElement('div', { className:'flex items-center gap-2 flex-wrap' },
                        React.createElement('p', { className:'text-sm font-semibold text-slate-800' }, e.sender),
                        React.createElement(CxPill, { tone: e.dir==='note'?'amber' : e.dir==='forward'?'blue' : e.dir==='outbound'?'blue':'purple' },
                          e.dir==='note' ? 'Internal only' : e.dir==='forward' ? 'Forwarded' : e.dir==='outbound' ? 'Sent' : 'Received')),
                      React.createElement('p', { className:'text-[11px] text-slate-400 mt-0.5 truncate' },
                        e.dir==='note' ? e.address : e.address + ' \u2192 ' + e.to),
                      e.cc && React.createElement('p', { className:'text-[11px] text-slate-400 truncate' }, 'Cc: ' + e.cc),
                      e.bcc && React.createElement('p', { className:'text-[11px] text-slate-400 truncate' },
                        'Bcc: ' + e.bcc + ' (hidden from other recipients)'),
                      React.createElement('p', { className:'text-[11px] text-slate-500 mt-0.5 truncate' }, e.subject)),
                    React.createElement('span', { className:'text-[11px] text-slate-400 flex-shrink-0' }, e.when)),
                  e.html
                    ? React.createElement('div', { className:'cx-msg px-3.5 py-3 text-sm text-slate-700 leading-relaxed',
                        dangerouslySetInnerHTML:{ __html: e.html } })
                    : React.createElement('p', { className:'px-3.5 py-3 text-sm text-slate-700 leading-relaxed whitespace-pre-line' }, e.body),
                  (e.attachments && e.attachments.length > 0) && React.createElement('div', { className:'px-3.5 pb-3 flex gap-2 flex-wrap' },
                    e.attachments.map((a,i)=>React.createElement('span', { key:i,
                      className:'inline-flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-600' }, '\u{1F4CE} ' + a)))
                ))
              ),
          React.createElement('div', { className:'mt-3 pt-3 border-t border-slate-100 flex gap-2 flex-wrap' },
            React.createElement(Btn, { variant:'primary', size:'sm', onClick:()=>openComposer('reply') }, '\u21A9 Reply'),
            React.createElement(Btn, { variant:'secondary', size:'sm', onClick:()=>openComposer('note') }, '\u{1F4DD} Add note'),
            React.createElement(Btn, { variant:'secondary', size:'sm', onClick:()=>openComposer('forward') }, '\u27A6 Forward'))
        ),

        // Actions — next best actions first, then the automation runbooks
        pane === 'actions' && React.createElement('div', { className:'space-y-4' },
          React.createElement(Card, { className:'p-4' },
            React.createElement(CxLabel, { right:React.createElement(CxPill,{tone:'blue'},'AI') }, 'Next best actions'),
            React.createElement('div', { className:'space-y-2.5' },
              actions.map((a,i)=>React.createElement('div', { key:i, className:'flex items-start gap-3 border border-slate-200 rounded-lg p-2.5' },
                React.createElement('span', { className:'w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5' }, i+1),
                React.createElement('div', { className:'flex-1 min-w-0' },
                  React.createElement('p', { className:'text-sm font-semibold text-slate-800' }, a.t),
                  React.createElement('p', { className:'text-xs text-slate-500 mt-0.5 leading-relaxed' }, a.why),
                  React.createElement('p', { className:'text-[10px] text-slate-400 mt-1' }, a.owner + ' \u00b7 ' + a.due)),
                React.createElement(Btn, { variant:'secondary', size:'xs',
                  onClick:()=>dispatch({type:'CREATE_TASK', taskId:'t_tk_'+ticket.id+'_'+i+'_'+Date.now().toString(36),
                    title:a.t, description:a.why, customerId:ticket.customerId, ownerId:'maya', source:'manual'}) }, 'Create task')
              ))
            )
          ),
          React.createElement(TicketActionsPane, { ticket, customer, dispatch })
        ),

        // Activities — one stream, three lenses
        pane === 'activity' && React.createElement(Card, { className:'p-4' },
          React.createElement(CxLabel, { right:React.createElement('span',{className:'text-[11px] text-slate-400'}, shownActivity.length + ' of ' + activity.length) }, 'Activities'),
          React.createElement('div', { className:'flex gap-1 mb-3 flex-wrap' },
            ACTIVITY_LENSES.map(l => {
              const n = l.id==='all' ? activity.length : activity.filter(a=>a.kind===l.id).length;
              return React.createElement('button', { key:l.id, onClick:()=>setLens(l.id),
                className:`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-colors ${lens===l.id?'bg-slate-900 text-white border-slate-900':'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}` },
                l.label + ' · ' + n);
            })),
          shownActivity.length === 0
            ? React.createElement('p', { className:'text-sm text-slate-400 italic py-6 text-center' }, 'Nothing recorded under this lens')
            : React.createElement('div', null,
                shownActivity.map((a,i) => React.createElement('div', { key:i, className:'flex gap-3' },
                  React.createElement('div', { className:'flex flex-col items-center flex-shrink-0' },
                    React.createElement('span', { className:`w-7 h-7 rounded-full flex items-center justify-center text-xs ${ADMIN_TONES[a.tone]||ADMIN_TONES.slate}` }, a.icon),
                    i < shownActivity.length-1 && React.createElement('span', { className:'w-px flex-1 bg-slate-200 my-1' })),
                  React.createElement('div', { className:'flex-1 min-w-0 pb-4' },
                    React.createElement('div', { className:'flex items-center gap-2 flex-wrap' },
                      React.createElement('p', { className:'text-sm font-semibold text-slate-800' }, a.title),
                      React.createElement(CxPill, { tone: a.kind==='interaction'?'purple':a.kind==='system'?'slate':'amber' },
                        a.kind==='interaction' ? (a.dir==='inbound'?'Customer':'Agent reply') : a.kind==='system' ? 'System' : 'Agent update')),
                    React.createElement('p', { className:'text-[11px] text-slate-400 mt-0.5' }, a.at + ' · ' + a.who),
                    a.body && React.createElement('p', { className:`text-xs mt-1 leading-relaxed ${a.kind==='interaction'?'text-slate-700 bg-slate-50 rounded-lg px-2.5 py-1.5':'text-slate-500'}` }, a.body))
                ))
              )
        ),
      ),

      // ── Right: SLA, account, field suggester ──
      React.createElement('div', { className:'space-y-4' },
        React.createElement(Card, { className:'p-4' },
          React.createElement(CxLabel, { right:React.createElement(CxPill,{tone: sla.breached?'red':sla.atRisk?'amber':'green'},
            sla.breached?'Breached':sla.atRisk?'At risk':'On track') }, 'SLA'),
          React.createElement('p', { className:`text-xl font-bold ${sla.breached?'text-red-600':sla.atRisk?'text-amber-600':'text-green-600'}` }, sla.label),
          React.createElement('div', { className:'h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden' },
            React.createElement('div', { className:`h-full rounded-full ${sla.breached?'bg-red-500':sla.atRisk?'bg-amber-500':'bg-green-500'}`, style:{ width:sla.pct+'%' } })),
          React.createElement('div', { className:'flex justify-between mt-1.5 text-[11px] text-slate-400' },
            React.createElement('span', null, sla.elapsed + 'h elapsed'),
            React.createElement('span', null, 'Target ' + sla.target + 'h'))
        ),

        customer && React.createElement(Card, { className:'p-4' },
          React.createElement(CxLabel, null, 'Company'),
          React.createElement('p', { className:'text-sm font-bold text-slate-900' }, customer.name),
          React.createElement('p', { className:'text-[11px] text-slate-500 capitalize' }, customer.segment.replace('_',' ') + ' \u00b7 ' + formatARR(customer.arr) + ' ARR'),
          React.createElement('div', { className:'flex gap-1.5 flex-wrap mt-2' },
            health && React.createElement(HealthBadge, { band:health.band, score:health.compositeScore }),
            React.createElement(TicketSentiment, { sentiment:ticket.sentiment })),
          React.createElement('div', { className:'mt-3 pt-3 border-t border-slate-100 space-y-1.5' },
            [['Owner', (USERS[customer.ownerId]||{}).name || '\u2014'],
             ['Open tickets', String(TICKETS.filter(x=>x.customerId===customer.id && x.status!=='resolved').length)],
             ['Renewal', customer.renewalDate ? new Date(customer.renewalDate).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '\u2014']].map(r =>
              React.createElement('div', { key:r[0], className:'flex justify-between gap-2' },
                React.createElement('span', { className:'text-xs text-slate-500' }, r[0]),
                React.createElement('span', { className:'text-xs font-semibold text-slate-800' }, r[1])))),
          React.createElement(Btn, { variant:'primary', size:'xs', className:'mt-3 w-full justify-center',
            onClick:()=>navigate('/customers/' + customer.id + '?tab=support') }, 'Open Support tab \u2192')
        ),

        React.createElement(Card, { className:'p-4 bg-indigo-50/40 border-indigo-100' },
          React.createElement(CxLabel, { right:React.createElement(CxPill,{tone:'blue'},'AI') }, 'Field suggester'),
          React.createElement('p', { className:'text-xs text-slate-600 leading-relaxed' },
            'These fields were filled automatically from the subject, summary and account context when the ticket opened. Anything wrong can be overridden below.'),
          React.createElement('div', { className:'mt-3 space-y-1.5' },
            suggestions.map(f => {
              const current = fields[f.field];
              const kept = current === f.value;
              return React.createElement('div', { key:f.field, className:'flex items-center gap-2' },
                React.createElement('span', { className:`text-xs flex-shrink-0 ${kept?'text-green-500':'text-amber-500'}` }, kept ? '\u2713' : '\u270E'),
                React.createElement('span', { className:'text-[11px] text-slate-500 flex-1 min-w-0 truncate' },
                  f.field + ': ' + (current || '\u2014')),
                React.createElement('span', { className:'text-[10px] font-semibold text-slate-400 flex-shrink-0' }, Math.round(f.confidence*100) + '%'),
                !kept && React.createElement('button', {
                  onClick:()=>{ setFields(v=>({...v,[f.field]:f.value})); setOverridden(o=>{ const n={...o}; delete n[f.field]; return n; });
                    dispatch({ type:'ADD_TOAST', msg:f.field + ' restored to the suggested value', toastType:'info' }); },
                  className:'text-[10px] text-indigo-600 hover:underline flex-shrink-0' }, 'Revert'));
            })),
          React.createElement('div', { className:'flex items-center justify-between mt-3 pt-2.5 border-t border-indigo-100' },
            React.createElement('span', { className:'text-[11px] text-slate-500' },
              Object.keys(overridden).length
                ? Object.keys(overridden).length + ' field(s) overridden by you'
                : 'All suggestions accepted'),
            React.createElement('button', { onClick:applyAll, className:'text-[11px] font-semibold text-indigo-600 hover:underline' }, 'Re-run suggester'))
        ),

        // Ticket fields — the suggester above writes into these
        React.createElement(Card, { className:'p-4' },
          React.createElement(CxLabel, { right:React.createElement('span',{className:'text-[11px] text-slate-400'},
            Object.values(fields).filter(Boolean).length + '/' + TICKET_FIELD_DEFS.length + ' set') }, 'Ticket fields'),
          React.createElement('div', { className:'space-y-2.5' },
            TICKET_FIELD_DEFS
              .filter(fd => allFields || TICKET_PRIMARY_FIELDS.includes(fd.key))
              .sort((a,b) => allFields ? 0 : TICKET_PRIMARY_FIELDS.indexOf(a.key) - TICKET_PRIMARY_FIELDS.indexOf(b.key))
              .map(fd => {
              const val = fields[fd.key] || '';
              const isStatus = fd.key === 'Status';
              return React.createElement('div', { key:fd.key },
                React.createElement('div', { className:'flex items-center gap-2 mb-1' },
                  React.createElement('label', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider' }, fd.key),
                  overridden[fd.key]
                    ? React.createElement('span', { className:'text-[10px] font-semibold text-amber-600 ml-auto' }, '✎ overridden')
                    : suggestions.some(f=>f.field===fd.key && f.value===val) && React.createElement('span', { className:'text-[10px] font-semibold text-indigo-600 ml-auto' }, '✦ AI')),
                // The control is wrapped so we can draw our own affordance on top:
                // a chevron on dropdowns, a pencil on free-text. Native select
                // arrows are inconsistent across browsers and easy to miss.
                React.createElement('div', { className:'relative' },
                  fd.type === 'select'
                    ? React.createElement('select', { value:val, onChange:e=> isStatus ? requestStatus(e.target.value) : setField(fd.key, e.target.value),
                        title:'Click to change ' + fd.key,
                        className:`w-full text-xs border rounded-lg pl-2 pr-7 py-1.5 outline-none appearance-none cursor-pointer transition-colors ${
                          isStatus
                            ? 'font-bold border-2 ' + (
                                statusToneOf(val)==='green' ? 'bg-green-50 text-green-700 border-green-300 hover:border-green-500'
                              : statusToneOf(val)==='amber' ? 'bg-amber-50 text-amber-700 border-amber-300 hover:border-amber-500'
                              : statusToneOf(val)==='blue'  ? 'bg-blue-50 text-blue-700 border-blue-300 hover:border-blue-500'
                              : 'bg-red-50 text-red-700 border-red-300 hover:border-red-500')
                            : 'bg-white border-slate-200 hover:border-indigo-300 focus:border-indigo-400 ' + (!val?'text-slate-400':'text-slate-700')}` },
                        React.createElement('option', { value:'' }, 'Not set'),
                        fd.options.map(o=>React.createElement('option',{key:o,value:o},o)))
                    : fd.type === 'textarea'
                      ? React.createElement('textarea', { value:val, rows:3, onChange:e=>setFields(v=>({...v,[fd.key]:e.target.value})),
                          placeholder:'Not set', title:'Click to edit ' + fd.key,
                          className:'w-full text-xs border border-slate-200 rounded-lg pl-2 pr-7 py-1.5 outline-none resize-y hover:border-indigo-300 focus:border-indigo-400 transition-colors' })
                      : React.createElement('input', { value:val, onChange:e=>setFields(v=>({...v,[fd.key]:e.target.value})),
                          placeholder:'Not set', title:'Click to edit ' + fd.key,
                          className:'w-full text-xs border border-slate-200 rounded-lg pl-2 pr-7 py-1.5 outline-none hover:border-indigo-300 focus:border-indigo-400 transition-colors' }),
                  React.createElement('span', { 'aria-hidden':true,
                    className:`absolute right-2 ${fd.type==='textarea'?'top-2':'top-1/2 -translate-y-1/2'} text-[10px] text-slate-400 pointer-events-none` },
                    fd.type === 'select' ? '\u25BE' : '\u270E'))
              );
            })
          ),

          React.createElement('button', { onClick:()=>setAllFields(v=>!v),
            className:'w-full mt-3 pt-3 border-t border-slate-100 text-[11px] font-semibold text-indigo-600 hover:underline flex items-center justify-center gap-1.5' },
            allFields
              ? '\u25B4 Show fewer fields'
              : '\u25BE Show all ticket fields',
            React.createElement('span', { className:'font-normal text-slate-400' },
              allFields ? '' : '+' + (TICKET_FIELD_DEFS.length - TICKET_PRIMARY_FIELDS.length) + ' more')),

          React.createElement('div', { className:'flex justify-end mt-3 pt-3 border-t border-slate-100' },
            React.createElement(Btn, { variant:'primary', size:'xs',
              onClick:()=>dispatch({ type:'ADD_TOAST', msg:'Ticket fields saved on ' + ticket.id.toUpperCase(), toastType:'success' }) }, 'Save fields'))
        )
      )
    )
  );
}

function TicketsPage() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const { query } = useLocation();
  const [selectedTicket, setSelectedTicket] = useState(query.ticket || null);
  const [savedFilter, setSavedFilter] = useState('unresolved');
  const [convo, setConvo] = useState('');
  const [convoChips, setConvoChips] = useState([]);
  const [pf, setPf] = useState({ severity:null, status:null, sla:null, sentiment:null, ageMin:null, revMin:null });

  const ticket = TICKETS.find(t=>t.id===selectedTicket);
  const ticketCustomer = ticket ? state.customers.find(c=>c.id===ticket.customerId) : null;
  if (ticket) return React.createElement(TicketDetail, { ticket, customer:ticketCustomer, state, dispatch, navigate,
    onBack:()=>setSelectedTicket(null) });

  const applyPrompt = () => {
    const r = parseTicketPrompt(convo);
    setPf({ severity:r.severity, status:r.status, sla:r.sla, sentiment:r.sentiment, ageMin:r.ageMin, revMin:r.revMin });
    setConvoChips(r.matched);
    if (r.matched.length) setSavedFilter('all');
  };
  const clearAll = () => { setPf({ severity:null,status:null,sla:null,sentiment:null,ageMin:null,revMin:null });
    setConvoChips([]); setConvo(''); setSavedFilter('all'); };

  const sf = TICKET_SAVED_FILTERS.find(f=>f.id===savedFilter) || TICKET_SAVED_FILTERS[0];
  let tickets = TICKETS.filter(sf.fn);
  if (pf.severity)  tickets = tickets.filter(t=>t.severity===pf.severity);
  if (pf.status)    tickets = tickets.filter(t=> pf.status==='resolved' ? t.status==='resolved' : t.status!=='resolved');
  if (pf.sla)       tickets = tickets.filter(t=>t.sla===pf.sla);
  if (pf.sentiment) tickets = tickets.filter(t=>t.sentiment===pf.sentiment);
  if (pf.ageMin!=null) tickets = tickets.filter(t=>(t.age||0)>pf.ageMin);
  if (pf.revMin!=null) tickets = tickets.filter(t=>(t.revenueImpact||0)>=pf.revMin);

  const cust = (id) => state.customers.find(c=>c.id===id);
  const open = (id) => setSelectedTicket(id);

  // ── List: dense table ──
  const listView = React.createElement(Card, { className:'overflow-hidden' },
    React.createElement('div', { className:'overflow-x-auto' },
      React.createElement('table', { className:'w-full text-sm min-w-[980px]' },
        React.createElement('thead', null, React.createElement('tr', { className:'bg-slate-50 border-b' },
          ['ID','Customer','Subject','Severity','Sentiment','Status','Age','SLA','Revenue impact'].map(h=>
            React.createElement('th',{key:h,className:'px-4 py-3 text-left text-xs font-medium text-slate-500 whitespace-nowrap'},h)))),
        React.createElement('tbody', null,
          tickets.length === 0
            ? React.createElement('tr', null, React.createElement('td',{colSpan:9,className:'px-4 py-12 text-center text-slate-400 text-sm'},'No tickets match these filters'))
            : tickets.map(t => { const c = cust(t.customerId); const sla = ticketSla(t);
                return React.createElement('tr', { key:t.id, onClick:()=>open(t.id), className:'border-b last:border-0 hover:bg-indigo-50 cursor-pointer transition-colors' },
                  React.createElement('td', { className:'px-4 py-3 font-mono text-xs text-slate-500' }, t.id.toUpperCase()),
                  React.createElement('td', { className:'px-4 py-3 font-medium text-slate-800 whitespace-nowrap' }, c ? c.name : '\u2014'),
                  React.createElement('td', { className:'px-4 py-3 text-slate-700 max-w-xs' }, React.createElement('p',{className:'truncate'},t.subject)),
                  React.createElement('td', { className:'px-4 py-3' }, React.createElement(SeverityBadge, { severity:t.severity })),
                  React.createElement('td', { className:'px-4 py-3' }, React.createElement(TicketSentiment, { sentiment:t.sentiment })),
                  React.createElement('td', { className:'px-4 py-3 capitalize text-slate-600 whitespace-nowrap' }, String(t.status).replace('_',' ')),
                  React.createElement('td', { className:'px-4 py-3 text-slate-500' }, t.age + 'd'),
                  React.createElement('td', { className:'px-4 py-3' },
                    React.createElement('span', { className:`text-xs font-semibold ${sla.breached?'text-red-600':sla.atRisk?'text-amber-600':'text-green-600'}` }, sla.label)),
                  React.createElement('td', { className:'px-4 py-3 text-slate-600' }, t.revenueImpact ? formatARR(t.revenueImpact) : '\u2014')
                );
              })
        )
      )
    )
  );

  return React.createElement('div', { className:'space-y-4' },
    React.createElement('div', { className:'grid grid-cols-4 gap-4' },
      React.createElement(MetricCard, { label:'Open tickets', value:TICKETS.filter(t=>t.status!=='resolved').length }),
      React.createElement(MetricCard, { label:'Critical', value:TICKETS.filter(t=>t.severity==='critical').length, subColor:'text-red-600' }),
      React.createElement(MetricCard, { label:'SLA breached', value:TICKETS.filter(t=>t.sla==='breached').length, subColor:'text-red-600' }),
      React.createElement(MetricCard, { label:'Negative sentiment', value:TICKETS.filter(t=>t.sentiment==='negative').length, subColor:'text-amber-600' })
    ),

    // View switcher + saved filters
    React.createElement('div', { className:'flex items-center gap-3 flex-wrap' },
      React.createElement('select', { value:savedFilter, onChange:e=>setSavedFilter(e.target.value),
        className:'text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white outline-none focus:border-indigo-400' },
        TICKET_SAVED_FILTERS.map(f=>React.createElement('option',{key:f.id,value:f.id},f.label))),
      React.createElement('span', { className:'text-sm text-slate-500 ml-auto' }, tickets.length + ' tickets')
    ),

    // Conversational filter
    React.createElement(Card, { className:'p-3' },
      React.createElement('div', { className:'flex items-center gap-2 flex-wrap' },
        React.createElement('span', { className:'w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs flex-shrink-0' }, '\u2726'),
        React.createElement('input', { value:convo, onChange:e=>setConvo(e.target.value),
          onKeyDown:e=>{ if(e.key==='Enter') applyPrompt(); },
          placeholder:'Describe what you want \u2014 e.g. "critical tickets breaching SLA from angry customers over $150k"',
          className:'flex-1 min-w-[240px] text-sm px-2 py-1 outline-none placeholder:text-slate-400' }),
        React.createElement(Btn, { variant:'primary', size:'xs', onClick:applyPrompt, disabled:!convo.trim() }, 'Apply'),
        convoChips.length > 0 && React.createElement(Btn, { variant:'ghost', size:'xs', onClick:clearAll }, 'Clear')),
      convoChips.length > 0 && React.createElement('div', { className:'flex gap-1.5 flex-wrap mt-2 pl-8' },
        convoChips.map(c=>React.createElement(CxPill,{key:c,tone:'blue'},c)))
    ),

    listView
  );
}
function EmailSequence() {
  const [openEmail, setOpenEmail] = useState(null);
  const [emails, setEmails] = useState(EBR_EMAILS_SEQ.map(e=>({...e})));
  const statusClasses = { green:'bg-green-100 text-green-700', amber:'bg-amber-100 text-amber-700', gray:'bg-slate-100 text-slate-500' };

  const markSent = (n) => {
    setEmails(prev => prev.map(e => {
      if(e.n === n) return { ...e, status:'Sent · Jun 27', statusColor:'green' };
      if(e.n === 6) return { ...e, status:'Scheduled · Jun 29', statusColor:'amber' };
      return e;
    }));
  };

  return React.createElement('div', { className:'space-y-2' },
    emails.map(e => {
      const isOpen = openEmail === e.n;
      return React.createElement('div', { key:e.n, className:'border border-slate-200 rounded-lg overflow-hidden' },
        React.createElement('div', { className:'flex items-center gap-3 px-3 py-2.5 bg-slate-50 cursor-pointer hover:bg-slate-100', onClick:()=>setOpenEmail(isOpen?null:e.n) },
          React.createElement('div', { className:'w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold flex-shrink-0' }, e.n),
          React.createElement('div', { className:'flex-1 min-w-0' },
            React.createElement('p', { className:'text-sm font-medium text-slate-900' }, e.title),
            React.createElement('p', { className:'text-xs text-slate-400 truncate' }, e.desc)
          ),
          React.createElement('span', { className:'text-xs text-slate-400 flex-shrink-0 hidden sm:inline' }, e.timing),
          React.createElement('span', { className:`px-2 py-0.5 text-xs rounded-full font-medium flex-shrink-0 ${e.type==='auto'?'bg-indigo-100 text-indigo-700':'bg-slate-200 text-slate-600'}` }, e.type==='auto'?'✦ Auto':'👆 CSM'),
          React.createElement('span', { className:`px-2 py-0.5 text-xs rounded-full font-medium flex-shrink-0 ${statusClasses[e.statusColor]}` }, e.status),
          React.createElement('span', { className:'text-slate-400 flex-shrink-0' }, isOpen ? '▾' : '▸')
        ),
        isOpen && React.createElement('div', { className:'p-3 border-t border-slate-200 bg-white space-y-2' },
          React.createElement('p', { className:'text-xs font-medium text-slate-400 uppercase tracking-wide' }, 'Recipients'),
          React.createElement('div', { className:'flex flex-wrap gap-1.5' }, EBR_CONTACTS.map(c => React.createElement('span', { key:c.name, className:`px-2 py-0.5 text-xs rounded-full ${c.badgeClass}` }, c.name))),
          React.createElement('div', { className:'bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600 leading-relaxed' },
            React.createElement('p', { className:'font-medium text-slate-900 mb-1' }, '✉ Subject: ' + e.subject),
            e.body
          ),
          React.createElement('div', { className:'flex items-center gap-2 pt-1' },
            React.createElement(Btn, { variant:'secondary', size:'xs' }, '✎ Edit email'),
            e.n === 5 && e.status === 'Pending' && React.createElement(Btn, { variant:'success', size:'xs', onClick:()=>markSent(5) }, '➤ Send to all')
          )
        )
      );
    })
  );
}

function EBRStep1({ onNext }) {
  return React.createElement('div', { className:'space-y-4' },
    React.createElement('div', { className:'flex items-center gap-1.5 text-xs text-indigo-600 font-medium' }, '✦ Auto-generated by AI — pulled from account data'),
    React.createElement(Card, { className:'p-4' },
      React.createElement('div', { className:'flex items-center justify-between mb-2 flex-wrap gap-1' },
        React.createElement('h4', { className:'font-semibold text-slate-900' }, '🤖 Pre-EBR brief'),
        React.createElement('span', { className:'text-xs text-slate-400' }, 'Pulled from health score, emails, calls and NPS · Updated now')
      ),
      React.createElement('div', { className:'bg-indigo-50 border border-indigo-100 rounded-lg p-4' },
        React.createElement('p', { className:'text-xs font-medium text-indigo-700 mb-2' }, '🤖 What to know before the call'),
        React.createElement('p', { className:'text-sm text-slate-700 leading-relaxed' }, "Lead with adoption — feature usage is up 12% to 71% and 3 new users were onboarded this quarter. Address the API issue after the good news, not before. Tony Stark hasn't replied to emails in 12 days — open with the relationship. James Rhodes (CFO) is joining for the first time — be ready for a pricing conversation. Renewal is in 18 days — this EBR needs a commitment before it ends."),
        React.createElement('div', { className:'flex flex-wrap gap-2 mt-3' },
          React.createElement(Btn, { variant:'secondary', size:'xs' }, '💬 Suggest talk tracks'),
          React.createElement(Btn, { variant:'secondary', size:'xs' }, '🛡 Draft objection responses'),
          React.createElement(Btn, { variant:'secondary', size:'xs' }, '📊 Summarise value delivered')
        )
      )
    ),
    React.createElement('div', { className:'grid grid-cols-3 gap-3' },
      EBR_METRICS.map(m => React.createElement(Card, { key:m.label, className:'p-3' },
        React.createElement('p', { className:'text-xs text-slate-500' }, m.label),
        React.createElement('p', { className:`text-2xl font-bold mt-1 ${m.color||'text-slate-900'}` }, m.value),
        React.createElement('p', { className:'text-xs text-slate-400 mt-0.5' }, m.sub)
      ))
    ),
    React.createElement(Card, { className:'p-4' },
      React.createElement('div', { className:'flex items-center justify-between mb-3 flex-wrap gap-1' },
        React.createElement('h4', { className:'font-semibold text-slate-900' }, '✉ EBR email sequence'),
        React.createElement('span', { className:'text-xs text-slate-400' }, 'Stark Industries · Q2 2026 · Jun 27')
      ),
      React.createElement('div', { className:'bg-slate-50 rounded-lg p-3 mb-3' },
        React.createElement('p', { className:'text-xs font-medium text-slate-400 uppercase tracking-wide mb-2' }, 'Contacts on this account'),
        EBR_CONTACTS.map(c => React.createElement('div', { key:c.name, className:'flex items-center gap-2 py-1.5 border-b last:border-0 border-slate-200 text-sm' },
          React.createElement('div', { className:`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${c.badgeClass}` }, c.initials),
          React.createElement('span', { className:'flex-1 font-medium' }, c.name),
          React.createElement('span', { className:'text-xs text-slate-400' }, c.role)
        ))
      ),
      React.createElement(EmailSequence, null)
    ),
    React.createElement('div', { className:'bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-center justify-between flex-wrap gap-3' },
      React.createElement('div', { className:'flex items-center gap-3' },
        React.createElement('span', { className:'text-indigo-600 text-lg' }, '→'),
        React.createElement('div', null,
          React.createElement('p', { className:'text-sm font-medium text-indigo-700' }, 'AI has auto-generated your slide deck'),
          React.createElement('p', { className:'text-xs text-slate-500 mt-0.5' }, '6 slides built from live account data — review, customise, and add your own topics in the next step')
        )
      ),
      React.createElement(Btn, { variant:'primary', onClick:onNext }, '🗂 Build deck')
    )
  );
}

function EBRStep2({ slides, setSlides, activeSlide, setActiveSlide, onBack, onNext }) {
  const [addedIds, setAddedIds] = useState([]);
  const [customInput, setCustomInput] = useState('');
  const [exported, setExported] = useState(false);

  const addSuggestion = (s) => {
    if(addedIds.includes(s.id)) return;
    setAddedIds(prev => [...prev, s.id]);
    setSlides(prev => [...prev, { title:s.title, ai:false, body:'Click to add content — or use AI write to generate from account context.' }]);
  };
  const addCustomTopic = () => {
    const val = customInput.trim();
    if(!val) return;
    setSlides(prev => [...prev, { title:val, ai:false, body:'Click to add content — or use AI write to generate from account context.' }]);
    setCustomInput('');
  };
  const handleExport = () => { setExported(true); setTimeout(()=>setExported(false), 4000); };

  const slide = slides[activeSlide] || slides[0];

  return React.createElement('div', { className:'space-y-4' },
    React.createElement(Card, { className:'p-4' },
      React.createElement('h4', { className:'font-semibold text-slate-900' }, '💡 AI-suggested topics from account timeline'),
      React.createElement('p', { className:'text-xs text-slate-400 mb-3' }, 'Detected in past calls, emails and notes'),
      React.createElement('div', { className:'space-y-2 mb-3' },
        EBR_SUGGESTIONS.map(s => {
          const added = addedIds.includes(s.id);
          return React.createElement('div', { key:s.id, onClick:()=>addSuggestion(s), className:`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${added?'bg-green-50 border-green-200':'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'}` },
            React.createElement('span', { className:'text-sm flex-shrink-0' }, added ? '✓' : '+'),
            React.createElement('div', { className:'flex-1' },
              React.createElement('p', { className:'text-sm font-medium text-slate-900' }, s.reason),
              React.createElement('p', { className:'text-xs text-slate-400 mt-0.5' }, s.detail)
            ),
            React.createElement('span', { className:`text-xs flex-shrink-0 ${added?'text-green-600':'text-indigo-600'}` }, added ? 'Added' : 'Add to deck')
          );
        })
      ),
      React.createElement('div', { className:'border-t border-slate-200 pt-3' },
        React.createElement('p', { className:'text-xs font-medium text-slate-400 uppercase tracking-wide mb-2' }, 'Add your own topic'),
        React.createElement('div', { className:'flex gap-2' },
          React.createElement('input', { value:customInput, onChange:e=>setCustomInput(e.target.value), onKeyDown:e=>e.key==='Enter'&&addCustomTopic(), placeholder:'e.g. Discuss onboarding plan for 5 new hires in August...', className:'flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500' }),
          React.createElement(Btn, { variant:'primary', onClick:addCustomTopic }, '+ Add')
        )
      )
    ),
    React.createElement(Card, { className:'overflow-hidden' },
      React.createElement('div', { className:'flex flex-col sm:flex-row' },
        React.createElement('div', { className:'sm:w-48 border-b sm:border-b-0 sm:border-r border-slate-200 max-h-[420px] overflow-y-auto flex-shrink-0' },
          slides.map((s,i) => React.createElement('div', { key:i, onClick:()=>setActiveSlide(i), className:`p-3 border-b border-slate-100 cursor-pointer text-xs ${i===activeSlide?'bg-indigo-50 border-l-4 border-l-indigo-500':'hover:bg-slate-50'}` },
            React.createElement('p', { className:'text-slate-400 mb-1' }, (i+1) + (s.ai ? ' · AI' : ' · Custom')),
            React.createElement('p', { className:'font-medium text-slate-800 truncate' }, s.title)
          ))
        ),
        React.createElement('div', { className:'flex-1 p-6 min-h-[380px]' },
          slide.ai && React.createElement('span', { className:'text-xs text-indigo-600 font-medium' }, '✦ AI generated'),
          React.createElement('h3', { className:'text-lg font-semibold text-slate-900 mt-1 mb-4' }, slide.title),
          slide.metrics && React.createElement('div', { className:'grid grid-cols-3 gap-3 mb-4' },
            slide.metrics.map(m => React.createElement('div', { key:m.label, className:'bg-slate-50 rounded-lg p-3 text-center' },
              React.createElement('p', { className:`text-xl font-bold ${m.color||'text-slate-900'}` }, m.val),
              React.createElement('p', { className:'text-xs text-slate-400 mt-1' }, m.label)
            ))
          ),
          slide.chart && React.createElement('div', { className:'flex items-end gap-2 h-32 mb-4' },
            slide.chart.map((v,i) => React.createElement('div', { key:i, className:'flex-1 flex flex-col items-center gap-1 h-full justify-end' },
              React.createElement('div', { className:`w-full rounded-t ${v<60?'bg-red-200':v<70?'bg-amber-200':'bg-green-200'}`, style:{height:`${v}%`} }),
              React.createElement('span', { className:'text-xs text-slate-400' }, slide.chartLabels[i])
            ))
          ),
          slide.expansion && React.createElement('div', { className:'grid grid-cols-2 gap-3 mb-4' },
            slide.expansion.map(x => React.createElement('div', { key:x.name, className:'bg-teal-50 border border-teal-100 rounded-lg p-3' },
              React.createElement('p', { className:'text-sm font-medium text-teal-800' }, x.name),
              React.createElement('p', { className:'text-xs text-slate-500 mt-1' }, x.detail),
              React.createElement('p', { className:'text-sm font-semibold text-teal-700 mt-2' }, x.arr)
            ))
          ),
          slide.body && React.createElement('p', { className:'text-sm text-slate-600 leading-relaxed' }, slide.body)
        )
      ),
      React.createElement('div', { className:'flex items-center justify-between px-4 py-2.5 border-t border-slate-200 bg-slate-50 flex-wrap gap-2' },
        React.createElement('span', { className:'text-xs text-slate-400' }, 'Click any text to edit · AI slides auto-populated from account data'),
        React.createElement('div', { className:'flex items-center gap-2' },
          React.createElement(Btn, { variant:'secondary', size:'xs', onClick:()=>setActiveSlide(i=>Math.max(0,i-1)) }, '←'),
          React.createElement('span', { className:'text-xs text-slate-500' }, `Slide ${activeSlide+1} of ${slides.length}`),
          React.createElement(Btn, { variant:'secondary', size:'xs', onClick:()=>setActiveSlide(i=>Math.min(slides.length-1,i+1)) }, '→')
        )
      )
    ),
    exported && React.createElement('div', { className:'bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 text-sm text-green-700' }, '✓ Deck exported to Google Slides successfully'),
    React.createElement('div', { className:'flex justify-between flex-wrap gap-2' },
      React.createElement(Btn, { variant:'secondary', onClick:onBack }, '← Back'),
      React.createElement('div', { className:'flex gap-2' },
        React.createElement(Btn, { variant:'success', onClick:handleExport }, '📤 Export to Google Slides'),
        React.createElement(Btn, { variant:'primary', onClick:onNext }, '🖥 Start EBR')
      )
    )
  );
}

function EBRStep3({ onBack, onEnd, slides, activeSlide, setActiveSlide }) {
  const [seconds, setSeconds] = useState(0);
  const [notes, setNotes] = useState('');
  const [actionItems, setActionItems] = useState(EBR_ACTION_ITEMS_SEED.map(a=>({...a, done:false})));
  const [newItem, setNewItem] = useState('');
  const [showPresent, setShowPresent] = useState(false);
  const [presentLaunched, setPresentLaunched] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [importDone, setImportDone] = useState(false);
  const [showExportConfirm, setShowExportConfirm] = useState(false);

  useEffect(() => {
    const t = setInterval(()=>setSeconds(s=>s+1), 1000);
    return ()=>clearInterval(t);
  }, []);

  const mm = String(Math.floor(seconds/60)).padStart(2,'0');
  const ss = String(seconds%60).padStart(2,'0');

  const toggleItem = (idx) => setActionItems(prev => prev.map((it,i)=>i===idx?{...it,done:!it.done}:it));
  const addItem = () => {
    const v = newItem.trim();
    if(!v) return;
    setActionItems(prev => [...prev, { text:v, meta:'Owner: Maya Chen · Due: TBD', done:false }]);
    setNewItem('');
  };

  const slide = slides[activeSlide] || slides[0];

  return React.createElement('div', { className:'space-y-4' },
    React.createElement('div', { className:'bg-slate-800 rounded-xl px-5 py-3.5 flex items-center justify-between flex-wrap gap-3' },
      React.createElement('div', null,
        React.createElement('p', { className:'text-white text-sm font-medium' }, 'Stark Industries — Q2 2026 EBR'),
        React.createElement('p', { className:'text-slate-300 text-xs mt-0.5' }, 'Jun 27, 2026 · 2:00 PM · Tony Stark, Pepper Potts, James Rhodes')
      ),
      React.createElement('div', { className:'flex items-center gap-2' },
        React.createElement('span', { className:'px-3 py-1.5 bg-slate-700 text-white text-xs rounded-lg' }, '⏱ ' + mm + ':' + ss),
        React.createElement(Btn, { variant:'secondary', size:'sm', onClick:()=>setShowPresent(true) }, '🖥 Present to customer'),
        React.createElement(Btn, { variant:'danger', size:'sm', onClick:onEnd }, '✓ End EBR')
      )
    ),
    React.createElement(Card, { className:'p-4' },
      React.createElement('div', { className:'flex items-center justify-between flex-wrap gap-2' },
        React.createElement('p', { className:'text-sm font-medium text-slate-900' }, '🔵 Use your own Google Slides deck instead'),
        React.createElement('div', { className:'flex gap-2' },
          React.createElement(Btn, { variant:'secondary', size:'xs', onClick:()=>setShowImport(true) }, '⬇ Import from Google Slides'),
          React.createElement(Btn, { variant:'success', size:'xs', onClick:()=>setShowExportConfirm(true) }, '⬆ Export to Google Slides')
        )
      )
    ),
    showImport && React.createElement(Card, { className:'p-4 border-indigo-200' },
      React.createElement('div', { className:'flex items-center justify-between mb-3' },
        React.createElement('p', { className:'text-sm font-medium text-slate-900' }, '⬇ Import from Google Slides'),
        React.createElement('button', { onClick:()=>{ setShowImport(false); setImportDone(false); }, className:'text-slate-400' }, '✕')
      ),
      React.createElement('div', { className:'flex gap-2 mb-2' },
        React.createElement('input', { value:importUrl, onChange:e=>setImportUrl(e.target.value), placeholder:'Paste Google Slides URL...', className:'flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500' }),
        React.createElement(Btn, { variant:'primary', size:'sm', onClick:()=>setImportDone(true) }, 'Import')
      ),
      React.createElement('p', { className:'text-xs text-slate-400' }, 'ℹ The imported deck replaces the AI-generated slides. Your notes and action items are unaffected.'),
      importDone && React.createElement('p', { className:'text-xs text-green-600 mt-2' }, '✓ 8 slides imported from Google Slides — deck updated')
    ),
    showExportConfirm && React.createElement('div', { className:'bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 text-sm text-green-700 flex items-center justify-between' },
      React.createElement('span', null, '✓ Deck exported to Google Slides'),
      React.createElement('button', { onClick:()=>setShowExportConfirm(false), className:'text-green-600' }, '✕')
    ),
    showPresent && React.createElement(Modal, { open:true, onClose:()=>setShowPresent(false), title:'🖥 Present to customer', size:'lg' },
      React.createElement('div', { className:'space-y-3' },
        React.createElement('p', { className:'text-sm text-slate-600 bg-indigo-50 border border-indigo-100 rounded-lg p-3' }, 'CX42 opens a clean slide-only window in a new tab. Share that tab with your customer via Zoom or any screen sharing tool. Your notes and action items stay private.'),
        React.createElement(Btn, { variant:'primary', className:'w-full justify-center', onClick:()=>{ setPresentLaunched(true); setShowPresent(false); } }, '↗ Open presentation in new tab')
      )
    ),
    presentLaunched && React.createElement('div', { className:'bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-3' },
      React.createElement('span', null, '🖥'),
      React.createElement('div', { className:'flex-1' },
        React.createElement('p', { className:'text-sm font-medium text-green-700' }, 'Presentation is live in a separate tab'),
        React.createElement('p', { className:'text-xs text-green-600 mt-0.5' }, 'Share that tab with your customer — your notes below are private')
      ),
      React.createElement('span', { className:'w-2 h-2 rounded-full bg-green-500 animate-pulse' })
    ),
    React.createElement('div', { className:'grid grid-cols-1 lg:grid-cols-2 gap-4' },
      React.createElement('div', { className:'space-y-4' },
        React.createElement(Card, { className:'p-4' },
          React.createElement('h4', { className:'font-semibold text-slate-900 mb-3' }, '☑ Agenda'),
          EBR_AGENDA.map((a,i) => React.createElement('div', { key:i, className:`flex items-center gap-2.5 py-2 ${i<EBR_AGENDA.length-1?'border-b border-slate-100':''} text-sm` },
            React.createElement('span', { className:`w-6 h-6 rounded-full border flex items-center justify-center text-xs flex-shrink-0 ${a.active?'bg-indigo-600 border-indigo-600 text-white':'border-slate-300 text-slate-500'}` }, i+1),
            React.createElement('span', { className:`flex-1 ${a.active?'font-medium text-indigo-600':'text-slate-700'}` }, a.title),
            React.createElement('span', { className:`text-xs ${a.active?'text-indigo-600':'text-slate-400'}` }, a.time)
          ))
        ),
        React.createElement(Card, { className:'p-4' },
          React.createElement('div', { className:'flex items-center justify-between mb-3' },
            React.createElement('h4', { className:'font-semibold text-slate-900' }, '🖥 Current slide'),
            React.createElement('div', { className:'flex gap-1' },
              React.createElement(Btn, { variant:'secondary', size:'xs', onClick:()=>setActiveSlide(i=>Math.max(0,i-1)) }, '←'),
              React.createElement('span', { className:'text-xs text-slate-500 self-center px-1' }, `${activeSlide+1} / ${slides.length}`),
              React.createElement(Btn, { variant:'secondary', size:'xs', onClick:()=>setActiveSlide(i=>Math.min(slides.length-1,i+1)) }, '→')
            )
          ),
          React.createElement('div', { className:'bg-slate-50 border border-slate-200 rounded-lg aspect-video flex flex-col items-center justify-center gap-2 p-4' },
            React.createElement('span', { className:'text-2xl' }, '📊'),
            React.createElement('p', { className:'text-sm font-medium text-slate-700' }, slide.title)
          )
        )
      ),
      React.createElement('div', { className:'space-y-4' },
        React.createElement(Card, { className:'p-4' },
          React.createElement('div', { className:'flex items-center justify-between mb-2' },
            React.createElement('h4', { className:'font-semibold text-slate-900' }, '🔒 Private — notes'),
            React.createElement('span', { className:'text-xs text-slate-400' }, 'Not visible to customer')
          ),
          React.createElement('textarea', { value:notes, onChange:e=>setNotes(e.target.value), rows:6, placeholder:'Type quick bullet points as the call happens...', className:'w-full text-sm border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500' })
        ),
        React.createElement(Card, { className:'p-4' },
          React.createElement('h4', { className:'font-semibold text-slate-900 mb-3' }, '🔒 Private — action items'),
          React.createElement('div', { className:'bg-slate-50 rounded-lg p-2.5 text-xs text-slate-500 mb-3' }, 'ℹ Log action items as they come up. AI will merge these with items found in the transcript after upload.'),
          actionItems.map((it,i) => React.createElement('div', { key:i, className:'flex items-start gap-2.5 py-2 border-b last:border-0 border-slate-100' },
            React.createElement('button', { onClick:()=>toggleItem(i), className:`w-4 h-4 rounded border mt-0.5 flex-shrink-0 flex items-center justify-center text-xs ${it.done?'bg-green-500 border-green-500 text-white':'border-slate-300'}` }, it.done?'✓':''),
            React.createElement('div', { className:'flex-1' },
              React.createElement('p', { className:`text-sm ${it.done?'line-through text-slate-400':'text-slate-800'}` }, it.text),
              React.createElement('p', { className:'text-xs text-slate-400 mt-0.5' }, it.meta)
            )
          )),
          React.createElement('div', { className:'flex gap-2 mt-2' },
            React.createElement('input', { value:newItem, onChange:e=>setNewItem(e.target.value), onKeyDown:e=>e.key==='Enter'&&addItem(), placeholder:'Add action item...', className:'flex-1 text-xs border border-slate-200 rounded-lg px-2 py-1.5' }),
            React.createElement(Btn, { variant:'secondary', size:'xs', onClick:addItem }, '+')
          ),
          React.createElement(Btn, { variant:'primary', className:'w-full justify-center mt-3', onClick:onEnd }, '⬆ End EBR — upload transcript')
        )
      )
    )
  );
}

function EBRStep4({ onBack, onClose }) {
  const [uploaded, setUploaded] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleProcess = () => {
    setProcessing(true);
    setTimeout(() => { setDone(true); }, 1500);
  };

  const processSteps = [
    { title:'Transcript read and parsed', detail:'1,842 words · 47 minutes' },
    { title:'Action items extracted and merged with items logged during call', detail:'5 items identified · 4 matched, 1 new found in transcript' },
    { title:'Sentiment signals detected', detail:'API frustration mentioned 3× · Expansion interest flagged · Soft renewal commitment detected' },
    { title:'Follow-up email drafted', detail:'Ready to review and send' },
    { title:'Actions auto-triggered', detail:'3 actions ran based on signals detected' },
  ];
  const actionsTriggered = [
    { color:'bg-red-500', title:'API fix follow-up', detail:'Confirm ETA with engineering · Due Jun 30' },
    { color:'bg-amber-500', title:'Renewal SOP — next step', detail:'Send contract to James Rhodes · Due Jul 1' },
    { color:'bg-green-500', title:'Expansion motion started', detail:'AE notified · Analytics proposal queued' },
    { color:'bg-indigo-500', title:'ERP integration review scheduled', detail:'Solutions engineer looped in · Call by Jul 3' },
    { color:'bg-indigo-500', title:'Next EBR scheduled — Sep 26', detail:'Calendar invite sent to all attendees' },
  ];
  const portalPush = [
    { icon:'📄', title:'EBR summary + transcript', detail:'Visible to all attendees' },
    { icon:'☑', title:'Action items with owners + due dates', detail:'Customer can tick off their own tasks' },
    { icon:'📅', title:'Next EBR — Sep 26, 2026', detail:'Calendar invite sent' },
  ];

  if(!done) {
    return React.createElement('div', { className:'space-y-4' },
      !processing && React.createElement(Card, { className:'p-4' },
        React.createElement('h4', { className:'font-semibold text-slate-900 mb-3' }, '⬆ Step 1 — upload or paste transcript'),
        React.createElement('div', { onClick:()=>setUploaded(true), className:`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${uploaded?'border-green-300 bg-green-50':'border-slate-300 hover:border-indigo-300 hover:bg-indigo-50'}` },
          uploaded
            ? React.createElement(React.Fragment, null,
                React.createElement('p', { className:'text-2xl mb-2' }, '✅'),
                React.createElement('p', { className:'text-sm font-medium text-green-700' }, 'stark_industries_ebr_jun27.txt uploaded'),
                React.createElement('p', { className:'text-xs text-green-600 mt-1' }, '1,842 words · Ready to process')
              )
            : React.createElement(React.Fragment, null,
                React.createElement('p', { className:'text-2xl mb-2' }, '📄'),
                React.createElement('p', { className:'text-sm font-medium text-slate-700' }, 'Drop transcript file here or click to upload'),
                React.createElement('p', { className:'text-xs text-slate-400 mt-1' }, 'Supports .txt, .docx, .pdf · Or paste text below')
              )
        ),
        React.createElement('div', { className:'flex flex-wrap gap-1.5 mt-3' },
          React.createElement('span', { className:'text-xs text-slate-400 self-center' }, 'Common sources:'),
          ['🎙 Granola','🎙 Otter.ai','🎙 Fireflies','📹 Zoom AI','📅 Google Meet'].map(s => React.createElement('span', { key:s, className:'text-xs px-2.5 py-1 rounded-full border border-slate-200 bg-slate-50 text-slate-500' }, s))
        ),
        React.createElement(Btn, { variant:'primary', className:'w-full justify-center mt-4', disabled:!uploaded, onClick:handleProcess }, '✦ Process transcript — generate EBR summary')
      ),
      processing && React.createElement(Card, { className:'p-4' },
        React.createElement('div', { className:'flex items-center justify-between mb-3' },
          React.createElement('h4', { className:'font-semibold text-slate-900' }, '✦ AI processing transcript'),
          React.createElement('span', { className:'text-xs text-slate-400' }, '~15 seconds')
        ),
        processSteps.map((s,i) => React.createElement('div', { key:i, className:'flex items-center gap-3 py-2 border-b last:border-0 border-slate-100' },
          React.createElement('span', { className:'w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0' }, '✓'),
          React.createElement('div', { className:'flex-1' },
            React.createElement('p', { className:'text-sm font-medium text-slate-800' }, s.title),
            React.createElement('p', { className:'text-xs text-slate-400 mt-0.5' }, s.detail)
          ),
          React.createElement('span', { className:'text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full flex-shrink-0' }, 'Done')
        ))
      ),
      React.createElement(Btn, { variant:'secondary', onClick:onBack }, '← Back')
    );
  }

  return React.createElement('div', { className:'space-y-4' },
    React.createElement(Card, { className:'p-4' },
      React.createElement('h4', { className:'font-semibold text-slate-900 mb-3' }, '✉ Follow-up email — AI drafted'),
      React.createElement('div', { className:'bg-indigo-50 border border-indigo-100 rounded-lg p-4' },
        React.createElement('p', { className:'text-xs font-medium text-indigo-700 mb-2' }, '🤖 Draft — ready to edit and send'),
        React.createElement('p', { className:'text-sm text-slate-700 leading-relaxed' },
          "Hi Tony — thank you for the time today. Here's a summary of what we covered. Value this quarter: feature adoption up 12% to 71%, 3 new users onboarded, NPS steady at +38. On the API issue — engineering has committed to a fix by June 30. James, I'm preparing the analytics tier pricing and will send across by July 1. Action for Stark Industries: Pepper to onboard 3 remaining users by July 15. Next EBR: September 26, 2026."
        ),
        React.createElement('div', { className:'flex gap-2 mt-3' },
          React.createElement(Btn, { variant:'secondary', size:'xs' }, '✎ Edit draft'),
          !emailSent && React.createElement(Btn, { variant:'success', size:'xs', onClick:()=>setEmailSent(true) }, '➤ Send to all attendees')
        )
      ),
      emailSent && React.createElement('p', { className:'text-sm text-green-600 mt-2' }, '✓ Email sent to Tony Stark, Pepper Potts, James Rhodes')
    ),
    React.createElement('div', { className:'grid grid-cols-1 sm:grid-cols-2 gap-4' },
      React.createElement(Card, { className:'p-4' },
        React.createElement('h4', { className:'font-semibold text-slate-900 mb-3' }, '▶ Actions auto-triggered'),
        actionsTriggered.map((p,i) => React.createElement('div', { key:i, className:'flex items-start gap-2.5 py-2 border-b last:border-0 border-slate-100' },
          React.createElement('span', { className:`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${p.color}` }),
          React.createElement('div', null,
            React.createElement('p', { className:'text-sm font-medium text-slate-800' }, p.title),
            React.createElement('p', { className:'text-xs text-slate-400 mt-0.5' }, p.detail)
          )
        ))
      ),
      React.createElement(Card, { className:'p-4' },
        React.createElement('h4', { className:'font-semibold text-slate-900 mb-3' }, '📋 Pushed to customer portal'),
        portalPush.map((p,i) => React.createElement('div', { key:i, className:'flex items-center gap-2.5 py-2 border-b last:border-0 border-slate-100' },
          React.createElement('span', { className:'text-base flex-shrink-0' }, p.icon),
          React.createElement('div', { className:'flex-1' },
            React.createElement('p', { className:'text-sm font-medium text-slate-800' }, p.title),
            React.createElement('p', { className:'text-xs text-slate-400 mt-0.5' }, p.detail)
          )
        ))
      )
    ),
    React.createElement(Card, { className:'p-4' },
      React.createElement('h4', { className:'font-semibold text-slate-900 mb-3' }, '⏱ Time saved this EBR'),
      React.createElement('div', { className:'grid grid-cols-3 gap-3' },
        React.createElement('div', { className:'bg-slate-50 rounded-lg p-3 text-center' }, React.createElement('p',{className:'text-xl font-bold text-green-600'},'12 min'), React.createElement('p',{className:'text-xs text-slate-400 mt-1'},'Prep time'), React.createElement('p',{className:'text-xs text-slate-400'},'vs 3–4 hrs before')),
        React.createElement('div', { className:'bg-slate-50 rounded-lg p-3 text-center' }, React.createElement('p',{className:'text-xl font-bold text-green-600'},'15 min'), React.createElement('p',{className:'text-xs text-slate-400 mt-1'},'Post-call work'), React.createElement('p',{className:'text-xs text-slate-400'},'Upload + review draft')),
        React.createElement('div', { className:'bg-slate-50 rounded-lg p-3 text-center' }, React.createElement('p',{className:'text-xl font-bold text-green-600'},'~4 hrs'), React.createElement('p',{className:'text-xs text-slate-400 mt-1'},'Time saved total'), React.createElement('p',{className:'text-xs text-slate-400'},'Per EBR, per account'))
      )
    ),
    React.createElement('div', { className:'flex justify-end' },
      React.createElement(Btn, { variant:'primary', onClick:onClose }, '✓ Finish')
    )
  );
}

function EBRWizard({ onClose }) {
  const [step, setStep] = useState(1);
  const [slides, setSlides] = useState(EBR_SLIDES.map(s=>({...s})));
  const [activeSlide, setActiveSlide] = useState(0);

  const steps = [
    { n:1, label:'AI prep' },
    { n:2, label:'Build deck' },
    { n:3, label:'Live EBR' },
    { n:4, label:'After' },
  ];

  return React.createElement(Card, { className:'overflow-hidden' },
    React.createElement('div', { className:'flex items-center gap-1 px-6 py-3 border-b border-slate-200 bg-white overflow-x-auto' },
      React.createElement('button', { onClick:onClose, className:'text-slate-400 hover:text-slate-600 mr-3 flex-shrink-0 flex items-center gap-1 text-xs font-medium' }, '← Exit to QBRs'),
      React.createElement('span', { className:'text-xs text-slate-300 mr-3 flex-shrink-0' }, '|'),
      React.createElement('span', { className:'text-xs text-slate-400 font-medium mr-4 whitespace-nowrap' }, 'Stark Industries — Q2 EBR (demo)'),
      steps.map((s,i) => React.createElement(React.Fragment, { key:s.n },
        React.createElement('div', { className:'flex items-center gap-2 flex-shrink-0' },
          React.createElement('span', { className:`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${step===s.n?'bg-indigo-600 text-white':step>s.n?'bg-green-500 text-white':'bg-slate-200 text-slate-500'}` }, step>s.n?'✓':s.n),
          React.createElement('span', { className:`text-xs font-medium whitespace-nowrap ${step===s.n?'text-slate-900':'text-slate-400'}` }, s.label)
        ),
        i < steps.length-1 && React.createElement('span', { className:'text-slate-300 mx-2' }, '›')
      )),
      React.createElement('div', { className:'ml-auto flex items-center gap-2 flex-shrink-0' },
        React.createElement('span', { className:'text-xs text-slate-400' }, `Step ${step} of 4`),
        step > 1 && step < 4 && React.createElement(Btn, { variant:'secondary', size:'sm', onClick:()=>setStep(s=>s-1) }, '← Back'),
        step < 4 && React.createElement(Btn, { variant:'primary', size:'sm', onClick:()=>setStep(s=>s+1) }, 'Next →')
      )
    ),
    React.createElement('div', { className:'p-6 bg-slate-50' },
      React.createElement('div', { className:'max-w-4xl mx-auto' },
        step === 1 && React.createElement(EBRStep1, { onNext:()=>setStep(2) }),
        step === 2 && React.createElement(EBRStep2, { slides, setSlides, activeSlide, setActiveSlide, onBack:()=>setStep(1), onNext:()=>setStep(3) }),
        step === 3 && React.createElement(EBRStep3, { onBack:()=>setStep(2), onEnd:()=>setStep(4), slides, activeSlide, setActiveSlide }),
        step === 4 && React.createElement(EBRStep4, { onBack:()=>setStep(3), onClose })
      )
    )
  );
}


// ============================================================
// CX42 DRIVE — SOP / knowledge repository
// An SOP is a written standard operating procedure: when it applies,
// which phases it runs through, and the exact tasks under each phase.
// ============================================================


// Ticket SOPs presented as Drive documents. Derived from TICKET_ACTIONS so the
// Drive library and the ticket Actions tab always describe the same procedure.
const DRIVE_TICKET_SOPS = TICKET_ACTIONS.map((a, i) => ({
  id: 'drv_' + a.id,
  title: a.name,
  category: a.category,
  owner: ['Amara Osei','Maya Chen','Sam Rivera'][i % 3],
  updated: ['Aug 12, 2025','Jul 30, 2025','Jul 18, 2025','Jul 04, 2025','Jun 22, 2025','Jun 09, 2025'][i % 6],
  version: 'v' + (1 + (i % 3)) + '.' + (i % 5),
  reads: 120 + i * 47,
  fmt: 'SOP',
  status: i === 5 ? 'draft' : 'published',
  tone: a.tone,
  icon: a.icon,
  when: a.when,
  summary: a.summary,
  phases: [{ name: 'Tasks to perform', tasks: a.steps.map(st => ({ t: st.t, owner: st.owner, due: st.due })) }],
  links: [{ label: 'Ticket action: ' + a.name, kind: 'Action' }],
}));


// Uploadable template files (QBR + Goal). SOPs live in DRIVE_SOPS above.
const driveSopTasks = (pb) => pb.phases.reduce((n,p)=>n+p.tasks.length, 0);

// ============================================================
// CX42 DRIVE — page (SOPs / QBR / Goals + upload)
// ============================================================
function DriveSopDetail({ pb, onBack, dispatch }){
  const total = driveSopTasks(pb);
  return React.createElement('div', { className:'space-y-4' },
    React.createElement('div', { className:'flex items-center justify-between gap-3 flex-wrap' },
      React.createElement('button', { onClick:onBack, className:'text-sm text-indigo-600 hover:underline' }, '\u2190 Back to SOPs'),
      React.createElement('div', { className:'flex gap-2' },
        React.createElement(Btn, { variant:'secondary', size:'xs', onClick:()=>dispatch({type:'ADD_TOAST',msg:'Downloading '+pb.title,toastType:'info'}) }, '\u2b07 Download'),
        React.createElement(Btn, { variant:'primary', size:'xs', onClick:()=>dispatch({type:'ADD_TOAST',msg:total+' tasks created from this SOP',toastType:'success'}) }, '+ Create ' + total + ' tasks from SOP')
      )
    ),

    React.createElement(Card, { className:'p-5' },
      React.createElement('div', { className:'flex items-start gap-4' },
        React.createElement('div', { className:`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${ADMIN_TONES[pb.tone]}` }, pb.icon),
        React.createElement('div', { className:'flex-1 min-w-0' },
          React.createElement('div', { className:'flex items-center gap-2 flex-wrap' },
            React.createElement('h3', { className:'text-base font-bold text-slate-900' }, pb.title),
            React.createElement(CxPill, { tone: pb.status==='published'?'green':'amber' }, pb.status),
            React.createElement(CxPill, { tone:'slate' }, pb.version)
          ),
          React.createElement('p', { className:'text-sm text-slate-600 leading-relaxed mt-2' }, pb.summary),
          React.createElement('div', { className:'mt-3 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2' },
            React.createElement('p', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5' }, 'When to use this'),
            React.createElement('p', { className:'text-xs text-slate-700' }, pb.when)
          ),
          React.createElement('div', { className:'flex gap-4 mt-3 text-[11px] text-slate-400 flex-wrap' },
            React.createElement('span', null, 'Owner: ', React.createElement('span',{className:'font-semibold text-slate-600'}, pb.owner)),
            React.createElement('span', null, 'Updated ', React.createElement('span',{className:'font-semibold text-slate-600'}, pb.updated)),
            React.createElement('span', null, pb.reads + ' reads'),
            React.createElement('span', null, pb.phases.length + ' phases \u00b7 ' + total + ' tasks')
          )
        )
      )
    ),

    // Phases with their tasks
    React.createElement('div', { className:'space-y-3' },
      pb.phases.map((ph, pi) => React.createElement(Card, { key:ph.name, className:'overflow-hidden' },
        React.createElement('div', { className:'px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-2.5' },
          React.createElement('span', { className:'w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0' }, pi+1),
          React.createElement('p', { className:'text-sm font-semibold text-slate-800' }, ph.name),
          React.createElement('span', { className:'ml-auto text-[11px] text-slate-400' }, ph.tasks.length + ' tasks')
        ),
        React.createElement('div', null,
          ph.tasks.map((t,ti)=>React.createElement('div', { key:ti, className:'px-4 py-2.5 border-b border-slate-50 last:border-0 flex items-start gap-3 hover:bg-slate-50' },
            React.createElement('span', { className:'w-4 h-4 rounded border border-slate-300 flex-shrink-0 mt-0.5' }),
            React.createElement('p', { className:'text-sm text-slate-700 flex-1 leading-snug' }, t.t),
            React.createElement(CxPill, { tone:'slate' }, t.owner),
            React.createElement('span', { className:'text-[11px] text-slate-400 w-20 text-right flex-shrink-0' }, t.due)
          ))
        )
      ))
    ),

    pb.links.length > 0 && React.createElement(Card, { className:'p-4' },
      React.createElement(CxLabel, null, 'Linked resources'),
      React.createElement('div', { className:'flex gap-2 flex-wrap' },
        pb.links.map(l=>React.createElement('button', {
          key:l.label, onClick:()=>dispatch({type:'ADD_TOAST',msg:'Opening '+l.label,toastType:'info'}),
          className:'px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:border-indigo-300 hover:text-indigo-600'
        }, l.kind + ': ' + l.label))
      )
    )
  );
}

function DrivePage() {
  const { state, dispatch } = useApp();
  const [kind, setKind] = useState('qbr');
  const [q, setQ] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [extraFiles, setExtraFiles] = useState([]);
  const [showEBR, setShowEBR] = useState(false);
  const [selectedQBR, setSelectedQBR] = useState(null);

  if (showEBR) return React.createElement(EBRWizard, { onClose:()=>setShowEBR(false) });

  const km = DRIVE_KINDS.find(k=>k.id===kind);
  const files = extraFiles.concat(DRIVE_FILES);

  const upload = () => {
    const n = extraFiles.length + 1;
    setExtraFiles(l => [{ id:'up'+n, name:'Untitled '+km.singular+' '+n, kind, fmt:'PPTX',
      size:'1.0 MB', owner:'Maya Chen', updated:'Just now', uses:0, status:'draft' }, ...l]);
    dispatch({ type:'ADD_TOAST', msg:km.singular.toUpperCase()[0]+km.singular.slice(1)+' uploaded to CX42 Drive', toastType:'success' });
  };

  const match = (s) => !q || s.toLowerCase().includes(q.toLowerCase());
  const shownFiles = files.filter(f => f.kind === kind && match(f.name));
  const fmtTone = f => f==='PPTX'?'amber':f==='DOCX'?'blue':f==='XLSX'?'green':'purple';

  const qbrRecord = QBRS.find(x=>x.id===selectedQBR);
  const qbrCustomer = qbrRecord ? state.customers.find(c=>c.id===qbrRecord.customerId) : null;

  return React.createElement('div', { className:'space-y-4' },

    React.createElement('div', null,
      React.createElement('h2', { className:'text-lg font-semibold text-slate-900' }, 'CX42 Drive \u2014 QBR'),
      React.createElement('p', { className:'text-sm text-slate-500 mt-0.5' }, 'Business review decks, agendas and past QBR records.')
    ),

    // Upload + search
    React.createElement('div', {
      onDragOver:e=>{ e.preventDefault(); setDragOver(true); },
      onDragLeave:()=>setDragOver(false),
      onDrop:e=>{ e.preventDefault(); setDragOver(false); upload(); },
      className:`border-2 border-dashed rounded-xl px-4 py-4 flex items-center gap-4 flex-wrap transition-colors ${dragOver?'border-indigo-400 bg-indigo-50':'border-slate-200 bg-white'}`
    },
      React.createElement('div', { className:'w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-base flex-shrink-0' }, '\u2191'),
      React.createElement('div', { className:'flex-1 min-w-[200px]' },
        React.createElement('p', { className:'text-sm font-semibold text-slate-800' }, 'Upload ' + km.label.toLowerCase()),
        React.createElement('p', { className:'text-[11px] text-slate-500' }, 'PPTX, PDF or DOCX \u00b7 up to 25 MB')
      ),
      React.createElement('input', { value:q, onChange:e=>setQ(e.target.value), placeholder:'Search ' + km.label.toLowerCase() + '\u2026',
        className:'text-xs border border-slate-200 rounded-lg px-3 py-1.5 w-48 outline-none focus:border-indigo-400' }),
      React.createElement(Btn, { variant:'primary', size:'xs', onClick:upload }, '\u2191 Upload ' + km.singular)
    ),

    // ── QBR: templates + past reviews + guided EBR ──
    React.createElement('div', { className:'space-y-4' },
      React.createElement(Card, { className:'p-4 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white' },
        React.createElement('div', { className:'flex items-center justify-between flex-wrap gap-3' },
          React.createElement('div', null,
            React.createElement('p', { className:'text-sm font-semibold text-slate-900' }, '\u2726 Guided EBR workflow'),
            React.createElement('p', { className:'text-xs text-slate-500 mt-0.5 max-w-lg' }, 'AI-prepped brief, auto-built slide deck, live presenter mode and post-call automation.')
          ),
          React.createElement(Btn, { variant:'primary', onClick:()=>setShowEBR(true) }, '\u{1F680} Launch guided EBR')
        )
      ),
      React.createElement(Card, { className:'overflow-hidden' },
        React.createElement('div', { className:'px-4 py-3 border-b border-slate-100' },
          React.createElement('p', { className:'text-sm font-semibold text-slate-900' }, 'QBR templates')),
        React.createElement('table', { className:'w-full text-sm' },
          React.createElement('thead', null, React.createElement('tr', { className:'bg-slate-50 border-b' },
            ['Template','Format','Size','Owner','Updated','Used','Status',''].map((h,i)=>React.createElement('th',{key:i,className:'px-4 py-2.5 text-left text-xs font-medium text-slate-500'},h)))),
          React.createElement('tbody', null,
            shownFiles.map(f=>React.createElement('tr', { key:f.id, className:'border-b last:border-0 hover:bg-slate-50' },
              React.createElement('td', { className:'px-4 py-2.5 font-medium text-slate-900' }, f.name),
              React.createElement('td', { className:'px-4 py-2.5' }, React.createElement(CxPill,{tone:fmtTone(f.fmt)},f.fmt)),
              React.createElement('td', { className:'px-4 py-2.5 text-xs text-slate-500' }, f.size),
              React.createElement('td', { className:'px-4 py-2.5 text-xs text-slate-600' }, f.owner),
              React.createElement('td', { className:'px-4 py-2.5 text-xs text-slate-500' }, f.updated),
              React.createElement('td', { className:'px-4 py-2.5 text-xs font-semibold text-slate-700' }, f.uses + '\u00d7'),
              React.createElement('td', { className:'px-4 py-2.5' }, React.createElement(CxPill,{tone:f.status==='published'?'green':'amber'},f.status)),
              React.createElement('td', { className:'px-4 py-2.5 text-right' },
                React.createElement('button', { onClick:()=>dispatch({type:'ADD_TOAST',msg:'Downloading '+f.name,toastType:'info'}), className:'text-xs text-indigo-600 hover:underline' }, 'Download'))
            ))
          )
        )
      ),
      React.createElement(Card, { className:'overflow-hidden' },
        React.createElement('div', { className:'px-4 py-3 border-b border-slate-100' },
          React.createElement('p', { className:'text-sm font-semibold text-slate-900' }, 'Completed & upcoming QBRs')),
        React.createElement('div', null,
          QBRS.map(qb => {
            const c = state.customers.find(x=>x.id===qb.customerId);
            return React.createElement('div', { key:qb.id, onClick:()=>setSelectedQBR(qb.id),
              className:'px-4 py-3 border-b border-slate-50 last:border-0 flex items-center gap-3 hover:bg-slate-50 cursor-pointer' },
              React.createElement('span', { className:'w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm flex-shrink-0' }, '\u{1F4CA}'),
              React.createElement('div', { className:'flex-1 min-w-0' },
                React.createElement('p', { className:'text-sm font-medium text-slate-900 truncate' }, qb.title),
                React.createElement('p', { className:'text-[11px] text-slate-400' }, (c?c.name:'') + ' \u00b7 ' + qb.date)),
              React.createElement(CxPill, { tone: qb.status==='completed'?'green':'amber' }, qb.status)
            );
          })
        )
      ),
      selectedQBR && qbrRecord && React.createElement(Modal, { open:true, onClose:()=>setSelectedQBR(null), title:qbrRecord.title, size:'xl' },
        React.createElement('div', { className:'space-y-3' },
          React.createElement('p', { className:'text-xs text-slate-500' }, (qbrCustomer?qbrCustomer.name:'') + ' \u00b7 ' + qbrRecord.date + ' \u00b7 ' + qbrRecord.status),
          qbrRecord.summary && React.createElement('p', { className:'text-sm text-slate-700 leading-relaxed' }, qbrRecord.summary),
          qbrRecord.participants && qbrRecord.participants.length > 0 && React.createElement('div', null,
            React.createElement('p', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1' }, 'Participants'),
            React.createElement('div', { className:'flex gap-1.5 flex-wrap' }, qbrRecord.participants.map(p=>React.createElement(CxPill,{key:p,tone:'slate'},p)))),
          qbrRecord.decisions && qbrRecord.decisions.length > 0 && React.createElement('div', null,
            React.createElement('p', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1' }, 'Decisions'),
            React.createElement('ul', { className:'text-sm text-slate-700 space-y-1' }, qbrRecord.decisions.map((d,i)=>React.createElement('li',{key:i},'\u2022 '+d)))),
          qbrRecord.actionItems && qbrRecord.actionItems.length > 0 && React.createElement('div', null,
            React.createElement('p', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1' }, 'Action items'),
            React.createElement('ul', { className:'text-sm text-slate-700 space-y-1' }, qbrRecord.actionItems.map((d,i)=>React.createElement('li',{key:i},'\u2022 '+d))))
        )
      )
    )
  );
}

function QBRsPage() {
  const { state } = useApp();
  const [selectedQBR, setSelectedQBR] = useState(null);
  const [qbrView, setQBRView] = useState('internal');
  const [showEBR, setShowEBR] = useState(false);
  
  if(showEBR) return React.createElement(EBRWizard, { onClose:()=>setShowEBR(false) });
  
  const qbr = QBRS.find(q=>q.id===selectedQBR);
  const customer = qbr ? state.customers.find(c=>c.id===qbr.customerId) : null;
  
  return React.createElement('div', { className:'space-y-4' },
    React.createElement(Card, { className:'p-4 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white' },
      React.createElement('div', { className:'flex items-center justify-between flex-wrap gap-3' },
        React.createElement('div', null,
          React.createElement('p', { className:'text-sm font-semibold text-slate-900' }, '✦ Guided EBR workflow'),
          React.createElement('p', { className:'text-xs text-slate-500 mt-0.5 max-w-lg' }, 'AI-prepped brief, auto-built slide deck, live presenter mode, and post-call automation — walk through the full flow with a live demo account (Stark Industries).')
        ),
        React.createElement(Btn, { variant:'primary', onClick:()=>setShowEBR(true) }, '🚀 Launch guided EBR')
      )
    ),
    React.createElement('div', { className:'grid grid-cols-3 gap-4' },
      QBRS.map(q => {
        const c = state.customers.find(cu=>cu.id===q.customerId);
        return React.createElement(Card, { key:q.id, className:'p-4 cursor-pointer hover:shadow-md transition-shadow', onClick:()=>setSelectedQBR(q.id) },
          React.createElement('div', { className:'flex items-start justify-between' },
            React.createElement('div', null,
              React.createElement('span', { className:`px-2 py-0.5 text-xs rounded font-medium ${q.status==='completed'?'bg-green-100 text-green-700':q.status==='in_progress'?'bg-blue-100 text-blue-700':'bg-amber-100 text-amber-700'}` }, q.status),
              React.createElement('p', { className:'font-semibold text-slate-900 mt-2' }, q.title),
              React.createElement('p', { className:'text-xs text-slate-500 mt-1' }, new Date(q.date).toLocaleDateString() + ' · ' + USERS[q.owner]?.name)
            )
          ),
          React.createElement('div', { className:'flex items-center gap-2 mt-3 text-xs text-slate-400' },
            React.createElement('span', null, q.shareStatus === 'shared' ? '👁 Shared' : '🔒 Draft'),
            React.createElement('span', null, '·'),
            React.createElement('span', null, q.approvalStatus)
          )
        );
      })
    ),
    
    selectedQBR && qbr && React.createElement(Modal, { open:true, onClose:()=>setSelectedQBR(null), title:qbr.title, size:'xl' },
      React.createElement('div', { className:'flex gap-2 mb-4' },
        React.createElement('button', { onClick:()=>setQBRView('internal'), className:`px-3 py-1.5 text-sm rounded-lg ${qbrView==='internal'?'bg-indigo-100 text-indigo-700':'bg-slate-100 text-slate-600'}` }, 'Internal view'),
        React.createElement('button', { onClick:()=>setQBRView('customer'), className:`px-3 py-1.5 text-sm rounded-lg ${qbrView==='customer'?'bg-teal-100 text-teal-700':'bg-slate-100 text-slate-600'}` }, 'Customer view')
      ),
      qbr.status === 'completed' ? React.createElement('div', { className:'space-y-4' },
        React.createElement('div', { className:'p-4 bg-slate-50 rounded-xl' },
          React.createElement('h4', { className:'font-semibold text-slate-900 mb-2' }, 'Executive summary'),
          React.createElement('p', { className:'text-sm text-slate-700' }, qbr.execSummary)
        ),
        React.createElement('div', { className:'p-4 bg-slate-50 rounded-xl' },
          React.createElement('h4', { className:'font-semibold text-slate-900 mb-2' }, 'Goals and outcomes'),
          qbr.goals.map((g,i) => React.createElement('div', { key:i, className:'flex items-center gap-3' },
            React.createElement('p', { className:'flex-1 text-sm' }, g.title),
            React.createElement(Progress, { value:g.progress }),
            React.createElement('span', { className:'text-xs text-slate-500 w-8' }, g.progress + '%')
          ))
        ),
        qbr.adoptionMetrics.wau && React.createElement('div', { className:'p-4 bg-slate-50 rounded-xl' },
          React.createElement('h4', { className:'font-semibold text-slate-900 mb-2' }, 'Adoption'),
          React.createElement('div', { className:'grid grid-cols-2 gap-2 text-sm' },
            React.createElement('div', null, React.createElement('p',{className:'text-slate-500'},'WAU'), React.createElement('p',{className:'font-semibold'},qbr.adoptionMetrics.wau)),
            React.createElement('div', null, React.createElement('p',{className:'text-slate-500'},'Seat utilization'), React.createElement('p',{className:'font-semibold'},qbr.adoptionMetrics.seatUtil+'%'))
          )
        ),
        qbr.recommendations.length > 0 && React.createElement('div', { className:'p-4 bg-slate-50 rounded-xl' },
          React.createElement('h4', { className:'font-semibold text-slate-900 mb-2' }, 'Recommendations'),
          qbr.recommendations.map((r,i) => React.createElement('p', { key:i, className:'text-sm text-slate-700' }, '→ ' + r))
        )
      ) : React.createElement('div', { className:'text-center py-8 text-slate-400' }, 'QBR is being prepared. Preview will be available once content is added.')
    )
  );
}

function ReportsPage() {
  const reportGroups = [
    { category:'Revenue & Retention', reports:[
      { name:'Health vs Renewal Outcome', desc:'Correlation between health band at 90 days and renewal result', hasData:true },
      { name:'Renewal Forecast Accuracy', desc:'Actual vs forecast by category over time', hasData:true },
    ]},
    { category:'Customer Health', reports:[
      { name:'Signal-to-Action Time', desc:'Time from health signal to CSM action', hasData:true },
      { name:'Dimension Contribution Analysis', desc:'Which dimensions drive the most health transitions', hasData:true },
    ]},
    { category:'Goals & SOPs', reports:[
      { name:'Goal completion by type', desc:'Completion rates across all goal types', hasData:true },
      { name:'Goal Coverage vs Outcome', desc:'Accounts with active goals vs renewal outcomes', hasData:false },
    ]},
    { category:'Expansion', reports:[
      { name:'Expansion Signal Conversion', desc:'Funnel from signal to qualified opportunity to closed', hasData:true },
      { name:'Expansion by Evidence Type', desc:'Which evidence types predict successful expansion', hasData:false },
    ]},
  ];
  
  const [selectedReport, setSelectedReport] = useState('Health vs Renewal Outcome');
  
  const reportData = {
    'Health vs Renewal Outcome': [
      {band:'Green',renewed:92,churned:8},{band:'Yellow',renewed:71,churned:29},{band:'Red',renewed:38,churned:62}
    ],
    'Signal-to-Action Time': [
      {range:'0-1d',count:8},{range:'1-2d',count:12},{range:'2-5d',count:9},{range:'5-10d',count:5},{range:'>10d',count:3}
    ],
    'Expansion Signal Conversion': [
      {stage:'Signals detected',value:18},{stage:'Qualified',value:7},{stage:'Action run',value:5},{stage:'CRM opportunity',value:4},{stage:'Closed won',value:2}
    ],
  };
  
  const data = reportData[selectedReport];
  
  return React.createElement('div', { className:'grid grid-cols-4 gap-5' },
    // Report library
    React.createElement('div', { className:'col-span-1 space-y-4' },
      reportGroups.map(group => React.createElement('div', { key:group.category },
        React.createElement('p', { className:'text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2' }, group.category),
        group.reports.map(r => React.createElement('button', { key:r.name, onClick:()=>setSelectedReport(r.name), className:`w-full text-left p-3 rounded-lg mb-1 transition-colors ${selectedReport===r.name?'bg-indigo-50 border border-indigo-200':'hover:bg-slate-100'}` },
          React.createElement('p', { className:'text-sm font-medium text-slate-900' }, r.name),
          React.createElement('p', { className:'text-xs text-slate-400 mt-0.5' }, r.desc.substring(0,50) + '...'),
          !r.hasData && React.createElement('span', { className:'text-xs text-amber-500' }, 'Preview only')
        ))
      ))
    ),
    
    // Report view
    React.createElement('div', { className:'col-span-3' },
      React.createElement(Card, { className:'p-5' },
        React.createElement('h4', { className:'font-semibold text-slate-900 mb-1' }, selectedReport),
        React.createElement('p', { className:'text-sm text-slate-500 mb-5' }, 'Based on data from all accounts in the current quarter. Relationship shown, not causation.'),
        data ? React.createElement('div', { className:'h-64' },
          React.createElement(ResponsiveContainer, { width:'100%', height:'100%' },
            selectedReport === 'Health vs Renewal Outcome'
              ? React.createElement(BarChart, { data },
                  React.createElement(CartesianGrid, { strokeDasharray:'3 3' }),
                  React.createElement(XAxis, { dataKey:'band' }),
                  React.createElement(YAxis, { tickFormatter:v=>v+'%' }),
                  React.createElement(Tooltip, { formatter:v=>[v+'%'] }),
                  React.createElement(Legend),
                  React.createElement(Bar, { dataKey:'renewed', name:'Renewed', fill:'#22c55e' }),
                  React.createElement(Bar, { dataKey:'churned', name:'Churned', fill:'#ef4444' })
                )
              : selectedReport === 'Expansion Signal Conversion'
              ? React.createElement(BarChart, { data, layout:'vertical' },
                  React.createElement(XAxis, { type:'number' }),
                  React.createElement(YAxis, { dataKey:'stage', type:'category', width:140, tick:{fontSize:11} }),
                  React.createElement(Tooltip),
                  React.createElement(Bar, { dataKey:'value', name:'Count', fill:'#0d9488' })
                )
              : React.createElement(BarChart, { data },
                  React.createElement(CartesianGrid, { strokeDasharray:'3 3' }),
                  React.createElement(XAxis, { dataKey:Object.keys(data[0])[0], tick:{fontSize:10} }),
                  React.createElement(YAxis),
                  React.createElement(Tooltip),
                  React.createElement(Bar, { dataKey:Object.keys(data[0])[1], fill:'#4f46e5' })
                )
          )
        ) : React.createElement('div', { className:'h-64 flex items-center justify-center text-slate-400' }, 'Report data coming soon')
      )
    )
  );
}

function ConnectorsAdmin() {
  return React.createElement('div', { className:'space-y-5' },
    React.createElement('div', { className:'grid grid-cols-3 gap-4' },
      CONNECTORS.map(conn => React.createElement(Card, { key:conn.id, className:'p-4' },
        React.createElement('div', { className:'flex items-start justify-between mb-3' },
          React.createElement('div', { className:'flex items-center gap-2' },
            React.createElement('div', { className:'w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-sm font-bold text-slate-600' }, conn.icon),
            React.createElement('div', null,
              React.createElement('p', { className:'font-semibold text-slate-900' }, conn.name),
              React.createElement('span', { className:`px-2 py-0.5 text-xs rounded-full font-medium ${conn.status==='connected'?'bg-green-100 text-green-700':conn.status==='needs_attention'?'bg-amber-100 text-amber-700':'bg-gray-100 text-gray-600'}` }, conn.status === 'connected' ? '● Connected' : conn.status === 'needs_attention' ? '⚠ Needs attention' : '○ Not connected')
            )
          )
        ),
        React.createElement('div', { className:'space-y-1 text-xs text-slate-600' },
          React.createElement('div', { className:'flex justify-between' }, React.createElement('span',null,'Last sync'), React.createElement('span',{className:'font-medium'},conn.lastSync)),
          conn.recordsSynced > 0 && React.createElement('div', { className:'flex justify-between' }, React.createElement('span',null,'Records'), React.createElement('span',{className:'font-medium'},conn.recordsSynced.toLocaleString())),
          conn.errorCount > 0 && React.createElement('div', { className:'flex justify-between' }, React.createElement('span',null,'Errors'), React.createElement('span',{className:'font-medium text-red-600'},conn.errorCount)),
          conn.issue && React.createElement('p', { className:'text-amber-600 mt-1' }, '⚠ ' + conn.issue),
          conn.authOwner && React.createElement('div', { className:'flex justify-between' }, React.createElement('span',null,'Auth owner'), React.createElement('span',{className:'font-medium'},conn.authOwner))
        ),
        React.createElement('div', { className:'flex gap-1 mt-3' },
          conn.status === 'needs_attention' && React.createElement(Btn, { variant:'primary', size:'xs' }, 'Reconnect'),
          conn.status === 'connected' && React.createElement(Btn, { variant:'secondary', size:'xs' }, 'Details'),
          conn.status === 'disconnected' && React.createElement(Btn, { variant:'primary', size:'xs' }, 'Connect')
        )
      ))
    ),
    React.createElement(Card, { className:'p-4' },
      React.createElement('h4', { className:'font-semibold text-slate-900 mb-3' }, 'Data quality summary'),
      React.createElement('div', { className:'grid grid-cols-3 gap-4 text-sm' },
        React.createElement('div', { className:'p-3 bg-amber-50 rounded-lg' },
          React.createElement('p', { className:'text-xs text-amber-700 font-medium' }, 'Stale data sources'),
          React.createElement('p', { className:'text-2xl font-bold text-amber-900 mt-1' }, '3'),
          React.createElement('p', { className:'text-xs text-amber-600 mt-0.5' }, 'Gong: 3d stale · Luminary: 4d stale · Vantage: 2d partial')
        ),
        React.createElement('div', { className:'p-3 bg-red-50 rounded-lg' },
          React.createElement('p', { className:'text-xs text-red-700 font-medium' }, 'Failed records'),
          React.createElement('p', { className:'text-2xl font-bold text-red-900 mt-1' }, '16'),
          React.createElement('p', { className:'text-xs text-red-600 mt-0.5' }, 'Primarily from Gong connector')
        ),
        React.createElement('div', { className:'p-3 bg-green-50 rounded-lg' },
          React.createElement('p', { className:'text-xs text-green-700 font-medium' }, 'Coverage rate'),
          React.createElement('p', { className:'text-2xl font-bold text-green-900 mt-1' }, '87%'),
          React.createElement('p', { className:'text-xs text-green-600 mt-0.5' }, '21 of 24 accounts fully covered')
        )
      )
    )
  );
}


// ============================================================
// ADMIN — DATA MODELS
// ============================================================

// ── Field Manager ──
const ADMIN_ENTITIES = [
  { id:'company', label:'Company fields', icon:'\u{1F3E2}', tone:'blue',   desc:'Account-level attributes used across health, renewal and segmentation.' },
  { id:'contact', label:'Contact fields', icon:'\u{1F4C7}', tone:'purple', desc:'Individual stakeholder attributes for relationship mapping.' },
  { id:'task',    label:'Task fields',    icon:'\u2705',    desc:'Task attributes used in SOPs and goal execution.', tone:'teal' },
  { id:'plan',    label:'Plan / Goal fields', icon:'\u{1F3AF}', tone:'green', desc:'Success plan and goal attributes used in QBRs and reporting.' },
];

const ADMIN_FIELDS = {
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

// ── Signals ──
const SIGNAL_SOURCES = [
  { id:'usage',      label:'Product usage',    icon:'\u{1F4CA}', tone:'blue',   status:'active',  freq:'Every 15 min',  coverage:92, source:'Vantage Analytics',
    desc:'Feature clicks, session depth, drop-offs and rage clicks streamed from the product.',
    metrics:[['Events / day','1.4M'],['Accounts covered','22 / 24'],['Signal lag','12 min']],
    settings:[['Track feature-level clicks',true],['Capture rage clicks',true],['Session replay retention',true],['Anonymous sessions',false]] },
  { id:'sentiment',  label:'Sentiment',        icon:'\u{1F4AC}', tone:'purple', status:'active',  freq:'On message',    coverage:88, source:'Email + Ticket NLP',
    desc:'Language-model scoring of email threads, ticket replies and meeting notes.',
    metrics:[['Messages scored','8,412'],['Avg confidence','0.86'],['Negative flags (30d)','37']],
    settings:[['Score inbound email',true],['Score ticket replies',true],['Score meeting transcripts',true],['Alert on sharp drops',true]] },
];

// ── CX42 Drive ──
const DRIVE_TEMPLATES = [
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

// ── Triggers ──









// ============================================================
// ADMIN — SHARED UI
// ============================================================
const ADMIN_TONES = {
  blue:   'bg-blue-50 text-blue-600',
  red:    'bg-red-50 text-red-600',
  amber:  'bg-amber-50 text-amber-600',
  purple: 'bg-purple-50 text-purple-600',
  teal:   'bg-teal-50 text-teal-600',
  green:  'bg-green-50 text-green-600',
  slate:  'bg-slate-100 text-slate-600',
};

function AdminTile({ icon, title, desc, meta, tone='slate', onClick }){
  return React.createElement('button', {
    onClick,
    className:'text-left bg-white border border-slate-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-md transition-all group w-full'
  },
    React.createElement('div', { className:'flex items-start gap-3' },
      React.createElement('div', { className:`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${ADMIN_TONES[tone]||ADMIN_TONES.slate}` }, icon),
      React.createElement('div', { className:'flex-1 min-w-0' },
        React.createElement('p', { className:'font-semibold text-slate-900 text-sm group-hover:text-indigo-700 transition-colors' }, title),
        desc && React.createElement('p', { className:'text-xs text-slate-500 mt-1 leading-relaxed' }, desc)
      ),
      React.createElement('span', { className:'text-slate-300 group-hover:text-indigo-500 transition-colors flex-shrink-0' }, '\u2192')
    ),
    meta && React.createElement('div', { className:'mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 flex-wrap' }, meta)
  );
}

function AdminCrumb({ trail, onNavigate, actions }){
  return React.createElement('div', { className:'flex items-center justify-between gap-3 flex-wrap' },
    React.createElement('div', { className:'flex items-center gap-1.5 text-sm flex-wrap' },
      trail.map((t,i) => React.createElement(React.Fragment, { key:i },
        i > 0 && React.createElement('span', { className:'text-slate-300' }, '/'),
        i < trail.length - 1
          ? React.createElement('button', { onClick:()=>onNavigate(i), className:'text-slate-500 hover:text-indigo-600 font-medium' }, t)
          : React.createElement('span', { className:'text-slate-900 font-semibold' }, t)
      ))
    ),
    actions || null
  );
}

function AdminToggle({ on, onChange, label }){
  return React.createElement('button', {
    onClick:()=>onChange(!on),
    className:'inline-flex items-center gap-2 cursor-pointer'
  },
    React.createElement('span', { className:`w-9 h-5 rounded-full inline-flex items-center px-0.5 transition-colors flex-shrink-0 ${on?'bg-green-500 justify-end':'bg-slate-300 justify-start'}` },
      React.createElement('span', { className:'w-4 h-4 bg-white rounded-full shadow' })),
    label && React.createElement('span', { className:`text-xs font-medium ${on?'text-green-700':'text-slate-400'}` }, label)
  );
}

// ============================================================
// ADMIN — FIELD MANAGER
// ============================================================
function FieldManagerAdmin({ onBack, dispatch }){
  const [entity, setEntity] = useState(null);
  const [q, setQ] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [overrides, setOverrides] = useState({});

  const ent = ADMIN_ENTITIES.find(e=>e.id===entity);
  const fields = entity ? (ADMIN_FIELDS[entity]||[]) : [];
  const shown = fields.filter(f => !q || f.label.toLowerCase().includes(q.toLowerCase()) || f.key.includes(q.toLowerCase()));

  if (!entity) {
    return React.createElement('div', { className:'space-y-4' },
      React.createElement(AdminCrumb, { trail:['Admin','Field Manager'], onNavigate:()=>onBack() }),
      React.createElement('p', { className:'text-sm text-slate-500' }, 'Define the attributes available on each object. System fields are read-only; custom fields can be edited, reordered or retired.'),
      React.createElement('div', { className:'grid grid-cols-3 gap-4' },
        ADMIN_ENTITIES.map(e => React.createElement(AdminTile, {
          key:e.id, icon:e.icon, title:e.label, desc:e.desc, tone:e.tone,
          onClick:()=>{ setEntity(e.id); setQ(''); },
          meta:[
            React.createElement(CxPill, { key:'t', tone:'slate' }, (ADMIN_FIELDS[e.id]||[]).length + ' fields'),
            React.createElement(CxPill, { key:'c', tone:'blue' }, (ADMIN_FIELDS[e.id]||[]).filter(f=>!f.system).length + ' custom')
          ]
        }))
      )
    );
  }

  return React.createElement('div', { className:'space-y-4' },
    React.createElement(AdminCrumb, {
      trail:['Admin','Field Manager', ent.label],
      onNavigate:(i)=>{ if(i===0) onBack(); else setEntity(null); },
      actions: React.createElement('div', { className:'flex gap-2' },
        React.createElement('input', { value:q, onChange:e=>setQ(e.target.value), placeholder:'Search fields\u2026', className:'text-xs border border-slate-200 rounded-lg px-3 py-1.5 w-44 outline-none focus:border-indigo-400' }),
        React.createElement(Btn, { variant:'primary', size:'xs', onClick:()=>setShowNew(true) }, '+ New field')
      )
    }),
    React.createElement(Card, { className:'overflow-hidden' },
      React.createElement('table', { className:'w-full text-sm' },
        React.createElement('thead', null, React.createElement('tr', { className:'bg-slate-50 border-b' },
          ['Label','API name','Type','Required','Origin','Used in','Active'].map(h=>React.createElement('th',{key:h,className:'px-4 py-3 text-left text-xs font-medium text-slate-500'},h))
        )),
        React.createElement('tbody', null,
          shown.length === 0
            ? React.createElement('tr', null, React.createElement('td', { colSpan:7, className:'px-4 py-8 text-center text-slate-400 text-sm' }, 'No fields match that search'))
            : shown.map(f => {
                const active = overrides[f.key] !== undefined ? overrides[f.key] : true;
                return React.createElement('tr', { key:f.key, className:'border-b last:border-0 hover:bg-slate-50' },
                  React.createElement('td', { className:'px-4 py-2.5 font-medium text-slate-900' }, f.label),
                  React.createElement('td', { className:'px-4 py-2.5 font-mono text-xs text-slate-500' }, f.key),
                  React.createElement('td', { className:'px-4 py-2.5' }, React.createElement(CxPill, { tone:'slate' }, f.type)),
                  React.createElement('td', { className:'px-4 py-2.5' }, f.req ? React.createElement(CxPill, { tone:'amber' }, 'Required') : React.createElement('span',{className:'text-xs text-slate-300'},'Optional')),
                  React.createElement('td', { className:'px-4 py-2.5' }, React.createElement(CxPill, { tone: f.system?'blue':'purple' }, f.system?'System':'Custom')),
                  React.createElement('td', { className:'px-4 py-2.5 text-xs text-slate-500' }, f.usage),
                  React.createElement('td', { className:'px-4 py-2.5' },
                    f.system
                      ? React.createElement('span', { className:'text-xs text-slate-300' }, 'Locked')
                      : React.createElement(AdminToggle, { on:active, onChange:v=>{ setOverrides(o=>({...o,[f.key]:v})); dispatch && dispatch({type:'ADD_TOAST',msg:f.label+(v?' enabled':' disabled'),toastType:'info'}); } })
                  )
                );
              })
        )
      )
    ),
    React.createElement(Modal, { open:showNew, onClose:()=>setShowNew(false), title:'New ' + ent.label.replace(' fields','').toLowerCase() + ' field' },
      React.createElement('div', { className:'space-y-3' },
        React.createElement('div', null,
          React.createElement('label', { className:'text-xs font-medium text-slate-500' }, 'Field label'),
          React.createElement('input', { className:'w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400', placeholder:'e.g. Onboarding stage' })
        ),
        React.createElement('div', { className:'grid grid-cols-2 gap-3' },
          React.createElement('div', null,
            React.createElement('label', { className:'text-xs font-medium text-slate-500' }, 'Type'),
            React.createElement('select', { className:'w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400' },
              ['Text','Long text','Number','Percent','Currency','Date','DateTime','Dropdown','Checkbox','Lookup','Email','URL','Duration'].map(t=>React.createElement('option',{key:t},t)))
          ),
          React.createElement('div', null,
            React.createElement('label', { className:'text-xs font-medium text-slate-500' }, 'Required'),
            React.createElement('select', { className:'w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400' },
              React.createElement('option', null, 'Optional'), React.createElement('option', null, 'Required'))
          )
        ),
        React.createElement('div', null,
          React.createElement('label', { className:'text-xs font-medium text-slate-500' }, 'Help text'),
          React.createElement('input', { className:'w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400', placeholder:'Shown beneath the field' })
        ),
        React.createElement('div', { className:'flex justify-end gap-2 pt-2' },
          React.createElement(Btn, { variant:'secondary', onClick:()=>setShowNew(false) }, 'Cancel'),
          React.createElement(Btn, { variant:'primary', onClick:()=>{ setShowNew(false); dispatch && dispatch({type:'ADD_TOAST',msg:'Field created',toastType:'success'}); } }, 'Create field')
        )
      )
    )
  );
}

// ============================================================
// ADMIN — SIGNALS
// ============================================================

// ============================================================
// SIGNAL BUILDERS — per-category configuration
// ============================================================

// ── Product usage: an autocapture listener, Pendo / Heap style ──
const USAGE_EVENTS = [
  { id:'ue1', name:'Export report clicked',   selector:'button[data-cx="export-report"]', page:'/reports',      type:'Click',      captured:12840, tagged:true,  autocaptured:false },
  { id:'ue2', name:'Dashboard viewed',        selector:'route:/dashboards/*',              page:'/dashboards',   type:'Page view',  captured:48211, tagged:true,  autocaptured:false },
  { id:'ue3', name:'Connector added',         selector:'button.connector-add',             page:'/integrations', type:'Click',      captured:1904,  tagged:true,  autocaptured:false },
  { id:'ue4', name:'Scheduled report saved',  selector:'form#schedule-report >> submit',   page:'/reports/new',  type:'Form submit',captured:3120,  tagged:true,  autocaptured:false },
  { id:'ue5', name:'AI Insights opened',      selector:'a[href^="/insights"]',             page:'/insights',     type:'Click',      captured:642,   tagged:true,  autocaptured:false },
  { id:'ue6', name:'div.toolbar > button:nth-child(3)', selector:'div.toolbar > button:nth-child(3)', page:'/dashboards', type:'Click', captured:2210, tagged:false, autocaptured:true },
  { id:'ue7', name:'a.nav-link[href="/settings"]',      selector:'a.nav-link[href="/settings"]',      page:'(all)',       type:'Click', captured:5401, tagged:false, autocaptured:true },
];
const USAGE_PAGE_RULES = [
  { id:'pr1', name:'Reports',    match:'starts with', value:'/reports',      events:4 },
  { id:'pr2', name:'Dashboards', match:'starts with', value:'/dashboards',   events:6 },
  { id:'pr3', name:'Admin',      match:'starts with', value:'/admin',        events:2, exclude:true },
];
const USAGE_SNIPPET = "<script>\n  (function(w,d,k){w.cx42=w.cx42||function(){(w.cx42.q=w.cx42.q||[]).push(arguments)};\n   var s=d.createElement('script');s.async=1;\n   s.src='https://cdn.cx-42.com/listener.js?k='+k;\n   d.head.appendChild(s);})(window,document,'PK_live_8f2c41');\n  cx42('identify', { accountId: ACCOUNT_ID, userId: USER_ID });\n<\/script>";

// ── Conversations: transcript import ──
const CONVO_PARSERS = [
  { id:'vtt',  label:'WebVTT (.vtt)',        note:'Zoom, Teams and Meet exports.' },
  { id:'srt',  label:'SubRip (.srt)',        note:'Common recorder output.' },
  { id:'txt',  label:'Plain text (.txt)',    note:'Timestamp Speaker: text, one line per turn.' },
  { id:'json', label:'JSON transcript',      note:'Gong and Chorus API payloads.' },
];
const CONVO_MAPPING = [
  { field:'Speaker',   from:'speaker | name | participant' },
  { field:'Timestamp', from:'start | at | offset' },
  { field:'Text',      from:'text | content | words' },
  { field:'Account',   from:'matched on attendee email domain' },
];

// ── Community ──
const COMMUNITY_PLATFORMS = [
  { id:'native',   name:'CX42 Communities', note:'Built in. Spaces, categories and moderation managed here.', connected:true },
  { id:'discourse',name:'Discourse',        note:'Read topics, replies and likes via API key.',              connected:false },
  { id:'khoros',   name:'Khoros',           note:'Enterprise community sync.',                                connected:false },
  { id:'circle',   name:'Circle',           note:'Spaces and member activity.',                               connected:false },
  { id:'discord',  name:'Discord',          note:'Channel activity for developer communities.',               connected:false },
];
const COMMUNITY_SPACES = [
  { id:'cs1', name:'Product announcements', posts:184, members:1240, moderated:true,  signal:'low' },
  { id:'cs2', name:'Ask the community',     posts:912, members:1806, moderated:true,  signal:'high' },
  { id:'cs3', name:'Feature requests',      posts:441, members:980,  moderated:true,  signal:'high' },
  { id:'cs4', name:'Integrations & API',    posts:308, members:612,  moderated:false, signal:'medium' },
];

// ── CSAT survey builder ──
const SURVEY_QUESTION_TYPES = [
  { id:'rating5',  label:'1\u20135 rating',      icon:'\u2605' },
  { id:'thumbs',   label:'Thumbs up / down',     icon:'\u{1F44D}' },
  { id:'scale10',  label:'0\u201310 scale',      icon:'\u{1F522}' },
  { id:'choice',   label:'Multiple choice',      icon:'\u25C9' },
  { id:'text',     label:'Open text',            icon:'\u270E' },
  { id:'nps',      label:'NPS question',         icon:'\u{1F4CA}' },
];
const DEFAULT_CSAT_SURVEY = [
  { id:'q1', type:'rating5', title:'How satisfied were you with this resolution?', required:true,  options:[] },
  { id:'q2', type:'choice',  title:'What could we have done better?', required:false,
    options:['Faster response','Clearer communication','Better first answer','Nothing \u2014 it was good'] },
  { id:'q3', type:'text',    title:'Anything else you would like us to know?', required:false, options:[] },
];
const SURVEY_TRIGGERS = ['On ticket resolution','On ticket close','7 days after onboarding','After a QBR','Manual send only'];

// ── NPS ──
const NPS_SNIPPET = "<script>\n  window.cx42NPS = {\n    surveyId: 'nps_q3_2025',\n    accountId: ACCOUNT_ID,\n    userId: USER_ID,\n    position: 'bottom-right',\n    delay: 8000,          // ms after page load\n    frequency: 90         // days between prompts for the same user\n  };\n<\/script>\n<script async src=\"https://cdn.cx-42.com/nps.js?k=PK_live_8f2c41\"><\/script>";
const NPS_SEGMENTS = ['All users','Admins only','Users active in the last 30 days','Accounts renewing in 90 days','Enterprise accounts'];

// ── Support hygiene ──
const HYGIENE_RULES = [
  { id:'hy1', name:'First response within SLA',      weight:25, target:'95%',  current:'91%', healthy:false },
  { id:'hy2', name:'No ticket open beyond 14 days',  weight:20, target:'100%', current:'96%', healthy:false },
  { id:'hy3', name:'Every P1 has a written RCA',     weight:20, target:'100%', current:'100%',healthy:true },
  { id:'hy4', name:'Reopen rate below 8%',           weight:15, target:'<8%',  current:'5.2%',healthy:true },
  { id:'hy5', name:'CSAT survey sent on resolution', weight:10, target:'90%',  current:'93%', healthy:true },
  { id:'hy6', name:'Tickets categorised at close',   weight:10, target:'95%',  current:'88%', healthy:false },
];

const SG_INP = 'text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 outline-none focus:border-indigo-400';
function SgCode({ code, dispatch, label }){
  return React.createElement('div', null,
    React.createElement('div', { className:'flex items-center justify-between mb-1.5' },
      React.createElement('p', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider' }, label || 'Install snippet'),
      React.createElement('button', { onClick:()=>dispatch({type:'ADD_TOAST',msg:'Snippet copied to clipboard',toastType:'success'}),
        className:'text-[11px] text-indigo-600 hover:underline font-semibold' }, 'Copy')),
    React.createElement('pre', { className:'bg-slate-900 text-slate-100 rounded-lg p-3 text-[11px] leading-relaxed overflow-x-auto font-mono whitespace-pre' }, code));
}

// ── 1. Product usage: autocapture listener ──
function UsageBuilder({ dispatch }){
  const [tab, setTab] = useState('events');
  const [autocapture, setAutocapture] = useState(true);
  const [events, setEvents] = useState(USAGE_EVENTS);
  const [rules, setRules] = useState(USAGE_PAGE_RULES);
  const [showTag, setShowTag] = useState(false);
  const [draft, setDraft] = useState({ name:'', selector:'', page:'', type:'Click' });

  const tagged = events.filter(e=>e.tagged);
  const raw = events.filter(e=>!e.tagged);

  return React.createElement('div', { className:'space-y-4' },
    React.createElement('div', { className:'grid grid-cols-4 gap-4' },
      React.createElement(MetricCard, { label:'Tagged features', value:tagged.length, sub:'named and tracked' }),
      React.createElement(MetricCard, { label:'Autocaptured', value:raw.length, sub:'awaiting a name', subColor:'text-amber-600' }),
      React.createElement(MetricCard, { label:'Events (30d)', value:(events.reduce((n,e)=>n+e.captured,0)/1000).toFixed(1) + 'K', sub:'across all accounts' }),
      React.createElement(MetricCard, { label:'Page rules', value:rules.length, sub:rules.filter(r=>r.exclude).length + ' excluded' })),

    React.createElement(Card, { className:'p-4 bg-indigo-50/40 border-indigo-100' },
      React.createElement('div', { className:'flex items-start gap-3' },
        React.createElement(AdminToggle, { on:autocapture, onChange:setAutocapture }),
        React.createElement('div', { className:'flex-1' },
          React.createElement('p', { className:'text-sm font-semibold text-slate-800' }, 'Autocapture every interaction'),
          React.createElement('p', { className:'text-xs text-slate-600 mt-0.5 leading-relaxed' },
            autocapture
              ? 'The listener records every click, form submit and page view retroactively. Tag an element later and the historical data is already there \u2014 no need to have instrumented it in advance.'
              : 'Only explicitly tagged elements are recorded. Anything you tag later starts collecting from that point on.')))),

    React.createElement(Tabs, { tabs:[
      { id:'events', label:'Tracked events \u00b7 ' + events.length },
      { id:'pages',  label:'Page rules' },
      { id:'install',label:'Install' },
    ], active:tab, onChange:setTab }),

    tab === 'events' && React.createElement('div', { className:'space-y-3' },
      React.createElement('div', { className:'flex justify-between items-center flex-wrap gap-2' },
        React.createElement('p', { className:'text-xs text-slate-500' }, 'Give an autocaptured element a name to turn it into a feature you can report on.'),
        React.createElement(Btn, { variant:'primary', size:'xs', onClick:()=>setShowTag(true) }, '+ Tag an element')),
      React.createElement(Card, { className:'overflow-hidden' },
        React.createElement('div', { className:'overflow-x-auto' },
          React.createElement('table', { className:'w-full text-sm min-w-[820px]' },
            React.createElement('thead', null, React.createElement('tr', { className:'bg-slate-50 border-b' },
              ['Feature / element','Selector','Page','Type','Events (30d)','Status',''].map((h,i)=>
                React.createElement('th',{key:i,className:'px-4 py-2.5 text-left text-xs font-medium text-slate-500 whitespace-nowrap'},h)))),
            React.createElement('tbody', null,
              events.map(e => React.createElement('tr', { key:e.id, className:'border-b last:border-0 hover:bg-slate-50' },
                React.createElement('td', { className:'px-4 py-2.5' },
                  e.tagged
                    ? React.createElement('span', { className:'font-medium text-slate-900' }, e.name)
                    : React.createElement('span', { className:'font-mono text-[11px] text-slate-400' }, e.name)),
                React.createElement('td', { className:'px-4 py-2.5 font-mono text-[11px] text-slate-500 max-w-[220px] truncate' }, e.selector),
                React.createElement('td', { className:'px-4 py-2.5 text-xs text-slate-600' }, e.page),
                React.createElement('td', { className:'px-4 py-2.5' }, React.createElement(CxPill, { tone:'slate' }, e.type)),
                React.createElement('td', { className:'px-4 py-2.5 text-xs font-semibold text-slate-700' }, e.captured.toLocaleString()),
                React.createElement('td', { className:'px-4 py-2.5' },
                  React.createElement(CxPill, { tone: e.tagged?'green':'amber' }, e.tagged ? 'Tagged' : 'Autocaptured')),
                React.createElement('td', { className:'px-4 py-2.5 text-right' },
                  e.tagged
                    ? React.createElement('button', { onClick:()=>setEvents(l=>l.filter(x=>x.id!==e.id)), className:'text-xs text-slate-400 hover:text-red-600' }, 'Remove')
                    : React.createElement('button', { onClick:()=>{ setEvents(l=>l.map(x=>x.id===e.id?{...x,tagged:true,name:'Untitled feature'}:x));
                        dispatch({type:'ADD_TOAST',msg:'Element tagged \u2014 historical events backfilled',toastType:'success'}); },
                        className:'text-xs text-indigo-600 hover:underline' }, 'Name it')))))
          )))),

    tab === 'pages' && React.createElement(Card, { className:'overflow-hidden' },
      React.createElement('div', { className:'px-4 py-3 border-b border-slate-100 flex items-center justify-between' },
        React.createElement('div', null,
          React.createElement('p', { className:'text-sm font-semibold text-slate-900' }, 'Page rules'),
          React.createElement('p', { className:'text-[11px] text-slate-500 mt-0.5' }, 'Group URLs into named pages, or exclude them from capture entirely.')),
        React.createElement(Btn, { variant:'primary', size:'xs', onClick:()=>{ const n=rules.length+1;
          setRules(r=>r.concat({ id:'pr'+n, name:'New page group', match:'starts with', value:'/', events:0 })); } }, '+ Add rule')),
      React.createElement('table', { className:'w-full text-sm' },
        React.createElement('thead', null, React.createElement('tr', { className:'bg-slate-50 border-b' },
          ['Page group','Match','URL','Events','Capture',''].map((h,i)=>
            React.createElement('th',{key:i,className:'px-4 py-2.5 text-left text-xs font-medium text-slate-500'},h)))),
        React.createElement('tbody', null,
          rules.map(r => React.createElement('tr', { key:r.id, className:'border-b last:border-0 hover:bg-slate-50' },
            React.createElement('td', { className:'px-4 py-2.5' },
              React.createElement('input', { value:r.name, onChange:e=>setRules(l=>l.map(x=>x.id===r.id?{...x,name:e.target.value}:x)), className:SG_INP + ' w-40' })),
            React.createElement('td', { className:'px-4 py-2.5' },
              React.createElement('select', { value:r.match, onChange:e=>setRules(l=>l.map(x=>x.id===r.id?{...x,match:e.target.value}:x)), className:SG_INP },
                ['starts with','is exactly','contains','matches regex'].map(o=>React.createElement('option',{key:o},o)))),
            React.createElement('td', { className:'px-4 py-2.5' },
              React.createElement('input', { value:r.value, onChange:e=>setRules(l=>l.map(x=>x.id===r.id?{...x,value:e.target.value}:x)), className:SG_INP + ' w-40 font-mono' })),
            React.createElement('td', { className:'px-4 py-2.5 text-xs text-slate-600' }, r.events),
            React.createElement('td', { className:'px-4 py-2.5' },
              React.createElement(AdminToggle, { on:!r.exclude, label:r.exclude?'Excluded':'Capturing',
                onChange:v=>setRules(l=>l.map(x=>x.id===r.id?{...x,exclude:!v}:x)) })),
            React.createElement('td', { className:'px-4 py-2.5 text-right' },
              React.createElement('button', { onClick:()=>setRules(l=>l.filter(x=>x.id!==r.id)), className:'text-xs text-slate-400 hover:text-red-600' }, 'Remove')))))
      )),

    tab === 'install' && React.createElement(Card, { className:'p-4 space-y-3' },
      React.createElement('p', { className:'text-sm text-slate-600 leading-relaxed' },
        'Add the listener once to your application shell. It captures interactions on every page automatically \u2014 there is no per-feature instrumentation to maintain.'),
      React.createElement(SgCode, { code:USAGE_SNIPPET, dispatch }),
      React.createElement('div', { className:'grid grid-cols-3 gap-3 pt-2' },
        [['Identify call','Ties events to an account and user'],
         ['Retroactive','Tag an element later and history is already captured'],
         ['SPA routing','Route changes are treated as page views']].map(x =>
          React.createElement('div', { key:x[0], className:'bg-slate-50 rounded-lg p-2.5' },
            React.createElement('p', { className:'text-[11px] font-bold text-slate-700' }, x[0]),
            React.createElement('p', { className:'text-[11px] text-slate-500 mt-0.5' }, x[1]))))),

    React.createElement(Modal, { open:showTag, onClose:()=>setShowTag(false), title:'Tag an element' },
      React.createElement('div', { className:'space-y-3' },
        React.createElement('p', { className:'text-xs text-slate-500' },
          'Name an element so it becomes a reportable feature. With autocapture on, past interactions are backfilled.'),
        [['Feature name','name','e.g. Export report clicked'],
         ['CSS selector','selector','button[data-cx="export"]'],
         ['Page','page','/reports']].map(f =>
          React.createElement('div', { key:f[1] },
            React.createElement('label', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider' }, f[0]),
            React.createElement('input', { value:draft[f[1]], placeholder:f[2],
              onChange:e=>setDraft(d=>({...d,[f[1]]:e.target.value})),
              className:'w-full mt-1 text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400' + (f[1]==='selector'?' font-mono':'') }))),
        React.createElement('div', null,
          React.createElement('label', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider' }, 'Interaction type'),
          React.createElement('select', { value:draft.type, onChange:e=>setDraft(d=>({...d,type:e.target.value})),
            className:'w-full mt-1 text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400' },
            ['Click','Page view','Form submit','Hover','Text input'].map(o=>React.createElement('option',{key:o},o)))),
        React.createElement('div', { className:'flex justify-end gap-2 pt-1' },
          React.createElement(Btn, { variant:'secondary', onClick:()=>setShowTag(false) }, 'Cancel'),
          React.createElement(Btn, { variant:'primary', disabled:!draft.name.trim()||!draft.selector.trim(),
            onClick:()=>{ const n=events.length+1;
              setEvents(l=>[{ id:'ue_new'+n, name:draft.name, selector:draft.selector, page:draft.page||'(all)', type:draft.type, captured:0, tagged:true, autocaptured:false }].concat(l));
              setShowTag(false); setDraft({ name:'', selector:'', page:'', type:'Click' });
              dispatch({type:'ADD_TOAST',msg:'Element tagged',toastType:'success'}); } }, 'Tag element'))))
  );
}

// ── 2. CSAT survey builder ──
function CsatBuilder({ dispatch }){
  const [qs, setQs] = useState(DEFAULT_CSAT_SURVEY);
  const [trigger, setTrigger] = useState(SURVEY_TRIGGERS[0]);
  const [title, setTitle] = useState('How did we do?');
  const [thanks, setThanks] = useState('Thank you \u2014 your feedback goes straight to the team that handled this.');
  const [sel, setSel] = useState(null);

  const add = (type) => { const t = SURVEY_QUESTION_TYPES.find(x=>x.id===type); const n = qs.length+1;
    setQs(l=>l.concat({ id:'q_new'+n, type, title:'Untitled ' + t.label.toLowerCase() + ' question', required:false,
      options: type==='choice' ? ['Option 1','Option 2'] : [] })); };
  const upd = (id,p) => setQs(l=>l.map(q=>q.id===id?{...q,...p}:q));
  const move = (i,d) => setQs(l=>{ const n=l.slice(); const j=i+d; if(j<0||j>=n.length) return n;
    const t=n[i]; n[i]=n[j]; n[j]=t; return n; });

  const preview = (q) => {
    if (q.type==='rating5')  return React.createElement('div',{className:'flex gap-1'}, [1,2,3,4,5].map(n=>React.createElement('span',{key:n,className:'w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-xs text-slate-500'},n)));
    if (q.type==='scale10')  return React.createElement('div',{className:'flex gap-0.5 flex-wrap'}, Array.from({length:11},(_,n)=>React.createElement('span',{key:n,className:'w-6 h-6 rounded border border-slate-200 flex items-center justify-center text-[10px] text-slate-500'},n)));
    if (q.type==='thumbs')   return React.createElement('div',{className:'flex gap-2'}, ['\u{1F44D}','\u{1F44E}'].map(x=>React.createElement('span',{key:x,className:'w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center'},x)));
    if (q.type==='nps')      return React.createElement('div',{className:'flex gap-0.5 flex-wrap'}, Array.from({length:11},(_,n)=>React.createElement('span',{key:n,className:`w-6 h-6 rounded border flex items-center justify-center text-[10px] ${n<7?'border-red-200 text-red-500':n<9?'border-amber-200 text-amber-600':'border-green-200 text-green-600'}`},n)));
    if (q.type==='choice')   return React.createElement('div',{className:'space-y-1'}, q.options.map((o,i)=>React.createElement('div',{key:i,className:'flex items-center gap-2 text-xs text-slate-600'},React.createElement('span',{className:'w-3 h-3 rounded-full border border-slate-300'}),o)));
    return React.createElement('div',{className:'border border-slate-200 rounded-lg h-14 bg-slate-50'});
  };

  return React.createElement('div', { className:'space-y-4' },
    React.createElement('div', { className:'grid grid-cols-3 gap-4 items-start' },

      React.createElement('div', { className:'col-span-2 space-y-3' },
        React.createElement(Card, { className:'p-4' },
          React.createElement(CxLabel, null, 'Survey'),
          React.createElement('input', { value:title, onChange:e=>setTitle(e.target.value),
            className:'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold outline-none focus:border-indigo-400' }),
          React.createElement('div', { className:'grid grid-cols-2 gap-3 mt-3' },
            React.createElement('div', null,
              React.createElement('label', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider' }, 'Send when'),
              React.createElement('select', { value:trigger, onChange:e=>setTrigger(e.target.value), className:'w-full mt-1 ' + SG_INP },
                SURVEY_TRIGGERS.map(o=>React.createElement('option',{key:o},o)))),
            React.createElement('div', null,
              React.createElement('label', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider' }, 'Thank-you message'),
              React.createElement('input', { value:thanks, onChange:e=>setThanks(e.target.value), className:'w-full mt-1 ' + SG_INP })))),

        React.createElement(Card, { className:'p-4' },
          React.createElement(CxLabel, { right:React.createElement('span',{className:'text-[11px] text-slate-400'}, qs.length + ' question(s)') }, 'Questions'),
          React.createElement('div', { className:'space-y-2' },
            qs.map((q,i) => {
              const meta = SURVEY_QUESTION_TYPES.find(x=>x.id===q.type) || SURVEY_QUESTION_TYPES[0];
              const open = sel === q.id;
              return React.createElement('div', { key:q.id, className:`border rounded-xl ${open?'border-indigo-300':'border-slate-200'}` },
                React.createElement('div', { className:'flex items-center gap-2 px-3 py-2' },
                  React.createElement('span', { className:'w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-xs flex-shrink-0' }, meta.icon),
                  React.createElement('div', { className:'flex-1 min-w-0' },
                    React.createElement('p', { className:'text-sm font-medium text-slate-800 truncate' }, q.title),
                    React.createElement('p', { className:'text-[10px] text-slate-400' }, meta.label + (q.required?' \u00b7 required':''))),
                  React.createElement('button', { onClick:()=>move(i,-1), disabled:i===0, className:'text-slate-300 hover:text-slate-600 text-xs px-0.5 disabled:opacity-30' }, '\u2191'),
                  React.createElement('button', { onClick:()=>move(i,1), disabled:i===qs.length-1, className:'text-slate-300 hover:text-slate-600 text-xs px-0.5 disabled:opacity-30' }, '\u2193'),
                  React.createElement('button', { onClick:()=>setSel(open?null:q.id), className:'text-[11px] text-indigo-600 hover:underline px-1' }, open?'Close':'Edit'),
                  React.createElement('button', { onClick:()=>setQs(l=>l.filter(x=>x.id!==q.id)), className:'text-slate-300 hover:text-red-500 text-xs px-0.5' }, '\u2715')),
                open && React.createElement('div', { className:'px-3 pb-3 border-t border-slate-100 pt-2.5 space-y-2' },
                  React.createElement('input', { value:q.title, onChange:e=>upd(q.id,{title:e.target.value}),
                    className:'w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-indigo-400' }),
                  React.createElement('div', { className:'flex gap-2 items-center flex-wrap' },
                    React.createElement('select', { value:q.type, onChange:e=>upd(q.id,{type:e.target.value,
                      options: e.target.value==='choice' ? (q.options.length?q.options:['Option 1','Option 2']) : []}), className:SG_INP },
                      SURVEY_QUESTION_TYPES.map(x=>React.createElement('option',{key:x.id,value:x.id},x.label))),
                    React.createElement('label', { className:'flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer' },
                      React.createElement('input', { type:'checkbox', checked:q.required, onChange:()=>upd(q.id,{required:!q.required}), className:'accent-indigo-600' }), 'Required')),
                  q.type === 'choice' && React.createElement('div', { className:'space-y-1' },
                    q.options.map((o,oi)=>React.createElement('div', { key:oi, className:'flex gap-2' },
                      React.createElement('input', { value:o, className:SG_INP + ' flex-1',
                        onChange:e=>upd(q.id,{options:q.options.map((x,j)=>j===oi?e.target.value:x)}) }),
                      React.createElement('button', { onClick:()=>upd(q.id,{options:q.options.filter((_,j)=>j!==oi)}), className:'text-slate-300 hover:text-red-500 text-xs' }, '\u2715'))),
                    React.createElement('button', { onClick:()=>upd(q.id,{options:q.options.concat('New option')}),
                      className:'text-[11px] text-indigo-600 hover:underline' }, '+ Add option'))));
            })),
          React.createElement('div', { className:'mt-3 pt-3 border-t border-slate-100' },
            React.createElement('p', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5' }, 'Add a question'),
            React.createElement('div', { className:'flex gap-1.5 flex-wrap' },
              SURVEY_QUESTION_TYPES.map(x=>React.createElement('button', { key:x.id, onClick:()=>add(x.id),
                className:'px-2 py-1 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-600 hover:border-indigo-300 hover:text-indigo-600' },
                x.icon + ' ' + x.label)))))),

      React.createElement(Card, { className:'p-4' },
        React.createElement(CxLabel, null, 'Live preview'),
        React.createElement('div', { className:'border border-slate-200 rounded-xl p-4 bg-white' },
          React.createElement('p', { className:'text-sm font-bold text-slate-900 mb-3' }, title),
          React.createElement('div', { className:'space-y-4' },
            qs.map(q=>React.createElement('div', { key:q.id },
              React.createElement('p', { className:'text-xs text-slate-700 mb-1.5' }, q.title,
                q.required && React.createElement('span',{className:'text-red-500'},' *')),
              preview(q)))),
          React.createElement('button', { className:'mt-4 w-full bg-indigo-600 text-white rounded-lg py-2 text-xs font-semibold' }, 'Submit'),
          React.createElement('p', { className:'text-[10px] text-slate-400 mt-2 text-center' }, thanks)),
        React.createElement(Btn, { variant:'primary', size:'xs', className:'mt-3 w-full justify-center',
          onClick:()=>dispatch({type:'ADD_TOAST',msg:'Survey published \u2014 sends ' + trigger.toLowerCase(),toastType:'success'}) }, 'Publish survey'))
    )
  );
}

// ── 3. NPS builder: in-app widget or canned form ──
function NpsBuilder({ dispatch }){
  const [mode, setMode] = useState('widget');
  const [question, setQuestion] = useState('How likely are you to recommend us to a colleague?');
  const [followUp, setFollowUp] = useState('What is the main reason for your score?');
  const [segment, setSegment] = useState(NPS_SEGMENTS[0]);
  const [frequency, setFrequency] = useState('90');
  const [position, setPosition] = useState('bottom-right');

  const scale = React.createElement('div', { className:'flex gap-0.5 flex-wrap' },
    Array.from({length:11},(_,n)=>React.createElement('span',{ key:n,
      className:`w-6 h-6 rounded border flex items-center justify-center text-[10px] font-semibold ${n<7?'border-red-200 text-red-500':n<9?'border-amber-200 text-amber-600':'border-green-200 text-green-600'}` }, n)));

  return React.createElement('div', { className:'space-y-4' },
    React.createElement('div', { className:'flex gap-0.5 bg-slate-100 rounded-lg p-0.5 w-fit' },
      [['widget','\u{1F5A5} In-app widget'],['form','\u2709 Canned form']].map(m =>
        React.createElement('button', { key:m[0], onClick:()=>setMode(m[0]),
          className:`px-3 py-1.5 text-xs rounded-md transition-colors ${mode===m[0]?'bg-white text-slate-900 shadow-sm font-semibold':'text-slate-500'}` }, m[1]))),

    React.createElement('div', { className:'grid grid-cols-3 gap-4 items-start' },
      React.createElement('div', { className:'col-span-2 space-y-3' },
        React.createElement(Card, { className:'p-4' },
          React.createElement(CxLabel, null, 'Questions'),
          React.createElement('label', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider' }, 'NPS question'),
          React.createElement('input', { value:question, onChange:e=>setQuestion(e.target.value),
            className:'w-full mt-1 mb-3 text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400' }),
          React.createElement('label', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider' }, 'Follow-up (shown after a score)'),
          React.createElement('input', { value:followUp, onChange:e=>setFollowUp(e.target.value),
            className:'w-full mt-1 text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400' })),

        React.createElement(Card, { className:'p-4' },
          React.createElement(CxLabel, null, mode === 'widget' ? 'Targeting & display' : 'Delivery'),
          React.createElement('div', { className:'grid grid-cols-2 gap-3' },
            React.createElement('div', null,
              React.createElement('label', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider' }, 'Audience'),
              React.createElement('select', { value:segment, onChange:e=>setSegment(e.target.value), className:'w-full mt-1 ' + SG_INP },
                NPS_SEGMENTS.map(o=>React.createElement('option',{key:o},o)))),
            React.createElement('div', null,
              React.createElement('label', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider' }, 'Re-prompt after'),
              React.createElement('select', { value:frequency, onChange:e=>setFrequency(e.target.value), className:'w-full mt-1 ' + SG_INP },
                ['30','60','90','180','365'].map(o=>React.createElement('option',{key:o,value:o},o + ' days')))),
            mode === 'widget' && React.createElement('div', null,
              React.createElement('label', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider' }, 'Position'),
              React.createElement('select', { value:position, onChange:e=>setPosition(e.target.value), className:'w-full mt-1 ' + SG_INP },
                ['bottom-right','bottom-left','centre modal','top banner'].map(o=>React.createElement('option',{key:o},o)))),
            mode === 'form' && React.createElement('div', null,
              React.createElement('label', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider' }, 'Send via'),
              React.createElement('select', { className:'w-full mt-1 ' + SG_INP },
                ['Email','In-product message','Shareable link'].map(o=>React.createElement('option',{key:o},o)))))),

        mode === 'widget'
          ? React.createElement(Card, { className:'p-4' },
              React.createElement(SgCode, { code:NPS_SNIPPET, dispatch, label:'Widget code \u2014 paste into your app shell' }),
              React.createElement('p', { className:'text-[11px] text-slate-500 mt-2' },
                'The widget respects the re-prompt window per user, so a customer is never asked twice inside ' + frequency + ' days.'))
          : React.createElement(Card, { className:'p-4' },
              React.createElement(CxLabel, null, 'Shareable form'),
              React.createElement('div', { className:'flex gap-2 items-center' },
                React.createElement('input', { readOnly:true, value:'https://cx-42.com/s/nps/q3-2025', className:'flex-1 ' + SG_INP + ' font-mono' }),
                React.createElement(Btn, { variant:'secondary', size:'xs', onClick:()=>dispatch({type:'ADD_TOAST',msg:'Form link copied',toastType:'success'}) }, 'Copy link')),
              React.createElement('div', { className:'flex gap-2 mt-3' },
                React.createElement(Btn, { variant:'primary', size:'xs', onClick:()=>dispatch({type:'ADD_TOAST',msg:'NPS form queued to ' + segment.toLowerCase(),toastType:'success'}) }, 'Send now'),
                React.createElement(Btn, { variant:'secondary', size:'xs', onClick:()=>dispatch({type:'ADD_TOAST',msg:'Send scheduled',toastType:'info'}) }, 'Schedule')))
      ),

      React.createElement(Card, { className:'p-4' },
        React.createElement(CxLabel, null, mode==='widget' ? 'Widget preview' : 'Form preview'),
        React.createElement('div', { className:`border border-slate-200 rounded-xl p-3 bg-white ${mode==='widget'?'shadow-lg':''}` },
          React.createElement('p', { className:'text-xs font-semibold text-slate-800 mb-2' }, question),
          scale,
          React.createElement('div', { className:'flex justify-between text-[9px] text-slate-400 mt-1' },
            React.createElement('span', null, 'Not likely'), React.createElement('span', null, 'Very likely')),
          React.createElement('p', { className:'text-[11px] text-slate-600 mt-3' }, followUp),
          React.createElement('div', { className:'border border-slate-200 rounded-lg h-10 bg-slate-50 mt-1' }),
          React.createElement('button', { className:'mt-3 w-full bg-indigo-600 text-white rounded-lg py-1.5 text-xs font-semibold' }, 'Submit')),
        React.createElement('p', { className:'text-[10px] text-slate-400 mt-2' },
          mode==='widget' ? 'Appears ' + position + ' to ' + segment.toLowerCase() : 'Sent to ' + segment.toLowerCase()))
    )
  );
}

// ── 4. Conversations: read transcripts from file ──
function ConversationsBuilder({ dispatch }){
  const [parser, setParser] = useState('vtt');
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState([
    { id:'f1', name:'acme-weekly-sync-aug14.vtt', size:'42 KB', lines:186, status:'parsed',  matched:'Acme Analytics' },
    { id:'f2', name:'globex-renewal-call.srt',    size:'31 KB', lines:142, status:'parsed',  matched:'Globex Cloud' },
    { id:'f3', name:'unknown-call-0812.txt',      size:'18 KB', lines:74,  status:'unmatched', matched:null },
  ]);
  const drop = () => { const n=files.length+1;
    setFiles(l=>[{ id:'f_new'+n, name:'transcript-'+n+'.vtt', size:'26 KB', lines:96, status:'parsed', matched:'Acme Analytics' }].concat(l));
    dispatch({ type:'ADD_TOAST', msg:'Transcript parsed and attached to the account timeline', toastType:'success' }); };

  return React.createElement('div', { className:'space-y-4' },
    React.createElement(Card, { className:'p-4' },
      React.createElement(CxLabel, null, 'Read transcripts from a file'),
      React.createElement('div', { className:'grid grid-cols-4 gap-2 mb-3' },
        CONVO_PARSERS.map(p => React.createElement('button', { key:p.id, onClick:()=>setParser(p.id),
          className:`text-left rounded-lg border p-2.5 transition-colors ${parser===p.id?'border-indigo-400 bg-indigo-50/60':'border-slate-200 hover:border-slate-300'}` },
          React.createElement('p', { className:'text-xs font-semibold text-slate-800' }, p.label),
          React.createElement('p', { className:'text-[10px] text-slate-500 mt-0.5 leading-snug' }, p.note)))),
      React.createElement('div', {
          onDragOver:e=>{ e.preventDefault(); setDragOver(true); }, onDragLeave:()=>setDragOver(false),
          onDrop:e=>{ e.preventDefault(); setDragOver(false); drop(); }, onClick:drop,
          className:`border-2 border-dashed rounded-xl p-7 text-center cursor-pointer transition-colors ${dragOver?'border-indigo-400 bg-indigo-50':'border-slate-200 hover:border-indigo-300'}` },
        React.createElement('div', { className:'w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg mx-auto mb-2' }, '\u{1F4C4}'),
        React.createElement('p', { className:'text-sm font-semibold text-slate-800' }, 'Drop transcript files here'),
        React.createElement('p', { className:'text-[11px] text-slate-500 mt-1' }, 'Bulk upload supported \u00b7 accounts matched on attendee email domain'))),

    React.createElement(Card, { className:'p-4' },
      React.createElement(CxLabel, null, 'Field mapping'),
      React.createElement('div', { className:'space-y-1.5' },
        CONVO_MAPPING.map(m => React.createElement('div', { key:m.field, className:'flex items-center gap-3' },
          React.createElement('span', { className:'text-xs font-semibold text-slate-700 w-24 flex-shrink-0' }, m.field),
          React.createElement('span', { className:'text-slate-300 text-xs' }, '\u2190'),
          React.createElement('span', { className:'text-[11px] font-mono text-slate-500 flex-1' }, m.from))))),

    React.createElement(Card, { className:'overflow-hidden' },
      React.createElement('div', { className:'px-4 py-3 border-b border-slate-100' },
        React.createElement('p', { className:'text-sm font-semibold text-slate-900' }, 'Imported transcripts')),
      React.createElement('table', { className:'w-full text-sm' },
        React.createElement('thead', null, React.createElement('tr', { className:'bg-slate-50 border-b' },
          ['File','Size','Lines','Matched account','Status',''].map((h,i)=>
            React.createElement('th',{key:i,className:'px-4 py-2.5 text-left text-xs font-medium text-slate-500'},h)))),
        React.createElement('tbody', null,
          files.map(f => React.createElement('tr', { key:f.id, className:'border-b last:border-0 hover:bg-slate-50' },
            React.createElement('td', { className:'px-4 py-2.5 font-mono text-[11px] text-slate-700' }, f.name),
            React.createElement('td', { className:'px-4 py-2.5 text-xs text-slate-500' }, f.size),
            React.createElement('td', { className:'px-4 py-2.5 text-xs text-slate-600' }, f.lines),
            React.createElement('td', { className:'px-4 py-2.5 text-xs' },
              f.matched ? React.createElement('span',{className:'text-slate-700 font-medium'},f.matched)
                        : React.createElement('span',{className:'text-amber-600'},'Needs matching')),
            React.createElement('td', { className:'px-4 py-2.5' },
              React.createElement(CxPill, { tone: f.status==='parsed'?'green':'amber' }, f.status)),
            React.createElement('td', { className:'px-4 py-2.5 text-right' },
              !f.matched && React.createElement('button', { onClick:()=>{ setFiles(l=>l.map(x=>x.id===f.id?{...x,matched:'Acme Analytics',status:'parsed'}:x));
                dispatch({type:'ADD_TOAST',msg:'Transcript matched to an account',toastType:'success'}); },
                className:'text-xs text-indigo-600 hover:underline mr-3' }, 'Match'),
              React.createElement('button', { onClick:()=>setFiles(l=>l.filter(x=>x.id!==f.id)), className:'text-xs text-slate-400 hover:text-red-600' }, 'Remove')))))))
  );
}

// ── 5. Community builder / integration ──
function CommunityBuilder({ dispatch }){
  const [tab, setTab] = useState('spaces');
  const [spaces, setSpaces] = useState(COMMUNITY_SPACES);
  const [platforms, setPlatforms] = useState(COMMUNITY_PLATFORMS);

  return React.createElement('div', { className:'space-y-4' },
    React.createElement(Tabs, { tabs:[
      { id:'spaces',    label:'Spaces & categories' },
      { id:'moderation',label:'Moderation & signal' },
      { id:'connect',   label:'Platform' },
    ], active:tab, onChange:setTab }),

    tab === 'spaces' && React.createElement(Card, { className:'overflow-hidden' },
      React.createElement('div', { className:'px-4 py-3 border-b border-slate-100 flex items-center justify-between' },
        React.createElement('div', null,
          React.createElement('p', { className:'text-sm font-semibold text-slate-900' }, 'Community spaces'),
          React.createElement('p', { className:'text-[11px] text-slate-500 mt-0.5' }, 'Each space can feed the health signal at a different weight.')),
        React.createElement(Btn, { variant:'primary', size:'xs', onClick:()=>{ const n=spaces.length+1;
          setSpaces(l=>l.concat({ id:'cs_new'+n, name:'New space', posts:0, members:0, moderated:true, signal:'low' })); } }, '+ Add space')),
      React.createElement('table', { className:'w-full text-sm' },
        React.createElement('thead', null, React.createElement('tr', { className:'bg-slate-50 border-b' },
          ['Space','Posts','Members','Moderated','Signal weight',''].map((h,i)=>
            React.createElement('th',{key:i,className:'px-4 py-2.5 text-left text-xs font-medium text-slate-500'},h)))),
        React.createElement('tbody', null,
          spaces.map(sp => React.createElement('tr', { key:sp.id, className:'border-b last:border-0 hover:bg-slate-50' },
            React.createElement('td', { className:'px-4 py-2.5' },
              React.createElement('input', { value:sp.name, onChange:e=>setSpaces(l=>l.map(x=>x.id===sp.id?{...x,name:e.target.value}:x)), className:SG_INP + ' w-48' })),
            React.createElement('td', { className:'px-4 py-2.5 text-xs text-slate-600' }, sp.posts.toLocaleString()),
            React.createElement('td', { className:'px-4 py-2.5 text-xs text-slate-600' }, sp.members.toLocaleString()),
            React.createElement('td', { className:'px-4 py-2.5' },
              React.createElement(AdminToggle, { on:sp.moderated, onChange:v=>setSpaces(l=>l.map(x=>x.id===sp.id?{...x,moderated:v}:x)) })),
            React.createElement('td', { className:'px-4 py-2.5' },
              React.createElement('select', { value:sp.signal, onChange:e=>setSpaces(l=>l.map(x=>x.id===sp.id?{...x,signal:e.target.value}:x)), className:SG_INP },
                ['none','low','medium','high'].map(o=>React.createElement('option',{key:o},o)))),
            React.createElement('td', { className:'px-4 py-2.5 text-right' },
              React.createElement('button', { onClick:()=>setSpaces(l=>l.filter(x=>x.id!==sp.id)), className:'text-xs text-slate-400 hover:text-red-600' }, 'Remove')))))
      )),

    tab === 'moderation' && React.createElement(Card, { className:'p-4' },
      React.createElement(CxLabel, null, 'What community activity feeds into health'),
      React.createElement('div', null,
        [['Unanswered post older than 48 hours lowers health', true],
         ['Negative sentiment on a post raises a risk signal', true],
         ['Feature request volume feeds the expansion signal', true],
         ['Upvotes count toward engagement', false],
         ['Auto-flag posts containing competitor names', true],
         ['Match members to accounts by email domain', true]].map(r =>
          React.createElement('div', { key:r[0], className:'flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0' },
            React.createElement('span', { className:'text-sm text-slate-700' }, r[0]),
            React.createElement(AdminToggle, { on:r[1], onChange:()=>{}, label:r[1]?'On':'Off' }))))),

    tab === 'connect' && React.createElement('div', { className:'grid grid-cols-2 gap-3' },
      platforms.map(p => React.createElement(Card, { key:p.id, className:'p-4' },
        React.createElement('div', { className:'flex items-start gap-3' },
          React.createElement('span', { className:'w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-sm flex-shrink-0' }, '\u{1F465}'),
          React.createElement('div', { className:'flex-1 min-w-0' },
            React.createElement('div', { className:'flex items-center gap-2 flex-wrap' },
              React.createElement('p', { className:'text-sm font-semibold text-slate-900' }, p.name),
              React.createElement(CxPill, { tone:p.connected?'green':'slate' }, p.connected?'Active':'Available')),
            React.createElement('p', { className:'text-[11px] text-slate-500 mt-1 leading-relaxed' }, p.note)),
          React.createElement(Btn, { variant:p.connected?'secondary':'primary', size:'xs',
            onClick:()=>{ setPlatforms(l=>l.map(x=>x.id===p.id?{...x,connected:!x.connected}:x));
              dispatch({type:'ADD_TOAST',msg:p.connected?p.name+' disconnected':p.name+' connected',toastType:'info'}); } },
            p.connected?'Disconnect':'Connect')))))
  );
}

// ── 6. Sentiment, 7. LinkedIn, 8. Support hygiene ──
function SentimentBuilder({ dispatch }){
  const [thresholds, setThresholds] = useState({ neg:-0.3, pos:0.3 });
  const [lexicon, setLexicon] = useState(['unacceptable','escalate','cancel','refund','frustrated','disappointed']);
  const [word, setWord] = useState('');
  return React.createElement('div', { className:'space-y-4' },
    React.createElement(Card, { className:'p-4' },
      React.createElement(CxLabel, null, 'What gets scored'),
      React.createElement('div', null,
        [['Inbound email replies', true],['Ticket conversations', true],['Meeting transcripts', true],
         ['Community posts', true],['Survey verbatims', false]].map(r =>
          React.createElement('div', { key:r[0], className:'flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0' },
            React.createElement('span', { className:'text-sm text-slate-700' }, r[0]),
            React.createElement(AdminToggle, { on:r[1], onChange:()=>{}, label:r[1]?'On':'Off' }))))),
    React.createElement(Card, { className:'p-4' },
      React.createElement(CxLabel, null, 'Score thresholds'),
      React.createElement('p', { className:'text-xs text-slate-500 mb-3' }, 'Scores run from \u22121 to +1. Anything between the two thresholds is treated as neutral.'),
      React.createElement('div', { className:'grid grid-cols-2 gap-4' },
        [['Negative below','neg','red'],['Positive above','pos','green']].map(x =>
          React.createElement('div', { key:x[1] },
            React.createElement('label', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider' }, x[0]),
            React.createElement('div', { className:'flex items-center gap-2 mt-1' },
              React.createElement('input', { type:'range', min:-1, max:1, step:0.05, value:thresholds[x[1]],
                onChange:e=>setThresholds(t=>({...t,[x[1]]:Number(e.target.value)})), className:'flex-1 accent-indigo-600' }),
              React.createElement('span', { className:`text-sm font-bold w-12 text-right ${x[2]==='red'?'text-red-600':'text-green-600'}` }, thresholds[x[1]].toFixed(2))))))),
    React.createElement(Card, { className:'p-4' },
      React.createElement(CxLabel, null, 'Escalation lexicon'),
      React.createElement('p', { className:'text-xs text-slate-500 mb-2' }, 'Any message containing these terms is scored negative regardless of the model output.'),
      React.createElement('div', { className:'flex gap-1.5 flex-wrap mb-2' },
        lexicon.map(w=>React.createElement('span', { key:w, className:'inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 text-red-700 text-[11px] font-semibold' },
          w, React.createElement('button', { onClick:()=>setLexicon(l=>l.filter(x=>x!==w)), className:'text-red-300 hover:text-red-600' }, '\u2715')))),
      React.createElement('div', { className:'flex gap-2' },
        React.createElement('input', { value:word, onChange:e=>setWord(e.target.value), placeholder:'Add a term\u2026',
          onKeyDown:e=>{ if(e.key==='Enter' && word.trim()){ setLexicon(l=>l.concat(word.trim())); setWord(''); } }, className:SG_INP + ' flex-1' }),
        React.createElement(Btn, { variant:'secondary', size:'xs', disabled:!word.trim(),
          onClick:()=>{ setLexicon(l=>l.concat(word.trim())); setWord(''); } }, 'Add'))));
}

function LinkedInBuilder({ dispatch }){
  const [cadence, setCadence] = useState('Daily');
  return React.createElement('div', { className:'space-y-4' },
    React.createElement(Card, { className:'p-4 bg-amber-50/50 border-amber-100' },
      React.createElement('p', { className:'text-sm text-slate-700 leading-relaxed' },
        React.createElement('span',{className:'font-semibold'},'Not connected. '),
        'LinkedIn has no public API for job-change monitoring, so this signal runs through an enrichment provider rather than LinkedIn directly. Connect one below.')),
    React.createElement(Card, { className:'p-4' },
      React.createElement(CxLabel, null, 'Enrichment provider'),
      React.createElement('div', { className:'grid grid-cols-3 gap-3' },
        [['Clearbit','Contact enrichment and job-change webhooks'],
         ['Apollo.io','Contact database with change alerts'],
         ['UserGems','Purpose-built job-change tracking']].map(p =>
          React.createElement('button', { key:p[0], onClick:()=>dispatch({type:'ADD_TOAST',msg:'Connecting ' + p[0],toastType:'info'}),
            className:'text-left border border-slate-200 rounded-xl p-3 hover:border-indigo-300 hover:shadow-sm transition-all' },
            React.createElement('p', { className:'text-sm font-semibold text-slate-800' }, p[0]),
            React.createElement('p', { className:'text-[11px] text-slate-500 mt-0.5 leading-relaxed' }, p[1]))))),
    React.createElement(Card, { className:'p-4' },
      React.createElement(CxLabel, null, 'What to monitor'),
      React.createElement('div', null,
        [['Champion leaves the company', true],['Decision maker changes role', true],
         ['New executive joins a target account', false],['Company headcount shifts', false],
         ['Enrich newly created contacts automatically', true]].map(r =>
          React.createElement('div', { key:r[0], className:'flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0' },
            React.createElement('span', { className:'text-sm text-slate-700' }, r[0]),
            React.createElement(AdminToggle, { on:r[1], onChange:()=>{}, label:r[1]?'On':'Off' })))),
      React.createElement('div', { className:'mt-3 pt-3 border-t border-slate-100 flex items-center gap-3' },
        React.createElement('span', { className:'text-xs text-slate-500' }, 'Check cadence'),
        React.createElement('select', { value:cadence, onChange:e=>setCadence(e.target.value), className:SG_INP },
          ['Hourly','Daily','Weekly'].map(o=>React.createElement('option',{key:o},o))))));
}

function HygieneBuilder({ dispatch }){
  const [rules, setRules] = useState(HYGIENE_RULES);
  const total = rules.reduce((n,r)=>n+r.weight,0);
  const score = Math.round(rules.filter(r=>r.healthy).reduce((n,r)=>n+r.weight,0));
  return React.createElement('div', { className:'space-y-4' },
    React.createElement('div', { className:'grid grid-cols-3 gap-4' },
      React.createElement(MetricCard, { label:'Hygiene score', value:score + '/100', sub: score>=80?'Healthy':'Needs attention', subColor: score>=80?'text-green-600':'text-amber-600' }),
      React.createElement(MetricCard, { label:'Rules passing', value:rules.filter(r=>r.healthy).length + '/' + rules.length, sub:'against target' }),
      React.createElement(MetricCard, { label:'Weight allocated', value:total + '/100', sub: total===100?'balanced':'must total 100', subColor: total===100?'text-slate-500':'text-red-600' })),
    React.createElement(Card, { className:'overflow-hidden' },
      React.createElement('div', { className:'px-4 py-3 border-b border-slate-100' },
        React.createElement('p', { className:'text-sm font-semibold text-slate-900' }, 'Hygiene rules'),
        React.createElement('p', { className:'text-[11px] text-slate-500 mt-0.5' }, 'Weighted checks on how support work is being handled. The weights must total 100.')),
      React.createElement('table', { className:'w-full text-sm' },
        React.createElement('thead', null, React.createElement('tr', { className:'bg-slate-50 border-b' },
          ['Rule','Target','Current','Weight','Status'].map((h,i)=>
            React.createElement('th',{key:i,className:'px-4 py-2.5 text-left text-xs font-medium text-slate-500'},h)))),
        React.createElement('tbody', null,
          rules.map(r => React.createElement('tr', { key:r.id, className:'border-b last:border-0 hover:bg-slate-50' },
            React.createElement('td', { className:'px-4 py-2.5 font-medium text-slate-800' }, r.name),
            React.createElement('td', { className:'px-4 py-2.5 text-xs text-slate-600' }, r.target),
            React.createElement('td', { className:'px-4 py-2.5' },
              React.createElement('span', { className:`text-xs font-bold ${r.healthy?'text-green-600':'text-amber-600'}` }, r.current)),
            React.createElement('td', { className:'px-4 py-2.5' },
              React.createElement('div', { className:'flex items-center gap-2' },
                React.createElement('input', { type:'range', min:0, max:40, value:r.weight,
                  onChange:e=>setRules(l=>l.map(x=>x.id===r.id?{...x,weight:Number(e.target.value)}:x)), className:'w-20 accent-indigo-600' }),
                React.createElement('span', { className:'text-xs font-semibold text-slate-700 w-7' }, r.weight))),
            React.createElement('td', { className:'px-4 py-2.5' },
              React.createElement(CxPill, { tone:r.healthy?'green':'amber' }, r.healthy?'Passing':'Below target')))))
      )));
}

// Each signal category gets its own purpose-built configuration screen
const SIGNAL_BUILDERS = {
  usage:     { label:'Listener & event tagging',   comp:'UsageBuilder' },
  sentiment: { label:'Scoring & lexicon',          comp:'SentimentBuilder' },
  convos:    { label:'Transcript import',          comp:'ConversationsBuilder' },
  community: { label:'Community builder',          comp:'CommunityBuilder' },
  linkedin:  { label:'Contact monitoring',         comp:'LinkedInBuilder' },
  csat:      { label:'Survey builder',             comp:'CsatSurveyBuilder' },
  nps:       { label:'NPS builder',                comp:'NpsBuilder' },
  hygiene:   { label:'Hygiene rules',              comp:'HygieneBuilder' },
};
function renderSignalBuilder(id, dispatch){
  if (id === 'usage')     return React.createElement(UsageBuilder, { dispatch });
  if (id === 'sentiment') return React.createElement(SentimentBuilder, { dispatch });
  if (id === 'convos')    return React.createElement(ConversationsBuilder, { dispatch });
  if (id === 'community') return React.createElement(CommunityBuilder, { dispatch });
  if (id === 'linkedin')  return React.createElement(LinkedInBuilder, { dispatch });
  if (id === 'csat')      return React.createElement(CsatBuilder, { dispatch });
  if (id === 'nps')       return React.createElement(NpsBuilder, { dispatch });
  if (id === 'hygiene')   return React.createElement(HygieneBuilder, { dispatch });
  return null;
}

function SignalsAdmin({ onBack, dispatch }){
  const [sig, setSig] = useState(null);
  const [view, setView] = useState('builder');
  const s = SIGNAL_SOURCES.find(x=>x.id===sig);
  const [settings, setSettings] = useState({});

  const statusPill = st => st==='active' ? React.createElement(CxPill,{tone:'green'},'\u25CF Active')
                        : st==='attention' ? React.createElement(CxPill,{tone:'amber'},'\u26A0 Needs attention')
                        : React.createElement(CxPill,{tone:'slate'},'\u25CB Inactive');

  if (!sig) {
    return React.createElement('div', { className:'space-y-4' },
      React.createElement(AdminCrumb, { trail:['Admin','Signals'], onNavigate:()=>onBack() }),
      React.createElement('p', { className:'text-sm text-slate-500' }, 'Signal sources feed the health engine and trigger conditions. Each source can be tuned independently.'),
      React.createElement('div', { className:'grid grid-cols-3 gap-4' },
        SIGNAL_SOURCES.map(x => React.createElement(AdminTile, {
          key:x.id, icon:x.icon, title:x.label, desc:x.desc, tone:x.tone,
          onClick:()=>setSig(x.id),
          meta:[ statusPill(x.status),
                 React.createElement(CxPill,{key:'f',tone:'slate'}, x.freq),
                 React.createElement(CxPill,{key:'c',tone: x.coverage>80?'green':x.coverage>50?'amber':'red'}, x.coverage + '% coverage') ]
        }))
      )
    );
  }

  return React.createElement('div', { className:'space-y-4' },
    React.createElement(AdminCrumb, {
      trail:['Admin','Signals', s.label],
      onNavigate:(i)=>{ if(i===0) onBack(); else setSig(null); },
      actions: React.createElement('div', { className:'flex gap-2 items-center' },
        statusPill(s.status),
        React.createElement(Btn, { variant: s.status==='inactive'?'primary':'secondary', size:'xs', onClick:()=>dispatch && dispatch({type:'ADD_TOAST',msg:(s.status==='inactive'?'Connecting ':'Re-syncing ')+s.label,toastType:'info'}) },
          s.status==='inactive' ? 'Connect source' : 'Re-sync now')
      )
    }),
    React.createElement('div', { className:'grid grid-cols-3 gap-4' },
      s.metrics.map(m => React.createElement(Card, { key:m[0], className:'p-4' },
        React.createElement('p', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider' }, m[0]),
        React.createElement('p', { className:'text-xl font-bold text-slate-900 mt-1' }, m[1])
      ))
    ),

    React.createElement(Tabs, { tabs:[
      { id:'builder',  label:(SIGNAL_BUILDERS[s.id]||{}).label || 'Builder' },
      { id:'settings', label:'Settings & source' },
    ], active:view, onChange:setView }),

    view === 'builder' && renderSignalBuilder(s.id, dispatch),

    view === 'settings' && React.createElement('div', { className:'grid grid-cols-3 gap-4 items-start' },
      React.createElement(Card, { className:'p-4 col-span-2' },
        React.createElement(CxLabel, null, 'Configuration'),
        React.createElement('div', { className:'space-y-0' },
          s.settings.map(st => {
            const key = s.id + ':' + st[0];
            const on = settings[key] !== undefined ? settings[key] : st[1];
            return React.createElement('div', { key:st[0], className:'flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0' },
              React.createElement('span', { className:'text-sm text-slate-700' }, st[0]),
              React.createElement(AdminToggle, { on, onChange:v=>setSettings(o=>({...o,[key]:v})), label:on?'On':'Off' })
            );
          })
        )
      ),
      React.createElement(Card, { className:'p-4' },
        React.createElement(CxLabel, null, 'Source detail'),
        React.createElement('div', { className:'space-y-2' },
          [['Source', s.source],['Frequency', s.freq],['Coverage', s.coverage + '% of accounts']].map(r =>
            React.createElement('div', { key:r[0], className:'flex items-center justify-between gap-3' },
              React.createElement('span', { className:'text-xs text-slate-500' }, r[0]),
              React.createElement('span', { className:'text-xs font-semibold text-slate-800' }, r[1])
            )),
          React.createElement('div', { className:'pt-2' },
            React.createElement('div', { className:'h-1.5 bg-slate-100 rounded-full' },
              React.createElement('div', { className:`h-1.5 rounded-full ${s.coverage>80?'bg-green-500':s.coverage>50?'bg-amber-500':'bg-red-500'}`, style:{ width:s.coverage+'%' } }))
          ),
          React.createElement('p', { className:'text-xs text-slate-500 leading-relaxed pt-2 border-t border-slate-100 mt-2' }, s.desc)
        )
      )
    )
  );
}

// ============================================================
// ADMIN — CX42 DRIVE
// ============================================================
function DriveAdmin({ onBack, dispatch }){
  const [kind, setKind] = useState('all');
  const [dragOver, setDragOver] = useState(false);
  const [uploads, setUploads] = useState([]);

  const all = uploads.concat(DRIVE_TEMPLATES);
  const shown = kind === 'all' ? all : all.filter(t=>t.kind===kind);
  const kinds = [['all','All templates'],['QBR','QBR'],['Goal','Goal'],['SOP','SOP']];
  const fmtTone = f => f==='PPTX' ? 'amber' : f==='DOCX' ? 'blue' : f==='XLSX' ? 'green' : 'slate';

  const simulateUpload = () => {
    const n = uploads.length + 1;
    setUploads(u => [{ id:'up'+n, name:'Untitled template ' + n, kind:'QBR', fmt:'PPTX', size:'1.0 MB', owner:'Maya Chen', updated:'Just now', uses:0, status:'draft' }, ...u]);
    dispatch && dispatch({ type:'ADD_TOAST', msg:'Template uploaded to CX42 Drive', toastType:'success' });
  };

  return React.createElement('div', { className:'space-y-4' },
    React.createElement(AdminCrumb, {
      trail:['Admin','CX42 Drive'], onNavigate:()=>onBack(),
      actions: React.createElement(Btn, { variant:'primary', size:'xs', onClick:simulateUpload }, '\u2191 Upload template')
    }),

    // Upload dropzone
    React.createElement('div', {
      onDragOver:e=>{ e.preventDefault(); setDragOver(true); },
      onDragLeave:()=>setDragOver(false),
      onDrop:e=>{ e.preventDefault(); setDragOver(false); simulateUpload(); },
      onClick:simulateUpload,
      className:`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${dragOver ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 bg-white hover:border-indigo-300'}`
    },
      React.createElement('div', { className:'w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl mx-auto mb-3' }, '\u2191'),
      React.createElement('p', { className:'text-sm font-semibold text-slate-800' }, 'Drop QBR, Goal or SOP files here'),
      React.createElement('p', { className:'text-xs text-slate-500 mt-1' }, 'PPTX, DOCX, XLSX or PDF \u00b7 up to 25 MB \u00b7 versioned automatically'),
      React.createElement('div', { className:'flex justify-center gap-2 mt-3' },
        ['QBR deck','Goal template','SOP'].map(t=>React.createElement(CxPill,{key:t,tone:'slate'},t)))
    ),

    React.createElement('div', { className:'flex gap-1.5 flex-wrap' },
      kinds.map(k => React.createElement('button', {
        key:k[0], onClick:()=>setKind(k[0]),
        className:`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${kind===k[0]?'bg-slate-900 text-white border-slate-900':'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`
      }, k[1] + (k[0]==='all' ? ' \u00b7 ' + all.length : ' \u00b7 ' + all.filter(t=>t.kind===k[0]).length)))
    ),

    React.createElement(Card, { className:'overflow-hidden' },
      React.createElement('table', { className:'w-full text-sm' },
        React.createElement('thead', null, React.createElement('tr', { className:'bg-slate-50 border-b' },
          ['Template','Type','Format','Size','Owner','Updated','Used','Status',''].map((h,i)=>React.createElement('th',{key:i,className:'px-4 py-3 text-left text-xs font-medium text-slate-500'},h))
        )),
        React.createElement('tbody', null,
          shown.map(t => React.createElement('tr', { key:t.id, className:'border-b last:border-0 hover:bg-slate-50' },
            React.createElement('td', { className:'px-4 py-2.5 font-medium text-slate-900' }, t.name),
            React.createElement('td', { className:'px-4 py-2.5' }, React.createElement(CxPill, { tone: t.kind==='QBR'?'blue':t.kind==='Goal'?'green':'purple' }, t.kind)),
            React.createElement('td', { className:'px-4 py-2.5' }, React.createElement(CxPill, { tone:fmtTone(t.fmt) }, t.fmt)),
            React.createElement('td', { className:'px-4 py-2.5 text-xs text-slate-500' }, t.size),
            React.createElement('td', { className:'px-4 py-2.5 text-xs text-slate-600' }, t.owner),
            React.createElement('td', { className:'px-4 py-2.5 text-xs text-slate-500' }, t.updated),
            React.createElement('td', { className:'px-4 py-2.5 text-xs font-semibold text-slate-700' }, t.uses + '\u00d7'),
            React.createElement('td', { className:'px-4 py-2.5' }, React.createElement(CxPill, { tone: t.status==='published'?'green':'amber' }, t.status)),
            React.createElement('td', { className:'px-4 py-2.5 text-right whitespace-nowrap' },
              React.createElement('button', { onClick:()=>dispatch && dispatch({type:'ADD_TOAST',msg:'Downloading '+t.name,toastType:'info'}), className:'text-xs text-indigo-600 hover:underline mr-3' }, 'Download'),
              React.createElement('button', { onClick:()=>dispatch && dispatch({type:'ADD_TOAST',msg:'Opening version history',toastType:'info'}), className:'text-xs text-slate-400 hover:text-slate-700' }, 'Versions')
            )
          ))
        )
      )
    )
  );
}

// ============================================================
// ADMIN — TRIGGERS (trigger builder)
// ============================================================
// ============================================================
// ============================================================
// ============================================================
// ADMIN — HUB
// ============================================================

// ============================================================
// ADMIN — SLA CONFIGURATION
// ============================================================
const SLA_PRIORITIES = [
  { id:'p1', label:'P1 \u2014 Critical', tone:'red',   respond:'15 minutes', resolve:'4 hours',   clock:'24\u00d77',           breach:12, met:88 },
  { id:'p2', label:'P2 \u2014 High',     tone:'amber', respond:'1 hour',     resolve:'8 hours',   clock:'24\u00d77',           breach:7,  met:93 },
  { id:'p3', label:'P3 \u2014 Normal',   tone:'blue',  respond:'4 hours',    resolve:'2 business days', clock:'Business hours', breach:4, met:96 },
  { id:'p4', label:'P4 \u2014 Low',      tone:'slate', respond:'1 business day', resolve:'5 business days', clock:'Business hours', breach:1, met:99 },
];

const SLA_CALENDARS = [
  { id:'cal1', name:'Global 24\u00d77',        hours:'All hours',            tz:'UTC',              holidays:'None',            teams:'Tier 1 support' },
  { id:'cal2', name:'India business hours', hours:'09:00 \u2013 18:30',    tz:'Asia/Kolkata',     holidays:'India 2025 (12)', teams:'APAC CSM pod' },
  { id:'cal3', name:'US business hours',    hours:'08:00 \u2013 17:00',    tz:'America/New_York', holidays:'US 2025 (11)',    teams:'AMER CSM pod' },
  { id:'cal4', name:'EMEA business hours',  hours:'09:00 \u2013 17:30',    tz:'Europe/London',    holidays:'UK 2025 (8)',     teams:'EMEA CSM pod' },
];

const SLA_ESCALATIONS = [
  { at:'50% of target elapsed',  who:'Assigned agent',          how:'In-app + email' },
  { at:'75% of target elapsed',  who:'Team lead',               how:'Slack' },
  { at:'Target breached',        who:'Support manager + CSM',   how:'Slack + email' },
  { at:'2\u00d7 target elapsed', who:'Head of Support',         how:'Slack, email, SMS' },
];

const SLA_PAUSE_CONDITIONS = [
  ['Awaiting customer response', true],
  ['Pending third-party vendor', true],
  ['Scheduled maintenance window', false],
  ['Outside business hours (business-hours calendars only)', true],
  ['Ticket on hold by agent', false],
];

function SlaAdmin({ onBack, dispatch }){
  const [tab, setTab] = useState('targets');
  const [pri, setPri] = useState(null);
  const [pauses, setPauses] = useState({});
  const [applyTo, setApplyTo] = useState('All accounts');

  const inp = 'text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 outline-none focus:border-indigo-400';
  const p = SLA_PRIORITIES.find(x=>x.id===pri);

  // Drill-down: a single priority target
  if (p) {
    return React.createElement('div', { className:'space-y-4' },
      React.createElement(AdminCrumb, {
        trail:['Admin','SLA configuration', p.label],
        onNavigate:(i)=>{ if(i===0) onBack(); else setPri(null); },
        actions: React.createElement(Btn, { variant:'primary', size:'xs', onClick:()=>dispatch && dispatch({type:'ADD_TOAST',msg:'SLA target saved',toastType:'success'}) }, 'Save target')
      }),
      React.createElement('div', { className:'grid grid-cols-3 gap-4 items-start' },
        React.createElement(Card, { className:'p-4 col-span-2' },
          React.createElement(CxLabel, null, 'Targets'),
          React.createElement('div', { className:'grid grid-cols-2 gap-4' },
            [['First response target', p.respond],['Resolution target', p.resolve],
             ['Next-update cadence','2 hours'],['Operating clock', p.clock]].map(f =>
              React.createElement('div', { key:f[0] },
                React.createElement('label', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider' }, f[0]),
                React.createElement('input', { defaultValue:f[1], className:'w-full mt-1 ' + inp })
              ))
          ),
          React.createElement('div', { className:'mt-4 pt-4 border-t border-slate-100' },
            React.createElement(CxLabel, null, 'Applies to'),
            React.createElement('select', { value:applyTo, onChange:e=>setApplyTo(e.target.value), className:'w-full ' + inp },
              ['All accounts','Enterprise only','Strategic accounts only','Premium support plan','Mid-market and above'].map(o=>React.createElement('option',{key:o},o)))
          )
        ),
        React.createElement(Card, { className:'p-4' },
          React.createElement(CxLabel, null, 'Attainment \u00b7 last 30 days'),
          React.createElement('p', { className:`text-3xl font-bold ${p.met>=95?'text-green-600':p.met>=90?'text-amber-600':'text-red-600'}` }, p.met + '%'),
          React.createElement('p', { className:'text-[11px] text-slate-500 mt-0.5' }, 'Target met'),
          React.createElement('div', { className:'h-1.5 bg-slate-100 rounded-full mt-3' },
            React.createElement('div', { className:`h-1.5 rounded-full ${p.met>=95?'bg-green-500':p.met>=90?'bg-amber-500':'bg-red-500'}`, style:{width:p.met+'%'} })),
          React.createElement('div', { className:'flex items-center justify-between mt-3 pt-3 border-t border-slate-100' },
            React.createElement('span', { className:'text-xs text-slate-500' }, 'Breaches'),
            React.createElement('span', { className:'text-sm font-bold text-red-600' }, p.breach))
        )
      )
    );
  }

  return React.createElement('div', { className:'space-y-4' },
    React.createElement(AdminCrumb, {
      trail:['Admin','SLA configuration'], onNavigate:()=>onBack(),
      actions: React.createElement('div', { className:'flex gap-0.5 bg-slate-100 rounded-lg p-0.5' },
        [['targets','Targets'],['calendars','Business hours'],['escalation','Escalation'],['pause','Pause rules']].map(t=>
          React.createElement('button', { key:t[0], onClick:()=>setTab(t[0]),
            className:`px-2.5 py-1 text-xs rounded-md transition-colors ${tab===t[0]?'bg-white text-slate-900 shadow-sm font-semibold':'text-slate-500'}` }, t[1]))
      )
    }),

    tab === 'targets' && React.createElement('div', { className:'space-y-4' },
      React.createElement('p', { className:'text-sm text-slate-500' }, 'First response and resolution targets per priority. Click a row to edit its targets and scope.'),
      React.createElement(Card, { className:'overflow-hidden' },
        React.createElement('table', { className:'w-full text-sm' },
          React.createElement('thead', null, React.createElement('tr', { className:'bg-slate-50 border-b' },
            ['Priority','First response','Resolution','Clock',''].map((h,i)=>
              React.createElement('th',{key:i,className:'px-4 py-3 text-left text-xs font-medium text-slate-500'},h)))),
          React.createElement('tbody', null,
            SLA_PRIORITIES.map(x => React.createElement('tr', { key:x.id, className:'border-b last:border-0 hover:bg-slate-50 cursor-pointer', onClick:()=>setPri(x.id) },
              React.createElement('td', { className:'px-4 py-2.5' }, React.createElement(CxPill, { tone:x.tone }, x.label)),
              React.createElement('td', { className:'px-4 py-2.5 font-medium text-slate-800' }, x.respond),
              React.createElement('td', { className:'px-4 py-2.5 font-medium text-slate-800' }, x.resolve),
              React.createElement('td', { className:'px-4 py-2.5 text-xs text-slate-500' }, x.clock),
              React.createElement('td', { className:'px-4 py-2.5 text-right text-slate-300' }, '\u2192')
            )))
        )
      )
    ),

    tab === 'calendars' && React.createElement('div', { className:'space-y-4' },
      React.createElement('div', { className:'flex items-center justify-between' },
        React.createElement('p', { className:'text-sm text-slate-500' }, 'Business-hour calendars determine when the SLA clock runs.'),
        React.createElement(Btn, { variant:'primary', size:'xs', onClick:()=>dispatch && dispatch({type:'ADD_TOAST',msg:'New calendar',toastType:'info'}) }, '+ New calendar')),
      React.createElement('div', { className:'grid grid-cols-2 gap-4' },
        SLA_CALENDARS.map(c => React.createElement(Card, { key:c.id, className:'p-4' },
          React.createElement('div', { className:'flex items-start justify-between gap-3' },
            React.createElement('div', null,
              React.createElement('p', { className:'font-semibold text-slate-900 text-sm' }, c.name),
              React.createElement('p', { className:'text-xs text-slate-400 mt-0.5' }, c.tz)),
            React.createElement(CxPill, { tone: c.hours==='All hours'?'green':'blue' }, c.hours)),
          React.createElement('div', { className:'mt-3 pt-3 border-t border-slate-100 space-y-1.5' },
            [['Holidays', c.holidays],['Applied to', c.teams]].map(r =>
              React.createElement('div', { key:r[0], className:'flex items-center justify-between' },
                React.createElement('span', { className:'text-xs text-slate-500' }, r[0]),
                React.createElement('span', { className:'text-xs font-semibold text-slate-800' }, r[1]))))
        ))
      )
    ),

    tab === 'escalation' && React.createElement(Card, { className:'p-4' },
      React.createElement(CxLabel, { right: React.createElement(Btn, { variant:'secondary', size:'xs', onClick:()=>dispatch && dispatch({type:'ADD_TOAST',msg:'Escalation step added',toastType:'info'}) }, '+ Add step') }, 'Escalation ladder'),
      React.createElement('p', { className:'text-xs text-slate-500 mb-3' }, 'Who gets notified as a ticket approaches and passes its SLA target.'),
      React.createElement('div', { className:'space-y-2' },
        SLA_ESCALATIONS.map((e,i) => React.createElement('div', { key:i, className:'flex items-center gap-3 bg-slate-50 rounded-lg p-3' },
          React.createElement('span', { className:'w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[11px] font-bold text-slate-500 flex-shrink-0' }, i+1),
          React.createElement('div', { className:'flex-1 min-w-0' },
            React.createElement('p', { className:'text-sm font-semibold text-slate-800' }, e.at),
            React.createElement('p', { className:'text-xs text-slate-500 mt-0.5' }, 'Notify ' + e.who)),
          React.createElement(CxPill, { tone: i===3?'red':i===2?'amber':'slate' }, e.how)
        ))
      )
    ),

    tab === 'pause' && React.createElement(Card, { className:'p-4' },
      React.createElement(CxLabel, null, 'Pause the SLA clock when\u2026'),
      React.createElement('p', { className:'text-xs text-slate-500 mb-3' }, 'Time spent in these states is excluded from SLA measurement.'),
      React.createElement('div', null,
        SLA_PAUSE_CONDITIONS.map(c => {
          const on = pauses[c[0]] !== undefined ? pauses[c[0]] : c[1];
          return React.createElement('div', { key:c[0], className:'flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0' },
            React.createElement('span', { className:'text-sm text-slate-700' }, c[0]),
            React.createElement(AdminToggle, { on, onChange:v=>setPauses(o=>({...o,[c[0]]:v})), label:on?'Paused':'Running' }));
        })
      )
    )
  );
}

// ============================================================
// ADMIN — ASSIGNMENT POLICIES
// ============================================================
const ASSIGNMENT_STRATEGIES = ['Skill based','Load balanced','Round robin'];

const ASSIGNMENT_RULES = {
  ticket: [
    { id:'at1', name:'Critical tickets \u2192 Tier 1 pod',   match:'Priority is P1 \u2014 Critical',        strategy:'Skill based',   target:'Tier 1 support', order:1, enabled:true,  handled:412 },
    { id:'at2', name:'Enterprise tickets \u2192 named agent', match:'Segment is Enterprise',              strategy:'Skill based', target:'Named support agent', order:2, enabled:true,  handled:288 },
    { id:'at3', name:'APAC hours \u2192 APAC pod',            match:'Created 00:00\u201308:00 UTC',        strategy:'Load balanced', target:'APAC pod', order:3, enabled:true,  handled:196 },
    { id:'at4', name:'Everything else \u2192 round robin',    match:'No other rule matched',              strategy:'Round robin',   target:'General support queue', order:4, enabled:true, handled:1104 },
    { id:'at5', name:'Billing keywords \u2192 Finance',       match:'Subject contains "invoice, billing"', strategy:'Skill based',  target:'Finance ops', order:5, enabled:false, handled:0 },
  ],
  company: [
    { id:'ac1', name:'Strategic accounts \u2192 senior CSM',  match:'Strategic account is true',          strategy:'Manual',        target:'Maya Chen, Amara Osei', order:1, enabled:true,  handled:6 },
    { id:'ac2', name:'Enterprise \u2192 enterprise pod',      match:'Segment is Enterprise',              strategy:'Load balanced', target:'Enterprise CSM pod', order:2, enabled:true,  handled:9 },
    { id:'ac3', name:'ARR above $150K \u2192 named CSM',      match:'ARR is above $150,000',              strategy:'Load balanced', target:'Senior CSM bench', order:3, enabled:true,  handled:11 },
    { id:'ac4', name:'India-based \u2192 APAC pod',           match:'Region is APAC',                      strategy:'Load balanced', target:'APAC CSM pod', order:4, enabled:true,  handled:4 },
    { id:'ac5', name:'New logos \u2192 onboarding pod',       match:'Account age is under 90 days',        strategy:'Round robin',   target:'Onboarding team', order:5, enabled:false, handled:0 },
  ],
};

const ASSIGNMENT_OBJECTS = [
  { id:'ticket',  label:'Ticket assignment',  icon:'\u{1F3AB}', tone:'red',  desc:'Route incoming support tickets to the right agent, pod or queue.' },
  { id:'company', label:'Company assignment', icon:'\u{1F3E2}', tone:'blue', desc:'Assign accounts to CSMs by segment, ARR, territory or workload.' },
];

function AssignmentAdmin({ onBack, dispatch }){
  const [rules, setRules] = useState(ASSIGNMENT_RULES);
  const [showNew, setShowNew] = useState(false);

    const inp = 'text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 outline-none focus:border-indigo-400';

  const toggleRule = (kind, id, v) =>
    setRules(r => ({ ...r, [kind]: r[kind].map(x => x.id===id ? {...x, enabled:v} : x) }));

  // Assignment applies to tickets only
  const list = rules.ticket;
  return React.createElement('div', { className:'space-y-4' },
    React.createElement(AdminCrumb, {
      trail:['Admin','Assignment policies'],
      onNavigate:()=>onBack(),
      actions: React.createElement(Btn, { variant:'primary', size:'xs', onClick:()=>setShowNew(true) }, '+ New rule')
    }),
    React.createElement('p', { className:'text-sm text-slate-500' }, 'Rules are evaluated top-down; the first match wins. Anything unmatched falls through to the default queue.'),
    React.createElement(Card, { className:'overflow-hidden' },
      React.createElement('table', { className:'w-full text-sm' },
        React.createElement('thead', null, React.createElement('tr', { className:'bg-slate-50 border-b' },
          ['#','Rule','Matches when','Strategy','Assign to','Active'].map((h,i)=>
            React.createElement('th',{key:i,className:'px-4 py-3 text-left text-xs font-medium text-slate-500'},h)))),
        React.createElement('tbody', null,
          list.map(r => React.createElement('tr', { key:r.id, className:`border-b last:border-0 hover:bg-slate-50 ${r.enabled?'':'opacity-50'}` },
            React.createElement('td', { className:'px-4 py-2.5 text-xs font-bold text-slate-400' }, r.order),
            React.createElement('td', { className:'px-4 py-2.5 font-medium text-slate-900' }, r.name),
            React.createElement('td', { className:'px-4 py-2.5 text-xs text-slate-500' }, r.match),
            React.createElement('td', { className:'px-4 py-2.5' },
              React.createElement('select', { value: ASSIGNMENT_STRATEGIES.includes(r.strategy) ? r.strategy : ASSIGNMENT_STRATEGIES[0],
                onChange:e=>setRules(x=>({ ...x, ticket: x.ticket.map(y=>y.id===r.id?{...y,strategy:e.target.value}:y) })),
                className:'text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-700 outline-none focus:border-indigo-400' },
                ASSIGNMENT_STRATEGIES.map(o=>React.createElement('option',{key:o,value:o},o)))),
            React.createElement('td', { className:'px-4 py-2.5 text-xs font-semibold text-slate-700' }, r.target),
            React.createElement('td', { className:'px-4 py-2.5' },
              React.createElement(AdminToggle, { on:r.enabled, onChange:v=>toggleRule('ticket', r.id, v) }))
          )))
      )
    ),
    React.createElement(Modal, { open:showNew, onClose:()=>setShowNew(false), title:'New ticket assignment rule' },
      React.createElement('div', { className:'space-y-3' },
        React.createElement('div', null,
          React.createElement('label', { className:'text-xs font-medium text-slate-500' }, 'Rule name'),
          React.createElement('input', { className:'w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400', placeholder:'e.g. EMEA enterprise \u2192 senior pod' })),
        React.createElement('div', { className:'grid grid-cols-2 gap-3' },
          React.createElement('div', null,
            React.createElement('label', { className:'text-xs font-medium text-slate-500' }, 'Strategy'),
            React.createElement('select', { className:'w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400' },
              ASSIGNMENT_STRATEGIES.map(x=>React.createElement('option',{key:x},x)))),
          React.createElement('div', null,
            React.createElement('label', { className:'text-xs font-medium text-slate-500' }, 'Assign to'),
            React.createElement('input', { className:'w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400', placeholder:'Team, pod or agent' }))),
        React.createElement('div', { className:'flex justify-end gap-2 pt-2' },
          React.createElement(Btn, { variant:'secondary', onClick:()=>setShowNew(false) }, 'Cancel'),
          React.createElement(Btn, { variant:'primary', onClick:()=>{ setShowNew(false); dispatch && dispatch({type:'ADD_TOAST',msg:'Assignment rule created',toastType:'success'}); } }, 'Create rule'))
      )
    )
  );
}

// ============================================================
// ADMIN — NOTIFICATIONS
// ============================================================
const NOTIFY_CHANNELS = [
  { id:'email', label:'Email',    icon:'\u2709',    tone:'blue',   status:'connected', detail:'notifications@cx42.io \u00b7 SendGrid',
    desc:'Transactional and digest email delivered to agents, CSMs and managers.',
    settings:[['Daily digest at 08:00',true],['Immediate for P1 breaches',true],['Include ticket body in email',false],['Weekly portfolio summary',true]],
    stats:[['Sent (30d)','12,480'],['Open rate','54%'],['Bounces','18']] },
  { id:'slack', label:'Slack',    icon:'\u{1F4AC}', tone:'purple', status:'connected', detail:'cx42-workspace \u00b7 6 channels mapped',
    desc:'Real-time alerts pushed into team channels and direct messages.',
    settings:[['Post to #cs-alerts',true],['DM the account owner',true],['Thread follow-up updates',true],['Mention @here on P1',false]],
    stats:[['Messages (30d)','3,204'],['Channels','6'],['Click-through','41%']] },
  { id:'teams', label:'MS Teams', icon:'\u{1F465}', tone:'teal',   status:'not_connected', detail:'Not connected',
    desc:'Adaptive-card notifications delivered to Teams channels and chats.',
    settings:[['Post to CS Alerts channel',false],['Chat the account owner',false],['Use adaptive cards',false],['Mention on breach',false]],
    stats:[['Messages (30d)','\u2014'],['Channels','0'],['Click-through','\u2014']] },
];

const NOTIFY_EVENTS = [
  { id:'ev1', label:'SLA breach imminent',       email:true,  slack:true,  teams:false, audience:'Agent, team lead' },
  { id:'ev2', label:'SLA breached',              email:true,  slack:true,  teams:false, audience:'Manager, CSM' },
  { id:'ev3', label:'Health band drops to red',  email:true,  slack:true,  teams:false, audience:'Account owner' },
  { id:'ev4', label:'Renewal within 30 days',    email:true,  slack:false, teams:false, audience:'Account owner, manager' },
  { id:'ev5', label:'Expansion signal detected', email:false, slack:true,  teams:false, audience:'Account owner, AE' },
  { id:'ev6', label:'Champion departure',        email:true,  slack:true,  teams:false, audience:'Account owner' },
  { id:'ev7', label:'New account assigned',      email:true,  slack:true,  teams:false, audience:'Assigned CSM' },
  { id:'ev8', label:'Goal overdue',              email:false, slack:true,  teams:false, audience:'Goal owner' },
];

function NotificationsAdmin({ onBack, dispatch }){
  const [chan, setChan] = useState(null);
  const [matrix, setMatrix] = useState(NOTIFY_EVENTS);
  const [settings, setSettings] = useState({});

  const c = NOTIFY_CHANNELS.find(x=>x.id===chan);
  const statusPill = st => st==='connected'
    ? React.createElement(CxPill,{tone:'green'},'\u25CF Connected')
    : React.createElement(CxPill,{tone:'slate'},'\u25CB Not connected');

  const toggleCell = (evId, ch) =>
    setMatrix(m => m.map(e => e.id===evId ? {...e, [ch]: !e[ch]} : e));

  if (c) {
    return React.createElement('div', { className:'space-y-4' },
      React.createElement(AdminCrumb, {
        trail:['Admin','Notifications', c.label],
        onNavigate:(i)=>{ if(i===0) onBack(); else setChan(null); },
        actions: React.createElement('div', { className:'flex items-center gap-2' }, statusPill(c.status),
          React.createElement(Btn, { variant: c.status==='connected'?'secondary':'primary', size:'xs',
            onClick:()=>dispatch && dispatch({type:'ADD_TOAST',msg:(c.status==='connected'?'Sending test to ':'Connecting ')+c.label,toastType:'info'}) },
            c.status==='connected' ? 'Send test' : 'Connect ' + c.label))
      }),
      React.createElement('div', { className:'grid grid-cols-3 gap-4' },
        c.stats.map(s => React.createElement(Card, { key:s[0], className:'p-4' },
          React.createElement('p', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider' }, s[0]),
          React.createElement('p', { className:'text-xl font-bold text-slate-900 mt-1' }, s[1])))
      ),
      React.createElement('div', { className:'grid grid-cols-3 gap-4 items-start' },
        React.createElement(Card, { className:'p-4 col-span-2' },
          React.createElement(CxLabel, null, c.label + ' settings'),
          c.settings.map(st => {
            const key = c.id+':'+st[0];
            const on = settings[key] !== undefined ? settings[key] : st[1];
            return React.createElement('div', { key:st[0], className:'flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0' },
              React.createElement('span', { className:'text-sm text-slate-700' }, st[0]),
              React.createElement(AdminToggle, { on, onChange:v=>setSettings(o=>({...o,[key]:v})), label:on?'On':'Off' }));
          })
        ),
        React.createElement(Card, { className:'p-4' },
          React.createElement(CxLabel, null, 'Connection'),
          React.createElement('p', { className:'text-xs font-semibold text-slate-800' }, c.detail),
          React.createElement('p', { className:'text-xs text-slate-500 leading-relaxed mt-2 pt-2 border-t border-slate-100' }, c.desc)
        )
      )
    );
  }

  return React.createElement('div', { className:'space-y-4' },
    React.createElement(AdminCrumb, { trail:['Admin','Notifications'], onNavigate:()=>onBack() }),
    React.createElement('p', { className:'text-sm text-slate-500' }, 'Choose a delivery channel to configure it, or set which events go where in the matrix below.'),
    React.createElement('div', { className:'grid grid-cols-3 gap-4' },
      NOTIFY_CHANNELS.map(x => React.createElement(AdminTile, {
        key:x.id, icon:x.icon, title:x.label, desc:x.desc, tone:x.tone,
        onClick:()=>setChan(x.id),
        meta:[ statusPill(x.status),
               React.createElement(CxPill,{key:'e',tone:'slate'}, matrix.filter(e=>e[x.id]).length + ' events') ]
      }))
    ),
    React.createElement(Card, { className:'overflow-hidden' },
      React.createElement('div', { className:'px-4 py-3 border-b border-slate-100' },
        React.createElement('p', { className:'font-semibold text-slate-900 text-sm' }, 'Event routing'),
        React.createElement('p', { className:'text-xs text-slate-400 mt-0.5' }, 'Click a cell to toggle delivery of that event on that channel.')),
      React.createElement('table', { className:'w-full text-sm' },
        React.createElement('thead', null, React.createElement('tr', { className:'bg-slate-50 border-b' },
          React.createElement('th', { className:'px-4 py-3 text-left text-xs font-medium text-slate-500' }, 'Event'),
          React.createElement('th', { className:'px-4 py-3 text-left text-xs font-medium text-slate-500' }, 'Audience'),
          ...NOTIFY_CHANNELS.map(ch => React.createElement('th', { key:ch.id, className:'px-4 py-3 text-center text-xs font-medium text-slate-500' }, ch.icon + ' ' + ch.label))
        )),
        React.createElement('tbody', null,
          matrix.map(e => React.createElement('tr', { key:e.id, className:'border-b last:border-0 hover:bg-slate-50' },
            React.createElement('td', { className:'px-4 py-2.5 font-medium text-slate-900' }, e.label),
            React.createElement('td', { className:'px-4 py-2.5 text-xs text-slate-500' }, e.audience),
            ...NOTIFY_CHANNELS.map(ch => React.createElement('td', { key:ch.id, className:'px-4 py-2.5 text-center' },
              React.createElement('button', {
                onClick:()=>toggleCell(e.id, ch.id),
                title: e[ch.id] ? 'Delivering via ' + ch.label : 'Not delivering via ' + ch.label,
                className:`w-6 h-6 rounded-md text-xs font-bold transition-colors ${e[ch.id] ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-slate-100 text-slate-300 hover:bg-slate-200'}`
              }, e[ch.id] ? '\u2713' : '\u2013')
            ))
          )))
      )
    )
  );
}


// ============================================================
// AUTOMATION — three-pillar event/condition/action engine
// ============================================================

// Attributes per pillar. `values` powers the value picker for enum fields.

// Operators are type-aware so the builder never offers a nonsensical comparison
const opsFor = (type) => AUTO_OPERATORS[type] || AUTO_OPERATORS.text;

// Actions available across all three pillars, regardless of which pillar fired the event

// Seeded automations, keyed by the pillar whose attribute change fires them

// Event modes offered for a given attribute type
function eventModesFor(type){
  if (type === 'enum')  return [['changes_to','changes to'],['changed_from','changes from'],['any_change','changes at all']];
  if (type === 'bool')  return [['changes_to','changes to'],['any_change','changes at all']];
  if (type === 'date')  return [['any_change','changes at all'],['changes_to','is set to']];
  if (type === 'text')  return [['any_change','changes at all'],['changes_to','changes to']];
  return [['rises_above','rises above'],['drops_below','drops below'],['any_change','changes at all'],['changes_to','changes to']];
}

// Plain-English sentence for an automation, used in list rows and the summary rail
function automationSentence(a){
  const pm = AUTO_PILLAR_META[a.pillar];
  const f  = fieldMeta(a.pillar, a.event.field);
  const ev = `When ${pm.singular} ${f ? f.label.toLowerCase() : a.event.field} ${modeLabel(a.event.mode)}${a.event.to ? ' ' + a.event.to : ''}`;
  const cond = a.conditions.length ? `, and ${a.conditions.length} condition${a.conditions.length===1?'':'s'} match` : '';
  return `${ev}${cond} \u2192 run ${a.actions.length} action${a.actions.length===1?'':'s'}.`;
}

// ── Small shared bits for the automation builder ──
const AUTO_INP = 'text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 outline-none focus:border-indigo-400';

function AutoChip({ pillar, children, draggable, onDragStart, onClick, dim }){
  const tone = AUTO_PILLAR_META[pillar] ? AUTO_PILLAR_META[pillar].tone : 'slate';
  return React.createElement('button', {
    draggable: draggable || undefined,
    onDragStart, onClick,
    className:`px-2 py-1 rounded-md text-[11px] font-semibold text-left transition-all ${ADMIN_TONES[tone]} ${draggable?'cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-indigo-200':''} ${dim?'opacity-40':''}`
  }, children);
}

// Value editor that adapts to the attribute type
function AutoValue({ meta, value, onChange, placeholder }){
  if (meta && meta.type === 'enum')
    return React.createElement('select', { value, onChange:e=>onChange(e.target.value), className:AUTO_INP + ' flex-1 min-w-[110px]' },
      React.createElement('option', { value:'' }, 'Select\u2026'),
      meta.values.map(v=>React.createElement('option',{key:v,value:v},v)));
  if (meta && meta.type === 'bool')
    return React.createElement('select', { value, onChange:e=>onChange(e.target.value), className:AUTO_INP + ' flex-1' },
      ['true','false'].map(v=>React.createElement('option',{key:v,value:v},v)));
  return React.createElement('input', { value, onChange:e=>onChange(e.target.value),
    placeholder: placeholder || (meta && (meta.type==='number'||meta.type==='percent') ? '0' : meta && meta.type==='currency' ? '50000' : 'value'),
    className:AUTO_INP + ' flex-1 min-w-[90px]' });
}

// ============================================================
// AUTOMATION — builder (drag & drop + prompt)
// ============================================================
function AutomationBuilder({ pillar, automation, onBack, onSave, dispatch }){
  const pm = AUTO_PILLAR_META[pillar];
  const blank = { name:'', pillar, event:{ field:AUTO_FIELDS[pillar][0].key, mode:'any_change', to:'' },
                  logic:'AND', conditions:[], actions:[], enabled:true };
  const seed = automation || blank;

  const [mode, setMode]   = useState('build');            // build | prompt
  const [name, setName]   = useState(seed.name);
  const [evt, setEvt]     = useState(seed.event);
  const [logic, setLogic] = useState(seed.logic);
  const [conds, setConds] = useState(seed.conditions);
  const [acts, setActs]   = useState(seed.actions);
  const [enabled, setEnabled] = useState(seed.enabled);
  const [dragging, setDragging] = useState(null);          // {kind, pillar, key} | {kind:'action', id}
  const [overZone, setOverZone] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [draft, setDraft]   = useState(null);
  const [testOut, setTestOut] = useState(null);

  const evtMeta  = fieldMeta(pillar, evt.field);
  const evtModes = eventModesFor(evtMeta ? evtMeta.type : 'text');

  // ── drag helpers ──
  const startDragField = (p, key) => (e) => {
    setDragging({ kind:'field', pillar:p, key });
    if (e.dataTransfer) { e.dataTransfer.effectAllowed = 'copy'; try { e.dataTransfer.setData('text/plain', 'field:'+p+':'+key); } catch(_){} }
  };
  const startDragAction = (id) => (e) => {
    setDragging({ kind:'action', id });
    if (e.dataTransfer) { e.dataTransfer.effectAllowed = 'copy'; try { e.dataTransfer.setData('text/plain', 'action:'+id); } catch(_){} }
  };
  const allowDrop = (zone) => (e) => { e.preventDefault(); if (e.dataTransfer) e.dataTransfer.dropEffect='copy'; setOverZone(zone); };
  const leaveZone = () => setOverZone(null);

  const addCondition = (p, key) => {
    const m = fieldMeta(p, key);
    setConds(c => c.concat({ pillar:p, field:key, op:opsFor(m?m.type:'text')[0], val:'' }));
  };
  const addAction = (id) => setActs(a => a.concat({ id, arg:'' }));

  // Read the payload from dataTransfer first and fall back to component state,
  // so a drop still resolves even if React has not re-rendered since dragstart.
  const readDrag = (e) => {
    let raw = '';
    try { raw = (e.dataTransfer && e.dataTransfer.getData('text/plain')) || ''; } catch(_) { raw = ''; }
    if (raw.indexOf('field:') === 0) {
      const parts = raw.split(':');
      return { kind:'field', pillar:parts[1], key:parts.slice(2).join(':') };
    }
    if (raw.indexOf('action:') === 0) return { kind:'action', id:raw.slice(7) };
    return dragging;
  };

  const dropOnConditions = (e) => {
    e.preventDefault(); setOverZone(null);
    const d = readDrag(e);
    if (d && d.kind === 'field') addCondition(d.pillar, d.key);
    setDragging(null);
  };
  const dropOnActions = (e) => {
    e.preventDefault(); setOverZone(null);
    const d = readDrag(e);
    if (d && d.kind === 'action') addAction(d.id);
    setDragging(null);
  };
  const dropOnEvent = (e) => {
    e.preventDefault(); setOverZone(null);
    const d = readDrag(e);
    if (d && d.kind === 'field' && d.pillar === pillar) {
      const m = fieldMeta(pillar, d.key);
      setEvt({ field:d.key, mode:eventModesFor(m?m.type:'text')[0][0], to:'' });
    } else if (d && d.kind === 'field') {
      dispatch && dispatch({ type:'ADD_TOAST', msg:'The event must be a ' + pm.singular + ' attribute \u2014 dropped into conditions instead', toastType:'info' });
      addCondition(d.pillar, d.key);
    }
    setDragging(null);
  };

  const setCond = (i,p) => setConds(c=>c.map((x,j)=>j===i?{...x,...p}:x));
  const delCond = i => setConds(c=>c.filter((_,j)=>j!==i));
  const setActArg = (i,v) => setActs(a=>a.map((x,j)=>j===i?{...x,arg:v}:x));
  const delAct = i => setActs(a=>a.filter((_,j)=>j!==i));

  // ── prompt → structured draft ──
  const generate = () => {
    const p = prompt.toLowerCase();
    const pick = (list, dflt) => { for (const [re,k] of list) if (re.test(p)) return k; return dflt; };
    const field = pick([
      [/health/, 'health_band'], [/adoption/, 'adoption_score'], [/sentiment/, 'sentiment'],
      [/churn/, 'churn_status'], [/renewal/, 'renewal_date'], [/nps/, 'nps'],
      [/priority|p1|critical/, 'priority'], [/status/, 'status'], [/escalat/, 'escalation_score'], [/csat/, 'csat_score'],
      [/champion|depart|leave/, 'has_departed'], [/engagement/, 'engagement'], [/role/, 'contact_role'],
    ], AUTO_FIELDS[pillar][0].key);
    const fm = fieldMeta(pillar, field) || AUTO_FIELDS[pillar][0];
    const mode = /below|drop|fall/.test(p) ? 'drops_below' : /above|rise|exceed|spike/.test(p) ? 'rises_above' : 'changes_to';
    const num = (p.match(/\b(\d{1,6})\b/) || [null,''])[1];
    const to = fm.type === 'enum'
      ? (fm.values.find(v => p.includes(v.toLowerCase().split(' ')[0])) || fm.values[fm.values.length-1])
      : fm.type === 'bool' ? 'true' : num;

    const conditions = [];
    if (/strategic/.test(p)) conditions.push({ pillar:'customer', field:'is_strategic', op:'is true', val:'' });
    if (/enterprise/.test(p)) conditions.push({ pillar:'customer', field:'segment', op:'is', val:'Enterprise' });
    if (/renewal/.test(p) && pillar !== 'customer') conditions.push({ pillar:'customer', field:'renewal_date', op:'is within next', val:'90 days' });
    if (/champion/.test(p) && pillar !== 'contact') conditions.push({ pillar:'contact', field:'buying_role', op:'is any of', val:'Champion' });

    const actions = [];
    if (/slack/.test(p)) actions.push({ id:'n_slack', arg:'#cs-alerts' });
    if (/teams/.test(p)) actions.push({ id:'n_teams', arg:'CS channel' });
    if (/email/.test(p)) actions.push({ id:'n_email', arg:'Account owner' });
    if (/task/.test(p)) actions.push({ id:'n_task', arg:prompt.slice(0,48) });
    if (/goal/.test(p)) actions.push({ id:'c_goal', arg:'Adoption recovery' });
    if (/risk/.test(p)) actions.push({ id:'c_risk', arg:prompt.slice(0,40) });
    if (/escalat/.test(p)) actions.push({ id:'t_escalate', arg:'' });
    if (/manager|notify/.test(p)) actions.push({ id:'n_manager', arg:'' });
    if (!actions.length) actions.push({ id:'n_slack', arg:'#cs-alerts' });

    setDraft({ name: prompt.slice(0,60) || 'Generated automation', event:{ field, mode, to: to || '' }, conditions, actions });
    dispatch && dispatch({ type:'ADD_TOAST', msg:'Automation drafted \u2014 review before applying', toastType:'success' });
  };
  const applyDraft = () => {
    if (!draft) return;
    setName(draft.name); setEvt(draft.event); setConds(draft.conditions); setActs(draft.actions);
    setDraft(null); setMode('build');
    dispatch && dispatch({ type:'ADD_TOAST', msg:'Applied to the drag & drop builder', toastType:'success' });
  };

  const runTest = () => setTestOut({
    matched: conds.length === 0 || Math.random() > 0.3,
    at:new Date().toLocaleTimeString(),
    checked:conds.length
  });

  const current = { id:seed.id, pillar, name, event:evt, logic, conditions:conds, actions:acts, enabled, runs:seed.runs||0, last:seed.last||'Never run' };

  // ── Palette tray ──
  const tray = React.createElement(Card, { className:'p-4' },
    React.createElement(CxLabel, { right:React.createElement(CxPill,{tone:pm.tone}, pm.icon + ' ' + pm.label) }, 'Attribute palette'),
    React.createElement('p', { className:'text-[10px] text-slate-400 mb-2' }, 'Drag a ' + pm.singular + ' attribute into Event or Conditions \u2014 or click to add.'),
    React.createElement('div', { className:'flex flex-wrap gap-1.5 mb-4' },
      AUTO_FIELDS[pillar].map(f => React.createElement(AutoChip, {
        key:f.key, pillar:pillar, draggable:true,
        onDragStart:startDragField(pillar, f.key),
        onClick:()=>addCondition(pillar, f.key)
      }, f.label))
    ),
    React.createElement(CxLabel, null, 'Action palette'),
    React.createElement('div', { className:'space-y-2 max-h-56 overflow-y-auto pr-1' },
      AUTO_ACTIONS.map(g => React.createElement('div', { key:g.group },
        React.createElement('p', { className:'text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1' }, g.group),
        React.createElement('div', { className:'flex flex-wrap gap-1.5' },
          g.items.map(a => React.createElement('button', {
            key:a.id, draggable:true, onDragStart:startDragAction(a.id), onClick:()=>addAction(a.id),
            className:'px-2 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600 cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-indigo-200 text-left'
          }, a.icon + ' ' + a.label))
        )
      ))
    )
  );

  const zoneCls = (z) => `rounded-xl border-2 border-dashed transition-colors ${overZone===z ? 'border-indigo-400 bg-indigo-50/60' : 'border-slate-200'}`;

  return React.createElement('div', { className:'space-y-4' },
    React.createElement(AdminCrumb, {
      trail:['Admin','Automation', pm.label, seed.id ? (seed.name || 'Untitled') : 'New automation'],
      onNavigate:(i)=>{ if (i <= 2) onBack(); },
      actions: React.createElement('div', { className:'flex items-center gap-2' },
        React.createElement('div', { className:'flex gap-0.5 bg-slate-100 rounded-lg p-0.5' },
          [['build','\u2317 Drag & drop'],['prompt','\u2726 Prompt']].map(m=>React.createElement('button', {
            key:m[0], onClick:()=>setMode(m[0]),
            className:`px-2.5 py-1 text-xs rounded-md transition-colors ${mode===m[0]?'bg-white text-slate-900 shadow-sm font-semibold':'text-slate-500'}`
          }, m[1]))
        ),
        React.createElement(AdminToggle, { on:enabled, onChange:setEnabled, label:enabled?'Enabled':'Disabled' }),
        React.createElement(Btn, { variant:'primary', size:'xs', onClick:()=>onSave(current) }, 'Save')
      )
    }),

    mode === 'prompt'
      // ── Prompt mode ──
      ? React.createElement(Card, { className:'p-5' },
          React.createElement(CxLabel, { right:React.createElement(CxPill,{tone:'blue'},'AI') }, 'Describe the automation'),
          React.createElement('textarea', {
            value:prompt, onChange:e=>setPrompt(e.target.value), rows:3, maxLength:500,
            placeholder:`e.g. When a ${pm.singular} attribute changes, alert the team \u2014 "P1 raised on a strategic account, post to Slack and notify the manager"`,
            className:'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400 resize-none'
          }),
          React.createElement('div', { className:'flex items-center justify-between mt-2 gap-2 flex-wrap' },
            React.createElement('div', { className:'flex gap-1.5 flex-wrap' },
              ({ ticket:['P1 raised on a strategic account \u2014 Slack the team and notify the manager',
                         'Escalation score spikes above 70 \u2014 escalate the ticket',
                         'CSAT drops below 3 \u2014 create a task and open a risk'],
                 customer:['Health band changes to Red \u2014 create a recovery goal and notify the manager',
                           'Adoption drops below 60 before renewal \u2014 create a task',
                           'Sentiment turns negative \u2014 Slack the team'],
                 contact:['Champion departs \u2014 open a risk and create a task',
                          'Engagement drops to Low on a champion \u2014 send an email',
                          'New executive sponsor identified \u2014 Slack the wins channel'] })[pillar].map(ex =>
                React.createElement('button', { key:ex, onClick:()=>setPrompt(ex),
                  className:'text-[11px] px-2 py-1 rounded-lg border border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600 text-left' }, ex))
            ),
            React.createElement(Btn, { variant:'primary', size:'xs', onClick:generate, disabled:!prompt.trim() }, '\u2726 Generate')
          ),
          draft && React.createElement('div', { className:'mt-4 border border-indigo-200 bg-indigo-50/50 rounded-xl p-4' },
            React.createElement('p', { className:'text-[10px] font-bold text-indigo-700 uppercase tracking-wider mb-2' }, 'Generated automation'),
            React.createElement('p', { className:'text-sm font-semibold text-slate-900 mb-3' }, draft.name),
            React.createElement('p', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1' }, 'Event'),
            React.createElement('p', { className:'text-xs text-slate-700 mb-3' },
              React.createElement(CxPill,{tone:pm.tone}, pm.label), ' ',
              (fieldMeta(pillar, draft.event.field)||{}).label + ' ' + modeLabel(draft.event.mode) + ' ' + draft.event.to),
            draft.conditions.length > 0 && React.createElement(React.Fragment, null,
              React.createElement('p', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1' }, 'Conditions'),
              draft.conditions.map((c,i)=>React.createElement('p',{key:i,className:'text-xs text-slate-700 mb-1'},
                React.createElement(CxPill,{tone:AUTO_PILLAR_META[c.pillar].tone}, AUTO_PILLAR_META[c.pillar].label), ' ',
                (fieldMeta(c.pillar,c.field)||{}).label + ' ' + c.op + ' ' + c.val))),
            React.createElement('p', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 mt-3' }, 'Actions'),
            React.createElement('div', { className:'flex gap-1.5 flex-wrap' },
              draft.actions.map((a,i)=>{ const m=actionMeta(a.id); return React.createElement(CxPill,{key:i,tone:'slate'}, m.icon+' '+m.label); })),
            React.createElement('div', { className:'flex gap-2 mt-4' },
              React.createElement(Btn, { variant:'primary', size:'xs', onClick:applyDraft }, 'Apply to builder'),
              React.createElement(Btn, { variant:'secondary', size:'xs', onClick:generate }, 'Regenerate'),
              React.createElement(Btn, { variant:'ghost', size:'xs', onClick:()=>setDraft(null) }, 'Discard'))
          )
        )

      // ── Drag & drop mode ──
      : React.createElement('div', { className:'grid grid-cols-4 gap-4 items-start' },
          React.createElement('div', { className:'col-span-1' }, tray),

          React.createElement('div', { className:'col-span-3 space-y-4' },

            React.createElement(Card, { className:'p-4' },
              React.createElement(CxLabel, null, 'Automation name'),
              React.createElement('input', { value:name, onChange:e=>setName(e.target.value),
                placeholder:'e.g. P1 opened on a strategic account',
                className:'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold outline-none focus:border-indigo-400' })
            ),

            // EVENT
            React.createElement('div', { onDragOver:allowDrop('event'), onDragLeave:leaveZone, onDrop:dropOnEvent, className:zoneCls('event') },
              React.createElement('div', { className:'p-4' },
                React.createElement(CxLabel, { right:React.createElement(CxPill,{tone:pm.tone}, pm.label + ' attribute') }, 'When \u2014 event trigger'),
                React.createElement('div', { className:'flex gap-2 items-center flex-wrap' },
                  React.createElement('select', { value:evt.field, className:AUTO_INP + ' flex-1 min-w-[150px]',
                    onChange:e=>{ const m=fieldMeta(pillar,e.target.value); setEvt({ field:e.target.value, mode:eventModesFor(m?m.type:'text')[0][0], to:'' }); } },
                    AUTO_FIELDS[pillar].map(f=>React.createElement('option',{key:f.key,value:f.key},f.label))),
                  React.createElement('select', { value:evt.mode, onChange:e=>setEvt({...evt, mode:e.target.value}), className:AUTO_INP },
                    evtModes.map(m=>React.createElement('option',{key:m[0],value:m[0]},m[1]))),
                  evt.mode !== 'any_change' && React.createElement(AutoValue, { meta:evtMeta, value:evt.to, onChange:v=>setEvt({...evt, to:v}) })
                ),
                React.createElement('p', { className:'text-[10px] text-slate-400 mt-2' }, 'Drop a ' + pm.singular + ' attribute here to change the trigger.')
              )
            ),

            // CONDITIONS
            React.createElement('div', { onDragOver:allowDrop('cond'), onDragLeave:leaveZone, onDrop:dropOnConditions, className:zoneCls('cond') },
              React.createElement('div', { className:'p-4' },
                React.createElement(CxLabel, { right:React.createElement('div',{className:'flex gap-0.5 bg-slate-100 rounded-lg p-0.5'},
                  ['AND','OR'].map(l=>React.createElement('button',{key:l,onClick:()=>setLogic(l),
                    className:`px-2 py-0.5 text-[11px] rounded-md font-semibold ${logic===l?'bg-white text-slate-900 shadow-sm':'text-slate-500'}`},l)))
                }, 'And if \u2014 conditions (any pillar)'),
                conds.length === 0
                  ? React.createElement('p', { className:'text-xs text-slate-400 italic py-6 text-center' }, 'Drop ' + pm.singular + ' attributes here \u2014 switch a row to another pillar once added')
                  : React.createElement('div', { className:'space-y-2' },
                      conds.map((c,i)=>{
                        const m = fieldMeta(c.pillar, c.field);
                        const cpm = AUTO_PILLAR_META[c.pillar];
                        return React.createElement('div', { key:i },
                          i>0 && React.createElement('div', { className:'flex items-center gap-2 py-1' },
                            React.createElement('span',{className:'h-px flex-1 bg-slate-100'}),
                            React.createElement(CxPill,{tone:'slate'},logic),
                            React.createElement('span',{className:'h-px flex-1 bg-slate-100'})),
                          React.createElement('div', { className:'flex gap-2 items-center flex-wrap bg-white border border-slate-200 rounded-lg p-2' },
                            React.createElement('select', { value:c.pillar, className:AUTO_INP + ' w-24',
                              title:'Which pillar this condition reads from',
                              onChange:e=>{ const np=e.target.value; const nf=AUTO_FIELDS[np][0];
                                setCond(i,{ pillar:np, field:nf.key, op:opsFor(nf.type)[0], val:'' }); } },
                              AUTO_PILLARS.map(p=>React.createElement('option',{key:p.id,value:p.id},p.label))),
                            React.createElement('select', { value:c.field, className:AUTO_INP + ' flex-1 min-w-[130px]',
                              onChange:e=>{ const nm=fieldMeta(c.pillar,e.target.value); setCond(i,{field:e.target.value, op:opsFor(nm?nm.type:'text')[0], val:''}); } },
                              AUTO_FIELDS[c.pillar].map(f=>React.createElement('option',{key:f.key,value:f.key},f.label))),
                            React.createElement('select', { value:c.op, onChange:e=>setCond(i,{op:e.target.value}), className:AUTO_INP },
                              opsFor(m?m.type:'text').map(o=>React.createElement('option',{key:o},o))),
                            !/is empty|is not empty|is set|is not set|is true|is false|changes to true|changes to false/.test(c.op) &&
                              React.createElement(AutoValue, { meta:m, value:c.val, onChange:v=>setCond(i,{val:v}) }),
                            React.createElement('button', { onClick:()=>delCond(i), className:'text-slate-300 hover:text-red-500 text-sm px-1' }, '\u2715')
                          )
                        );
                      })
                    )
              )
            ),

            // ACTIONS
            React.createElement('div', { onDragOver:allowDrop('act'), onDragLeave:leaveZone, onDrop:dropOnActions, className:zoneCls('act') },
              React.createElement('div', { className:'p-4' },
                React.createElement(CxLabel, null, 'Then \u2014 actions (any pillar)'),
                acts.length === 0
                  ? React.createElement('p', { className:'text-xs text-slate-400 italic py-6 text-center' }, 'Drop actions here \u2014 at least one is required')
                  : React.createElement('div', { className:'space-y-2' },
                      acts.map((a,i)=>{
                        const m = actionMeta(a.id);
                        if (!m) return null;
                        return React.createElement('div', { key:i, className:'flex gap-2 items-center bg-white border border-slate-200 rounded-lg p-2' },
                          React.createElement('span', { className:'w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-xs flex-shrink-0' }, m.icon),
                          React.createElement('span', { className:'text-xs font-semibold text-slate-700 flex-shrink-0' }, m.label),
                          m.arg === 'enum'
                            ? React.createElement('select', { value:a.arg, onChange:e=>setActArg(i,e.target.value), className:AUTO_INP + ' flex-1' },
                                React.createElement('option',{value:''},'Select\u2026'),
                                m.values.map(v=>React.createElement('option',{key:v,value:v},v)))
                            : m.arg === 'text'
                              ? React.createElement('input', { value:a.arg, onChange:e=>setActArg(i,e.target.value), placeholder:'target / template', className:AUTO_INP + ' flex-1' })
                              : React.createElement('span', { className:'flex-1 text-[11px] text-slate-400 italic' }, 'No configuration needed'),
                          React.createElement('button', { onClick:()=>delAct(i), className:'text-slate-300 hover:text-red-500 text-sm px-1' }, '\u2715')
                        );
                      })
                    )
              )
            ),

            // Summary + test
            React.createElement(Card, { className:'p-4' },
              React.createElement(CxLabel, null, 'Summary'),
              React.createElement('p', { className:'text-sm text-slate-700 leading-relaxed' }, automationSentence(current)),
              React.createElement('div', { className:'flex items-center gap-2 mt-3 flex-wrap' },
                React.createElement(Btn, { variant:'secondary', size:'xs', onClick:runTest }, '\u25B6 Test run'),
                React.createElement(Btn, { variant:'primary', size:'xs', onClick:()=>onSave(current) }, 'Save automation'),
                testOut && React.createElement('span', { className:`text-xs font-semibold ${testOut.matched?'text-green-600':'text-slate-500'}` },
                  (testOut.matched ? '\u2713 Would fire' : '\u2014 Would not fire') + ' \u00b7 ' + testOut.checked + ' condition(s) at ' + testOut.at)
              )
            )
          )
        )
  );
}

// ============================================================
// AUTOMATION — pillar rail + list
// ============================================================
function AutomationAdmin({ onBack, dispatch }){
  const pillar = 'ticket';                     // automations are ticket-only
  const [items, setItems]   = useState(AUTOMATIONS);
  const [editing, setEditing] = useState(null);   // automation object | 'new' | null
  const [q, setQ] = useState('');

  const pm = AUTO_PILLAR_META[pillar];
  const mine = items.filter(a => a.pillar === pillar && (!q || a.name.toLowerCase().includes(q.toLowerCase())));

  const save = (auto) => {
    setItems(list => auto.id ? list.map(x => x.id === auto.id ? auto : x)
                             : list.concat(Object.assign({}, auto, { id:'a'+(list.length+1)+'_'+Date.now(), runs:0, last:'Never run' })));
    setEditing(null);
    dispatch && dispatch({ type:'ADD_TOAST', msg:'Automation saved', toastType:'success' });
  };

  if (editing) return React.createElement(AutomationBuilder, {
    pillar, automation: editing === 'new' ? null : editing,
    onBack:()=>setEditing(null), onSave:save, dispatch
  });

  return React.createElement('div', { className:'space-y-4' },
    React.createElement(AdminCrumb, {
      trail:['Admin','Ticket automations'], onNavigate:()=>onBack(),
      actions: React.createElement('div', { className:'flex gap-2' },
        React.createElement('input', { value:q, onChange:e=>setQ(e.target.value), placeholder:'Search automations\u2026',
          className:'text-xs border border-slate-200 rounded-lg px-3 py-1.5 w-48 outline-none focus:border-indigo-400' }),
        React.createElement(Btn, { variant:'primary', size:'xs', onClick:()=>setEditing('new') }, '+ New ' + pm.singular + ' automation')
      )
    }),

    React.createElement('div', { className:'grid grid-cols-4 gap-4 items-start' },
      React.createElement('div', { className:'col-span-1 space-y-4' },
        React.createElement(Card, { className:'p-4' },
          React.createElement('p', { className:`text-[10px] font-bold uppercase tracking-wider mb-1.5 ${ADMIN_TONES[pm.tone].split(' ')[1]}` }, pm.label),
          React.createElement('p', { className:'text-xs text-slate-500 leading-relaxed' }, pm.desc),
          React.createElement('p', { className:'text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-100' },
            AUTO_FIELDS[pillar].length + ' attributes can trigger an event. Conditions and actions may span all three pillars.'),
          React.createElement('p', { className:'text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-100 leading-relaxed' },
            'Customer and contact behaviour is handled by Actions, which CSMs build themselves against their own accounts.')
        )
      ),

      React.createElement('div', { className:'col-span-3 space-y-3' },
        mine.length === 0
          ? React.createElement(Card, { className:'p-10 text-center' },
              React.createElement('p', { className:'text-2xl mb-2' }, pm.icon),
              React.createElement('p', { className:'text-sm text-slate-500' }, q ? 'No automations match that search' : 'No ' + pm.singular + ' automations yet'),
              React.createElement('div', { className:'mt-3' },
                React.createElement(Btn, { variant:'primary', size:'xs', onClick:()=>setEditing('new') }, 'Create the first one'))
            )
          : mine.map(a => {
              const f = fieldMeta(a.pillar, a.event.field);
              return React.createElement(Card, { key:a.id, className:'p-4 hover:border-indigo-300 transition-colors' },
                React.createElement('div', { className:'flex items-start gap-3' },
                  React.createElement('span', { className:`w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0 ${ADMIN_TONES[pm.tone]}` }, pm.icon),
                  React.createElement('div', { className:'flex-1 min-w-0' },
                    React.createElement('div', { className:'flex items-center gap-2 flex-wrap' },
                      React.createElement('p', { className:'text-sm font-semibold text-slate-900' }, a.name),
                      React.createElement(CxPill, { tone:a.enabled?'green':'slate' }, a.enabled?'Enabled':'Disabled')
                    ),
                    React.createElement('p', { className:'text-xs text-slate-500 mt-1 leading-relaxed' }, automationSentence(a)),
                    React.createElement('div', { className:'flex gap-1.5 flex-wrap mt-2' },
                      React.createElement(CxPill, { tone:pm.tone }, '\u26A1 ' + (f?f.label:a.event.field)),
                      Array.from(new Set(a.conditions.map(c=>c.pillar))).map(p =>
                        React.createElement(CxPill, { key:p, tone:AUTO_PILLAR_META[p].tone }, 'if ' + AUTO_PILLAR_META[p].label)),
                      a.actions.slice(0,3).map((ac,i)=>{ const m=actionMeta(ac.id); return m && React.createElement(CxPill,{key:i,tone:'slate'}, m.icon+' '+m.label); }),
                      a.actions.length > 3 && React.createElement(CxPill, { tone:'slate' }, '+' + (a.actions.length-3) + ' more')
                    )
                  ),
                  React.createElement('div', { className:'flex flex-col items-end gap-2 flex-shrink-0' },
                    React.createElement('span', { className:'text-[10px] text-slate-400' }, a.runs + ' runs \u00b7 ' + a.last),
                    React.createElement('div', { className:'flex items-center gap-2' },
                      React.createElement(AdminToggle, { on:a.enabled, onChange:v=>setItems(l=>l.map(x=>x.id===a.id?{...x,enabled:v}:x)) }),
                      React.createElement(Btn, { variant:'secondary', size:'xs', onClick:()=>setEditing(a) }, 'Edit')
                    )
                  )
                )
              );
            })
      )
    )
  );
}


// ============================================================
// ACTIONS — built by CSMs against customer and contact attributes
// Scoped to the accounts the CSM owns. Admins can see everyone's.
// ============================================================
const ACTION_PILLAR_META = { customer:ACTION_PILLARS[0], contact:ACTION_PILLARS[1] };

// How many of an owner's accounts an action actually covers
function actionAccountCount(action, customers){
  const owned = customers.filter(c => c.ownerId === action.ownerId);
  if (action.scope === 'selected') return (action.accountIds || []).length;
  return owned.length;
}
function actionSentenceFor(a){
  const pm = ACTION_PILLAR_META[a.pillar] || ACTION_PILLAR_META.customer;
  const f  = fieldMeta(a.pillar, a.event.field);
  const ev = 'When ' + pm.singular + ' ' + (f ? f.label.toLowerCase() : a.event.field) + ' ' +
             modeLabel(a.event.mode) + (a.event.to ? ' ' + a.event.to : '');
  const cond = (a.conditions || []).length ? ', and ' + a.conditions.length + ' condition' + (a.conditions.length===1?'':'s') + ' match' : '';
  return ev + cond + ' \u2192 run ' + (a.steps || []).length + ' action' + ((a.steps||[]).length===1?'':'s') + '.';
}

// Actions authored by other CSMs, so the admin overview has something to show

// ============================================================
// ACTIONS — CSM-facing, read-only clones of admin automations
// The event and conditions are locked; only communication copy is editable.
// ============================================================

// Action types that send a message, and are therefore CSM-editable

// Default copy generated when an automation is cloned, so a CSM has
// something concrete to edit rather than an empty box.

// Build an Action record from an admin automation

// Seed library — a few automations already published as Actions

const ACTION_MERGE_FIELDS = [
  '{{customer.name}}','{{customer.arr}}','{{customer.health_band}}','{{customer.renewal_date}}',
  '{{customer.owner}}','{{customer.link}}','{{contact.first_name}}','{{owner.name}}','{{owner.first_name}}','{{ticket.id}}',
];

// ── Read-only rule display shared by the Action detail view ──
function ActionRuleView({ action }){
  const pm = AUTO_PILLAR_META[action.pillar];
  const f  = fieldMeta(action.pillar, action.event.field);
  const lock = React.createElement('span', { className:'inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400' }, '\u{1F512} Locked by admin');

  return React.createElement('div', { className:'space-y-3' },
    React.createElement(Card, { className:'p-4 bg-slate-50/60' },
      React.createElement(CxLabel, { right:lock }, 'When \u2014 event trigger'),
      React.createElement('div', { className:'flex items-center gap-2 flex-wrap' },
        React.createElement(CxPill, { tone:pm.tone }, pm.icon + ' ' + pm.label),
        React.createElement('span', { className:'text-sm font-semibold text-slate-800' }, f ? f.label : action.event.field),
        React.createElement('span', { className:'text-sm text-slate-500' }, modeLabel(action.event.mode)),
        action.event.to && React.createElement('span', { className:'text-sm font-semibold text-slate-800' }, action.event.to)
      )
    ),
    React.createElement(Card, { className:'p-4 bg-slate-50/60' },
      React.createElement(CxLabel, { right:lock }, 'And if \u2014 conditions'),
      action.conditions.length === 0
        ? React.createElement('p', { className:'text-xs text-slate-400 italic' }, 'No conditions \u2014 runs on every matching event')
        : React.createElement('div', { className:'space-y-1.5' },
            action.conditions.map((c,i)=>{
              const cm = fieldMeta(c.pillar, c.field); const cpm = AUTO_PILLAR_META[c.pillar];
              return React.createElement('div', { key:i },
                i>0 && React.createElement('div', { className:'flex items-center gap-2 py-0.5' },
                  React.createElement('span',{className:'h-px flex-1 bg-slate-200'}),
                  React.createElement(CxPill,{tone:'slate'},action.logic),
                  React.createElement('span',{className:'h-px flex-1 bg-slate-200'})),
                React.createElement('div', { className:'flex items-center gap-2 flex-wrap bg-white border border-slate-200 rounded-lg px-2.5 py-1.5' },
                  React.createElement(CxPill, { tone:cpm.tone }, cpm.label),
                  React.createElement('span', { className:'text-xs font-semibold text-slate-700' }, cm ? cm.label : c.field),
                  React.createElement('span', { className:'text-xs text-slate-500' }, c.op),
                  c.val && React.createElement('span', { className:'text-xs font-semibold text-slate-700' }, c.val)
                )
              );
            })
          )
    )
  );
}

// ── Action detail: rule is read-only, communication copy is editable ──
function ActionDetail({ action, onBack, dispatch, onEdit }){
  const [openStep, setOpenStep] = useState(null);
  const [drafts, setDrafts] = useState({});
  const pm = AUTO_PILLAR_META[action.pillar];

  const draftFor = (st) => drafts[st.key] || { subject:st.subject, body:st.body };
  const setDraft = (st, patch) => setDrafts(d => ({ ...d, [st.key]: { ...draftFor(st), ...patch } }));
  const dirty = (st) => { const d = drafts[st.key]; return d && (d.subject !== st.subject || d.body !== st.body); };

  const save = (st) => {
    dispatch({ type:'UPDATE_ACTION_MESSAGE', actionId:action.id, stepKey:st.key,
               subject:draftFor(st).subject, body:draftFor(st).body });
  };
  const insertField = (st, token) => setDraft(st, { body: draftFor(st).body + ' ' + token });

  const editableCount = action.steps.filter(s=>s.editable).length;

  return React.createElement('div', { className:'space-y-4' },
    React.createElement('div', { className:'flex items-center justify-between gap-3 flex-wrap' },
      React.createElement('button', { onClick:onBack, className:'text-sm text-indigo-600 hover:underline' }, '\u2190 Back to Actions'),
      React.createElement('div', { className:'flex items-center gap-2' },
        React.createElement(CxPill, { tone:action.enabled?'green':'slate' }, action.enabled?'Active':'Paused'),
        onEdit && React.createElement(Btn, { variant:'secondary', size:'xs', onClick:onEdit }, '\u270E Edit action'),
        React.createElement(Btn, { variant:'secondary', size:'xs',
          onClick:()=>dispatch({ type:'TOGGLE_ACTION', actionId:action.id }) }, action.enabled?'Pause':'Resume')
      )
    ),

    React.createElement(Card, { className:'p-5' },
      React.createElement('div', { className:'flex items-start gap-4' },
        React.createElement('span', { className:`w-11 h-11 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${ADMIN_TONES[pm.tone]}` }, pm.icon),
        React.createElement('div', { className:'flex-1 min-w-0' },
          React.createElement('h3', { className:'text-base font-bold text-slate-900' }, action.name),
          React.createElement('p', { className:'text-sm text-slate-600 mt-1' }, automationSentence(Object.assign({}, action, { actions:action.steps }))),
          React.createElement('div', { className:'flex gap-4 mt-2 text-[11px] text-slate-400 flex-wrap' },
            React.createElement('span', null, 'Cloned from admin automation on ' + action.clonedAt),
            React.createElement('span', null, action.runs + ' runs'),
            React.createElement('span', null, 'Last run: ' + action.lastRun)
          )
        )
      ),
      React.createElement('div', { className:'mt-3 pt-3 border-t border-slate-100 bg-amber-50/60 -mx-5 -mb-5 px-5 py-3' },
        React.createElement('p', { className:'text-xs text-amber-800 leading-relaxed' },
          React.createElement('span', { className:'font-bold' }, '\u{1F3E2} '),
          'This action runs only on the accounts assigned to you. ',
          editableCount > 0
            ? `You can personalise the ${editableCount} message${editableCount===1?'':'s'} this action sends.`
            : 'This action sends no messages, so there is nothing to personalise.')
      )
    ),

    React.createElement(ActionRuleView, { action }),

    React.createElement(Card, { className:'p-4' },
      React.createElement(CxLabel, { right:React.createElement('span',{className:'text-[11px] text-slate-400'}, editableCount + ' of ' + action.steps.length + ' editable') }, 'Then \u2014 actions performed'),
      React.createElement('div', { className:'space-y-2' },
        action.steps.map(st => {
          const open = openStep === st.key;
          const d = draftFor(st);
          return React.createElement('div', { key:st.key, className:`border rounded-xl overflow-hidden ${st.editable?'border-indigo-200':'border-slate-200'}` },
            React.createElement('div', { className:`flex items-center gap-3 px-3 py-2.5 ${st.editable?'bg-indigo-50/50':'bg-slate-50/60'}` },
              React.createElement('span', { className:'w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-sm flex-shrink-0' }, st.icon),
              React.createElement('div', { className:'flex-1 min-w-0' },
                React.createElement('p', { className:'text-sm font-semibold text-slate-800' }, st.label),
                React.createElement('p', { className:'text-[11px] text-slate-500 truncate' },
                  st.editable ? (st.channel + (st.arg ? ' \u00b7 ' + st.arg : '')) : (st.arg || 'No configuration'))
              ),
              st.editable
                ? React.createElement(Btn, { variant:'secondary', size:'xs', onClick:()=>setOpenStep(open?null:st.key) }, open?'Close':'\u270E Edit message')
                : React.createElement(CxPill, { tone:'slate' }, '\u{1F512} Locked')
            ),
            open && st.editable && React.createElement('div', { className:'p-3 border-t border-indigo-100 space-y-2' },
              st.id !== 'n_slack' && st.id !== 'n_teams' && React.createElement('div', null,
                React.createElement('label', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider' }, 'Subject'),
                React.createElement('input', { value:d.subject, onChange:e=>setDraft(st,{subject:e.target.value}),
                  className:'w-full mt-1 text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400' })
              ),
              React.createElement('div', null,
                React.createElement('label', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider' }, st.channel + ' body'),
                React.createElement('textarea', { value:d.body, onChange:e=>setDraft(st,{body:e.target.value}), rows:6,
                  className:'w-full mt-1 text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 resize-y font-mono' })
              ),
              React.createElement('div', null,
                React.createElement('p', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1' }, 'Insert a merge field'),
                React.createElement('div', { className:'flex gap-1 flex-wrap' },
                  ACTION_MERGE_FIELDS.map(t=>React.createElement('button', { key:t, onClick:()=>insertField(st,t),
                    className:'px-1.5 py-0.5 rounded-md text-[10px] font-mono bg-slate-100 text-slate-600 hover:bg-indigo-100 hover:text-indigo-700' }, t)))
              ),
              React.createElement('div', { className:'flex items-center gap-2 pt-1' },
                React.createElement(Btn, { variant:'primary', size:'xs', onClick:()=>{ save(st); setOpenStep(null); } }, 'Save message'),
                React.createElement(Btn, { variant:'ghost', size:'xs', onClick:()=>{ setDrafts(x=>{const n={...x}; delete n[st.key]; return n;}); } }, 'Reset'),
                dirty(st) && React.createElement('span', { className:'text-[11px] text-amber-600 font-semibold' }, 'Unsaved changes')
              )
            )
          );
        })
      )
    )
  );
}

// ── Actions library page (left nav) ──

// ── Actions library for the support persona: ticket SOPs ──
function TicketActionLibrary({ state, dispatch, q, setQ, openId, setOpenId }){
  const open = openId ? TICKET_ACTIONS.find(a=>a.id===openId) : null;
  const shown = TICKET_ACTIONS.filter(a => !q ||
    a.name.toLowerCase().includes(q.toLowerCase()) ||
    a.category.toLowerCase().includes(q.toLowerCase()) ||
    a.when.toLowerCase().includes(q.toLowerCase()));

  if (open) {
    const matching = TICKETS.filter(t => { try { return open.appliesWhen(t); } catch(e){ return false; } });
    return React.createElement('div', { className:'space-y-4' },
      React.createElement('button', { onClick:()=>setOpenId(null), className:'text-sm text-indigo-600 hover:underline' }, '\u2190 Back to actions'),
      React.createElement(Card, { className:'p-5' },
        React.createElement('div', { className:'flex items-start gap-4' },
          React.createElement('span', { className:`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${ADMIN_TONES[open.tone]}` }, open.icon),
          React.createElement('div', { className:'flex-1 min-w-0' },
            React.createElement('div', { className:'flex items-center gap-2 flex-wrap' },
              React.createElement('h3', { className:'text-base font-bold text-slate-900' }, open.name),
              React.createElement(CxPill, { tone:'slate' }, open.category)),
            React.createElement('p', { className:'text-sm text-slate-600 leading-relaxed mt-1.5' }, open.summary),
            React.createElement('div', { className:'mt-3 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2' },
              React.createElement('p', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5' }, 'Applied by ticket automations when'),
              React.createElement('p', { className:'text-xs text-slate-700' }, open.when)),
            React.createElement('p', { className:'text-[11px] text-slate-400 mt-2' },
              open.steps.length + ' tasks \u00b7 currently matches ' + matching.length + ' open ticket' + (matching.length===1?'':'s'))))
      ),
      React.createElement(Card, { className:'overflow-hidden' },
        React.createElement('div', { className:'px-4 py-2.5 bg-slate-50 border-b border-slate-100' },
          React.createElement('p', { className:'text-sm font-semibold text-slate-800' }, 'Tasks the agent performs')),
        open.steps.map((st,i)=>React.createElement('div', { key:i, className:'px-4 py-2.5 border-b border-slate-50 last:border-0 flex items-start gap-3' },
          React.createElement('span', { className:'w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5' }, i+1),
          React.createElement('p', { className:'text-sm text-slate-700 flex-1 leading-snug' }, st.t),
          React.createElement(CxPill, { tone:'slate' }, st.owner),
          React.createElement('span', { className:'text-[11px] text-slate-400 w-28 text-right flex-shrink-0' }, st.due)))
      ),
      matching.length > 0 && React.createElement(Card, { className:'p-4' },
        React.createElement(CxLabel, null, 'Tickets this currently applies to'),
        React.createElement('div', { className:'space-y-1.5' },
          matching.slice(0,6).map(t => React.createElement('div', { key:t.id, className:'flex items-center gap-2.5' },
            React.createElement('span', { className:'font-mono text-[11px] text-slate-400 flex-shrink-0' }, t.id.toUpperCase()),
            React.createElement('p', { className:'text-xs text-slate-700 flex-1 truncate' }, t.subject),
            React.createElement(SeverityBadge, { severity:t.severity }))))
      )
    );
  }

  return React.createElement('div', { className:'space-y-4' },
    React.createElement(Card, { className:'p-4 border-red-100 bg-gradient-to-br from-red-50/60 to-white' },
      React.createElement('p', { className:'text-sm font-semibold text-slate-900' }, 'Ticket action library'),
      React.createElement('p', { className:'text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed' },
        'Repeatable SOPs for support agents. Ticket automations decide which of these applies to a given ticket \u2014 the matching ones appear on the ticket\u2019s Actions tab as a task list to work through.')),
    React.createElement('div', { className:'flex items-center gap-3 flex-wrap' },
      React.createElement('input', { value:q, onChange:e=>setQ(e.target.value), placeholder:'Search ticket actions\u2026',
        className:'px-3 py-1.5 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500' }),
      React.createElement('span', { className:'text-sm text-slate-500 ml-auto' }, shown.length + ' action' + (shown.length===1?'':'s'))),
    shown.length === 0
      ? React.createElement(Card, { className:'p-12 text-center text-sm text-slate-400' }, 'No actions match that search')
      : React.createElement('div', { className:'space-y-3' },
          shown.map(a => {
            const matching = TICKETS.filter(t => { try { return a.appliesWhen(t); } catch(e){ return false; } });
            return React.createElement(Card, { key:a.id, className:'p-4 hover:border-indigo-300 transition-colors cursor-pointer', onClick:()=>setOpenId(a.id) },
              React.createElement('div', { className:'flex items-start gap-3.5' },
                React.createElement('span', { className:`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${ADMIN_TONES[a.tone]}` }, a.icon),
                React.createElement('div', { className:'flex-1 min-w-0' },
                  React.createElement('div', { className:'flex items-center gap-2 flex-wrap' },
                    React.createElement('p', { className:'text-sm font-semibold text-slate-900' }, a.name),
                    React.createElement(CxPill, { tone:'slate' }, a.category)),
                  React.createElement('p', { className:'text-xs text-slate-500 mt-1' },
                    React.createElement('span', { className:'font-semibold text-slate-600' }, 'Applies when: '), a.when),
                  React.createElement('div', { className:'flex gap-3 mt-2 text-[11px] text-slate-400' },
                    React.createElement('span', null, a.steps.length + ' tasks'),
                    React.createElement('span', null, matching.length + ' matching ticket' + (matching.length===1?'':'s')))),
                React.createElement('span', { className:'text-slate-300 flex-shrink-0' }, '\u2192'))
            );
          })
        )
  );
}




// ============================================================
// ACTION FLOW — branching yes/no workflow, Freshservice-style
// A flow is an ordered list of nodes. A condition node splits into
// a yes branch and a no branch, each holding its own list of nodes.
// ============================================================
let __flowSeq = 0;
const flowId = () => 'fn' + (++__flowSeq) + '_' + Math.random().toString(36).slice(2,6);

function makeConditionNode(pillar, field){
  const m = fieldMeta(pillar, field);
  return { id:flowId(), kind:'condition', pillar, field, op:opsFor(m?m.type:'text')[0], val:'', yes:[], no:[] };
}
function makeActionNode(actionId){
  const m = actionMeta(actionId);
  return { id:flowId(), kind:'action', actionId, label:m?m.label:actionId, icon:m?m.icon:'\u2699',
           arg:'', body: isCommsAction(actionId) ? '' : null, channel: isCommsAction(actionId) ? ACTION_COMMS[actionId] : null };
}

// Immutable tree helpers. `branch` is 'yes' | 'no' | null (null = the root list).
function flowInsert(list, parentId, branch, node){
  if (parentId === null) return list.concat(node);
  return list.map(n => {
    if (n.kind !== 'condition') return n;
    if (n.id === parentId) return { ...n, [branch]: n[branch].concat(node) };
    return { ...n, yes: flowInsert(n.yes, parentId, branch, node), no: flowInsert(n.no, parentId, branch, node) };
  });
}
function flowRemove(list, id){
  return list.filter(n => n.id !== id).map(n =>
    n.kind === 'condition' ? { ...n, yes: flowRemove(n.yes, id), no: flowRemove(n.no, id) } : n);
}
function flowUpdate(list, id, patch){
  return list.map(n => {
    if (n.id === id) return { ...n, ...patch };
    return n.kind === 'condition' ? { ...n, yes: flowUpdate(n.yes, id, patch), no: flowUpdate(n.no, id, patch) } : n;
  });
}
function flowCount(list){
  return list.reduce((acc,n) => {
    if (n.kind === 'condition') { const c = flowCount(n.yes), d = flowCount(n.no);
      return { conditions: acc.conditions + 1 + c.conditions + d.conditions, actions: acc.actions + c.actions + d.actions }; }
    return { conditions: acc.conditions, actions: acc.actions + 1 };
  }, { conditions:0, actions:0 });
}
// Longest path of actions, so the summary can describe the widest outcome
function flowPaths(list, acc){
  acc = acc || [];
  let out = [];
  list.forEach(n => {
    if (n.kind === 'action') { out.push(acc.concat(n.label)); }
    else {
      out = out.concat(flowPaths(n.yes, acc.concat('if ' + (fieldMeta(n.pillar,n.field)||{}).label + ' ' + n.op + ' ' + n.val + ' \u2192 yes')));
      out = out.concat(flowPaths(n.no,  acc.concat('if ' + (fieldMeta(n.pillar,n.field)||{}).label + ' ' + n.op + ' ' + n.val + ' \u2192 no')));
    }
  });
  return out;
}

// ── Back-compat: existing views read conditions[] and steps[], so derive them ──
function flowToLegacy(list){
  const conditions = [], steps = [];
  const walk = (l) => l.forEach(n => {
    if (n.kind === 'condition') { conditions.push({ pillar:n.pillar, field:n.field, op:n.op, val:n.val }); walk(n.yes); walk(n.no); }
    else steps.push({ key:n.id, id:n.actionId, label:n.label, icon:n.icon, arg:n.arg,
      editable: isCommsAction(n.actionId), channel:n.channel, subject:'', body:n.body || '' });
  });
  walk(list);
  return { conditions, steps };
}
// An action saved before branching existed becomes a linear flow: each condition
// nests in the previous yes branch, with the actions at the deepest yes.
function legacyToFlow(a){
  if (a && a.flow && a.flow.length) return a.flow;
  const steps = (a && a.steps) || [];
  const conds = (a && a.conditions) || [];
  const actionNodes = steps.map(st => Object.assign(makeActionNode(st.id), { arg:st.arg||'', body:st.body||null }));
  if (!conds.length) return actionNodes;
  let inner = actionNodes;
  for (let i = conds.length - 1; i >= 0; i--) {
    const c = conds[i];
    inner = [Object.assign(makeConditionNode(c.pillar, c.field), { op:c.op, val:c.val, yes:inner, no:[] })];
  }
  return inner;
}

// ── Recursive flow renderer: condition nodes fork into Yes / No lanes ──
function FlowBranch({ list, parentId, branch, ctx, depth }){
  const key = (parentId || 'root') + ':' + (branch || 'root');
  const isOver = ctx.overZone === key;
  return React.createElement('div', {
      onDragOver:(e)=>{ e.preventDefault(); if(e.dataTransfer) e.dataTransfer.dropEffect='copy'; ctx.setOverZone(key); },
      onDragLeave:()=>ctx.setOverZone(null),
      onDrop:(e)=>ctx.onDrop(e, parentId, branch),
      className:`rounded-xl border-2 border-dashed p-2 min-w-[240px] transition-colors ${isOver?'border-indigo-400 bg-indigo-50/70':'border-slate-200'}`
    },
    list.length === 0
      ? React.createElement('p', { className:'text-[11px] text-slate-400 italic text-center py-3' },
          depth === 0 ? 'Drop a condition or an action to begin' : 'Drop what happens on this branch')
      : React.createElement('div', { className:'space-y-2' },
          list.map((n,i) => React.createElement(FlowNode, { key:n.id, node:n, ctx, depth, last: i === list.length-1 }))),
    React.createElement('button', { onClick:()=>ctx.openPicker(parentId, branch),
      className:'w-full mt-2 text-[11px] text-slate-400 hover:text-indigo-600 border border-slate-200 border-dashed rounded-lg py-1' }, '+ Add step')
  );
}

function FlowNode({ node, ctx, depth, last }){
  const inp = 'text-[11px] border border-slate-200 rounded-md px-1.5 py-1 bg-white text-slate-700 outline-none focus:border-indigo-400';

  if (node.kind === 'action') {
    return React.createElement('div', { className:'bg-white border border-slate-200 rounded-lg p-2 shadow-sm' },
      React.createElement('div', { className:'flex items-center gap-2' },
        React.createElement('span', { className:'w-6 h-6 rounded-md bg-teal-50 text-teal-700 flex items-center justify-center text-xs flex-shrink-0' }, node.icon),
        React.createElement('span', { className:'text-xs font-semibold text-slate-700 flex-1 min-w-0 truncate' }, node.label),
        React.createElement('button', { onClick:()=>ctx.remove(node.id), className:'text-slate-300 hover:text-red-500 text-xs' }, '\u2715')),
      React.createElement('input', { value:node.arg, onChange:e=>ctx.update(node.id,{arg:e.target.value}),
        placeholder:'target / template', className:'w-full mt-1.5 ' + inp }),
      node.channel && React.createElement('textarea', { value:node.body || '', rows:2,
        onChange:e=>ctx.update(node.id,{body:e.target.value}),
        placeholder:node.channel + ' message', className:'w-full mt-1.5 ' + inp + ' resize-y' })
    );
  }

  // Condition node with its two lanes
  const m = fieldMeta(node.pillar, node.field);
  const pm = ACTION_PILLAR_META[node.pillar] || ACTION_PILLAR_META.customer;
  const needsValue = !/is empty|is not empty|is set|is not set|is true|is false|changes to true|changes to false/.test(node.op);

  return React.createElement('div', { className:'bg-white border border-amber-200 rounded-xl p-2.5 shadow-sm' },
    React.createElement('div', { className:'flex items-center gap-2 mb-2' },
      React.createElement('span', { className:'w-6 h-6 rounded-md bg-amber-50 text-amber-700 flex items-center justify-center text-xs flex-shrink-0' }, '\u25C6'),
      React.createElement('span', { className:'text-[10px] font-bold text-amber-700 uppercase tracking-wider' }, 'Condition'),
      React.createElement(CxPill, { tone:pm.tone }, pm.label),
      React.createElement('button', { onClick:()=>ctx.remove(node.id), className:'ml-auto text-slate-300 hover:text-red-500 text-xs' }, '\u2715')),

    React.createElement('div', { className:'flex gap-1.5 flex-wrap mb-2.5' },
      React.createElement('select', { value:node.pillar, className:inp + ' w-20',
        onChange:e=>{ const np=e.target.value; const nf=AUTO_FIELDS[np][0];
          ctx.update(node.id,{ pillar:np, field:nf.key, op:opsFor(nf.type)[0], val:'' }); } },
        ACTION_PILLARS.map(p=>React.createElement('option',{key:p.id,value:p.id},p.label))),
      React.createElement('select', { value:node.field, className:inp + ' flex-1 min-w-[100px]',
        onChange:e=>{ const nm=fieldMeta(node.pillar,e.target.value); ctx.update(node.id,{ field:e.target.value, op:opsFor(nm?nm.type:'text')[0], val:'' }); } },
        AUTO_FIELDS[node.pillar].map(f=>React.createElement('option',{key:f.key,value:f.key},f.label))),
      React.createElement('select', { value:node.op, onChange:e=>ctx.update(node.id,{op:e.target.value}), className:inp },
        opsFor(m?m.type:'text').map(o=>React.createElement('option',{key:o},o))),
      needsValue && React.createElement(AutoValue, { meta:m, value:node.val, onChange:v=>ctx.update(node.id,{val:v}) })),

    // Yes / No lanes
    React.createElement('div', { className:'grid grid-cols-2 gap-2' },
      [['yes','Yes','green','bg-green-500'],['no','No','slate','bg-slate-400']].map(([b,label,tone,bar]) =>
        React.createElement('div', { key:b },
          React.createElement('div', { className:'flex items-center gap-1.5 mb-1' },
            React.createElement('span', { className:`w-1.5 h-1.5 rounded-full ${bar}` }),
            React.createElement('span', { className:`text-[10px] font-bold uppercase tracking-wider ${tone==='green'?'text-green-600':'text-slate-500'}` }, label),
            React.createElement('span', { className:'text-[10px] text-slate-300' }, node[b].length ? node[b].length + ' step(s)' : 'empty')),
          React.createElement(FlowBranch, { list:node[b], parentId:node.id, branch:b, ctx, depth:depth+1 })
        ))
    )
  );
}

// ── Drag-and-drop branching builder for CSM-authored actions ──
function ActionBuilder({ action, ownerId, customers, onBack, onSave, dispatch }){
  const blank = { name:'', pillar:'customer', event:{ field:AUTO_FIELDS.customer[0].key, mode:'any_change', to:'' },
                  scope:'my_accounts', accountIds:[], enabled:true, flow:[] };
  const seed = action || blank;

  const [pillar, setPillar] = useState(seed.pillar || 'customer');
  const [name, setName]     = useState(seed.name);
  const [evt, setEvt]       = useState(seed.event);
  const [flow, setFlow]     = useState(()=>legacyToFlow(seed));
  const [scope, setScope]   = useState(seed.scope || 'my_accounts');
  const [accountIds, setAccountIds] = useState(seed.accountIds || []);
  const [enabled, setEnabled] = useState(seed.enabled !== false);
  const [dragging, setDragging] = useState(null);
  const [overZone, setOverZone] = useState(null);
  const [picker, setPicker] = useState(null);          // { parentId, branch }

  const pm = ACTION_PILLAR_META[pillar];
  const evtMeta  = fieldMeta(pillar, evt.field);
  const evtModes = eventModesFor(evtMeta ? evtMeta.type : 'text');
  const myAccounts = customers.filter(c => c.ownerId === ownerId);
  const counts = flowCount(flow);

  const startDragEvent = (p, key) => (e) => {
    setDragging({ kind:'event', pillar:p, key });
    if (e.dataTransfer) { e.dataTransfer.effectAllowed='copy'; try { e.dataTransfer.setData('text/plain','event:'+p+':'+key); } catch(_){} } };
  const startDragField = (p, key) => (e) => {
    setDragging({ kind:'field', pillar:p, key });
    if (e.dataTransfer) { e.dataTransfer.effectAllowed='copy'; try { e.dataTransfer.setData('text/plain','field:'+p+':'+key); } catch(_){} } };
  const startDragAction = (id) => (e) => {
    setDragging({ kind:'action', id });
    if (e.dataTransfer) { e.dataTransfer.effectAllowed='copy'; try { e.dataTransfer.setData('text/plain','action:'+id); } catch(_){} } };
  const readDrag = (e) => {
    let raw=''; try { raw = (e.dataTransfer && e.dataTransfer.getData('text/plain')) || ''; } catch(_){ raw=''; }
    if (raw.indexOf('event:')===0){ const p=raw.split(':'); return { kind:'event', pillar:p[1], key:p.slice(2).join(':') }; }
    if (raw.indexOf('field:')===0){ const p=raw.split(':'); return { kind:'field', pillar:p[1], key:p.slice(2).join(':') }; }
    if (raw.indexOf('action:')===0) return { kind:'action', id:raw.slice(7) };
    return dragging; };

  // Dropping an event block replaces the trigger at the top of the flow
  const applyEvent = (p, key) => {
    const m = fieldMeta(p, key);
    setPillar(p);
    setEvt({ field:key, mode:eventModesFor(m?m.type:'text')[0][0], to:'' });
  };
  const dropOnTrigger = (e) => {
    e.preventDefault(); e.stopPropagation(); setOverZone(null);
    const d = readDrag(e);
    if (d && (d.kind === 'event' || d.kind === 'field')) applyEvent(d.pillar, d.key);
    setDragging(null);
  };

  const onDrop = (e, parentId, branch) => {
    e.preventDefault(); e.stopPropagation(); setOverZone(null);
    const d = readDrag(e);
    if (d && d.kind === 'event')  { applyEvent(d.pillar, d.key);
      dispatch && dispatch({ type:'ADD_TOAST', msg:'Event set as the trigger \u2014 a workflow has exactly one', toastType:'info' }); }
    if (d && d.kind === 'field')  setFlow(f => flowInsert(f, parentId, branch, makeConditionNode(d.pillar, d.key)));
    if (d && d.kind === 'action') setFlow(f => flowInsert(f, parentId, branch, makeActionNode(d.id)));
    setDragging(null);
  };
  const ctx = {
    overZone, setOverZone, onDrop,
    remove:(id)=>setFlow(f=>flowRemove(f, id)),
    update:(id,patch)=>setFlow(f=>flowUpdate(f, id, patch)),
    openPicker:(parentId, branch)=>setPicker({ parentId, branch }),
  };

  const legacy = flowToLegacy(flow);
  const current = { id:seed.id, name, ownerId, pillar, event:evt, logic:'AND',
    flow, conditions:legacy.conditions, steps:legacy.steps,
    scope, accountIds, enabled, runs:seed.runs||0, lastRun:seed.lastRun||'Never run',
    createdAt:seed.createdAt || new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) };

  const inp = AUTO_INP;

  return React.createElement('div', { className:'space-y-4' },
    React.createElement('div', { className:'flex items-center justify-between gap-3 flex-wrap' },
      React.createElement('button', { onClick:onBack, className:'text-sm text-indigo-600 hover:underline' }, '\u2190 Back to actions'),
      React.createElement('div', { className:'flex items-center gap-2' },
        React.createElement(AdminToggle, { on:enabled, onChange:setEnabled, label:enabled?'Enabled':'Disabled' }),
        React.createElement(Btn, { variant:'primary', size:'xs', disabled:!name.trim() || counts.actions===0,
          onClick:()=>onSave(current) }, 'Save action'))),

    React.createElement('div', { className:'grid grid-cols-4 gap-4 items-start' },

      // Palette — Event, Condition and Action blocks, dragged onto the canvas
      React.createElement(Card, { className:'p-3' },
        React.createElement('p', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2' }, 'Building blocks'),
        React.createElement('div', { className:'flex gap-1 mb-3' },
          ACTION_PILLARS.map(p => React.createElement('button', { key:p.id, onClick:()=>setPillar(p.id),
            className:`flex-1 px-2 py-1 text-[11px] font-semibold rounded-lg border transition-colors ${pillar===p.id?'bg-slate-900 text-white border-slate-900':'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}` },
            p.icon + ' ' + p.label))),

        React.createElement('div', { className:'rounded-xl border border-indigo-200 bg-indigo-50/40 p-2.5 mb-2.5' },
          React.createElement('div', { className:'flex items-center gap-1.5 mb-1' },
            React.createElement('span', { className:'w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center text-[10px]' }, '\u25B6'),
            React.createElement('span', { className:'text-[10px] font-bold text-indigo-700 uppercase tracking-wider' }, 'Event')),
          React.createElement('p', { className:'text-[10px] text-slate-500 mb-1.5' }, 'The attribute change that starts the workflow. One per action.'),
          React.createElement('div', { className:'flex flex-wrap gap-1 max-h-32 overflow-y-auto' },
            AUTO_FIELDS[pillar].map(f => React.createElement('button', { key:'ev_'+f.key, draggable:true,
              onDragStart:startDragEvent(pillar, f.key), onClick:()=>applyEvent(pillar, f.key),
              title:'Set as the trigger',
              className:`px-1.5 py-0.5 rounded-md text-[10px] font-semibold text-left cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-indigo-200 bg-white border border-indigo-200 text-indigo-700 ${evt.field===f.key?'ring-2 ring-indigo-300':''}` },
              f.label + ' changes')))),

        React.createElement('div', { className:'rounded-xl border border-amber-200 bg-amber-50/40 p-2.5 mb-2.5' },
          React.createElement('div', { className:'flex items-center gap-1.5 mb-1' },
            React.createElement('span', { className:'w-5 h-5 rounded-md bg-amber-500 text-white flex items-center justify-center text-[10px]' }, '\u25C6'),
            React.createElement('span', { className:'text-[10px] font-bold text-amber-700 uppercase tracking-wider' }, 'Condition')),
          React.createElement('p', { className:'text-[10px] text-slate-500 mb-1.5' }, 'Splits the flow into a yes and a no branch.'),
          React.createElement('div', { className:'flex flex-wrap gap-1 max-h-32 overflow-y-auto' },
            AUTO_FIELDS[pillar].map(f => React.createElement('button', { key:'cd_'+f.key, draggable:true,
              onDragStart:startDragField(pillar, f.key),
              onClick:()=>setFlow(fl=>flowInsert(fl, null, null, makeConditionNode(pillar, f.key))),
              className:'px-1.5 py-0.5 rounded-md text-[10px] font-semibold text-left cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-indigo-200 bg-white border border-amber-200 text-amber-800' },
              f.label)))),

        React.createElement('div', { className:'rounded-xl border border-teal-200 bg-teal-50/40 p-2.5' },
          React.createElement('div', { className:'flex items-center gap-1.5 mb-1' },
            React.createElement('span', { className:'w-5 h-5 rounded-md bg-teal-600 text-white flex items-center justify-center text-[10px]' }, '\u25A0'),
            React.createElement('span', { className:'text-[10px] font-bold text-teal-700 uppercase tracking-wider' }, 'Action')),
          React.createElement('p', { className:'text-[10px] text-slate-500 mb-1.5' }, 'What the workflow does when it reaches this point.'),
          React.createElement('div', { className:'space-y-1.5 max-h-56 overflow-y-auto pr-1' },
            AUTO_ACTIONS.map(g => React.createElement('div', { key:g.group },
              React.createElement('p', { className:'text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5' }, g.group),
              React.createElement('div', { className:'flex flex-wrap gap-1' },
                g.items.map(a => React.createElement('button', { key:a.id, draggable:true,
                  onDragStart:startDragAction(a.id),
                  onClick:()=>setFlow(fl=>flowInsert(fl, null, null, makeActionNode(a.id))),
                  className:'px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-white border border-teal-200 text-teal-800 cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-indigo-200 text-left' },
                  a.icon + ' ' + a.label)))))))
      ),

      React.createElement('div', { className:'col-span-3 space-y-4' },

        React.createElement(Card, { className:'p-4' },
          React.createElement(CxLabel, null, 'Action name'),
          React.createElement('input', { value:name, onChange:e=>setName(e.target.value),
            placeholder:'e.g. Health drops on one of my accounts',
            className:'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold outline-none focus:border-indigo-400' })),

        // The canvas: event node at the top, then the branching flow
        React.createElement(Card, { className:'p-4' },
          React.createElement(CxLabel, { right:React.createElement('span',{className:'text-[11px] text-slate-400'},
            '1 event \u00b7 ' + counts.conditions + ' condition(s) \u00b7 ' + counts.actions + ' action(s)') }, 'Workflow'),

          React.createElement('div', {
              onDragOver:(e)=>{ e.preventDefault(); if(e.dataTransfer) e.dataTransfer.dropEffect='copy'; setOverZone('trigger'); },
              onDragLeave:()=>setOverZone(null),
              onDrop:dropOnTrigger,
              className:`rounded-xl border-2 p-3 transition-colors ${overZone==='trigger'?'border-indigo-400 bg-indigo-50/70 border-dashed':'border-indigo-200 bg-indigo-50/40'}`
            },
            React.createElement('div', { className:'flex items-center gap-2 mb-2 flex-wrap' },
              React.createElement('span', { className:'w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center text-[10px]' }, '\u25B6'),
              React.createElement('span', { className:'text-[10px] font-bold text-indigo-700 uppercase tracking-wider' }, 'Event'),
              React.createElement(CxPill, { tone:pm.tone }, pm.label),
              React.createElement('span', { className:'text-[10px] text-slate-400 ml-auto' }, 'Drop an event block to change this')),
            React.createElement('div', { className:'flex gap-2 items-center flex-wrap' },
              React.createElement('select', { value:evt.field, className:inp + ' flex-1 min-w-[150px]',
                onChange:e=>{ const m=fieldMeta(pillar,e.target.value); setEvt({ field:e.target.value, mode:eventModesFor(m?m.type:'text')[0][0], to:'' }); } },
                AUTO_FIELDS[pillar].map(f=>React.createElement('option',{key:f.key,value:f.key},f.label))),
              React.createElement('select', { value:evt.mode, onChange:e=>setEvt({...evt, mode:e.target.value}), className:inp },
                evtModes.map(m=>React.createElement('option',{key:m[0],value:m[0]},m[1]))),
              evt.mode !== 'any_change' && React.createElement(AutoValue, { meta:evtMeta, value:evt.to, onChange:v=>setEvt({...evt,to:v}) }))),

          React.createElement('div', { className:'flex flex-col items-center py-1' },
            React.createElement('span', { className:'w-px h-4 bg-slate-300' }),
            React.createElement('span', { className:'text-[10px] text-slate-400' }, '\u25BC')),

          React.createElement('div', { className:'overflow-x-auto pb-2' },
            React.createElement(FlowBranch, { list:flow, parentId:null, branch:null, ctx, depth:0 }))),

        // Scope
        React.createElement(Card, { className:'p-4' },
          React.createElement(CxLabel, { right:React.createElement(CxPill,{tone:'blue'}, myAccounts.length + ' accounts assigned to you') }, 'Which accounts this runs on'),
          React.createElement('div', { className:'space-y-2' },
            ACTION_SCOPES.map(sc => React.createElement('label', { key:sc.id, className:'flex items-start gap-2.5 cursor-pointer' },
              React.createElement('input', { type:'radio', checked:scope===sc.id, onChange:()=>setScope(sc.id), className:'mt-0.5 accent-indigo-600' }),
              React.createElement('span', null,
                React.createElement('span', { className:'block text-sm font-medium text-slate-800' }, sc.label),
                React.createElement('span', { className:'block text-[11px] text-slate-500' }, sc.desc))))),
          scope === 'selected' && React.createElement('div', { className:'mt-3 pt-3 border-t border-slate-100 max-h-40 overflow-y-auto' },
            myAccounts.map(c => React.createElement('label', { key:c.id, className:'flex items-center gap-2 py-1 cursor-pointer' },
              React.createElement('input', { type:'checkbox', checked:accountIds.includes(c.id), className:'accent-indigo-600',
                onChange:()=>setAccountIds(v=>v.includes(c.id)?v.filter(x=>x!==c.id):v.concat(c.id)) }),
              React.createElement('span', { className:'text-xs text-slate-700' }, c.name)))),
          React.createElement('p', { className:'text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-100' },
            'Actions never run outside the accounts you own. An admin can see this action but it stays scoped to your portfolio.')),

        // Outcome summary — every branch the flow can take
        React.createElement(Card, { className:'p-4' },
          React.createElement(CxLabel, null, 'Outcomes'),
          counts.actions === 0
            ? React.createElement('p', { className:'text-xs text-slate-400 italic' }, 'Add at least one action so the workflow does something')
            : React.createElement('div', { className:'space-y-1' },
                flowPaths(flow).slice(0,8).map((p,i)=>React.createElement('p', { key:i, className:'text-[11px] text-slate-600' },
                  React.createElement('span',{className:'text-slate-400'},(i+1)+'. '), p.join('  \u2192  ')))),
          React.createElement('p', { className:'text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-100' },
            'Runs on ' + (scope==='selected' ? accountIds.length + ' selected account(s)' : myAccounts.length + ' account(s) you own') + '.'))
      )
    ),

    // Click-to-add picker, for when dragging is impractical
    picker && React.createElement(Modal, { open:true, onClose:()=>setPicker(null), title:'Add a step' },
      React.createElement('div', { className:'space-y-3' },
        React.createElement('div', null,
          React.createElement('p', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5' }, 'Condition'),
          React.createElement('div', { className:'flex flex-wrap gap-1.5' },
            AUTO_FIELDS[pillar].slice(0,8).map(f=>React.createElement('button', { key:f.key,
              onClick:()=>{ setFlow(fl=>flowInsert(fl, picker.parentId, picker.branch, makeConditionNode(pillar, f.key))); setPicker(null); },
              className:`px-2 py-1 rounded-md text-[11px] font-semibold ${ADMIN_TONES[pm.tone]}` }, f.label)))),
        React.createElement('div', null,
          React.createElement('p', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5' }, 'Action'),
          React.createElement('div', { className:'flex flex-wrap gap-1.5 max-h-48 overflow-y-auto' },
            AUTO_ACTIONS.flatMap(g=>g.items).map(a=>React.createElement('button', { key:a.id,
              onClick:()=>{ setFlow(fl=>flowInsert(fl, picker.parentId, picker.branch, makeActionNode(a.id))); setPicker(null); },
              className:'px-2 py-1 rounded-md text-[11px] font-semibold bg-teal-50 text-teal-700' }, a.icon + ' ' + a.label)))))
    )
  );
}
// ── Admin \u203a Actions overview: every action, grouped by the CSM who built it ──
function ActionsOverviewAdmin({ onBack, dispatch, state }){
  const [owner, setOwner] = useState('all');
  const [openId, setOpenId] = useState(null);
  const all = (state.actions || []);
  const owners = Array.from(new Set(all.map(a=>a.ownerId).filter(Boolean)));
  const shown = owner === 'all' ? all : all.filter(a=>a.ownerId===owner);
  const open = openId ? all.find(a=>a.id===openId) : null;

  if (open) return React.createElement('div', { className:'space-y-4' },
    React.createElement(AdminCrumb, { trail:['Admin','Actions overview', open.name],
      onNavigate:(i)=>{ if(i===0) onBack(); else setOpenId(null); } }),
    React.createElement(Card, { className:'p-4' },
      React.createElement('div', { className:'flex items-center gap-3 flex-wrap' },
        React.createElement(Avatar, { user:USERS[open.ownerId] || USERS.maya }),
        React.createElement('div', { className:'flex-1 min-w-0' },
          React.createElement('p', { className:'text-base font-bold text-slate-900' }, open.name),
          React.createElement('p', { className:'text-xs text-slate-500 mt-0.5' }, actionSentenceFor(open))),
        React.createElement(CxPill, { tone:open.enabled?'green':'slate' }, open.enabled?'Enabled':'Disabled'))),
    React.createElement(ActionRuleView, { action:open }),
    React.createElement(Card, { className:'p-4' },
      React.createElement(CxLabel, null, 'Actions performed'),
      React.createElement('div', { className:'space-y-1.5' },
        open.steps.map(st=>React.createElement('div', { key:st.key, className:'flex items-center gap-2.5' },
          React.createElement('span', { className:'w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-xs flex-shrink-0' }, st.icon),
          React.createElement('span', { className:'text-sm text-slate-700 flex-1' }, st.label),
          st.arg && React.createElement('span', { className:'text-xs text-slate-400' }, st.arg))))),
    React.createElement(Card, { className:'p-4' },
      React.createElement(CxLabel, null, 'Scope'),
      React.createElement('p', { className:'text-sm text-slate-700' },
        open.scope === 'selected'
          ? (open.accountIds||[]).length + ' selected account(s)'
          : 'All ' + actionAccountCount(open, state.customers) + ' accounts owned by ' + ((USERS[open.ownerId]||{}).name || open.ownerId)))
  );

  return React.createElement('div', { className:'space-y-4' },
    React.createElement(AdminCrumb, { trail:['Admin','Actions overview'], onNavigate:()=>onBack() }),
    React.createElement('p', { className:'text-sm text-slate-500' },
      'Every action built by a CSM. Each one runs only against the accounts its author owns \u2014 this view is read-only oversight, not a place to edit someone else\u2019s work.'),

    React.createElement('div', { className:'grid grid-cols-4 gap-4' },
      React.createElement(MetricCard, { label:'Actions configured', value:all.length, sub:'across the team' }),
      React.createElement(MetricCard, { label:'Authors', value:owners.length, sub:'CSMs building actions' }),
      React.createElement(MetricCard, { label:'Enabled', value:all.filter(a=>a.enabled).length, sub:'currently live' }),
      React.createElement(MetricCard, { label:'Total runs', value:all.reduce((n,a)=>n+(a.runs||0),0), sub:'lifetime' })),

    React.createElement('div', { className:'flex gap-1 flex-wrap' },
      [['all','All authors']].concat(owners.map(o=>[o,(USERS[o]||{}).name||o])).map(f =>
        React.createElement('button', { key:f[0], onClick:()=>setOwner(f[0]),
          className:`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${owner===f[0]?'bg-slate-900 text-white border-slate-900':'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}` },
          f[1] + ' \u00b7 ' + (f[0]==='all' ? all.length : all.filter(a=>a.ownerId===f[0]).length)))),

    React.createElement(Card, { className:'overflow-hidden' },
      React.createElement('div', { className:'overflow-x-auto' },
        React.createElement('table', { className:'w-full text-sm min-w-[900px]' },
          React.createElement('thead', null, React.createElement('tr', { className:'bg-slate-50 border-b' },
            ['Action','Built by','Trigger','Scope','Runs','Enabled',''].map((h,i)=>
              React.createElement('th',{key:i,className:'px-4 py-3 text-left text-xs font-medium text-slate-500 whitespace-nowrap'},h)))),
          React.createElement('tbody', null,
            shown.length === 0
              ? React.createElement('tr', null, React.createElement('td',{colSpan:7,className:'px-4 py-10 text-center text-slate-400 text-sm'},'No actions configured'))
              : shown.map(a => { const f = fieldMeta(a.pillar, a.event.field); const pmm = ACTION_PILLAR_META[a.pillar] || ACTION_PILLAR_META.customer;
                  return React.createElement('tr', { key:a.id, onClick:()=>setOpenId(a.id),
                    className:'border-b last:border-0 hover:bg-indigo-50 cursor-pointer transition-colors' },
                    React.createElement('td', { className:'px-4 py-3 font-medium text-slate-900' }, a.name),
                    React.createElement('td', { className:'px-4 py-3' },
                      React.createElement('div', { className:'flex items-center gap-2' },
                        React.createElement(Avatar, { user:USERS[a.ownerId] || USERS.maya }),
                        React.createElement('span', { className:'text-xs text-slate-700' }, (USERS[a.ownerId]||{}).name || a.ownerId))),
                    React.createElement('td', { className:'px-4 py-3' },
                      React.createElement('div', { className:'flex items-center gap-1.5' },
                        React.createElement(CxPill, { tone:pmm.tone }, pmm.label),
                        React.createElement('span', { className:'text-xs text-slate-600' }, f?f.label:a.event.field))),
                    React.createElement('td', { className:'px-4 py-3 text-xs text-slate-600' },
                      a.scope === 'selected' ? (a.accountIds||[]).length + ' selected' : actionAccountCount(a, state.customers) + ' own accounts'),
                    React.createElement('td', { className:'px-4 py-3 text-xs text-slate-600' }, a.runs || 0),
                    React.createElement('td', { className:'px-4 py-3' }, React.createElement(CxPill, { tone:a.enabled?'green':'slate' }, a.enabled?'Yes':'No')),
                    React.createElement('td', { className:'px-4 py-3 text-right text-slate-300' }, '\u2192'));
                })
          ))))
  );
}

function ActionsPage(){
  const { state, dispatch } = useApp();
  const [openId, setOpenId] = useState(null);
  const [q, setQ] = useState('');
  const [building, setBuilding] = useState(null);
  const persona = state.persona || 'csm';

  // Support agents get the ticket SOP library instead of the customer one
  if (persona === 'support') return React.createElement(TicketActionLibrary, { state, dispatch, q, setQ, openId, setOpenId });

  const me = state.activeUser || 'maya';
  // A CSM sees and edits only the actions they built
  const actions = (state.actions || []).filter(a => (a.ownerId || 'maya') === me);
  const open = openId ? actions.find(a=>a.id===openId) : null;
  if (building) return React.createElement(ActionBuilder, {
    action: building === 'new' ? null : building, ownerId:me, customers:state.customers,
    onBack:()=>setBuilding(null),
    onSave:(a)=>{ dispatch({ type:'SAVE_ACTION', action:a }); setBuilding(null); }, dispatch });
  if (open) return React.createElement(ActionDetail, { action:open, onBack:()=>setOpenId(null), dispatch,
    onEdit:()=>{ setOpenId(null); setBuilding(open); } });

  // Actions cover both customer and contact attributes
  const shown = actions.filter(a =>
    (a.pillar === 'customer' || a.pillar === 'contact') &&
    (!q || a.name.toLowerCase().includes(q.toLowerCase())));

  return React.createElement('div', { className:'space-y-4' },
    React.createElement(Card, { className:'p-4 border-indigo-100 bg-gradient-to-br from-indigo-50/70 to-white' },
      React.createElement('p', { className:'text-sm font-semibold text-slate-900' }, 'Your action library'),
      React.createElement('p', { className:'text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed' },
        'Actions you have built. Each one watches a customer or contact attribute and runs on the accounts assigned to you \u2014 never on anyone else\u2019s. Build one with the drag-and-drop builder, and edit it whenever the motion changes.')
    ),

    React.createElement('div', { className:'flex items-center gap-3 flex-wrap' },
      React.createElement('input', { value:q, onChange:e=>setQ(e.target.value), placeholder:'Search actions\u2026',
        className:'px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500' }),
      React.createElement(Btn, { variant:'primary', size:'sm', onClick:()=>setBuilding('new') }, '+ New action'),
      React.createElement('span', { className:'text-sm text-slate-500 ml-auto' }, shown.length + ' action' + (shown.length===1?'':'s'))
    ),

    shown.length === 0
      ? React.createElement(Card, { className:'p-12 text-center' },
          React.createElement('p', { className:'text-3xl mb-2' }, '\u26A1'),
          React.createElement('p', { className:'text-sm text-slate-500' }, actions.length === 0
            ? 'No actions published yet \u2014 your admin clones customer automations here'
            : 'No actions match that filter')
        )
      : React.createElement('div', { className:'space-y-3' },
          shown.map(a => {
            const pm = AUTO_PILLAR_META[a.pillar];
            const f  = fieldMeta(a.pillar, a.event.field);
            const comms = a.steps.filter(s=>s.editable).length;
            return React.createElement(Card, { key:a.id, className:'p-4 hover:border-indigo-300 transition-colors cursor-pointer', onClick:()=>setOpenId(a.id) },
              React.createElement('div', { className:'flex items-start gap-3.5' },
                React.createElement('span', { className:`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${ADMIN_TONES[pm.tone]}` }, pm.icon),
                React.createElement('div', { className:'flex-1 min-w-0' },
                  React.createElement('div', { className:'flex items-center gap-2 flex-wrap' },
                    React.createElement('p', { className:'text-sm font-semibold text-slate-900' }, a.name),
                    React.createElement(CxPill, { tone:a.enabled?'green':'slate' }, a.enabled?'Active':'Paused'),
                    comms > 0 && React.createElement(CxPill, { tone:'blue' }, '\u270E ' + comms + ' editable message' + (comms===1?'':'s'))
                  ),
                  React.createElement('p', { className:'text-xs text-slate-500 mt-1' },
                    React.createElement('span', { className:'font-semibold text-slate-600' }, 'When: '),
                    (f?f.label:a.event.field) + ' ' + modeLabel(a.event.mode) + (a.event.to ? ' ' + a.event.to : '') +
                    (a.conditions.length ? ' \u00b7 ' + a.conditions.length + ' condition' + (a.conditions.length===1?'':'s') : '')),
                  React.createElement('div', { className:'flex gap-1.5 flex-wrap mt-2' },
                    a.steps.slice(0,4).map(st => React.createElement(CxPill, { key:st.key, tone: st.editable?'blue':'slate' }, st.icon + ' ' + st.label)),
                    a.steps.length > 4 && React.createElement(CxPill, { tone:'slate' }, '+' + (a.steps.length-4) + ' more'))
                ),
                React.createElement('div', { className:'flex flex-col items-end gap-1 flex-shrink-0' },
                  React.createElement('span', { className:'text-[10px] text-slate-400' }, a.runs + ' runs'),
                  React.createElement('span', { className:'text-[10px] text-slate-400' }, a.lastRun),
                  React.createElement('span', { className:'text-slate-300 mt-1' }, '\u2192'))
              )
            );
          })
        )
  );
}


// ── Admin \u203a Roles ──
function RolesAdmin({ onBack, dispatch }){
  const [grants, setGrants] = useState({});      // key -> per-role overrides
  const [roleFocus, setRoleFocus] = useState(null);
  const [q, setQ] = useState('');
  const [groupFilter, setGroupFilter] = useState('all');

  const granted = (p, i) => {
    const o = grants[p.key];
    return o && o[i] !== undefined ? o[i] : p.roles[i] === 1;
  };
  const toggle = (p, i) => setGrants(g => {
    const cur = g[p.key] || {};
    return { ...g, [p.key]: { ...cur, [i]: !granted(p, i) } };
  });
  const countFor = (i) => ALL_PRIVILEGES.filter(p => granted(p, i)).length;

  const groups = PRIVILEGE_GROUPS
    .filter(g => groupFilter === 'all' || g.group === groupFilter)
    .map(g => ({ ...g, items: g.items.filter(p => !q ||
        p.label.toLowerCase().includes(q.toLowerCase()) ||
        p.desc.toLowerCase().includes(q.toLowerCase()) ||
        p.key.includes(q.toLowerCase())) }))
    .filter(g => g.items.length > 0);

  const shownCount = groups.reduce((n,g)=>n+g.items.length, 0);

  // ── Single-role drill-down ──
  if (roleFocus !== null) {
    const role = APP_ROLES[roleFocus];
    const allowed = [], denied = [];
    PRIVILEGE_GROUPS.forEach(g => g.items.forEach(p =>
      (granted(p, roleFocus) ? allowed : denied).push({ ...p, group:g.group, icon:g.icon })));

    return React.createElement('div', { className:'space-y-4' },
      React.createElement(AdminCrumb, {
        trail:['Admin','Roles', role.label],
        onNavigate:(i)=>{ if(i===0) onBack(); else setRoleFocus(null); }
      }),
      React.createElement(Card, { className:'p-5' },
        React.createElement('div', { className:'flex items-center gap-3 flex-wrap' },
          React.createElement('span', { className:`px-2.5 py-1 rounded-lg text-sm font-bold ${ADMIN_TONES[role.tone]}` }, role.label),
          React.createElement('p', { className:'text-sm text-slate-600 flex-1 min-w-[240px]' }, role.desc),
          React.createElement('div', { className:'flex gap-4' },
            React.createElement('div', { className:'text-right' },
              React.createElement('p', { className:'text-xl font-bold text-green-600' }, allowed.length),
              React.createElement('p', { className:'text-[10px] text-slate-400 uppercase tracking-wider' }, 'granted')),
            React.createElement('div', { className:'text-right' },
              React.createElement('p', { className:'text-xl font-bold text-slate-300' }, denied.length),
              React.createElement('p', { className:'text-[10px] text-slate-400 uppercase tracking-wider' }, 'denied')))
        )
      ),
      React.createElement('div', { className:'grid grid-cols-2 gap-4 items-start' },
        [['Granted', allowed, 'green'], ['Not granted', denied, 'slate']].map(([title, list, tone]) =>
          React.createElement(Card, { key:title, className:'p-4' },
            React.createElement(CxLabel, { right:React.createElement(CxPill,{tone}, list.length) }, title),
            list.length === 0
              ? React.createElement('p', { className:'text-xs text-slate-400 italic' }, 'None')
              : React.createElement('div', { className:'space-y-1.5 max-h-[420px] overflow-y-auto pr-1' },
                  list.map(p => React.createElement('div', { key:p.key, className:'flex items-start gap-2' },
                    React.createElement('span', { className:`text-xs flex-shrink-0 mt-0.5 ${tone==='green'?'text-green-500':'text-slate-300'}` }, tone==='green'?'\u2713':'\u2715'),
                    React.createElement('div', { className:'min-w-0' },
                      React.createElement('p', { className:'text-xs font-semibold text-slate-700' }, p.label),
                      React.createElement('p', { className:'text-[10px] text-slate-400' }, p.group + ' \u00b7 ' + p.key))
                  ))
                )
          ))
      )
    );
  }

  // ── Matrix ──
  return React.createElement('div', { className:'space-y-4' },
    React.createElement(AdminCrumb, {
      trail:['Admin','Roles'], onNavigate:()=>onBack(),
      actions: React.createElement('div', { className:'flex gap-2 flex-wrap' },
        React.createElement('input', { value:q, onChange:e=>setQ(e.target.value), placeholder:'Search privileges\u2026',
          className:'text-xs border border-slate-200 rounded-lg px-3 py-1.5 w-48 outline-none focus:border-indigo-400' }),
        React.createElement('select', { value:groupFilter, onChange:e=>setGroupFilter(e.target.value),
          className:'text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white outline-none focus:border-indigo-400' },
          React.createElement('option',{value:'all'},'All groups'),
          PRIVILEGE_GROUPS.map(g=>React.createElement('option',{key:g.group,value:g.group},g.group))),
        Object.keys(grants).length > 0 && React.createElement(Btn, { variant:'ghost', size:'xs', onClick:()=>setGrants({}) }, 'Reset changes'),
        React.createElement(Btn, { variant:'primary', size:'xs',
          onClick:()=>dispatch && dispatch({type:'ADD_TOAST',msg:'Role privileges saved',toastType:'success'}) }, 'Save')
      )
    }),

    React.createElement('p', { className:'text-sm text-slate-500' },
      'These are the same roles offered in Profile settings \u203a Configuration. Every privilege is listed individually \u2014 tick a cell to grant it to that role.'),

    // Role summary cards
    React.createElement('div', { className:'grid grid-cols-5 gap-3' },
      APP_ROLES.map((r,i) => React.createElement('button', {
        key:r.id, onClick:()=>setRoleFocus(i),
        className:'text-left bg-white border border-slate-200 rounded-xl p-3 hover:border-indigo-300 hover:shadow-sm transition-all'
      },
        React.createElement('span', { className:`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold ${ADMIN_TONES[r.tone]}` }, r.label),
        React.createElement('p', { className:'text-lg font-bold text-slate-900 mt-2' }, countFor(i),
          React.createElement('span', { className:'text-xs font-normal text-slate-400' }, ' / ' + ALL_PRIVILEGES.length)),
        React.createElement('p', { className:'text-[10px] text-slate-400 uppercase tracking-wider' }, 'privileges'),
        React.createElement('div', { className:'h-1 bg-slate-100 rounded-full mt-2' },
          React.createElement('div', { className:'h-1 rounded-full bg-indigo-500', style:{ width:(countFor(i)/ALL_PRIVILEGES.length*100)+'%' } }))
      ))
    ),

    // Privilege matrix
    React.createElement(Card, { className:'overflow-hidden' },
      React.createElement('div', { className:'overflow-x-auto' },
        React.createElement('table', { className:'w-full text-sm' },
          React.createElement('thead', null, React.createElement('tr', { className:'bg-slate-50 border-b' },
            React.createElement('th', { className:'px-4 py-3 text-left text-xs font-medium text-slate-500 min-w-[300px]' }, 'Privilege'),
            APP_ROLES.map(r => React.createElement('th', { key:r.id,
              className:'px-3 py-3 text-center text-xs font-medium text-slate-500 whitespace-nowrap' },
              React.createElement('button', { onClick:()=>setRoleFocus(APP_ROLES.indexOf(r)), className:'hover:text-indigo-600' }, r.label)))
          )),
          React.createElement('tbody', null,
            shownCount === 0
              ? React.createElement('tr', null, React.createElement('td', { colSpan:6, className:'px-4 py-10 text-center text-slate-400 text-sm' }, 'No privileges match that search'))
              : groups.map(g => React.createElement(React.Fragment, { key:g.group },
                  React.createElement('tr', { className:'bg-slate-50/70 border-b' },
                    React.createElement('td', { colSpan:6, className:'px-4 py-1.5' },
                      React.createElement('span', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider' }, g.icon + '  ' + g.group))),
                  g.items.map(p => React.createElement('tr', { key:p.key, className:'border-b last:border-0 hover:bg-slate-50' },
                    React.createElement('td', { className:'px-4 py-2.5' },
                      React.createElement('p', { className:'text-sm font-medium text-slate-800' }, p.label),
                      React.createElement('p', { className:'text-[11px] text-slate-500' }, p.desc),
                      React.createElement('p', { className:'text-[10px] text-slate-300 font-mono mt-0.5' }, p.key)),
                    APP_ROLES.map((r,i) => React.createElement('td', { key:r.id, className:'px-3 py-2.5 text-center' },
                      React.createElement('button', {
                        onClick:()=>toggle(p,i),
                        title:(granted(p,i)?'Revoke from ':'Grant to ') + r.label,
                        className:`w-6 h-6 rounded-md border transition-colors ${granted(p,i)
                          ? 'bg-green-500 border-green-500 text-white hover:bg-green-600'
                          : 'bg-white border-slate-200 text-transparent hover:border-slate-400'}`
                      }, '\u2713')
                    ))
                  ))
                ))
          )
        )
      )
    ),

    React.createElement('p', { className:'text-[11px] text-slate-400' },
      shownCount + ' of ' + ALL_PRIVILEGES.length + ' privileges shown across ' + APP_ROLES.length + ' roles.' +
      (Object.keys(grants).length ? '  \u00b7  ' + Object.keys(grants).length + ' privilege(s) modified \u2014 unsaved.' : ''))
  );
}


// ============================================================
// ADMIN — EMAIL CONFIGURATION & USER MANAGEMENT
// ============================================================

// Per-agent mailbox connection state. maya reflects live app state; the rest are
// how other CSMs have (or have not) connected from their own Profile settings.
const AGENT_MAILBOXES = {
  maya:   { connected:true,  provider:'gmail', method:'OAuth 2.0',      address:'maya.chen@cx42.io',    connectedOn:'Jun 14, 2025', synced:'12 minutes ago', scopes:['read','send','calendar'] },
  james:  { connected:true,  provider:'o365',  method:'Microsoft Graph', address:'james.park@cx42.io',   connectedOn:'Jul 02, 2025', synced:'38 minutes ago', scopes:['read','send'] },
  sarah:  { connected:true,  provider:'gmail', method:'OAuth 2.0',      address:'sarah.kim@cx42.io',    connectedOn:'May 28, 2025', synced:'4 hours ago',    scopes:['read','send','calendar'] },
  daniel: { connected:false, provider:null,    method:null,             address:'daniel.ortiz@cx42.io', connectedOn:null,           synced:null,             scopes:[] },
  priya:  { connected:false, provider:null,    method:null,             address:'priya.raman@cx42.io',  connectedOn:null,           synced:null,             scopes:[] },
};

const EMAIL_AUTH_METHODS = [
  { id:'oauth_google', label:'Google OAuth 2.0',  icon:'\u2709',    status:'enabled',
    note:'Agents authorise Gmail and Calendar from Profile settings. Tokens refresh automatically.',
    detail:['Scopes: gmail.readonly, gmail.send, calendar.events','Token lifetime: 60 minutes, auto-refreshed','Consent screen: verified'] },
  { id:'graph_ms',     label:'Microsoft Graph',   icon:'\u{1F4E7}', status:'enabled',
    note:'Delegated Graph permissions for Outlook mail and calendar.',
    detail:['Scopes: Mail.Read, Mail.Send, Calendars.ReadWrite','Tenant: cx42.onmicrosoft.com','Admin consent: granted'] },
  { id:'imap',         label:'IMAP / SMTP',       icon:'\u{1F5A5}', status:'disabled',
    note:'Manual server configuration. Less secure \u2014 only enable where OAuth is unavailable.',
    detail:['Requires per-agent app passwords','No calendar sync','Not recommended for new setups'] },
];

const FORWARDING_RULES = [
  { id:'fw1', address:'support@cx42.io',       target:'Support queue',        creates:'Ticket', verified:true,  received:1284, note:'Primary inbound support address.' },
  { id:'fw2', address:'escalations@cx42.io',   target:'Escalation queue',     creates:'Ticket \u00b7 P1', verified:true, received:96, note:'Auto-sets priority to P1 on arrival.' },
  { id:'fw3', address:'success@cx42.io',       target:'Assigned CSM',         creates:'Ticket', verified:true,  received:412, note:'Routed by account domain to the owning CSM.' },
  { id:'fw4', address:'renewals@cx42.io',      target:'Renewals queue',       creates:'Ticket', verified:false, received:0,   note:'DNS verification pending \u2014 add the MX record.' },
];

// Login / logout audit trail per agent
const AGENT_AUDIT = {
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

// Agent directory metadata layered over USERS
const AGENT_META = {
  maya:   { roleLabel:'CSM',           lastActive:'2 minutes ago',  status:'active',   accounts:8, joined:'Mar 2023' },
  james:  { roleLabel:'CSM',           lastActive:'1 hour ago',     status:'active',   accounts:7, joined:'Sep 2023' },
  sarah:  { roleLabel:'Senior CSM',    lastActive:'Yesterday',      status:'active',   accounts:6, joined:'Jan 2023' },
  daniel: { roleLabel:'Manager',       lastActive:'3 hours ago',    status:'active',   accounts:0, joined:'Nov 2022' },
  priya:  { roleLabel:'Team Lead',     lastActive:'5 days ago',     status:'inactive', accounts:3, joined:'Feb 2024' },
};

// ── Admin \u203a Email configuration ──
function EmailConfigAdmin({ onBack, dispatch, state }){
  const cfg = state.emailConfig || EMAIL_CONFIG_DEFAULTS;
  const supportBoxes = state.supportMailboxes || SUPPORT_MAILBOXES;
  const [tab, setTab] = useState('mailboxes');
  const [wizOpen, setWizOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  // Local drafts so a tab can be edited then saved, rather than dispatching on
  // every keystroke.
  const [thr, setThr] = useState(cfg.threading);
  const [loop, setLoop] = useState(cfg.loop);
  const [bl, setBl] = useState(cfg.blacklist);
  const [dkimDomain, setDkimDomain] = useState(cfg.dkim.domain);
  const [coDomains, setCoDomains] = useState((cfg.companyDomains||[]).join('\n'));
  const [exDomains, setExDomains] = useState((cfg.excludedDomains||[]).join('\n'));
  const [newDomain, setNewDomain] = useState('');
  const [newExcluded, setNewExcluded] = useState('');

  const agents = Object.keys(USERS);
  const mailboxFor = (id) => id === 'maya' && state && state.mailbox
    ? Object.assign({}, AGENT_MAILBOXES.maya, { connected:state.mailbox.connected, address:state.mailbox.address || AGENT_MAILBOXES.maya.address,
        synced:state.mailbox.synced, connectedOn:state.mailbox.connectedOn || AGENT_MAILBOXES.maya.connectedOn, scopes:state.mailbox.scopes || AGENT_MAILBOXES.maya.scopes })
    : AGENT_MAILBOXES[id] || { connected:false, scopes:[] };
  const connectedAgents = agents.filter(id=>mailboxFor(id).connected);

  const emails = state.emails || [];
  const mappedCount = emails.filter(e => e.routing && e.routing.bucket === 'mapped').length;
  const unmappedCount = emails.length - mappedCount;

  const inp = 'w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400';
  const lbl = 'text-[10px] font-bold text-slate-400 uppercase tracking-wider';
  const parseDomains = (s) => s.split(/[\n,]/).map(x=>x.trim().toLowerCase().replace(/^@/,'')).filter(Boolean);

  const row = (title, desc, right) => React.createElement('div', { key:title, className:'flex items-start justify-between gap-4 py-3 border-b border-slate-50 last:border-0' },
    React.createElement('div', { className:'flex-1 min-w-0' },
      React.createElement('p', { className:'text-sm font-medium text-slate-800' }, title),
      desc && React.createElement('p', { className:'text-xs text-slate-500 mt-0.5 leading-relaxed' }, desc)),
    React.createElement('div', { className:'flex-shrink-0' }, right));

  return React.createElement('div', { className:'space-y-4' },
    React.createElement(AdminCrumb, { trail:['Admin','Email configuration'], onNavigate:()=>onBack() }),

    React.createElement('div', { className:'grid grid-cols-4 gap-4' },
      React.createElement(MetricCard, { label:'Support mailboxes', value:supportBoxes.length, sub:supportBoxes.filter(m=>m.connected).length + ' connected' }),
      React.createElement(MetricCard, { label:'CSM mailboxes', value:connectedAgents.length + '/' + agents.length, sub:'connected by the CSM' }),
      React.createElement(MetricCard, { label:'Mapped to accounts', value:mappedCount, sub:'of ' + emails.length + ' pulled messages' }),
      React.createElement(MetricCard, { label:'Unmapped', value:unmappedCount, sub:'internal or no matching domain' })
    ),

    React.createElement(Tabs, { tabs:[
      { id:'mailboxes', label:'Mailboxes \u00b7 ' + (supportBoxes.length + connectedAgents.length) },
      { id:'domains',   label:'Domains' },
      { id:'threading', label:'Threading' },
      { id:'dkim',      label:'DKIM' },
      { id:'loop',      label:'Loop protection' },
      { id:'blacklist', label:'Blacklisting' },
    ], active:tab, onChange:setTab }),

    // ══ MAILBOXES ══
    tab === 'mailboxes' && React.createElement('div', { className:'space-y-4' },

      React.createElement(Card, { className:'overflow-hidden' },
        React.createElement('div', { className:'px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap' },
          React.createElement('div', null,
            React.createElement('p', { className:'text-sm font-semibold text-slate-900' }, 'Support mailboxes'),
            React.createElement('p', { className:'text-[11px] text-slate-500 mt-0.5' }, 'Shared inboxes an admin connects. Mail arriving here becomes a ticket.')),
          React.createElement(Btn, { variant:'primary', size:'xs', onClick:()=>setWizOpen(true) }, '+ Add mailbox')),
        React.createElement('table', { className:'w-full text-sm' },
          React.createElement('thead', null, React.createElement('tr', { className:'bg-slate-50 border-b' },
            ['Mailbox','Provider','Routes to','Creates','Received (30d)','Status',''].map((h,i)=>
              React.createElement('th',{key:i,className:'px-4 py-2.5 text-left text-xs font-medium text-slate-500'},h)))),
          React.createElement('tbody', null,
            supportBoxes.map(m => React.createElement('tr', { key:m.id, className:'border-b last:border-0 hover:bg-slate-50' },
              React.createElement('td', { className:'px-4 py-2.5' },
                React.createElement('div', { className:'flex items-center gap-2 flex-wrap' },
                  React.createElement('span', { className:'font-mono text-xs font-semibold text-slate-800' }, m.address),
                  m.isDefault && React.createElement(CxPill, { tone:'blue' }, 'Default')),
                React.createElement('p', { className:'text-[11px] text-slate-400 mt-0.5' }, m.owner)),
              React.createElement('td', { className:'px-4 py-2.5 text-xs text-slate-600' }, m.method),
              React.createElement('td', { className:'px-4 py-2.5 text-xs text-slate-600' }, m.routesTo),
              React.createElement('td', { className:'px-4 py-2.5' }, React.createElement(CxPill, { tone:'slate' }, m.creates)),
              React.createElement('td', { className:'px-4 py-2.5 text-xs font-semibold text-slate-700' }, (m.received30d||0).toLocaleString()),
              React.createElement('td', { className:'px-4 py-2.5' },
                React.createElement(CxPill, { tone:m.connected?'green':'amber' }, m.connected ? '\u25CF Connected' : '\u25CB Not connected')),
              React.createElement('td', { className:'px-4 py-2.5 text-right whitespace-nowrap' },
                React.createElement('button', { onClick:()=>setEditId(m.id), className:'text-xs text-indigo-600 hover:underline mr-3' }, 'Edit'),
                !m.isDefault && React.createElement('button', { onClick:()=>dispatch({type:'UPDATE_SUPPORT_MAILBOX', id:m.id, patch:{ isDefault:true }, msg:m.address + ' is now the default'}),
                  className:'text-xs text-slate-500 hover:underline mr-3' }, 'Make default'),
                !m.isDefault && React.createElement('button', { onClick:()=>dispatch({type:'REMOVE_SUPPORT_MAILBOX', id:m.id}),
                  className:'text-xs text-slate-400 hover:text-red-600' }, 'Remove'))
            )))
        )
      ),

      React.createElement(Card, { className:'overflow-hidden' },
        React.createElement('div', { className:'px-4 py-3 border-b border-slate-100' },
          React.createElement('div', { className:'flex items-center gap-2 flex-wrap' },
            React.createElement('p', { className:'text-sm font-semibold text-slate-900' }, 'CSM mailboxes'),
            React.createElement(CxPill, { tone:'slate' }, 'View only')),
          React.createElement('p', { className:'text-[11px] text-slate-500 mt-0.5' },
            'Each CSM authorises their own mailbox by OAuth from Profile settings. An admin can see the grant but cannot create, edit or revoke it here.')),
        React.createElement('table', { className:'w-full text-sm' },
          React.createElement('thead', null, React.createElement('tr', { className:'bg-slate-50 border-b' },
            ['CSM','Mailbox','Auth method','Scopes granted','Connected on','Last sync'].map((h,i)=>
              React.createElement('th',{key:i,className:'px-4 py-2.5 text-left text-xs font-medium text-slate-500'},h)))),
          React.createElement('tbody', null,
            agents.map(id => { const u = USERS[id], mb = mailboxFor(id);
              return React.createElement('tr', { key:id, className:'border-b last:border-0 hover:bg-slate-50' },
                React.createElement('td', { className:'px-4 py-2.5' },
                  React.createElement('div', { className:'flex items-center gap-2' },
                    React.createElement(Avatar, { user:u }),
                    React.createElement('span', { className:'font-medium text-slate-800' }, u.name))),
                React.createElement('td', { className:'px-4 py-2.5 text-xs text-slate-600 font-mono' }, mb.address || '\u2014'),
                React.createElement('td', { className:'px-4 py-2.5' },
                  mb.connected ? React.createElement(CxPill, { tone:'green' }, mb.method || 'OAuth 2.0')
                               : React.createElement('span', { className:'text-xs text-slate-300' }, 'Not connected')),
                React.createElement('td', { className:'px-4 py-2.5' },
                  (mb.scopes||[]).length
                    ? React.createElement('div',{className:'flex gap-1 flex-wrap'}, mb.scopes.map(sc=>React.createElement(CxPill,{key:sc,tone:'slate'},sc)))
                    : React.createElement('span',{className:'text-slate-300 text-xs'},'\u2014')),
                React.createElement('td', { className:'px-4 py-2.5 text-xs text-slate-500' }, mb.connectedOn || '\u2014'),
                React.createElement('td', { className:'px-4 py-2.5 text-xs text-slate-500' }, mb.synced || '\u2014')
              );
            })
          )
        )
      ),

      React.createElement(MailboxWizard, { open:wizOpen, onClose:()=>setWizOpen(false), dispatch, cfg }),
      React.createElement(MailboxEditModal, { mailbox: supportBoxes.find(m=>m.id===editId) || null, onClose:()=>setEditId(null), dispatch })
    ),

    // ══ DOMAINS ══
    tab === 'domains' && React.createElement('div', { className:'space-y-4' },
      React.createElement(Card, { className:'p-4 bg-indigo-50/40 border-indigo-100' },
        React.createElement('p', { className:'text-sm text-slate-700 leading-relaxed' },
          'These two lists decide what happens to every message pulled from a mailbox. A message with at least one participant outside both lists is mapped to the matching customer account and appears in that account\u2019s Interactions tab. A message with no such participant stays in My Work only and is never mapped to an account.')),

      React.createElement('div', { className:'grid grid-cols-2 gap-4 items-start' },
        React.createElement(Card, { className:'p-4' },
          React.createElement(CxLabel, { right:React.createElement(CxPill,{tone:'blue'}, parseDomains(coDomains).length + ' domains') }, 'Company domains'),
          React.createElement('p', { className:'text-xs text-slate-500 mb-2 leading-relaxed' },
            'Our own staff. Mail where every participant is on one of these is internal \u2014 it shows in My Work but is never attached to a customer.'),
          React.createElement('div', { className:'flex gap-2 mb-2' },
            React.createElement('input', { value:newDomain, onChange:e=>setNewDomain(e.target.value), placeholder:'acme.com',
              onKeyDown:e=>{ if(e.key==='Enter' && newDomain.trim()){ setCoDomains(v=>(v?v+'\n':'')+newDomain.trim()); setNewDomain(''); } },
              className:inp + ' font-mono text-xs' }),
            React.createElement(Btn, { variant:'secondary', size:'sm', disabled:!newDomain.trim(),
              onClick:()=>{ setCoDomains(v=>(v?v+'\n':'')+newDomain.trim()); setNewDomain(''); } }, 'Add')),
          React.createElement('textarea', { value:coDomains, onChange:e=>setCoDomains(e.target.value), rows:6,
            className:inp + ' font-mono text-xs resize-y' }),
          React.createElement('p', { className:'text-[11px] text-slate-400 mt-1' }, 'One per line. Subdomains are matched automatically.')),

        React.createElement(Card, { className:'p-4' },
          React.createElement(CxLabel, { right:React.createElement(CxPill,{tone:'amber'}, parseDomains(exDomains).length + ' domains') }, 'Excluded domains'),
          React.createElement('p', { className:'text-xs text-slate-500 mb-2 leading-relaxed' },
            'Public and consumer mail providers. An address on one of these is never treated as a customer, so a personal address can never create or map to an account.'),
          React.createElement('div', { className:'flex gap-2 mb-2' },
            React.createElement('input', { value:newExcluded, onChange:e=>setNewExcluded(e.target.value), placeholder:'gmail.com',
              onKeyDown:e=>{ if(e.key==='Enter' && newExcluded.trim()){ setExDomains(v=>(v?v+'\n':'')+newExcluded.trim()); setNewExcluded(''); } },
              className:inp + ' font-mono text-xs' }),
            React.createElement(Btn, { variant:'secondary', size:'sm', disabled:!newExcluded.trim(),
              onClick:()=>{ setExDomains(v=>(v?v+'\n':'')+newExcluded.trim()); setNewExcluded(''); } }, 'Add')),
          React.createElement('textarea', { value:exDomains, onChange:e=>setExDomains(e.target.value), rows:6,
            className:inp + ' font-mono text-xs resize-y' }),
          React.createElement('p', { className:'text-[11px] text-slate-400 mt-1' }, 'One per line. Exact match only \u2014 subdomains are not excluded.'))
      ),

      React.createElement(Card, { className:'p-4' },
        React.createElement(CxLabel, null, 'Test the routing rules'),
        React.createElement(DomainTester, { cfg:{ ...cfg, companyDomains:parseDomains(coDomains), excludedDomains:parseDomains(exDomains) }, customers:state.customers })),

      React.createElement('div', { className:'flex justify-end gap-2' },
        React.createElement(Btn, { variant:'secondary', onClick:()=>{ setCoDomains((cfg.companyDomains||[]).join('\n')); setExDomains((cfg.excludedDomains||[]).join('\n')); } }, 'Reset'),
        React.createElement(Btn, { variant:'primary',
          onClick:()=>dispatch({ type:'SET_EMAIL_DOMAINS', companyDomains:parseDomains(coDomains), excludedDomains:parseDomains(exDomains) }) },
          'Save domains and re-route inbox'))
    ),

    // ══ THREADING ══
    tab === 'threading' && React.createElement('div', { className:'space-y-4' },
      React.createElement(Card, { className:'p-4 bg-indigo-50/40 border-indigo-100' },
        React.createElement('p', { className:'text-sm text-slate-700 leading-relaxed' },
          'Threading decides whether an incoming reply reopens the original ticket or creates a new one. The decision is made on the message headers, not on what is displayed on screen.')),

      React.createElement(Card, { className:'p-4' },
        React.createElement(CxLabel, null, 'Match rules'),
        row('Match on Message-ID / In-Reply-To headers',
          'When on, a reply is threaded only if its In-Reply-To or References header matches a Message-ID we sent. Subject-line matching is deliberately not used \u2014 it threads unrelated mail together.',
          React.createElement(AdminToggle, { on:thr.matchHeaders, onChange:()=>setThr(t=>({...t, matchHeaders:!t.matchHeaders})), label:thr.matchHeaders?'On':'Off' })),
        row('Reopen ticket if a matching reply arrives within',
          'Outside this window the reply becomes a new ticket, linked to the original. Keeps a months-later reply from reviving a closed ticket.',
          React.createElement('select', { value:thr.reopenWindowDays, onChange:e=>setThr(t=>({...t, reopenWindowDays:Number(e.target.value)})),
            className:'text-sm border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-400' },
            [1,3,7,30].map(d=>React.createElement('option',{key:d,value:d}, d + (d===1?' day':' days'))))),
        row('Add forwarded-thread replies as a private note',
          'When an agent forwards a thread to a third party and that person replies, the reply attaches to the original ticket as a private note. Not a public reply, and not a new ticket \u2014 so a partner\u2019s words are never sent on to the customer by accident.',
          React.createElement(AdminToggle, { on:thr.forwardRepliesAsNote, onChange:()=>setThr(t=>({...t, forwardRepliesAsNote:!t.forwardRepliesAsNote})), label:thr.forwardRepliesAsNote?'On':'Off' }))
      ),

      React.createElement(Card, { className:'p-4' },
        React.createElement(CxLabel, { right:React.createElement(CxPill,{tone:'slate'},'Worked example') }, 'How this plays out'),
        React.createElement('div', { className:'space-y-2' },
          [
            ['1', 'Mon 09:00', 'Agent resolves SUP1842.', 'Ticket status \u2192 Resolved. Our outbound carries Message-ID <sup1842.a7f@acme.com>.', 'slate'],
            ['2', 'Tue 11:20', 'Customer replies to that same email.', 'In-Reply-To matches, and 1 day is inside the ' + thr.reopenWindowDays + '-day window \u2192 SUP1842 reopens. No duplicate.', 'green'],
            ['3', 'Day ' + (thr.reopenWindowDays + 12), 'Customer replies again to the same thread.', 'Header still matches but the reply is outside the ' + thr.reopenWindowDays + '-day window \u2192 a new ticket is created and linked to SUP1842.', 'amber'],
            ['4', 'Wed 14:05', 'Customer writes a fresh email with no In-Reply-To header.', 'Nothing to match \u2192 new ticket, whatever the subject line says.', 'amber'],
            ['5', 'Wed 15:40', 'Agent forwards the thread to billing@partner.com.', 'Forward is recorded on the ticket and the partner gets the quoted thread.', 'slate'],
            ['6', 'Thu 08:15', 'billing@partner.com replies.', thr.forwardRepliesAsNote
                ? 'Attaches to SUP1842 as a private note. The customer never sees it and no new ticket is opened.'
                : 'Rule is off \u2014 the reply would create its own ticket, splitting the conversation.', thr.forwardRepliesAsNote ? 'green' : 'red'],
          ].map(s => React.createElement('div', { key:s[0], className:'flex items-start gap-3 border border-slate-200 rounded-lg p-2.5' },
            React.createElement('span', { className:'w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5' }, s[0]),
            React.createElement('div', { className:'flex-1 min-w-0' },
              React.createElement('div', { className:'flex items-center gap-2 flex-wrap' },
                React.createElement('span', { className:'text-[11px] font-mono text-slate-400' }, s[1]),
                React.createElement('p', { className:'text-sm font-semibold text-slate-800' }, s[2])),
              React.createElement('p', { className:'text-xs text-slate-500 mt-0.5 leading-relaxed' }, s[3])),
            React.createElement(CxPill, { tone:s[4] }, s[4]==='green'?'Threaded':s[4]==='red'?'Split':s[4]==='amber'?'New ticket':'Setup'))))
      ),

      React.createElement('div', { className:'flex justify-end' },
        React.createElement(Btn, { variant:'primary', onClick:()=>dispatch({ type:'UPDATE_EMAIL_CONFIG', section:'threading', patch:thr, msg:'Threading rules saved' }) }, 'Save threading rules'))
    ),

    // ══ DKIM ══
    tab === 'dkim' && React.createElement(DkimPanel, { cfg, dispatch, domain:dkimDomain, setDomain:setDkimDomain }),

    // ══ LOOP PROTECTION ══
    tab === 'loop' && React.createElement('div', { className:'space-y-4' },
      React.createElement(Card, { className:'p-4 bg-red-50/50 border-red-100' },
        React.createElement('div', { className:'flex items-start gap-3' },
          React.createElement('span', { className:'text-lg' }, '\u26A0'),
          React.createElement('div', null,
            React.createElement('p', { className:'text-sm font-semibold text-red-800' }, 'Safety critical \u2014 not a nice-to-have'),
            React.createElement('p', { className:'text-xs text-red-700 mt-0.5 leading-relaxed' },
              'Two systems replying to each other will send thousands of emails in minutes, breach the sending domain\u2019s reputation and bury the real queue. These caps are the only thing that stops it. Turning them off should be a deliberate, reversible decision.')))),

      React.createElement(Card, { className:'p-4' },
        React.createElement(CxLabel, null, 'Auto-responder detection'),
        row('Detect auto-responders and out-of-office replies',
          'Matches on Auto-Submitted, X-Autoreply and Precedence: bulk headers plus common out-of-office phrasing.',
          React.createElement(AdminToggle, { on:loop.detectAutoResponders, onChange:()=>setLoop(l=>({...l, detectAutoResponders:!l.detectAutoResponders})), label:loop.detectAutoResponders?'On':'Off' })),
        row('Suppress further automated replies once detected',
          'After an auto-responder is identified on a thread, automations stop emailing that address. A human reply still goes through.',
          React.createElement(AdminToggle, { on:loop.suppressAfterDetect, onChange:()=>setLoop(l=>({...l, suppressAfterDetect:!l.suppressAfterDetect})), label:loop.suppressAfterDetect?'On':'Off' }))
      ),

      React.createElement(Card, { className:'p-4' },
        React.createElement(CxLabel, null, 'Hard caps'),
        row('Maximum automated emails to the same recipient, per hour',
          'Counted per recipient address across every ticket and automation. Anything over the cap is dropped and logged.',
          React.createElement('input', { type:'number', min:1, max:100, value:loop.maxPerRecipientHour,
            onChange:e=>setLoop(l=>({...l, maxPerRecipientHour:Number(e.target.value)})),
            className:'w-20 text-sm border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-400' })),
        row('Maximum automation executions per ticket, per hour',
          'Stops a single ticket from looping through its own rules \u2014 the most common runaway pattern.',
          React.createElement('input', { type:'number', min:1, max:200, value:loop.maxAutomationsPerTicketHour,
            onChange:e=>setLoop(l=>({...l, maxAutomationsPerTicketHour:Number(e.target.value)})),
            className:'w-20 text-sm border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-400' }))
      ),

      React.createElement(Card, { className:'p-4' },
        React.createElement(CxLabel, null, 'Notification throttling'),
        row('Throttle notifications per recipient',
          'Collapses repeat notifications to the same person inside the window into a single message.',
          React.createElement(AdminToggle, { on:loop.throttleOn, onChange:()=>setLoop(l=>({...l, throttleOn:!l.throttleOn})), label:loop.throttleOn?'On':'Off' })),
        row('Throttle window', 'How long to wait before the same recipient can be notified again.',
          React.createElement('select', { value:loop.throttleWindowMin, disabled:!loop.throttleOn,
            onChange:e=>setLoop(l=>({...l, throttleWindowMin:Number(e.target.value)})),
            className:'text-sm border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-400 disabled:opacity-40' },
            [[10,'10 minutes'],[30,'30 minutes'],[60,'1 hour']].map(o=>React.createElement('option',{key:o[0],value:o[0]},o[1]))))
      ),

      React.createElement('div', { className:'flex justify-end' },
        React.createElement(Btn, { variant:'primary', onClick:()=>dispatch({ type:'UPDATE_EMAIL_CONFIG', section:'loop', patch:loop, msg:'Loop protection saved' }) }, 'Save loop protection'))
    ),

    // ══ BLACKLISTING ══
    tab === 'blacklist' && React.createElement('div', { className:'space-y-4' },
      React.createElement(Card, { className:'p-4 bg-indigo-50/40 border-indigo-100' },
        React.createElement('p', { className:'text-sm text-slate-700 leading-relaxed' },
          'When one contact\u2019s volume spikes past the threshold inside an hour, that address is blacklisted automatically and its mail stops creating tickets. Existing tickets are untouched. Any agent can lift it again from Contacts or from the error log.')),

      React.createElement(Card, { className:'p-4' },
        row('Auto-blacklist on surge', 'Applies to the sending address, not the whole customer domain.',
          React.createElement(AdminToggle, { on:bl.autoOnSurge, onChange:()=>setBl(b=>({...b, autoOnSurge:!b.autoOnSurge})), label:bl.autoOnSurge?'On':'Off' })),
        row('Surge threshold', 'Emails from one address within a rolling hour before it is blacklisted.',
          React.createElement('div', { className:'flex items-center gap-2' },
            React.createElement('input', { type:'number', min:5, max:500, value:bl.thresholdPerHour, disabled:!bl.autoOnSurge,
              onChange:e=>setBl(b=>({...b, thresholdPerHour:Number(e.target.value)})),
              className:'w-20 text-sm border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-400 disabled:opacity-40' }),
            React.createElement('span', { className:'text-xs text-slate-500' }, 'emails / hour')))
      ),

      React.createElement(Card, { className:'overflow-hidden' },
        React.createElement('div', { className:'px-4 py-3 border-b border-slate-100' },
          React.createElement('p', { className:'text-sm font-semibold text-slate-900' }, 'Blacklisted addresses'),
          React.createElement('p', { className:'text-[11px] text-slate-500 mt-0.5' }, 'Reversible \u2014 lifting the block resumes ticket creation from the next email.')),
        (cfg.blacklist.entries||[]).length === 0
          ? React.createElement('p', { className:'px-4 py-8 text-center text-sm text-slate-400' }, 'No addresses blacklisted')
          : React.createElement('table', { className:'w-full text-sm' },
              React.createElement('thead', null, React.createElement('tr', { className:'bg-slate-50 border-b' },
                ['Address','Reason','Blocked at','Status',''].map((h,i)=>
                  React.createElement('th',{key:i,className:'px-4 py-2.5 text-left text-xs font-medium text-slate-500'},h)))),
              React.createElement('tbody', null,
                cfg.blacklist.entries.map(e => React.createElement('tr', { key:e.id, className:'border-b last:border-0 hover:bg-slate-50' },
                  React.createElement('td', { className:'px-4 py-2.5 font-mono text-xs text-slate-800' }, e.email),
                  React.createElement('td', { className:'px-4 py-2.5 text-xs text-slate-600' }, e.reason),
                  React.createElement('td', { className:'px-4 py-2.5 text-xs text-slate-500' }, e.at),
                  React.createElement('td', { className:'px-4 py-2.5' },
                    React.createElement(CxPill, { tone:e.active?'red':'slate' }, e.active ? 'Blocked' : 'Lifted')),
                  React.createElement('td', { className:'px-4 py-2.5 text-right' },
                    React.createElement('button', { onClick:()=>dispatch({ type:'TOGGLE_BLACKLIST', id:e.id, msg: e.active ? 'Block lifted for ' + e.email : e.email + ' blocked again' }),
                      className:'text-xs text-indigo-600 hover:underline' }, e.active ? 'Lift block' : 'Re-block'))
                )))
            )
      ),

      React.createElement('div', { className:'flex justify-end' },
        React.createElement(Btn, { variant:'primary', onClick:()=>dispatch({ type:'UPDATE_EMAIL_CONFIG', section:'blacklist', patch:{ autoOnSurge:bl.autoOnSurge, thresholdPerHour:bl.thresholdPerHour }, msg:'Blacklisting rules saved' }) }, 'Save blacklisting rules'))
    )
  );
}

// Try an address against the current domain lists before saving them.
function DomainTester({ cfg, customers }){
  const [addr, setAddr] = useState('sarah.mitchell@acme-analytics.io');
  const r = routeEmail({ fromEmail:addr, to:'maya.chen@cx42.io' }, cfg, customers);
  const tone = r.bucket==='mapped' ? 'green' : r.bucket==='internal' ? 'slate' : 'amber';
  return React.createElement('div', null,
    React.createElement('div', { className:'flex gap-2 flex-wrap' },
      React.createElement('input', { value:addr, onChange:e=>setAddr(e.target.value), placeholder:'someone@somewhere.com',
        className:'flex-1 min-w-[240px] text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 font-mono' }),
      React.createElement(CxPill, { tone, className:'self-center px-3 py-1.5' },
        r.bucket==='mapped' ? 'Maps to an account' : r.bucket==='internal' ? 'Internal \u2014 no account' : 'External \u2014 no account match')),
    React.createElement('p', { className:'text-xs text-slate-500 mt-2 leading-relaxed' }, r.reason),
    React.createElement('div', { className:'flex gap-1.5 flex-wrap mt-2' },
      ['sarah.mitchell@acme-analytics.io','james.park@acme.com','devraman88@gmail.com','n.haddad@brightpath-consulting.com'].map(s =>
        React.createElement('button', { key:s, onClick:()=>setAddr(s),
          className:'px-2 py-1 rounded-md text-[10px] font-mono bg-slate-100 text-slate-600 hover:bg-indigo-100 hover:text-indigo-700' }, s)))
  );
}

// DKIM: generate a selector and TXT value, publish, verify, regenerate.
function DkimPanel({ cfg, dispatch, domain, setDomain }){
  const d = cfg.dkim;
  const statusPill = d.status === 'verified' ? React.createElement(CxPill,{tone:'green'},'\u2713 Published & verified')
    : d.status === 'generated' ? React.createElement(CxPill,{tone:'amber'},'\u26A0 Generated, not published')
    : React.createElement(CxPill,{tone:'slate'},'Not generated');

  const generate = () => {
    const sel = 'cx42' + Math.random().toString(36).slice(2,6);
    const key = Array.from({length:216}, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'[Math.floor(Math.random()*64)]).join('');
    dispatch({ type:'SET_DKIM', patch:{ domain, selector:sel, status:'generated',
      value:'v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA' + key },
      msg:'DKIM record generated \u2014 add it to DNS, then publish' });
  };

  return React.createElement('div', { className:'space-y-4' },
    React.createElement(Card, { className:'p-4 bg-indigo-50/40 border-indigo-100' },
      React.createElement('p', { className:'text-sm text-slate-700 leading-relaxed' },
        'DKIM signs outbound mail so receiving servers can prove it came from you. Without it, replies sent from CX42 on your domain are far more likely to land in spam.')),

    React.createElement(Card, { className:'p-4' },
      React.createElement(CxLabel, { right:statusPill }, 'Signing domain'),
      React.createElement('div', { className:'flex gap-2 flex-wrap' },
        React.createElement('input', { value:domain, onChange:e=>setDomain(e.target.value),
          className:'flex-1 min-w-[220px] text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 font-mono' }),
        React.createElement(Btn, { variant:'primary', size:'sm', onClick:generate },
          d.status === 'none' ? 'Generate DKIM record' : 'Regenerate')),
      d.status !== 'none' && d.selector && React.createElement('p', { className:'text-[11px] text-slate-400 mt-2' },
        'Selector: ' + d.selector + '  \u00b7  Key: RSA 2048-bit')),

    d.status !== 'none' && React.createElement(Card, { className:'p-4' },
      React.createElement(CxLabel, { right:React.createElement(Btn, { variant:'secondary', size:'xs',
        onClick:()=>dispatch({ type:'ADD_TOAST', msg:'DNS record copied', toastType:'info' }) }, 'Copy') }, 'Add this record at your DNS provider'),
      React.createElement('div', { className:'bg-slate-900 rounded-xl p-3.5 overflow-x-auto' },
        [['Host', d.selector + '._domainkey.' + d.domain], ['Type', 'TXT'], ['Value', d.value]].map(r =>
          React.createElement('div', { key:r[0], className:'flex gap-3 py-1 items-start' },
            React.createElement('span', { className:'text-[10px] font-bold text-slate-500 uppercase tracking-wider w-12 flex-shrink-0 pt-0.5' }, r[0]),
            React.createElement('code', { className:'text-[11px] text-green-300 font-mono break-all leading-relaxed' }, r[1])))),
      React.createElement('div', { className:'flex gap-2 mt-3 flex-wrap' },
        d.status === 'generated' && React.createElement(Btn, { variant:'primary', size:'sm',
          onClick:()=>dispatch({ type:'SET_DKIM', patch:{ status:'verified' }, msg:'DKIM published and verified' }) }, 'Publish'),
        React.createElement(Btn, { variant:'secondary', size:'sm',
          onClick:()=>dispatch({ type:'SET_DKIM', patch:{ status: d.status==='verified' ? 'verified' : 'generated' }, msg: d.status==='verified' ? 'DNS re-verified \u2014 record still present' : 'DNS checked \u2014 record not found yet' }) }, 'Re-verify DNS'),
        React.createElement('span', { className:'text-[11px] text-slate-400 self-center' },
          d.status === 'verified' ? 'Outbound mail on this domain is signed.' : 'Mail is unsigned until this record resolves in DNS.'))
    )
  );
}

// Connection wizard for a new shared support mailbox.
function MailboxWizard({ open, onClose, dispatch, cfg }){
  const [step, setStep] = useState(1);
  const [d, setD] = useState({ address:'', label:'', provider:'o365', routesTo:'Support queue', creates:'Ticket', isDefault:false });

  useEffect(() => { if (open) { setStep(1); setD({ address:'', label:'', provider:'o365', routesTo:'Support queue', creates:'Ticket', isDefault:false }); } }, [open]);

  const inp = 'w-full mt-1 text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400';
  const lbl = 'text-[10px] font-bold text-slate-400 uppercase tracking-wider';
  const providers = [
    { id:'o365',  label:'Microsoft 365', method:'Microsoft Graph', icon:'\u{1F4E7}', scopes:['Mail.Read','Mail.Send'] },
    { id:'gmail', label:'Google Workspace', method:'OAuth 2.0',    icon:'\u2709',    scopes:['gmail.readonly','gmail.send'] },
    { id:'imap',  label:'Other (IMAP/SMTP)', method:'IMAP / SMTP', icon:'\u{1F5A5}', scopes:['imap','smtp'] },
  ];
  const prov = providers.find(p=>p.id===d.provider) || providers[0];
  const domainOk = !d.address || (cfg.companyDomains||[]).some(x => emailDomainOf(d.address) === x.toLowerCase());

  return React.createElement(Modal, { open, onClose, title:'Connect a support mailbox', size:'lg' },
    React.createElement('div', { className:'space-y-4' },

      React.createElement('div', { className:'flex items-center gap-2 flex-wrap' },
        [[1,'Address'],[2,'Authorise'],[3,'Routing'],[4,'Confirm']].map(s =>
          React.createElement('div', { key:s[0], className:'flex items-center gap-2' },
            React.createElement('span', { className:`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center ${step>=s[0]?'bg-indigo-600 text-white':'bg-slate-100 text-slate-400'}` }, s[0]),
            React.createElement('span', { className:`text-xs ${step===s[0]?'font-semibold text-slate-800':'text-slate-400'}` }, s[1]),
            s[0] < 4 && React.createElement('span', { className:'w-6 h-px bg-slate-200' })))),

      step === 1 && React.createElement('div', { className:'space-y-3' },
        React.createElement('div', null,
          React.createElement('label', { className:lbl }, 'Mailbox address'),
          React.createElement('input', { value:d.address, autoFocus:true, onChange:e=>setD(v=>({...v, address:e.target.value})),
            placeholder:'e.g. escalations@acme.com', className:inp + ' font-mono' }),
          !domainOk && React.createElement('p', { className:'text-[11px] text-amber-700 mt-1' },
            emailDomainOf(d.address) + ' is not in your company domains. Add it under the Domains tab or mail from this box will be treated as external.')),
        React.createElement('div', null,
          React.createElement('label', { className:lbl }, 'Display name'),
          React.createElement('input', { value:d.label, onChange:e=>setD(v=>({...v, label:e.target.value})),
            placeholder:'e.g. Escalations', className:inp }))),

      step === 2 && React.createElement('div', { className:'space-y-3' },
        React.createElement('p', { className:'text-xs text-slate-500 leading-relaxed' },
          'Choose the provider and authorise. CX42 requests read and send access only \u2014 no delete, no admin scope.'),
        React.createElement('div', { className:'grid grid-cols-3 gap-3' },
          providers.map(p => React.createElement('button', { key:p.id, onClick:()=>setD(v=>({...v, provider:p.id})),
            className:`text-left border rounded-xl p-3 transition-all ${d.provider===p.id?'border-indigo-400 bg-indigo-50/50':'border-slate-200 hover:border-indigo-200'}` },
            React.createElement('div', { className:'text-base mb-1' }, p.icon),
            React.createElement('p', { className:'text-sm font-semibold text-slate-800' }, p.label),
            React.createElement('p', { className:'text-[11px] text-slate-500 mt-0.5' }, p.method)))),
        React.createElement('div', { className:'border border-slate-200 rounded-xl p-3' },
          React.createElement('p', { className:lbl }, 'Scopes requested'),
          React.createElement('div', { className:'flex gap-1.5 flex-wrap mt-1.5' },
            prov.scopes.map(s=>React.createElement(CxPill,{key:s,tone:'slate'},s))))),

      step === 3 && React.createElement('div', { className:'space-y-3' },
        React.createElement('div', { className:'grid grid-cols-2 gap-3' },
          React.createElement('div', null,
            React.createElement('label', { className:lbl }, 'Routes to'),
            React.createElement('select', { value:d.routesTo, onChange:e=>setD(v=>({...v, routesTo:e.target.value})), className:inp },
              ['Support queue','Escalation queue','Proactive Support pod','Assigned CSM','Renewals queue','Billing queue'].map(o=>React.createElement('option',{key:o},o)))),
          React.createElement('div', null,
            React.createElement('label', { className:lbl }, 'Creates'),
            React.createElement('select', { value:d.creates, onChange:e=>setD(v=>({...v, creates:e.target.value})), className:inp },
              ['Ticket','Ticket \u00b7 P1','Ticket \u00b7 P2'].map(o=>React.createElement('option',{key:o},o))))),
        React.createElement('label', { className:'flex items-center gap-2 cursor-pointer' },
          React.createElement('input', { type:'checkbox', checked:d.isDefault, onChange:e=>setD(v=>({...v, isDefault:e.target.checked})) }),
          React.createElement('span', { className:'text-sm text-slate-700' }, 'Make this the default mailbox for outbound replies'))),

      step === 4 && React.createElement('div', { className:'space-y-2' },
        React.createElement('div', { className:'border border-slate-200 rounded-xl divide-y divide-slate-100' },
          [['Address', d.address],['Name', d.label || '\u2014'],['Provider', prov.label + ' \u00b7 ' + prov.method],
           ['Routes to', d.routesTo],['Creates', d.creates],['Default', d.isDefault ? 'Yes' : 'No']].map(r =>
            React.createElement('div', { key:r[0], className:'flex justify-between px-3 py-2' },
              React.createElement('span', { className:'text-xs text-slate-500' }, r[0]),
              React.createElement('span', { className:'text-xs font-medium text-slate-800 font-mono' }, r[1])))),
        React.createElement('p', { className:'text-[11px] text-slate-500 leading-relaxed' },
          'Threading, loop protection and blacklisting rules apply to this mailbox as soon as it is connected \u2014 they are configured once, for every mailbox.')),

      React.createElement('div', { className:'flex justify-between gap-2 pt-2 border-t border-slate-100' },
        React.createElement(Btn, { variant:'ghost', onClick: step===1 ? onClose : ()=>setStep(s=>s-1) }, step===1 ? 'Cancel' : 'Back'),
        step < 4
          ? React.createElement(Btn, { variant:'primary', disabled: step===1 && !/@/.test(d.address), onClick:()=>setStep(s=>s+1) },
              step===2 ? 'Authorise with ' + prov.label : 'Next')
          : React.createElement(Btn, { variant:'primary', onClick:()=>{
              dispatch({ type:'ADD_SUPPORT_MAILBOX', mailbox:{
                id:'mb_' + Date.now().toString(36), address:d.address, label:d.label || d.address.split('@')[0],
                isDefault:d.isDefault, provider:prov.id, method:prov.method, connected:true,
                connectedOn:'Today', synced:'just now', routesTo:d.routesTo, creates:d.creates,
                received30d:0, scopes:prov.scopes, owner:'Shared \u00b7 connected by admin' } });
              onClose();
            } }, 'Connect mailbox'))
    )
  );
}

function MailboxEditModal({ mailbox, onClose, dispatch }){
  const [d, setD] = useState(mailbox || {});
  useEffect(() => { if (mailbox) setD(mailbox); }, [mailbox && mailbox.id]);
  if (!mailbox) return null;
  const inp = 'w-full mt-1 text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400';
  const lbl = 'text-[10px] font-bold text-slate-400 uppercase tracking-wider';
  return React.createElement(Modal, { open:true, onClose, title:'Edit ' + mailbox.address },
    React.createElement('div', { className:'space-y-3' },
      React.createElement('div', null,
        React.createElement('label', { className:lbl }, 'Display name'),
        React.createElement('input', { value:d.label||'', onChange:e=>setD(v=>({...v, label:e.target.value})), className:inp })),
      React.createElement('div', { className:'grid grid-cols-2 gap-3' },
        React.createElement('div', null,
          React.createElement('label', { className:lbl }, 'Routes to'),
          React.createElement('select', { value:d.routesTo, onChange:e=>setD(v=>({...v, routesTo:e.target.value})), className:inp },
            ['Support queue','Escalation queue','Proactive Support pod','Assigned CSM','Renewals queue','Billing queue'].map(o=>React.createElement('option',{key:o},o)))),
        React.createElement('div', null,
          React.createElement('label', { className:lbl }, 'Creates'),
          React.createElement('select', { value:d.creates, onChange:e=>setD(v=>({...v, creates:e.target.value})), className:inp },
            ['Ticket','Ticket \u00b7 P1','Ticket \u00b7 P2'].map(o=>React.createElement('option',{key:o},o))))),
      React.createElement('div', { className:'bg-slate-50 rounded-lg px-3 py-2' },
        React.createElement('p', { className:lbl }, 'Connection'),
        React.createElement('p', { className:'text-xs text-slate-600 mt-1' },
          d.method + ' \u00b7 connected ' + d.connectedOn + ' \u00b7 last sync ' + d.synced),
        React.createElement('div', { className:'flex gap-1.5 flex-wrap mt-1.5' },
          (d.scopes||[]).map(s=>React.createElement(CxPill,{key:s,tone:'slate'},s)))),
      React.createElement('div', { className:'flex justify-end gap-2 pt-1' },
        React.createElement(Btn, { variant:'secondary', onClick:onClose }, 'Cancel'),
        React.createElement(Btn, { variant:'primary', onClick:()=>{
          dispatch({ type:'UPDATE_SUPPORT_MAILBOX', id:mailbox.id, patch:{ label:d.label, routesTo:d.routesTo, creates:d.creates } });
          onClose();
        } }, 'Save changes')))
  );
}

// ── Admin \u203a User management ──
// ── Admin › Required ticket fields ──
// Two settings: what must be captured at first response, and what must be
// captured at resolution.
function RequiredFieldsAdmin({ onBack, dispatch, state }){
  const cfg = state.gateConfig || TICKET_GATE_DEFAULTS;
  const [phase, setPhase] = useState('firstResponse');
  const conf = cfg[phase] || {};
  const defs = gateFields(cfg, phase);
  const captured = state.ticketGates || {};
  const capturedCount = Object.values(captured).filter(g => g[phase]).length;

  const row = (title, desc, right) => React.createElement('div', { key:title, className:'flex items-start justify-between gap-4 py-3 border-b border-slate-50 last:border-0' },
    React.createElement('div', { className:'flex-1 min-w-0' },
      React.createElement('p', { className:'text-sm font-medium text-slate-800' }, title),
      desc && React.createElement('p', { className:'text-xs text-slate-500 mt-0.5 leading-relaxed' }, desc)),
    React.createElement('div', { className:'flex-shrink-0' }, right));

  return React.createElement('div', { className:'space-y-4' },
    React.createElement(AdminCrumb, { trail:['Admin','Required ticket fields'], onNavigate:()=>onBack() }),

    React.createElement(Card, { className:'p-4 bg-indigo-50/40 border-indigo-100' },
      React.createElement('p', { className:'text-sm text-slate-700 leading-relaxed' },
        'Two moments in a ticket\u2019s life where fields are captured before the agent can continue. Asking at the moment of the action is deliberate \u2014 a field marked required on a form gets filled with whatever is first in the list, whereas a field asked for at the point of sending is answered while the agent still has the answer in mind.')),

    React.createElement(Tabs, { tabs:[
      { id:'firstResponse', label:'On first response' },
      { id:'resolution',    label:'On resolve / close' },
    ], active:phase, onChange:setPhase }),

    React.createElement('div', { className:'grid grid-cols-3 gap-4' },
      React.createElement(MetricCard, { label:'Fields in this set', value:defs.length,
        sub:defs.filter(f=>f.required).length + ' mandatory' }),
      React.createElement(MetricCard, { label:'Enforcement', value: conf.blocking ? 'Blocking' : 'Warn only',
        sub: conf.blocking ? 'agent cannot continue' : 'agent may continue' }),
      React.createElement(MetricCard, { label:'Tickets captured', value:capturedCount, sub:'this session' })),

    React.createElement(Card, { className:'p-4' },
      React.createElement(CxLabel, null, 'When this fires'),
      row(conf.enabled ? 'Enabled' : 'Disabled',
        phase === 'firstResponse'
          ? 'Fires once per ticket, on the first customer-facing reply. Internal notes and forwards to a third party do not trigger it \u2014 neither is a first response.'
          : 'Fires once per ticket, when the status is moved to ' + ((conf.triggerStatuses||['Resolved','Closed']).join(' or ')) + '.',
        React.createElement(AdminToggle, { on:!!conf.enabled, label: conf.enabled?'On':'Off',
          onChange:()=>dispatch({ type:'UPDATE_GATE_CONFIG', phase, patch:{ enabled:!conf.enabled },
            msg:(conf.enabled?'Disabled':'Enabled') + ' the ' + (phase==='resolution'?'resolution':'first response') + ' gate' }) })),
      row('Block the action until mandatory fields are complete',
        'Off means the agent sees the prompt and can continue anyway; the ticket is flagged as incomplete instead.',
        React.createElement(AdminToggle, { on:!!conf.blocking, label: conf.blocking?'Blocking':'Warn only',
          onChange:()=>dispatch({ type:'UPDATE_GATE_CONFIG', phase, patch:{ blocking:!conf.blocking },
            msg: conf.blocking ? 'Agents can now continue without completing the set' : 'Mandatory fields are now enforced' }) }))
    ),

    React.createElement(Card, { className:'overflow-hidden' },
      React.createElement('div', { className:'px-4 py-3 border-b border-slate-100' },
        React.createElement('p', { className:'text-sm font-semibold text-slate-900' }, 'Fields in this set'),
        React.createElement('p', { className:'text-[11px] text-slate-500 mt-0.5' },
          'Mandatory fields gate the action. Optional fields appear in the same prompt but never block it.')),
      React.createElement('table', { className:'w-full text-sm' },
        React.createElement('thead', null, React.createElement('tr', { className:'bg-slate-50 border-b' },
          ['Field','Type','Guidance shown to the agent','Mandatory'].map((h,i)=>
            React.createElement('th',{key:i,className:'px-4 py-2.5 text-left text-xs font-medium text-slate-500'},h)))),
        React.createElement('tbody', null,
          defs.map(f => {
            const def = gateDefFor(f.key);
            return React.createElement('tr', { key:f.key, className:'border-b last:border-0 hover:bg-slate-50 align-top' },
              React.createElement('td', { className:'px-4 py-2.5 font-medium text-slate-800' }, f.key),
              React.createElement('td', { className:'px-4 py-2.5' },
                React.createElement(CxPill, { tone:'slate' }, def.type),
                def.options && React.createElement('p', { className:'text-[11px] text-slate-400 mt-1' },
                  def.options.length + ' options')),
              React.createElement('td', { className:'px-4 py-2.5 text-xs text-slate-500 max-w-md leading-relaxed' }, f.help || '\u2014'),
              React.createElement('td', { className:'px-4 py-2.5' },
                React.createElement(AdminToggle, { on:!!f.required, label: f.required?'Mandatory':'Optional',
                  onChange:()=>dispatch({ type:'SET_GATE_FIELD_REQUIRED', phase, key:f.key, required:!f.required }) })));
          }))
      )
    ),

    React.createElement(Card, { className:'p-4' },
      React.createElement(CxLabel, { right:React.createElement(CxPill,{tone:'slate'},'Preview') }, 'What the agent sees'),
      React.createElement('p', { className:'text-xs text-slate-500 leading-relaxed' },
        phase === 'firstResponse'
          ? 'On pressing Send reply for the first time on a ticket, a review prompt appears listing these fields, prefilled from the ticket and the AI suggestions. The agent confirms or corrects, and the reply then sends. On every later reply the prompt does not appear.'
          : 'On moving the status to Resolved or Closed, the status change is held until this set is complete. Cancelling leaves the ticket in its previous status.'))
  );
}

function UserManagementAdmin({ onBack, dispatch }){
  const [openAgent, setOpenAgent] = useState(null);
  const [auditFor, setAuditFor] = useState(null);
  const [q, setQ] = useState('');
  const agentFieldDefs = (typeof ADMIN_FIELDS !== 'undefined' && ADMIN_FIELDS.agent) ? ADMIN_FIELDS.agent : [];

  const agents = Object.keys(USERS).filter(id =>
    !q || USERS[id].name.toLowerCase().includes(q.toLowerCase()) ||
    (AGENT_META[id]||{}).roleLabel.toLowerCase().includes(q.toLowerCase()));

  // Values shown on the agent profile, keyed to the admin-defined agent fields
  const fieldValue = (id, key) => {
    const u = USERS[id], m = AGENT_META[id] || {}, mb = AGENT_MAILBOXES[id] || {};
    return ({ agent_name:u.name, role:m.roleLabel, assigned_accounts:(m.accounts||0) + ' accounts',
      workload_score:String(40 + (m.accounts||0) * 6), avg_nps:String(38 + (m.accounts||0)),
      response_sla:'4 hours' })[key] || '\u2014';
  };

  // ── Audit trail ──
  if (auditFor) {
    const u = USERS[auditFor];
    const trail = AGENT_AUDIT[auditFor] || [];
    return React.createElement('div', { className:'space-y-4' },
      React.createElement(AdminCrumb, { trail:['Admin','User management', u.name, 'Audit log'],
        onNavigate:(i)=>{ if(i===0) onBack(); else setAuditFor(null); } }),
      React.createElement(Card, { className:'p-4' },
        React.createElement('div', { className:'flex items-center gap-3' },
          React.createElement(Avatar, { user:u }),
          React.createElement('div', { className:'flex-1' },
            React.createElement('p', { className:'text-sm font-bold text-slate-900' }, u.name),
            React.createElement('p', { className:'text-xs text-slate-500' }, trail.length + ' session events recorded')),
          React.createElement(Btn, { variant:'secondary', size:'xs',
            onClick:()=>dispatch && dispatch({type:'ADD_TOAST',msg:'Audit log exported',toastType:'success'}) }, '\u2b07 Export'))),
      React.createElement(Card, { className:'overflow-hidden' },
        React.createElement('table', { className:'w-full text-sm' },
          React.createElement('thead', null, React.createElement('tr', { className:'bg-slate-50 border-b' },
            ['When','Event','IP address','Device','Result'].map((h,i)=>React.createElement('th',{key:i,className:'px-4 py-2.5 text-left text-xs font-medium text-slate-500'},h)))),
          React.createElement('tbody', null,
            trail.length === 0
              ? React.createElement('tr', null, React.createElement('td',{colSpan:5,className:'px-4 py-8 text-center text-slate-400 text-sm'},'No session activity recorded'))
              : trail.map((e,i)=>React.createElement('tr', { key:i, className:'border-b last:border-0 hover:bg-slate-50' },
                  React.createElement('td', { className:'px-4 py-2.5 text-xs text-slate-500' }, e.at),
                  React.createElement('td', { className:'px-4 py-2.5' },
                    React.createElement(CxPill, { tone: !e.ok?'red':e.event==='Login'?'green':'slate' }, e.event)),
                  React.createElement('td', { className:'px-4 py-2.5 text-xs font-mono text-slate-600' }, e.ip),
                  React.createElement('td', { className:'px-4 py-2.5 text-xs text-slate-600' }, e.device),
                  React.createElement('td', { className:'px-4 py-2.5' },
                    React.createElement('span', { className:`text-xs font-semibold ${e.ok?'text-green-600':'text-red-600'}` }, e.ok?'\u2713 Success':'\u2715 Failed'))
                ))
          )
        )
      )
    );
  }

  // ── Agent profile (agent fields) ──
  if (openAgent) {
    const u = USERS[openAgent], m = AGENT_META[openAgent] || {}, mb = AGENT_MAILBOXES[openAgent] || {};
    return React.createElement('div', { className:'space-y-4' },
      React.createElement(AdminCrumb, { trail:['Admin','User management', u.name],
        onNavigate:(i)=>{ if(i===0) onBack(); else setOpenAgent(null); },
        actions: React.createElement('div', { className:'flex gap-2' },
          React.createElement(Btn, { variant:'primary', size:'xs', onClick:()=>dispatch && dispatch({type:'ADD_TOAST',msg:'Agent saved',toastType:'success'}) }, 'Save')) }),

      React.createElement(Card, { className:'p-5' },
        React.createElement('div', { className:'flex items-center gap-4 flex-wrap' },
          React.createElement('div', { className:'w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0', style:{ background:u.color } }, u.initials),
          React.createElement('div', { className:'flex-1 min-w-0' },
            React.createElement('p', { className:'text-lg font-bold text-slate-900' }, u.name),
            React.createElement('p', { className:'text-sm text-slate-500' }, m.roleLabel + ' \u00b7 joined ' + m.joined),
            React.createElement('div', { className:'flex gap-2 mt-2 flex-wrap' },
              React.createElement(CxPill, { tone: m.status==='active'?'green':'slate' }, m.status==='active'?'Active':'Inactive'),
              React.createElement(CxPill, { tone:'slate' }, 'Last active ' + m.lastActive),
              React.createElement(CxPill, { tone: mb.connected?'green':'amber' }, mb.connected?'Mailbox connected':'No mailbox')))
        )
      ),

      React.createElement(Card, { className:'p-5' },
        React.createElement(CxLabel, { right:React.createElement('span',{className:'text-[11px] text-slate-400'},'Defined in Field Manager \u203a Agent fields') }, 'Agent fields'),
        React.createElement('div', { className:'grid grid-cols-2 gap-3' },
          agentFieldDefs.map(f => React.createElement('div', { key:f.key },
            React.createElement('div', { className:'flex items-center gap-2' },
              React.createElement('label', { className:'text-[10px] font-bold text-slate-400 uppercase tracking-wider' }, f.label),
              f.req && React.createElement(CxPill, { tone:'amber' }, 'Required'),
              f.system && React.createElement(CxPill, { tone:'slate' }, '\u{1F512} System')),
            React.createElement('input', { defaultValue:fieldValue(openAgent, f.key), readOnly:f.system,
              className:'w-full mt-1 text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400' + (f.system?' bg-slate-50 text-slate-500':'') }),
            React.createElement('p', { className:'text-[10px] text-slate-400 mt-1' }, f.type + ' \u00b7 used in ' + f.usage)
          ))
        )
      )
    );
  }

  // ── Directory ──
  return React.createElement('div', { className:'space-y-4' },
    React.createElement(AdminCrumb, { trail:['Admin','User management'], onNavigate:()=>onBack(),
      actions: React.createElement('div', { className:'flex gap-2' },
        React.createElement('input', { value:q, onChange:e=>setQ(e.target.value), placeholder:'Search agents\u2026',
          className:'text-xs border border-slate-200 rounded-lg px-3 py-1.5 w-44 outline-none focus:border-indigo-400' }),
        React.createElement(Btn, { variant:'primary', size:'xs', onClick:()=>dispatch && dispatch({type:'ADD_TOAST',msg:'Invite sent',toastType:'success'}) }, '+ Invite agent')) }),

    React.createElement('div', { className:'grid grid-cols-4 gap-4' },
      React.createElement(MetricCard, { label:'Agents', value:Object.keys(USERS).length, sub:'in this account' }),
      React.createElement(MetricCard, { label:'Active', value:Object.values(AGENT_META).filter(m=>m.status==='active').length, sub:'signed in recently' }),
      React.createElement(MetricCard, { label:'Mailboxes connected', value:Object.values(AGENT_MAILBOXES).filter(m=>m.connected).length, sub:'of ' + Object.keys(USERS).length }),
      React.createElement(MetricCard, { label:'Roles in use', value:new Set(Object.values(AGENT_META).map(m=>m.roleLabel)).size, sub:'see Admin \u203a Roles' })
    ),

    React.createElement(Card, { className:'overflow-hidden' },
      React.createElement('div', { className:'overflow-x-auto' },
        React.createElement('table', { className:'w-full text-sm min-w-[820px]' },
          React.createElement('thead', null, React.createElement('tr', { className:'bg-slate-50 border-b' },
            ['Agent','Role','Mailbox','Last active',''].map((h,i)=>React.createElement('th',{key:i,className:'px-4 py-2.5 text-left text-xs font-medium text-slate-500 whitespace-nowrap'},h)))),
          React.createElement('tbody', null,
            agents.length === 0
              ? React.createElement('tr', null, React.createElement('td',{colSpan:5,className:'px-4 py-8 text-center text-slate-400 text-sm'},'No agents match that search'))
              : agents.map(id => { const u = USERS[id], m = AGENT_META[id]||{}, mb = AGENT_MAILBOXES[id]||{};
                  return React.createElement('tr', { key:id, onClick:()=>setOpenAgent(id),
                    className:'border-b last:border-0 hover:bg-indigo-50 cursor-pointer transition-colors' },
                    React.createElement('td', { className:'px-4 py-3' },
                      React.createElement('div', { className:'flex items-center gap-2.5' },
                        React.createElement(Avatar, { user:u }),
                        React.createElement('div', null,
                          React.createElement('p', { className:'font-medium text-slate-900' }, u.name),
                          React.createElement('p', { className:'text-[11px] text-slate-400 font-mono' }, mb.address || '\u2014')))),
                    React.createElement('td', { className:'px-4 py-3' }, React.createElement(CxPill, { tone:'blue' }, m.roleLabel)),
                    React.createElement('td', { className:'px-4 py-3' },
                      React.createElement(CxPill, { tone: mb.connected?'green':'slate' }, mb.connected ? 'Connected' : 'Not connected')),
                    React.createElement('td', { className:'px-4 py-3 text-xs text-slate-500 whitespace-nowrap' }, m.lastActive),
                    React.createElement('td', { className:'px-4 py-3 text-right whitespace-nowrap' },
                      React.createElement('button', { onClick:e=>{ e.stopPropagation(); setAuditFor(id); },
                        className:'text-xs text-indigo-600 hover:underline mr-3' }, '\u{1F5D2} Audit log'),
                      React.createElement('span', { className:'text-slate-300' }, '\u2192'))
                  );
                })
          )
        )
      )
    )
  );
}

const ADMIN_SECTIONS = [
  { id:'fields',      icon:'\u{1F5C3}', title:'Field Manager',       tone:'blue',   desc:'Define company, contact, task and goal attributes.' },
  { id:'emailcfg',    icon:'\u2709',    title:'Email configuration', tone:'blue',   desc:'OAuth and Graph mailbox auth, forwarding addresses, and who has connected.' },
  { id:'users',       icon:'\u{1F465}', title:'User management',     tone:'teal',   desc:'Invite CSMs individually and assign their role.' },
  { id:'roles',       icon:'\u{1F511}', title:'Roles',               tone:'purple', desc:'Default roles and the individual privileges granted to each one.' },
  { id:'connectors',  icon:'\u{1F50C}', title:'Connectors',          tone:'teal',   desc:'CRM, ticketing and product analytics integrations that sync account data.' },
  { id:'signals',     icon:'\u{1F4E1}', title:'Signals',             tone:'amber',  desc:'Tune the signal sources that feed health scores \u2014 product usage and sentiment.' },
];

function AdminPage() {
  const { state, dispatch } = useApp();
  const [section, setSection] = useState(null);
  const back = () => setSection(null);

  if (section === 'fields')     return React.createElement(FieldManagerAdmin,  { onBack:back, dispatch });
  if (section === 'reqfields')  return React.createElement(RequiredFieldsAdmin, { onBack:back, dispatch, state });
  if (section === 'emailcfg')   return React.createElement(EmailConfigAdmin,   { onBack:back, dispatch, state });
  if (section === 'users')      return React.createElement(UserManagementAdmin,{ onBack:back, dispatch });
  if (section === 'roles')      return React.createElement(RolesAdmin,        { onBack:back, dispatch });
  if (section === 'automation') return React.createElement(AutomationAdmin,    { onBack:back, dispatch });
  if (section === 'actionsview')return React.createElement(ActionsOverviewAdmin,{ onBack:back, dispatch, state });
  if (section === 'signals')    return React.createElement(SignalsAdmin,       { onBack:back, dispatch });
  if (section === 'drive')      return React.createElement(DriveAdmin,         { onBack:back, dispatch });
  if (section === 'sla')        return React.createElement(SlaAdmin,           { onBack:back, dispatch });
  if (section === 'assignment') return React.createElement(AssignmentAdmin,    { onBack:back, dispatch });
  if (section === 'notify')     return React.createElement(NotificationsAdmin, { onBack:back, dispatch });
  if (section === 'connectors') return React.createElement('div', { className:'space-y-4' },
    React.createElement(AdminCrumb, { trail:['Admin','Connectors'], onNavigate:back }),
    React.createElement(ConnectorsAdmin, null)
  );

  const activeEvents = NOTIFY_EVENTS.filter(e => e.email || e.slack || e.teams).length;
  const counts = {
    fields:     Object.values(ADMIN_FIELDS).reduce((n,a)=>n+a.length,0) + ' fields \u00b7 6 objects',
    reqfields:  (gateFields(state.gateConfig||TICKET_GATE_DEFAULTS,'firstResponse').filter(f=>f.required).length) + ' on reply · ' + (gateFields(state.gateConfig||TICKET_GATE_DEFAULTS,'resolution').filter(f=>f.required).length) + ' on resolve',
    emailcfg:   ((state.supportMailboxes||SUPPORT_MAILBOXES).length) + ' support · ' + Object.values(AGENT_MAILBOXES).filter(m=>m.connected).length + ' CSM mailboxes',
    users:      Object.keys(USERS).length + ' agents \u00b7 ' + new Set(Object.values(AGENT_META).map(m=>m.roleLabel)).size + ' roles',
    roles:      APP_ROLES.length + ' roles \u00b7 ' + ALL_PRIVILEGES.length + ' privileges',
    automation: AUTOMATIONS.filter(a=>a.pillar==='ticket').length + ' ticket automations',
    actionsview:(state.actions||[]).length + ' actions \u00b7 ' + new Set((state.actions||[]).map(a=>a.ownerId)).size + ' authors',
    connectors: CONNECTORS.length + ' integrations \u00b7 ' + CONNECTORS.filter(c=>c.status==='connected').length + ' connected',
    signals:    SIGNAL_SOURCES.length + ' sources \u00b7 ' + SIGNAL_SOURCES.filter(s=>s.status==='active').length + ' active',
    drive:      DRIVE_TEMPLATES.length + ' templates \u00b7 QBR, Goal, Plan',
    sla:        SLA_PRIORITIES.length + ' priority targets \u00b7 ' + SLA_CALENDARS.length + ' calendars',
    assignment: (ASSIGNMENT_RULES.ticket.length + ASSIGNMENT_RULES.company.length) + ' rules \u00b7 tickets & companies',
    notify:     NOTIFY_CHANNELS.filter(c=>c.status==='connected').length + ' of ' + NOTIFY_CHANNELS.length + ' channels \u00b7 ' + activeEvents + ' events',
  };

  return React.createElement('div', { className:'space-y-5' },
    React.createElement('div', null,
      React.createElement('h2', { className:'text-lg font-semibold text-slate-900' }, 'Admin'),
      React.createElement('p', { className:'text-sm text-slate-500 mt-0.5' }, 'Configure the data model, routing, service levels and integrations behind CX42.')
    ),
    React.createElement('div', { className:'grid grid-cols-3 gap-4' },
      ADMIN_SECTIONS.map(s => React.createElement(AdminTile, {
        key:s.id, icon:s.icon, title:s.title, desc:s.desc, tone:s.tone,
        onClick:()=>setSection(s.id),
        meta:[React.createElement(CxPill, { key:'m', tone:'slate' }, counts[s.id])]
      }))
    )
  );
}

function ComingSoon({ feature }) {
  return React.createElement(Card, { className:'p-12 text-center' },
    React.createElement('div', { className:'w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4' }, '🚧'),
    React.createElement('h3', { className:'text-lg font-semibold text-slate-900' }, feature),
    React.createElement('p', { className:'text-slate-500 text-sm mt-2' }, 'This feature is available in the full product.')
  );
}

// ============================================================
// SECTION 18: APP ROOT
// ============================================================

function PageWrapper({ title, subtitle, children, actions }) {
  return React.createElement('div', { className:'flex-1 flex flex-col min-h-screen' },
    React.createElement(Header, { title, subtitle, actions }),
    React.createElement('div', { className:'flex-1 p-6 mt-14 overflow-y-auto' }, children)
  );
}

function App() {
  return React.createElement(AppProvider, null,
    React.createElement(HashRouter, null,
      React.createElement(AppContent, null)
    )
  );
}

function RedirectToDashboard() {
  const navigate = useNavigate();
  useEffect(() => { navigate('/dashboard'); }, []);
  return null;
}

function AppContent() {
  const { state, dispatch } = useApp();
  const location = useLocation();
  
  const pageTitles = {
    '/dashboard': 'Dashboard',
    '/work': 'My Work',
    '/customers': 'Customers',
    '/health': 'Customer Health',
    '/renewals': 'Renewals',
    '/risks': 'Risks',
    '/expansion': 'Expansion',
    '/profile': 'Profile settings',
    '/actions': 'Actions',
    '/drive': 'CX42 Drive',
    '/qbrs': 'CX42 Drive',
    '/admin': 'Admin',
    '/admin/connectors': 'Connectors',
    '/manager': 'Manager View',
    '/executive': 'Executive View',
  };
  
  const title = pageTitles[location.pathname] || 'CX42';
  const isPortal = location.pathname.startsWith('/portal-preview');
  
  if(isPortal) {
    return React.createElement(Routes, null,
      React.createElement(Route, { path:'/portal-preview/:customerId', element:React.createElement(PortalPreview, null) })
    );
  }
  
  return React.createElement('div', { className:'flex h-screen overflow-hidden' },
    React.createElement(Sidebar, { activeRole:state.activeRole }),
    React.createElement('div', { className:`flex-1 ml-56 flex flex-col ${state.assistantOpen ? 'mr-96' : ''}` },
      React.createElement(Header, { title, subtitle:null }),
      React.createElement('div', { className:'flex-1 p-6 mt-14 overflow-y-auto' },
        React.createElement(Routes, null,
          React.createElement(Route, { path:'/', element:React.createElement(RedirectToDashboard, null) }),
          React.createElement(Route, { path:'/dashboard', element:React.createElement(Dashboard, null) }),
          React.createElement(Route, { path:'/work', element:React.createElement(MyWork, null) }),
          React.createElement(Route, { path:'/customers', element:React.createElement(CustomersList, null) }),
          React.createElement(Route, { path:'/customers/:customerId', element:React.createElement(Customer360, null) }),
          React.createElement(Route, { path:'/health', element:React.createElement(HealthPortfolio, null) }),
          React.createElement(Route, { path:'/renewals', element:React.createElement(Renewals, null) }),
          React.createElement(Route, { path:'/risks', element:React.createElement(Risks, null) }),
          React.createElement(Route, { path:'/expansion', element:React.createElement(Expansion, null) }),
          React.createElement(Route, { path:'/profile', element:React.createElement(ProfileSettings, null) }),
          React.createElement(Route, { path:'/actions', element:React.createElement(ActionsPage, null) }),
          React.createElement(Route, { path:'/drive', element:React.createElement(DrivePage, null) }),
          React.createElement(Route, { path:'/qbrs', element:React.createElement(DrivePage, null) }),
          React.createElement(Route, { path:'/goals/:goalId', element:React.createElement(GoalDetail, null) }),
          React.createElement(Route, { path:'/manager', element:React.createElement(ManagerDashboard, null) }),
          React.createElement(Route, { path:'/executive', element:React.createElement(ExecutiveDashboard, null) }),
          React.createElement(Route, { path:'/admin', element:React.createElement(AdminPage, null) }),
          React.createElement(Route, { path:'/admin/connectors', element:React.createElement(ConnectorsAdmin, null) }),
          React.createElement(Route, { path:'*', element:React.createElement('div',{className:'p-8 text-slate-400'},'Page not found') })
        )
      )
    ),
    state.assistantOpen && React.createElement(AssistantPanel, null),
    React.createElement(Toast, { toasts:state.toasts, dispatch })
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  componentDidCatch(e, info) {
    var el = document.getElementById('cx42-error');
    if(el) { el.style.display='block'; el.textContent = 'REACT RENDER ERROR\n\n' + e.message + '\n\n' + (e.stack||'') + '\n\nComponent stack:\n' + (info && info.componentStack ? info.componentStack : ''); }
  }
  render() {
    if(this.state.error) return null;
    return this.props.children;
  }
}

export {
  App,
  ErrorBoundary,
  // Screens, consumed by src/routes.tsx while they still live here.
  // Each name disappears from this list as its screen is rebuilt.
  ConnectorsAdmin,
  // Admin sub-screens. Seven of these were unreachable in the MVP: they were
  // wired into AdminPage's if-chain but had no tile in ADMIN_SECTIONS.
  FieldManagerAdmin,
  RequiredFieldsAdmin,
  EmailConfigAdmin,
  UserManagementAdmin,
  RolesAdmin,
  AutomationAdmin,
  ActionsOverviewAdmin,
  SignalsAdmin,
  DriveAdmin,
  SlaAdmin,
  AssignmentAdmin,
  NotificationsAdmin,
  PortalPreview,
  AssistantPanel,
};
