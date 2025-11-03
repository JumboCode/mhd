"use client";

import React, { ReactElement, useState } from "react";
import SpreadsheetConfirmation from "./SpreadsheetConfirmation";
import SpreadsheetUpload from "./SpreadsheetUpload";
import SpreadsheetPreview from "./SpreadsheetPreview";

export default function SpreadsheetState() {
    const [filename, setFilename] = useState("");
    const [tab, setTab] = useState<ReactElement>(
        <SpreadsheetUpload filename={filename} setFilename={setFilename} />,
    );
    const [tabIndex, setTabIndex] = useState(0);

    function render() {
        if (tabIndex === 0) {
            setTabIndex(1);
            setTab(<SpreadsheetPreview filename={filename} />);
        } else if (tabIndex === 1) {
            setTabIndex(2);
            setTab(<SpreadsheetConfirmation />);
        }
    }

    return (
        <div>
            {tab}
            <button className="bg-gray-700" onClick={render}>
                Next
            </button>
        </div>
    );
}
