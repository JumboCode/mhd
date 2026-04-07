/***************************************************************
 *
 *                Columns.tsx
 *
 *         Author: Anne Wu & Justin Ngan
 *           Date: 12/6/2025
 *
 *        Summary: Component to control the columns used in the
 *                 school data table
 *
 **************************************************************/

"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ChevronsUpDownSort } from "@/components/icons/ChevronsUpDownSort";
import { EditableCell, StringSelectCell } from "@/components/EditableCells";

const DIVISION_OPTIONS = [
    "Junior Division (6-8)",
    "Senior Division (9-12)",
    "Young Historian",
];

const IMPLEMENTATION_MODEL_OPTIONS = [
    "Curricular requirement (class or grade level)",
    "Co-curricular club",
    "Student participate independently",
    "Other",
];

const SCHOOL_TYPE_OPTIONS = [
    "Public School",
    "Public Charter",
    "Private/Independent",
    "Private/Parochial/Religious",
    "Other",
];

export type Schools = {
    name: string;
    city: string;
    region: string;
    division: string[];
    implementationModel: string;
    schoolType: string;
    numStudents: number;
    numTeachers: number;
    numProjects: number;
    trend: string; // TODO: calculate trend and change type if needed
};

export function createColumns(
    onCommit: (
        rowName: string,
        columnId: string,
        value: string | number | boolean,
    ) => void,
): ColumnDef<Schools>[] {
    return [
        {
            accessorKey: "name",
            size: 200,
            minSize: 100,
            maxSize: 400,
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        className="hover:bg-transparent"
                        onClick={() => {
                            if (column.getIsSorted() === "desc") {
                                column.clearSorting();
                            } else {
                                column.toggleSorting(
                                    column.getIsSorted() === "asc",
                                );
                            }
                        }}
                    >
                        Name
                        <ChevronsUpDownSort
                            sortDirection={column.getIsSorted()}
                            className="ml-2"
                        />
                    </Button>
                );
            },
        },
        {
            accessorKey: "city",
            size: 150,
            minSize: 95,
            maxSize: 300,
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        className="hover:bg-transparent"
                        onClick={() => {
                            if (column.getIsSorted() === "desc") {
                                column.clearSorting();
                            } else {
                                column.toggleSorting(
                                    column.getIsSorted() === "asc",
                                );
                            }
                        }}
                    >
                        City
                        <ChevronsUpDownSort
                            sortDirection={column.getIsSorted()}
                            className="ml-2"
                        />
                    </Button>
                );
            },
            cell: ({ getValue, row, column }) => (
                <EditableCell
                    value={getValue() as string}
                    columnId={column.id}
                    rowId={String(row.original.name)}
                    onCommit={onCommit}
                />
            ),
        },
        {
            accessorKey: "region",
            size: 150,
            minSize: 115,
            maxSize: 300,
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        className="hover:bg-transparent"
                        onClick={() => {
                            if (column.getIsSorted() === "desc") {
                                column.clearSorting();
                            } else {
                                column.toggleSorting(
                                    column.getIsSorted() === "asc",
                                );
                            }
                        }}
                    >
                        Region
                        <ChevronsUpDownSort
                            sortDirection={column.getIsSorted()}
                            className="ml-2"
                        />
                    </Button>
                );
            },
        },
        {
            accessorKey: "division",
            size: 200,
            minSize: 160,
            maxSize: 350,
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    className="hover:bg-transparent"
                    onClick={() => {
                        if (column.getIsSorted() === "desc") {
                            column.clearSorting();
                        } else {
                            column.toggleSorting(
                                column.getIsSorted() === "asc",
                            );
                        }
                    }}
                >
                    Division
                    <ChevronsUpDownSort
                        sortDirection={column.getIsSorted()}
                        className="ml-2"
                    />
                </Button>
            ),
            cell: ({ getValue }) => (
                <span>{(getValue() as string[]).join(", ")}</span>
            ),
        },
        {
            accessorKey: "implementationModel",
            size: 210,
            minSize: 210,
            maxSize: 350,
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    className="hover:bg-transparent"
                    onClick={() => {
                        if (column.getIsSorted() === "desc") {
                            column.clearSorting();
                        } else {
                            column.toggleSorting(
                                column.getIsSorted() === "asc",
                            );
                        }
                    }}
                >
                    Implementation Model
                    <ChevronsUpDownSort
                        sortDirection={column.getIsSorted()}
                        className="ml-2"
                    />
                </Button>
            ),
            cell: ({ getValue, row, column }) => (
                <StringSelectCell
                    value={getValue() as string}
                    options={IMPLEMENTATION_MODEL_OPTIONS}
                    rowId={String(row.original.name)}
                    columnId={column.id}
                    onCommit={onCommit}
                />
            ),
        },
        {
            accessorKey: "schoolType",
            size: 210,
            minSize: 180,
            maxSize: 350,
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    className="hover:bg-transparent"
                    onClick={() => {
                        if (column.getIsSorted() === "desc") {
                            column.clearSorting();
                        } else {
                            column.toggleSorting(
                                column.getIsSorted() === "asc",
                            );
                        }
                    }}
                >
                    School Type
                    <ChevronsUpDownSort
                        sortDirection={column.getIsSorted()}
                        className="ml-2"
                    />
                </Button>
            ),
            cell: ({ getValue, row, column }) => (
                <StringSelectCell
                    value={getValue() as string}
                    options={SCHOOL_TYPE_OPTIONS}
                    rowId={String(row.original.name)}
                    columnId={column.id}
                    onCommit={onCommit}
                />
            ),
        },
        {
            accessorKey: "numStudents",
            size: 135,
            minSize: 135,
            maxSize: 250,
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        className="hover:bg-transparent"
                        onClick={() => {
                            if (column.getIsSorted() === "desc") {
                                column.clearSorting();
                            } else {
                                column.toggleSorting(
                                    column.getIsSorted() === "asc",
                                );
                            }
                        }}
                    >
                        # Students
                        <ChevronsUpDownSort
                            sortDirection={column.getIsSorted()}
                            className="ml-2"
                        />
                    </Button>
                );
            },
        },
        {
            accessorKey: "numTeachers",
            size: 135,
            minSize: 135,
            maxSize: 250,
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        className="hover:bg-transparent"
                        onClick={() => {
                            if (column.getIsSorted() === "desc") {
                                column.clearSorting();
                            } else {
                                column.toggleSorting(
                                    column.getIsSorted() === "asc",
                                );
                            }
                        }}
                    >
                        # Teachers
                        <ChevronsUpDownSort
                            sortDirection={column.getIsSorted()}
                            className="ml-2"
                        />
                    </Button>
                );
            },
        },
        {
            accessorKey: "numProjects",
            size: 130,
            minSize: 130,
            maxSize: 250,
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        className="hover:bg-transparent"
                        onClick={() => {
                            if (column.getIsSorted() === "desc") {
                                column.clearSorting();
                            } else {
                                column.toggleSorting(
                                    column.getIsSorted() === "asc",
                                );
                            }
                        }}
                    >
                        # Projects
                        <ChevronsUpDownSort
                            sortDirection={column.getIsSorted()}
                            className="ml-2"
                        />
                    </Button>
                );
            },
        },
    ];
}
