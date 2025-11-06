"use client";

import { TableColumnsSplit } from "lucide-react";
// import {React, useRef} from "react";
import { useState } from "react";
import { MdOutlineUploadFile } from "react-icons/md";
import * as XLSX from "xlsx";
import React, { useRef } from "react";

export default function SpreadsheetUpload() {
    const [file, setFile] = useState<File | null>(null);
    const [spreadsheetData, setSpreadsheetData] = useState<File | null>(null);

    // Save the file
    const handleFileDrop = (event: React.DragEvent<HTMLInputElement>) => {
        console.log("in handleFileDrop");
        event.preventDefault();
        const file = event.dataTransfer?.files[0];
        if (!file) {
            console.log("Invalid file!!!");
            return;
        }
        //console.log(files);
        const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
        if (
            fileExtension != ".xlsx" &&
            fileExtension != ".xlsm" &&
            fileExtension != ".xls"
        ) {
            console.log("Invalid file!!!");
            // console.log(file.name.split('.').pop());
        }
        console.log("your dropped a file!!!");
        setFile(file);
    };

    const uploadFile = () => {
        console.log("upload file popup");
        // const inputFile = useRef(null);
        // fileInputRef.current.click();
    };

    const handleSubmit = () => {
        if (!file) {
            return;
        }
        const reader = new FileReader();
        reader.onload = (event: ProgressEvent<FileReader>) => {
            const data = event.target?.result;
            if (data) {
                //const data = await file.arrayBuffer();
                const workbook = XLSX.read(file);
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json_data = XLSX.utils.sheet_to_json(worksheet, {
                    header: 1,
                });
                console.log(json_data);
            }
        };
        reader.readAsBinaryString(file);
    };

    //We find it a bit odd that the "drop box" doesn't darken / highlight if something it dragged onto it
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
                <select className="border-gray-400 border-1 rounded-md pl-2 pr-2 m-2 self-start justify-self-start">
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                </select>

                <div
                    onDrop={handleFileDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={uploadFile}
                    className="bg-[#EDEDED] flex flex-col items-center justify-center rounded-md w-full h-1/3 border-dashed border-gray-400 my-6 border-2"
                >
                    <MdOutlineUploadFile className="w-full text-7xl pb-2" />
                    <span>Upload spreadsheet document here</span>
                    <span className="font-thin">
                        Click here or drop your XLSX document
                    </span>
                </div>
                {/* <input
                
                className="w-full h-1/3"
                onDrop={handleFileDrop}
                onClick={uploadFile}
                id="fileInput"
                placeholder=""
                type="file"
                multiple
                accept=".xlsx, .xlsm, .xls"
            /> */}
                {/*The ticket seems to indicate that DB inserts happens immediently 
            upon file upload. This seems weird + may make testing painful 
            so we added a submit button*/}
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
