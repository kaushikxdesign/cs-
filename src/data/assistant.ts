import {
  AlertTriangle, Building2, CheckSquare, FolderOpen, HeartPulse, RefreshCw,
  Settings, Sparkles, TrendingUp, Zap, type LucideIcon,
} from 'lucide-react';

/**
 * Canned assistant transcript. Verbatim from the MVP — the demo narrative
 * depends on this exact copy, so only the presentation is ours.
 */
export interface AssistantChip {
  label: string;
  type: 'usage' | 'ticket' | 'email' | 'survey' | 'commercial' | 'meeting';
}

export interface AssistantResponse {
  text: string;
  chips: AssistantChip[];
  actions: string[];
}

export const ASSISTANT_RESPONSES: Record<string, AssistantResponse> = {
  portfolio_attention: {
    text: "Three accounts need your attention today. Acme Analytics moved to red three days ago—a critical data sync failure is blocking 47 users and renewal is in 74 days. Globex Cloud's executive sponsor position is vacant with only 28 days to renewal. HelioWorks has a critical ticket open for 5 days without CSM follow-up.",
    chips: [
      { label: 'Acme: Health moved to red', type: 'usage' },
      { label: 'Globex: Renewal 28d', type: 'commercial' },
      { label: 'HelioWorks: Critical ticket', type: 'ticket' },
    ],
    actions: ['Review Acme recovery plan', 'Update Globex renewal forecast', 'Follow up on HelioWorks ticket'],
  },
  portfolio_renewals: {
    text: 'The most exposed renewals are Globex Cloud ($195K, 29 days, no exec sponsor, forecast At Risk) and CloudNine ($110K, 17 days, red health, no mitigation goal). Both lack adequate coverage and should be escalated immediately.',
    chips: [
      { label: 'Globex: $195K at risk', type: 'commercial' },
      { label: 'CloudNine: 17 days', type: 'commercial' },
    ],
    actions: ['Open Globex renewal', 'Escalate CloudNine'],
  },
  portfolio_expansion: {
    text: 'Northstar Labs is the strongest expansion candidate with high confidence: 94% seat utilization, 31% active user growth, Finance team now using the platform organically, and NPS of 9. No CRM opportunity exists yet. Orbit Systems also has a qualified ML Suite opportunity in draft.',
    chips: [
      { label: 'Northstar: $72K potential', type: 'usage' },
      { label: 'Orbit: ML Suite draft opp', type: 'commercial' },
    ],
    actions: ['Qualify Northstar', 'View Orbit expansion'],
  },
  acme_health: {
    text: 'Acme moved to red primarily because weekly active users fell 64% (from 78 to 28) and a critical synchronization ticket has remained open for nine days. Email sentiment also declined after two unanswered follow-ups. With renewal in 74 days, the highest-leverage next step is a recovery meeting involving the product administrator and executive sponsor.',
    chips: [
      { label: 'Usage: WAU decline 64%', type: 'usage' },
      { label: 'Ticket SUP-1842', type: 'ticket' },
      { label: 'Email: Data sync follow-up', type: 'email' },
      { label: 'Renewal: 74 days', type: 'commercial' },
    ],
    actions: ['Draft outreach', 'Review recovery Goal', 'Schedule meeting'],
  },
  acme_meeting: {
    text: 'For your recovery meeting with Acme, I recommend leading with the resolution timeline on SUP-1842, then showing the usage recovery plan with weekly check-ins. Key attendees: Sarah Mitchell (VP Analytics) and Raj Patel (Admin). Anticipate questions about data integrity during the sync gap and what compensatory steps are planned.',
    chips: [
      { label: 'SUP-1842 status', type: 'ticket' },
      { label: 'Sarah Mitchell: VP Analytics', type: 'meeting' },
    ],
    actions: ['Draft follow-up email', 'Create meeting task'],
  },
  northstar_expand: {
    text: 'Northstar shows strong expansion evidence: seat utilization is at 94% with 31% user growth over 60 days. The Finance team started using the platform organically—this is an unsolicited adoption signal. NPS is 9 and there are no support blockers. Estimated expansion potential is $72K ARR in additional seats. No CRM opportunity exists yet.',
    chips: [
      { label: '94% seat utilization', type: 'usage' },
      { label: '+31% active users', type: 'usage' },
      { label: 'Finance BU detected', type: 'usage' },
      { label: 'NPS 9', type: 'survey' },
    ],
    actions: ['Qualify opportunity', 'Run expansion discovery', 'Draft expansion proposal'],
  },
  default: {
    text: "I can help you understand what's happening across your portfolio, prepare for meetings, draft communications, or analyze specific customer situations. Try asking about a specific customer or what needs your attention today.",
    chips: [],
    actions: ['What needs my attention today?', 'Which renewals are exposed?', 'Where is expansion evidence?'],
  },
};

