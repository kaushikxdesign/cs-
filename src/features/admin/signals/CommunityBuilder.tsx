import React from 'react';
import { Plus } from 'lucide-react';
import { Badge, Button, Input, Select, Switch } from '@/design-system';
import { COMMUNITY_PLATFORMS, COMMUNITY_SPACES } from '@/data/admin';
import {
  AdminTable, Cell, NoRows, Row, SettingRow, SettingsGroup,
} from '../primitives';
import { BuilderTabs, type BuilderProps } from './shared';

const WEIGHTS = ['none', 'low', 'medium', 'high'];

const MODERATION = [
  ['Unanswered post older than 48 hours lowers health', true],
  ['Negative sentiment on a post raises a risk signal', true],
  ['Feature request volume feeds the expansion signal', true],
  ['Upvotes count toward engagement', false],
  ['Auto-flag posts containing competitor names', true],
  ['Match members to accounts by email domain', true],
] as const;

/** Community spaces, what they feed into health, and where they sync from. */
export function CommunityBuilder({ dispatch }: BuilderProps) {
  const [tab, setTab] = React.useState('spaces');
  const [spaces, setSpaces] = React.useState<any[]>(COMMUNITY_SPACES);
  const [platforms, setPlatforms] = React.useState<any[]>(COMMUNITY_PLATFORMS);
  const [rules, setRules] = React.useState<Record<string, boolean>>(
    Object.fromEntries(MODERATION.map(([k, v]) => [k, v])),
  );

  return (
    <div className="space-y-5">
      <BuilderTabs
        value={tab}
        onChange={setTab}
        items={[
          { value: 'spaces', label: 'Spaces', count: spaces.length },
          { value: 'moderation', label: 'Moderation and signal' },
          { value: 'connect', label: 'Platform' },
        ]}
      />

      {tab === 'spaces' && (
        <SettingsGroup
          flush
          title="Community spaces"
          description="Each space can feed the health signal at a different weight."
          actions={
            <Button
              size="sm"
              variant="secondary"
              icon={<Plus className="size-4" strokeWidth={1.75} />}
              onClick={() =>
                setSpaces((l) => [
                  ...l,
                  { id: 'cs_new' + (l.length + 1), name: 'New space', posts: 0, members: 0, moderated: true, signal: 'low' },
                ])
              }
            >
              Add space
            </Button>
          }
        >
          <AdminTable columns={['Space', 'Posts', 'Members', 'Moderated', 'Signal weight', '']}>
            {spaces.length === 0 ? (
              <NoRows colSpan={6} message="No spaces configured" />
            ) : (
              spaces.map((sp) => (
                <Row key={sp.id}>
                  <Cell>
                    <Input
                      className="w-48"
                      value={sp.name}
                      onChange={(e) =>
                        setSpaces((l) => l.map((x) => (x.id === sp.id ? { ...x, name: e.target.value } : x)))
                      }
                    />
                  </Cell>
                  <Cell className="tabular-nums">{sp.posts.toLocaleString()}</Cell>
                  <Cell className="tabular-nums">{sp.members.toLocaleString()}</Cell>
                  <Cell>
                    <Switch
                      checked={sp.moderated}
                      aria-label="Moderated"
                      onCheckedChange={(v) =>
                        setSpaces((l) => l.map((x) => (x.id === sp.id ? { ...x, moderated: v } : x)))
                      }
                    />
                  </Cell>
                  <Cell>
                    <Select
                      value={sp.signal}
                      onValueChange={(v) =>
                        setSpaces((l) => l.map((x) => (x.id === sp.id ? { ...x, signal: v } : x)))
                      }
                      options={WEIGHTS.map((w) => ({ value: w, label: w }))}
                    />
                  </Cell>
                  <Cell right>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSpaces((l) => l.filter((x) => x.id !== sp.id))}
                    >
                      Remove
                    </Button>
                  </Cell>
                </Row>
              ))
            )}
          </AdminTable>
        </SettingsGroup>
      )}

      {tab === 'moderation' && (
        <SettingsGroup
          title="What community activity feeds into health"
          description="These rules decide whether a post is just a post, or a signal about the account behind it."
        >
          {MODERATION.map(([label]) => (
            <SettingRow
              key={label}
              label={label}
              control={
                <Switch
                  checked={!!rules[label]}
                  aria-label={label}
                  onCheckedChange={(v) => setRules((r) => ({ ...r, [label]: v }))}
                />
              }
            />
          ))}
        </SettingsGroup>
      )}

      {tab === 'connect' && (
        <div className="grid gap-3 lg:grid-cols-2">
          {platforms.map((p) => (
            <div
              key={p.id}
              className="flex items-start gap-3 rounded-xl border border-border-default bg-surface p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-body-sm font-medium text-on-surface">{p.name}</p>
                  <Badge tone={p.connected ? 'success' : 'neutral'} dot>
                    {p.connected ? 'Active' : 'Available'}
                  </Badge>
                </div>
                <p className="mt-1 text-caption leading-relaxed text-on-surface-subtle">{p.note}</p>
              </div>
              <Button
                size="sm"
                variant={p.connected ? 'secondary' : 'primary'}
                onClick={() => {
                  setPlatforms((l) => l.map((x) => (x.id === p.id ? { ...x, connected: !x.connected } : x)));
                  dispatch({
                    type: 'ADD_TOAST',
                    msg: p.connected ? `${p.name} disconnected` : `${p.name} connected`,
                    toastType: 'info',
                  });
                }}
              >
                {p.connected ? 'Disconnect' : 'Connect'}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
