/***************************************************************
 *
 *                SpreadsheetUpload.tsx
 *
 *         Author: Will O'Leary & Zander Barba
 *           Date: 11/14/2025
 *
 *        Summary: UI for the file uploading process, includes
 *        year selection and file selection
 *
 **************************************************************/

"use client";

import type React from "react";
import FileUpload from "@/components/FileUpload";
import YearInput from "@/components/YearInput";

type UploadProps = {
    file?: File;
    setFile: React.Dispatch<React.SetStateAction<File | undefined>>;
    year?: number | null;
    setYear: (year: number | null) => void;
};

export default function SpreadsheetUpload({
    file,
    setFile,
    year,
    setYear,
}: UploadProps) {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold">Spreadsheet Upload</h1>
                <p className="text-sm text-muted-foreground">
                    Upload data for a given year. Select the year below — a
                    green dot indicates data already exists for that year
                    (continuing this process will overwrite said data), while a
                    red dot indicates no data exists yet. Next, choose your
                    spreadsheet file in the box below. You&apos;ll be able to
                    preview and confirm this file on the following pages before
                    finalizing.
                </p>
            </div>

            <div className="flex flex-col gap-2">
                <h2 className="text-base font-medium">Year</h2>
                <YearInput year={year} setYear={setYear} />
            </div>

            <div className="flex flex-col gap-2">
                <h2 className="text-base font-medium">File</h2>
                <FileUpload fileInfo={file} setFileInfo={setFile} />
            </div>
        </div>
    );
}
