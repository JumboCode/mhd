"use client";

/***************************************************************
 *
 *                EditableProjectsTable.tsx
 *
 *         Author: Anne Wu & Hansini Gundavarapu
 *           Date: 03/25/2026
 *
 *        Summary: Inline-editable TanStack table for project data
 *                 shown on the school profile page. Double-clicking
 *                 any cell puts it into edit mode. Only rows that
 *                 were actually changed are PATCHed on save, keeping
 *                 write traffic minimal.
 *
 **************************************************************/

import React, { useCallback, useRef, useState } from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
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
import { toast } from "sonner";

// Shape of a single project row as returned by GET /api/schools/[name]
export type ProjectRow = {
    id: number; // projects.id — used to identify which row to PATCH
    title: string;
    category: string;
    categoryId: string;
    division: string;
    teamProject: boolean;
    numStudents: number;
    year: number;
    teacherId: number; // teachers.id — used to identify which teacher row to PATCH
    teacherName: string;
    teacherEmail: string;
};

// Only the project-level fields that the user is allowed to edit
type ProjectChanges = Partial<
    Pick<
        ProjectRow,
        "title" | "category" | "division" | "teamProject" | "numStudents"
    >
>;

// Only the teacher-level fields that the user is allowed to edit
type TeacherChanges = Partial<Pick<ProjectRow, "teacherName" | "teacherEmail">>;

// Column IDs whose values live in the teachers table rather than the projects table
const TEACHER_FIELDS = new Set(["teacherName", "teacherEmail"]);

// Maps component column IDs to the field names the teacher PATCH endpoint expects
const TEACHER_FIELD_MAP: Record<string, string> = {
    teacherName: "name",
    teacherEmail: "email",
};

// ---------------------------------------------------------------------------
// EditableCell
// A single table cell that toggles between a read-only display and an input.
// Double-click activates edit mode; Enter or blur commits; Escape cancels.
// ---------------------------------------------------------------------------
interface EditableCellProps {
    value: string | number | boolean;
    columnId: string;
    rowId: string;
    onCommit: (
        rowId: string,
        columnId: string,
        value: string | number | boolean,
    ) => void;
}

function EditableCell({ value, columnId, rowId, onCommit }: EditableCellProps) {
    const [editing, setEditing] = useState(false);
    // draft holds the in-progress string while the input is open
    const [draft, setDraft] = useState(String(value));
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDoubleClick = () => {
        setDraft(String(value));
        setEditing(true);
        // Select all text in the input so the user can immediately overtype
        setTimeout(() => inputRef.current?.select(), 0);
    };

    // Validate, coerce to the correct DB type, and report the change upstream
    const commit = useCallback(() => {
        setEditing(false);
        if (draft === String(value)) return; // value unchanged — nothing to do

        let coerced: string | number | boolean = draft.trim();

        if (columnId === "numStudents") {
            // Must be stored as an integer in the DB — reject non-integer input
            const n = Number(coerced);
            if (isNaN(n) || !Number.isInteger(n) || n < 1) {
                toast.error("# Students must be a positive integer");
                setDraft(String(value)); // revert the draft
                return;
            }
            coerced = n;
        } else if (columnId === "teamProject") {
            // Convert "true"/"false" strings to an actual boolean for the DB
            coerced = coerced.toLowerCase() === "true";
        }

        onCommit(rowId, columnId, coerced);
    }, [draft, value, columnId, rowId, onCommit]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") {
            // Cancel without saving — restore the original value
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
            className="px-1 py-0.5 rounded cursor-text hover:bg-blue-50 text-sm min-h-[1.5rem] transition-colors"
            onDoubleClick={handleDoubleClick}
            title="Double-click to edit"
        >
            {/* Render booleans as human-readable Yes/No */}
            {columnId === "teamProject"
                ? value
                    ? "Yes"
                    : "No"
                : String(value)}
        </div>
    );
}

// ---------------------------------------------------------------------------
// EditableProjectsTable
// Main exported component. Accepts the initial project list and manages all
// edit state locally until the user explicitly saves or discards.
// ---------------------------------------------------------------------------
interface EditableProjectsTableProps {
    initialData: ProjectRow[];
}

