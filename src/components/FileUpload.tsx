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

import React, { useRef, useState, useEffect } from "react";
import { FileUp as FileUploadIcon } from "lucide-react";

type UploadProps = {
    fileInfo?: File;
    setFileInfo: React.Dispatch<React.SetStateAction<File | undefined>>;
};

export default function FileUpload({ fileInfo, setFileInfo }: UploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<any>();
    const [fileName, setFileName] = useState<string>("");
    const [isDragging, setIsDragging] = useState<boolean>(false);

    useEffect(() => {
        setFile(fileInfo);
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
            setFile(file);
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
        >
            <button
                onClick={handleClick}
                className={`flex flex-col items-center justify-center gap-6 rounded-lg py-20 border-2 border-dashed border-gray-300 w-full hover:bg-gray-200 transition duration-300
                    ${isDragging ? "bg-gray-300" : "bg-gray-100"}`}
            >
                <FileUploadIcon size={64} />
                <div className="flex flex-col gap-1">
                    <h2 className="font-bold">
                        Upload spreadsheet document here
                    </h2>
                    <h2 className="">Click here or drop your XLSX document</h2>
                </div>
                <input
                    type="file"
                    accept=".xlsx"
                    ref={fileInputRef}
                    onChange={handleChange}
                    style={{ display: "none" }}
                />
                {fileName && <p>{fileName}</p>}
            </button>
        </div>
    );
}
