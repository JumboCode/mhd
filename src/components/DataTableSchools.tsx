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

    return (
        //Example code should be changed
        //border for school name column disappears when scrolling right
        <div className="overflow-x-auto rounded-md border text-center max-h-[calc(100vh-100px)] overflow-y-auto">
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
            </Table>
        </div>
    );
}
