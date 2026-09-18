import React from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Badge, Button, Meter, SearchInput, Select } from '@/design-system';
import { ALL_PRIVILEGES, APP_ROLES, PRIVILEGE_GROUPS } from '@/data/admin';
import { SettingsGroup, toneOf } from '../primitives';
import type { SectionProps } from './types';

/**
 * The privilege matrix. It is display-only in the MVP — nothing in the app
 * reads it — and that is preserved; this screen is the contract, not the
 * enforcement.
 */
export function RolesSection({ dispatch, focus, onFocus }: SectionProps) {
  const [grants, setGrants] = React.useState<Record<string, Record<number, boolean>>>({});
  const [q, setQ] = React.useState('');
  const [groupFilter, setGroupFilter] = React.useState('all');

  const granted = (p: any, i: number) => {
    const o = grants[p.key];
    return o && o[i] !== undefined ? o[i] : p.roles[i] === 1;
  };
  const toggle = (p: any, i: number) =>
    setGrants((g) => ({ ...g, [p.key]: { ...(g[p.key] ?? {}), [i]: !granted(p, i) } }));
  const countFor = (i: number) => ALL_PRIVILEGES.filter((p: any) => granted(p, i)).length;

  const roleIndex = focus ? Number(focus) : null;

  // ── One role: what it can and cannot do ──
  if (roleIndex !== null && APP_ROLES[roleIndex]) {
    const role = APP_ROLES[roleIndex];
    const allowed: any[] = [];
    const denied: any[] = [];
    PRIVILEGE_GROUPS.forEach((g: any) =>
      g.items.forEach((p: any) =>
        (granted(p, roleIndex) ? allowed : denied).push({ ...p, group: g.group }),
      ),
    );

    return (
      <div className="space-y-5">
        <SettingsGroup>
          <div className="flex flex-wrap items-center gap-4 py-3.5">
            <Badge tone={toneOf(role.tone)}>{role.label}</Badge>
            <p className="min-w-[16rem] flex-1 text-body-sm text-on-surface-muted">{role.desc}</p>
            <div className="w-48">
              <Meter
                label="Granted"
                value={allowed.length}
                max={ALL_PRIVILEGES.length}
                display={`${allowed.length}/${ALL_PRIVILEGES.length}`}
                tone="accent"
              />
            </div>
          </div>
        </SettingsGroup>

        <div className="grid gap-5 lg:grid-cols-2">
          {([
            ['Granted', allowed, true],
            ['Not granted', denied, false],
          ] as const).map(([title, list, good]) => (
            <SettingsGroup
              key={title}
              title={title}
              actions={<Badge tone={good ? 'success' : 'neutral'}>{list.length}</Badge>}
            >
              {list.length === 0 ? (
                <p className="py-4 text-body-sm text-on-surface-subtle">None</p>
              ) : (
                <div className="max-h-[26rem] space-y-1.5 overflow-y-auto py-3.5">
                  {list.map((p) => (
                    <div key={p.key} className="flex items-start gap-2">
                      <span
                        className={cn(
                          'mt-0.5 shrink-0',
                          good ? 'text-success-fg' : 'text-on-surface-faint',
                        )}
                      >
                        {good ? (
                          <Check className="size-3.5" strokeWidth={2.5} />
                        ) : (
                          <X className="size-3.5" strokeWidth={2} />
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="text-body-sm font-medium text-on-surface">{p.label}</p>
                        <p className="text-caption text-on-surface-subtle">
                          {p.group} · <span className="font-mono">{p.key}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SettingsGroup>
          ))}
        </div>
      </div>
    );
  }

  // ── The matrix ──
  const groups = PRIVILEGE_GROUPS.filter(
    (g: any) => groupFilter === 'all' || g.group === groupFilter,
  )
    .map((g: any) => ({
      ...g,
      items: g.items.filter(
        (p: any) =>
          !q ||
          p.label.toLowerCase().includes(q.toLowerCase()) ||
          p.desc.toLowerCase().includes(q.toLowerCase()) ||
          p.key.includes(q.toLowerCase()),
      ),
    }))
    .filter((g: any) => g.items.length > 0);

  const shownCount = groups.reduce((n: number, g: any) => n + g.items.length, 0);
  const dirty = Object.keys(grants).length;

  return (
    <div className="space-y-5">
      <p className="max-w-prose text-body-sm leading-relaxed text-on-surface-muted">
        These are the same roles offered in Profile settings › Configuration. Every privilege is
        listed individually — tick a cell to grant it to that role.
      </p>

      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {APP_ROLES.map((r: any, i: number) => (
          <button
            key={r.id}
            onClick={() => onFocus(String(i))}
            className="rounded-xl border border-border-default bg-surface p-3.5 text-left transition-colors duration-[120ms] hover:border-border-strong hover:bg-hover"
          >
            <Badge tone={toneOf(r.tone)}>{r.label}</Badge>
            <p className="mt-2.5 text-title font-semibold tabular-nums text-on-surface">
              {countFor(i)}
              <span className="ml-1 text-body-sm font-normal text-on-surface-subtle">
                / {ALL_PRIVILEGES.length}
              </span>
            </p>
            <Meter className="mt-2" value={countFor(i)} max={ALL_PRIVILEGES.length} tone="accent" />
          </button>
        ))}
      </div>

      <SettingsGroup
        flush
        title="Privileges"
        description={`${shownCount} of ${ALL_PRIVILEGES.length} shown across ${APP_ROLES.length} roles.${
          dirty ? `  ·  ${dirty} modified, unsaved.` : ''
        }`}
        actions={
          <>
            <div className="w-60">
              <SearchInput
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search privileges…"
              />
            </div>
            <Select
              value={groupFilter}
              onValueChange={setGroupFilter}
              options={[
                { value: 'all', label: 'All groups' },
                ...PRIVILEGE_GROUPS.map((g: any) => ({ value: g.group, label: g.group })),
              ]}
            />
            {dirty > 0 && (
              <Button size="sm" variant="ghost" onClick={() => setGrants({})}>
                Reset
              </Button>
            )}
            <Button
              size="sm"
              variant="primary"
              onClick={() =>
                dispatch({ type: 'ADD_TOAST', msg: 'Role privileges saved', toastType: 'success' })
              }
            >
              Save
            </Button>
          </>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-body-sm" style={{ minWidth: '880px' }}>
            <thead>
              <tr className="border-b border-border-default bg-subtle">
                <th className="min-w-[22rem] px-4 py-2.5 text-left text-caption font-medium text-on-surface-subtle">
                  Privilege
                </th>
                {APP_ROLES.map((r: any, i: number) => (
                  <th key={r.id} className="whitespace-nowrap px-3 py-2.5 text-center">
                    <button
                      onClick={() => onFocus(String(i))}
                      className="text-caption font-medium text-on-surface-subtle transition-colors hover:text-on-surface"
                    >
                      {r.label}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shownCount === 0 ? (
                <tr>
                  <td
                    colSpan={APP_ROLES.length + 1}
                    className="px-4 py-10 text-center text-body-sm text-on-surface-subtle"
                  >
                    No privileges match that search
                  </td>
                </tr>
              ) : (
                groups.map((g: any) => (
                  <React.Fragment key={g.group}>
                    <tr className="border-b border-border-default bg-subtle/60">
                      <td colSpan={APP_ROLES.length + 1} className="px-4 py-1.5">
                        <span className="text-caption font-semibold text-on-surface-muted">
                          {g.group}
                        </span>
                      </td>
                    </tr>
                    {g.items.map((p: any) => (
                      <tr
                        key={p.key}
                        className="border-b border-border-default last:border-0 transition-colors duration-[120ms] hover:bg-hover"
                      >
                        <td className="px-4 py-2.5">
                          <p className="text-body-sm font-medium text-on-surface">{p.label}</p>
                          <p className="text-caption text-on-surface-subtle">{p.desc}</p>
                          <p className="mt-0.5 font-mono text-caption text-on-surface-faint">
                            {p.key}
                          </p>
                        </td>
                        {APP_ROLES.map((r: any, i: number) => (
                          <td key={r.id} className="px-3 py-2.5 text-center">
                            <button
                              onClick={() => toggle(p, i)}
                              aria-pressed={granted(p, i)}
                              aria-label={`${p.label} for ${r.label}`}
                              className={cn(
                                'inline-flex size-6 items-center justify-center rounded-md border transition-colors duration-[120ms]',
                                granted(p, i)
                                  ? 'border-accent bg-accent text-on-accent'
                                  : 'border-border-default text-transparent hover:border-border-strong',
                              )}
                            >
                              <Check className="size-3.5" strokeWidth={2.5} />
                            </button>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SettingsGroup>
    </div>
  );
}
