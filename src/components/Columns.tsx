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

import type { Column, ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ChevronsUpDownSort } from "@/components/icons/ChevronsUpDownSort";

function SortableHeader<T>({
    column,
    label,
}: {
    column: Column<T>;
    label: string;
}) {
    const handleSort = () => {
        if (column.getIsSorted() === "desc") {
            column.clearSorting();
        } else {
            column.toggleSorting(column.getIsSorted() === "asc");
        }
    };

    return (
        <div className="flex items-center gap-1">
            <span
                className="text-sm font-medium cursor-pointer"
                onClick={handleSort}
            >
                {label}
            </span>
            <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:bg-transparent"
                onClick={handleSort}
            >
                <ChevronsUpDownSort sortDirection={column.getIsSorted()} />
            </Button>
        </div>
    );
}

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

export function createColumns(): ColumnDef<Schools>[] {
    return [
        {
            accessorKey: "name",
            size: 200,
            minSize: 100,
            maxSize: 400,
            header: ({ column }) => (
                <SortableHeader column={column} label="Name" />
            ),
        },
        {
            accessorKey: "city",
            size: 150,
            minSize: 95,
            maxSize: 300,
            header: ({ column }) => (
                <SortableHeader column={column} label="City" />
            ),
        },
        {
            accessorKey: "region",
            size: 150,
            minSize: 115,
            maxSize: 300,
            header: ({ column }) => (
                <SortableHeader column={column} label="Region" />
            ),
        },
        {
            accessorKey: "division",
            size: 200,
            minSize: 160,
            maxSize: 350,
            header: ({ column }) => (
                <SortableHeader column={column} label="Division" />
            ),
        },
        {
            accessorKey: "implementationModel",
            size: 220,
            minSize: 220,
            maxSize: 350,
            header: ({ column }) => (
                <SortableHeader column={column} label="Implementation Model" />
            ),
        },
        {
            accessorKey: "schoolType",
            size: 210,
            minSize: 180,
            maxSize: 350,
            header: ({ column }) => (
                <SortableHeader column={column} label="School Type" />
            ),
        },
        {
            accessorKey: "numStudents",
            size: 145,
            minSize: 145,
            maxSize: 250,
            header: ({ column }) => (
                <SortableHeader column={column} label="# Students" />
            ),
        },
        {
            accessorKey: "numTeachers",
            size: 140,
            minSize: 140,
            maxSize: 250,
            header: ({ column }) => (
                <SortableHeader column={column} label="# Teachers" />
            ),
        },
        {
            accessorKey: "numProjects",
            size: 140,
            minSize: 140,
            maxSize: 250,
            header: ({ column }) => (
                <SortableHeader column={column} label="# Projects" />
            ),
        },
    ];
}
