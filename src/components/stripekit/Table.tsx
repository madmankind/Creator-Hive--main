'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';

export interface Column<T = Record<string, unknown>> {
  key: string;
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T = Record<string, unknown>> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  sortable?: boolean;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  pagination?: {
    current: number;
    total: number;
    pageSize: number;
    onPageChange: (page: number) => void;
      onPageSizeChange: (size: number) => void;
  };
  toolbar?: React.ReactNode;
  density?: 'comfortable' | 'compact';
  loading?: boolean;
  emptyState?: React.ReactNode;
  onRowClick?: (item: T) => void;
}

export function Table<T extends Record<string, unknown>>({
  data,
  columns,
  searchable = false,
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearchChange,
  sortable = true,
  sortKey,
  sortDirection,
  onSort,
  pagination,
  toolbar,
  density = 'comfortable',
  loading = false,
  emptyState,
  onRowClick,
}: TableProps<T>) {
  const [internalSearchValue, setInternalSearchValue] = useState(searchValue);
  const [internalSortKey, setInternalSortKey] = useState(sortKey);
  const [internalSortDirection, setInternalSortDirection] = useState<'asc' | 'desc'>(sortDirection || 'asc');

  const handleSearchChange = (value: string) => {
    setInternalSearchValue(value);
    onSearchChange?.(value);
  };

  const handleSort = (key: string) => {
    if (!sortable) return;
    
    let direction: 'asc' | 'desc' = 'asc';
    if (internalSortKey === key && internalSortDirection === 'asc') {
      direction = 'desc';
    }
    
    setInternalSortKey(key);
    setInternalSortDirection(direction);
    onSort?.(key, direction);
  };

  const getCellValue = (item: T, column: Column<T>): React.ReactNode => {
    if (typeof column.accessor === 'function') {
      return column.accessor(item);
    }
    return String(item[column.accessor]);
  };

  const rowHeight = density === 'comfortable' ? 'h-12' : 'h-10';

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      {(searchable || toolbar) && (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {searchable && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={internalSearchValue}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-sm"
                />
              </div>
            )}
          </div>
          
          {toolbar && (
            <div className="flex items-center gap-2">
              {toolbar}
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Header */}
            <thead className="bg-surface-2 border-b border-border">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      'px-4 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider',
                      column.width,
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right',
                      column.sortable && sortable && 'cursor-pointer hover:text-text select-none'
                    )}
                    onClick={() => column.sortable && sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      <span>{column.header}</span>
                      {column.sortable && sortable && (
                        <div className="flex flex-col">
                          <ChevronUp 
                            className={cn(
                              'h-3 w-3',
                              internalSortKey === column.key && internalSortDirection === 'asc'
                                ? 'text-accent' 
                                : 'text-muted/50'
                            )} 
                          />
                          <ChevronDown 
                            className={cn(
                              'h-3 w-3 -mt-1',
                              internalSortKey === column.key && internalSortDirection === 'desc'
                                ? 'text-accent' 
                                : 'text-muted/50'
                            )} 
                          />
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent"></div>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8">
                    {emptyState || (
                      <div className="text-center text-muted">
                        No data available
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr
                    key={index}
                    className={cn(
                      rowHeight,
                      'hover:bg-surface-2 transition-colors',
                      onRowClick && 'cursor-pointer'
                    )}
                    onClick={() => onRowClick?.(item)}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn(
                          'px-4 py-3 text-sm text-text',
                          column.align === 'center' && 'text-center',
                          column.align === 'right' && 'text-right'
                        )}
                      >
                        {getCellValue(item, column)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted">
            <span>Rows per page:</span>
            <select
              value={pagination.pageSize}
              onChange={(e) => pagination.onPageSizeChange(Number(e.target.value))}
              className="bg-surface border border-border rounded px-2 py-1 text-text focus:outline-none focus:ring-2 focus:ring-accent/20"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted">
              Page {pagination.current} of {Math.ceil(pagination.total / pagination.pageSize)}
            </span>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => pagination.onPageChange(pagination.current - 1)}
                disabled={pagination.current === 1}
                className="px-3 py-1 text-sm border border-border rounded hover:bg-surface-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => pagination.onPageChange(pagination.current + 1)}
                disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
                className="px-3 py-1 text-sm border border-border rounded hover:bg-surface-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}