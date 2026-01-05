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
import YearDropdown from "@/components/YearDropdown";

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
        <div>
            <div className="flex flex-col gap-4">
                <h1 className="text-2xl font-bold">Upload Spreadsheet</h1>
                <h2 className="text-md">
                    It&apos;s a new year! Time to upload the data required. You
                    can download the expected file format here.
                </h2>
                <div className="flex flex-col gap-2">
                    <h2 className="text-base mt-4">Year</h2>
                    <YearDropdown
                        showDataIndicator={true}
                        selectedYear={year}
                        onYearChange={setYear}
                    />
                </div>
                <div className="m-5" />
                <FileUpload fileInfo={file} setFileInfo={setFile} />
            </div>
        </div>
    );
}
