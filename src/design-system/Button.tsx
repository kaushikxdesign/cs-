import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md';

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-on-accent hover:bg-accent-hover active:bg-accent-active border border-transparent',
  secondary:
    'bg-surface text-primary border border-border-default hover:bg-hover active:bg-selected',
  ghost:
    'bg-transparent text-secondary border border-transparent hover:bg-hover hover:text-primary',
  danger:
    'bg-danger-solid text-on-accent hover:opacity-90 active:opacity-100 border border-transparent',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-7 px-2.5 text-caption gap-1.5',
  md: 'h-8 px-3 text-body-sm gap-2',
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
        'inline-flex items-center justify-center rounded-md font-medium whitespace-nowrap',
        'transition-colors duration-[120ms]',
        'disabled:opacity-50 disabled:pointer-events-none',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 className="size-4 animate-spin" strokeWidth={1.5} /> : icon}
      {children}
      {iconRight}
    </button>
  );
});

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Required: icon-only controls carry no text for assistive tech. */
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
      title={label}
      className={cn(
        'inline-flex items-center justify-center rounded-md shrink-0',
        'transition-colors duration-[120ms]',
        'disabled:opacity-50 disabled:pointer-events-none',
        VARIANTS[variant],
        size === 'sm' ? 'size-7' : 'size-8',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
});
