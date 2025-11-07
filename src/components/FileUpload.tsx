"use client";

import React, { ReactEventHandler, useRef, useState, useEffect } from "react";

type UploadProps = {
    fileInfo?: File;
    //Might need this to be the json object itself instead of a string
    setFileInfo: React.Dispatch<React.SetStateAction<File | undefined>>;
};

export default function FileUpload({ fileInfo, setFileInfo }: UploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<any>();
    const [fileName, setFileName] = useState<string>("");
    const [isDragging, setIsDragging] = useState<boolean>(false);

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
                className="flex flex-col items-center justify-center rounded-lg p-4 border border-black-500 bg-gray-100 border-dashed w-full h-75 p-16 hover:bg-gray-200"
            >
                <h2 className="font-bold">Upload spreadsheet document here:</h2>
                <h2 className="">Click here or drop your XSLX document</h2>
                <input
                    type="file"
                    accept=".xlsx"
                    ref={fileInputRef}
                    onChange={handleChange}
                    style={{ display: "none" }}
                />

                <p> {fileName} </p>
            </button>
        </div>
    );
}
