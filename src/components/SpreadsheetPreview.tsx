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

import React, { useState, useEffect } from "react";
import { DataTable } from "./data-table";
import { CircleCheck, FileChartColumn } from "lucide-react";

type PreviewProps = {
    file?: File;
    spreadsheetData: any[][];
};

export default function SpreadsheetPreview({
    file,
    spreadsheetData,
}: PreviewProps) {
    const [cols, setCols] = useState<any[]>([]);
    const [rows, setRows] = useState<any[][]>([]);
    const [numRows, setNumRows] = useState<number>(0);
    const [numCols, setNumCols] = useState<number>(0);

    useEffect(() => {
        if (!spreadsheetData || spreadsheetData.length === 0) return;

        // Map of column indexes to their actual names
        const columnNames: { [key: number]: string } = {
            4: "City",
            13: "Grade",
            17: "Division",
            19: "Teacher First",
            20: "Teacher Last",
            21: "Teacher Email",
            23: "Project Id",
            24: "Title",
            34: "Team Project",
            37: "School Name",
        };

        const desiredIndexes = [4, 13, 17, 19, 20, 21, 23, 24, 34, 37];

        // Create columns with sequential accessorKeys (0, 1, 2, etc.)
        const cols = desiredIndexes.map((colIndex, arrayIndex) => ({
            id: String(arrayIndex),
            accessorKey: String(arrayIndex),
            header: columnNames[colIndex] || `Column ${colIndex}`,
        }));

        // Remap rows to only include the desired columns in order
        // Skip the first row (index 0) as it contains headers, take rows 1-5
        const filteredRows = spreadsheetData
            .slice(1, 6)
            .map((row: any[]) => desiredIndexes.map((index) => row[index]));

        setNumRows(spreadsheetData.length - 1); // Subtract 1 for header row
        setNumCols(desiredIndexes.length);
        setCols(cols);
        setRows(filteredRows);
    }, [spreadsheetData]);

    return (
        <>
            <div className="flex flex-col items-center gap-12">
                <div className="flex flex-col items-center">
                    <CircleCheck className="w-16 h-16 text-green-500" />
                    <h2 className="text-xl font-bold mt-5">
                        Your file looks good
                    </h2>
                </div>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <div className="flex gap-4 items-center">
                            <p className="font-bold w-32">File</p>
                            <div className="bg-gray-100 px-2 rounded border flex items-center gap-1">
                                <FileChartColumn className="h-4 text-gray-600" />
                                <p>{file?.name ?? "None"}</p>
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
                        <p className="text-gray-600">
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
