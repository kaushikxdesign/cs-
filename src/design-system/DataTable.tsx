import React from 'react';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Checkbox } from './Form';
import { EmptyState, SkeletonTable } from './Feedback';

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
              <th className="w-10 px-3">
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
                  'h-9 px-3 text-caption font-medium text-tertiary',
                  c.align === 'right' ? 'text-right' : 'text-left',
                )}
              >
                {c.sortValue ? (
                  <button
                    onClick={() => toggleSort(c.key)}
                    className="inline-flex items-center gap-1 hover:text-primary"
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
                  <td className="px-3" onClick={(e) => e.stopPropagation()}>
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
                      'h-10 px-3 text-primary',
                      c.align === 'right' && 'text-right tabular-nums',
                    )}
                  >
                    {c.render(row)}
                  </td>
                ))}
                {rowActions && (
                  <td className="px-3" onClick={(e) => e.stopPropagation()}>
                    <div className="opacity-0 transition-opacity duration-[120ms] group-hover:opacity-100 focus-within:opacity-100">
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
