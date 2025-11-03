"use client";

import React, { ReactEventHandler, useRef, useState } from "react";

type UploadProps = {
    filename: string;
    setFilename: React.Dispatch<React.SetStateAction<string>>;
};

export default function FileUpload({ filename, setFilename }: UploadProps) {
    const fileInputRef = useRef(null);
    const [file, setFile] = useState();

    const handleClick = () => {
        fileInputRef.current.click();
    };

    const handleChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFile(file);
        }
    };

    return (
        <div>
            <button
                onClick={handleClick}
                className="flex flex-col items-center rounded-lg p-4 border border-gray-300 bg-gray-100 border-dashed w-150 p-16 hover:bg-gray-200"
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
                <h2 className="">{file}</h2>
            </button>
        </div>
    );
}
