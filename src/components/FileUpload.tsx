/***************************************************************
 *
 *                FileUpload.tsx
 *
 *         Author: Will O'Leary & Zander Barba
 *           Date: 11/14/2025
 *
 *        Summary: Allow a user to upload a file through drag
 *        and drop or selection.
 *
 **************************************************************/

"use client";

import { FileUp as FileUploadIcon } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

type UploadProps = {
    fileInfo?: File;
    setFileInfo: React.Dispatch<React.SetStateAction<File | undefined>>;
};

export default function FileUpload({ fileInfo, setFileInfo }: UploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState<string>("");
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [fileError, setFileError] = useState<string>("");

    const ACCEPTED_EXTENSIONS = [".xlsx", ".csv"];
    const ACCEPTED_MIME_TYPES = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/csv",
        "application/csv",
    ];

    const isValidFile = (file: File): boolean => {
        const hasValidExtension = ACCEPTED_EXTENSIONS.some((ext) =>
            file.name.toLowerCase().endsWith(ext),
        );
        const hasValidMime =
            ACCEPTED_MIME_TYPES.includes(file.type) || file.type === "";
        return hasValidExtension && hasValidMime;
    };

    useEffect(() => {
        setFileName(fileInfo?.name || "");
    }, [fileInfo]);

    const handleClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFiles = (files: FileList | null) => {
        if (files && files.length > 0) {
            const file = files[0];
            if (!isValidFile(file)) {
                setFileError(
                    `Invalid file type "${file.name}". Only XLSX files are accepted.`,
                );
                return;
            }
            setFileError("");
            setFileName(file.name);
            setFileInfo(file);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFiles(e.target.files);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        handleFiles(e.dataTransfer.files);
        setIsDragging(false);
    };

    useEffect(() => {
        const preventDefault = (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
        };

        document.addEventListener("dragover", preventDefault);
        document.addEventListener("drop", preventDefault);

        return () => {
            document.removeEventListener("dragover", preventDefault);
            document.removeEventListener("drop", preventDefault);
        };
    }, []);

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="cursor-pointer"
        >
            <button
                type="button"
                onClick={handleClick}
                className={`flex flex-col items-center justify-center gap-6 rounded-lg py-20 border-2 border-dashed w-full hover:bg-accent transition duration-300 cursor-pointer
                    ${fileError ? "border-destructive" : "border-border"} ${isDragging ? "bg-accent" : "bg-muted"}`}
            >
                <FileUploadIcon
                    size={64}
                    className={fileError ? "text-destructive" : ""}
                />
                <div className="flex flex-col gap-1">
                    {fileError ? (
                        <>
                            <h2 className="font-bold text-destructive">
                                {fileError}
                            </h2>
                            <h2 className="text-destructive/80">
                                Click here or drop another XLSX or CSV file to
                                try again
                            </h2>
                        </>
                    ) : (
                        <>
                            <h2 className="font-bold">
                                Upload spreadsheet document here
                            </h2>
                            <h2 className="">
                                Click here or drop your XLSX or CSV document
                            </h2>
                        </>
                    )}
                </div>
                <input
                    type="file"
                    accept=".xlsx,.csv"
                    ref={fileInputRef}
                    onChange={handleChange}
                    style={{ display: "none" }}
                />
                {fileName && !fileError && <p>{fileName}</p>}
            </button>
        </div>
    );
}
