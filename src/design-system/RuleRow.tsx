import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { IconButton } from './Button';

/**
 * One line of an automation rule: a leading keyword (When / If / Then), then
 * the parts of the condition. Keeps builders readable as sentences rather
 * than as grids of unlabelled selects.
 */
export function RuleRow({
  keyword,
  children,
  onRemove,
  className,
}: {
  keyword: string;
  children: React.ReactNode;
  onRemove?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2 rounded-md border border-border-default bg-surface px-3 py-2',
        className,
      )}
    >
      <span className="w-10 shrink-0 text-caption font-medium uppercase text-on-surface-subtle">{keyword}</span>
      {children}
      {onRemove && (
        <IconButton label="Remove rule" size="sm" className="ml-auto" onClick={onRemove}>
          <X className="size-4" strokeWidth={1.5} />
        </IconButton>
      )}
    </div>
  );
}

export function RuleValue({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-sm bg-subtle px-1.5 py-0.5 text-body-sm font-medium text-on-surface">
      {children}
    </span>
  );
}
