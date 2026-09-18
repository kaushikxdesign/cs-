import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Badge, Button, type Tone } from '@/design-system';
import type { Evidence, NextAction, Overview } from '@/lib/copilot';

const TONE: Record<Evidence['tone'], Tone> = {
  danger: 'danger',
  warning: 'warning',
  success: 'success',
  info: 'info',
  neutral: 'neutral',
};

/**
 * What the assistant leads with when it is opened on a page.
 *
 * Reading order is deliberate: the evidence sits above the prose, because
 * the chips are what let someone decide in two seconds whether the
 * paragraphs are worth reading — and every chip is a number they can go and
 * check on the page behind this panel.
 */
export function AiOverview({
  overview,
  onNavigate,
  onCompose,
}: {
  overview: Overview;
  onNavigate: (path: string) => void;
  onCompose?: (action: NextAction) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <p className="flex items-center gap-1.5 text-caption font-medium text-accent">
          <Sparkles className="size-3.5" strokeWidth={1.75} />
          Overview
        </p>
        <h3 className="mt-1 text-title-sm font-semibold text-on-surface">{overview.title}</h3>
        <p className="text-caption text-on-surface-subtle">{overview.headline}</p>
      </div>

      {overview.evidence.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {overview.evidence.map((e, i) => (
            <Badge key={i} tone={TONE[e.tone]} dot>
              {e.label}
            </Badge>
          ))}
        </div>
      )}

      <div className="space-y-2">
        {overview.paragraphs.map((p, i) => (
          <p key={i} className="text-body-sm leading-relaxed text-on-surface-muted">
            {p}
          </p>
        ))}
      </div>

      {overview.actions.length > 0 && (
        <div>
          <p className="mb-1.5 text-caption font-medium text-on-surface-muted">
            Next best actions
          </p>
          <ul className="space-y-1.5">
            {overview.actions.map((a) => (
              <li key={a.id}>
                <button
                  onClick={() => (a.to ? onNavigate(a.to) : onCompose?.(a))}
                  className={cn(
                    'group flex w-full items-start gap-2.5 rounded-lg border border-border-default px-3 py-2.5 text-left',
                    'transition-colors duration-[120ms] hover:border-accent hover:bg-accent-subtle',
                  )}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-body-sm font-medium text-on-surface">{a.title}</span>
                    {/* The reason, not a restatement of the title. An action
                        you cannot audit is one nobody takes twice. */}
                    <span className="mt-0.5 block text-caption leading-relaxed text-on-surface-subtle">
                      {a.why}
                    </span>
                  </span>
                  <ArrowRight
                    className="mt-0.5 size-4 shrink-0 text-on-surface-faint transition-colors duration-[120ms] group-hover:text-accent"
                    strokeWidth={1.75}
                  />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/** A compact strip of the same actions, for a page rather than the panel. */
export function NextBestActions({
  actions,
  onNavigate,
  onCompose,
  className,
}: {
  actions: NextAction[];
  onNavigate: (path: string) => void;
  onCompose?: (a: NextAction) => void;
  className?: string;
}) {
  if (!actions.length) return null;
  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      <span className="inline-flex items-center gap-1 text-caption font-medium text-accent">
        <Sparkles className="size-3.5" strokeWidth={1.75} />
        Next
      </span>
      {actions.slice(0, 3).map((a) => (
        <Button
          key={a.id}
          size="sm"
          variant="secondary"
          className="border-accent-muted"
          onClick={() => (a.to ? onNavigate(a.to) : onCompose?.(a))}
        >
          {a.title}
        </Button>
      ))}
    </div>
  );
}
