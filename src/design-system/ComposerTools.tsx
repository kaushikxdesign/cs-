import React from 'react';
import { Sparkles, Undo2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from './Button';
import { Tooltip } from './Overlay';
import { COMPOSER_TOOLS, type ComposerContext } from '@/lib/composer';

/**
 * Rewrite actions on a draft.
 *
 * Every one is reversible in a single click and says which it was, because
 * a tool that silently rewrites someone's words and cannot be undone is a
 * tool they stop trusting after the first surprise.
 */
export function ComposerTools({
  draft,
  onChange,
  context,
  disabled,
  className,
}: {
  draft: string;
  onChange: (next: string) => void;
  context: ComposerContext;
  disabled?: boolean;
  className?: string;
}) {
  const [undo, setUndo] = React.useState<{ label: string; before: string } | null>(null);
  const empty = !draft.trim();

  return (
    <div className={cn('flex flex-wrap items-center gap-1', className)}>
      <span className="mr-0.5 inline-flex items-center gap-1 text-caption font-medium text-accent">
        <Sparkles className="size-3.5" strokeWidth={1.75} />
        Rewrite
      </span>

      {COMPOSER_TOOLS.map((t) => (
        <Tooltip key={t.id} label={t.hint} side="top">
          <Button
            size="sm"
            variant="ghost"
            disabled={disabled || empty}
            onClick={() => {
              setUndo({ label: t.label, before: draft });
              onChange(t.apply(draft, context));
            }}
          >
            {t.label}
          </Button>
        </Tooltip>
      ))}

      {undo && (
        <Button
          size="sm"
          variant="ghost"
          className="ml-auto text-on-surface-subtle"
          icon={<Undo2 className="size-3.5" strokeWidth={1.75} />}
          onClick={() => {
            onChange(undo.before);
            setUndo(null);
          }}
        >
          Undo {undo.label.toLowerCase()}
        </Button>
      )}
    </div>
  );
}

/**
 * One-tap openers. Three at most, each carrying the reason it was offered —
 * a suggestion you cannot interrogate is one you either accept blindly or
 * ignore entirely.
 */
export function SuggestedReplies({
  suggestions,
  context,
  onPick,
  className,
}: {
  suggestions: Array<{ id: string; label: string; why: string; build: (c: ComposerContext) => string }>;
  context: ComposerContext;
  onPick: (body: string) => void;
  className?: string;
}) {
  if (!suggestions.length) return null;
  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      <span className="mr-0.5 text-caption font-medium text-on-surface-muted">Suggested</span>
      {suggestions.map((s) => (
        <Tooltip key={s.id} label={s.why} side="top">
          <button
            onClick={() => onPick(s.build(context))}
            className={cn(
              'rounded-full border border-accent-muted bg-accent-subtle px-2.5 py-1',
              'text-caption font-medium text-accent-on-subtle',
              'transition-colors duration-[120ms] hover:border-accent hover:bg-accent-subtle',
            )}
          >
            {s.label}
          </button>
        </Tooltip>
      ))}
    </div>
  );
}
