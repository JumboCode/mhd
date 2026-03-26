/***************************************************************
 *
 *                SpreadsheetPreviewFails.tsx
 *
 *         Author: Zander and Chiara
 *           Date: 2/16/2026
 *
 *          Modified by Steven on 3/23/26
 *
 *        Summary: Shows the errors in the spreadsheet
 *
 **************************************************************/
"use client";

import { CircleX, FileChartColumn } from "lucide-react";
import { ErrorReport, ErrorType } from "@/lib/error-identification";

type PreviewProps = {
    fileName: string;
    numRows: number;
    errorReport: ErrorReport;
};

export default function SpreadsheetPreviewFail({
    fileName,
    numRows,
    errorReport,
}: PreviewProps) {
    return (
        <div className="flex flex-col items-center gap-12 max-w-lg">
            {/* Header */}
            <div className="flex flex-col items-center gap-2 w-full">
                <CircleX className="w-16 h-16 text-destructive" />
                <h2 className="text-xl font-bold mt-5">
                    This file can&apos;t be imported
                </h2>
                <p className="text-base text-[#646464]">
                    We found {errorReport.errors.length}{" "}
                    {errorReport.errors.length === 1 ? "error" : "errors"} in
                    your file
                </p>
            </div>

            {/* File info */}
            <div className="flex flex-col gap-4 w-full">
                <div className="flex gap-4 items-center">
                    <p className="font-bold w-32">File</p>
                    <div className="bg-muted pl-1 pr-2 rounded border flex items-center gap-1">
                        <FileChartColumn className="h-4 text-muted-foreground" />
                        <p>{fileName}</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <p className="font-bold w-32">Rows Found</p>
                    <p>{numRows} rows</p>
                </div>
            </div>

            {/* Errors list */}
            <div className="self-start flex flex-col w-full gap-4">
                <h2 className="font-bold text-xl">Errors</h2>

                <div className="mx-5 border border-gray-300 rounded-xl bg-white p-2 flex flex-col gap-2">
                    {errorReport.errors.map((err, idx) => (
                        <div
                            key={idx}
                            className="flex items-center gap-3 border-b last:border-b-0 py-2"
                        >
                            <CircleX className="ml-3 w-5 h-5 text-destructive shrink-0" />
                            <span className="text-base text-[#202020]">
                                {err.type}
                                {err.type === ErrorType.INVALID_CELL_TYPE ? (
                                    <>
                                        :{" "}
                                        {err.args.map((cellErr, i) => (
                                            <span key={i}>
                                                {i > 0 && ", "}
                                                <span className="relative group inline-block cursor-default">
                                                    <span className="underline decoration-red-500 decoration-wavy underline-offset-4">
                                                        {cellErr.coord}
                                                    </span>
                                                    {/* Populates the tooltip */}
                                                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-start bg-white text-black text-xs rounded-lg px-3 py-2 shadow-lg border border-gray-200 w-48 z-10 pointer-events-none">
                                                        <span>
                                                            <span className="font-semibold">
                                                                Value:{" "}
                                                            </span>
                                                            {cellErr.value}
                                                        </span>
                                                        <span>
                                                            <span className="font-semibold">
                                                                Expected:{" "}
                                                            </span>
                                                            {cellErr.expected}
                                                        </span>
                                                    </span>
                                                </span>
                                            </span>
                                        ))}
                                    </>
                                ) : (
                                    err.args &&
                                    err.args.length > 0 && (
                                        <>: {err.args.join(", ")}</>
                                    )
                                )}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div>
                <p className="text-[#646464] text-base">
                    Please fix these issues in your spreadsheet (e.g., Excel,
                    Google Sheets) and re-upload the file.
                </p>
            </div>
        </div>
    );
}
