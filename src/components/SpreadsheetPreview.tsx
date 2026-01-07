/***************************************************************
 *
 *                SpreadsheetPreview.tsx
 *
 *         Author: Will O'Leary & Zander Barba
 *           Date: 11/14/2025
 *
 *        Summary: Given a xlsx file, give some information about
 *        the contents of the file and display a preview of the
 *        first 5 rows
 *
 **************************************************************/
"use client";

import { useState, useEffect } from "react";
import { DataTable } from "./DataTable";
import { CircleCheck, FileChartColumn } from "lucide-react";
import type { CellValue, SpreadsheetData } from "@/types/spreadsheet";
import { requiredColumns } from "@/lib/required-spreadsheet-columns";

type PreviewProps = {
    fileName: string;
    numRows: number;
    spreadsheetData: SpreadsheetData;
};

export default function SpreadsheetPreview({
    fileName,
    numRows,
    spreadsheetData,
}: PreviewProps) {
    const [cols, setCols] = useState<
        { id: string; accessorKey: string; header: string }[]
    >([]);
    const [rows, setRows] = useState<CellValue[][]>([]);
    const [numCols, setNumCols] = useState<number>(0);

    useEffect(() => {
        if (!spreadsheetData || spreadsheetData.length === 0) return;

        // Get header row and normalize column names
        const headerRow = spreadsheetData[0];
        const normalizeColumnName = (name: CellValue): string => {
            return String(name || "")
                .toLowerCase()
                .replace(/\s+/g, "");
        };

        // Create a map of normalized header names to their column indices
        const headerMap = new Map<string, number>();
        headerRow.forEach((header, index) => {
            headerMap.set(normalizeColumnName(header), index);
        });

        // Find column indices for each required column
        const columnMapping: {
            index: number;
            name: string;
            displayName: string;
        }[] = [];

        requiredColumns.forEach((requiredCol) => {
            const normalizedRequired = normalizeColumnName(requiredCol);
            const columnIndex = headerMap.get(normalizedRequired);

            if (columnIndex !== undefined) {
                // Convert camelCase to readable display name
                const displayName = requiredCol
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())
                    .trim();

                columnMapping.push({
                    index: columnIndex,
                    name: requiredCol,
                    displayName,
                });
            }
        });

        // Create columns with sequential accessorKeys
        const cols = columnMapping.map((col, arrayIndex) => ({
            id: String(arrayIndex),
            accessorKey: String(arrayIndex),
            header: col.displayName,
        }));

        // Extract only the required columns from each row
        // Skip the first row (index 0) as it contains headers, take rows 1-5
        const filteredRows = spreadsheetData
            .slice(1, 6)
            .map((row) => columnMapping.map((col) => row[col.index]));

        setNumCols(columnMapping.length);
        setCols(cols);
        setRows(filteredRows);
    }, [spreadsheetData]);

    return (
        <>
            <div className="flex flex-col items-center gap-12">
                <div className="flex flex-col items-center">
                    <CircleCheck className="w-16 h-16 text-primary" />
                    <h2 className="text-xl font-bold mt-5">
                        Your file looks good
                    </h2>
                </div>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <div className="flex gap-4 items-center">
                            <p className="font-bold w-32">File</p>
                            <div className="bg-muted px-2 rounded border flex items-center gap-1">
                                <FileChartColumn className="h-4 text-muted-foreground" />
                                <p>{fileName}</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <p className="font-bold w-32">Rows Found</p>
                            <p>{numRows} rows</p>
                        </div>
                        <div className="flex gap-4">
                            <p className="font-bold w-32">Columns</p>
                            <p>
                                {numCols} required columns were found and mapped
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <h2 className="text-xl font-bold mt-5 ">Data sample</h2>
                        <p className="text-muted-foreground">
                            Here are the first 5 rows from your file
                        </p>
                    </div>
                </div>
                <div className="whitespace-nowrap overflow-x-auto max-w-2xl mb-10">
                    <DataTable data={rows} columns={cols} />
                </div>
            </div>
        </>
    );
}
