import React from 'react';
import { Check, Mail, RefreshCw, Unplug } from 'lucide-react';
import { useApp } from '@/state/AppContext';
import {
  Avatar, Badge, Button, Field, Input, PageHeader, Select, Switch, Tabs, Textarea,
} from '@/design-system';
import { USERS } from '@/data/core';

type TabId = 'profile' | 'mailbox' | 'signature' | 'locale';

function Card({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border-default bg-surface">
      <div className="border-b border-border-default px-4 py-3">
        <h3 className="text-body-sm font-semibold text-on-surface">{title}</h3>
        {description && <p className="mt-0.5 text-caption text-on-surface-subtle">{description}</p>}
      </div>
      <div className="px-4 py-4">{children}</div>
    </section>
  );
}

const TIMEZONES = [
  { value: 'ist', label: 'Asia/Kolkata (IST, UTC+5:30)' },
  { value: 'gmt', label: 'Europe/London (GMT, UTC+0)' },
  { value: 'pst', label: 'America/Los_Angeles (PST, UTC−8)' },
  { value: 'est', label: 'America/New_York (EST, UTC−5)' },
];

const DATE_FORMATS = [
  { value: 'dmy', label: 'DD MMM YYYY' },
  { value: 'mdy', label: 'MMM DD, YYYY' },
  { value: 'iso', label: 'YYYY-MM-DD' },
];

export function ProfileSettingsPage() {
  const { state, dispatch } = useApp();
  const [tab, setTab] = React.useState<TabId>('profile');

  const user = USERS[state.activeUser] ?? USERS.maya;
  const mailbox = state.mailbox ?? {};

  const [name, setName] = React.useState(user.name);
  const [tz, setTz] = React.useState('ist');
  const [dateFmt, setDateFmt] = React.useState('dmy');
  const [signature, setSignature] = React.useState(
    `${user.name}\nCustomer Success · CX42\n${user.id}@cx42.io`,
  );
  const [digest, setDigest] = React.useState(true);
  const [mentions, setMentions] = React.useState(true);

  // Local edits only become "dirty" against the values the app started with.
  const dirty = name !== user.name;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader
        title="Profile settings"
        meta={<span>{user.name} · Customer Success</span>}
        tabs={
          <Tabs
            value={tab}
            onChange={(v) => setTab(v as TabId)}
            items={[
              { value: 'profile', label: 'Profile' },
              { value: 'mailbox', label: 'Mailbox' },
              { value: 'signature', label: 'Signature' },
              { value: 'locale', label: 'Locale & timezone' },
            ]}
          />
        }
      />

      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        <div className="mx-auto max-w-form space-y-4">
          {tab === 'profile' && (
            <>
              <Card title="Your details">
                <div className="flex items-center gap-4">
                  <Avatar name={user.name} size="xl" />
                  <div className="min-w-0 flex-1 space-y-3">
                    <Field label="Full name">
                      <Input value={name} onChange={(e) => setName(e.target.value)} />
                    </Field>
                    <Field label="Email" hint="Managed by your identity provider.">
                      <Input value={`${user.id}@cx42.io`} readOnly disabled />
                    </Field>
                  </div>
                </div>
              </Card>

              <Card title="Notifications" description="What reaches you, and where.">
                <div className="space-y-3">
                  <Switch checked={digest} onCheckedChange={setDigest} label="Daily digest of overdue work" />
                  <Switch checked={mentions} onCheckedChange={setMentions} label="Email me when I am mentioned" />
                </div>
              </Card>
            </>
          )}

          {tab === 'mailbox' && (
            <Card title="Connected mailbox" description="Used to send and thread customer email.">
              {mailbox.connected ? (
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-subtle">
                    <Mail className="size-4 text-on-surface-muted" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-body-sm font-medium text-on-surface">{mailbox.address}</p>
                    <p className="mt-0.5 text-caption text-on-surface-subtle">
                      {mailbox.provider} · synced {mailbox.synced}
                    </p>
                  </div>
                  <Badge tone="success" dot>
                    Connected
                  </Badge>
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={<RefreshCw className="size-4" strokeWidth={1.75} />}
                    onClick={() => dispatch({ type: 'SYNC_MAILBOX' })}
                  >
                    Sync
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={<Unplug className="size-4" strokeWidth={1.75} />}
                    onClick={() => dispatch({ type: 'DISCONNECT_MAILBOX' })}
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <p className="text-body-sm text-on-surface-muted">
                    No mailbox connected. Customer email will not thread until you connect one.
                  </p>
                  <Button
                    variant="solid"
                    size="sm"
                    onClick={() =>
                      dispatch({
                        type: 'CONNECT_MAILBOX',
                        provider: 'gmail',
                        address: `${user.id}@cx42.io`,
                      })
                    }
                  >
                    Connect
                  </Button>
                </div>
              )}
            </Card>
          )}

          {tab === 'signature' && (
            <Card title="Email signature" description="Appended to replies you send from CX42.">
              <Field label="Signature">
                <Textarea
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  className="min-h-32 font-mono"
                />
              </Field>
              <div className="mt-3 rounded-lg border border-border-default bg-subtle px-3 py-2.5">
                <p className="text-caption font-semibold uppercase tracking-wide text-on-surface-subtle">
                  Preview
                </p>
                <p className="mt-1.5 whitespace-pre-wrap text-body text-on-surface-muted">{signature}</p>
              </div>
            </Card>
          )}

          {tab === 'locale' && (
            <Card title="Locale and timezone" description="Affects how dates and times are shown to you.">
              <div className="space-y-3">
                <Field label="Timezone">
                  <Select value={tz} onValueChange={setTz} options={TIMEZONES} />
                </Field>
                <Field label="Date format">
                  <Select value={dateFmt} onValueChange={setDateFmt} options={DATE_FORMATS} />
                </Field>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Save bar appears only when something is dirty. */}
      {dirty && (
        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border-default bg-surface px-5 py-3">
          <span className="mr-auto text-caption text-on-surface-subtle">Unsaved changes</span>
          <Button variant="ghost" onClick={() => setName(user.name)}>
            Discard
          </Button>
          <Button
            variant="solid"
            icon={<Check className="size-4" strokeWidth={2} />}
            onClick={() => {
              dispatch({ type: 'ADD_TOAST', msg: 'Profile saved.', toastType: 'success' });
              setName(name);
            }}
          >
            Save changes
          </Button>
        </div>
      )}
    </div>
  );
}
