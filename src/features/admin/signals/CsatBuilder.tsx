import React from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button, Checkbox, Field, IconButton, Input, Select, Tooltip } from '@/design-system';
import { DEFAULT_CSAT_SURVEY, SURVEY_QUESTION_TYPES, SURVEY_TRIGGERS } from '@/data/admin';
import { SettingsGroup } from '../primitives';
import { BuilderSplit, type BuilderProps } from './shared';

/**
 * What the customer will actually see. Rendered from the same question list
 * the editor writes to, so the preview cannot drift from the survey.
 */
function QuestionPreview({ q }: { q: any }) {
  if (q.type === 'rating5') {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            className="flex size-8 items-center justify-center rounded-lg border border-border-default text-caption text-on-surface-muted"
          >
            {n}
          </span>
        ))}
      </div>
    );
  }
  if (q.type === 'scale10' || q.type === 'nps') {
    return (
      <div className="flex flex-wrap gap-1">
        {Array.from({ length: 11 }, (_, n) => (
          <span
            key={n}
            className={cn(
              'flex size-6 items-center justify-center rounded border text-caption tabular-nums',
              q.type === 'nps'
                ? n < 7
                  ? 'border-band-risk/40 text-band-risk'
                  : n < 9
                    ? 'border-band-watch/40 text-band-watch'
                    : 'border-band-good/40 text-band-good'
                : 'border-border-default text-on-surface-muted',
            )}
          >
            {n}
          </span>
        ))}
      </div>
    );
  }
  if (q.type === 'thumbs') {
    return (
      <div className="flex gap-2">
        {['Yes', 'No'].map((x) => (
          <span
            key={x}
            className="flex h-9 items-center rounded-lg border border-border-default px-3 text-caption text-on-surface-muted"
          >
            {x}
          </span>
        ))}
      </div>
    );
  }
  if (q.type === 'choice') {
    return (
      <div className="space-y-1.5">
        {q.options.map((o: string, i: number) => (
          <div key={i} className="flex items-center gap-2 text-caption text-on-surface-muted">
            <span className="size-3 rounded-full border border-border-strong" />
            {o}
          </div>
        ))}
      </div>
    );
  }
  return <div className="h-14 rounded-lg border border-border-default bg-subtle" />;
}

