import React from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { Tone } from './Badge';

const ICONS: Partial<Record<Tone, React.ReactNode>> = {
  success: <CheckCircle2 className="size-4 text-success-solid" strokeWidth={1.5} />,
  warning: <AlertTriangle className="size-4 text-warning-solid" strokeWidth={1.5} />,
  danger: <XCircle className="size-4 text-danger-solid" strokeWidth={1.5} />,
  info: <Info className="size-4 text-info-solid" strokeWidth={1.5} />,
  neutral: <Info className="size-4 text-tertiary" strokeWidth={1.5} />,
};

export interface ToastItem {
  id: string | number;
  message: React.ReactNode;
  tone?: Tone;
}

/**
 * Presentational only — the toast queue lives in the app reducer
 * (ADD_TOAST / DISMISS_TOAST), which also handles the 4s auto-dismiss.
 */
export function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string | number) => void;
}) {
  if (!toasts.length) return null;
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-80 flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={cn(
            'pointer-events-auto flex items-start gap-2 rounded-lg border border-border-default',
            'bg-surface px-3 py-2.5 shadow-lg',
          )}
        >
          <span className="mt-px shrink-0">{ICONS[t.tone ?? 'neutral']}</span>
          <p className="min-w-0 flex-1 text-body-sm text-primary">{t.message}</p>
          <button
            onClick={() => onDismiss(t.id)}
            aria-label="Dismiss"
            className="shrink-0 rounded-sm p-0.5 text-tertiary hover:bg-hover hover:text-primary"
          >
            <X className="size-4" strokeWidth={1.5} />
          </button>
        </div>
      ))}
    </div>
  );
}
