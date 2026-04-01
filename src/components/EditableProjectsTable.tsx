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

import { useCallback, useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import {
    EditableCell,
    StringSelectCell,
    BooleanSelectCell,
    NumberInputCell,
    EditableTable,
} from "@/components/EditableCells";

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

interface EditableProjectsTableProps {
    initialData: ProjectRow[];
}

export function EditableProjectsTable({
    initialData,
}: EditableProjectsTableProps) {
    const [data, setData] = useState<ProjectRow[]>(initialData);

    const [projectChanges, setProjectChanges] = useState<
        Map<number, ProjectChanges>
    >(new Map());
    const [teacherChanges, setTeacherChanges] = useState<
        Map<number, TeacherChanges>
    >(new Map());
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setData(initialData);
        setProjectChanges(new Map());
        setTeacherChanges(new Map());
    }, [initialData]);

    const hasChanges = projectChanges.size > 0 || teacherChanges.size > 0;

    const handleCommit = useCallback(
        (rowId: string, columnId: string, value: string | number | boolean) => {
            const row = data[Number(rowId)];
            if (!row) return;

            setData((prev) =>
                prev.map((r, i) =>
                    i === Number(rowId) ? { ...r, [columnId]: value } : r,
                ),
            );

            if (TEACHER_FIELDS.has(columnId)) {
                setTeacherChanges((prev) => {
                    const next = new Map(prev);
                    next.set(row.teacherId, {
                        ...(next.get(row.teacherId) ?? {}),
                        [columnId]: value as string,
                    });
                    return next;
                });
            } else {
                setProjectChanges((prev) => {
                    const next = new Map(prev);
                    next.set(row.id, {
                        ...(next.get(row.id) ?? {}),
                        [columnId]: value as never,
                    });
                    return next;
                });
            }
        },
        [data],
    );

    const handleSave = async () => {
        setSaving(true);
        try {
            const requests: Promise<Response>[] = [];

            for (const [projectId, changes] of projectChanges) {
                requests.push(
                    fetch(`/api/projects/${projectId}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(changes),
                    }),
                );
            }

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

            const results = await Promise.all(requests);
            const failed = results.filter((r) => !r.ok);

            if (failed.length > 0) {
                toast.error(
                    `${failed.length} update(s) failed. Please try again.`,
                );
            } else {
                toast.success("Changes saved successfully.");
                setProjectChanges(new Map());
                setTeacherChanges(new Map());
            }
        } catch {
            toast.error("Failed to save changes. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleDiscard = () => {
        setData(initialData);
        setProjectChanges(new Map());
        setTeacherChanges(new Map());
    };

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
            size: 200,
            cell: ({ getValue, row, column }) => (
                <StringSelectCell
                    value={getValue() as string}
                    options={[
                        "Individual Documentary",
                        "Group Documentary",
                        "Individual Exhibit",
                        "Group Exhibit",
                        "Individual Paper",
                        "Individual Performance",
                        "Group Performance",
                        "Individual Website",
                        "Group Website",
                    ]}
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
                <StringSelectCell
                    value={getValue() as string}
                    options={["General", "Junior", "Senior"]}
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
                <BooleanSelectCell
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
            size: 120,
            cell: ({ getValue, row, column }) => (
                <NumberInputCell
                    value={getValue() as number}
                    columnId={column.id}
                    rowId={String(row.index)}
                    onCommit={handleCommit}
                    onValidationError={(msg) => toast.error(msg)}
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

    return (
        <EditableTable
            data={data}
            columns={columns}
            hasChanges={hasChanges}
            saving={saving}
            onSave={handleSave}
            onDiscard={handleDiscard}
            isRowChanged={(row) =>
                projectChanges.has(row.original.id) ||
                teacherChanges.has(row.original.teacherId)
            }
            emptyMessage="No projects found for this year."
        />
    );
}
