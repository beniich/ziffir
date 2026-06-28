import React, { useState, useMemo, useCallback } from 'react';

export interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (row: T) => React.ReactNode;
  accessor?: (row: T) => string | number;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchKeys?: (keyof T)[];
  pageSize?: number;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  toolbar?: React.ReactNode;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchKeys,
  pageSize = 25,
  emptyMessage = 'Aucune donnée',
  onRowClick,
  toolbar,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  
  // Filtrage
  const filtered = useMemo(() => {
    if (!search || !searchKeys) return data;
    const s = search.toLowerCase();
    return data.filter(row =>
      searchKeys.some(key => {
        const val = row[key];
        return String(val).toLowerCase().includes(s);
      })
    );
  }, [data, search, searchKeys]);
  
  // Tri
  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const col = columns.find(c => c.key === sortKey);
      const av = col?.accessor ? col.accessor(a) : a[sortKey];
      const bv = col?.accessor ? col.accessor(b) : b[sortKey];
      
      if (av == null) return 1;
      if (bv == null) return -1;
      
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir, columns]);
  
  // Pagination
  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);
  
  const handleSort = useCallback((key: string) => {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }, [sortKey]);
  
  return (
    <div className="admin-table-container">
      <div className="admin-table-toolbar">
        {searchKeys && (
          <div className="admin-table-search">
            <input
              type="search"
              placeholder="Rechercher…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        )}
        {toolbar}
      </div>
      
      <table className="admin-table">
        <thead>
          <tr>
            {columns.map(col => (
              <th
                key={String(col.key)}
                style={{ width: col.width }}
                className={
                  col.sortable ? `sortable ${sortKey === col.key ? `sorted-${sortDir}` : ''}` : ''
                }
                onClick={col.sortable ? () => handleSort(String(col.key)) : undefined}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginated.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            paginated.map((row, i) => (
              <tr
                key={i}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                style={{ cursor: onRowClick ? 'pointer' : 'default' }}
              >
                {columns.map(col => (
                  <td key={String(col.key)}>
                    {col.render ? col.render(row) : (row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      
      {totalPages > 1 && (
        <div className="admin-table-pagination">
          <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            {sorted.length} résultat{sorted.length > 1 ? 's' : ''} · page {page}/{totalPages}
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn btn-ghost btn-sm"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              ← Précédent
            </button>
            <button
              className="btn btn-ghost btn-sm"
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Suivant →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
