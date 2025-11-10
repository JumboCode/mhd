"use client";

import React, { useState, useEffect } from "react";
import { ExcelRenderer } from "react-excel-renderer";
import { DataTable } from "./data-table";

type PreviewProps = {
    file?: File;
};

export default function SpreadsheetPreview({ file }: PreviewProps) {
    const [cols, setCols] = useState<any[]>([]);
    const [rows, setRows] = useState<any[][]>([]);
    const [numRows, setNumRows] = useState<number>(0);
    const [numCols, setNumCols] = useState<number>(0);

    //Need cols e, n, r, t, u, v, x, y, AI, AL
    ExcelRenderer(file, (err: any, resp: any) => {
        if (err) {
            console.log(err);
        } else {
            const desiredIndexes = [4, 13, 17, 19, 20, 21, 23, 24, 34, 37];

            const cols = resp.cols
                .filter((col: any) => desiredIndexes.includes(col.key))
                .map((col: any) => ({
                    id: String(col.key),
                    accessorKey: String(col.key),
                }));
            setNumRows(resp.rows.length);
            setNumCols(desiredIndexes.length);

            setCols(cols);
            setRows(resp.rows.slice(0, 5));
        }
    });

    return (
        <>
            <div className="flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold mt-5">
                    Your file looks good
                </h2>
                <div className="flex flex-col w-100 my-10 space-y-2">
                    <div className="flex justify-between">
                        <p className="font-bold">File:</p>
                        <div className="bg-gray-200 px-5 rounded-lg">
                            <p className="text-right">{file?.name ?? "None"}</p>
                        </div>
                    </div>

                    <div className="flex justify-between">
                        <p className="font-bold">Rows found:</p>
                        <p className="text-right">{numRows}</p>
                    </div>

                    <div className="flex justify-between">
                        <p className="font-bold">Columns:</p>
                        <p className="text-right">{numCols}</p>
                    </div>

                    <h2 className="text-xl font-bold mt-5 ">Data sample</h2>
                    <p className="text-gray-600">
                        Here are the first 5 rows from your file
                    </p>
                </div>
                <div className="whitespace-nowrap overflow-x-auto max-w-[800px] mb-10">
                    <DataTable data={rows} columns={cols} />
                </div>
            </div>
        </>
    );
}
