# CX42 UI Redesign — Prompt for Claude Code

> Paste everything below the line into Claude Code, run from the repo root with `CX42_MVP_must_have.html` in the project. Start in **plan mode** (Shift+Tab) so it plans before touching code.

---

## Role and goal

You are a senior product designer and design engineer. CX42 is a stealth-mode Customer Success platform (portfolio health, risks, expansion, renewals, tickets, email, goals, QBR/EBR, automations, admin). The current MVP lives in a single ~1 MB file, `CX42_MVP_must_have.html`, written with `React.createElement`, Tailwind's play CDN and Recharts from unpkg.

The product works, but the UI feels cheap, confusing and "vibe coded". Your job is to **re-platform the UI onto a real design system with the calm, neat, modern feel of Intercom's workspace**: neutral canvas, one accent colour, hairline borders instead of shadows, compact but airy density, crisp typography, line icons, an inbox-style three-pane layout, and a contextual right-hand details panel.

"Like Intercom" means the design language and interaction patterns. Do not copy Intercom's logo, brand colours, illustrations, icon set or copy. CX42 must look like its own product.

## Non-negotiables

1. **Preserve behaviour.** Every route, reducer action, mock dataset, role/privilege rule, automation, wizard step, modal and piece of copy must still exist and work. This is a UI rebuild, not a feature change. If something looks broken or pointless, log it in `docs/ui-inventory.md` under "Questions", do not silently delete it.
2. **No new features** and no changes to business logic or data shapes.
3. **Tokens only.** No raw hex values, no arbitrary Tailwind values (`text-[11px]`, `bg-[#...]`), no inline `style` for colour, spacing or type outside the token files.
4. **No emoji or unicode glyphs as icons.** Use `lucide-react` exclusively, 16px in UI chrome, 1.5 stroke.
5. **Work in phases, commit per phase, and stop for my review at the checkpoints marked ⏸.**

## What is wrong today (verify, then fix)

I did a quick audit; confirm each finding in the code before acting on it:

- ~127 emoji / unicode codepoints used as icons (📁 ⚡ ⚠ 🏢 ▦ ✓ ↗ ⚙), rendering differently per OS.
- Dark `slate-800` sidebar with saturated `indigo-600` filled active pills, which is the main source of the "template" look.
- A different hue per concept (indigo, amber, teal, blue, purple, rose, emerald as `tone` props), so nothing reads as important.
- Inconsistent radii (`rounded-md`, `-lg`, `-xl`, `-2xl`, `-full` mixed on similar elements) and ad-hoc `fontSize: 10/11` inline styles.
- `@apply` inside a plain `<style>` tag, which the Tailwind play CDN does not process, so `.sidebar-link` styles are likely dead.
- `NAV` is defined twice (sidebar and Spotlight) with different items; "Profile settings" appears both in the nav and pinned at the bottom; a role switcher and a "Manager view" shortcut are crammed into the sidebar.
- Flat top-level navigation with 8+ items and no secondary navigation, so Admin, Customer 360 and ticket/email views have to invent their own layouts.

## Target stack

If the repo already has a stack, keep it. Otherwise set up:

- Vite + React 18 + TypeScript (strict)
- Tailwind CSS (current major), configured to read CSS-variable tokens
- Radix primitives via shadcn/ui (generated into `src/components/ui`, then restyled to our tokens)
- `lucide-react`, `recharts`, `react-router-dom` (keep existing paths, hash routing is fine)
- ESLint + Prettier, Playwright for screenshots

Suggested structure:

```
src/
  styles/tokens.css        # all primitives + semantic tokens (light, dark-ready)
  styles/globals.css
  design-system/           # our components, built on ui/
  components/ui/           # shadcn/Radix generated primitives
  layout/                  # AppShell, NavRail, SecondaryNav, PageHeader, DetailsPanel
  features/<module>/       # dashboard, work, customers, risks, expansion, actions,
                           # tickets, emails, goals, qbrs, renewals, drive, admin, assistant
  data/                    # mock data and constants extracted verbatim from the HTML
  state/                   # AppContext + reducer extracted verbatim
  routes.tsx
docs/
  ui-inventory.md
  design-system.md
```

## Design system spec

Implement these as CSS variables in `tokens.css`, exposed as Tailwind theme values. Components reference **semantic** tokens only, never primitives.

**Colour primitives**
- Gray: 0 `#FFFFFF`, 25 `#FCFCFD`, 50 `#F7F7F8`, 100 `#F0F0F2`, 200 `#E4E4E7`, 300 `#D4D4D8`, 400 `#A1A1AA`, 500 `#71717A`, 600 `#52525B`, 700 `#3F3F46`, 800 `#27272A`, 900 `#18181B`
- Accent (placeholder, one hue only, easy to swap): 50 `#EEF2FF`, 100 `#E0E7FF`, 500 `#4F5BD5`, 600 `#3F4AC0`, 700 `#343DA3`
- Status, each with `subtle` bg, `border`, `text`, `solid`: success (green), warning (amber), danger (red), info (blue)

