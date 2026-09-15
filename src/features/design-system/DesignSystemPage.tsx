import React from 'react';
import {
  AlertTriangle, Building2, FileText, Filter, Inbox, MoreHorizontal, Plus, Trash2,
} from 'lucide-react';
import {
  Avatar, AvatarGroup, Badge, Button, Card, CardBody, CardHeader, ChartCard, Checkbox,
  Combobox, CommandPalette, CountBadge, DataTable, Dialog, DropdownMenu, Drawer,
  EmptyState, Field, FilterBar, IconButton, Input, KeyValueList, MetricCard, PageHeader,
  PanelSection, Popover, RadioGroup, RichTextEditor, RuleRow, RuleValue, SearchInput,
  SegmentedControl, Select, Skeleton, StatusDot, Stepper, StepperFooter, Switch, Tabs,
  Textarea, Timeline, ToastViewport, Tooltip, type Tone,
} from '@/design-system';

const TONES: Tone[] = ['neutral', 'accent', 'success', 'warning', 'danger', 'info'];

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-title font-semibold text-on-surface">{title}</h2>
        {description && <p className="mt-0.5 text-body-sm text-on-surface-subtle">{description}</p>}
      </div>
      <Card className="p-4">{children}</Card>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-border-default py-3 last:border-0">
      <span className="w-32 shrink-0 text-caption text-on-surface-subtle">{label}</span>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

const SWATCHES: Array<{ group: string; tokens: string[] }> = [
  { group: 'Surfaces', tokens: ['bg-canvas', 'bg-surface', 'bg-subtle', 'bg-hover', 'bg-selected'] },
  { group: 'Borders', tokens: ['bg-border-default', 'bg-border-strong'] },
  { group: 'Accent', tokens: ['bg-accent', 'bg-accent-hover', 'bg-accent-active', 'bg-accent-subtle'] },
  { group: 'Success', tokens: ['bg-success-subtle', 'bg-success-border', 'bg-success-solid'] },
  { group: 'Warning', tokens: ['bg-warning-subtle', 'bg-warning-border', 'bg-warning-solid'] },
  { group: 'Danger', tokens: ['bg-danger-subtle', 'bg-danger-border', 'bg-danger-solid'] },
  { group: 'Info', tokens: ['bg-info-subtle', 'bg-info-border', 'bg-info-solid'] },
  { group: 'Charts', tokens: ['bg-chart-1', 'bg-chart-2', 'bg-chart-3', 'bg-chart-4', 'bg-chart-5', 'bg-chart-6'] },
];

const TYPE_SCALE = [
  { token: 'display', cls: 'text-display font-semibold', use: 'Dashboard KPI values only' },
  { token: 'title', cls: 'text-title font-semibold', use: 'Page titles' },
  { token: 'title-sm', cls: 'text-title-sm font-semibold', use: 'Card and panel titles' },
  { token: 'body', cls: 'text-body', use: 'Message bodies, forms' },
  { token: 'body-sm', cls: 'text-body-sm', use: 'Default UI text, nav, table cells' },
  { token: 'caption', cls: 'text-caption', use: 'Meta, timestamps, table headers' },
];

interface DemoRow { id: string; account: string; owner: string; arr: number; health: Tone }
const ROWS: DemoRow[] = [
  { id: 'r1', account: 'Acme Analytics', owner: 'Maya Chen', arr: 148000, health: 'danger' },
  { id: 'r2', account: 'Globex Cloud', owner: 'Maya Chen', arr: 96000, health: 'warning' },
  { id: 'r3', account: 'Northstar Labs', owner: 'Daniel Osei', arr: 212000, health: 'success' },
];

