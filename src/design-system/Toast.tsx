import React from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { Tone } from './Badge';

const ICONS: Partial<Record<Tone, React.ReactNode>> = {
  success: <CheckCircle2 className="size-4 text-success-solid" strokeWidth={1.5} />,
  warning: <AlertTriangle className="size-4 text-warning-solid" strokeWidth={1.5} />,
  danger: <XCircle className="size-4 text-danger-solid" strokeWidth={1.5} />,
  info: <Info className="size-4 text-info-solid" strokeWidth={1.5} />,
  neutral: <Info className="size-4 text-on-surface-subtle" strokeWidth={1.5} />,
};

export interface ToastItem {
  id: string | number;
  message: React.ReactNode;
  tone?: Tone;
  /** Label for a reversing action; omit for toasts with nothing to reverse. */
  undoLabel?: string;
}

/**
 * Presentational only — the toast queue lives in the app reducer
 * (ADD_TOAST / DISMISS_TOAST), which also handles the 4s auto-dismiss.
 *
 * Enters and leaves on its own transform/opacity rather than appearing and
 * vanishing — every other overlay in the product (menu, popover, dialog)
 * animates in, and a toast that snaps in place read as broken by contrast.
 */
export function ToastViewport({
  toasts,
  onDismiss,
  onUndo,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string | number) => void;
  onUndo?: (id: string | number) => void;
}) {
  if (!toasts.length) return null;
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-80 flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={cn(
            'pointer-events-auto flex animate-toast-in items-start gap-2 rounded-lg border border-border-default',
            'bg-surface px-3 py-2.5 shadow-lg',
          )}
        >
          <span className="mt-px shrink-0">{ICONS[t.tone ?? 'neutral']}</span>
          <p className="min-w-0 flex-1 text-body-sm text-on-surface">{t.message}</p>
          {t.undoLabel && onUndo && (
            <button
              onClick={() => onUndo(t.id)}
              className="shrink-0 text-body-sm font-medium text-accent hover:text-accent-hover"
            >
              {t.undoLabel}
            </button>
          )}
          <button
            onClick={() => onDismiss(t.id)}
            aria-label="Dismiss"
            className="shrink-0 rounded-sm p-0.5 text-on-surface-subtle hover:bg-hover hover:text-on-surface"
          >
            <X className="size-4" strokeWidth={1.5} />
          </button>
        </div>
      ))}
    </div>
  );
}
