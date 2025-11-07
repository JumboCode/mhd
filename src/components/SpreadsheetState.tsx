"use client";

import React, { ReactElement, useState } from "react";
import SpreadsheetConfirmation from "./SpreadsheetConfirmation";
import SpreadsheetUpload from "./SpreadsheetUpload";
import SpreadsheetPreview from "./SpreadsheetPreview";
import SpreadsheetPreviewFail from "./SpreadsheetPreviewFail";

export default function SpreadsheetState() {
    const [file, setFile] = useState<File | undefined>();
    const [tab, setTab] = useState<ReactElement>(
        <SpreadsheetUpload file={file} setFile={setFile} />,
    );
    const [tabIndex, setTabIndex] = useState(0);
    const [canNext, setCanNext] = useState<boolean>(true);
    const [canPrevious, setCanPrevious] = useState<boolean>(false);
    const [isFormatted, setIsFormatted] = useState<boolean>(false);

    function checkFormat() {}

    function next() {
        if (canNext) {
            switchTab(tabIndex + 1);
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
            setTab(<SpreadsheetUpload file={file} setFile={setFile} />);

            setCanPrevious(false);
        } else if (tabIndex === 1) {
            setTabIndex(1);
            if (isFormatted) {
                setTab(<SpreadsheetPreview file={file} />);
                setCanNext(true);
            } else {
                setTab(<SpreadsheetPreviewFail />);
                setCanNext(false);
            }

            setCanPrevious(true);
        } else if (tabIndex === 2) {
            setTabIndex(2);
            setTab(<SpreadsheetConfirmation />);

            setCanNext(false);
        }
    }

    return (
        <div>
            <div className="flex flex-col items-center justify-between mx-110 mt-25 h-150">
                <div className="flex flex-row justify-between w-100 font-semibold pb-5">
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
                            Next
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
