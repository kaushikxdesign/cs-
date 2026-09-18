import React from 'react';
import { FileText, FolderOpen, Presentation, Target, type LucideIcon } from 'lucide-react';
import { useNavigate } from '@/router';
import {
  Avatar, Badge, Button, DataTable, EmptyState, FilterBar, PageHeader, PrimaryCell, SegmentedControl, type Column,
} from '@/design-system';
import { DRIVE_FILES, DRIVE_KINDS } from '@/data/drive';
import { titleCase } from '@/lib/format';

interface DriveFile {
  id: string; name: string; kind: string; fmt: string; size: string;
  owner: string; updated: string; uses: number; status: string;
}

/** Icon per file kind — the data carries emoji, which never reach the UI. */
const KIND_ICON: Record<string, LucideIcon> = {
  qbr: Presentation,
  goal: Target,
  plan: FileText,
};

export function DrivePage() {
  const navigate = useNavigate();
  const [kind, setKind] = React.useState<string>('all');
  const [search, setSearch] = React.useState('');

  const kinds = React.useMemo(
    () => [{ value: 'all', label: 'All' }, ...(DRIVE_KINDS as any[]).map((k: any) => ({
      value: k.id ?? k.key ?? String(k),
      label: titleCase(k.label ?? k.id ?? String(k)),
    }))],
    [],
  );

  const rows = React.useMemo(() => {
    const needle = search.trim().toLowerCase();
    return (DRIVE_FILES as DriveFile[]).filter((f) => {
      if (kind !== 'all' && f.kind !== kind) return false;
      if (!needle) return true;
      return f.name.toLowerCase().includes(needle) || f.owner.toLowerCase().includes(needle);
    });
  }, [kind, search]);

  const columns: Column<DriveFile>[] = [
    {
      key: 'name',
      header: 'File',
      width: '32%',
      sortValue: (f) => f.name,
      render: (f) => {
        const Icon = KIND_ICON[f.kind] ?? FileText;
        return (
          <PrimaryCell
            icon={<Icon className="size-4 shrink-0 text-on-surface-faint" strokeWidth={1.75} />}
            sub={`${f.fmt} · ${f.size}`}
          >
            {f.name}
          </PrimaryCell>
        );
      },
    },
    { key: 'kind', header: 'Type', sortValue: (f) => f.kind, render: (f) => titleCase(f.kind) },
    {
      key: 'owner',
      header: 'Owner',
      sortValue: (f) => f.owner,
      render: (f) => (
        <span className="flex items-center gap-2">
          <Avatar name={f.owner} size="sm" />
          {f.owner}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortValue: (f) => f.status,
      render: (f) => (
        <Badge tone={f.status === 'published' ? 'success' : 'neutral'}>{f.status}</Badge>
      ),
    },
    { key: 'updated', header: 'Updated', sortValue: (f) => f.updated, render: (f) => f.updated },
    {
      key: 'uses',
      header: 'Uses',
      align: 'right',
      sortValue: (f) => f.uses,
      render: (f) => f.uses,
    },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader
        title="CX42 Drive"
        meta={<span>{rows.length} templates and documents</span>}
        actions={
          <Button variant="solid" size="sm" onClick={() => navigate('/qbrs')}>
            New from template
          </Button>
        }
      />
      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        <FilterBar
          className="mb-3"
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search files…"
          actions={
            <SegmentedControl
              value={kind}
              onChange={setKind}
              options={kinds}
            />
          }
        />
        <div className="overflow-hidden rounded-xl border border-border-default bg-surface">
          <DataTable
            rows={rows}
            columns={columns}
            rowKey={(f) => f.id}
            empty={
              <EmptyState
                icon={<FolderOpen className="size-6" strokeWidth={1.5} />}
                title="No files"
                description="Nothing matches this filter."
              />
            }
          />
        </div>
      </div>
    </div>
  );
}
