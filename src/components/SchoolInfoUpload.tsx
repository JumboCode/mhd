/***************************************************************
 *
 *                SchoolInfoUpload.tsx
 *
 *        Summary: UI for the school info spreadsheet upload step.
 *
 **************************************************************/

"use client";

import type React from "react";
import FileUpload from "@/components/FileUpload";

type SchoolInfoUploadProps = {
    schoolInfoFile?: File;
    setSchoolInfoFile: React.Dispatch<React.SetStateAction<File | undefined>>;
};

export default function SchoolInfoUpload({
    schoolInfoFile,
    setSchoolInfoFile,
}: SchoolInfoUploadProps) {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold">School Info Upload</h1>
                <p className="text-sm text-muted-foreground">
                    Upload the school info spreadsheet. This file should include
                    each school&apos;s name, ID, division, implementation model,
                    and school type. You&apos;ll be able to preview it before
                    continuing.
                </p>
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex items-end justify-between">
                    <h2 className="text-base font-medium">School Info</h2>
                    <a
                        href="/school_template.xlsx"
                        download
                        onClick={(e) => e.stopPropagation()}
                        className="text-sm text-primary underline float-right mb-1"
                    >
                        Download template
                    </a>
                </div>
                <FileUpload
                    fileInfo={schoolInfoFile}
                    setFileInfo={setSchoolInfoFile}
                />
            </div>
        </div>
    );
}
