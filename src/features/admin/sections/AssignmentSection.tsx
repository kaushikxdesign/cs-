import React from 'react';
import { Plus } from 'lucide-react';
import { Button, Dialog, Field, Input, Select, Switch } from '@/design-system';
import { ASSIGNMENT_RULES, ASSIGNMENT_STRATEGIES } from '@/data/admin';
import { AdminTable, Cell, NameCell, NoRows, Row, SettingsGroup } from '../primitives';
import type { SectionProps } from './types';

/** Routing rules, evaluated top-down; the first match wins. */
export function AssignmentSection({ dispatch }: SectionProps) {
  const [rules, setRules] = React.useState<any[]>(ASSIGNMENT_RULES.ticket);
  const [showNew, setShowNew] = React.useState(false);

  return (
    <div className="space-y-5">
      <SettingsGroup
        flush
        title="Ticket assignment"
        description="Rules are evaluated top-down; the first match wins. Anything unmatched falls through to the default queue."
        actions={
          <Button
            size="sm"
            variant="secondary"
            icon={<Plus className="size-4" strokeWidth={1.75} />}
            onClick={() => setShowNew(true)}
          >
            New rule
          </Button>
        }
      >
        <AdminTable
          minWidth="860px"
          columns={['#', 'Rule', 'Matches when', 'Strategy', 'Assign to', 'Active']}
        >
          {rules.length === 0 ? (
            <NoRows colSpan={6} message="No assignment rules" />
          ) : (
            rules.map((r) => (
              <Row key={r.id} muted={!r.enabled}>
                <Cell className="tabular-nums text-on-surface-faint">{r.order}</Cell>
                <NameCell>{r.name}</NameCell>
                <Cell>{r.match}</Cell>
                <Cell>
                  <Select
                    value={
                      ASSIGNMENT_STRATEGIES.includes(r.strategy)
                        ? r.strategy
                        : ASSIGNMENT_STRATEGIES[0]
                    }
                    onValueChange={(v) =>
                      setRules((l) => l.map((x) => (x.id === r.id ? { ...x, strategy: v } : x)))
                    }
                    options={ASSIGNMENT_STRATEGIES.map((o: string) => ({ value: o, label: o }))}
                  />
                </Cell>
                <Cell className="font-medium text-on-surface">{r.target}</Cell>
                <Cell right>
                  <Switch
                    checked={r.enabled}
                    aria-label={`${r.name} enabled`}
                    onCheckedChange={(v) =>
                      setRules((l) => l.map((x) => (x.id === r.id ? { ...x, enabled: v } : x)))
                    }
                  />
                </Cell>
              </Row>
            ))
          )}
        </AdminTable>
      </SettingsGroup>

      <Dialog
        open={showNew}
        onOpenChange={setShowNew}
        title="New ticket assignment rule"
        description="New rules are appended to the end of the list, so they run last until you reorder them."
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowNew(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setShowNew(false);
                dispatch({
                  type: 'ADD_TOAST',
                  msg: 'Assignment rule created',
                  toastType: 'success',
                });
              }}
            >
              Create rule
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Field label="Rule name">
            <Input placeholder="e.g. EMEA enterprise to the senior pod" />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Strategy">
              <Select
                value={ASSIGNMENT_STRATEGIES[0]}
                onValueChange={() => {}}
                options={ASSIGNMENT_STRATEGIES.map((o: string) => ({ value: o, label: o }))}
              />
            </Field>
            <Field label="Assign to">
              <Input placeholder="Team, pod or agent" />
            </Field>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
