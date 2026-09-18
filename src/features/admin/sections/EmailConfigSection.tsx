import React from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/cn';
import {
  Avatar, Badge, Button, Dialog, Field, Input, MetricCard, MetricRow, Select, Switch, Textarea,
} from '@/design-system';
import { USERS } from '@/data/core';
import { EMAIL_CONFIG_DEFAULTS, SUPPORT_MAILBOXES, routeEmail } from '@/data/emails';
import { AGENT_MAILBOXES } from '@/data/admin';
import {
  AdminTable, Cell, CodeBlock, NameCell, NoRows, Row, SettingRow, SettingsGroup,
} from '../primitives';
import { BuilderTabs } from '../signals';
import type { SectionProps } from './types';

const parseDomains = (s: string) =>
  s.split(/[\n,]/).map((x) => x.trim().toLowerCase().replace(/^@/, '')).filter(Boolean);

/** Try an address against the current lists before committing them. */
function DomainTester({ cfg, customers }: { cfg: any; customers: any[] }) {
  const [addr, setAddr] = React.useState('sarah.mitchell@acme-analytics.io');
  const r = routeEmail({ fromEmail: addr, to: 'maya.chen@cx42.io' } as any, cfg, customers);
  const tone = r.bucket === 'mapped' ? 'success' : r.bucket === 'internal' ? 'neutral' : 'warning';
  const label =
    r.bucket === 'mapped'
      ? 'Maps to an account'
      : r.bucket === 'internal'
        ? 'Internal — no account'
        : 'External — no account match';
  return (
    <div className="space-y-2.5 py-3.5">
      <div className="flex flex-wrap gap-2">
        <Input
          className="min-w-[16rem] flex-1 font-mono"
          value={addr}
          onChange={(e) => setAddr(e.target.value)}
          placeholder="someone@somewhere.com"
        />
        <Badge tone={tone} dot className="self-center px-2.5 py-1">
          {label}
        </Badge>
      </div>
      <p className="max-w-prose text-caption leading-relaxed text-on-surface-subtle">{r.reason}</p>
      <div className="flex flex-wrap gap-1.5">
        {[
          'sarah.mitchell@acme-analytics.io',
          'james.park@acme.com',
          'devraman88@gmail.com',
          'n.haddad@brightpath-consulting.com',
        ].map((s) => (
          <button
            key={s}
            onClick={() => setAddr(s)}
            className="rounded-md bg-subtle px-2 py-1 font-mono text-caption text-on-surface-muted transition-colors hover:bg-hover hover:text-on-surface"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

/** DKIM: generate a selector and TXT value, publish, verify, regenerate. */
function DkimPanel({ cfg, dispatch }: { cfg: any; dispatch: (a: any) => void }) {
  const d = cfg.dkim;
  const [domain, setDomain] = React.useState(d.domain);
  const status =
    d.status === 'verified'
      ? { tone: 'success' as const, label: 'Published and verified' }
      : d.status === 'generated'
        ? { tone: 'warning' as const, label: 'Generated, not published' }
        : { tone: 'neutral' as const, label: 'Not generated' };

  function generate() {
    const sel = 'cx42' + Math.random().toString(36).slice(2, 6);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const key = Array.from({ length: 216 }, () => chars[Math.floor(Math.random() * 64)]).join('');
    dispatch({
      type: 'SET_DKIM',
      patch: {
        domain,
        selector: sel,
        status: 'generated',
        value: 'v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA' + key,
      },
      msg: 'DKIM record generated — add it to DNS, then publish',
    });
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border-default bg-subtle px-4 py-3.5">
        <p className="max-w-prose text-body-sm leading-relaxed text-on-surface-muted">
          DKIM signs outbound mail so receiving servers can prove it came from you. Without it,
          replies sent from CX42 on your domain are far more likely to land in spam.
        </p>
      </div>

      <SettingsGroup
        title="Signing domain"
        actions={
          <Badge tone={status.tone} dot>
            {status.label}
          </Badge>
        }
      >
        <div className="space-y-2 py-3.5">
          <div className="flex flex-wrap gap-2">
            <Input
              className="min-w-[14rem] flex-1 font-mono"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            />
            <Button variant="primary" onClick={generate}>
              {d.status === 'none' ? 'Generate DKIM record' : 'Regenerate'}
            </Button>
          </div>
          {d.status !== 'none' && d.selector && (
            <p className="text-caption text-on-surface-subtle">
              Selector: {d.selector} · Key: RSA 2048-bit
            </p>
          )}
        </div>
      </SettingsGroup>

      {d.status !== 'none' && (
        <SettingsGroup title="Add this record at your DNS provider">
          <div className="space-y-3 py-3.5">
            <CodeBlock
              label="TXT record"
              code={`Host   ${d.selector}._domainkey.${d.domain}\nType   TXT\nValue  ${d.value}`}
              onCopy={() =>
                dispatch({ type: 'ADD_TOAST', msg: 'DNS record copied', toastType: 'info' })
              }
            />
            <div className="flex flex-wrap items-center gap-2">
              {d.status === 'generated' && (
                <Button
                  variant="primary"
                  onClick={() =>
                    dispatch({
                      type: 'SET_DKIM',
                      patch: { status: 'verified' },
                      msg: 'DKIM published and verified',
                    })
                  }
                >
                  Publish
                </Button>
              )}
              <Button
                variant="secondary"
                onClick={() =>
                  dispatch({
                    type: 'SET_DKIM',
                    patch: { status: d.status === 'verified' ? 'verified' : 'generated' },
                    msg:
                      d.status === 'verified'
                        ? 'DNS re-verified — record still present'
                        : 'DNS checked — record not found yet',
                  })
                }
              >
                Re-verify DNS
              </Button>
              <span className="text-caption text-on-surface-subtle">
                {d.status === 'verified'
                  ? 'Outbound mail on this domain is signed.'
                  : 'Mail is unsigned until this record resolves in DNS.'}
              </span>
            </div>
          </div>
        </SettingsGroup>
      )}
    </div>
  );
}

export function EmailConfigSection({ state, dispatch }: SectionProps) {
  const cfg = state.emailConfig ?? EMAIL_CONFIG_DEFAULTS;
  const supportBoxes = state.supportMailboxes ?? SUPPORT_MAILBOXES;
  const [tab, setTab] = React.useState('mailboxes');
  const [wizOpen, setWizOpen] = React.useState(false);

  const [thr, setThr] = React.useState(cfg.threading);
  const [loop, setLoop] = React.useState(cfg.loop);
  const [bl, setBl] = React.useState(cfg.blacklist);
  const [coDomains, setCoDomains] = React.useState((cfg.companyDomains ?? []).join('\n'));
  const [exDomains, setExDomains] = React.useState((cfg.excludedDomains ?? []).join('\n'));

  const agents = Object.keys(USERS);
  const mailboxFor = (id: string) =>
    id === 'maya' && state.mailbox
      ? { ...(AGENT_MAILBOXES as any).maya, ...state.mailbox }
      : (AGENT_MAILBOXES as any)[id] ?? { connected: false, scopes: [] };
  const connected = agents.filter((id) => mailboxFor(id).connected);

  const emails = state.emails ?? [];
  const mapped = emails.filter((e: any) => e.routing?.bucket === 'mapped').length;

  return (
    <div className="space-y-5">
      <MetricRow>
        <MetricCard
          label="Support mailboxes"
          value={supportBoxes.length}
          hint={`${supportBoxes.filter((m: any) => m.connected).length} connected`}
        />
        <MetricCard
          label="CSM mailboxes"
          value={`${connected.length}/${agents.length}`}
          hint="connected by the CSM"
        />
        <MetricCard
          label="Mapped to accounts"
          value={mapped}
          hint={`of ${emails.length} pulled messages`}
        />
        <MetricCard
          label="Unmapped"
          value={emails.length - mapped}
          hint="internal or no matching domain"
        />
      </MetricRow>

      <BuilderTabs
        value={tab}
        onChange={setTab}
        items={[
          { value: 'mailboxes', label: 'Mailboxes', count: supportBoxes.length + connected.length },
          { value: 'domains', label: 'Domains' },
          { value: 'threading', label: 'Threading' },
          { value: 'dkim', label: 'DKIM' },
          { value: 'loop', label: 'Loop protection' },
          { value: 'blacklist', label: 'Blacklisting' },
        ]}
      />

      {tab === 'mailboxes' && (
        <div className="space-y-5">
          <SettingsGroup
            flush
            title="Support mailboxes"
            description="Shared inboxes an admin connects. Mail arriving here becomes a ticket."
            actions={
              <Button
                size="sm"
                variant="secondary"
                icon={<Plus className="size-4" strokeWidth={1.75} />}
                onClick={() => setWizOpen(true)}
              >
                Add mailbox
              </Button>
            }
          >
            <AdminTable
              minWidth="900px"
              columns={['Mailbox', 'Provider', 'Routes to', 'Creates', 'Received, 30d', 'Status', '']}
            >
              {supportBoxes.map((m: any) => (
                <Row key={m.id}>
                  <td className="px-4 py-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-caption font-medium text-on-surface">
                        {m.address}
                      </span>
                      {m.isDefault && <Badge tone="info">Default</Badge>}
                    </div>
                    <p className="mt-0.5 text-caption text-on-surface-subtle">{m.owner}</p>
                  </td>
                  <Cell>{m.method}</Cell>
                  <Cell>{m.routesTo}</Cell>
                  <Cell>
                    <Badge tone="neutral">{m.creates}</Badge>
                  </Cell>
                  <Cell className="tabular-nums">{(m.received30d ?? 0).toLocaleString()}</Cell>
                  <Cell>
                    <Badge tone={m.connected ? 'success' : 'warning'} dot>
                      {m.connected ? 'Connected' : 'Not connected'}
                    </Badge>
                  </Cell>
                  <Cell right>
                    {!m.isDefault && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            dispatch({
                              type: 'UPDATE_SUPPORT_MAILBOX',
                              id: m.id,
                              patch: { isDefault: true },
                              msg: `${m.address} is now the default`,
                            })
                          }
                        >
                          Make default
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => dispatch({ type: 'REMOVE_SUPPORT_MAILBOX', id: m.id })}
                        >
                          Remove
                        </Button>
                      </>
                    )}
                  </Cell>
                </Row>
              ))}
            </AdminTable>
          </SettingsGroup>

          <SettingsGroup
            flush
            title="CSM mailboxes"
            description="Each CSM authorises their own mailbox by OAuth from Profile settings. An admin can see the grant but cannot create, edit or revoke it here."
            actions={<Badge tone="neutral">View only</Badge>}
          >
            <AdminTable
              minWidth="900px"
              columns={['CSM', 'Mailbox', 'Auth method', 'Scopes granted', 'Connected on', 'Last sync']}
            >
              {agents.map((id) => {
                const u = (USERS as any)[id];
                const mb = mailboxFor(id);
                return (
                  <Row key={id}>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center gap-2">
                        <Avatar name={u.name} size="sm" />
                        <span className="text-body-sm font-medium text-on-surface">{u.name}</span>
                      </span>
                    </td>
                    <Cell mono>{mb.address ?? '—'}</Cell>
                    <Cell>
                      {mb.connected ? (
                        <Badge tone="success">{mb.method ?? 'OAuth 2.0'}</Badge>
                      ) : (
                        <span className="text-on-surface-faint">Not connected</span>
                      )}
                    </Cell>
                    <Cell>
                      {(mb.scopes ?? []).length ? (
                        <span className="flex flex-wrap gap-1">
                          {mb.scopes.map((sc: string) => (
                            <Badge key={sc} tone="neutral">
                              {sc}
                            </Badge>
                          ))}
                        </span>
                      ) : (
                        <span className="text-on-surface-faint">—</span>
                      )}
                    </Cell>
                    <Cell>{mb.connectedOn ?? '—'}</Cell>
                    <Cell right>{mb.synced ?? '—'}</Cell>
                  </Row>
                );
              })}
            </AdminTable>
          </SettingsGroup>
        </div>
      )}

      {tab === 'domains' && (
        <div className="space-y-5">
          <div className="rounded-xl border border-border-default bg-subtle px-4 py-3.5">
            <p className="max-w-prose text-body-sm leading-relaxed text-on-surface-muted">
              These two lists decide what happens to every message pulled from a mailbox. A message
              with at least one participant outside both lists is mapped to the matching customer
              account. A message with no such participant stays in My Work only.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <SettingsGroup
              title="Company domains"
              description="Our own staff. Mail where every participant is on one of these is internal — it shows in My Work but is never attached to a customer."
              actions={<Badge tone="info">{parseDomains(coDomains).length} domains</Badge>}
            >
              <div className="space-y-1.5 py-3.5">
                <Textarea
                  rows={7}
                  className="font-mono text-caption"
                  value={coDomains}
                  onChange={(e) => setCoDomains(e.target.value)}
                />
                <p className="text-caption text-on-surface-subtle">
                  One per line. Subdomains are matched automatically.
                </p>
              </div>
            </SettingsGroup>

            <SettingsGroup
              title="Excluded domains"
              description="Public and consumer mail providers. An address on one of these is never treated as a customer, so a personal address can never create or map to an account."
              actions={<Badge tone="warning">{parseDomains(exDomains).length} domains</Badge>}
            >
              <div className="space-y-1.5 py-3.5">
                <Textarea
                  rows={7}
                  className="font-mono text-caption"
                  value={exDomains}
                  onChange={(e) => setExDomains(e.target.value)}
                />
                <p className="text-caption text-on-surface-subtle">
                  One per line. Exact match only — subdomains are not excluded.
                </p>
              </div>
            </SettingsGroup>
          </div>

          <SettingsGroup title="Test the routing rules">
            <DomainTester
              cfg={{
                ...cfg,
                companyDomains: parseDomains(coDomains),
                excludedDomains: parseDomains(exDomains),
              }}
              customers={state.customers}
            />
          </SettingsGroup>

          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setCoDomains((cfg.companyDomains ?? []).join('\n'));
                setExDomains((cfg.excludedDomains ?? []).join('\n'));
              }}
            >
              Reset
            </Button>
            <Button
              variant="primary"
              onClick={() =>
                dispatch({
                  type: 'SET_EMAIL_DOMAINS',
                  companyDomains: parseDomains(coDomains),
                  excludedDomains: parseDomains(exDomains),
                })
              }
            >
              Save domains and re-route inbox
            </Button>
          </div>
        </div>
      )}

      {tab === 'threading' && (
        <div className="space-y-5">
          <SettingsGroup
            title="Match rules"
            description="Threading decides whether an incoming reply reopens the original ticket or creates a new one. The decision is made on the message headers, not on what is displayed on screen."
          >
            <SettingRow
              label="Match on Message-ID and In-Reply-To headers"
              description="Subject-line matching is deliberately not used — it threads unrelated mail together."
              control={
                <Switch
                  checked={thr.matchHeaders}
                  aria-label="Match headers"
                  onCheckedChange={() => setThr((t: any) => ({ ...t, matchHeaders: !t.matchHeaders }))}
                />
              }
            />
            <SettingRow
              label="Reopen a ticket if a matching reply arrives within"
              description="Outside this window the reply becomes a new ticket, linked to the original. Keeps a months-later reply from reviving a closed ticket."
              control={
                <Select
                  value={String(thr.reopenWindowDays)}
                  onValueChange={(v) => setThr((t: any) => ({ ...t, reopenWindowDays: Number(v) }))}
                  options={[1, 3, 7, 30].map((d) => ({
                    value: String(d),
                    label: `${d} ${d === 1 ? 'day' : 'days'}`,
                  }))}
                />
              }
            />
            <SettingRow
              label="Add forwarded-thread replies as a private note"
              description="When a third party replies to a forwarded thread, the reply attaches to the original ticket as a private note — so a partner's words are never sent on to the customer by accident."
              control={
                <Switch
                  checked={thr.forwardRepliesAsNote}
                  aria-label="Forwarded replies as note"
                  onCheckedChange={() =>
                    setThr((t: any) => ({ ...t, forwardRepliesAsNote: !t.forwardRepliesAsNote }))
                  }
                />
              }
            />
          </SettingsGroup>

          <SettingsGroup title="How this plays out" description="A worked example on the current settings.">
            <ol className="space-y-2 py-3.5">
              {[
                ['Mon 09:00', 'Agent resolves SUP1842.', 'Our outbound carries Message-ID <sup1842.a7f@acme.com>.', 'neutral'],
                ['Tue 11:20', 'Customer replies to that same email.', `In-Reply-To matches, and 1 day is inside the ${thr.reopenWindowDays}-day window, so SUP1842 reopens.`, 'success'],
                [`Day ${thr.reopenWindowDays + 12}`, 'Customer replies again to the same thread.', `Header still matches but the reply is outside the ${thr.reopenWindowDays}-day window, so a new ticket is created and linked.`, 'warning'],
                ['Wed 14:05', 'Customer writes a fresh email with no In-Reply-To header.', 'Nothing to match, so a new ticket, whatever the subject line says.', 'warning'],
                ['Thu 08:15', 'billing@partner.com replies to a forward.', thr.forwardRepliesAsNote ? 'Attaches to SUP1842 as a private note. The customer never sees it.' : 'Rule is off — the reply would create its own ticket, splitting the conversation.', thr.forwardRepliesAsNote ? 'success' : 'danger'],
              ].map(([when, what, why, tone], i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-lg border border-border-default px-3 py-2.5"
                >
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-solid text-caption font-semibold tabular-nums text-on-solid">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="font-mono text-caption text-on-surface-faint">{when}</span>
                      <p className="text-body-sm font-medium text-on-surface">{what}</p>
                    </div>
                    <p className="mt-0.5 text-caption leading-relaxed text-on-surface-subtle">{why}</p>
                  </div>
                  <Badge tone={tone as any} dot>
                    {tone === 'success' ? 'Threaded' : tone === 'danger' ? 'Split' : tone === 'warning' ? 'New ticket' : 'Setup'}
                  </Badge>
                </li>
              ))}
            </ol>
          </SettingsGroup>

          <div className="flex justify-end">
            <Button
              variant="primary"
              onClick={() =>
                dispatch({
                  type: 'UPDATE_EMAIL_CONFIG',
                  section: 'threading',
                  patch: thr,
                  msg: 'Threading rules saved',
                })
              }
            >
              Save threading rules
            </Button>
          </div>
        </div>
      )}

      {tab === 'dkim' && <DkimPanel cfg={cfg} dispatch={dispatch} />}

      {tab === 'loop' && (
        <div className="space-y-5">
          <div className="rounded-xl border border-danger-border bg-danger-subtle px-4 py-3.5">
            <p className="text-body-sm font-medium text-danger-fg">
              Safety critical — not a nice-to-have
            </p>
            <p className="mt-1 max-w-prose text-caption leading-relaxed text-danger-fg">
              Two systems replying to each other will send thousands of emails in minutes, breach
              the sending domain's reputation and bury the real queue. These caps are the only
              thing that stops it.
            </p>
          </div>

          <SettingsGroup title="Auto-responder detection">
            <SettingRow
              label="Detect auto-responders and out-of-office replies"
              description="Matches on Auto-Submitted, X-Autoreply and Precedence: bulk headers plus common out-of-office phrasing."
              control={
                <Switch
                  checked={loop.detectAutoResponders}
                  aria-label="Detect auto-responders"
                  onCheckedChange={() =>
                    setLoop((l: any) => ({ ...l, detectAutoResponders: !l.detectAutoResponders }))
                  }
                />
              }
            />
            <SettingRow
              label="Suppress further automated replies once detected"
              description="After an auto-responder is identified on a thread, automations stop emailing that address. A human reply still goes through."
              control={
                <Switch
                  checked={loop.suppressAfterDetect}
                  aria-label="Suppress after detect"
                  onCheckedChange={() =>
                    setLoop((l: any) => ({ ...l, suppressAfterDetect: !l.suppressAfterDetect }))
                  }
                />
              }
            />
          </SettingsGroup>

          <SettingsGroup title="Hard caps">
            <SettingRow
              label="Maximum automated emails to the same recipient, per hour"
              description="Counted per recipient address across every ticket and automation. Anything over the cap is dropped and logged."
              control={
                <Input
                  type="number"
                  min={1}
                  max={100}
                  className="w-20"
                  value={loop.maxPerRecipientHour}
                  onChange={(e) =>
                    setLoop((l: any) => ({ ...l, maxPerRecipientHour: Number(e.target.value) }))
                  }
                />
              }
            />
            <SettingRow
              label="Maximum automation executions per ticket, per hour"
              description="Stops a single ticket from looping through its own rules — the most common runaway pattern."
              control={
                <Input
                  type="number"
                  min={1}
                  max={200}
                  className="w-20"
                  value={loop.maxAutomationsPerTicketHour}
                  onChange={(e) =>
                    setLoop((l: any) => ({
                      ...l,
                      maxAutomationsPerTicketHour: Number(e.target.value),
                    }))
                  }
                />
              }
            />
          </SettingsGroup>

          <SettingsGroup title="Notification throttling">
            <SettingRow
              label="Throttle notifications per recipient"
              description="Collapses repeat notifications to the same person inside the window into a single message."
              control={
                <Switch
                  checked={loop.throttleOn}
                  aria-label="Throttle notifications"
                  onCheckedChange={() => setLoop((l: any) => ({ ...l, throttleOn: !l.throttleOn }))}
                />
              }
            />
            <SettingRow
              label="Throttle window"
              description="How long to wait before the same recipient can be notified again."
              control={
                <Select
                  value={String(loop.throttleWindowMin)}
                  disabled={!loop.throttleOn}
                  onValueChange={(v) => setLoop((l: any) => ({ ...l, throttleWindowMin: Number(v) }))}
                  options={[
                    { value: '10', label: '10 minutes' },
                    { value: '30', label: '30 minutes' },
                    { value: '60', label: '1 hour' },
                  ]}
                />
              }
            />
          </SettingsGroup>

          <div className="flex justify-end">
            <Button
              variant="primary"
              onClick={() =>
                dispatch({
                  type: 'UPDATE_EMAIL_CONFIG',
                  section: 'loop',
                  patch: loop,
                  msg: 'Loop protection saved',
                })
              }
            >
              Save loop protection
            </Button>
          </div>
        </div>
      )}

      {tab === 'blacklist' && (
        <div className="space-y-5">
          <div className="rounded-xl border border-border-default bg-subtle px-4 py-3.5">
            <p className="max-w-prose text-body-sm leading-relaxed text-on-surface-muted">
              When one contact's volume spikes past the threshold inside an hour, that address is
              blacklisted automatically and its mail stops creating tickets. Existing tickets are
              untouched, and any agent can lift it again.
            </p>
          </div>

          <SettingsGroup title="Surge protection">
            <SettingRow
              label="Auto-blacklist on surge"
              description="Applies to the sending address, not the whole customer domain."
              control={
                <Switch
                  checked={bl.autoOnSurge}
                  aria-label="Auto-blacklist"
                  onCheckedChange={() => setBl((b: any) => ({ ...b, autoOnSurge: !b.autoOnSurge }))}
                />
              }
            />
            <SettingRow
              label="Surge threshold"
              description="Emails from one address within a rolling hour before it is blacklisted."
              control={
                <span className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={5}
                    max={500}
                    className="w-20"
                    disabled={!bl.autoOnSurge}
                    value={bl.thresholdPerHour}
                    onChange={(e) =>
                      setBl((b: any) => ({ ...b, thresholdPerHour: Number(e.target.value) }))
                    }
                  />
                  <span className="text-caption text-on-surface-subtle">emails / hour</span>
                </span>
              }
            />
          </SettingsGroup>

          <SettingsGroup
            flush
            title="Blacklisted addresses"
            description="Reversible — lifting the block resumes ticket creation from the next email."
          >
            <AdminTable columns={['Address', 'Reason', 'Blocked at', 'Status', '']}>
              {(cfg.blacklist.entries ?? []).length === 0 ? (
                <NoRows colSpan={5} message="No addresses blacklisted" />
              ) : (
                cfg.blacklist.entries.map((e: any) => (
                  <Row key={e.id}>
                    <NameCell>
                      <span className="font-mono text-caption">{e.email}</span>
                    </NameCell>
                    <Cell>{e.reason}</Cell>
                    <Cell>{e.at}</Cell>
                    <Cell>
                      <Badge tone={e.active ? 'danger' : 'neutral'} dot>
                        {e.active ? 'Blocked' : 'Lifted'}
                      </Badge>
                    </Cell>
                    <Cell right>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          dispatch({
                            type: 'TOGGLE_BLACKLIST',
                            id: e.id,
                            msg: e.active
                              ? `Block lifted for ${e.email}`
                              : `${e.email} blocked again`,
                          })
                        }
                      >
                        {e.active ? 'Lift block' : 'Re-block'}
                      </Button>
                    </Cell>
                  </Row>
                ))
              )}
            </AdminTable>
          </SettingsGroup>

          <div className="flex justify-end">
            <Button
              variant="primary"
              onClick={() =>
                dispatch({
                  type: 'UPDATE_EMAIL_CONFIG',
                  section: 'blacklist',
                  patch: { autoOnSurge: bl.autoOnSurge, thresholdPerHour: bl.thresholdPerHour },
                  msg: 'Blacklisting rules saved',
                })
              }
            >
              Save blacklisting rules
            </Button>
          </div>
        </div>
      )}

      <MailboxWizard open={wizOpen} onClose={() => setWizOpen(false)} dispatch={dispatch} />
    </div>
  );
}

