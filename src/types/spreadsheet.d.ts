/*
 * Type definitions for spreadsheet data
 */

// Type for a single cell value from Excel
export type CellValue = string | number | boolean | null | undefined;

// Type for a row of data (array of cells)
export type SpreadsheetRow = CellValue[];

// Type for the entire spreadsheet (array of rows)
export type SpreadsheetData = SpreadsheetRow[];
