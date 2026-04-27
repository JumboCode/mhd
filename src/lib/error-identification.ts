/***************************************************************
 *
 *                error-identification.ts
 *
 *         Author: Zander and Chiara
 *           Date: 2/16/2026
 *
 *          Modified by Steven on 3/23/26
 *
 *        Summary: Validates spreadsheet upload and reports errors
 *
 **************************************************************/

import {
    studentRequiredColumns,
    schoolRequiredColumns,
} from "@/lib/required-spreadsheet-columns";
import type { SpreadsheetData } from "@/types/spreadsheet";

/**
 * Enum representing the types of spreadsheet errors.
 */
export enum ErrorType {
    MISSING_COL = "Missing column",
    INVALID_TYPE = "Invalid spreadsheet type",
    INVALID_CELL_TYPE = "Invalid cell type",
    EMPTY_REQUIRED_CELL = "Empty Cell",
    EMPTY_ROW = "Empty row in middle of data",
}

/**
 * Represents a single spreadsheet error.
 */
export type CellTypeError = {
    coord: string;
    value: string;
    expected: ColumnType;
    allowedValues?: string[];
};

/**
 * Creates a discriminated union to hold more data for type errors.
 */
export type SpreadsheetErrorTuple =
    | { type: Exclude<ErrorType, ErrorType.INVALID_CELL_TYPE>; args: string[] }
    | { type: ErrorType.INVALID_CELL_TYPE; args: CellTypeError[] };

/**
 * Report containing all detected errors and additional metadata.
 */
export type ErrorReport = {
    errors: SpreadsheetErrorTuple[];
    calculatedNumRows: number;
};

/**
 * Supported column data types for validation.
 * enum validates against a list of allowed values (case/whitespace-insensitive).
 * If no valid values are configured, enum validation is skipped.
 */
export type ColumnType =
    | "string"
    | "number"
    | "boolean"
    | "date"
    | "string_or_number"
    | "optional_number"
    | "enum";

/**
 * Options to override which columns and types are validated.
 */
export type ColumnSpec = {
    /** Required column names (matched case/whitespace-insensitively). */
    columns: string[];
    /** Maps column name to expected type. */
    columnsDict: Record<string, ColumnType>;
    /**
     * Maps column name to allowed enum values.
     * An empty array means enum validation is skipped for that column.
     */
    enumValues?: Record<string, string[]>;
};

/**
 * Dictionary mapping required student column names to their expected types.
 */
export const studentRequiredColumnsDict: Record<string, ColumnType> = {
    schoolName: "string",
    city: "string",
    schoolId: "number",
    teacherName: "string",
    teacherEmail: "string",
    teacherId: "string_or_number",
    projectId: "number",
    title: "string",
    categoryId: "number",
    categoryName: "string",
    teamProject: "boolean",
};

/** Default column spec used for the main student spreadsheet. */
export const studentColumnSpec: ColumnSpec = {
    columns: studentRequiredColumns,
    columnsDict: studentRequiredColumnsDict,
};

/**
 * Dictionary mapping required school column names to their expected types.
 */
export const schoolRequiredColumnsDict: Record<string, ColumnType> = {
    "School name": "string",
    "School id": "number",
    "Town": "string",
    "Division": "string",
    "Implementation Model": "string",
    "School Type": "string",
    "# students who began project at the school level": "optional_number",
};

/** Column spec used for the school info spreadsheet. */
export const schoolColumnSpec: ColumnSpec = {
    columns: schoolRequiredColumns,
    columnsDict: {
        "School name": "string",
        "School id": "number",
        "Town": "string",
        "Division": "enum",
        "Implementation Model": "enum",
        "School Type": "enum",
        "# students who began project at the school level": "optional_number",
    },
    enumValues: {
        "Division": [
            "Junior Division (6-8)",
            "Senior Division (9-12)",
            "Young Historians (4-5)",
        ],
        "Implementation Model": [
            "Student participate independently",
            "Curricular requirement (class or grade level)",
            "Co-curricular club",
            "Other",
        ],
        "School Type": [
            "Public School",
            "Public Charter",
            "Private/ Independent",
            "Private/ Parochial/Religious",
            "Other",
        ],
    },
};

