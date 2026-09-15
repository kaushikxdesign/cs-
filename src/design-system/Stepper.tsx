import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface Step {
  id: string;
  label: string;
  description?: string;
}

export function Stepper({
  steps,
  current,
  onStepClick,
  className,
}: {
  steps: Step[];
  /** Index of the active step. Earlier steps render as complete. */
  current: number;
  onStepClick?: (index: number) => void;
  className?: string;
}) {
  return (
    <ol className={cn('flex items-center gap-2', className)}>
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        const clickable = onStepClick && i <= current;
        return (
          <li key={s.id} className="flex flex-1 items-center gap-2">
            <button
              type="button"
              disabled={!clickable}
              onClick={clickable ? () => onStepClick(i) : undefined}
              className={cn('flex items-center gap-2 text-left', clickable && 'cursor-pointer')}
            >
              <span
                className={cn(
                  'flex size-5 shrink-0 items-center justify-center rounded-full border text-caption font-medium tabular-nums',
                  done && 'border-accent bg-accent text-on-accent',
                  active && 'border-accent text-accent-text',
                  !done && !active && 'border-border-strong text-tertiary',
                )}
              >
                {done ? <Check className="size-3" strokeWidth={2} /> : i + 1}
              </span>
              <span
                className={cn(
                  'whitespace-nowrap text-body-sm',
                  active ? 'font-medium text-primary' : 'text-secondary',
                )}
              >
                {s.label}
              </span>
            </button>
            {i < steps.length - 1 && <span className="h-px flex-1 bg-border-default" />}
          </li>
        );
      })}
    </ol>
  );
}

/** Footer action bar for wizards — primary right, secondary left. */
export function StepperFooter({ left, right }: { left?: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-border-default px-4 py-3">
      <div className="flex items-center gap-2">{left}</div>
      <div className="flex items-center gap-2">{right}</div>
    </div>
  );
}
