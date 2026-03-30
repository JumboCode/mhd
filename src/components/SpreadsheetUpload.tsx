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
import { Button } from "./ui/button";
import { ChevronLeft } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

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
    const [yearStr, setYearStr] = useState("");
    const currYear = Number(yearStr);

    const handleYearInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (year) {
            const value = e.target.value;
            const newYear = Number(value);
            setYear(newYear);
            setYearStr(value);
        }
    };

    const incrementYear = () => {
        if (year && currYear < 2100) {
            const newYear = currYear + 1;
            setYear(newYear);
            setYearStr(String(newYear));
        }
    };

    const decrementYear = () => {
        if (year && currYear > 2000) {
            const newYear = currYear - 1;
            setYear(newYear);
            setYearStr(String(newYear));
        }
    };

    useEffect(() => {
        setYearStr(String(year));
    }, [year]);

    return (
        <div>
            <div className="flex flex-col gap-4">
                <h1 className="text-2xl font-bold">Upload Spreadsheet</h1>
                <h2 className="text-md">
                    It&apos;s a new year! Time to upload the data required. You
                    can download the expected file format here.
                </h2>

                <h2 className="text-base mt-4">Year</h2>

                <div className="flex items-center w-[180px] rounded-md overflow-hidden shadow-sm">
                    {/* Left Arrow Button */}
                    <Button
                        variant="outline"
                        onClick={decrementYear}
                        className="h-9 w-10 flex items-center justify-center rounded-none border-r-0 shadow-none"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {/* Year Input */}
                    <input
                        type="number"
                        id="year"
                        name="Year"
                        value={yearStr}
                        onChange={handleYearInput}
                        className="h-9 w-[100px] text-center border-y border-input focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />

                    {/* Right Arrow Button */}
                    <Button
                        variant="outline"
                        onClick={incrementYear}
                        className="h-9 w-10 flex items-center justify-center rounded-none border-l-0 shadow-none"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
                <div className="m-5" />
                <FileUpload fileInfo={file} setFileInfo={setFile} />
            </div>
        </div>
    );
}
