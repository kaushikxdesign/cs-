import type { Tone } from '@/design-system';

export function formatCurrency(n: number | undefined) {
  if (!n) return '—';
  return n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M` : `$${(n / 1000).toFixed(0)}K`;
}

export function formatDate(value: string | undefined) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function daysUntil(value: string | undefined) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return Math.ceil((d.getTime() - Date.now()) / 86_400_000);
}

/** Health bands map straight onto the three status tones. */
export function healthTone(band: string | undefined): Tone {
  if (band === 'green') return 'success';
  if (band === 'yellow' || band === 'amber') return 'warning';
  if (band === 'red') return 'danger';
  return 'neutral';
}

export function severityTone(severity: string | undefined): Tone {
  if (severity === 'critical' || severity === 'high') return 'danger';
  if (severity === 'medium') return 'warning';
  return 'neutral';
}

export function titleCase(s: string | undefined) {
  if (!s) return '—';
  return s.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
}
