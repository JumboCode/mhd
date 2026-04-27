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
import { useState, useMemo, ReactNode } from "react";
import { TrendingUp, TrendingDown, Minus, AlertCircle, X } from "lucide-react";
import { standardize } from "@/lib/string-standardize";

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
    prevYearError?: string | null;
    selectedYear?: number | null;
}

const METRIC_BY_COL_INDEX: Record<number, string> = {
    6: "total-student-count", // numStudents
    7: "total-teacher-count", // numTeachers
    8: "total-project-count", // numProjects
};

function buildChartUrl(
    schoolName: string,
    colIndex: number,
    selectedYear: number,
): string {
    const params = new URLSearchParams({
        measuredAs: METRIC_BY_COL_INDEX[colIndex],
        startYear: String(selectedYear - 4),
        endYear: String(selectedYear),
        schools: schoolName,
    });
    return `/chart?${params.toString()}`;
}

export function SchoolsDataTable<TData, TValue>({
    columns,
    data,
    prevData,
    globalFilter,
    setGlobalFilter,
    isLoading = false,
    prevYearError = null,
    selectedYear = null,
}: DataTableProps<TData, TValue>) {
    const [showPrevYearError, setShowPrevYearError] = useState(true);
    const [sorting, setSorting] = useState<SortingState>([
        {
            id: "name",
            desc: false,
        },
    ]);
    const [columnResizeMode] = useState<ColumnResizeMode>("onChange");

    const table = useReactTable({
        data,
        columns,
        columnResizeMode,
        getSortedRowModel: getSortedRowModel(),
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
    // Build a name→row map so trend lookup is O(1) and immune to sort order
    const prevDataMap = useMemo(() => {
        const map = new Map<string, Record<string, number>>();
        for (const row of prevData) {
            const r = row as Record<string, unknown>;
            if (typeof r.name === "string") {
                map.set(r.name, r as Record<string, number>);
            }
        }
        return map;
    }, [prevData]);

    function yoyChange(cell: Cell<TData, number>, row: Row<TData>): ReactNode {
        // Check if it is in students/teachers/projects column
        if (
            cell.column.getIndex() !== 5 &&
            cell.column.getIndex() !== 6 &&
            cell.column.getIndex() !== 7
        ) {
            return <></>;
        }

        const schoolName = (row.original as Record<string, unknown>)
            .name as string;
        const prevRow = prevDataMap.get(schoolName);

        if (!prevRow) return <></>;
        const prevYearValue: number = (prevRow[cell.column.id] as number) ?? 0;
        const currValue: number = cell.getValue();

        if (currValue === 0 || prevYearValue === 0) return <></>;

        const diff = currValue - prevYearValue;
        const percentChange = Math.abs(diff / prevYearValue) * 100;

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
        <div className="h-full w-full min-w-0 flex flex-col">
            {prevYearError && showPrevYearError && (
                <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border-b border-yellow-200 text-yellow-900 text-sm">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span className="flex-1">{prevYearError}</span>
                    <button
                        onClick={() => setShowPrevYearError(false)}
                        className="flex-shrink-0 hover:bg-yellow-100 rounded p-1"
                        aria-label="Dismiss"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}
            <div className="flex-1 overflow-auto overscroll-none text-left">
                <Table
                    className="caption-bottom text-sm border-separate border-spacing-0"
                    style={{
                        minWidth: table.getCenterTotalSize(),
                        width: "100%",
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
                                                    ? "sticky top-0 left-0 z-40 text-left bg-muted border-r border-b relative"
                                                    : "sticky top-0 z-30 text-left border-r border-b bg-muted relative"
                                            }
                                            style={{
                                                width: header.getSize(),
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
                                                          header.column
                                                              .columnDef.header,
                                                          header.getContext(),
                                                      )}
                                            </div>
                                            <div
                                                onMouseDown={(e) => {
                                                    e.stopPropagation();
                                                    header.getResizeHandler()(
                                                        e,
                                                    );
                                                }}
                                                onTouchStart={(e) => {
                                                    e.stopPropagation();
                                                    header.getResizeHandler()(
                                                        e,
                                                    );
                                                }}
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
                                    data-state={
                                        row.getIsSelected() && "selected"
                                    }
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className={
                                                cell.column.getIndex() === 0
                                                    ? "text-left sticky left-0 z-20 bg-muted border-r border-b overflow-hidden"
                                                    : selectedYear &&
                                                        METRIC_BY_COL_INDEX[
                                                            cell.column.getIndex()
                                                        ] !== undefined
                                                      ? "text-left z-0 border-b overflow-hidden p-0"
                                                      : "text-left z-0 border-b overflow-hidden"
                                            }
                                            style={{
                                                width: cell.column.getSize(),
                                                ...(cell.column.getIndex() ===
                                                    0 && {
                                                    position: "sticky",
                                                    left: 0,
                                                }),
                                            }}
                                        >
                                            {cell.column.getIndex() === 0 ? (
                                                <Link
                                                    href={`/schools/${standardize(String(cell.getValue()))}/${((cell.row.original as { city: string }).city ?? "").toLowerCase().replace(/\s+/g, "-")}`}
                                                    className="hover:underline block truncate"
                                                >
                                                    {flexRender(
                                                        cell.column.columnDef
                                                            .cell,
                                                        cell.getContext(),
                                                    )}
                                                </Link>
                                            ) : selectedYear &&
                                              METRIC_BY_COL_INDEX[
                                                  cell.column.getIndex()
                                              ] !== undefined ? (
                                                <Link
                                                    href={buildChartUrl(
                                                        (
                                                            row.original as Record<
                                                                string,
                                                                unknown
                                                            >
                                                        ).name as string,
                                                        cell.column.getIndex(),
                                                        selectedYear,
                                                    )}
                                                    className="flex items-center h-12 w-full group"
                                                >
                                                    <div className="flex flex-row items-center gap-2 w-full rounded-lg px-3 py-2 group-hover:bg-border transition-colors">
                                                        <span className="group-hover:underline underline-offset-2">
                                                            {flexRender(
                                                                cell.column
                                                                    .columnDef
                                                                    .cell,
                                                                cell.getContext(),
                                                            )}
                                                        </span>
                                                        {yoyChange(cell, row)}
                                                    </div>
                                                </Link>
                                            ) : (
                                                <div className="flex flex-row items-center space-x-1 gap-2 h-12 px-1 py-2 truncate">
                                                    {flexRender(
                                                        cell.column.columnDef
                                                            .cell,
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
        </div>
    );
}
