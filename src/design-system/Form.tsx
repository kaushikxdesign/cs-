import React from 'react';
import * as RCheckbox from '@radix-ui/react-checkbox';
import * as RSwitch from '@radix-ui/react-switch';
import * as RRadio from '@radix-ui/react-radio-group';
import * as RSelect from '@radix-ui/react-select';
import { Check, ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/cn';

const FIELD =
  'h-8 w-full rounded-md border border-border-default bg-surface px-2.5 text-body-sm text-on-surface ' +
  'transition-colors duration-[120ms] placeholder:text-on-surface-faint ' +
  'hover:border-border-strong disabled:opacity-50 disabled:pointer-events-none';

export function Label({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn('block text-caption font-medium text-on-surface-muted', className)} {...props}>
      {children}
    </label>
  );
}

export function Field({
  label,
  hint,
  error,
  children,
  className,
}: {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && <Label>{label}</Label>}
      {children}
      {error ? (
        <p className="text-caption text-danger-fg">{error}</p>
      ) : (
        hint && <p className="text-caption text-on-surface-subtle">{hint}</p>
      )}
    </div>
  );
}

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(FIELD, className)} {...props} />;
  },
);

export function SearchInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-on-surface-subtle"
        strokeWidth={1.5}
      />
      <input type="search" className={cn(FIELD, 'pl-8', className)} {...props} />
    </div>
  );
}

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(FIELD, 'h-auto min-h-16 py-2 leading-relaxed resize-y', className)}
      {...props}
    />
  );
});

export interface SelectOption {
  value: string;
  label: string;
}

export function Select({
  value,
  onValueChange,
  options,
  placeholder = 'Select…',
  className,
  disabled,
}: {
  value?: string;
  onValueChange?: (v: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <RSelect.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <RSelect.Trigger
        className={cn(FIELD, 'inline-flex items-center justify-between gap-2 text-left', className)}
      >
        <RSelect.Value placeholder={placeholder} />
        <RSelect.Icon>
          <ChevronDown className="size-4 text-on-surface-subtle" strokeWidth={1.5} />
        </RSelect.Icon>
      </RSelect.Trigger>
      <RSelect.Portal>
        <RSelect.Content
          position="popper"
          sideOffset={4}
          className="z-50 min-w-32 overflow-hidden rounded-lg border border-border-default bg-surface shadow-sm"
        >
          <RSelect.Viewport className="p-1">
            {options.map((o) => (
              <RSelect.Item
                key={o.value}
                value={o.value}
                className="relative flex h-8 cursor-default select-none items-center rounded-md pl-7 pr-2 text-body-sm text-on-surface outline-none data-[highlighted]:bg-hover"
              >
                <RSelect.ItemIndicator className="absolute left-2 inline-flex">
                  <Check className="size-4 text-accent" strokeWidth={1.5} />
                </RSelect.ItemIndicator>
                <RSelect.ItemText>{o.label}</RSelect.ItemText>
              </RSelect.Item>
            ))}
          </RSelect.Viewport>
        </RSelect.Content>
      </RSelect.Portal>
    </RSelect.Root>
  );
}

export function Checkbox({
  checked,
  onCheckedChange,
  label,
  disabled,
  className,
}: {
  checked?: boolean;
  onCheckedChange?: (c: boolean) => void;
  label?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  const box = (
    <RCheckbox.Root
      checked={checked}
      onCheckedChange={(c) => onCheckedChange?.(c === true)}
      disabled={disabled}
      className={cn(
        'flex size-4 shrink-0 items-center justify-center rounded-sm border border-border-strong bg-surface',
        'transition-colors duration-[120ms]',
        'data-[state=checked]:border-accent data-[state=checked]:bg-accent',
        'disabled:opacity-50',
        className,
      )}
    >
      <RCheckbox.Indicator>
        <Check className="size-3 text-on-accent" strokeWidth={2} />
      </RCheckbox.Indicator>
    </RCheckbox.Root>
  );
  if (!label) return box;
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-body-sm text-on-surface">
      {box}
      {label}
    </label>
  );
}

export function Switch({
  checked,
  onCheckedChange,
  label,
  disabled,
}: {
  checked?: boolean;
  onCheckedChange?: (c: boolean) => void;
  label?: React.ReactNode;
  disabled?: boolean;
}) {
  const sw = (
    <RSwitch.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      className={cn(
        'relative h-4.5 w-8 shrink-0 rounded-full border border-transparent bg-border-strong',
        'transition-colors duration-[120ms] data-[state=checked]:bg-accent disabled:opacity-50',
      )}
    >
      <RSwitch.Thumb className="block size-3.5 translate-x-0.5 rounded-full bg-surface transition-transform duration-[120ms] data-[state=checked]:translate-x-4" />
    </RSwitch.Root>
  );
  if (!label) return sw;
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-body-sm text-on-surface">
      {sw}
      {label}
    </label>
  );
}

export function RadioGroup({
  value,
  onValueChange,
  options,
  className,
}: {
  value?: string;
  onValueChange?: (v: string) => void;
  options: Array<{ value: string; label: React.ReactNode }>;
  className?: string;
}) {
  return (
    <RRadio.Root value={value} onValueChange={onValueChange} className={cn('space-y-2', className)}>
      {options.map((o) => (
        <label key={o.value} className="flex cursor-pointer items-center gap-2 text-body-sm text-on-surface">
          <RRadio.Item
            value={o.value}
            className="flex size-4 items-center justify-center rounded-full border border-border-strong bg-surface data-[state=checked]:border-accent"
          >
            <RRadio.Indicator className="size-2 rounded-full bg-accent" />
          </RRadio.Item>
          {o.label}
        </label>
      ))}
    </RRadio.Root>
  );
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: React.ReactNode }>;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn('inline-flex items-center gap-0.5 rounded-md border border-border-default bg-subtle p-0.5', className)}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'h-7 rounded-md px-2.5 text-caption font-medium transition-colors duration-[120ms]',
              active ? 'bg-surface text-on-surface shadow-sm' : 'text-on-surface-muted hover:text-on-surface',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
