import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * `solid` is the strongest action — near-black in light, near-white in dark.
 * The accent stays reserved for selection and identity, so a screen can have
 * one unmistakable primary action without the accent competing with it.
 */
export type ButtonVariant = 'solid' | 'primary' | 'secondary' | 'ghost' | 'subtle' | 'danger';
export type ButtonSize = 'xs' | 'sm' | 'md';

const VARIANTS: Record<ButtonVariant, string> = {
  // The two committing actions cast a little light. A flat near-black
  // button on a flat card is the most administrative thing on a screen,
  // and these are the moments the product should feel like it wants to be
  // pressed.
  solid:
    'bg-solid text-on-solid hover:bg-solid-hover border border-transparent shadow-sm hover:shadow-md',
  primary:
    'bg-accent text-on-accent hover:bg-accent-hover active:bg-accent-active border border-transparent shadow-glow',
  secondary:
    'bg-surface text-on-surface border border-border-default hover:bg-hover',
  subtle:
    'bg-subtle text-on-surface border border-transparent hover:bg-hover',
  ghost:
    'bg-transparent text-on-surface-muted border border-transparent hover:bg-hover hover:text-on-surface',
  danger:
    'bg-danger-solid text-white hover:opacity-90 border border-transparent',
};

const SIZES: Record<ButtonSize, string> = {
  xs: 'h-6 px-2 text-caption gap-1 rounded-md',
  sm: 'h-7 px-2.5 text-caption gap-1.5 rounded-md',
  md: 'h-8 px-3 text-body-sm gap-1.5 rounded-lg',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', loading, icon, iconRight, className, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-medium whitespace-nowrap',
        'transition-colors duration-[120ms]',
        'disabled:opacity-40 disabled:pointer-events-none',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 className="size-4 animate-spin" strokeWidth={1.75} /> : icon}
      {children}
      {iconRight}
    </button>
  );
});

const ICON_SIZES: Record<ButtonSize, string> = {
  xs: 'size-6 rounded-md',
  sm: 'size-7 rounded-md',
  md: 'size-8 rounded-lg',
};

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Required: an icon-only control has no text for assistive tech. */
  label: string;
  children: React.ReactNode;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { variant = 'ghost', size = 'md', label, className, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      aria-label={label}
      className={cn(
        'inline-flex items-center justify-center shrink-0',
        'transition-colors duration-[120ms]',
        'disabled:opacity-40 disabled:pointer-events-none',
        VARIANTS[variant],
        ICON_SIZES[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
});
