import React from 'react';
import { Check, ChevronRight, Copy } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Badge, Button, Card, EmptyState, type Tone } from '@/design-system';

/**
 * The MVP carried seven decorative hues that meant nothing in particular.
 * Everything collapses onto the semantic scale here, once, so no admin
 * screen has to decide what `teal` was supposed to convey.
 */
export const TONE: Record<string, Tone> = {
  green: 'success',
  amber: 'warning',
  red: 'danger',
  blue: 'info',
  purple: 'neutral',
  teal: 'accent',
  slate: 'neutral',
};

export const toneOf = (t?: string): Tone => TONE[t ?? ''] ?? 'neutral';

/**
 * Settings pages are read far more often than they are edited, so the unit
 * is a titled group of rows rather than a card grid. One rule between rows,
 * none above the first, and the title carries the weight.
 */
export function SettingsGroup({
  title,
  description,
  actions,
  children,
  flush,
  className,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  /** Tables and lists own their padding; forms do not. */
  flush?: boolean;
  className?: string;
}) {
  return (
    <section className={cn('space-y-2.5', className)}>
      {(title || actions) && (
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            {title && <h3 className="text-body font-semibold text-on-surface">{title}</h3>}
            {description && (
              <p className="mt-0.5 max-w-prose text-body-sm leading-relaxed text-on-surface-subtle">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      )}
      <Card className={cn('overflow-hidden', !flush && 'px-4')}>{children}</Card>
    </section>
  );
}

/**
 * One setting: what it does on the left, the control on the right. The
 * explanation is part of the row, not a tooltip — these are decisions an
 * admin makes once and needs to understand while making them.
 */
export function SettingRow({
  label,
  description,
  control,
  className,
}: {
  label: React.ReactNode;
  description?: React.ReactNode;
  control: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-6 border-b border-border-default py-3.5 last:border-0',
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-body-sm font-medium text-on-surface">{label}</p>
        {description && (
          <p className="mt-0.5 max-w-prose text-caption leading-relaxed text-on-surface-subtle">
            {description}
          </p>
        )}
      </div>
      <div className="shrink-0 pt-0.5">{control}</div>
    </div>
  );
}

/** A plain definition row, for facts rather than controls. */
export function FactRow({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border-default py-2.5 last:border-0">
      <span className="text-body-sm text-on-surface-muted">{label}</span>
      <span className="shrink-0 text-body-sm font-medium text-on-surface">{value}</span>
    </div>
  );
}

/**
 * Admin tables are all the same shape, so the chrome lives here: a sticky
 * tinted head, hairline rows, and a hover only when rows are clickable.
 */
export function AdminTable({
  columns,
  children,
  minWidth,
}: {
  columns: React.ReactNode[];
  children: React.ReactNode;
  minWidth?: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-body-sm" style={minWidth ? { minWidth } : undefined}>
        <thead>
          <tr className="border-b border-border-default bg-subtle">
            {columns.map((c, i) => (
              <th
                key={i}
                className={cn(
                  'whitespace-nowrap px-4 py-2.5 text-left text-caption font-medium text-on-surface-subtle',
                  i === columns.length - 1 && 'text-right',
                )}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Row({
  onClick,
  children,
  muted,
}: {
  onClick?: () => void;
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        'border-b border-border-default last:border-0',
        onClick && 'cursor-pointer',
        'transition-colors duration-[120ms] hover:bg-hover',
        muted && 'opacity-55',
      )}
    >
      {children}
    </tr>
  );
}

export function Cell({
  children,
  className,
  right,
  mono,
}: {
  children?: React.ReactNode;
  className?: string;
  right?: boolean;
  mono?: boolean;
}) {
  return (
    <td
      className={cn(
        'px-4 py-2.5 align-middle text-on-surface-muted',
        right && 'text-right',
        mono && 'font-mono text-caption',
        className,
      )}
    >
      {children}
    </td>
  );
}

/** The one place a row's primary label is set, so tables stay consistent. */
export function NameCell({ children, sub }: { children: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <td className="px-4 py-2.5 align-middle">
      <p className="text-body-sm font-medium text-on-surface">{children}</p>
      {sub && <p className="mt-0.5 text-caption text-on-surface-subtle">{sub}</p>}
    </td>
  );
}

export function Chevron() {
  return <ChevronRight className="ml-auto size-4 text-on-surface-faint" strokeWidth={1.75} />;
}

/**
 * A tile that opens a sub-screen. Replaces the MVP's emoji-in-a-coloured-
 * square; the icon is a lucide component and the tint is semantic.
 */
export function NavTile({
  icon: Icon,
  title,
  description,
  meta,
  tone = 'neutral',
  onClick,
}: {
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: React.ReactNode;
  description?: React.ReactNode;
  meta?: React.ReactNode;
  tone?: Tone;
  onClick: () => void;
}) {
  const TINT: Record<string, string> = {
    info: 'bg-info-subtle text-info-fg',
    success: 'bg-success-subtle text-success-fg',
    warning: 'bg-warning-subtle text-warning-fg',
    danger: 'bg-danger-subtle text-danger-fg',
    accent: 'bg-accent-subtle text-accent',
    neutral: 'bg-subtle text-on-surface-muted',
  };
  return (
    <button
      onClick={onClick}
      className={cn(
        'group w-full rounded-xl border border-border-default bg-surface p-4 text-left',
        'transition-colors duration-[120ms] hover:border-border-strong hover:bg-hover',
      )}
    >
      <div className="flex items-start gap-3">
        {Icon && (
          <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', TINT[tone])}>
            <Icon className="size-4" strokeWidth={1.75} />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-body-sm font-medium text-on-surface">{title}</p>
          {description && (
            <p className="mt-1 text-caption leading-relaxed text-on-surface-subtle">{description}</p>
          )}
        </div>
        <Chevron />
      </div>
      {meta && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-border-default pt-3">
          {meta}
        </div>
      )}
    </button>
  );
}

/** Connected / not connected, said the same way everywhere. */
export function StatusBadge({ status }: { status?: string }) {
  const map: Record<string, { tone: Tone; label: string }> = {
    active: { tone: 'success', label: 'Active' },
    connected: { tone: 'success', label: 'Connected' },
    enabled: { tone: 'success', label: 'Enabled' },
    attention: { tone: 'warning', label: 'Needs attention' },
    inactive: { tone: 'neutral', label: 'Inactive' },
    not_connected: { tone: 'neutral', label: 'Not connected' },
    disabled: { tone: 'neutral', label: 'Disabled' },
  };
  const s = map[status ?? ''] ?? { tone: 'neutral' as Tone, label: status ?? '—' };
  return (
    <Badge tone={s.tone} dot>
      {s.label}
    </Badge>
  );
}

/**
 * An install snippet. Dark on both themes on purpose: code is quoted
 * material, and a block that inverts with the UI stops reading as a quote.
 */
export function CodeBlock({
  code,
  label = 'Install snippet',
  onCopy,
}: {
  code: string;
  label?: string;
  onCopy?: () => void;
}) {
  const [copied, setCopied] = React.useState(false);
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <p className="text-caption font-medium text-on-surface-muted">{label}</p>
        <Button
          size="sm"
          variant="ghost"
          icon={
            copied ? (
              <Check className="size-3.5" strokeWidth={2} />
            ) : (
              <Copy className="size-3.5" strokeWidth={1.75} />
            )
          }
          onClick={() => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
            onCopy?.();
          }}
        >
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
      <pre className="overflow-x-auto rounded-lg bg-code-bg p-3 font-code text-caption leading-relaxed text-code-fg">
        {code}
      </pre>
    </div>
  );
}

/** Used by every list that can come up empty. */
export function NoRows({ colSpan, message }: { colSpan: number; message: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-0">
        <EmptyState compact title={message} />
      </td>
    </tr>
  );
}

/**
 * When / if / then, printed as sentences. The MVP rendered the same three
 * clauses four different ways across Actions, Automations and this overview.
 */
export function RuleLines({ action }: { action: any }) {
  const lines: Array<[string, React.ReactNode]> = [];
  if (action.event) {
    lines.push([
      'When',
      <>
        <RuleToken>{action.event.field}</RuleToken>
        <span className="text-on-surface-muted">{action.event.mode}</span>
        {action.event.to && <RuleToken>{action.event.to}</RuleToken>}
      </>,
    ]);
  }
  (action.conditions ?? []).forEach((c: any, i: number) =>
    lines.push([
      i === 0 ? 'If' : (action.logic ?? 'And'),
      <>
        <RuleToken>{c.field}</RuleToken>
        <span className="text-on-surface-muted">{c.op}</span>
        <RuleToken>{c.val}</RuleToken>
      </>,
    ]),
  );
  (action.steps ?? action.actions ?? []).forEach((s: any, i: number) =>
    lines.push([
      i === 0 ? 'Then' : 'And',
      <>
        <RuleToken>{s.label ?? s.id}</RuleToken>
        {s.arg && <span className="min-w-0 truncate text-on-surface-muted">{s.arg}</span>}
      </>,
    ]),
  );

  return (
    <div className="space-y-1.5">
      {lines.map(([keyword, body], i) => (
        <div key={i} className="flex items-start gap-2.5">
          <span className="w-10 shrink-0 pt-1 text-right text-caption font-semibold text-on-surface-faint">
            {keyword}
          </span>
          <span className="flex min-w-0 flex-wrap items-center gap-1.5 text-body-sm">{body}</span>
        </div>
      ))}
    </div>
  );
}

function RuleToken({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md bg-subtle px-1.5 py-0.5 font-medium text-on-surface">
      {children}
    </span>
  );
}
