"use client";

/***************************************************************
 *
 *                    EditableCells.tsx
 *
 *         Author: Anne Wu & Hansini Gundavarapu
 *           Date: 03/25/2026
 *
 *        Summary: Generic editable cell components and a reusable
 *                 EditableTable wrapper for building inline-editable
 *                 TanStack tables. Import these into any table that
 *                 needs in-place editing with a save/discard bar.
 *
 **************************************************************/

import React, { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    Row,
    useReactTable,
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// ---------------------------------------------------------------------------
// EditableCell
// A single table cell that toggles between read-only display and a text input.
// Double-click activates edit mode; Enter or blur commits; Escape cancels.
// ---------------------------------------------------------------------------
export interface EditableCellProps {
    value: string | number | boolean;
    columnId: string;
    rowId: string;
    onCommit: (
        rowId: string,
        columnId: string,
        value: string | number | boolean,
    ) => void;
}

export function EditableCell({
    value,
    columnId,
    rowId,
    onCommit,
}: EditableCellProps) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(String(value));
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDoubleClick = () => {
        setDraft(String(value));
        setEditing(true);
        setTimeout(() => inputRef.current?.select(), 0);
    };

    const commit = useCallback(() => {
        setEditing(false);
        if (draft === String(value)) return;
        onCommit(rowId, columnId, draft.trim());
    }, [draft, value, columnId, rowId, onCommit]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") {
            setEditing(false);
            setDraft(String(value));
        }
    };

    if (editing) {
        return (
            <input
                ref={inputRef}
                className="w-full min-w-0 px-1 py-0.5 border border-blue-400 rounded text-sm outline-none bg-white focus:ring-1 focus:ring-blue-400"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commit}
                onKeyDown={handleKeyDown}
                autoFocus
            />
        );
    }

    return (
        <div
            className="px-1 py-0.5 rounded cursor-text hover:bg-blue-50 text-sm min-h-[1.5rem] transition-colors break-words"
            onDoubleClick={handleDoubleClick}
            title="Double-click to edit"
        >
            {String(value)}
        </div>
    );
}

// ---------------------------------------------------------------------------
// StringSelectCell
// Renders a <select> from a fixed list of string options; commits on change.
// ---------------------------------------------------------------------------
export interface StringSelectCellProps {
    value: string;
    options: string[];
    rowId: string;
    columnId: string;
    onCommit: (rowId: string, columnId: string, value: string) => void;
}

