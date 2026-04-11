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

export function createColumns(): ColumnDef<Schools>[] {
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
            size: 160,
            minSize: 160,
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
                        School Type
                        <ChevronsUpDownSort
                            sortDirection={column.getIsSorted()}
                            className="ml-2"
                        />
                    </Button>
                );
            },
        },
        {
            accessorKey: "implementationModel",
            size: 220,
            minSize: 220,
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
        },
        {
            accessorKey: "numStudents",
            size: 145,
            minSize: 145,
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
            size: 140,
            minSize: 140,
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
            size: 140,
            minSize: 140,
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
