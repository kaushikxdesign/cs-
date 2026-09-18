import React from 'react';
import { ArrowDown, ArrowUp, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Checkbox } from './Form';
import { EmptyState, SkeletonTable } from './Feedback';
import { IconButton } from './Button';

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  /** Omit to make the column unsortable. */
  sortValue?: (row: T) => string | number;
  render: (row: T) => React.ReactNode;
  align?: 'left' | 'right';
  width?: string;
}

export interface DataTableProps<T> {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  selected?: string[];
  onSelectedChange?: (ids: string[]) => void;
  /** Rendered on row hover at the right edge; keeps tables free of permanent button columns. */
  rowActions?: (row: T) => React.ReactNode;
  loading?: boolean;
  empty?: React.ReactNode;
  stickyHeader?: boolean;
  className?: string;
}

/**
 * A row's primary label, with an optional second line.
 *
 * Every table that had this pattern spelled it out inline and drifted:
 * different weights, different muted tokens, one of them nesting a <p> per
 * line and another a <span>. The secondary line is the reason the body
 * cells are muted — the name has to be the only thing at full contrast.
 */
export function PrimaryCell({
  children,
  sub,
  icon,
}: {
  children: React.ReactNode;
  sub?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <span className="flex items-center gap-2.5">
      {icon}
      <span className="min-w-0">
        <span className="block truncate text-body-sm font-medium text-on-surface">{children}</span>
        {sub && (
          <span className="mt-0.5 block truncate text-caption text-on-surface-subtle">{sub}</span>
        )}
      </span>
    </span>
  );
}

/**
 * The bar a table's selection actually promised. Swapping the page header's
 * action for "Export 3" answered "how many" but not "what can I do with
 * them" — this replaces that with the count, the actions that apply, and an
 * explicit way out, in the one place people are already looking when they
 * have rows selected.
 */
export function SelectionBar({
  count,
  onClear,
  children,
}: {
  count: number;
  onClear: () => void;
  children?: React.ReactNode;
}) {
  if (!count) return null;
  return (
    <div className="mb-3 flex animate-[fade-in_120ms_ease-out] items-center gap-3 rounded-lg border border-border-strong bg-selected px-3 py-2">
      <span className="text-body-sm font-medium text-on-surface">
        {count} selected
      </span>
      <span className="h-4 w-px bg-border-default" aria-hidden />
      <div className="flex flex-1 items-center gap-2">{children}</div>
      <IconButton label="Clear selection" size="sm" onClick={onClear}>
        <X className="size-4" strokeWidth={1.75} />
      </IconButton>
    </div>
  );
}

export function DataTable<T>({
  rows,
  columns,
  rowKey,
  onRowClick,
  selectable,
  selected = [],
  onSelectedChange,
  rowActions,
  loading,
  empty,
  stickyHeader = true,
  className,
}: DataTableProps<T>) {
  const [sort, setSort] = React.useState<{ key: string; dir: 'asc' | 'desc' } | null>(null);

  const sorted = React.useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return rows;
    const dir = sort.dir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      if (av === bv) return 0;
      return av > bv ? dir : -dir;
    });
  }, [rows, columns, sort]);

  function toggleSort(key: string) {
    setSort((s) =>
      s?.key === key ? (s.dir === 'asc' ? { key, dir: 'desc' } : null) : { key, dir: 'asc' },
    );
  }

  const allSelected = rows.length > 0 && selected.length === rows.length;

  if (loading) return <SkeletonTable cols={columns.length} />;

  if (!rows.length) {
    return <>{empty ?? <EmptyState title="Nothing to show" description="No records match the current filters." />}</>;
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full border-collapse text-body-sm">
        <thead className={cn(stickyHeader && 'sticky top-0 z-10')}>
          <tr className="border-b border-border-default bg-subtle">
            {selectable && (
              <th className="w-10 pl-4 pr-0">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(c) => onSelectedChange?.(c ? rows.map(rowKey) : [])}
                />
              </th>
            )}
            {columns.map((c) => (
              <th
                key={c.key}
                style={c.width ? { width: c.width } : undefined}
                className={cn(
                  'whitespace-nowrap px-4 py-2.5 text-caption font-medium text-on-surface-subtle',
                  c.align === 'right' ? 'text-right' : 'text-left',
                )}
              >
                {c.sortValue ? (
                  <button
                    onClick={() => toggleSort(c.key)}
                    className="inline-flex items-center gap-1 hover:text-on-surface"
                  >
                    {c.header}
                    {sort?.key === c.key ? (
                      sort.dir === 'asc' ? (
                        <ArrowUp className="size-3" strokeWidth={1.5} />
                      ) : (
                        <ArrowDown className="size-3" strokeWidth={1.5} />
                      )
                    ) : (
                      <ChevronsUpDown className="size-3 opacity-40" strokeWidth={1.5} />
                    )}
                  </button>
                ) : (
                  c.header
                )}
              </th>
            ))}
            {rowActions && <th className="w-10" />}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => {
            const id = rowKey(row);
            const isSelected = selected.includes(id);
            return (
              <tr
                key={id}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  'group border-b border-border-default last:border-0',
                  'transition-colors duration-[120ms]',
                  isSelected ? 'bg-selected' : 'hover:bg-hover',
                  onRowClick && 'cursor-pointer',
                )}
              >
                {selectable && (
                  <td className="pl-4 pr-0 align-middle" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(c) =>
                        onSelectedChange?.(
                          c ? [...selected, id] : selected.filter((s) => s !== id),
                        )
                      }
                    />
                  </td>
                )}
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={cn(
                      'whitespace-nowrap px-4 py-2.5 align-middle text-on-surface-muted',
                      c.align === 'right' && 'text-right tabular-nums',
                    )}
                  >
                    {c.render(row)}
                  </td>
                ))}
                {rowActions && (
                  <td className="px-4 align-middle" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end opacity-0 transition-opacity duration-[120ms] group-hover:opacity-100 focus-within:opacity-100">
                      {rowActions(row)}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
