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
import React from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    useReactTable,
    SortingState,
    getSortedRowModel,
    ColumnResizeMode,
} from "@tanstack/react-table";

import {
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
    globalFilter: string;
    setGlobalFilter: (value: string) => void;
}

export function SchoolsDataTable<TData, TValue>({
    columns,
    data,
    globalFilter,
    setGlobalFilter,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnResizeMode] = React.useState<ColumnResizeMode>("onChange");

    const table = useReactTable({
        data,
        columns,
        columnResizeMode,
        getSortedRowModel: getSortedRowModel(), //May not need this?
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

    return (
        //Example code should be changed
        //border for school name column disappears when scrolling right
        <div className="h-full overflow-auto rounded-md border text-center">
            <table
                className="caption-bottom text-sm border-separate border-spacing-0"
                style={{
                    width: table.getCenterTotalSize(),
                    tableLayout: "fixed",
                }}
            >
                <TableHeader className="sticky top-0 z-10">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead
                                        key={header.id}
                                        className={
                                            header.index === 0
                                                ? "sticky left-0 z-30 text-center bg-muted border-r border-b relative"
                                                : "text-center border-r border-b z-0 bg-muted relative"
                                        }
                                        style={{
                                            width: header.getSize(),
                                            maxWidth: header.getSize(),
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
                                                ? " text-center sticky left-0 z-20 bg-muted border-r border-b"
                                                : " text-center z-0 border-b"
                                        }
                                        style={{
                                            width: cell.column.getSize(),
                                            maxWidth: cell.column.getSize(),
                                        }}
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
                                            <div>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext(),
                                                )}
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
            </table>
        </div>
    );
}
