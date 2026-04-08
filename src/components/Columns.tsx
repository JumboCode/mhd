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

// Placeholder options — replace with real values once DB columns exist
const MODEL_OPTIONS = ["Dummy 1", "Dummy 2", "Dummy 3"];

// Normalize school name formatting in table
function toTitleCase(str: string) {
    return str
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

export type Schools = {
    name: string;
    city: string;
    region: string;
    instructionModel: string;
    implementationModel: string;
    numStudents: number;
    numTeachers: number;
    numProjects: number;
    trend: string; //TODO: calculate trend and change type if needed
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
            cell: ({ getValue, row, column }) => {
                const rawValue = getValue() as string;
                const formattedValue = toTitleCase(rawValue);

                return (
                    <EditableCell
                        value={formattedValue}
                        columnId={column.id}
                        rowId={String(row.original.name)}
                        onCommit={onCommit}
                    />
                );
            },
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
            accessorKey: "instructionModel",
            size: 185,
            minSize: 185,
            maxSize: 350,
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
                        Instruction Model
                        <ChevronsUpDownSort
                            sortDirection={column.getIsSorted()}
                            className="ml-2"
                        />
                    </Button>
                );
            },
            cell: ({ getValue, row, column }) => (
                <StringSelectCell
                    value={getValue() as string}
                    options={MODEL_OPTIONS}
                    rowId={String(row.index)}
                    columnId={column.id}
                    onCommit={() => {}} // TODO: wire up once DB column exists
                />
            ),
        },
        {
            accessorKey: "implementationModel",
            size: 210,
            minSize: 210,
            maxSize: 350,
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
                        Implementation Model
                        <ChevronsUpDownSort
                            sortDirection={column.getIsSorted()}
                            className="ml-2"
                        />
                    </Button>
                );
            },
            cell: ({ getValue, row, column }) => (
                <StringSelectCell
                    value={getValue() as string}
                    options={MODEL_OPTIONS}
                    rowId={String(row.index)}
                    columnId={column.id}
                    onCommit={() => {}} // TODO: wire up once DB column exists
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
