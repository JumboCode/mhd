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

import React from "react";
import { CircleX, FileChartColumn } from "lucide-react";

type PreviewProps = {
    fileName: string;
    numRows: number;
};

export default function SpreadsheetPreviewFail({
    fileName,
    numRows,
}: PreviewProps) {
    // TO DO: Add table of errors identified with preprocessing functions
    return (
        <>
            <div className="flex flex-col items-center gap-12 max-w-lg">
                <div className="flex flex-col items-center gap-2 w-full">
                    <CircleX className="w-16 h-16 text-red-500" />
                    <h2 className="text-xl font-bold mt-5">
                        This file can&apos;t be imported
                    </h2>
                    <p className="text-base text-[#646464]">
                        We found x errors with your file
                    </p>
                </div>
                <div className="flex flex-col gap-4 w-full">
                    <div className="flex gap-4 items-center">
                        <p className="font-bold w-32">File</p>
                        <div className="bg-gray-100 px-2 rounded border flex items-center gap-1">
                            <FileChartColumn className="h-4 text-gray-600" />
                            <p>{fileName}</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <p className="font-bold w-32">Rows Found</p>
                        <p>{numRows} rows</p>
                    </div>
                </div>
                <div className="self-start flex flex-col w-full gap-4">
                    <h2 className="font-bold text-xl">Errors</h2>
                    {/* Placeholder for table to be placed here */}
                    <div className="border rounded-lg w-full h-32"></div>
                </div>
                <div>
                    <p className="text-[#646464] text-base">
                        Please fix these issues in your spreadsheet (e.g.,
                        Excel, Google Sheets) and re-upload the file.
                    </p>
                </div>
            </div>
        </>
    );
}
