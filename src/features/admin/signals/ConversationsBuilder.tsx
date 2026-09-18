import React from 'react';
import { ArrowRight, Upload } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Badge, Button } from '@/design-system';
import { CONVO_MAPPING, CONVO_PARSERS } from '@/data/admin';
import { AdminTable, Cell, NameCell, NoRows, Row, SettingsGroup } from '../primitives';
import type { BuilderProps } from './shared';

const SEED = [
  { id: 'f1', name: 'acme-weekly-sync-aug14.vtt', size: '42 KB', lines: 186, status: 'parsed', matched: 'Acme Analytics' },
  { id: 'f2', name: 'globex-renewal-call.srt', size: '31 KB', lines: 142, status: 'parsed', matched: 'Globex Cloud' },
  { id: 'f3', name: 'unknown-call-0812.txt', size: '18 KB', lines: 74, status: 'unmatched', matched: null },
];

/** Transcript import: read conversations from a file, match to an account. */
export function ConversationsBuilder({ dispatch }: BuilderProps) {
  const [parser, setParser] = React.useState('vtt');
  const [dragOver, setDragOver] = React.useState(false);
  const [files, setFiles] = React.useState<any[]>(SEED);

  function drop() {
    const n = files.length + 1;
    setFiles((l) => [
      { id: 'f_new' + n, name: `transcript-${n}.vtt`, size: '26 KB', lines: 96, status: 'parsed', matched: 'Acme Analytics' },
      ...l,
    ]);
    dispatch({
      type: 'ADD_TOAST',
      msg: 'Transcript parsed and attached to the account timeline',
      toastType: 'success',
    });
  }

  return (
    <div className="space-y-5">
      <SettingsGroup
        title="Read transcripts from a file"
        description="Accounts are matched on the attendee email domain, so a transcript lands on the right timeline without being filed by hand."
      >
        <div className="space-y-3 py-3.5">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {CONVO_PARSERS.map((p: any) => (
              <button
                key={p.id}
                onClick={() => setParser(p.id)}
                aria-pressed={parser === p.id}
                className={cn(
                  'rounded-lg border p-2.5 text-left transition-colors duration-[120ms]',
                  parser === p.id
                    ? 'border-accent bg-accent-subtle'
                    : 'border-border-default hover:border-border-strong hover:bg-hover',
                )}
              >
                <p className="text-body-sm font-medium text-on-surface">{p.label}</p>
                <p className="mt-0.5 text-caption leading-snug text-on-surface-subtle">{p.note}</p>
              </button>
            ))}
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              drop();
            }}
            onClick={drop}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                drop();
              }
            }}
            className={cn(
              'cursor-pointer rounded-xl border border-dashed px-6 py-8 text-center transition-colors duration-[120ms]',
              dragOver
                ? 'border-accent bg-accent-subtle'
                : 'border-border-strong hover:border-accent hover:bg-hover',
            )}
          >
            <span className="mx-auto mb-2 flex size-10 items-center justify-center rounded-xl bg-accent-subtle text-accent">
              <Upload className="size-5" strokeWidth={1.5} />
            </span>
            <p className="text-body-sm font-medium text-on-surface">Drop transcript files here</p>
            <p className="mt-1 text-caption text-on-surface-subtle">
              Bulk upload supported · accounts matched on attendee email domain
            </p>
          </div>
        </div>
      </SettingsGroup>

      <SettingsGroup title="Field mapping">
        <div className="py-1">
          {CONVO_MAPPING.map((m: any) => (
            <div
              key={m.field}
              className="flex items-center gap-3 border-b border-border-default py-2.5 last:border-0"
            >
              <span className="w-24 shrink-0 text-body-sm font-medium text-on-surface">
                {m.field}
              </span>
              <ArrowRight className="size-3.5 shrink-0 text-on-surface-faint" strokeWidth={1.75} />
              <span className="min-w-0 flex-1 truncate font-mono text-caption text-on-surface-muted">
                {m.from}
              </span>
            </div>
          ))}
        </div>
      </SettingsGroup>

      <SettingsGroup flush title="Imported transcripts">
        <AdminTable columns={['File', 'Size', 'Lines', 'Matched account', 'Status', '']}>
          {files.length === 0 ? (
            <NoRows colSpan={6} message="No transcripts imported" />
          ) : (
            files.map((f) => (
              <Row key={f.id}>
                <NameCell sub={f.matched ?? undefined}>
                  <span className="font-mono text-caption">{f.name}</span>
                </NameCell>
                <Cell>{f.size}</Cell>
                <Cell className="tabular-nums">{f.lines}</Cell>
                <Cell>
                  {f.matched ? (
                    <span className="text-on-surface">{f.matched}</span>
                  ) : (
                    <span className="text-warning-fg">Needs matching</span>
                  )}
                </Cell>
                <Cell>
                  <Badge tone={f.status === 'parsed' ? 'success' : 'warning'} dot>
                    {f.status}
                  </Badge>
                </Cell>
                <Cell right>
                  {!f.matched && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="mr-2"
                      onClick={() => {
                        setFiles((l) =>
                          l.map((x) =>
                            x.id === f.id ? { ...x, matched: 'Acme Analytics', status: 'parsed' } : x,
                          ),
                        );
                        dispatch({
                          type: 'ADD_TOAST',
                          msg: 'Transcript matched to an account',
                          toastType: 'success',
                        });
                      }}
                    >
                      Match
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setFiles((l) => l.filter((x) => x.id !== f.id))}
                  >
                    Remove
                  </Button>
                </Cell>
              </Row>
            ))
          )}
        </AdminTable>
      </SettingsGroup>
    </div>
  );
}