**Semantic tokens**
`bg-canvas`, `bg-surface`, `bg-subtle`, `bg-hover`, `bg-selected`, `border-default`, `border-strong`, `text-primary`, `text-secondary`, `text-tertiary`, `text-disabled`, `text-on-accent`, `accent`, `accent-hover`, `accent-subtle`, `focus-ring`, plus `status-{success|warning|danger|info}-{subtle|border|text|solid}` and `chart-1…6` (muted categorical palette).

**Tone mapping.** Collapse every existing `tone` value to five: `neutral`, `accent`, `success`, `warning`, `danger` (plus `info` where it means "informational"). Purple/teal/indigo tones become `neutral` or `accent`. Health bands map to success/warning/danger. Document the mapping table in `docs/design-system.md`.

**Typography.** Inter (with system fallback), `font-feature-settings: "cv11", "ss01"`, tabular numbers for all metrics and tables. Weights 400, 500, 600 only.

| Token | Size / line height | Use |
|---|---|---|
| `caption` | 12 / 16 | meta, timestamps, table headers |
| `body-sm` | 13 / 20 | default UI text, nav, table cells |
| `body` | 14 / 22 | message bodies, forms, descriptions |
| `title-sm` | 15 / 22, 600 | card and panel titles |
| `title` | 18 / 26, 600 | page titles |
| `display` | 24 / 32, 600 | dashboard KPI values only |

Nothing below 12px.

**Spacing** 4px grid (4, 8, 12, 16, 20, 24, 32, 40). **Radii** 4 (badges, checkboxes), 6 (buttons, inputs, nav items), 8 (cards, popovers, menus), 12 (modals, drawers), full (avatars and status dots only). **Borders** 1px `border-default` is the primary separator. **Elevation** cards have no shadow; popovers/menus `shadow-sm`; modals/drawers `shadow-lg`. **Motion** 120ms for hover/press, 180ms ease-out for panels; no bounce, no scale-in on page load. **Density** button 32px (sm 28px), input 32px, table row 40px, nav item 32px, icon 16px.

**Visual rules**
- White/near-white canvas, content on `bg-surface` with 1px borders. No gradients, glassmorphism, coloured card backgrounds or decorative blobs.
- Colour is for meaning (status, selection, primary action), never decoration. At most one primary (accent) button per view.
- Active nav item = `bg-selected` + `text-primary` + 500 weight, not a filled accent pill.
- Badges are subtle (tinted bg + text), never solid, except counts.
- Empty, loading (skeleton) and error states for every list, table and panel.
- Visible keyboard focus ring everywhere; WCAG AA contrast.

## Component library (`src/design-system`)

Build and document these first, with all variants and states: Button (primary, secondary, ghost, danger; sm/md; icon-only; loading), IconButton, Input, Textarea, Select, Combobox, Checkbox, Switch, Radio, SegmentedControl, Tabs (underline style), Badge/Pill (tone-based), StatusDot, Avatar + AvatarGroup, Tooltip, DropdownMenu, Popover, Dialog, Drawer/Sheet, Toast, Card, KeyValueList, DataTable (sortable, selectable rows, sticky header, column visibility, row hover actions), FilterBar (chips + "Add filter"), EmptyState, Skeleton, PageHeader (breadcrumb, title, meta, actions), SecondaryNav, DetailsPanel (collapsible sections), MetricCard, ChartCard (wrapping Recharts with token colours, no gridline clutter), Timeline, CommandPalette (⌘K), RichTextEditor (restyle existing), Stepper (for EBR/mailbox wizards), RuleBuilder rows (for automations/triggers).

Create a `/design-system` route that renders every component and token so we can review the system in isolation.

## App shell (Intercom-style)

- **Nav rail (56px, left, light):** product mark at top; icon-only module links with tooltips (Dashboard, My Work, Customers, Tickets/Inbox, Risks, Expansion, Actions, Drive); Admin/Settings and the user avatar menu pinned to the bottom. The avatar menu holds Profile settings and the role switcher (CSM / Manager / Executive). Remove the sidebar "Manager view" button.
- **Secondary nav (240px, collapsible):** per-module views and saved filters. Examples: Customers → All accounts, My portfolio, At risk, Renewals in 30 days, Dormant; Dashboard → My dashboard, Manager view, Executive view; Tickets → All, Assigned to me, SLA at risk, SLA breached, Ageing > 5 days; Admin → grouped settings list.
- **Main area:** `PageHeader` + content. No heavy global top bar; search lives in ⌘K and a small search trigger at the top of the secondary nav.
- **Details panel (320–360px, right, collapsible):** record attributes, health breakdown, related items. The CX42 Assistant opens here as a side panel, not a floating overlay.
- Single source of truth for navigation (one `nav.ts`) consumed by the rail, secondary nav, ⌘K and `NAV_BY_PERSONA`.