/**
 * Page-aware scoping. The assistant inherits the scope of wherever it was
 * opened: the dashboard is global, every other module opens scoped to itself
 * with a toggle to widen. Each scope carried an emoji in the MVP; the icon is
 * now a lucide component so the badge matches the rest of the nav.
 */
export interface AssistantScope {
  id: string;
  label: string;
  short: string;
  icon: LucideIcon;
  prompts: string[];
}

export const ASSISTANT_SCOPES: Record<string, AssistantScope> = {
  global: {
    id: 'global', label: 'All of CX42', short: 'Global', icon: Sparkles,
    prompts: ['What needs my attention today?', 'Which renewals are most exposed?', 'Where do we have expansion evidence?'],
  },
  work: {
    id: 'work', label: 'My Work', short: 'My Work', icon: CheckSquare,
    prompts: ['What should I pick up first today?', 'Which tasks are overdue?', 'Summarise my unread email'],
  },
  customers: {
    id: 'customers', label: 'Customer list', short: 'Customers', icon: Building2,
    prompts: ['Which accounts are trending down?', 'Who is renewing in the next 60 days?', 'Which accounts have no active goal?'],
  },
  customer: {
    id: 'customer', label: 'this account', short: 'This account', icon: Building2,
    prompts: ["Why did this customer's health change?", 'Prepare me for the next meeting', 'Draft a customer follow-up'],
  },
  health: {
    id: 'health', label: 'Customer Health', short: 'Health', icon: HeartPulse,
    prompts: ['Which accounts moved band this month?', 'What is driving the red accounts?', 'Where is health data stale?'],
  },
  renewals: {
    id: 'renewals', label: 'Renewals', short: 'Renewals', icon: RefreshCw,
    prompts: ['Which renewals are at risk?', 'What is my forecast this quarter?', 'Which renewals have no owner action?'],
  },
  risks: {
    id: 'risks', label: 'Risks', short: 'Risks', icon: AlertTriangle,
    prompts: ['What are my highest-value open risks?', 'Which risks have no mitigation plan?', 'What changed on risks this week?'],
  },
  expansion: {
    id: 'expansion', label: 'Expansion', short: 'Expansion', icon: TrendingUp,
    prompts: ['Where is the strongest expansion evidence?', 'Which opportunities are unqualified?', 'Draft a discovery outreach'],
  },
  actions: {
    id: 'actions', label: 'Actions', short: 'Actions', icon: Zap,
    prompts: ['Which actions fired most this month?', 'What does this action actually do?', 'Which actions send customer emails?'],
  },
  drive: {
    id: 'drive', label: 'CX42 Drive', short: 'Drive', icon: FolderOpen,
    prompts: ['Which SOP applies to a churn risk?', 'What is in the onboarding SOP?', 'Find the QBR template for enterprise'],
  },
  admin: {
    id: 'admin', label: 'Admin', short: 'Admin', icon: Settings,
    prompts: ['Which roles can edit SLA settings?', 'Who has not connected a mailbox?', 'What automations are active?'],
  },
};

/** Resolve the scope from the route the assistant was opened on. */
export function scopeForPath(path: string) {
  const p = String(path || '');
  if (/^\/customers\/[^/]+/.test(p)) return 'customer';
  if (p.startsWith('/customers')) return 'customers';
  if (p.startsWith('/work')) return 'work';
  if (p.startsWith('/health')) return 'health';
  if (p.startsWith('/renewals')) return 'renewals';
  if (p.startsWith('/risks')) return 'risks';
  if (p.startsWith('/expansion')) return 'expansion';
  if (p.startsWith('/actions')) return 'actions';
  if (p.startsWith('/drive')) return 'drive';
  if (p.startsWith('/admin')) return 'admin';
  if (p.startsWith('/goals')) return 'work';
  return 'global'; // dashboard and anything else
}
