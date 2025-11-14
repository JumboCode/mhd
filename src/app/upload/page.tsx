/***************************************************************
 *
 *                page.tsx
 *
 *         Author: Will O'Leary & Zander Barba
 *           Date: 11/14/2025
 *
 *        Summary: Contains the spreadsheet upload pipeline,
 *        which allows a user to upload and preview data
 *
 **************************************************************/

import SpreadsheetState from "@/components/SpreadsheetState";

export default function UploadPage() {
    return (
        <div className="flex flex-col">
            <SpreadsheetState />
        </div>
    );
}
