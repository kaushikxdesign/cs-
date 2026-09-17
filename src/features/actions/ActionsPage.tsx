import React from 'react';
import {
  Bell, CheckSquare, Flag, Mail, MessageSquare, Slack, UserPlus, Users, Webhook, Zap,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { useApp } from '@/state/AppContext';
import {
  Avatar, Badge, Drawer, EmptyState, KeyValueList, PageHeader, RuleRow, RuleValue, SearchInput,
  Switch, Tooltip,
} from '@/design-system';
import { USERS } from '@/data/core';
import { titleCase } from '@/lib/format';

/**
 * Step icons. The seed data carries emoji on every step; mapping by id means
 * none of them reach the interface.
 */
const STEP_ICON: Record<string, LucideIcon> = {
  n_task: CheckSquare,
  n_slack: Slack,
  n_teams: MessageSquare,
  n_email: Mail,
  n_manager: Bell,
  n_webhook: Webhook,
  p_email: Mail,
  p_engage: Users,
  p_flag: Flag,
  p_role: UserPlus,
};

interface ActionRule {
  id: string;
  name: string;
  ownerId?: string;
  pillar?: string;
  enabled?: boolean;
  runs?: number;
  lastRun?: string;
  createdAt?: string;
  scope?: string;
  logic?: string;
  event?: { field?: string; mode?: string; to?: string };
  conditions?: Array<{ field?: string; op?: string; val?: string }>;
  steps?: Array<{ key?: string; id?: string; label?: string; arg?: string }>;
}

function humanField(v?: string) {
  return titleCase(v).toLowerCase();
}

const stepLabel = (n: number) => `${n} step${n === 1 ? '' : 's'}`;

function runLabel(runs?: number) {
  if (!runs) return 'Never run';
  return `${runs} run${runs === 1 ? '' : 's'}`;
}

export function ActionsPage() {
  const { state, dispatch } = useApp();
  const [search, setSearch] = React.useState('');
  const [openId, setOpenId] = React.useState<string | null>(null);

  const actions = React.useMemo(() => (state.actions ?? []) as ActionRule[], [state.actions]);

  const rows = React.useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return actions;
    return actions.filter((a) => a.name.toLowerCase().includes(needle));
  }, [actions, search]);

  const open = actions.find((a) => a.id === openId) ?? null;
  const enabledCount = actions.filter((a) => a.enabled).length;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader
        title="Actions"
        meta={
          <>
            <span>{actions.length} in the library</span>
            <span aria-hidden>·</span>
            <span>{enabledCount} enabled</span>
          </>
        }
      />

      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        <div className="mx-auto max-w-4xl">
          <div className="mb-3 w-64">
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search actions…"
            />
          </div>

          {rows.length === 0 ? (
            <EmptyState
              icon={<Zap className="size-6" strokeWidth={1.5} />}
              title="No actions"
              description="Nothing matches this search."
            />
          ) : (
            <ul className="space-y-2">
              {rows.map((a) => {
                const owner = a.ownerId ? USERS[a.ownerId] : undefined;
                return (
                  <li key={a.id}>
                    <div
                      className={cn(
                        'flex items-center gap-3 rounded-xl border border-border-default bg-surface px-4 py-3',
                        'transition-colors duration-[120ms] hover:bg-hover',
                      )}
                    >
                      <button
                        onClick={() => setOpenId(a.id)}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-body-sm font-medium text-on-surface">
                            {a.name}
                          </span>
                          <span className="mt-0.5 block truncate text-caption text-on-surface-subtle">
                            {stepLabel((a.steps ?? []).length)} · {runLabel(a.runs)}
                          </span>
                        </span>

                        <span className="flex shrink-0 items-center gap-1">
                          {(a.steps ?? []).slice(0, 4).map((s, i) => {
                            const Icon = STEP_ICON[s.id ?? ''] ?? Zap;
                            return (
                              <Tooltip key={i} label={s.label ?? 'Step'} side="top">
                                <span className="flex size-6 items-center justify-center rounded-md bg-subtle">
                                  <Icon className="size-3.5 text-on-surface-muted" strokeWidth={1.75} />
                                </span>
                              </Tooltip>
                            );
                          })}
                        </span>

                        {a.pillar && <Badge tone="neutral">{a.pillar}</Badge>}
                        {owner && <Avatar name={owner.name} size="sm" />}
                      </button>

                      <span onClick={(e) => e.stopPropagation()}>
                        <Switch
                          checked={!!a.enabled}
                          onCheckedChange={() => dispatch({ type: 'TOGGLE_ACTION', actionId: a.id })}
                        />
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <Drawer
        open={!!open}
        onOpenChange={(o) => !o && setOpenId(null)}
        title={open?.name ?? ''}
        description={open?.enabled ? 'Enabled' : 'Disabled'}
        width="lg"
      >
        {open && (
          <div className="space-y-5">
            <div className="space-y-2">
              <p className="text-caption font-semibold uppercase tracking-wide text-on-surface-subtle">
                Rule
              </p>
              <RuleRow keyword="When">
                <RuleValue>{humanField(open.event?.field)}</RuleValue>
                <span className="text-body-sm text-on-surface-muted">
                  {humanField(open.event?.mode)}
                </span>
                {open.event?.to && <RuleValue>{open.event.to}</RuleValue>}
              </RuleRow>

              {(open.conditions ?? []).map((c, i) => (
                <RuleRow key={i} keyword={i === 0 ? 'If' : (open.logic ?? 'And')}>
                  <RuleValue>{humanField(c.field)}</RuleValue>
                  <span className="text-body-sm text-on-surface-muted">{c.op}</span>
                  <RuleValue>{c.val}</RuleValue>
                </RuleRow>
              ))}

              {(open.steps ?? []).map((s, i) => {
                const Icon = STEP_ICON[s.id ?? ''] ?? Zap;
                return (
                  <RuleRow key={s.key ?? i} keyword={i === 0 ? 'Then' : 'And'}>
                    <Icon className="size-4 shrink-0 text-on-surface-muted" strokeWidth={1.75} />
                    <RuleValue>{s.label}</RuleValue>
                    {s.arg && (
                      <span className="min-w-0 truncate text-body-sm text-on-surface-muted">
                        {s.arg}
                      </span>
                    )}
                  </RuleRow>
                );
              })}
            </div>

            <KeyValueList
              items={[
                { label: 'Pillar', value: titleCase(open.pillar) },
                { label: 'Scope', value: titleCase(open.scope) },
                { label: 'Runs', value: open.runs ?? 0 },
                { label: 'Last run', value: open.lastRun ?? '—' },
                { label: 'Created', value: open.createdAt ?? '—' },
                {
                  label: 'Owner',
                  value: open.ownerId ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Avatar name={USERS[open.ownerId]?.name} size="xs" />
                      {USERS[open.ownerId]?.name}
                    </span>
                  ) : (
                    '—'
                  ),
                },
              ]}
            />
          </div>
        )}
      </Drawer>
    </div>
  );
}
