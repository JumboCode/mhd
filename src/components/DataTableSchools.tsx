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

import { Spinner } from "@/components/ui/spinner";

export function SchoolsDataTable<TData, TValue>({
    columns,
    data,
    globalFilter,
    setGlobalFilter,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    //const [globalFilter, setGlobalFilter] = React.useState([]);

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
        <div className="overflow-x-auto overflow-y-hidden rounded-md border text-center">
            {/* <input
                value={search}
                onChange={e => {table.setGlobalFilter(String(e.target.value)); setSearch(e.target.value)}}
                placeholder="Search"
            /> */}
            <Table className="border-separate border-spacing-0">
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead
                                        key={header.id}
                                        className={
                                            header.index === 0
                                                ? "sticky left-0 z-20 text-center bg-gray-100 border-r border-b"
                                                : "text-center border-r border-b z-0 "
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
                                                ? " text-center sticky left-0 z-20 bg-white border-r border-b-0"
                                                : " text-center z-0 border-b"
                                        }
                                    >
                                        {cell.column.getIndex() === 0 ? (
                                            <Link
                                                href={`/schools/${String(cell.getValue()).replaceAll(" ", "-")}`}
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
                                className="h-24"
                            >
                                <Spinner className="mx-auto size-8" />
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
