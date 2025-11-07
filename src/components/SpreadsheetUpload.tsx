"use client";

import FileUpload from "@/components/FileUpload";
import React, { ReactEventHandler, useState } from "react";

type UploadProps = {
    file?: File;
    setFile: React.Dispatch<React.SetStateAction<File | undefined>>;
};

export default function SpreadsheetUpload({ file, setFile }: UploadProps) {
    return (
        <div>
            {/* Page Title */}
            <div className="flex flex-col items-left justify-left pb-10">
                <h1 className="text-2xl font-bold mt-8">Upload Spreadsheet</h1>
                <h2 className="text-xl">
                    It’s a new year! Time to upload the data required. You can
                    download the expected file format here.
                </h2>
                <h2 className="text-xl">Year</h2>
                <FileUpload fileInfo={file} setFileInfo={setFile} />
            </div>
        </div>
    );
}
