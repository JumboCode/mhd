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
import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    ChevronDown,
    ChevronsUpDown,
    ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
                    {column.getIsSorted() === "asc" ? (
                        <ChevronUp className="ml-2 h-4 w-4" />
                    ) : column.getIsSorted() === "desc" ? (
                        <ChevronDown className="ml-2 h-4 w-4" />
                    ) : (
                        <ChevronsUpDown className="ml-2 h-4 w-4" />
                    )}
                </Button>
            );
        },
    },
    {
        accessorKey: "city",
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
                    {column.getIsSorted() === "asc" ? (
                        <ChevronUp className="ml-2 h-4 w-4" />
                    ) : column.getIsSorted() === "desc" ? (
                        <ChevronDown className="ml-2 h-4 w-4" />
                    ) : (
                        <ChevronsUpDown className="ml-2 h-4 w-4" />
                    )}
                </Button>
            );
        },
    },
    {
        accessorKey: "region",
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
                    {column.getIsSorted() === "asc" ? (
                        <ChevronUp className="ml-2 h-4 w-4" />
                    ) : column.getIsSorted() === "desc" ? (
                        <ChevronDown className="ml-2 h-4 w-4" />
                    ) : (
                        <ChevronsUpDown className="ml-2 h-4 w-4 " />
                    )}
                </Button>
            );
        },
    },
    {
        accessorKey: "instructionModel",
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
                    {column.getIsSorted() === "asc" ? (
                        <ChevronUp className="ml-2 h-4 w-4" />
                    ) : column.getIsSorted() === "desc" ? (
                        <ChevronDown className="ml-2 h-4 w-4" />
                    ) : (
                        <ChevronsUpDown className="ml-2 h-4 w-4 " />
                    )}
                </Button>
            );
        },
    },
    {
        accessorKey: "implementationModel",
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
                    {column.getIsSorted() === "asc" ? (
                        <ChevronUp className="ml-2 h-4 w-4" />
                    ) : column.getIsSorted() === "desc" ? (
                        <ChevronDown className="ml-2 h-4 w-4" />
                    ) : (
                        <ChevronsUpDown className="ml-2 h-4 w-4 " />
                    )}
                </Button>
            );
        },
    },
    {
        accessorKey: "numStudents",
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
                    {column.getIsSorted() === "asc" ? (
                        <ChevronUp className="ml-2 h-4 w-4" />
                    ) : column.getIsSorted() === "desc" ? (
                        <ChevronDown className="ml-2 h-4 w-4" />
                    ) : (
                        <ChevronsUpDown className="ml-2 h-4 w-4 " />
                    )}
                </Button>
            );
        },
    },
    {
        accessorKey: "numTeachers",
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
                    {column.getIsSorted() === "asc" ? (
                        <ChevronUp className="ml-2 h-4 w-4" />
                    ) : column.getIsSorted() === "desc" ? (
                        <ChevronDown className="ml-2 h-4 w-4" />
                    ) : (
                        <ChevronsUpDown className="ml-2 h-4 w-4 " />
                    )}
                </Button>
            );
        },
    },
    {
        accessorKey: "numProjects",
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
                    {column.getIsSorted() === "asc" ? (
                        <ChevronUp className="ml-2 h-4 w-4" />
                    ) : column.getIsSorted() === "desc" ? (
                        <ChevronDown className="ml-2 h-4 w-4" />
                    ) : (
                        <ChevronsUpDown className="ml-2 h-4 w-4" />
                    )}
                </Button>
            );
        },
    },
];
