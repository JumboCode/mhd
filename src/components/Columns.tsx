"use client";

import { ColumnDef } from "@tanstack/react-table";

export type Schools = {
    name: string;
    city: string;
    region: string;
    instructionModel: string;
    implementationModel: string;
    numStudents: number;
    numTeachers: number;
    trend: string; //TODO: calculate trend and change type if needed
};

export const columns: ColumnDef<Schools>[] = [
    { accessorKey: "trend", header: "Trend" },
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "city",
        header: "City",
    },
    {
        accessorKey: "region",
        header: "Region",
    },
    {
        accessorKey: "instructionModel",
        header: "Instruction Model",
    },
    {
        accessorKey: "implementationModel",
        header: "Implementation Model",
    },
    {
        accessorKey: "numStudents",
        header: "# Students",
    },
    {
        accessorKey: "numTeachers",
        header: "# Teachers",
    },
];