## Screen-by-screen direction

Migrate in this order, one screen per commit:

1. **Tickets and Email inbox** (`TicketsPage`, `TicketDetail`, `EmailInbox`, `EmailDetail`): true three-pane inbox. List pane with compact rows (avatar, subject, snippet, SLA/sentiment badges, time), conversation pane with composer docked at the bottom, details pane with account attributes, SLA, sentiment and `TicketActionsPane` SOPs as a checklist.
2. **Customers list and Customer 360** (`CustomersList`, `Customer360` and its tabs Overview, Health, Goals, Contacts, Usage, Interactions, Timeline, Support, Success, Intelligence, Transcripts): list becomes a `DataTable` with FilterBar and saved views. 360 becomes header (name, ARR, health, renewal, owner) + underline tabs + right `DetailsPanel` for `AccountAttributesPanel`.
3. **Dashboard, Manager and Executive dashboards:** a 12-column grid of `MetricCard` and `ChartCard`; KPIs in `display` size with a subtle delta; one chart palette.
4. **My Work, Tasks, Goals** (`MyWork`, `TaskDetailDrawer`, `GoalDetail`): grouped list (Overdue, Today, Upcoming) with inline complete; details in a Drawer.
5. **Risks, Expansion, Renewals, QBRs/EBR wizard:** tables + Stepper-based wizard with a clean footer action bar.
6. **Actions and Automations** (`ActionsPage`, `ActionBuilder`, `AutomationBuilder`, `FlowNode/FlowBranch`): Intercom-workflow feel, readable when/if/then rule rows, neutral canvas for flows.
7. **CX42 Drive:** file table + preview panel.
8. **Admin → Settings** (`AdminPage` and every `*Admin`/`*Builder`: Roles, Users, Field Manager, Required Fields, Assignment, SLA, Signals, Notifications, Email config, Mailboxes/DKIM, Connectors, Drive, and the NPS/CSAT/Sentiment/Usage/Hygiene/LinkedIn/Community/Conversations builders): settings layout with grouped left subnav, max-width 760px forms, section headers with description, save bar that appears only when dirty. Replace `AdminTile` grids with the subnav.
9. **Profile settings, Portal preview, Spotlight → CommandPalette, Toasts, Modals.**

## Process

**Phase 0 — Audit (plan mode, no code changes).** Read the whole HTML. Produce `docs/ui-inventory.md` listing every route, component, modal, drawer, wizard, reducer action and interactive state, with where it lives, which new component/layout it maps to, and open questions. Confirm or correct the findings in "What is wrong today". ⏸ **Stop for review.**

**Phase 1 — Foundation.** Scaffold the project, extract data and state verbatim into `src/data` and `src/state`, get the existing screens rendering unchanged (a straight port is fine at this stage). Build tokens, `docs/design-system.md` and the full component library with the `/design-system` page. ⏸ **Stop for review with screenshots of `/design-system`.**

**Phase 2 — Shell.** Nav rail, secondary nav, page header, details panel, ⌘K, unified `nav.ts`. ⏸ **Stop for review.**

**Phase 3 — Screens.** Follow the order above. After each screen: run typecheck, lint and build, click through its flows, capture Playwright screenshots at 1440×900 and 1280×800, self-review against the checklist below, fix issues, then commit (`feat(ui): migrate <screen> to design system`).

**Phase 4 — Polish.** Consistency sweep across screens, empty/loading states, keyboard navigation, focus states, reduced motion, and a final report of what changed and what's in "Questions".

## Definition of done (check with grep, not by eye)

- [ ] `rg "[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]" src` returns no icon usages
- [ ] `rg "#[0-9a-fA-F]{3,8}" src --glob '!src/styles/tokens.css'` returns nothing
- [ ] `rg "\[(#|\d+px)" src` returns no arbitrary Tailwind values
- [ ] `rg "indigo-|purple-|teal-|rose-|emerald-|slate-800" src` returns nothing
- [ ] No inline `style` except dynamic layout values (e.g. chart widths)
- [ ] Every route from the original file resolves, every reducer action is reachable from the UI
- [ ] Only lucide icons, only token radii, only the typography scale
- [ ] `tsc --noEmit`, lint and build pass; no console errors on any route
- [ ] Screens look like one product: same header pattern, same table, same badges, same spacing

## Anti-patterns to avoid

Gradient buttons or headers; coloured card backgrounds; drop shadows on cards; more than one accent hue; icons inside every button; ALL CAPS labels everywhere; centred page layouts for data screens; modals for things that should be drawers or side panels; stacking multiple badges per row when one status is enough; placeholder "Coming soon" tiles in primary navigation; decorative emoji in empty states.

When a design decision isn't covered here, choose the quieter, more consistent option and note it in `docs/design-system.md`.
