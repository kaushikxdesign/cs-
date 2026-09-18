# Sia UI Inventory — Phase 0 Audit

Source of truth: `public/legacy/index.html` (13,781 lines, committed verbatim).
All line numbers below refer to that file.

This document is the migration contract. Every route, component, modal, wizard,
reducer action and dataset listed here must still exist and work after the
re-platform. Anything that looks broken or pointless is recorded under
[Questions](#questions) rather than deleted.

## Contents

- [Scale](#scale)
- [Audit corrections](#audit-corrections)
- [Routes](#routes)
- [Screens and components](#screens-and-components)
- [Modals, drawers and wizards](#modals-drawers-and-wizards)
- [Navigation](#navigation)
- [State: reducer actions](#state-reducer-actions)
- [Data layer](#data-layer)
- [Roles and privileges](#roles-and-privileges)
- [Design primitives and their replacements](#design-primitives-and-their-replacements)
- [Migration status](#migration-status)
- [Questions](#questions)

---

## Scale

| Metric | Count |
|---|---|
| Lines | 13,781 |
| `React.createElement` call sites | 4,646 |
| Top-level `function` declarations | 195 |
| `useState` / `useEffect` / `useMemo` / `useRef` | 275 / 10 / 1 / 5 |
| Reducer actions | 45 |
| Route registrations | 20 (19 in the main table + `/portal-preview` pre-shell) |
| Mock datasets | ~60 |
| `tone` literals | 161 across 7 hues |
| `rounded-*` classes | 479 |
| Emoji/glyph icons | 186 `icon:` props + inline usage → 220+ |
| Icon-library icons | 0 (only 2 `<svg>` in the entire file) |
| `Math.random()` / `Date.now()` / `new Date(` / `toLocale*` | 6 / 52 / 47 / 30 |
| localStorage / network calls / tests | 0 / 0 / 0 |

## Audit corrections

The redesign brief's audit (`docs/redesign-brief.md`) was directionally right.
Four findings needed correction before acting on them:

| Brief's claim | Verdict | Reality |
|---|---|---|
| ~127 emoji used as icons | **Undercounted** | 186 `icon:'…'` glyph props plus inline glyphs in nav (1488–1495), buttons (`'📊 Manager view'` 1901, `'↻ Regenerate'` 3132) and labels. True total 220+. |
| Dark `slate-800` sidebar, `indigo-600` active pills | **Confirmed** | Sidebar 1881; active pill 1893. Same solid pill reused for the Profile pin (1907) and role highlight (1923). |
| Tones are indigo/amber/teal/blue/purple/rose/emerald | **Partly wrong** | Actual distribution: slate 51, blue 41, amber 18, purple 15, red 14, green 13, teal 9. `rose`, `emerald` and `indigo` are never used *as tone values*; indigo appears only as raw Tailwind classes. The arbitrariness claim holds — `blue` simultaneously means CSM role (1506), the "action" task source (841), an "AI generated" badge (3573), "Mailbox ready" (1655) and acquisition risk (408). |
| Mixed radii | **Confirmed** | 479 `rounded-*` hits. `-md`/`-lg`/`-xl`/`-2xl` all used for structurally identical cards, dropdown panels and chips. |
| Inline `fontSize: 10/11` | **Confirmed** | 15 occurrences, all Recharts `tick={{fontSize:N}}` (3545, 5542, 5904, 6280, 6387, 9574…), hardcoded per chart rather than a shared chart theme. |
| `@apply` is dead because the play CDN can't process it | **Wrong reason, right outcome** | The play CDN *does* compile `@apply` in a `<style>` block. `.sidebar-link` (27–28) is dead because **nothing references it** — the sidebar inlines the same classes instead. |
| `NAV` defined twice with different items | **Confirmed** | See [Navigation](#navigation). |
| Flat nav forces pages to invent layouts | **Confirmed** | 8 flat items, no secondary nav; at least 8 independent local tab systems (5259, 6906, 9999, 10372, 10762, 12898, 13397). |

## Routes

Declared in `AppContent` (13699–13781). The router is hand-rolled (102–177), not
react-router. `matchPath` (108) requires **equal segment count** and the **first
declared match wins**; `*` short-circuits the moment it is reached.

| Path | Component | Line | In nav? | Notes |
|---|---|---|---|---|
| `/` | `RedirectToDashboard` | 13736 | — | Redirect |
| `/dashboard` | `Dashboard` | 2370 | Yes | KPI cards, health/renewal charts, work widgets |
| `/work` | `MyWork` | 6817 | Yes | Tasks/tickets/email/meetings tabs — **hosts the live ticket queue** |
| `/customers` | `CustomersList` | 2625 | Yes | Portfolio table, configurable columns (`CUST_COLUMNS` 2562) |
| `/customers/:customerId` | `Customer360` | 5211 | Yes | Account shell + 6 active tabs |
| `/health` | `HealthPortfolio` | 5867 | **No** | Cross-account health board |
| `/renewals` | `Renewals` | 7039 | **No** | Renewal pipeline |
| `/risks` | `Risks` | 5964 | Yes | Risk register + detail drawer |
| `/expansion` | `Expansion` | 6106 | Yes | Expansion opportunity board |
| `/profile` | `ProfileSettings` | 1604 | Pinned | Profile / Mailbox / Signature / Locale tabs |
| `/actions` | `ActionsPage` | 12545 | Yes | Action library |
| `/drive` | `DrivePage` | 9310 | Yes | SOP/template repository |
| `/qbrs` | `DrivePage` | 9310 | **No** | Second path to the same component |
| `/goals/:goalId` | `GoalDetail` | 5705 | **No** | Full-page goal detail |
| `/manager` | `ManagerDashboard` | 6231 | **No** | Reached via role switcher / "Manager view" |
| `/executive` | `ExecutiveDashboard` | 6360 | **No** | Reached via role switcher |
| `/admin` | `AdminPage` | 13612 | Yes | 6-tile grid → 13 sub-screens (7 unreachable) |
| `/admin/connectors` | `ConnectorsAdmin` | 9592 | **No** | Only admin sub-screen with its own route |
| `/portal-preview/:customerId` | `PortalPreview` | 6420 | **No** | **Bypasses the shell** — intercepted at 13722 before Sidebar/Header render |
| `*` | inline `<div>` | 13754 | — | "Page not found" |
| `/tickets` | — | — | — | **NOT REGISTERED — see Question 1** |

## Screens and components

### Tickets and email

| Component | Line | Maps to |
|---|---|---|
| `TicketsPage` | 8414 | Three-pane inbox — list pane. **Currently unreachable** (Question 1) |
| `TicketDetail` | 7812 | Conversation pane + `DetailsPanel` |
| `TicketActionsPane` | — | SOP checklist inside `DetailsPanel` |
| `TicketFieldGateModal` | 7675 | `Dialog` — required-field gate before reply/resolve |
| `TicketSentiment`, `SeverityBadge` | 1182 | `Badge` (tone-based) |
| `EmailInbox` | 6653 | Three-pane inbox — list pane |
| `EmailDetail` | 6517 | Conversation pane, composer docked bottom |
| `EmailSequence` | 8512 | Timeline |

The live ticket queue is **not** `TicketsPage` — it is an inline `<table>` in
`MyWork` under `tab === 'tickets'` (6940). Its row click (6951) navigates to
`/tickets?ticket=<id>`.

### Customers

| Component | Line | Maps to |
|---|---|---|
| `CustomersList` | 2625 | `DataTable` + `FilterBar` + saved views |
| `Customer360` | 5211 | `PageHeader` + underline `Tabs` + right `DetailsPanel` |
| Active tabs (5259) | — | Overview 5271, Health 5466, Goals 5555, Contacts 3905, Usage 3472, Interactions 4488 |
| Defined but **not** in the active tab list | — | `SupportTab` 3292, `IntelligenceTab` 3970, `CustomerActionsTab` 4266, `TranscriptsTab` 4813, `TimelineTab` 5653 (Question 5) |
| `AccountAttributesPanel` | — | `DetailsPanel` sections |
| `AttrReasonModal` | 4454 | `Dialog` — field-change justification |

### Work, goals, risks, expansion, renewals

| Component | Line | Maps to |
|---|---|---|
| `MyWork` | 6817 | Grouped list (Overdue/Today/Upcoming), inline complete |
| `TaskDetailDrawer` | 6738 | `Drawer` |
| `GoalDetail` | 5705 | Page + `DetailsPanel` |
| `Risks` | 5964 | `DataTable` + detail `Drawer` (6053) |
| `Expansion` | 6106 | `DataTable` |
| `Renewals` | 7039 | `DataTable` |
| `HealthPortfolio` | 5867 | `DataTable` + `ChartCard` |

### Dashboards

`Dashboard` 2370, `ManagerDashboard` 6231, `ExecutiveDashboard` 6360 → 12-column
grid of `MetricCard` / `ChartCard`. KPIs in `display` type size with subtle delta.
Dashboard also owns the custom-widget system (`ADD`/`REMOVE`/`REORDER_WIDGETS`,
`makeWidgetId` 1387).

### Actions and automations

| Component | Line | Maps to |
|---|---|---|
| `ActionsPage` | 12545 | List + `DetailsPanel` |
| `ActionDetail` | 11896 | Detail view |
| `ActionRuleView` | 11855 | `RuleBuilder` rows |
| `ActionBuilder` | 12242 | `Stepper` + rule rows |
| `AutomationBuilder` | 11290 | when/if/then rule rows on neutral canvas |
| `FlowNode` / `FlowBranch` | 12186 / 12167 | Recursive flow renderer |
| `AutoChip` / `AutoValue` | 11264 / 11274 | `Badge` / inline editable value |
| `TicketActionLibrary` | 12000 | List |

### QBR / EBR

`EBRWizard` 8966 → `Stepper` with a clean footer action bar. Steps: `EBRStep1`
(AI prep) 8557, `EBRStep2` (build deck) 8610, `EBRStep3` (live EBR) 8708,
`EBRStep4` (wrap-up) 8843.

`QBRsPage` (9430) and `ReportsPage` (9505) are both **defined but referenced
nowhere** — dead code (Question 9).

### Drive

`DrivePage` 9310 → file `DataTable` + preview panel.

### Admin

`AdminPage` (13612) dispatches to 13 sub-screens via an if-chain (13617–13634),
but `ADMIN_SECTIONS` (13603) renders only **6 tiles** — and `setSection` is called
nowhere else in the file, so the other **7 sub-screens are unreachable**.

Strong evidence they were trimmed rather than abandoned: the `counts` object
(13636–13649) still computes a tile label for every one of the 7 orphans
(`reqfields`, `automation`, `actionsview`, `drive`, `sla`, `assignment`,
`notify`) — labels that are never rendered because no tile consumes them.

All 13 migrate to a grouped settings subnav with max-width 760px forms and a save
bar that appears only when dirty.

| Sub-screen | Line | Reachable today? |
|---|---|---|
| `FieldManagerAdmin` | 9808 | Yes — tile |
| `EmailConfigAdmin` | 12849 | Yes — tile |
| `UserManagementAdmin` | 13460 | Yes — tile |
| `RolesAdmin` | 12627 | Yes — tile |
| `ConnectorsAdmin` | 9592 | Yes — tile + own route `/admin/connectors` |
| `SignalsAdmin` | 10564 | Yes — tile |
| `RequiredFieldsAdmin` | 13376 | **No** |
| `SlaAdmin` | 10761 | **No** |
| `AssignmentAdmin` | 10914 | **No** |
| `NotificationsAdmin` | 11003 | **No** |
| `AutomationAdmin` | 11629 | **No** |
| `ActionsOverviewAdmin` | 12463 | **No** |
| `DriveAdmin` | 10650 | **No** |

Embedded admin builders: NPS/CSAT/Sentiment/Usage/Hygiene/LinkedIn/Community/
Conversations (`UsageBuilder` ~9911, survey builders ~9957, community ~9942,
hygiene ~9978). Support panels: `DomainTester` 13176, `DkimPanel` 13195.

### Shell and cross-cutting

| Component | Line | Maps to |
|---|---|---|
| `Sidebar` | 1862 | `NavRail` (56px) + `SecondaryNav` (240px) |
| `SpotlightSearch` | 1950 | `CommandPalette` (⌘K) |
| Assistant panel | 13731 | Right `DetailsPanel` — **not** a floating overlay |
| `PortalPreview` | 6420 | Standalone, shell-free |
| `ProfileSettings` | 1604 | Settings layout |
| `ComingSoon` | 13666 | `EmptyState` |

## Modals, drawers and wizards

Primitives: `Modal` 1266, `Drawer` 1252, `Toast` 1281.

**Modals** — OAuth consent 1745, Draft outreach 2340, Create a goal 3788,
`AttrReasonModal` 4454, Add a transcript 5118, Skip task 5632 / 5844, Publish
success plan 5642 / 5852, Qualify expansion 6213, Update renewal forecast 7078,
`TicketFieldGateModal` 7675, Present to customer 8775, QBR preview 9411 / 9471,
New field 9871, Tag an element 10102, New assignment rule 10953, Step picker
12445, `MailboxWizard` 13244, `MailboxEditModal` 13337.

**Drawers** — customer preview 2923, risk detail 6053, `TaskDetailDrawer` 6738.

**Wizards** — `EBRWizard` (4 steps) 8966, `AutomationBuilder` 11290,
`ActionBuilder` 12242, `MailboxWizard` 13244.

Per the brief: modals for things that should be drawers or side panels are an
anti-pattern. Record-detail modals migrate to `Drawer`/`DetailsPanel`; only
genuinely blocking confirmations stay `Dialog`.

## Navigation

Three divergent sources of truth today, collapsing to **one `nav.ts`** consumed
by the rail, secondary nav, ⌘K and `NAV_BY_PERSONA`:

1. **Sidebar `NAV`** (1487) — 8 items: Dashboard, My Work, Customers, Risks,
   Expansion, Actions, Sia Drive, Admin. Icons are raw glyphs (`▦ ✓ ⬛ ⚠ ↗ ⚡ 📁 ⚙`).
2. **Spotlight `NAV`** (1950) — a shadowed local const with 9 items: the same 8
   plus `Profile settings`, in a different order.
3. **Pinned bottom buttons** (1900–1909) — "📊 Manager view" (only when
   `activeRole === 'csm'`) and "Profile settings".

Plus an inline role switcher dropdown (1911–1925): CSM/Maya → `/dashboard`,
Manager/Daniel → `/manager`, Executive/Priya → `/executive`.

Target: Profile settings and the role switcher move into the avatar menu at the
bottom of the rail; the "Manager view" button is removed (the role switcher
already covers it); `NAV_BY_PERSONA` (7109) stays the filter.

## State: reducer actions

Single `useReducer` + Context — `AppContext` 654, `appReducer` 849–1109,
`AppProvider` 1112–1154, `useApp()` 1156. `initialState` at 1113–1142.

`initialState` keys: `activeRole`, `persona`, `followedTickets`, `ticketGates`,
`gateConfig`, `activeUser`, `customers`, `goals`, `tasks`, `risks`,
`expansionOpps`, `renewals`, `toasts`, `dismissedPriority`, `snoozedPriority`,
`readItems`, `customWidgets`, `actions`, `emails`, `emailConfig`,
`supportMailboxes`, `attrChanges`, `mailbox`, `assistantOpen`, `assistantContext`,
`lastCreatedGoalId`.

All 45 actions become members of an `AppAction` discriminated union, making the
reducer switch exhaustive. Actions marked **no UI path** have no reachable
trigger in the current UI and must be covered by reducer unit tests.

| # | Action | Line | Effect | UI path |
|---|---|---|---|---|
| 1 | `SAVE_TICKET_GATE` | 854 | Record captured gated fields for a ticket phase | Ticket reply/resolve |
| 2 | `UPDATE_GATE_CONFIG` | 864 | Patch gate config for a phase | **no UI path** — only `RequiredFieldsAdmin`, which is unreachable (Question 2) |
| 3 | `SET_GATE_FIELD_REQUIRED` | 870 | Toggle a gate field's required flag | **no UI path** — same |
| 4 | `TOGGLE_FOLLOW_TICKET` | 879 | Add/remove from `followedTickets` | Ticket detail |
| 5 | `SWITCH_PERSONA` | 887 | Change `state.persona` | **no UI path** (Question 4) |
| 6 | `SWITCH_ROLE` | 892 | Change `activeRole` + `activeUser` | Sidebar role switcher |
| 7 | `CREATE_GOAL` | 895 | Create goal + child tasks | Create-a-goal modal |
| 8 | `ACCEPT_GOAL` | 913 | Goal → in_progress | Goal detail |
| 9 | `START_TASK` | 918 | Task → in_progress, bump parent goal | Task drawer |
| 10 | `COMPLETE_TASK` | 928 | Task → done + outcome note | Task drawer |
| 11 | `SKIP_TASK` | 934 | Task → skipped + reason | Skip-task modal |
| 12 | `QUALIFY_EXPANSION` | 939 | Opp → qualified | Qualify modal |
| 13 | `CREATE_CRM_OPP` | 944 | Opp → draft CRM opportunity | Expansion |
| 14 | `PUBLISH_GOAL` | 949 | Goal → published + shared | Publish modal |
| 15 | `CHANGE_GOAL_VISIBILITY` | 954 | Set goal visibility | Goal detail |
| 16 | `SEND_EMAIL` | 959 | Mark linked task done + toast | Email composer |
| 17 | `CREATE_TASK` | 966 | Create ad-hoc task | My Work |
| 18 | `DISMISS_PRIORITY` | 979 | Add to `dismissedPriority` | Dashboard |
| 19 | `SNOOZE_PRIORITY` | 982 | Add to `snoozedPriority` | Dashboard |
| 20 | `UPDATE_RENEWAL_FORECAST` | 985 | Set renewal forecast | Forecast modal |
| 21 | `TOGGLE_READ` | 990 | Toggle id in `readItems` | Lists |
| 22 | `ADD_TOAST` | 997 | Push toast | Many |
| 23 | `ADD_WIDGET` | 1000 | Add dashboard widget | Dashboard |
| 24 | `REMOVE_WIDGET` | 1003 | Remove widget | Dashboard |
| 25 | `REORDER_WIDGETS` | 1006 | Reorder widgets | Dashboard |
| 26 | `DISMISS_TOAST` | 1009 | Remove toast (auto at 4000ms, 1145) | Toast |
| 27 | `CLONE_AUTOMATION_AS_ACTION` | 1012 | Clone automation into Actions | Automation admin |
| 28 | `UPDATE_ACTION_MESSAGE` | 1021 | Edit action step subject/body | Action builder |
| 29 | `SAVE_ACTION` | 1027 | Create/update an action | Action builder |
| 30 | `TOGGLE_ACTION` | 1036 | Enable/disable an action | Actions list |
| 31 | `LOG_ATTR_CHANGE` | 1040 | Append attribute-change audit entry | `AttrReasonModal` |
| 32 | `CONNECT_MAILBOX` | 1047 | Personal mailbox connected | Profile › Mailbox |
| 33 | `UPDATE_EMAIL_CONFIG` | 1054 | Section-scoped merge; re-routes on domain change | Admin › Email |
| 34 | `SET_EMAIL_DOMAINS` | 1064 | Set company/excluded domains + re-route | Admin › Email |
| 35 | `ADD_SUPPORT_MAILBOX` | 1069 | Add shared mailbox | `MailboxWizard` |
| 36 | `UPDATE_SUPPORT_MAILBOX` | 1072 | Update shared mailbox | `MailboxEditModal` |
| 37 | `REMOVE_SUPPORT_MAILBOX` | 1076 | Remove shared mailbox | Admin › Mailboxes |
| 38 | `SET_DKIM` | 1079 | DKIM config patch | `DkimPanel` |
| 39 | `TOGGLE_BLACKLIST` | 1082 | Toggle blacklist entry | Admin › Email |
| 40 | `MAP_EMAIL_TO_ACCOUNT` | 1088 | Map email to customer | Email detail |
| 41 | `DISCONNECT_MAILBOX` | 1093 | Disconnect personal mailbox | Profile › Mailbox |
| 42 | `SYNC_MAILBOX` | 1096 | Sync personal mailbox | Profile › Mailbox |
| 43 | `MARK_EMAIL_READ` | 1099 | Clear unread flag | Email inbox |
| 44 | `TOGGLE_ASSISTANT` | 1101 | Open/close assistant panel | Header |
| 45 | `SET_ASSISTANT_CONTEXT` | 1104 | Set assistant context | Many |

## Data layer

~60 module-scope datasets, extracted verbatim into `src/data/`.
**Hard rule: `src/data/**` may import only from `src/data/**`.**

### Load-order hazards

ESM depth-first evaluation handles these *only if the data layer stays a DAG*:

- `genHistory` (223) — called 24× inside `HEALTH_SIGNALS`. Uses `Math.random()`
  **and** `new Date()` (Question 8).
- `TICKETS` (576–590) — 9 literals plus 15 pushed by a `forEach`. **The only
  module-const mutation in the file.** Collapse into an IIFE returning the full
  array; never export a binding mutated after evaluation.
- `SEEDED_ACTIONS` (11830) — IIFE depending on `AUTOMATIONS` (11188),
  `CSM_ACTIONS_EXTRA` (11747) and `cloneAutomationToAction` (11797). That helper
  must live in `src/data/`, not the Actions feature, or it creates a
  `data → features → data` cycle.
- `routeEmails(EMAILS, EMAIL_CONFIG_DEFAULTS, CUSTOMERS)` (817) — called inside
  `initialState`.
- Smaller derived: `APP_ROLE_LABELS` 1512, `ALL_PRIVILEGES` 1580,
  `CUST_DEFAULT_COLS` 2579, `DRIVE_TICKET_SOPS` 9204 (← `TICKET_ACTIONS` 7116).

### Core entities

`USERS` 179, `CUSTOMERS` 193 (24), `HEALTH_SIGNALS` 235, `TASKS` 321,
`ACTION_TASKS` 338, `GOALS` 365, `RISK_SIGNALS` 383, `RISKS` 418 (10),
`EXPANSION_SIGNALS` 494, `EXPANSION_OPPS` 518 (8), `TICKETS` 576 (24),
`MEETINGS` 592, `QBRS` 600, `CONNECTORS` 612, `RENEWALS` 622, `CONTACTS` 635.

### Email subsystem

`EMAILS` 660 (11), `SUPPORT_MAILBOXES` 746, `EMAIL_CONFIG_DEFAULTS` 757,
`EMAIL_TEMPLATES` 824, `TASK_SOURCES` 840, plus the routing engine
`emailDomainOf` / `classifyAddress` / `routeEmail` / `routeEmails` (780–822).

### Tickets

`TICKET_GATE_DEFAULTS` 7590, `TICKET_FIELD_DEFS` 7630, `TICKET_PRIMARY_FIELDS`
7657, `TICKET_ACTIONS` 7116, `TICKET_SAVED_FILTERS` 7187, `SLA_TARGET_HOURS` 7220.

### Actions / automations

`AUTO_FIELDS` / `AUTO_OPERATORS` / `AUTO_ACTIONS` / `AUTO_PILLARS` 11093–11188,
`AUTOMATIONS` 11188, `CSM_ACTIONS_EXTRA` 11747, `SEEDED_ACTIONS` 11830,
`ACTION_MERGE_FIELDS` 11849, `ACTION_PILLARS`/`SCOPES`/`COMMS` 11719–11774,
`ACME_ACTION_RUNS` 4196 + procedural `getCustomerActionRuns` / `cxHash` 2939.

### Admin / config seeds

`ADMIN_ENTITIES`/`ADMIN_FIELDS` 9648, `SIGNAL_SOURCES` 9716, `DRIVE_TEMPLATES`
9728, `ADMIN_TONES` 9753, `DRIVE_SOPS`/`DRIVE_TICKET_SOPS`/`DRIVE_KINDS`/
`DRIVE_FILES` 9013–9227, `USAGE_EVENTS`/`USAGE_PAGE_RULES`/`USAGE_SNIPPET` 9911,
`DEFAULT_CSAT_SURVEY`/`SURVEY_QUESTION_TYPES`/`SURVEY_TRIGGERS` 9957,
`NPS_SNIPPET`/`NPS_SEGMENTS` 9974, `COMMUNITY_PLATFORMS`/`COMMUNITY_SPACES` 9942,
`HYGIENE_RULES` 9978, `SLA_*` 10732, `ASSIGNMENT_*` 10890, `NOTIFY_*` 10977,
`AGENT_MAILBOXES`/`EMAIL_AUTH_METHODS`/`FORWARDING_RULES`/`AGENT_AUDIT`/
`AGENT_META` 12783, `SEED_ATTR_CHANGES` 4382, `ATTR_LABELS` 4375,
`TX_SCRIPTS`/`TX_PLAN`/`TX_CONNECTORS` 4563–4802, `ADMIN_SECTIONS` 13603.
EBR seeds `EBR_EMAILS_SEQ`, `EBR_ACTION_ITEMS_SEED`, `EBR_SLIDES` are component-
local (~8513, 8711, 8968).

## Roles and privileges

**Two separate, non-unified systems. Preserve both; do not merge them.**

1. **Runtime role** — `state.activeRole` ∈ {`csm`, `manager`, `executive`}, set
   only by the sidebar switcher. Controls *only*: the sidebar avatar/name (1871),
   whether "Manager view" renders (1900), and which dashboard the switch
   navigates to (1876–1878). It gates nothing else.
2. **Privilege matrix** — `APP_ROLES` 1505 (csm, senior_csm, team_lead, manager,
   support) × `PRIVILEGE_GROUPS` 1517 (39 privileges across 9 groups, via
   `ALL_PRIVILEGES` 1580). **Display-only**: read solely by Admin › Roles to
   render and toggle a grid held in local component state. No other component
   reads it; it enforces nothing (Question 7).

`PERSONAS` (7103) defines only `csm`; `NAV_BY_PERSONA` (7109) likewise. There is
no auth — `activeUser`/`activeRole` are seeded to Maya/CSM.

## Design primitives and their replacements

| Today | Line | Replacement |
|---|---|---|
| `Btn` (primary/secondary/danger/ghost/success/teal) | 1221 | `Button` — primary/secondary/ghost/danger only; `success`/`teal` collapse |
| `Card` | 1203 | `Card` — no shadow, 1px `border-default`, radius 8 |
| `MetricCard` | 1213 | `MetricCard` — `display` type, subtle delta |
| `HealthBadge` (red/yellow/green) | 1170 | `Badge` — success/warning/danger |
| `SeverityBadge` | 1182 | `Badge` |
| `StatusBadge` | 1187 | `Badge` |
| `CxPill` (7 tones) | 3098 | `Badge` — 5 tones |
| `EvidenceChip` | 1349 | `Badge` |
| `Avatar` | 1163 | `Avatar` + `AvatarGroup` |
| `Progress` | 1235 | `Progress` |
| `Tabs` | 1246 | `Tabs` (underline) |
| `Drawer` | 1252 | `Drawer`/`Sheet` |
| `Modal` | 1266 | `Dialog` |
| `Toast` | 1281 | `Toast` |
| `AdminTile` | 9763 | **Deleted** — replaced by settings subnav |
| `AdminCrumb` | 9780 | `PageHeader` breadcrumb |
| `AdminToggle` | 9794 | `Switch` |
| `CxLabel` / `CxBarRow` / `CxAIBox` | 3108 / 3115 / 3126 | `KeyValueList` / bar row / callout |
| `.cx-editor` CSS | 37–45 | `RichTextEditor` restyled to tokens |

**Tone collapse** (documented in full in `docs/design-system.md`):
`slate` → `neutral`; `blue`/`purple`/`teal` → `neutral` or `accent` by meaning;
`green` → `success`; `amber` → `warning`; `red` → `danger`.

## Migration status

| Screen | State | Module |
|---|---|---|
| Tickets / inbox | **Rebuilt** — three-pane | `src/features/inbox/` |
| Customers list | **Rebuilt** — DataTable | `src/features/customers/` |
| Risks | **Rebuilt** — DataTable + Drawer | `src/features/pipeline/` |
| Expansion | **Rebuilt** | `src/features/pipeline/` |
| Renewals | **Rebuilt** | `src/features/pipeline/` |
| Dashboard | **Rebuilt** — metric/chart cards | `src/features/dashboard/` |
| Admin | **Rebuilt shell** — settings subnav; section bodies still legacy | `src/features/admin/` |
| App shell, nav, ⌘K, toasts | **Rebuilt** | `src/layout/` |
| My Work, Customer 360, Goals, Health, Manager/Exec dashboards, Actions, Drive, Profile, Portal preview | Legacy, running inside the new shell | `src/legacy/app.tsx` |

Legacy screens render inside the new shell wrapped in `.cx-legacy`, which
restores the Tailwind v3 border default they rely on. Each drops out of
`src/legacy/app.tsx`'s export list as it is rebuilt; the file and its
`@ts-nocheck` go with the last one.

## Questions

Open items found during the audit. Per the brief, nothing here was silently
deleted. Items 1–3 are behaviour changes that have now been made.

1. **`/tickets` was never registered.** `TicketsPage` (8414) is defined, reads
   `query.ticket` and renders `TicketDetail` — but is referenced nowhere, and the
   route does not exist. `MyWork`'s ticket rows (6951) navigate to
   `/tickets?ticket=<id>`, which falls through to the `*` 404. This looks like a
   forgotten route registration, not a deliberate omission.
   **Done:** the route is registered and now renders the rebuilt inbox.
   Covered by a test asserting it no longer 404s.
2. **Seven admin sub-screens are unreachable** — Required fields (13376), SLA
   (10761), Assignment (10914), Notifications (11003), Automation (11629),
   ActionsOverview (12463) and Drive (10650) are fully implemented and wired into
   `AdminPage`'s if-chain, but absent from `ADMIN_SECTIONS` (13603), and
   `setSection` is called nowhere else. The `counts` object (13636–13649) still
   computes an unused tile label for each of the seven — they look trimmed from
   the grid, not abandoned.
   Consequence: `UPDATE_GATE_CONFIG` and `SET_GATE_FIELD_REQUIRED` have no UI
   path at all, since `RequiredFieldsAdmin` is their only trigger.
   **Done:** all thirteen admin sections are in the settings subnav and
   addressable by URL. Each previously unreachable one has a test. This also
   gives `UPDATE_GATE_CONFIG` and `SET_GATE_FIELD_REQUIRED` a UI path.
3. **Five routes are in no navigation** — `/health`, `/renewals`, `/manager`,
   `/executive`, `/goals/:goalId` (plus `/qbrs`, a duplicate path to `DrivePage`).
   **Done:** `/health` and `/renewals` are Customers views, `/manager` and
   `/executive` are Dashboard views, and `/goals/:goalId` is reached from My
   Work. `/qbrs` still renders Drive — see Question 9, which needs your call.
4. **`support` persona is half-built — still open, preserved as is.** `MyWork` (6829–6831) branches on
   `persona === 'support'` with its own `SUPPORT_TABS`, but `PERSONAS` (7103)
   defines only `csm`, so `SWITCH_PERSONA` can never reach it. Unfinished feature,
   or intentionally dormant? Preserved as-is for now.
5. **Five `Customer360` tabs are defined but not listed** — `SupportTab` 3292,
   `IntelligenceTab` 3970, `CustomerActionsTab` 4266, `TranscriptsTab` 4813,
   `TimelineTab` 5653 are absent from the active tab list (5259). Dead code, or
   planned? Preserved and ported; not surfaced without a decision.
6. **`.sidebar-link` CSS is orphaned** (27–28) — no element uses the class.
   Safe to drop with the sidebar rewrite.
7. **Privileges enforce nothing.** `APP_ROLES`/`PRIVILEGE_GROUPS` is a settings-
   page mock. Should privileges gate real UI, or stay presentational? Staying
   presentational for this rebuild — it is a business-logic change otherwise.
8. **Health history is randomised per load — still open.** `genHistory` uses
   `Math.random()` and `new Date()`, so every reload produces different charts
   and the dashboard's health trend differs between sessions. Seeding it would
   make demo data stable and visual snapshot testing meaningful, but it changes
   what users see, so it is left alone pending your call.
9. **`QBRsPage` and `ReportsPage` are dead code.** Both are defined (9430, 9505)
   and referenced nowhere. Meanwhile `/qbrs` and `/drive` both render `DrivePage`
   (9310) — so the QBR route shows the Drive screen while a real QBR page sits
   unused. Should `/qbrs` point at `QBRsPage`, and does `ReportsPage` need a
   route? Both preserved and ported; neither surfaced without a decision.
