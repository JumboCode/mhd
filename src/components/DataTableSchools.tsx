/***************************************************************
 *
 *                DataTableSchools,tsx
 *
 *         Author: Anne Wu & Justin Ngan
 *           Date: 12/6/2025
 *
 *        Summary: Component to display school table
 *
 **************************************************************/

"use client";
import React, { ReactNode } from "react";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    useReactTable,
    SortingState,
    getSortedRowModel,
    Cell,
    Row,
} from "@tanstack/react-table";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import Link from "next/link";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    prevData: TData[];
    globalFilter: string;
    setGlobalFilter: (value: string) => void;
}

export function SchoolsDataTable<TData, TValue>({
    columns,
    data,
    prevData,
    globalFilter,
    setGlobalFilter,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([]);

    const table = useReactTable({
        data,
        columns,
        getSortedRowModel: getSortedRowModel(), //May not need this?
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        globalFilterFn: "includesString",
        state: {
            sorting,
            globalFilter,
        },
    });

    /**
     * yoyChange
     * Calculates the yoy change for applicable fields of the data table
     * @param cell The cell of the table to calculate year over year change for
     * returns: A lucide react icon, either up arrow, down arrow, or dash, and a
     *          number corresponding to the percent change
     */
    function yoyChange(cell: Cell<TData, number>, row: Row<TData>): ReactNode {
        // Check if it is in students/teachers/projects column
        if (
            cell.column.getIndex() !== 5 &&
            cell.column.getIndex() !== 6 &&
            cell.column.getIndex() !== 7
        ) {
            return <></>;
        }
        const rowIndex: number = row.index;
        const prevRow = prevData[rowIndex] as Record<string, number>;

        if (!prevRow) return <></>;
        const colIndex: number = cell.column.getIndex();
        const prevYearValue: number = prevRow[cell.column.id] ?? 0;
        const diff = cell.getValue() - prevYearValue;

        const percentChange =
            prevYearValue !== 0 ? Math.abs(diff / prevYearValue) * 100 : 0;

        const formattedPercent = percentChange.toFixed(0);
        if (percentChange < 0.5) {
            return (
                <div className="flex items-center justify-center space-x-1 text-[#808080]">
                    <Minus />
                    {formattedPercent}%
                </div>
            );
        } else if (diff > 0) {
            return (
                <div className="flex items-center justify-center space-x-1 text-[#46A758]">
                    <ArrowUp />
                    {formattedPercent}%
                </div>
            );
        } else if (diff < 0) {
            return (
                <div className="flex items-center justify-center space-x-1 text-[#E5484D]">
                    <ArrowDown />
                    {formattedPercent}%
                </div>
            );
        }

        // If so, calc year over year change
        // Render icon/number based on that
    }

    return (
        //Example code should be changed
        //border for school name column disappears when scrolling right
        <div className="h-full overflow-auto rounded-md border text-center">
            <Table className="border-separate border-spacing-0">
                <TableHeader className="sticky top-0 z-10">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead
                                        key={header.id}
                                        className={
                                            header.index === 0
                                                ? "sticky left-0 z-30 text-center bg-muted border-r border-b min-w-[200px] w-[200px]"
                                                : "text-center border-r border-b z-0 bg-muted"
                                        }
                                    >
                                        <div>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef
                                                          .header,
                                                      header.getContext(),
                                                  )}
                                        </div>
                                    </TableHead>
                                );
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell
                                        key={cell.id}
                                        className={
                                            cell.column.getIndex() === 0
                                                ? " text-center sticky left-0 z-20 bg-muted border-r border-b min-w-[200px] w-[200px]"
                                                : " text-center z-0 border-b"
                                        }
                                    >
                                        {cell.column.getIndex() === 0 ? (
                                            <Link
                                                href={`/schools/${String(cell.getValue()).replaceAll(" ", "-").toLowerCase()}`}
                                                className="hover:underline"
                                            >
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext(),
                                                )}
                                            </Link>
                                        ) : (
                                            <div className="flex flex-row items-center justify-center space-x-1 gap-2 h-12">
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext(),
                                                )}
                                                {yoyChange(cell, row)}
                                            </div>
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
                                No schools found
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
