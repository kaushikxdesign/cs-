import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Avatar, Badge, CountBadge, Meter } from '@/design-system';
import { USERS } from '@/data/core';
import { formatCurrency, formatDate, healthTone, titleCase } from '@/lib/format';

export function PanelSection({
  title,
  count,
  defaultOpen = true,
  children,
}: {
  title: string;
  count?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <section className="border-b border-border-default px-4 py-3 last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 text-left"
      >
        <span className="text-body-sm font-semibold text-on-surface">
          {title}
        </span>
        {count !== undefined && <CountBadge>{count}</CountBadge>}
        <ChevronDown
          className={cn(
            'ml-auto size-4 text-on-surface-subtle transition-transform duration-[180ms]',
            !open && '-rotate-90',
          )}
          strokeWidth={1.75}
        />
      </button>
      {open && <div className="mt-2.5">{children}</div>}
    </section>
  );
}

export function PanelRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <span className="shrink-0 text-body-sm text-on-surface-subtle">{label}</span>
      <span className="min-w-0 truncate text-body-sm text-on-surface">{children}</span>
    </div>
  );
}

/** Right-hand account context, shared by every Customer 360 tab. */
export function AccountPanel({
  customer,
  health,
  riskCount,
  goalCount,
  contactCount,
}: {
  customer: any;
  health?: any;
  riskCount: number;
  goalCount: number;
  contactCount: number;
}) {
  const owner = USERS[customer.ownerId];
  return (
    <aside className="flex w-[19rem] shrink-0 flex-col overflow-y-auto border-l border-border-default bg-panel">
      <PanelSection title="Account">
        <div className="space-y-1">
          <PanelRow label="Segment">{titleCase(customer.segment)}</PanelRow>
          <PanelRow label="ARR">{formatCurrency(customer.arr)}</PanelRow>
          <PanelRow label="Renewal">{formatDate(customer.renewalDate)}</PanelRow>
          <PanelRow label="Domain">{customer.domain ?? '—'}</PanelRow>
          <PanelRow label="Owner">
            {owner ? (
              <span className="inline-flex items-center gap-1.5">
                <Avatar name={owner.name} size="xs" />
                {owner.name}
              </span>
            ) : (
              '—'
            )}
          </PanelRow>
        </div>
      </PanelSection>

      {health && (
        <PanelSection title="Health breakdown">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2 pb-0.5">
              <Badge tone={healthTone(health.band)} dot>
                {health.band === 'yellow' ? 'Watch' : health.band === 'red' ? 'At risk' : 'Healthy'}
              </Badge>
              <span className="text-body-sm tabular-nums text-on-surface">
                {health.compositeScore}
                {typeof health.previousScore === 'number' && (
                  <span className="ml-1.5 text-caption text-on-surface-subtle">
                    from {health.previousScore}
                  </span>
                )}
              </span>
            </div>
            {(health.dimensions ?? []).map((d: any) => (
              <Meter key={d.key} label={d.label} value={d.effectiveScore} />
            ))}
          </div>
        </PanelSection>
      )}

      <PanelSection title="Related">
        <div className="space-y-1">
          <PanelRow label="Open risks">{riskCount}</PanelRow>
          <PanelRow label="Goals">{goalCount}</PanelRow>
          <PanelRow label="Contacts">{contactCount}</PanelRow>
          <PanelRow label="Products">{(customer.products ?? []).length}</PanelRow>
        </div>
      </PanelSection>
    </aside>
  );
}
