"use client";

import React from "react";
import { useState } from "react";
import { MdOutlineUploadFile } from "react-icons/md";

export default function SpreadsheetUpload() {
    const [spreadsheet, setSpreadsheet] = useState<File | null>(null);

    const handleFileDrop = (event: DragEventHandler<HTMLInputElement>) => {
        event.preventDefault();
        const file = event.dataTransfer?.files[0];
        //console.log(files);
        const fileExtension = "." + file.name.split(".").pop().toLowerCase();
        if (
            fileExtension != ".xlsx" &&
            fileExtension != ".xlsm" &&
            fileExtension != ".xls"
        ) {
            console.log("Invalid file!!!");
            // console.log(file.name.split('.').pop());
        }
        console.log("your dropped a file!!!");
    };

    const uploadFile = () => {
        console.log("upload file popup");
    };

    return (
        <div className="p-4 flex flex-col items-center content-center text-center ">
            <label
                htmlFor="fileInput"
                className="bg-gray-400 rounded-md w-50 h-50"
            >
                <MdOutlineUploadFile className="p-2 w-full text-7xl" />
                <span>Upload spreadsheet document here</span>
                <br />
                <span className="font-thin">
                    Click here or drop your XLSX document
                </span>
            </label>
            <input
                hidden
                className="block w-50 h-50"
                onDrop={handleFileDrop}
                onClick={uploadFile}
                id="fileInput"
                placeholder=""
                type="file"
                multiple
                accept=".xlsx, .xlsm, .xls"
            />
        </div>
    );
}
