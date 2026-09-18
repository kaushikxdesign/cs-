import React from 'react';
import { Plus } from 'lucide-react';
import { Badge, Button, Dialog, Field, Input, SearchInput, Select, Switch } from '@/design-system';
import { ADMIN_ENTITIES, ADMIN_FIELDS } from '@/data/admin';
import {
  AdminTable, Cell, NameCell, NavTile, NoRows, Row, SettingsGroup, toneOf,
} from '../primitives';
import type { SectionProps } from './types';

const TYPES = [
  'Text', 'Long text', 'Number', 'Percent', 'Currency', 'Date', 'DateTime', 'Dropdown',
  'Checkbox', 'Lookup', 'Email', 'URL', 'Duration',
];

/** The attribute catalogue for every object in the product. */
export function FieldManagerSection({ dispatch, focus, onFocus }: SectionProps) {
  const [q, setQ] = React.useState('');
  const [showNew, setShowNew] = React.useState(false);
  const [disabled, setDisabled] = React.useState<Record<string, boolean>>({});

  const entity = ADMIN_ENTITIES.find((e: any) => e.id === focus);

  if (!entity) {
    return (
      <div className="space-y-4">
        <p className="max-w-prose text-body-sm leading-relaxed text-on-surface-muted">
          Define the attributes available on each object. System fields are read-only; custom
          fields can be edited, reordered or retired.
        </p>
        <div className="grid gap-3 lg:grid-cols-2">
          {ADMIN_ENTITIES.map((e: any) => {
            const fields = (ADMIN_FIELDS as any)[e.id] ?? [];
            return (
              <NavTile
                key={e.id}
                icon={e.icon}
                title={e.label}
                description={e.desc}
                tone={toneOf(e.tone)}
                onClick={() => {
                  setQ('');
                  onFocus(e.id);
                }}
                meta={
                  <>
                    <Badge tone="neutral">{fields.length} fields</Badge>
                    <Badge tone="info">
                      {fields.filter((f: any) => !f.system).length} custom
                    </Badge>
                  </>
                }
              />
            );
          })}
        </div>
      </div>
    );
  }

  const fields = (ADMIN_FIELDS as any)[entity.id] ?? [];
  const shown = fields.filter(
    (f: any) =>
      !q ||
      f.label.toLowerCase().includes(q.toLowerCase()) ||
      f.key.includes(q.toLowerCase()),
  );

  return (
    <div className="space-y-5">
      <SettingsGroup
        flush
        title={entity.label}
        description={entity.desc}
        actions={
          <>
            <div className="w-56">
              <SearchInput
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search fields…"
              />
            </div>
            <Button
              size="sm"
              variant="secondary"
              icon={<Plus className="size-4" strokeWidth={1.75} />}
              onClick={() => setShowNew(true)}
            >
              New field
            </Button>
          </>
        }
      >
        <AdminTable
          minWidth="880px"
          columns={['Label', 'API name', 'Type', 'Required', 'Origin', 'Used in', 'Active']}
        >
          {shown.length === 0 ? (
            <NoRows colSpan={7} message="No fields match that search" />
          ) : (
            shown.map((f: any) => {
              const active = disabled[f.key] === undefined ? true : disabled[f.key];
              return (
                <Row key={f.key}>
                  <NameCell>{f.label}</NameCell>
                  <Cell mono>{f.key}</Cell>
                  <Cell>
                    <Badge tone="neutral">{f.type}</Badge>
                  </Cell>
                  <Cell>
                    {f.req ? (
                      <Badge tone="warning">Required</Badge>
                    ) : (
                      <span className="text-on-surface-faint">Optional</span>
                    )}
                  </Cell>
                  <Cell>
                    <Badge tone={f.system ? 'info' : 'accent'}>
                      {f.system ? 'System' : 'Custom'}
                    </Badge>
                  </Cell>
                  <Cell>{f.usage}</Cell>
                  <Cell right>
                    {f.system ? (
                      <span className="text-caption text-on-surface-faint">Locked</span>
                    ) : (
                      <Switch
                        checked={active}
                        aria-label={`${f.label} active`}
                        onCheckedChange={(v) => {
                          setDisabled((o) => ({ ...o, [f.key]: v }));
                          dispatch({
                            type: 'ADD_TOAST',
                            msg: `${f.label} ${v ? 'enabled' : 'disabled'}`,
                            toastType: 'info',
                          });
                        }}
                      />
                    )}
                  </Cell>
                </Row>
              );
            })
          )}
        </AdminTable>
      </SettingsGroup>

      <Dialog
        open={showNew}
        onOpenChange={setShowNew}
        title={`New ${entity.label.replace(' fields', '').toLowerCase()} field`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowNew(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setShowNew(false);
                dispatch({ type: 'ADD_TOAST', msg: 'Field created', toastType: 'success' });
              }}
            >
              Create field
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Field label="Field label">
            <Input placeholder="e.g. Onboarding stage" />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Type">
              <Select
                value={TYPES[0]}
                onValueChange={() => {}}
                options={TYPES.map((t) => ({ value: t, label: t }))}
              />
            </Field>
            <Field label="Required">
              <Select
                value="Optional"
                onValueChange={() => {}}
                options={[
                  { value: 'Optional', label: 'Optional' },
                  { value: 'Required', label: 'Required' },
                ]}
              />
            </Field>
          </div>
          <Field label="Help text" hint="Shown beneath the field wherever it is edited.">
            <Input placeholder="Shown beneath the field" />
          </Field>
        </div>
      </Dialog>
    </div>
  );
}
