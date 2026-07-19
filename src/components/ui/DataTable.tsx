import { ReactNode, useState } from 'react';
import { cn } from '../../lib/utils';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { Skeleton } from './Skeleton';

// ─────────────────────────────────────────────────────────────────────────────
// DataTable — Table réutilisable avec tri, pagination et états vides/loading
// Usage :
//   <DataTable columns={cols} rows={data} isLoading={false} />
// ─────────────────────────────────────────────────────────────────────────────

export interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, row: T) => ReactNode;
}

interface DataTableProps<T extends Record<string, unknown>> {
  columns: Column<T>[];
  rows: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  pageSize?: number;
  onRowClick?: (row: T) => void;
  rowKey?: keyof T;
  className?: string;
}

type SortDir = 'asc' | 'desc' | null;

export function DataTable<T extends Record<string, unknown>>({
  columns,
  rows,
  isLoading = false,
  emptyMessage = 'Aucune donnée',
  emptyIcon,
  pageSize = 20,
  onRowClick,
  rowKey,
  className,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [page, setPage] = useState(0);

  // ── Sort ──────────────────────────────────────────────────────────────────
  const toggleSort = (key: string) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir('asc');
    } else if (sortDir === 'asc') {
      setSortDir('desc');
    } else {
      setSortKey(null);
      setSortDir(null);
    }
    setPage(0);
  };

  const sorted = [...rows].sort((a, b) => {
    if (!sortKey || !sortDir) return 0;
    const av = a[sortKey as keyof T];
    const bv = b[sortKey as keyof T];
    const cmp = String(av ?? '').localeCompare(String(bv ?? ''), undefined, { numeric: true });
    return sortDir === 'asc' ? cmp : -cmp;
  });

  // ── Pagination ────────────────────────────────────────────────────────────
  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice(page * pageSize, (page + 1) * pageSize);

  // ── Render ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className={cn('rounded-xl overflow-hidden border border-border-subtle', className)}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4 p-3 border-b border-border-subtle last:border-0">
            {columns.map((c) => (
              <Skeleton key={String(c.key)} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('rounded-xl overflow-hidden border border-border-subtle', className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          {/* Head */}
          <thead className="bg-surface border-b border-border-subtle">
            <tr>
              {columns.map((col) => {
                const key = String(col.key);
                const active = sortKey === key;
                return (
                  <th
                    key={key}
                    style={{ width: col.width }}
                    className={cn(
                      'px-4 py-3 font-medium text-text-secondary whitespace-nowrap select-none',
                      col.align === 'right' && 'text-right',
                      col.align === 'center' && 'text-center',
                      col.sortable && 'cursor-pointer hover:text-text-primary transition-colors'
                    )}
                    onClick={col.sortable ? () => toggleSort(key) : undefined}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {col.sortable && (
                        <span className={cn('opacity-40', active && 'opacity-100 text-text-accent')}>
                          {active && sortDir === 'asc' ? (
                            <ChevronUp size={13} />
                          ) : active && sortDir === 'desc' ? (
                            <ChevronDown size={13} />
                          ) : (
                            <ChevronsUpDown size={13} />
                          )}
                        </span>
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-16 text-center text-text-muted">
                  <div className="flex flex-col items-center gap-3">
                    {emptyIcon && <span className="opacity-40">{emptyIcon}</span>}
                    <span>{emptyMessage}</span>
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((row, idx) => {
                const key = rowKey ? String(row[rowKey]) : idx;
                return (
                  <tr
                    key={key}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={cn(
                      'border-b border-border-subtle last:border-0',
                      'hover:bg-surface-glass transition-colors',
                      onRowClick && 'cursor-pointer'
                    )}
                  >
                    {columns.map((col) => {
                      const colKey = String(col.key);
                      const value = row[colKey as keyof T];
                      return (
                        <td
                          key={colKey}
                          className={cn(
                            'px-4 py-3 text-text-primary',
                            col.align === 'right' && 'text-right',
                            col.align === 'center' && 'text-center'
                          )}
                        >
                          {col.render ? col.render(value, row) : String(value ?? '—')}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border-subtle bg-surface text-xs text-text-muted">
          <span>
            {page * pageSize + 1}–{Math.min((page + 1) * pageSize, sorted.length)} sur {sorted.length}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-2 py-1 rounded hover:bg-border-subtle disabled:opacity-30 transition-colors"
            >
              ‹
            </button>
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const p = Math.max(0, Math.min(totalPages - 5, page - 2)) + i;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn(
                    'w-7 h-7 rounded text-xs transition-colors',
                    p === page
                      ? 'bg-zaphir-500/20 text-zaphir-400 font-semibold'
                      : 'hover:bg-border-subtle'
                  )}
                >
                  {p + 1}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-2 py-1 rounded hover:bg-border-subtle disabled:opacity-30 transition-colors"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
