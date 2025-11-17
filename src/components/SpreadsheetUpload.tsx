/**
 * SpreadSheetUpload.tsx (for data ingestion)
 * by Anne Wu and Chiara Martello
 * 11/16/25
 * Uploads spreadsheet through click or drag and drop to database
 */
"use client";

import { useState, useRef } from "react";
import { MdOutlineUploadFile } from "react-icons/md";
import * as XLSX from "xlsx";

export default function SpreadsheetUpload() {
    const [spreadsheetData, setSpreadsheetData] = useState<any[]>([]);
    const [year, setYear] = useState("2025");
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (file: File) => {
        const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();

        if (
            fileExtension !== ".xlsx" &&
            fileExtension !== ".xlsm" &&
            fileExtension !== ".xls"
        ) {
            alert("Please upload a .xlsx, .xlsm, or .xls file.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (event: ProgressEvent<FileReader>) => {
            const workbook = XLSX.read(event.target?.result, {
                type: "binary",
            });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            setSpreadsheetData(jsonData as any[]);
        };
        reader.readAsBinaryString(file);
    };

    const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);

        const file = event.dataTransfer?.files[0];
        if (!file) return;

        handleFileUpload(file);
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            handleFileUpload(files[0]);
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (spreadsheetData.length === 0) {
            alert("Please upload a file first.");
            return;
        }

        try {
            const response = await fetch("/api/import", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    formYear: year,
                    formData: JSON.stringify(spreadsheetData),
                }),
            });

            if (response.ok) {
                alert("Data sent successfully!");
            } else {
                throw new Error("Failed to upload data");
            }
        } catch (error) {
            console.error(error);
            alert("Error: " + error);
        }
    };

    return (
        <div>
            <p className="font-semibold text-lg p-2">Upload Spreadsheet</p>
            <p className="p-2">
                It's a new year! Time to upload the data required. You can
                download the expected file format <strong>here</strong>.
            </p>
            <p className="p-2">Year</p>
            <form
                onSubmit={handleSubmit}
                className="flex flex-col items-center h-screen content-center text-center"
            >
                <select
                    onChange={(e) => setYear(e.target.value)}
                    value={year}
                    className="border-gray-400 border-1 rounded-md pl-2 pr-2 m-2 self-start justify-self-start"
                >
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                </select>

                <div
                    onDrop={handleFileDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={handleClick}
                    className={`bg-[#EDEDED] flex flex-col items-center justify-center rounded-md w-full h-1/3 border-dashed border-2 my-6 ${
                        isDragging
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-400"
                    }`}
                >
                    <MdOutlineUploadFile className="w-full text-7xl pb-2" />
                    <span>Upload spreadsheet document here</span>
                    <span className="font-thin">
                        Click here or drop your XLSX document
                    </span>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".xlsx, .xlsm, .xls"
                />

                <button
                    type="submit"
                    className="bg-[#1447E6] rounded-sm p-2 text-white self-end"
                >
                    Next
                </button>
            </form>
        </div>
    );
}
