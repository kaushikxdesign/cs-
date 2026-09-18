import React from 'react';
import { cn } from '@/lib/cn';
import { Button, Field, Input, Select } from '@/design-system';
import { NPS_SEGMENTS, NPS_SNIPPET } from '@/data/admin';
import { CodeBlock, SettingsGroup } from '../primitives';
import { BuilderSplit, BuilderTabs, type BuilderProps } from './shared';

/** The 0–10 row, sized so detractor / passive / promoter reads at a glance. */
function Scale() {
  return (
    <div className="flex flex-wrap gap-1">
      {Array.from({ length: 11 }, (_, n) => (
        <span
          key={n}
          className={cn(
            'flex size-6 items-center justify-center rounded border text-caption font-medium tabular-nums',
            n < 7
              ? 'border-band-risk/40 text-band-risk'
              : n < 9
                ? 'border-band-watch/40 text-band-watch'
                : 'border-band-good/40 text-band-good',
          )}
        >
          {n}
        </span>
      ))}
    </div>
  );
}

export function NpsBuilder({ dispatch }: BuilderProps) {
  const [mode, setMode] = React.useState('widget');
  const [question, setQuestion] = React.useState(
    'How likely are you to recommend us to a colleague?',
  );
  const [followUp, setFollowUp] = React.useState('What is the main reason for your score?');
  const [segment, setSegment] = React.useState(NPS_SEGMENTS[0]);
  const [frequency, setFrequency] = React.useState('90');
  const [position, setPosition] = React.useState('bottom-right');

  return (
    <div className="space-y-5">
      <BuilderTabs
        value={mode}
        onChange={setMode}
        items={[
          { value: 'widget', label: 'In-app widget' },
          { value: 'form', label: 'Canned form' },
        ]}
      />

      <BuilderSplit
        aside={
          <SettingsGroup title={mode === 'widget' ? 'Widget preview' : 'Form preview'}>
            <div className="py-3.5">
              <div
                className={cn(
                  'rounded-xl border border-border-default bg-surface p-3.5',
                  mode === 'widget' && 'shadow-lg',
                )}
              >
                <p className="mb-2.5 text-body-sm font-medium text-on-surface">{question}</p>
                <Scale />
                <div className="mt-1.5 flex justify-between text-caption text-on-surface-faint">
                  <span>Not likely</span>
                  <span>Very likely</span>
                </div>
                <p className="mt-3.5 text-body-sm text-on-surface-muted">{followUp}</p>
                <div className="mt-1.5 h-10 rounded-lg border border-border-default bg-subtle" />
                <Button variant="solid" size="sm" className="mt-3 w-full justify-center">
                  Submit
                </Button>
              </div>
              <p className="mt-2 text-caption text-on-surface-subtle">
                {mode === 'widget'
                  ? `Appears ${position} to ${segment.toLowerCase()}`
                  : `Sent to ${segment.toLowerCase()}`}
              </p>
            </div>
          </SettingsGroup>
        }
      >
        <SettingsGroup title="Questions">
          <div className="space-y-3 py-3.5">
            <Field label="NPS question">
              <Input value={question} onChange={(e) => setQuestion(e.target.value)} />
            </Field>
            <Field label="Follow-up, shown after a score">
              <Input value={followUp} onChange={(e) => setFollowUp(e.target.value)} />
            </Field>
          </div>
        </SettingsGroup>

        <SettingsGroup title={mode === 'widget' ? 'Targeting and display' : 'Delivery'}>
          <div className="grid gap-3 py-3.5 sm:grid-cols-2">
            <Field label="Audience">
              <Select
                value={segment}
                onValueChange={setSegment}
                options={NPS_SEGMENTS.map((o: string) => ({ value: o, label: o }))}
              />
            </Field>
            <Field label="Re-prompt after">
              <Select
                value={frequency}
                onValueChange={setFrequency}
                options={['30', '60', '90', '180', '365'].map((o) => ({ value: o, label: `${o} days` }))}
              />
            </Field>
            {mode === 'widget' ? (
              <Field label="Position">
                <Select
                  value={position}
                  onValueChange={setPosition}
                  options={['bottom-right', 'bottom-left', 'centre modal', 'top banner'].map((o) => ({
                    value: o,
                    label: o,
                  }))}
                />
              </Field>
            ) : (
              <Field label="Send via">
                <Select
                  value="Email"
                  onValueChange={() => {}}
                  options={['Email', 'In-product message', 'Shareable link'].map((o) => ({
                    value: o,
                    label: o,
                  }))}
                />
              </Field>
            )}
          </div>
        </SettingsGroup>

        {mode === 'widget' ? (
          <SettingsGroup title="Install">
            <div className="space-y-2 py-3.5">
              <CodeBlock
                label="Widget code — paste into your app shell"
                code={NPS_SNIPPET}
                onCopy={() =>
                  dispatch({ type: 'ADD_TOAST', msg: 'Snippet copied to clipboard', toastType: 'success' })
                }
              />
              <p className="text-caption text-on-surface-subtle">
                The widget respects the re-prompt window per user, so a customer is never asked
                twice inside {frequency} days.
              </p>
            </div>
          </SettingsGroup>
        ) : (
          <SettingsGroup title="Shareable form">
            <div className="space-y-3 py-3.5">
              <div className="flex gap-2">
                <Input readOnly className="flex-1 font-mono" value="https://cx-42.com/s/nps/q3-2025" />
                <Button
                  variant="secondary"
                  onClick={() =>
                    dispatch({ type: 'ADD_TOAST', msg: 'Form link copied', toastType: 'success' })
                  }
                >
                  Copy link
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  onClick={() =>
                    dispatch({
                      type: 'ADD_TOAST',
                      msg: `NPS form queued to ${segment.toLowerCase()}`,
                      toastType: 'success',
                    })
                  }
                >
                  Send now
                </Button>
                <Button
                  variant="secondary"
                  onClick={() =>
                    dispatch({ type: 'ADD_TOAST', msg: 'Send scheduled', toastType: 'info' })
                  }
                >
                  Schedule
                </Button>
              </div>
            </div>
          </SettingsGroup>
        )}
      </BuilderSplit>
    </div>
  );
}