const PROVIDERS = [
  { id: 'o365', label: 'Microsoft 365', method: 'Microsoft Graph', scopes: ['Mail.Read', 'Mail.Send'] },
  { id: 'gmail', label: 'Google Workspace', method: 'OAuth 2.0', scopes: ['gmail.readonly', 'gmail.send'] },
  { id: 'imap', label: 'Other (IMAP/SMTP)', method: 'IMAP / SMTP', scopes: ['imap', 'smtp'] },
];

/** Connection wizard for a new shared support mailbox. */
function MailboxWizard({
  open,
  onClose,
  dispatch,
}: {
  open: boolean;
  onClose: () => void;
  dispatch: (a: any) => void;
}) {
  const [d, setD] = React.useState({
    address: '', label: '', provider: 'o365', routesTo: 'Support queue', creates: 'Ticket',
  });
  React.useEffect(() => {
    if (open) {
      setD({ address: '', label: '', provider: 'o365', routesTo: 'Support queue', creates: 'Ticket' });
    }
  }, [open]);

  const prov = PROVIDERS.find((p) => p.id === d.provider) ?? PROVIDERS[0];

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => !o && onClose()}
      title="Add a support mailbox"
      description="Mail arriving at this address becomes a ticket in the queue you choose."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={!d.address.trim()}
            onClick={() => {
              dispatch({
                type: 'ADD_SUPPORT_MAILBOX',
                mailbox: {
                  id: 'mb_' + Date.now().toString(36),
                  address: d.address,
                  owner: d.label || 'Shared',
                  method: prov.method,
                  routesTo: d.routesTo,
                  creates: d.creates,
                  connected: true,
                  received30d: 0,
                },
                msg: `${d.address} connected`,
              });
              onClose();
            }}
          >
            Connect mailbox
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <Field label="Mailbox address">
          <Input
            className="font-mono"
            value={d.address}
            placeholder="support@yourdomain.com"
            onChange={(e) => setD((s) => ({ ...s, address: e.target.value }))}
          />
        </Field>
        <Field label="Label" hint="Shown beside the address in the mailbox list.">
          <Input
            value={d.label}
            placeholder="Shared · Support operations"
            onChange={(e) => setD((s) => ({ ...s, label: e.target.value }))}
          />
        </Field>
        <Field label="Provider">
          <div className="grid gap-2 sm:grid-cols-3">
            {PROVIDERS.map((p) => (
              <button
                key={p.id}
                onClick={() => setD((s) => ({ ...s, provider: p.id }))}
                aria-pressed={d.provider === p.id}
                className={cn(
                  'rounded-lg border p-2.5 text-left transition-colors duration-[120ms]',
                  d.provider === p.id
                    ? 'border-accent bg-accent-subtle'
                    : 'border-border-default hover:border-border-strong',
                )}
              >
                <p className="text-body-sm font-medium text-on-surface">{p.label}</p>
                <p className="mt-0.5 text-caption text-on-surface-subtle">{p.method}</p>
              </button>
            ))}
          </div>
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Routes to">
            <Select
              value={d.routesTo}
              onValueChange={(v) => setD((s) => ({ ...s, routesTo: v }))}
              options={['Support queue', 'Escalation queue', 'Assigned CSM', 'Renewals queue'].map(
                (o) => ({ value: o, label: o }),
              )}
            />
          </Field>
          <Field label="Creates">
            <Select
              value={d.creates}
              onValueChange={(v) => setD((s) => ({ ...s, creates: v }))}
              options={['Ticket', 'Ticket · P1', 'Email only'].map((o) => ({ value: o, label: o }))}
            />
          </Field>
        </div>
        <p className="rounded-lg bg-subtle px-3 py-2 text-caption text-on-surface-subtle">
          Scopes requested: {prov.scopes.join(', ')}
        </p>
      </div>
    </Dialog>
  );
}
