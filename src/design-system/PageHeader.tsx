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
  hero,
  className,
}: {
  breadcrumbs?: Crumb[];
  title: React.ReactNode;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  tabs?: React.ReactNode;
  /** Decorative brand wash, for headers with nothing else to carry. */
  hero?: boolean;
  className?: string;
}) {
  return (
    <header
      className={cn(
        'relative border-b border-border-default bg-surface px-6 pt-4',
        hero && 'overflow-hidden',
        className,
      )}
    >
      {/* A wash, not a banner. It belongs only on a header that carries no
          data of its own — the morning greeting — and it has to sit under
          the type rather than tint it. */}
      {hero && (
        <span
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-28 size-64 rounded-full opacity-20 blur-3xl"
          style={{ backgroundImage: 'var(--gradient-brand)' }}
        />
      )}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-1 flex items-center gap-1 text-caption text-on-surface-subtle">
          {breadcrumbs.map((c, i) => (
            <React.Fragment key={i}>
              {i > 0 && <ChevronRight className="size-3" strokeWidth={1.5} />}
              {c.onClick ? (
                <button onClick={c.onClick} className="hover:text-on-surface">
                  {c.label}
                </button>
              ) : (
                <span>{c.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}
      {/* Centered, not top-aligned. The actions are a single row of controls
          on every screen that has them, so aligning them to the cap height of
          the title left more space under the button than over it. */}
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-title font-semibold text-on-surface truncate">{title}</h1>
          {meta && <div className="mt-1 flex flex-wrap items-center gap-2 text-caption text-on-surface-subtle">{meta}</div>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      <div className={cn(tabs ? 'mt-3' : 'pb-4')}>{tabs}</div>
    </header>
  );
}
