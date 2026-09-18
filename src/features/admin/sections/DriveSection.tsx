import React from 'react';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Badge, Button, MetricCard, MetricRow } from '@/design-system';
import { DRIVE_TEMPLATES } from '@/data/admin';
import { AdminTable, Cell, NameCell, NoRows, Row, SettingsGroup } from '../primitives';
import { BuilderTabs } from '../signals';
import type { SectionProps } from './types';

const FMT_TONE: Record<string, 'warning' | 'info' | 'success' | 'neutral'> = {
  PPTX: 'warning',
  DOCX: 'info',
  XLSX: 'success',
};

/** QBR decks, goal templates and SOPs, versioned centrally. */
export function DriveSection({ dispatch }: SectionProps) {
  const [kind, setKind] = React.useState('all');
  const [dragOver, setDragOver] = React.useState(false);
  const [uploads, setUploads] = React.useState<any[]>([]);

  const all = [...uploads, ...DRIVE_TEMPLATES];
  const shown = kind === 'all' ? all : all.filter((t) => t.kind === kind);

  function simulateUpload() {
    const n = uploads.length + 1;
    setUploads((u) => [
      {
        id: 'up' + n, name: `Untitled template ${n}`, kind: 'QBR', fmt: 'PPTX', size: '1.0 MB',
        owner: 'Maya Chen', updated: 'Just now', uses: 0, status: 'draft',
      },
      ...u,
    ]);
    dispatch({ type: 'ADD_TOAST', msg: 'Template uploaded to Sia Drive', toastType: 'success' });
  }

  return (
    <div className="space-y-5">
      <MetricRow>
        <MetricCard label="Templates" value={all.length} hint="in the library" />
        <MetricCard
          label="Published"
          value={all.filter((t) => t.status === 'published').length}
          hint="available to every CSM"
        />
        <MetricCard
          label="Drafts"
          value={all.filter((t) => t.status === 'draft').length}
          hint="not yet shared"
        />
        <MetricCard
          label="Total uses"
          value={all.reduce((n, t) => n + t.uses, 0)}
          hint="lifetime"
        />
      </MetricRow>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          simulateUpload();
        }}
        onClick={simulateUpload}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            simulateUpload();
          }
        }}
        className={cn(
          'cursor-pointer rounded-xl border border-dashed px-6 py-8 text-center transition-colors duration-[120ms]',
          dragOver
            ? 'border-accent bg-accent-subtle'
            : 'border-border-strong bg-surface hover:border-accent hover:bg-hover',
        )}
      >
        <span className="mx-auto mb-2 flex size-10 items-center justify-center rounded-xl bg-accent-subtle text-accent">
          <Upload className="size-5" strokeWidth={1.5} />
        </span>
        <p className="text-body-sm font-medium text-on-surface">
          Drop QBR, Goal or SOP files here
        </p>
        <p className="mt-1 text-caption text-on-surface-subtle">
          PPTX, DOCX, XLSX or PDF · up to 25 MB · versioned automatically
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <BuilderTabs
          value={kind}
          onChange={setKind}
          items={[
            { value: 'all', label: 'All templates', count: all.length },
            ...['QBR', 'Goal', 'SOP'].map((k) => ({
              value: k,
              label: k,
              count: all.filter((t) => t.kind === k).length,
            })),
          ]}
        />
        <Button
          size="sm"
          variant="secondary"
          icon={<Upload className="size-4" strokeWidth={1.75} />}
          onClick={simulateUpload}
        >
          Upload template
        </Button>
      </div>

      <SettingsGroup flush>
        <AdminTable
          minWidth="900px"
          columns={['Template', 'Type', 'Format', 'Size', 'Owner', 'Updated', 'Used', 'Status', '']}
        >
          {shown.length === 0 ? (
            <NoRows colSpan={9} message="No templates of this kind" />
          ) : (
            shown.map((t) => (
              <Row key={t.id}>
                <NameCell sub={t.owner}>{t.name}</NameCell>
                <Cell>
                  <Badge tone="neutral">{t.kind}</Badge>
                </Cell>
                <Cell>
                  <Badge tone={FMT_TONE[t.fmt] ?? 'neutral'}>{t.fmt}</Badge>
                </Cell>
                <Cell className="tabular-nums">{t.size}</Cell>
                <Cell>{t.owner}</Cell>
                <Cell>{t.updated}</Cell>
                <Cell className="tabular-nums">{t.uses}</Cell>
                <Cell>
                  <Badge tone={t.status === 'published' ? 'success' : 'warning'} dot>
                    {t.status}
                  </Badge>
                </Cell>
                <Cell right>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      dispatch({ type: 'ADD_TOAST', msg: `Downloading ${t.name}`, toastType: 'info' })
                    }
                  >
                    Download
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      dispatch({ type: 'ADD_TOAST', msg: 'Opening version history', toastType: 'info' })
                    }
                  >
                    Versions
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
