import React from 'react';
import { cn } from '@/lib/cn';
import { StatusDot, type Tone } from './Badge';

export interface TimelineItem {
  id: string;
  title: React.ReactNode;
  meta?: React.ReactNode;
  body?: React.ReactNode;
  tone?: Tone;
}

export function Timeline({ items, className }: { items: TimelineItem[]; className?: string }) {
  return (
    <ol className={cn('relative space-y-4', className)}>
      {items.map((item, i) => (
        <li key={item.id} className="relative flex gap-3">
          <div className="flex flex-col items-center">
            <StatusDot tone={item.tone ?? 'neutral'} className="mt-1.5" />
            {i < items.length - 1 && <span className="mt-1 w-px flex-1 bg-border-default" />}
          </div>
          <div className="min-w-0 flex-1 pb-1">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-body-sm font-medium text-primary">{item.title}</p>
              {item.meta && <span className="shrink-0 text-caption text-tertiary">{item.meta}</span>}
            </div>
            {item.body && <div className="mt-1 text-body-sm text-secondary">{item.body}</div>}
          </div>
        </li>
      ))}
    </ol>
  );
}
