# CX42 Design System

Implemented in `src/styles/tokens.css` (tokens) and `src/design-system/`
(components). Every component and token is rendered together at
[`/#/design-system`](http://localhost:5173/#/design-system).

## Principles

1. **Colour carries meaning, never decoration.** One accent hue. Status colour
   only where something is genuinely good, at risk or broken.
2. **Hairline borders, not shadows.** Cards use a 1px `border-default`. Shadow is
   reserved for things that float above the page: `shadow-sm` for popovers and
   menus, `shadow-lg` for modals and drawers.
3. **Compact but airy.** 32px controls, 40px table rows, a 4px spacing grid.
4. **One of each pattern.** One page header, one table, one badge, one tab style.
   A screen that invents its own version of an existing pattern is a bug.
5. **Quieter is better.** Where this document does not decide something, choose
   the more restrained and more consistent option.

## Tokens

Components reference **semantic** tokens only (`bg-surface`, `text-secondary`,
`border-default`). Primitives (`--gray-200`, `--accent-500`) exist solely to be
referenced by semantic tokens, so the palette can be re-pointed in one place.

Semantic tokens are declared on `:root` as plain CSS variables and mapped into
Tailwind with `@theme inline`, so generated utilities emit `var(--token)` rather
than a resolved colour. That is what lets the dark-mode block override them.

### Colour

| Group | Tokens |
|---|---|
| Surfaces | `bg-canvas`, `bg-surface`, `bg-subtle`, `bg-hover`, `bg-selected`, `bg-inverse` |
| Borders | `border-default`, `border-strong` |
| Text | `text-primary`, `text-secondary`, `text-tertiary`, `text-disabled`, `text-on-accent`, `text-inverse` |
| Accent | `accent`, `accent-hover`, `accent-active`, `accent-subtle`, `accent-muted`, `accent-text` |
| Status | `status-{success,warning,danger,info}-{subtle,border,text,solid}` |
| Charts | `chart-1` … `chart-6` (muted categorical) |
| Focus | `focus-ring` |

### Typography

Geist (self-hosted, variable), tabular numerals on all metrics and tables.
Weights 400, 500, 600 only. **Nothing below 12px.**

| Token | Size / line height | Use |
|---|---|---|
| `caption` | 12 / 16 | meta, timestamps, table headers |
| `body-sm` | 13 / 20 | default UI text, nav, table cells |
| `body` | 14 / 22 | message bodies, forms, descriptions |
| `title-sm` | 15 / 22, 600 | card and panel titles |
| `title` | 18 / 26, 600 | page titles |
| `display` | 24 / 32, 600 | dashboard KPI values only |

### Spacing, radii, density

- **Spacing** 4px grid: 4, 8, 12, 16, 20, 24, 32, 40.
- **Radii** `sm` 4px (badges, checkboxes), `md` 6px (buttons, inputs, nav items),
  `lg` 8px (cards, popovers, menus), `xl` 12px (modals, drawers), `full`
  (avatars and status dots only).
- **Density** button 32px (sm 28px), input 32px, table row 40px, nav item 32px,
  icon 16px at stroke 1.5.
- **Motion** 120ms for hover and press, 180ms ease-out for panels. No bounce, no
  scale-in on page load. All motion is disabled under `prefers-reduced-motion`.

## Tone mapping

The MVP used seven hues as `tone` values with no consistent meaning — `blue`
alone meant the CSM role, the "action" task source, an "AI generated" badge,
"Mailbox ready" and acquisition risk. Counts in the original:

| Legacy tone | Occurrences | Maps to | Why |
|---|---|---|---|
| `slate` | 51 | `neutral` | Default, non-semantic |
| `blue` | 41 | `neutral`, or `info` where genuinely informational | Was used for both chrome and meaning |
| `amber` | 18 | `warning` | Already meant caution |
| `purple` | 15 | `neutral`, or `accent` when it marks the active/primary thing | Never carried its own meaning |
| `red` | 14 | `danger` | Already meant failure |
| `green` | 13 | `success` | Already meant healthy |
| `teal` | 9 | `neutral` | Decorative variation on blue/green |

Health bands map directly: green → `success`, yellow/amber → `warning`,
red → `danger`.

Legacy `Btn` variants collapse the same way: `primary` → `primary`,
`secondary` → `secondary`, `ghost` → `ghost`, `danger` → `danger`, and
`success` / `teal` → `secondary` (a button's colour should not encode the
outcome of pressing it).

## Component rules

- **Buttons.** At most one `primary` per view. Icons only where they add meaning,
  never on every button.
- **Badges.** Always subtle (tinted background + text). The single exception is
  `CountBadge`, which may be solid so counts read at a glance.
- **Tables.** One `DataTable`: sortable headers, optional selection, sticky
  header, row actions revealed on hover rather than a permanent button column.
- **Overlays.** Record detail opens in a `Drawer`. `Dialog` is only for blocking
  confirmations and short focused forms. The assistant is a side panel, never a
  floating overlay.
- **States.** Every list, table and panel needs empty, loading (skeleton) and
  error states. Empty states get an icon, a sentence and the action that creates
  the first record — no illustrations, no emoji.
- **Icons.** `lucide-react` only, 16px, stroke 1.5. No emoji or unicode glyphs as
  icons, anywhere.
- **Focus.** Visible focus ring on every interactive element, via the global
  `:focus-visible` rule. Never remove it without replacing it.

## Decisions taken where the brief was silent

- **The app is light only.** Dark tokens exist but are opt-in via an explicit
  `data-theme="dark"`, deliberately not wired to `prefers-color-scheme`: a
  viewer on a dark OS should still get the light product rather than a
  half-tuned dark one. `color-scheme: light` keeps native controls in step.
- **Tailwind v4** over v3, because its CSS-first `@theme` maps directly onto
  CSS-variable tokens. v4 changed the default border colour from `gray-200` to
  `currentColor`; legacy markup relies on the v3 default in 122 places, so
  `legacy.css` restores it for legacy markup only and is deleted with it.
- **The hand-rolled hash router is kept**, not replaced with react-router. Its
  matching rules differ from v6 in ways the app depends on: equal-segment
  matching with first-declared-wins, `NavLink` active-by-prefix with a
  `/dashboard` special case, and a query parsed from inside the hash and exposed
  as an object to seven components.
- **Chart palette is muted** rather than saturated, so that status colour stays
  the loudest thing on a dashboard.
