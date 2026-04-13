"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  onEdit,
  onDelete,
}: DataTableProps<T>) {
  return (
    <div className="border border-brand-border rounded-sm overflow-x-auto">
      <table className="w-full text-sm min-w-[700px]">
        <thead className="bg-white/5 text-brand-gray uppercase text-[10px] tracking-wider">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={cn("text-left px-4 py-3 font-semibold", c.className)}>
                {c.label}
              </th>
            ))}
            {(onEdit || onDelete) && <th className="px-4 py-3 text-right">Ações</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-brand-border hover:bg-white/[0.03]">
              {columns.map((c) => (
                <td key={c.key} className={cn("px-4 py-3", c.className)}>
                  {c.render
                    ? c.render(row)
                    : String((row as unknown as Record<string, unknown>)[c.key] ?? "")}
                </td>
              ))}
              {(onEdit || onDelete) && (
                <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(row)}
                      className="text-xs uppercase text-brand-gold hover:underline"
                    >
                      Editar
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(row)}
                      className="text-xs uppercase text-brand-red hover:underline"
                    >
                      Excluir
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td
                colSpan={columns.length + 1}
                className="px-4 py-8 text-center text-brand-gray"
              >
                Nenhum registro encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
