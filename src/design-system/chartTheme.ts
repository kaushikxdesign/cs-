/**
 * One chart theme for the whole app. The MVP hardcoded `tick={{fontSize:11}}`
 * in fifteen places and picked colours per chart; both live here now.
 *
 * Values are CSS variables so charts follow the token layer, including in
 * dark mode — SVG fill and stroke accept var() the same way CSS does.
 */
export const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-6)',
] as const;

export const STATUS_CHART_COLORS = {
  success: 'var(--status-success-solid)',
  warning: 'var(--status-warning-solid)',
  danger: 'var(--status-danger-solid)',
  info: 'var(--status-info-solid)',
} as const;

/** 12px is the floor for all UI text, charts included. */
export const AXIS_TICK = { fontSize: 12, fill: 'var(--text-tertiary)' } as const;

export const AXIS_PROPS = {
  tickLine: false,
  axisLine: false,
  tick: AXIS_TICK,
} as const;

/** Gridlines are a faint horizontal rule only — no vertical clutter. */
export const GRID_PROPS = {
  stroke: 'var(--border-default)',
  strokeDasharray: '0',
  vertical: false,
} as const;

export const TOOLTIP_PROPS = {
  cursor: { fill: 'var(--bg-hover)' },
  contentStyle: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-default)',
    borderRadius: '8px',
    fontSize: '13px',
    color: 'var(--text-primary)',
    boxShadow: '0 1px 2px 0 rgb(24 24 27 / 0.06), 0 1px 3px 0 rgb(24 24 27 / 0.08)',
  },
  labelStyle: { color: 'var(--text-tertiary)', fontSize: '12px' },
} as const;