export function EditableProjectsTable({
    initialData,
}: EditableProjectsTableProps) {
    // Local copy of the data — updated immediately when a cell is committed
    // so the table reflects edits without waiting for a server round-trip
    const [data, setData] = useState<ProjectRow[]>(initialData);

    // Track which project rows and teacher rows have unsaved changes.
    // Using Maps keyed by DB id so we can efficiently merge multiple edits
    // to the same row and only fire one PATCH per entity on save.
    const [projectChanges, setProjectChanges] = useState<
        Map<number, ProjectChanges>
    >(new Map());
    const [teacherChanges, setTeacherChanges] = useState<
        Map<number, TeacherChanges>
    >(new Map());

    const [saving, setSaving] = useState(false);

    // Show the save/discard bar whenever either change map is non-empty
    const hasChanges = projectChanges.size > 0 || teacherChanges.size > 0;

    // Called by EditableCell after a value passes validation.
    // Updates the local data optimistically and records the change in the
    // appropriate map (project or teacher) so save knows what to PATCH.
    const handleCommit = useCallback(
        (rowId: string, columnId: string, value: string | number | boolean) => {
            const row = data[Number(rowId)];
            if (!row) return;

            // Immediately reflect the edit in the displayed table
            setData((prev) =>
                prev.map((r, i) =>
                    i === Number(rowId) ? { ...r, [columnId]: value } : r,
                ),
            );

            if (TEACHER_FIELDS.has(columnId)) {
                // Route teacher-field changes to the teacher changes map,
                // merging with any existing changes for the same teacher
                setTeacherChanges((prev) => {
                    const next = new Map(prev);
                    const existing = next.get(row.teacherId) ?? {};
                    next.set(row.teacherId, {
                        ...existing,
                        [columnId]: value as string,
                    });
                    return next;
                });
            } else {
                // Route project-field changes to the project changes map,
                // merging with any existing changes for the same project
                setProjectChanges((prev) => {
                    const next = new Map(prev);
                    const existing = next.get(row.id) ?? {};
                    next.set(row.id, {
                        ...existing,
                        [columnId]: value as never,
                    });
                    return next;
                });
            }
        },
        [data],
    );

    // Fire one PATCH per changed project and one per changed teacher in parallel
    const handleSave = async () => {
        setSaving(true);
        try {
            const requests: Promise<Response>[] = [];

            // Build a PATCH request for each project that has unsaved changes
            for (const [projectId, changes] of projectChanges) {
                requests.push(
                    fetch(`/api/projects/${projectId}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(changes),
                    }),
                );
            }

            // Build a PATCH request for each teacher that has unsaved changes.
            // Column IDs (e.g. "teacherName") must be remapped to the field names
            // the teacher endpoint expects (e.g. "name").
            for (const [teacherId, changes] of teacherChanges) {
                const body: Record<string, string> = {};
                for (const [colId, val] of Object.entries(changes)) {
                    body[TEACHER_FIELD_MAP[colId] ?? colId] = val as string;
                }
                requests.push(
                    fetch(`/api/teachers/${teacherId}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(body),
                    }),
                );
            }

            // Wait for all PATCHes to settle and report any failures
            const results = await Promise.all(requests);
            const failed = results.filter((r) => !r.ok);

            if (failed.length > 0) {
                toast.error(
                    `${failed.length} update(s) failed. Please try again.`,
                );
            } else {
                toast.success("Changes saved successfully.");
                // Clear the change maps so the save bar disappears
                setProjectChanges(new Map());
                setTeacherChanges(new Map());
            }
        } catch {
            toast.error("Failed to save changes. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    // Reset both local data and change maps back to the original server state
    const handleDiscard = () => {
        setData(initialData);
        setProjectChanges(new Map());
        setTeacherChanges(new Map());
    };

    // Column definitions — every data column uses EditableCell for its renderer
    const columns: ColumnDef<ProjectRow>[] = [
        {
            accessorKey: "title",
            header: "Title",
            size: 240,
            cell: ({ getValue, row, column }) => (
                <EditableCell
                    value={getValue() as string}
                    columnId={column.id}
                    rowId={String(row.index)}
                    onCommit={handleCommit}
                />
            ),
        },
        {
            accessorKey: "category",
            header: "Category",
            size: 160,
            cell: ({ getValue, row, column }) => (
                <EditableCell
                    value={getValue() as string}
                    columnId={column.id}
                    rowId={String(row.index)}
                    onCommit={handleCommit}
                />
            ),
        },
        {
            accessorKey: "division",
            header: "Division",
            size: 120,
            cell: ({ getValue, row, column }) => (
                <EditableCell
                    value={getValue() as string}
                    columnId={column.id}
                    rowId={String(row.index)}
                    onCommit={handleCommit}
                />
            ),
        },
        {
            accessorKey: "teamProject",
            header: "Team?",
            size: 80,
            cell: ({ getValue, row, column }) => (
                <EditableCell
                    value={getValue() as boolean}
                    columnId={column.id}
                    rowId={String(row.index)}
                    onCommit={handleCommit}
                />
            ),
        },
        {
            accessorKey: "numStudents",
            header: "# Students",
            size: 100,
            cell: ({ getValue, row, column }) => (
                <EditableCell
                    value={getValue() as number}
                    columnId={column.id}
                    rowId={String(row.index)}
                    onCommit={handleCommit}
                />
            ),
        },
        {
            accessorKey: "teacherName",
            header: "Teacher",
            size: 160,
            cell: ({ getValue, row, column }) => (
                <EditableCell
                    value={getValue() as string}
                    columnId={column.id}
                    rowId={String(row.index)}
                    onCommit={handleCommit}
                />
            ),
        },
        {
            accessorKey: "teacherEmail",
            header: "Teacher Email",
            size: 200,
            cell: ({ getValue, row, column }) => (
                <EditableCell
                    value={getValue() as string}
                    columnId={column.id}
                    rowId={String(row.index)}
                    onCommit={handleCommit}
                />
            ),
        },
    ];

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
                            (acc, c) => acc + (c.size ?? 150),
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
                            table.getRowModel().rows.map((row) => {
                                // Highlight rows that have pending unsaved changes
                                const isChanged =
                                    projectChanges.has(row.original.id) ||
                                    teacherChanges.has(row.original.teacherId);
                                return (
                                    <TableRow
                                        key={row.id}
                                        className={
                                            isChanged ? "bg-blue-50/60" : ""
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
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    No projects found for this year.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Unsaved changes bar — shown only when there are pending edits.
                Matches the "You have unsaved changes - save?" pattern from Figma. */}
            {hasChanges && (
                <div className="flex items-center justify-between px-4 py-2.5 bg-background border border-border rounded-b-lg border-t-0 shadow-sm">
                    <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
                        You have unsaved changes — save?
                    </span>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDiscard}
                            disabled={saving}
                        >
                            Discard Changes
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? "Saving..." : "Save"}
                        </Button>
                    </div>
                </div>
            )}

            {data.length > 0 && (
                <p className="text-xs text-muted-foreground pt-2">
                    Double-click any cell to edit. Teacher changes apply
                    globally across all projects.
                </p>
            )}
        </div>
    );
}