/**
 * Adds an error to the report.
 * @param report - The report object to update.
 * @param type - The type of error.
 * @param args - The arguments or coordinates associated with the error.
 */
function pushError(
    report: ErrorReport,
    type: ErrorType,
    args: string[] | CellTypeError[],
) {
    report.errors.push({ type, args } as SpreadsheetErrorTuple);
}

/**
 * Main entry point to identify spreadsheet errors.
 * @param jsonData - The spreadsheet data as an array of rows.
 * @param spec - Optional column spec override. Defaults to the main student spreadsheet columns.
 * @returns An ErrorReport containing all detected errors.
 */
export function identifyErrors(
    jsonData: SpreadsheetData | null,
    spec: ColumnSpec = studentColumnSpec,
): ErrorReport {
    const report: ErrorReport = {
        errors: [],
        calculatedNumRows: 0,
    };

    if (!jsonData || jsonData.length === 0) {
        pushError(report, ErrorType.INVALID_TYPE, []);
        return report;
    }

    trimTrailingAndCheckEmptyRows(jsonData, report);

    const validSheet: boolean = checkRequiredColumns(
        jsonData,
        report,
        spec.columns,
    );
    if (validSheet) {
        trimTownCommas(jsonData);
        checkRequiredColumnTypes(
            jsonData,
            report,
            spec.columnsDict,
            spec.enumValues,
        );
    }

    return report;
}

/**
 * Checks if a row is entirely empty.
 */
function isRowEmpty(row: (string | number | boolean | null | undefined)[]) {
    return row.every(
        (cell) => cell === null || cell === undefined || cell === "",
    );
}

/**
 * Trims trailing empty rows from jsonData (mutates the array).
 * Reports an error for any empty rows found in the middle of the data.
 * @param jsonData - The spreadsheet data.
 * @param report - The report to push errors into.
 */
function trimTrailingAndCheckEmptyRows(
    jsonData: SpreadsheetData,
    report: ErrorReport,
) {
    // Find the last non-empty data row (skip header at index 0)
    let lastNonEmptyIdx = 0;
    for (let i = jsonData.length - 1; i >= 1; i--) {
        if (!isRowEmpty(jsonData[i])) {
            lastNonEmptyIdx = i;
            break;
        }
    }

    // Trim trailing empty rows
    jsonData.length = lastNonEmptyIdx + 1;

    // Check for empty rows in the middle (between row 1 and lastNonEmptyIdx)
    const emptyRowNumbers: string[] = [];
    for (let i = 1; i < jsonData.length; i++) {
        if (isRowEmpty(jsonData[i])) {
            emptyRowNumbers.push(String(i + 1));
        }
    }

    if (emptyRowNumbers.length > 0) {
        pushError(report, ErrorType.EMPTY_ROW, emptyRowNumbers);
    }
}

/**
 * Removes ", MA" from all cells in the "city" column and trims whitespace.
 * @param jsonData - The spreadsheet data.
 */
function trimTownCommas(jsonData: SpreadsheetData) {
    const cityColIdx = jsonData[0].indexOf("town");

    for (let row = 1; row < jsonData.length; row++) {
        const currentRow = jsonData[row];
        const cell: string = String(currentRow[cityColIdx]);
        const output = cell.replace(", MA", "").trim();
        if (output !== cell) {
            currentRow[cityColIdx] = output;
        }
    }
}

/**
 * Checks if all required columns exist in the spreadsheet.
 * @param jsonData - The spreadsheet data.
 * @param report - The report to push errors into.
 * @returns True if all required columns are present, false otherwise.
 */
function checkRequiredColumns(
    jsonData: SpreadsheetData,
    report: ErrorReport,
    columns: string[],
): boolean {
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

    const missingColumns: string[] = columns.filter(
        (col) => !formattedHeaders.includes(col.toLowerCase()),
    );

    if (missingColumns.length > 0) {
        pushError(report, ErrorType.MISSING_COL, missingColumns);
    }

    return missingColumns.length === 0;
}

/**
 * Checks for empty cells and type mismatches in required columns.
 * Prioritizes empty cells and pushes at most two errors.
 * @param jsonData - The spreadsheet data.
 * @param report - The report to push errors into.
 */