export function CsatBuilder({ dispatch }: BuilderProps) {
  const [qs, setQs] = React.useState<any[]>(DEFAULT_CSAT_SURVEY);
  const [trigger, setTrigger] = React.useState(SURVEY_TRIGGERS[0]);
  const [title, setTitle] = React.useState('How did we do?');
  const [thanks, setThanks] = React.useState(
    'Thank you — your feedback goes straight to the team that handled this.',
  );
  const [sel, setSel] = React.useState<string | null>(null);

  const upd = (id: string, patch: any) =>
    setQs((l) => l.map((q) => (q.id === id ? { ...q, ...patch } : q)));

  function add(type: string) {
    const t = SURVEY_QUESTION_TYPES.find((x: any) => x.id === type);
    setQs((l) => [
      ...l,
      {
        id: 'q_new' + (l.length + 1),
        type,
        title: `Untitled ${String(t?.label ?? '').toLowerCase()} question`,
        required: false,
        options: type === 'choice' ? ['Option 1', 'Option 2'] : [],
      },
    ]);
  }

  function move(i: number, d: number) {
    setQs((l) => {
      const n = l.slice();
      const j = i + d;
      if (j < 0 || j >= n.length) return n;
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });
  }

  return (
    <BuilderSplit
      aside={
        <SettingsGroup title="Live preview">
          <div className="py-3.5">
            <div className="rounded-xl border border-border-default bg-surface p-4">
              <p className="mb-3.5 text-body font-semibold text-on-surface">{title}</p>
              <div className="space-y-4">
                {qs.map((q) => (
                  <div key={q.id}>
                    <p className="mb-1.5 text-body-sm text-on-surface">
                      {q.title}
                      {q.required && <span className="text-danger-fg"> *</span>}
                    </p>
                    <QuestionPreview q={q} />
                  </div>
                ))}
              </div>
              <Button variant="solid" size="sm" className="mt-4 w-full justify-center">
                Submit
              </Button>
              <p className="mt-2 text-center text-caption text-on-surface-subtle">{thanks}</p>
            </div>
            <Button
              variant="primary"
              className="mt-3 w-full justify-center"
              onClick={() =>
                dispatch({
                  type: 'ADD_TOAST',
                  msg: `Survey published — sends ${trigger.toLowerCase()}`,
                  toastType: 'success',
                })
              }
            >
              Publish survey
            </Button>
          </div>
        </SettingsGroup>
      }
    >
      <SettingsGroup title="Survey">
        <div className="space-y-3 py-3.5">
          <Field label="Title">
            <Input
              className="font-medium"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Send when">
              <Select
                value={trigger}
                onValueChange={setTrigger}
                options={SURVEY_TRIGGERS.map((o: string) => ({ value: o, label: o }))}
              />
            </Field>
            <Field label="Thank-you message">
              <Input value={thanks} onChange={(e) => setThanks(e.target.value)} />
            </Field>
          </div>
        </div>
      </SettingsGroup>

      <SettingsGroup
        title="Questions"
        description={`${qs.length} question${qs.length === 1 ? '' : 's'} in this survey.`}
      >
        <div className="space-y-2 py-3.5">
          {qs.map((q, i) => {
            const meta =
              SURVEY_QUESTION_TYPES.find((x: any) => x.id === q.type) ?? SURVEY_QUESTION_TYPES[0];
            const Icon = meta.icon;
            const open = sel === q.id;
            return (
              <div
                key={q.id}
                className={cn(
                  'rounded-lg border transition-colors duration-[120ms]',
                  open ? 'border-accent bg-accent-subtle/30' : 'border-border-default',
                )}
              >
                <div className="flex items-center gap-2.5 px-3 py-2">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-subtle text-on-surface-muted">
                    {Icon && <Icon className="size-3.5" strokeWidth={1.75} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-body-sm font-medium text-on-surface">{q.title}</p>
                    <p className="text-caption text-on-surface-subtle">
                      {meta.label}
                      {q.required && ' · required'}
                    </p>
                  </div>
                  <Tooltip label="Move up" side="top">
                    <IconButton label="Move up" size="sm" disabled={i === 0} onClick={() => move(i, -1)}>
                      <ChevronUp className="size-4" strokeWidth={1.75} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip label="Move down" side="top">
                    <IconButton
                      label="Move down"
                      size="sm"
                      disabled={i === qs.length - 1}
                      onClick={() => move(i, 1)}
                    >
                      <ChevronDown className="size-4" strokeWidth={1.75} />
                    </IconButton>
                  </Tooltip>
                  <Button size="sm" variant="ghost" onClick={() => setSel(open ? null : q.id)}>
                    {open ? 'Done' : 'Edit'}
                  </Button>
                  <Tooltip label="Delete question" side="top">
                    <IconButton
                      label="Delete question"
                      size="sm"
                      onClick={() => setQs((l) => l.filter((x) => x.id !== q.id))}
                    >
                      <Trash2 className="size-4" strokeWidth={1.75} />
                    </IconButton>
                  </Tooltip>
                </div>

                {open && (
                  <div className="space-y-2.5 border-t border-border-default px-3 pb-3 pt-2.5">
                    <Input value={q.title} onChange={(e) => upd(q.id, { title: e.target.value })} />
                    <div className="flex flex-wrap items-center gap-3">
                      <Select
                        value={q.type}
                        onValueChange={(v) =>
                          upd(q.id, {
                            type: v,
                            options:
                              v === 'choice'
                                ? q.options.length
                                  ? q.options
                                  : ['Option 1', 'Option 2']
                                : [],
                          })
                        }
                        options={SURVEY_QUESTION_TYPES.map((x: any) => ({
                          value: x.id,
                          label: x.label,
                        }))}
                      />
                      <Checkbox
                        checked={q.required}
                        onCheckedChange={(v) => upd(q.id, { required: v })}
                        label="Required"
                      />
                    </div>
                    {q.type === 'choice' && (
                      <div className="space-y-1.5">
                        {q.options.map((o: string, oi: number) => (
                          <div key={oi} className="flex gap-2">
                            <Input
                              className="flex-1"
                              value={o}
                              onChange={(e) =>
                                upd(q.id, {
                                  options: q.options.map((x: string, j: number) =>
                                    j === oi ? e.target.value : x,
                                  ),
                                })
                              }
                            />
                            <IconButton
                              label="Remove option"
                              size="sm"
                              onClick={() =>
                                upd(q.id, {
                                  options: q.options.filter((_: string, j: number) => j !== oi),
                                })
                              }
                            >
                              <Trash2 className="size-4" strokeWidth={1.75} />
                            </IconButton>
                          </div>
                        ))}
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={<Plus className="size-4" strokeWidth={1.75} />}
                          onClick={() => upd(q.id, { options: [...q.options, 'New option'] })}
                        >
                          Add option
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          <div className="border-t border-border-default pt-3">
            <p className="mb-2 text-caption font-medium text-on-surface-muted">Add a question</p>
            <div className="flex flex-wrap gap-1.5">
              {SURVEY_QUESTION_TYPES.map((x: any) => {
                const Icon = x.icon;
                return (
                  <Button key={x.id} size="sm" variant="secondary" onClick={() => add(x.id)}>
                    {Icon && <Icon className="size-3.5" strokeWidth={1.75} />}
                    {x.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </SettingsGroup>
    </BuilderSplit>
  );
}
