/***************************************************************
 *
 *                SpreadsheetPreviewFail.tsx
 *
 *         Author: Will O'Leary & Zander Barba
 *           Date: 11/14/2025
 *
 *        Summary: UI for a failed spreadsheet upload, displays
 *        if the wrong type of data is uploaded, should include
 *        some information about the spreadsheet.
 *
 **************************************************************/

"use client";

import React from "react";

type PreviewProps = {
    file?: File;
};

export default function SpreadsheetPreviewFail({ file }: PreviewProps) {
    return (
        <div>
            <div className="flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold mt-5">
                    This file can't be imported
                </h2>
                <p className="font-bold text-gray-500 mt-5">
                    Contains missing/unrecognized columns
                </p>
            </div>
        </div>
    );
}
