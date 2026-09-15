import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface Crumb {
  label: string;
  onClick?: () => void;
}

/** The single page-title pattern. Every screen uses this, so they all line up. */
export function PageHeader({
  breadcrumbs,
  title,
  meta,
  actions,
  tabs,
  className,
}: {
  breadcrumbs?: Crumb[];
  title: React.ReactNode;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  tabs?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn('border-b border-border-default bg-surface px-6 pt-4', className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-1 flex items-center gap-1 text-caption text-tertiary">
          {breadcrumbs.map((c, i) => (
            <React.Fragment key={i}>
              {i > 0 && <ChevronRight className="size-3" strokeWidth={1.5} />}
              {c.onClick ? (
                <button onClick={c.onClick} className="hover:text-primary">
                  {c.label}
                </button>
              ) : (
                <span>{c.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-title font-semibold text-primary truncate">{title}</h1>
          {meta && <div className="mt-1 flex flex-wrap items-center gap-2 text-caption text-tertiary">{meta}</div>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      <div className={cn(tabs ? 'mt-3' : 'pb-4')}>{tabs}</div>
    </header>
  );
}
