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
  onBulkDelete?: (rows: T[]) => void;
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  onEdit,
  onDelete,
  onBulkDelete,
}: DataTableProps<T>) {
  const [selected, setSelected] = React.useState<string[]>([]);
  const selectable = Boolean(onBulkDelete);
  const selectedRows = rows.filter((row) => selected.includes(row.id));
  const allSelected = rows.length > 0 && selectedRows.length === rows.length;

  React.useEffect(() => {
    setSelected((current) => current.filter((id) => rows.some((row) => row.id === id)));
  }, [rows]);

  function toggleAll() {
    setSelected(allSelected ? [] : rows.map((row) => row.id));
  }

  function toggleOne(id: string) {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  function handleBulkDelete() {
    if (selectedRows.length === 0 || !onBulkDelete) return;
    onBulkDelete(selectedRows);
    setSelected([]);
  }

  return (
    <div className="space-y-3">
      {/* Barra de seleção em lote */}
      {selectable && selectedRows.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-brand-black-2 border border-brand-border rounded-sm px-4 py-3">
          <p className="text-sm text-brand-white/80">
            {selectedRows.length} selecionado{selectedRows.length > 1 ? "s" : ""}
          </p>
          <button
            type="button"
            onClick={handleBulkDelete}
            className="text-xs uppercase tracking-wider font-semibold text-brand-red hover:underline"
          >
            Excluir selecionados
          </button>
        </div>
      )}

      {/* ── MOBILE: cards (visível abaixo de md) ── */}
      <div className="md:hidden border border-brand-border rounded-sm divide-y divide-brand-border">
        {rows.length === 0 ? (
          <p className="px-4 py-8 text-center text-brand-gray text-sm">
            Nenhum registro encontrado.
          </p>
        ) : (
          rows.map((row) => (
            <div key={row.id} className="p-3 space-y-2">
              {selectable && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selected.includes(row.id)}
                    onChange={() => toggleOne(row.id)}
                    className="accent-brand-red"
                  />
                  <span className="text-xs text-brand-gray uppercase tracking-wider">Selecionar</span>
                </label>
              )}

              <div className="space-y-1.5">
                {columns.map((c) => (
                  <div key={c.key} className="flex items-start justify-between gap-3 text-sm">
                    <span className="text-[10px] uppercase tracking-wider text-brand-gray shrink-0 mt-0.5 w-24">
                      {c.label}
                    </span>
                    <span className="text-right min-w-0 break-words font-medium flex-1">
                      {c.render
                        ? c.render(row)
                        : String((row as unknown as Record<string, unknown>)[c.key] ?? "")}
                    </span>
                  </div>
                ))}
              </div>

              {(onEdit || onDelete) && (
                <div className="flex gap-4 pt-2 border-t border-brand-border/50">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(row)}
                      className="text-xs uppercase font-semibold text-brand-gold hover:underline"
                    >
                      Editar
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(row)}
                      className="text-xs uppercase font-semibold text-brand-red hover:underline"
                    >
                      Excluir
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
        {/* Seleção "todos" no mobile */}
        {selectable && rows.length > 0 && (
          <div className="px-3 py-2 bg-white/[0.02]">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-brand-gray">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                className="accent-brand-red"
              />
              <span className="uppercase tracking-wider">Selecionar todos</span>
            </label>
          </div>
        )}
      </div>

      {/* ── DESKTOP: tabela (visível a partir de md) ── */}
      <div className="hidden md:block border border-brand-border rounded-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-white/5 text-brand-gray uppercase text-[10px] tracking-wider">
            <tr>
              {selectable && (
                <th className="px-4 py-3 w-12">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label="Selecionar todos"
                    className="accent-brand-red"
                  />
                </th>
              )}
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
                {selectable && (
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(row.id)}
                      onChange={() => toggleOne(row.id)}
                      aria-label="Selecionar linha"
                      className="accent-brand-red"
                    />
                  </td>
                )}
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
                  colSpan={columns.length + (onEdit || onDelete ? 1 : 0) + (selectable ? 1 : 0)}
                  className="px-4 py-8 text-center text-brand-gray"
                >
                  Nenhum registro encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