function checkRequiredColumnTypes(
    jsonData: SpreadsheetData,
    report: ErrorReport,
    columnsDict: Record<string, ColumnType>,
    enumValues: Record<string, string[]> | undefined,
) {
    const headers = jsonData[0] as string[];
    const formattedHeaders = headers.map((header) =>
        header?.toString().toLowerCase().trim(),
    );

    const emptyCellCoords: string[] = [];
    const typeErrorCoords: CellTypeError[] = [];

    for (let row = 1; row < jsonData.length; row++) {
        const currentRow = jsonData[row];

        for (const [colName, expectedType] of Object.entries(columnsDict) as [
            string,
            ColumnType,
        ][]) {
            const colIdx = formattedHeaders.findIndex(
                (h) => h === colName.toLowerCase(),
            );
            if (colIdx === -1) continue;

            const cell = currentRow[colIdx];
            const coords = xytoCoords(row, colIdx);

            if (cell === null || cell === undefined || cell === "") {
                if (expectedType !== "optional_number") {
                    emptyCellCoords.push(coords);
                }
                continue;
            }

            let isValid = true;
            switch (expectedType) {
                case "string":
                    isValid = typeof cell === "string";
                    break;
                case "number":
                    isValid = !isNaN(Number(cell));
                    break;
                case "boolean":
                    isValid = typeof cell === "boolean";
                    break;
                case "date":
                    isValid = !isNaN(
                        new Date(cell as string | number).getTime(),
                    );
                    break;
                case "string_or_number":
                    isValid = typeof cell === "string" || !isNaN(Number(cell));
                    break;
                case "optional_number":
                    isValid = !isNaN(Number(cell));
                    if (!isValid) {
                        typeErrorCoords.push({
                            coord: coords,
                            value: String(cell),
                            expected: expectedType,
                            allowedValues: ["Number or empty cell"],
                        });
                        continue;
                    }
                    break;
                case "enum": {
                    const allowed = enumValues?.[colName];
                    if (allowed && allowed.length > 0) {
                        const parts = String(cell)
                            .split(",")
                            .map((p) => p.trim())
                            .filter(Boolean);
                        isValid =
                            parts.length > 0 &&
                            parts.every((part) =>
                                allowed.some(
                                    (v) =>
                                        v.toLowerCase().trim() ===
                                        part.toLowerCase(),
                                ),
                            );
                        if (!isValid) {
                            typeErrorCoords.push({
                                coord: coords,
                                value: String(cell),
                                expected: expectedType,
                                allowedValues: allowed,
                            });
                            continue;
                        }
                    }
                    break;
                }
                default:
                    isValid = true;
            }

            if (!isValid) {
                typeErrorCoords.push({
                    coord: coords,
                    value: String(cell),
                    expected: expectedType,
                });
            }
        }
    }

    const errorsToPush: SpreadsheetErrorTuple[] = [];

    // Empty cells take precedence
    if (emptyCellCoords.length > 0) {
        errorsToPush.push({
            type: ErrorType.EMPTY_REQUIRED_CELL,
            args: emptyCellCoords,
        });
    }

    if (errorsToPush.length < 2 && typeErrorCoords.length > 0) {
        errorsToPush.push({
            type: ErrorType.INVALID_CELL_TYPE,
            args: typeErrorCoords,
        });
    }

    for (let i = 0; i < Math.min(errorsToPush.length, 2); i++) {
        const err = errorsToPush[i];
        pushError(report, err.type, err.args);
    }
}

/**
 * Converts zero-based row/column indexes to Excel-style coordinates (e.g., A1, B2).
 * @param row - Zero-based row index.
 * @param col - Zero-based column index.
 * @returns Excel-style coordinate string.
 */
function xytoCoords(row: number, col: number): string {
    const colLetter = colIndexToLetter(col);
    return `${colLetter}${row + 1}`;
}

/**
 * Converts a zero-based column index to a column letter (e.g., 0 -> A, 27 -> AB).
 * @param col - Zero-based column index.
 * @returns Excel column letter.
 */
function colIndexToLetter(col: number): string {
    let letter = "";
    let n = col;

    while (n >= 0) {
        letter = String.fromCharCode((n % 26) + 65) + letter;
        n = Math.floor(n / 26) - 1;
    }

    return letter;
}
