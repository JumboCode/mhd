"use client";

import FileUpload from "@/components/FileUpload";
import React, { ReactEventHandler, useState } from "react";

type UploadProps = {
    filename: string;
    setFilename: React.Dispatch<React.SetStateAction<string>>;
};

export default function SpreadsheetUpload({
    filename,
    setFilename,
}: UploadProps) {
    return (
        <div>
            {/* Page Title */}
            <div className="flex flex-col items-left justify-left p-8">
                <h1 className="text-2xl font-bold mt-8">Upload Spreadsheet</h1>
                <h2 className="text-xl">
                    It’s a new year! Time to upload the data required. You can
                    download the expected file format here.
                </h2>
                <h2 className="text-xl">Year</h2>
                <FileUpload filename={filename} setFilename={setFilename} />
            </div>
        </div>
    );
}