export function StringSelectCell({
    value,
    options,
    rowId,
    columnId,
    onCommit,
}: StringSelectCellProps) {
    return (
        <Select
            value={value}
            onValueChange={(val) => onCommit(rowId, columnId, val)}
        >
            <SelectTrigger className="h-full px-1 py-0.5 text-sm border-0 shadow-none bg-transparent hover:bg-muted focus:ring-1 focus:ring-neutral-400">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {options.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                        {opt}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

// ---------------------------------------------------------------------------
// BooleanSelectCell
// Renders a Yes/No <select> that commits immediately on change.
// ---------------------------------------------------------------------------
export interface BooleanSelectCellProps {
    value: boolean;
    rowId: string;
    columnId: string;
    onCommit: (rowId: string, columnId: string, value: boolean) => void;
}

export function BooleanSelectCell({
    value,
    rowId,
    columnId,
    onCommit,
}: BooleanSelectCellProps) {
    return (
        <Select
            value={value ? "true" : "false"}
            onValueChange={(val) => onCommit(rowId, columnId, val === "true")}
        >
            <SelectTrigger className="h-full px-1 py-0.5 text-sm border-0 shadow-none bg-transparent hover:bg-muted focus:ring-1 focus:ring-neutral-400">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No</SelectItem>
            </SelectContent>
        </Select>
    );
}

// ---------------------------------------------------------------------------
// NumberInputCell
// Renders an inline number input that commits on blur or Enter.
// Calls onValidationError (if provided) when the input is not a positive integer.
// ---------------------------------------------------------------------------
export interface NumberInputCellProps {
    value: number;
    rowId: string;
    columnId: string;
    onCommit: (rowId: string, columnId: string, value: number) => void;
    onValidationError?: (message: string) => void;
}

export function NumberInputCell({
    value,
    rowId,
    columnId,
    onCommit,
    onValidationError,
}: NumberInputCellProps) {
    const [draft, setDraft] = useState(String(value));

    const commit = useCallback(() => {
        const n = Number(draft);
        if (isNaN(n) || !Number.isInteger(n) || n < 1) {
            onValidationError?.("Must be a positive integer");
            setDraft(String(value));
            return;
        }
        if (n !== value) onCommit(rowId, columnId, n);
    }, [draft, value, rowId, columnId, onCommit, onValidationError]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") setDraft(String(value));
    };

    return (
        <input
            type="number"
            min={1}
            className="w-full min-w-0 px-1 py-0.5 rounded text-sm bg-transparent hover:bg-blue-50 border-0 outline-none focus:ring-1 focus:ring-blue-400 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={handleKeyDown}
        />
    );
}

// ---------------------------------------------------------------------------
// SaveDiscardBar
// Floating save/discard bar shown when there are unsaved changes.
// Can be used standalone outside of EditableTable.
// ---------------------------------------------------------------------------
export interface SaveDiscardBarProps {
    hasChanges: boolean;
    saving: boolean;
    onSave: () => void;
    onDiscard: () => void;
}

export function SaveDiscardBar({
    hasChanges,
    saving,
    onSave,
    onDiscard,
}: SaveDiscardBarProps) {
    return (
        <div
            className={cn(
                "fixed bottom-0 left-56 right-0 z-50 flex items-center justify-between px-8 py-4 bg-white/20 backdrop-blur-md shadow-lg transition-transform duration-200 ease-in-out",
                hasChanges ? "translate-y-0" : "translate-y-full",
            )}
        >
            <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
                You have unsaved changes — save?
            </span>
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onDiscard}
                    disabled={saving}
                >
                    Discard Changes
                </Button>
                <Button size="sm" onClick={onSave} disabled={saving}>
                    {saving ? "Saving..." : "Save"}
                </Button>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// EditableTable
// Generic table shell: renders a TanStack table with a fixed-layout header/body
// and an optional save/discard bar at the bottom.
//
// Props:
//   data           — row data array
//   columns        — TanStack ColumnDef array
//   hasChanges     — whether to show the save/discard bar
//   saving         — disables buttons while a save is in flight
//   onSave         — called when the user clicks Save
//   onDiscard      — called when the user clicks Discard Changes
//   isRowChanged   — optional; returns true for rows that should be highlighted
//   emptyMessage   — text shown when data is empty (default: "No results.")
// ---------------------------------------------------------------------------
export interface EditableTableProps<TData> {
    data: TData[];
    columns: ColumnDef<TData>[];
    hasChanges: boolean;
    saving: boolean;
    onSave: () => void;
    onDiscard: () => void;
    isRowChanged?: (row: Row<TData>) => boolean;
    emptyMessage?: string;
}

export function EditableTable<TData>({
    data,
    columns,
    hasChanges,
    saving,
    onSave,
    onDiscard,
    isRowChanged,
    emptyMessage = "No results.",
}: EditableTableProps<TData>) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="space-y-0">
            <div className="overflow-auto rounded-lg border border-border">
                <Table
                    style={{
                        tableLayout: "fixed",
                        width: columns.reduce(
                            (acc, c) =>
                                acc + ((c as { size?: number }).size ?? 150),
                            0,
                        ),
                    }}
                    className="text-sm"
                >
                    <TableHeader className="bg-muted">
                        {table.getHeaderGroups().map((hg) => (
                            <TableRow
                                key={hg.id}
                                className="hover:bg-muted border-0"
                            >
                                {hg.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className="border-b border-r last:border-r-0 text-left px-3 py-2"
                                        style={{ width: header.getSize() }}
                                    >
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext(),
                                        )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    className={
                                        isRowChanged?.(row)
                                            ? "bg-blue-50/60"
                                            : ""
                                    }
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className="px-3 py-1 border-b border-r last:border-r-0"
                                            style={{
                                                width: cell.column.getSize(),
                                            }}
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    {emptyMessage}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <SaveDiscardBar
                hasChanges={hasChanges}
                saving={saving}
                onSave={onSave}
                onDiscard={onDiscard}
            />
        </div>
    );
}
