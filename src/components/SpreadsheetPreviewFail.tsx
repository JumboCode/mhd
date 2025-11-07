"use client";

import FileUpload from "@/components/FileUpload";
import React, { ReactEventHandler, useState } from "react";

export default function SpreadsheetPreviewFail() {
    return (
        <div>
            <div className="flex flex-col items-left justify-left pb-10">
                Failed to Upload Spreadsheet
            </div>
        </div>
    );
}
