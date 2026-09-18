import React from 'react';
import { cn } from '@/lib/cn';
import { Button } from './Button';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-subtle', className)} />;
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="divide-y divide-border-default">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex h-10 items-center gap-4 px-3">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className={cn('h-3', c === 0 ? 'w-40' : 'w-20')} />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * No decorative illustration and no emoji — an icon, a sentence saying what
 * would be here, and the action that creates the first one.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  compact,
  className,
}: {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: { label: string; onClick: () => void };
  /** Inside a card or a panel section, where a full-page empty state would
      make the empty case the tallest thing on the screen. */
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        compact ? 'px-4 py-7' : 'px-6 py-12',
        className,
      )}
    >
      {icon && <div className={cn('text-on-surface-faint', compact ? 'mb-2' : 'mb-3')}>{icon}</div>}
      <p
        className={cn(
          'font-medium text-on-surface',
          compact ? 'text-body-sm' : 'text-title-sm font-semibold',
        )}
      >
        {title}
      </p>
      {description && (
        <p
          className={cn(
            'mt-1 max-w-sm text-on-surface-subtle',
            compact ? 'text-caption' : 'text-body-sm',
          )}
        >
          {description}
        </p>
      )}
      {action && (
        <Button variant="secondary" size="sm" className={compact ? 'mt-3' : 'mt-4'} onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  description,
  onRetry,
}: {
  title?: string;
  description?: React.ReactNode;
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      title={title}
      description={description}
      action={onRetry ? { label: 'Try again', onClick: onRetry } : undefined}
    />
  );
}
