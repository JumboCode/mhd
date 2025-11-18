/***************************************************************
 *
 *                SpreadsheetPreviewFail.tsx
 *
 *         Author: Will O'Leary & Zander Barba
 *           Date: 11/14/2025
 *
 *        Summary: UI for a failed spreadsheet upload, displays
 *        if the wrong type of data is uploaded, should include
 *        some information about the spreadsheet.
 *
 **************************************************************/

"use client";

import React, { useState } from "react";
import { CircleX, FileChartColumn } from "lucide-react";
import { ExcelRenderer } from "react-excel-renderer";

type PreviewProps = {
    file?: File;
};

export default function SpreadsheetPreviewFail({ file }: PreviewProps) {
    const [numRows, setNumRows] = useState<number>(0);

    // Need cols e, n, r, t, u, v, x, y, AI, AL
    ExcelRenderer(file, (err: any, resp: any) => {
        if (err) {
            console.log(err);
        } else {
            var count = 0;
            while (
                count < resp.rows.length &&
                typeof resp.rows[count][1] === "string" &&
                resp.rows[count][1].trim() !== undefined &&
                resp.rows[count][1].trim() !== ""
            ) {
                count++;
            }

            setNumRows(count);
        }
    });

    return (
        <>
            <div className="flex flex-col items-center gap-12">
                <div className="flex flex-col items-center">
                    <CircleX className="w-16 h-16 text-red-500" />
                    <h2 className="text-xl font-bold mt-5">
                        This file can't be imported
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
                    </div>
                </div>
            </div>
        </>
    );
}
