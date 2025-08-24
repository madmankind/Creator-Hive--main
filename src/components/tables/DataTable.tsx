"use client";
import * as React from "react";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";

export interface DataTableProps<TData extends object> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  height?: number;
}

export function DataTable<TData extends object>({ columns, data, height = 480 }: DataTableProps<TData>) {
  const table = useReactTable<TData>({ data, columns, getCoreRowModel: getCoreRowModel() });
  const parentRef = React.useRef<HTMLDivElement | null>(null);
  const rowVirtualizer = useVirtualizer({ count: table.getRowModel().rows.length, getScrollElement: () => parentRef.current, estimateSize: () => 42, overscan: 8 });
  const items = rowVirtualizer.getVirtualItems();

  return (
    <div className="border border-[color:var(--color-border)] rounded-lg overflow-hidden">
      <div className="bg-[color:var(--muted)] sticky top-0 z-10">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th key={h.id} className="text-left px-3 py-2 text-[color:var(--text-secondary)]">
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
        </table>
      </div>
      <div ref={parentRef} style={{ height }} className="relative overflow-auto">
        <div style={{ height: rowVirtualizer.getTotalSize() }} className="relative">
          <table className="absolute inset-0 w-full text-sm">
            <tbody>
              {items.map((vi) => {
                const row = table.getRowModel().rows[vi.index]!;
                return (
                  <tr key={row.id} style={{ transform: `translateY(${vi.start}px)` }} className="absolute left-0 right-0 border-b border-[color:var(--color-border)]">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-3 py-2">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

