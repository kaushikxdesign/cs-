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

/**
 * Health bands as data. Deliberately NOT the status solids the badges use:
 * a distribution chart describes a portfolio, it does not raise an alarm,
 * and three saturated bars next to a grey table read as three alerts.
 */
export const BAND_CHART_COLORS = {
  green: 'var(--band-good)',
  yellow: 'var(--band-watch)',
  red: 'var(--band-risk)',
} as const;

export const STATUS_CHART_COLORS = {
  success: 'var(--band-good)',
  warning: 'var(--band-watch)',
  danger: 'var(--band-risk)',
  info: 'var(--chart-2)',
} as const;

/** 12px is the floor for all UI text, charts included. */
export const AXIS_TICK = { fontSize: 12, fill: 'var(--chart-axis)' } as const;

export const AXIS_PROPS = {
  tickLine: false,
  axisLine: false,
  tick: AXIS_TICK,
} as const;

/** Gridlines are a faint horizontal rule only — no vertical clutter. */
export const GRID_PROPS = {
  stroke: 'var(--chart-grid)',
  strokeDasharray: '0',
  vertical: false,
} as const;

/** Bars get a little air and a rounded cap, so a chart reads as one object
    rather than a row of separate blocks. */
export const BAR_PROPS = { radius: [4, 4, 0, 0] as [number, number, number, number], maxBarSize: 44 } as const;

/** A 2px line is legible on both grounds; 1px disappears on dark. */
export const LINE_PROPS = { strokeWidth: 2, dot: false, activeDot: { r: 4 } } as const;

export const TOOLTIP_PROPS = {
  cursor: { fill: 'var(--surface-hover)' },
  contentStyle: {
    background: 'var(--surface-default)',
    border: '1px solid var(--border-default)',
    borderRadius: '8px',
    fontSize: '13px',
    color: 'var(--on-surface)',
    boxShadow: 'var(--shadow-md)',
    padding: '8px 10px',
  },
  labelStyle: { color: 'var(--on-surface-subtle)', fontSize: '12px' },
} as const;
