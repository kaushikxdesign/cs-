import React from 'react';
import * as RDialog from '@radix-ui/react-dialog';
import * as RDropdown from '@radix-ui/react-dropdown-menu';
import * as RPopover from '@radix-ui/react-popover';
import * as RTooltip from '@radix-ui/react-tooltip';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { IconButton } from './Button';

const OVERLAY = 'fixed inset-0 z-40 bg-scrim';
const PANEL = 'z-50 border border-border-default bg-surface shadow-lg';

// See globals.css for why Popper-positioned content (Popover, dropdown
// menu, Tooltip) only ever gets ANIM_FADE, never a transform.
const ANIM_FADE = 'data-[state=open]:animate-[fade-in_120ms_ease-out] data-[state=closed]:animate-[fade-out_100ms_ease-in]';
const ANIM_DIALOG = 'data-[state=open]:animate-[dialog-in_150ms_ease-out] data-[state=closed]:animate-[dialog-out_100ms_ease-in]';
const ANIM_DRAWER = 'data-[state=open]:animate-[drawer-in_200ms_ease-out] data-[state=closed]:animate-[drawer-out_150ms_ease-in]';

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
        <RDialog.Overlay className={cn(OVERLAY, ANIM_FADE)} />
        <RDialog.Content
          className={cn(
            PANEL,
            ANIM_DIALOG,
            'fixed left-1/2 top-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl',
            className,
          )}
        >
          <div className="flex items-start justify-between gap-4 px-5 pt-4">
            <div className="min-w-0">
              <RDialog.Title className="text-title-sm font-semibold text-on-surface">{title}</RDialog.Title>
              {description && (
                <RDialog.Description className="mt-1 text-body-sm text-on-surface-subtle">
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
        <RDialog.Overlay className={cn(OVERLAY, ANIM_FADE)} />
        <RDialog.Content
          className={cn(
            PANEL,
            ANIM_DRAWER,
            'fixed right-0 top-0 flex h-full flex-col rounded-l-xl border-y-0 border-r-0',
            width === 'lg' ? 'w-112' : 'w-96',
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-border-default px-4 py-3">
            <div className="min-w-0">
              <RDialog.Title className="text-title-sm font-semibold text-on-surface truncate">
                {title}
              </RDialog.Title>
              {description && (
                <RDialog.Description className="mt-0.5 text-caption text-on-surface-subtle">
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

export function Tooltip({
  label,
  children,
  side = 'right',
}: {
  label: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
}) {
  return (
    <RTooltip.Root>
      <RTooltip.Trigger asChild>{children}</RTooltip.Trigger>
      <RTooltip.Portal>
        <RTooltip.Content
          side={side}
          sideOffset={8}
          className={cn(
            'z-50 rounded-md bg-inverted px-2 py-1 shadow-md',
            'text-caption font-medium text-on-inverse',
            'select-none',
            ANIM_FADE,
          )}
        >
          {label}
          <RTooltip.Arrow className="fill-[var(--inverted)]" width={10} height={5} />
        </RTooltip.Content>
      </RTooltip.Portal>
    </RTooltip.Root>
  );
}

/**
 * One provider at the app root. Radix needs an ancestor provider; mounting
 * one per tooltip also meant every tooltip ran its own delay timer, so the
 * usual "hover one, the rest open instantly" grouping never worked.
 */
export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return (
    <RTooltip.Provider delayDuration={400} skipDelayDuration={300}>
      {children}
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
          className={cn(PANEL, ANIM_FADE, "min-w-48 overflow-hidden rounded-xl", className)}
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
  /** Right-aligned mark for the item that is already in effect. */
  trailing?: React.ReactNode;
  onSelect?: () => void;
  danger?: boolean;
  separatorBefore?: boolean;
}

export function DropdownMenu({
  trigger,
  items,
  align = 'end',
  side,
}: {
  trigger: React.ReactNode;
  items: MenuItem[];
  align?: 'start' | 'center' | 'end';
  /** Menus opened from the rail have no room below; they open beside it. */
  side?: 'top' | 'right' | 'bottom' | 'left';
}) {
  return (
    <RDropdown.Root>
      <RDropdown.Trigger asChild>{trigger}</RDropdown.Trigger>
      <RDropdown.Portal>
        <RDropdown.Content
          align={align}
          side={side}
          sideOffset={4}
          className={cn(PANEL, ANIM_FADE, 'min-w-44 rounded-lg p-1')}
        >
          {items.map((item, i) => (
            <React.Fragment key={i}>
              {item.separatorBefore && <RDropdown.Separator className="my-1 h-px bg-border-default" />}
              <RDropdown.Item
                onSelect={item.onSelect}
                className={cn(
                  /* min-h rather than h: an item carrying a second line (the person
   behind a role, say) has to be allowed to grow, or the two lines
   overflow the box and land on the row below. */
                  'flex min-h-8 cursor-default select-none items-center gap-2 rounded-md px-2 py-1 text-body-sm outline-none',
                  'data-[highlighted]:bg-hover',
                  item.danger ? 'text-danger-fg' : 'text-on-surface',
                )}
              >
                {item.icon}
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {item.trailing}
              </RDropdown.Item>
            </React.Fragment>
          ))}
        </RDropdown.Content>
      </RDropdown.Portal>
    </RDropdown.Root>
  );
}
