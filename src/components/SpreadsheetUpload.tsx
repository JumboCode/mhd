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

import FileUpload from "@/components/FileUpload";
import YearDropdown from "@/components/YearDropdown";

import React from "react";

type UploadProps = {
    file?: File;
    setFile: React.Dispatch<React.SetStateAction<File | undefined>>;
    year?: number | null;
    setYear: (year: number | null | undefined) => void;
};

export default function SpreadsheetUpload({
    file,
    setFile,
    year,
    setYear,
}: UploadProps) {
    return (
        <div>
            {/* Page Title */}
            <div className="flex flex-col items-left justify-left pb-10">
                <h1 className="text-2xl font-bold mt-8 mb-5">
                    Upload Spreadsheet
                </h1>
                <h2 className="text-lg mb-5">
                    It's a new year! Time to upload the data required. You can
                    download the expected file format here.
                </h2>
                <h2 className="text-lg">Year</h2>
                <YearDropdown selectedYear={year} onYearChange={setYear} />
                <div className="m-5" />
                <FileUpload fileInfo={file} setFileInfo={setFile} />
            </div>
        </div>
    );
}
