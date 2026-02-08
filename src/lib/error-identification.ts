import { requiredColumns } from "@/lib/required-spreadsheet-columns";

import type { SpreadsheetData } from "@/types/spreadsheet";
import { json } from "zod";
import { type ReactElement, useEffect, useState } from "react";

enum ErrorType {
    MISSING_COL = "Missing a column",
    MISSING_ENTRY = "Missing an entry",
    INVALID_TYPE = "Invalid data type",
}

export type SpreadsheetErrorTuple = {
    type: ErrorType;
    coords: string;
};

export type ErrorReport = {
    errors: SpreadsheetErrorTuple[];
    calculatedNumRows: number;
};

const expectedTypes: ("string" | "number" | "boolean")[] = [
    "string", // Student Last
    "string", // Student First
    "string", // Address 1
    "string", // Address 2
    "string", // City
    "string", // State
    "number", // Zip
    "string", // Student Phone
    "string", // Student Cell
    "string", // Student Email
    "string", // Parent Email
    "string", // Student Gender
    "string", // Student Ethnicity
    "number", // Grade
    "string", // Advanced
    "string", // Implementation model
    "string", // Returning student
    "string", // Division
    "number", // Student ID
    "string", // Teacher First
    "string", // Teacher Last
    "string", // Teacher Email
    "string", // Teacher Phone
    "number", // Project ID
    "string", // Title
    "number", // Category ID
    "string", // Category Name
    // sub category
    // project abstract
    // project plan
    // paper url
    // nhd web central url
    "string", // Entry video link
    // written materials
    "boolean", // Team project
    "string", // Team key
    "number", // Internal Project ID
    "string", // School ID
    // school type
    // gateway city
    // district id
    // district name
    // affiliate
    "number", // Fair ID
    "string", // FMS ID
    "number", // Id Int
    "string", // Media release allowed
    "string", // Media release sign date
    "string", // Hold harmless sign date
    "string", // Shwon permissions
    "number", // projectIntId
    "number", // idInt
    "string", // permission
];

function pushError(
    report: ErrorReport,
    type: ErrorType,
    row: number = -1,
    col: number = -1,
) {
    let coords = "N/A";

    if (row !== -1 && col !== -1) {
        const colLetter = colIndexToLetter(col);
        coords = `${colLetter}${row + 1}`; // +1 for 1-indexed like Excel
    }

    report.errors.push({
        type,
        coords,
    });
}

export function identifyErrors(jsonData: SpreadsheetData | null): ErrorReport {
    let report: ErrorReport = {
        errors: [],
        calculatedNumRows: 0,
    };

    // Perform error checks
    if (!jsonData || jsonData.length == 0) {
        pushError(report, ErrorType.INVALID_TYPE);
        return report;
    }

    checkColumns(jsonData, report);

    return report;
}

export function checkColumns(jsonData: SpreadsheetData, report: ErrorReport) {
    const headers = jsonData[0] as string[];

    const nonEmptyRows = jsonData
        .slice(1)
        .filter((row) =>
            row.some(
                (cell) => cell !== null && cell !== undefined && cell !== "",
            ),
        );
    report.calculatedNumRows = nonEmptyRows.length;

    const formattedHeaders = headers.map((header) =>
        header.toLowerCase().trim(),
    );

    const hasAllColumns = requiredColumns.every((col) =>
        formattedHeaders.includes(col.toLowerCase()),
    );

    if (!hasAllColumns) {
        // push error to report
        pushError(report, ErrorType.MISSING_COL);
    }
}

export function checkEntries(jsonData: SpreadsheetData, report: ErrorReport) {
    const headers = jsonData[0] as string[];

    const formattedHeaders = headers.map((header) =>
        header.toLowerCase().trim(),
    );

    const dataRows = jsonData.slice(1);

    requiredColumns.forEach((colName) => {
        const colIndex = formattedHeaders.indexOf(colName.toLowerCase().trim());
        // if you cant find column
        if (colIndex == -1) {
            return;
        }

        dataRows.forEach((row, rowIndex) => {
            const cell = row[colIndex];

            if (cell == null || cell == undefined || cell == "") {
                pushError(
                    report,
                    ErrorType.MISSING_ENTRY,
                    rowIndex + 2,
                    colIndex + 1,
                );
            }
        });
    });
}

export function colIndexToLetter(col: number): string {
    let letter = "";
    let n = col;

    while (n >= 0) {
        letter = String.fromCharCode((n % 26) + 65) + letter;
        n = Math.floor(n / 26) - 1;
    }

    return letter;
}

export function validDataType(jsonData: SpreadsheetData, report: ErrorReport) {}
