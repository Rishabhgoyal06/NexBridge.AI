import React from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  onRowClick,
  emptyMessage = 'No data available.',
  className = '',
}: DataTableProps<T>) {
  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center bg-surface-container-lowest border border-outline-variant/30 rounded-xl">
        <span className="material-symbols-outlined text-[32px] text-secondary mb-2">inbox</span>
        <p className="font-body-md text-body-md text-secondary">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm ${className}`}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-outline-variant/20 bg-surface-container-low/50">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`py-3.5 px-4 font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/10 font-body-md text-body-md">
          {data.map((item, idx) => (
            <tr
              key={item.id ?? idx}
              onClick={() => onRowClick && onRowClick(item)}
              className={`transition-colors ${
                onRowClick ? 'cursor-pointer hover:bg-surface-container-low/60' : 'hover:bg-surface-container-low/30'
              }`}
            >
              {columns.map((col) => (
                <td key={col.key} className={`py-3.5 px-4 text-on-surface ${col.className || ''}`}>
                  {col.render ? col.render(item) : (item as any)[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
