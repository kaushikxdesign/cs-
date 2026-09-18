import React from 'react';
import { AlertTriangle, Plug, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Badge, Button, EmptyState, PageHeader, Tooltip } from '@/design-system';
import { CONNECTORS } from '@/data/core';
import { titleCase } from '@/lib/format';

interface Connector {
  id: string; name: string; icon: string; status: string; lastSync: string;
  freshness: string; recordsSynced: number; errorCount: number; authOwner: string; issue?: string;
}

const STATUS_TONE: Record<string, 'success' | 'danger' | 'warning' | 'neutral'> = {
  connected: 'success',
  disconnected: 'danger',
  error: 'danger',
  degraded: 'warning',
};

export function ConnectorsPage() {
  const rows = CONNECTORS as Connector[];
  const connected = rows.filter((c) => c.status === 'connected').length;
  const withErrors = rows.filter((c) => (c.errorCount ?? 0) > 0);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader
        contained
        breadcrumbs={[{ label: 'Settings' }, { label: 'Connectors' }]}
        title="Connectors"
        meta={
          <>
            <span>
              {connected} of {rows.length} connected
            </span>
            {withErrors.length > 0 && (
              <>
                <span aria-hidden>·</span>
                <span className="font-medium text-danger-fg">
                  {withErrors.length} with errors
                </span>
              </>
            )}
          </>
        }
      />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-6 py-5">
          {rows.length === 0 ? (
            <EmptyState
              icon={<Plug className="size-6" strokeWidth={1.5} />}
              title="No connectors"
              description="Connect a CRM or ticketing system to start syncing account data."
            />
          ) : (
            <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {rows.map((c) => (
                <li
                  key={c.id}
                  className="rounded-xl border border-border-default bg-surface px-4 py-3.5"
                >
                  <div className="flex items-start gap-3">
                    {/* The data ships a two-letter mark, not an emoji. */}
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-subtle text-caption font-semibold text-on-surface-muted">
                      {c.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="min-w-0 truncate text-body-sm font-semibold text-on-surface">
                          {c.name}
                        </p>
                        <Badge tone={STATUS_TONE[c.status] ?? 'neutral'} dot>
                          {c.status}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-caption text-on-surface-subtle">
                        Synced {c.lastSync} · {c.recordsSynced.toLocaleString()} records
                      </p>
                    </div>
                    <Tooltip label="Sync now" side="top">
                      <Button size="sm" variant="secondary" icon={<RefreshCw className="size-4" strokeWidth={1.75} />}>
                        Sync
                      </Button>
                    </Tooltip>
                  </div>

                  <div className="mt-3 flex items-center gap-4 border-t border-border-default pt-2.5">
                    <span className="text-caption text-on-surface-subtle">
                      Freshness{' '}
                      <span className="text-on-surface-muted">{titleCase(c.freshness)}</span>
                    </span>
                    <span className="text-caption text-on-surface-subtle">
                      Auth <span className="text-on-surface-muted">{c.authOwner}</span>
                    </span>
                    {c.errorCount > 0 && (
                      <span
                        className={cn(
                          'ml-auto inline-flex items-center gap-1 text-caption font-medium text-danger-fg',
                        )}
                      >
                        <AlertTriangle className="size-3.5" strokeWidth={1.75} />
                        {c.errorCount} {c.errorCount === 1 ? 'error' : 'errors'}
                      </span>
                    )}
                  </div>

                  {c.issue && (
                    <p className="mt-2 rounded-lg bg-danger-subtle px-2.5 py-1.5 text-caption text-danger-fg">
                      {c.issue}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
