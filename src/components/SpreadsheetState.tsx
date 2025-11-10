"use client";

import React, { ReactElement, useState, useEffect } from "react";
import SpreadsheetConfirmation from "./SpreadsheetConfirmation";
import SpreadsheetUpload from "./SpreadsheetUpload";
import SpreadsheetPreview from "./SpreadsheetPreview";
import SpreadsheetPreviewFail from "./SpreadsheetPreviewFail";
import SpreadsheetStatusBar from "@/components/SpreadsheetStatusBar";
import * as XLSX from "xlsx";

export default function SpreadsheetState() {
    const [file, setFile] = useState<File | undefined>();
    const [year, setYear] = useState<number | null>();
    const [tab, setTab] = useState<ReactElement>(
        <SpreadsheetUpload
            file={file}
            setFile={setFile}
            year={year}
            setYear={setYear}
        />,
    );
    const [tabIndex, setTabIndex] = useState(0);
    const [canNext, setCanNext] = useState<boolean>(false);
    const [canPrevious, setCanPrevious] = useState<boolean>(false);
    const [isFormatted, setIsFormatted] = useState<boolean>(true);

    const [nextText, setNextText] = useState("Next");

    (useEffect(() => {
        checkForUploadNext();
    }),
        [file]);

    (useEffect(() => {
        checkForUploadNext();
    }),
        [year]);

    function checkForUploadNext() {
        if (tabIndex === 0) {
            setCanNext(year != null && file != null);
        }
    }

    function handleFile(file: File) {
        setFile(file);
        setCanNext(true);
    }

    function checkFormat(callback: (formatted: boolean) => void) {
        if (!file) {
            return;
        }

        const reader = new FileReader();

        reader.onload = function (e) {
            if (!e.target?.result) {
                callback(false);
                return;
            }

            const data = new Uint8Array(e.target.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: "array" });

            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, {
                header: 1,
                defval: "",
            });

            if (jsonData.length === 0) {
                callback(false);
                return;
            }

            const headers = jsonData[0] as string[];
            const requiredColumns = [
                "City",
                "Grade",
                "Division",
                "Teacher First",
                "Teacher Last",
                "Teacher Email",
                "Project Id",
                "Title",
                "Team Project",
                "School Name",
            ];

            const hasAllColumns = requiredColumns.every((col) =>
                headers.includes(col),
            );

            callback(hasAllColumns);
        };

        reader.readAsArrayBuffer(file);
    }

    function next() {
        if (canNext) {
            switchTab((tabIndex + 1) % 3);
        }
    }

    function previous() {
        if (canPrevious) {
            switchTab(tabIndex - 1);
        }
    }

    function switchTab(tabIndex: Number) {
        if (tabIndex === 0) {
            setTabIndex(0);
            setTab(
                <SpreadsheetUpload
                    file={file}
                    setFile={setFile}
                    year={year}
                    setYear={setYear}
                />,
            );

            setCanPrevious(false);
            setNextText("Next");
        } else if (tabIndex === 1) {
            setTabIndex(1);
            checkFormat((formatted) => {
                setIsFormatted(formatted);

                if (formatted) {
                    setTab(<SpreadsheetPreview file={file} />);
                    setCanNext(true);
                } else {
                    setTab(<SpreadsheetPreviewFail />);
                    setCanNext(false);
                }
            });

            setNextText("Next");
            setCanPrevious(true);
        } else if (tabIndex === 2) {
            setTabIndex(2);
            setTab(<SpreadsheetConfirmation file={file} />);
            setNextText("Finish");
            setCanNext(true);
        }
    }

    return (
        <div>
            <div className="flex flex-col items-center justify-between mx-110 mt-25 h-150">
                <div className="w-115">
                    <SpreadsheetStatusBar tabIndex={tabIndex} maxTabs={2} />
                </div>
                <div className="flex flex-row justify-between w-full font-semibold py-5 px-25">
                    <p>Upload</p>
                    <p>Preview</p>
                    <p>Confirmation</p>
                </div>

                <div className="h-full">{tab}</div>

                <div className="flex justify-between w-full">
                    {canPrevious && (
                        <button
                            className="bg-blue-700 px-4 py-2 rounded-lg w-40 bg-white text-black border border-gray-300 hover:bg-gray-200"
                            onClick={previous}
                        >
                            Previous
                        </button>
                    )}

                    {canNext && (
                        <button
                            className="bg-blue-700 px-4 py-2 rounded-lg w-40 bg-blue-700 text-white hover:bg-blue-900"
                            onClick={next}
                        >
                            {nextText}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
