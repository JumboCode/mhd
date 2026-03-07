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

export const columns: ColumnDef<Schools>[] = [
    {
        accessorKey: "name",
        size: 200,
        minSize: 100,
        maxSize: 400,
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
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
                    Implementaion Model
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
        size: 135,
        minSize: 135,
        maxSize: 250,
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
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
