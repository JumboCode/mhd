"use client";

import React from "react";
import { CircleX, FileChartColumn } from "lucide-react";
import { ErrorReport } from "@/lib/error-identification";

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
                    <div className="bg-muted px-2 rounded border flex items-center gap-1">
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
                    {errorReport.errors.length === 0 ? (
                        <div className="text-center py-2 text-[#646464]">
                            No errors found
                        </div>
                    ) : (
                        errorReport.errors.map((err, idx) => (
                            <div
                                key={idx}
                                className="flex items-start gap-3 border-b last:border-b-0 py-2"
                            >
                                <CircleX className="ml-3 mt-1 w-5 h-5 text-destructive shrink-0" />
                                <span className="text-base text-[#202020]">
                                    {err.type}
                                    {err.args && err.args.length > 0 && (
                                        <>: {err.args.join(", ")}</>
                                    )}
                                </span>
                            </div>
                        ))
                    )}
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
