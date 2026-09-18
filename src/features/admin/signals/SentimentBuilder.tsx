import React from 'react';
import { X } from 'lucide-react';
import { Badge, Button, Input, Switch } from '@/design-system';
import { SettingRow, SettingsGroup } from '../primitives';
import type { BuilderProps } from './shared';

const SCORED = [
  ['Inbound email replies', true],
  ['Ticket conversations', true],
  ['Meeting transcripts', true],
  ['Community posts', true],
  ['Survey verbatims', false],
] as const;

/** Language-model scoring of threads, replies and meeting notes. */
export function SentimentBuilder(_props: BuilderProps) {
  const [scored, setScored] = React.useState<Record<string, boolean>>(
    Object.fromEntries(SCORED.map(([k, v]) => [k, v])),
  );
  const [thresholds, setThresholds] = React.useState({ neg: -0.3, pos: 0.3 });
  const [lexicon, setLexicon] = React.useState([
    'unacceptable', 'escalate', 'cancel', 'refund', 'frustrated', 'disappointed',
  ]);
  const [word, setWord] = React.useState('');

  function addWord() {
    const w = word.trim();
    if (!w || lexicon.includes(w)) return;
    setLexicon((l) => [...l, w]);
    setWord('');
  }

  return (
    <div className="space-y-5">
      <SettingsGroup
        title="What gets scored"
        description="Each source is scored independently, so turning one off does not re-weight the others."
      >
        {SCORED.map(([label]) => (
          <SettingRow
            key={label}
            label={label}
            control={
              <Switch
                checked={!!scored[label]}
                aria-label={label}
                onCheckedChange={(v) => setScored((s) => ({ ...s, [label]: v }))}
              />
            }
          />
        ))}
      </SettingsGroup>

      <SettingsGroup
        title="Score thresholds"
        description="Scores run from −1 to +1. Anything between the two thresholds is treated as neutral."
      >
        <div className="space-y-4 py-4">
          {/* The band between the two handles is the point of this control,
              so it is drawn rather than left to be inferred from two numbers. */}
          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-track">
            <span
              className="absolute inset-y-0 left-0 bg-band-risk"
              style={{ width: `${((thresholds.neg + 1) / 2) * 100}%` }}
            />
            <span
              className="absolute inset-y-0 right-0 bg-band-good"
              style={{ width: `${((1 - thresholds.pos) / 2) * 100}%` }}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {([
              ['Negative below', 'neg', 'text-danger-fg'],
              ['Positive above', 'pos', 'text-success-fg'],
            ] as const).map(([label, key, tone]) => (
              <div key={key}>
                <label className="text-caption font-medium text-on-surface-muted">{label}</label>
                <div className="mt-1.5 flex items-center gap-3">
                  <input
                    type="range"
                    min={-1}
                    max={1}
                    step={0.05}
                    value={thresholds[key]}
                    aria-label={label}
                    onChange={(e) =>
                      setThresholds((t) => ({ ...t, [key]: Number(e.target.value) }))
                    }
                    className="flex-1 accent-[var(--accent)]"
                  />
                  <span className={`w-12 text-right text-body-sm font-semibold tabular-nums ${tone}`}>
                    {thresholds[key].toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SettingsGroup>

      <SettingsGroup
        title="Escalation lexicon"
        description="Any message containing these terms is scored negative regardless of the model output."
      >
        <div className="space-y-3 py-3.5">
          <div className="flex flex-wrap gap-1.5">
            {lexicon.map((w) => (
              <Badge key={w} tone="danger" raw className="gap-1 pr-1">
                {w}
                <button
                  onClick={() => setLexicon((l) => l.filter((x) => x !== w))}
                  aria-label={`Remove ${w}`}
                  className="rounded p-0.5 opacity-60 transition-opacity hover:opacity-100"
                >
                  <X className="size-3" strokeWidth={2} />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              className="max-w-xs"
              value={word}
              placeholder="Add a term…"
              onChange={(e) => setWord(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addWord();
              }}
            />
            <Button variant="secondary" disabled={!word.trim()} onClick={addWord}>
              Add
            </Button>
          </div>
        </div>
      </SettingsGroup>
    </div>
  );
}
