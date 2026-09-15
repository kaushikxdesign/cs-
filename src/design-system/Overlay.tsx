import React from 'react';
import * as RDialog from '@radix-ui/react-dialog';
import * as RDropdown from '@radix-ui/react-dropdown-menu';
import * as RPopover from '@radix-ui/react-popover';
import * as RTooltip from '@radix-ui/react-tooltip';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { IconButton } from './Button';

const OVERLAY = 'fixed inset-0 z-40 bg-inverse/20';
const PANEL = 'z-50 border border-border-default bg-surface shadow-lg';

/** Blocking confirmation or a short focused form. Anything record-shaped belongs in a Drawer. */
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  return (
    <RDialog.Root open={open} onOpenChange={onOpenChange}>
      <RDialog.Portal>
        <RDialog.Overlay className={OVERLAY} />
        <RDialog.Content
          className={cn(
            PANEL,
            'fixed left-1/2 top-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl',
            className,
          )}
        >
          <div className="flex items-start justify-between gap-4 px-5 pt-4">
            <div className="min-w-0">
              <RDialog.Title className="text-title-sm font-semibold text-primary">{title}</RDialog.Title>
              {description && (
                <RDialog.Description className="mt-1 text-body-sm text-tertiary">
                  {description}
                </RDialog.Description>
              )}
            </div>
            <RDialog.Close asChild>
              <IconButton label="Close">
                <X className="size-4" strokeWidth={1.5} />
              </IconButton>
            </RDialog.Close>
          </div>
          {children && <div className="px-5 py-4">{children}</div>}
          {footer && (
            <div className="flex items-center justify-end gap-2 border-t border-border-default px-5 py-3">
              {footer}
            </div>
          )}
        </RDialog.Content>
      </RDialog.Portal>
    </RDialog.Root>
  );
}

/** Right-hand sheet for record detail — the default for "open this thing". */
export function Drawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  width = 'md',
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  width?: 'md' | 'lg';
}) {
  return (
    <RDialog.Root open={open} onOpenChange={onOpenChange}>
      <RDialog.Portal>
        <RDialog.Overlay className={OVERLAY} />
        <RDialog.Content
          className={cn(
            PANEL,
            'fixed right-0 top-0 flex h-full flex-col rounded-l-xl border-y-0 border-r-0',
            width === 'lg' ? 'w-112' : 'w-96',
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-border-default px-4 py-3">
            <div className="min-w-0">
              <RDialog.Title className="text-title-sm font-semibold text-primary truncate">
                {title}
              </RDialog.Title>
              {description && (
                <RDialog.Description className="mt-0.5 text-caption text-tertiary">
                  {description}
                </RDialog.Description>
              )}
            </div>
            <RDialog.Close asChild>
              <IconButton label="Close">
                <X className="size-4" strokeWidth={1.5} />
              </IconButton>
            </RDialog.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">{children}</div>
          {footer && (
            <div className="flex items-center justify-end gap-2 border-t border-border-default px-4 py-3">
              {footer}
            </div>
          )}
        </RDialog.Content>
      </RDialog.Portal>
    </RDialog.Root>
  );
}

export function Tooltip({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <RTooltip.Provider delayDuration={300}>
      <RTooltip.Root>
        <RTooltip.Trigger asChild>{children}</RTooltip.Trigger>
        <RTooltip.Portal>
          <RTooltip.Content
            sideOffset={6}
            className="z-50 rounded-md bg-inverse px-2 py-1 text-caption text-inverse shadow-sm"
          >
            {label}
          </RTooltip.Content>
        </RTooltip.Portal>
      </RTooltip.Root>
    </RTooltip.Provider>
  );
}

export function Popover({
  trigger,
  children,
  align = 'start',
  className,
}: {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'start' | 'center' | 'end';
  className?: string;
}) {
  return (
    <RPopover.Root>
      <RPopover.Trigger asChild>{trigger}</RPopover.Trigger>
      <RPopover.Portal>
        <RPopover.Content
          align={align}
          sideOffset={4}
          className={cn(PANEL, 'min-w-48 rounded-lg p-3', className)}
        >
          {children}
        </RPopover.Content>
      </RPopover.Portal>
    </RPopover.Root>
  );
}

export interface MenuItem {
  label: React.ReactNode;
  icon?: React.ReactNode;
  onSelect?: () => void;
  danger?: boolean;
  separatorBefore?: boolean;
}

export function DropdownMenu({
  trigger,
  items,
  align = 'end',
}: {
  trigger: React.ReactNode;
  items: MenuItem[];
  align?: 'start' | 'center' | 'end';
}) {
  return (
    <RDropdown.Root>
      <RDropdown.Trigger asChild>{trigger}</RDropdown.Trigger>
      <RDropdown.Portal>
        <RDropdown.Content
          align={align}
          sideOffset={4}
          className={cn(PANEL, 'min-w-44 rounded-lg p-1')}
        >
          {items.map((item, i) => (
            <React.Fragment key={i}>
              {item.separatorBefore && <RDropdown.Separator className="my-1 h-px bg-border-default" />}
              <RDropdown.Item
                onSelect={item.onSelect}
                className={cn(
                  'flex h-8 cursor-default select-none items-center gap-2 rounded-md px-2 text-body-sm outline-none',
                  'data-[highlighted]:bg-hover',
                  item.danger ? 'text-danger-text' : 'text-primary',
                )}
              >
                {item.icon}
                {item.label}
              </RDropdown.Item>
            </React.Fragment>
          ))}
        </RDropdown.Content>
      </RDropdown.Portal>
    </RDropdown.Root>
  );
}
