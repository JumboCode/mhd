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
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { standardize } from "@/lib/school-name-standardize";

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    useReactTable,
    SortingState,
    getSortedRowModel,
    ColumnResizeMode,
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
import { SchoolsTableSkeleton } from "@/components/skeletons/SchoolsTableSkeleton";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    prevData: TData[];
    globalFilter: string;
    setGlobalFilter: (value: string) => void;
    isLoading?: boolean;
}

export function SchoolsDataTable<TData, TValue>({
    columns,
    data,
    prevData,
    globalFilter,
    setGlobalFilter,
    isLoading = false,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnResizeMode] = React.useState<ColumnResizeMode>("onChange");

    const table = useReactTable({
        data,
        columns,
        columnResizeMode,
        getSortedRowModel: getSortedRowModel(), // May not need this?
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        globalFilterFn: "includesString",
        enableColumnResizing: true,
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
        const prevYearValue: number = prevRow[cell.column.id] ?? 0;
        const diff = cell.getValue() - prevYearValue;

        const percentChange =
            prevYearValue !== 0 ? Math.abs(diff / prevYearValue) * 100 : 0;

        const formattedPercent = percentChange.toFixed(0);
        if (percentChange < 0.5) {
            return (
                <div className="flex items-center justify-center gap-1 text-[#808080]">
                    <Minus size={14} />
                    {formattedPercent}%
                </div>
            );
        } else if (diff > 0) {
            return (
                <div className="flex items-center justify-center gap-1 text-[#46A758]">
                    <TrendingUp size={14} />
                    {formattedPercent}%
                </div>
            );
        } else if (diff < 0) {
            return (
                <div className="flex items-center justify-center gap-1 text-[#E5484D]">
                    <TrendingDown size={14} />
                    {formattedPercent}%
                </div>
            );
        }
    }

    if (isLoading) {
        return <SchoolsTableSkeleton />;
    }

    return (
        <div className="h-full w-full min-w-0 overflow-auto border text-center">
            <Table
                className="caption-bottom text-sm border-separate border-spacing-0"
                style={{
                    width: table.getCenterTotalSize(),
                    tableLayout: "fixed",
                }}
            >
                <TableHeader className="bg-muted">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow
                            key={headerGroup.id}
                            className="bg-muted hover:bg-muted border-0"
                        >
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead
                                        key={header.id}
                                        className={
                                            header.index === 0
                                                ? "sticky top-0 left-0 z-40 text-center bg-muted border-r border-b relative"
                                                : "sticky top-0 z-30 text-center border-r border-b bg-muted relative"
                                        }
                                        style={{
                                            width: header.getSize(),
                                            maxWidth: header.getSize(),
                                            position: "sticky",
                                            top: 0,
                                            ...(header.index === 0 && {
                                                left: 0,
                                            }),
                                        }}
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
                                        <div
                                            onMouseDown={header.getResizeHandler()}
                                            onTouchStart={header.getResizeHandler()}
                                            className={`absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none hover:bg-blue-500 ${
                                                header.column.getIsResizing()
                                                    ? "bg-blue-500"
                                                    : ""
                                            }`}
                                        />
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
                                                ? "text-center sticky left-0 z-20 bg-muted border-r border-b"
                                                : "text-center z-0 border-b"
                                        }
                                        style={{
                                            width: cell.column.getSize(),
                                            maxWidth: cell.column.getSize(),
                                            ...(cell.column.getIndex() ===
                                                0 && {
                                                position: "sticky",
                                                left: 0,
                                            }),
                                        }}
                                    >
                                        {cell.column.getIndex() === 0 ? (
                                            <Link
                                                href={`/schools/${standardize(String(cell.getValue()))}`}
                                                className="hover:underline"
                                            >
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext(),
                                                )}
                                            </Link>
                                        ) : (
                                            <div className="flex flex-row items-center justify-center space-x-1 gap-2 h-12 px-1 py-2">
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
                        <TableRow></TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
