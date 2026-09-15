import React from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/cn';

/** Cards carry a hairline border and no shadow — elevation is for overlays only. */
export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-lg border border-border-default bg-surface', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  actions,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-start justify-between gap-4 px-4 py-3', className)}>
      <div className="min-w-0">
        <h3 className="text-title-sm font-semibold text-on-surface truncate">{title}</h3>
        {description && <p className="mt-0.5 text-caption text-on-surface-subtle">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

export function CardBody({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('px-4 py-3', className)} {...props}>
      {children}
    </div>
  );
}

export interface MetricCardProps {
  label: string;
  value: React.ReactNode;
  /** Signed percentage; sign decides both arrow and tone. */
  delta?: number;
  /** When higher numbers are worse (churn, tickets), invert the tone. */
  invertDelta?: boolean;
  hint?: string;
  className?: string;
}

export function MetricCard({ label, value, delta, invertDelta, hint, className }: MetricCardProps) {
  const good = delta === undefined ? null : invertDelta ? delta < 0 : delta > 0;
  return (
    <Card className={cn('px-4 py-3', className)}>
      <p className="text-caption text-on-surface-subtle">{label}</p>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-display font-semibold text-on-surface tabular-nums">{value}</span>
        {delta !== undefined && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 text-caption font-medium tabular-nums',
              good ? 'text-success-fg' : 'text-danger-fg',
            )}
          >
            {delta > 0 ? (
              <ArrowUp className="size-3" strokeWidth={1.5} />
            ) : (
              <ArrowDown className="size-3" strokeWidth={1.5} />
            )}
            {Math.abs(delta)}%
          </span>
        )}
      </div>
      {hint && <p className="mt-1 text-caption text-on-surface-subtle">{hint}</p>}
    </Card>
  );
}

export function ChartCard({
  title,
  description,
  actions,
  children,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader title={title} description={description} actions={actions} />
      <div className="border-t border-border-default px-2 py-3">{children}</div>
    </Card>
  );
}

export function KeyValueList({
  items,
  className,
}: {
  items: Array<{ label: React.ReactNode; value: React.ReactNode }>;
  className?: string;
}) {
  return (
    <dl className={cn('divide-y divide-border-default', className)}>
      {items.map((item, i) => (
        <div key={i} className="flex items-start justify-between gap-4 py-2">
          <dt className="text-body-sm text-on-surface-subtle shrink-0">{item.label}</dt>
          <dd className="text-body-sm text-on-surface text-right min-w-0">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