export function DesignSystemPage() {
  const [tab, setTab] = React.useState('components');
  const [seg, setSeg] = React.useState<'all' | 'mine'>('all');
  const [dialog, setDialog] = React.useState(false);
  const [drawer, setDrawer] = React.useState(false);
  const [palette, setPalette] = React.useState(false);
  const [checked, setChecked] = React.useState(true);
  const [on, setOn] = React.useState(true);
  const [radio, setRadio] = React.useState('a');
  const [sel, setSel] = React.useState('csm');
  const [combo, setCombo] = React.useState('acme');
  const [selected, setSelected] = React.useState<string[]>([]);
  const [step, setStep] = React.useState(1);
  const [toasts, setToasts] = React.useState([{ id: 1, message: 'Goal published to the customer portal.', tone: 'success' as Tone }]);

  return (
    <div className="min-h-screen bg-canvas">
      <PageHeader
        title="Design system"
        meta={<span>Every token and component in one place.</span>}
        actions={<Button variant="primary" icon={<Plus className="size-4" strokeWidth={1.5} />}>Primary action</Button>}
        tabs={
          <Tabs
            value={tab}
            onChange={setTab}
            items={[{ value: 'components', label: 'Components' }, { value: 'tokens', label: 'Tokens' }]}
          />
        }
      />

      <div className="mx-auto max-w-5xl space-y-8 px-6 py-8">
        {tab === 'tokens' && (
          <>
            <Section title="Colour" description="Components reference semantic tokens only — never primitives.">
              <div className="space-y-4">
                {SWATCHES.map((g) => (
                  <div key={g.group}>
                    <p className="mb-2 text-caption font-medium text-on-surface-subtle">{g.group}</p>
                    <div className="flex flex-wrap gap-3">
                      {g.tokens.map((t) => (
                        <div key={t} className="w-36">
                          <div className={`h-10 rounded-md border border-border-default ${t}`} />
                          <p className="mt-1 text-caption text-on-surface-subtle">{t}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Typography" description="Geist, weights 400/500/600, tabular numerals. Nothing below 12px.">
              <div className="divide-y divide-border-default">
                {TYPE_SCALE.map((t) => (
                  <div key={t.token} className="flex items-baseline gap-4 py-3">
                    <span className="w-20 shrink-0 text-caption text-on-surface-subtle">{t.token}</span>
                    <span className={`flex-1 text-on-surface ${t.cls}`}>The quick brown fox — 1,234,567</span>
                    <span className="hidden w-56 shrink-0 text-caption text-on-surface-subtle sm:block">{t.use}</span>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Radii and elevation" description="Cards never carry shadow; overlays do.">
              <div className="flex flex-wrap gap-4">
                {[['rounded-sm', '4px — badges'], ['rounded-md', '6px — buttons, inputs'], ['rounded-lg', '8px — cards, menus'], ['rounded-xl', '12px — modals, drawers']].map(([cls, label]) => (
                  <div key={cls} className="w-40">
                    <div className={`h-12 border border-border-default bg-subtle ${cls}`} />
                    <p className="mt-1 text-caption text-on-surface-subtle">{label}</p>
                  </div>
                ))}
                <div className="w-40">
                  <div className="h-12 rounded-lg bg-surface shadow-sm" />
                  <p className="mt-1 text-caption text-on-surface-subtle">shadow-sm — popovers</p>
                </div>
                <div className="w-40">
                  <div className="h-12 rounded-xl bg-surface shadow-lg" />
                  <p className="mt-1 text-caption text-on-surface-subtle">shadow-lg — modals</p>
                </div>
              </div>
            </Section>
          </>
        )}

        {tab === 'components' && (
          <>
            <Section title="Button" description="At most one primary per view.">
              <Row label="Variants">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
              </Row>
              <Row label="Sizes">
                <Button size="sm">Small — 28px</Button>
                <Button size="md">Medium — 32px</Button>
              </Row>
              <Row label="States">
                <Button loading>Loading</Button>
                <Button disabled>Disabled</Button>
                <Button icon={<Plus className="size-4" strokeWidth={1.5} />}>With icon</Button>
              </Row>
              <Row label="Icon only">
                <IconButton label="More"><MoreHorizontal className="size-4" strokeWidth={1.5} /></IconButton>
                <IconButton label="Delete" variant="secondary"><Trash2 className="size-4" strokeWidth={1.5} /></IconButton>
              </Row>
            </Section>

            <Section title="Badge and status" description="Subtle by default; only counts are solid.">
              <Row label="Tones">
                {TONES.map((t) => <Badge key={t} tone={t}>{t}</Badge>)}
              </Row>
              <Row label="With dot">
                {TONES.map((t) => <Badge key={t} tone={t} dot>{t}</Badge>)}
              </Row>
              <Row label="Count / dot">
                <CountBadge>12</CountBadge>
                {TONES.map((t) => <StatusDot key={t} tone={t} />)}
              </Row>
            </Section>

            <Section title="Avatar">
              <Row label="Sizes">
                <Avatar name="Maya Chen" size="sm" />
                <Avatar name="Maya Chen" size="md" />
                <Avatar name="Maya Chen" size="lg" />
              </Row>
              <Row label="Group">
                <AvatarGroup names={['Maya Chen', 'Daniel Osei', 'Priya Anand', 'Tom Rivera']} />
              </Row>
            </Section>

            <Section title="Form controls" description="All 32px tall, 6px radius, one focus treatment.">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Input" hint="Helper text sits below."><Input placeholder="Placeholder" /></Field>
                <Field label="Input with error" error="This field is required."><Input defaultValue="" /></Field>
                <Field label="Search"><SearchInput placeholder="Search accounts…" /></Field>
                <Field label="Select">
                  <Select
                    value={sel}
                    onValueChange={setSel}
                    options={[{ value: 'csm', label: 'CSM' }, { value: 'manager', label: 'Manager' }, { value: 'exec', label: 'Executive' }]}
                  />
                </Field>
                <Field label="Combobox">
                  <Combobox
                    value={combo}
                    onChange={setCombo}
                    options={ROWS.map((r) => ({ value: r.id === 'r1' ? 'acme' : r.id, label: r.account }))}
                  />
                </Field>
                <Field label="Textarea"><Textarea placeholder="Notes…" /></Field>
              </div>
              <Row label="Toggles">
                <Checkbox checked={checked} onCheckedChange={setChecked} label="Checkbox" />
                <Switch checked={on} onCheckedChange={setOn} label="Switch" />
              </Row>
              <Row label="Radio">
                <RadioGroup value={radio} onValueChange={setRadio} options={[{ value: 'a', label: 'Option A' }, { value: 'b', label: 'Option B' }]} />
              </Row>
              <Row label="Segmented">
                <SegmentedControl value={seg} onChange={setSeg} options={[{ value: 'all', label: 'All' }, { value: 'mine', label: 'My portfolio' }]} />
              </Row>
            </Section>

            <Section title="Overlays" description="Records open in a drawer; only blocking confirmations use a dialog.">
              <Row label="Triggers">
                <Button onClick={() => setDialog(true)}>Open dialog</Button>
                <Button onClick={() => setDrawer(true)}>Open drawer</Button>
                <Button onClick={() => setPalette(true)}>Command palette</Button>
                <Tooltip label="Tooltips explain icon-only controls"><Button>Hover me</Button></Tooltip>
                <Popover trigger={<Button>Popover</Button>}><p className="text-body-sm text-on-surface-muted">Popover content.</p></Popover>
                <DropdownMenu
                  trigger={<Button>Menu</Button>}
                  items={[
                    { label: 'Edit', onSelect: () => {} },
                    { label: 'Duplicate', onSelect: () => {} },
                    { label: 'Delete', danger: true, separatorBefore: true, onSelect: () => {} },
                  ]}
                />
              </Row>
            </Section>

            <Section title="Metrics and charts">
              <div className="grid gap-3 sm:grid-cols-3">
                <MetricCard label="Portfolio ARR" value="$4.2M" delta={6} />
                <MetricCard label="At-risk ARR" value="$612K" delta={12} invertDelta hint="3 accounts moved to red" />
                <MetricCard label="Open tickets" value="24" delta={-8} invertDelta />
              </div>
              <div className="mt-3">
                <ChartCard title="Health trend" description="Composite score, last 90 days">
                  <div className="flex h-24 items-end gap-1 px-2">
                    {[42, 48, 45, 52, 61, 58, 66, 71, 69, 74, 78, 81].map((v, i) => (
                      <div key={i} className="flex-1 rounded-sm bg-chart-1" style={{ height: `${v}%` }} />
                    ))}
                  </div>
                </ChartCard>
              </div>
            </Section>

            <Section title="DataTable" description="Sortable, selectable, sticky header, hover row actions.">
              <FilterBar
                className="mb-3"
                search=""
                onSearchChange={() => {}}
                searchPlaceholder="Search accounts…"
                chips={[{ id: 'health', label: 'Health', value: 'Red' }]}
                onRemove={() => {}}
                onAdd={() => {}}
                addOptions={[{ id: 'owner', label: 'Owner' }, { id: 'segment', label: 'Segment' }]}
                actions={<Button size="sm" icon={<Filter className="size-4" strokeWidth={1.5} />}>Save view</Button>}
              />
              <DataTable
                rows={ROWS}
                rowKey={(r) => r.id}
                selectable
                selected={selected}
                onSelectedChange={setSelected}
                rowActions={() => <IconButton label="More" size="sm"><MoreHorizontal className="size-4" strokeWidth={1.5} /></IconButton>}
                columns={[
                  { key: 'account', header: 'Account', sortValue: (r) => r.account, render: (r) => <span className="font-medium">{r.account}</span> },
                  { key: 'owner', header: 'Owner', render: (r) => <span className="inline-flex items-center gap-1.5"><Avatar name={r.owner} size="sm" />{r.owner}</span> },
                  { key: 'health', header: 'Health', render: (r) => <Badge tone={r.health} dot>{r.health}</Badge> },
                  { key: 'arr', header: 'ARR', align: 'right', sortValue: (r) => r.arr, render: (r) => `$${(r.arr / 1000).toFixed(0)}K` },
                ]}
              />
            </Section>

            <Section title="Panels and lists">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-border-default">
                  <CardHeader title="Key values" />
                  <CardBody>
                    <KeyValueList items={[
                      { label: 'Segment', value: 'Enterprise' },
                      { label: 'Renewal', value: 'Mar 14, 2026' },
                      { label: 'Owner', value: 'Maya Chen' },
                    ]} />
                  </CardBody>
                </div>
                <div className="rounded-lg border border-border-default p-4">
                  <Timeline items={[
                    { id: '1', title: 'Renewal forecast updated', meta: '2h ago', tone: 'success' },
                    { id: '2', title: 'Health dropped to red', meta: 'Yesterday', tone: 'danger', body: 'Data sync failing for 9 days.' },
                    { id: '3', title: 'QBR completed', meta: 'Last week' },
                  ]} />
                </div>
              </div>
            </Section>

            <Section title="Wizard and rules">
              <Stepper
                steps={[{ id: '1', label: 'Prepare' }, { id: '2', label: 'Build deck' }, { id: '3', label: 'Present' }, { id: '4', label: 'Wrap up' }]}
                current={step}
                onStepClick={setStep}
              />
              <div className="mt-4 space-y-2">
                <RuleRow keyword="When"><RuleValue>Health score</RuleValue><span className="text-body-sm text-on-surface-muted">drops below</span><RuleValue>60</RuleValue></RuleRow>
                <RuleRow keyword="If" onRemove={() => {}}><RuleValue>ARR</RuleValue><span className="text-body-sm text-on-surface-muted">is over</span><RuleValue>$100K</RuleValue></RuleRow>
                <RuleRow keyword="Then"><RuleValue>Create task</RuleValue><span className="text-body-sm text-on-surface-muted">for the account owner</span></RuleRow>
              </div>
              <StepperFooter
                left={<Button variant="ghost">Back</Button>}
                right={<><Button variant="secondary">Save draft</Button><Button variant="primary">Continue</Button></>}
              />
            </Section>

            <Section title="Composer">
              <RichTextEditor placeholder="Write a reply…" footer={<div className="flex justify-end gap-2"><Button size="sm" variant="ghost">Discard</Button><Button size="sm" variant="primary">Send</Button></div>} />
            </Section>

            <Section title="Empty, loading and error states" description="Every list, table and panel needs all three.">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-border-default">
                  <EmptyState
                    icon={<Inbox className="size-6" strokeWidth={1.5} />}
                    title="Inbox zero"
                    description="No conversations are waiting on you."
                    action={{ label: 'Compose', onClick: () => {} }}
                  />
                </div>
                <div className="rounded-lg border border-border-default">
                  <EmptyState
                    icon={<AlertTriangle className="size-6" strokeWidth={1.5} />}
                    title="Couldn't load risks"
                    description="The request failed. This is the error state."
                    action={{ label: 'Try again', onClick: () => {} }}
                  />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Skeleton className="h-3 w-48" />
                <Skeleton className="h-3 w-72" />
                <Skeleton className="h-3 w-32" />
              </div>
            </Section>
          </>
        )}
      </div>

      <Dialog
        open={dialog}
        onOpenChange={setDialog}
        title="Skip this task?"
        description="It stays on the goal, marked skipped with your reason."
        footer={<><Button variant="ghost" onClick={() => setDialog(false)}>Cancel</Button><Button variant="primary" onClick={() => setDialog(false)}>Skip task</Button></>}
      >
        <Field label="Reason"><Textarea placeholder="Why is this being skipped?" /></Field>
      </Dialog>

      <Drawer open={drawer} onOpenChange={setDrawer} title="Acme Analytics" description="Enterprise · $148K ARR">
        <PanelSection title="Attributes">
          <KeyValueList items={[{ label: 'Owner', value: 'Maya Chen' }, { label: 'Renewal', value: 'Mar 14, 2026' }]} />
        </PanelSection>
        <PanelSection title="Health">
          <div className="flex items-center gap-2"><Badge tone="danger" dot>Red — 38</Badge><span className="text-caption text-on-surface-subtle">down 12 this month</span></div>
        </PanelSection>
        <PanelSection title="Related" defaultOpen={false}>
          <p className="text-body-sm text-on-surface-muted">3 open risks, 1 expansion opportunity.</p>
        </PanelSection>
      </Drawer>

      <CommandPalette
        open={palette}
        onOpenChange={setPalette}
        items={[
          { id: '1', label: 'Dashboard', group: 'Navigate', icon: <Building2 className="size-4" strokeWidth={1.5} />, onSelect: () => {} },
          { id: '2', label: 'Customers', group: 'Navigate', icon: <Building2 className="size-4" strokeWidth={1.5} />, onSelect: () => {} },
          { id: '3', label: 'Create a goal', group: 'Actions', icon: <FileText className="size-4" strokeWidth={1.5} />, onSelect: () => {} },
        ]}
      />

      <ToastViewport toasts={toasts} onDismiss={(id) => setToasts((t) => t.filter((x) => x.id !== id))} />
    </div>
  );
}
