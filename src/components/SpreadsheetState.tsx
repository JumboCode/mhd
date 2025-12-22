/***************************************************************
 *
 *                SpreadsheetState.tsx
 *
 *         Author: Will O'Leary & Zander Barba
 *           Date: 11/14/2025
 *
 *        Summary: Manage the state of the spreadsheet uploading
 *        pipeline, including the uploading, previewing, and
 *        confirmation of data upload.
 *
 **************************************************************/

"use client";

import React, { type ReactElement, useEffect, useState } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import SpreadsheetStatusBar from "@/components/SpreadsheetStatusBar";
import type { SpreadsheetData } from "@/types/spreadsheet";
import SpreadsheetConfirmation from "./SpreadsheetConfirmation";
import SpreadsheetPreview from "./SpreadsheetPreview";
import SpreadsheetPreviewFail from "./SpreadsheetPreviewFail";
import SpreadsheetUpload from "./SpreadsheetUpload";

export default function SpreadsheetState() {
    const [file, setFile] = useState<File | undefined>();
    const [spreadsheetData, setSpreadsheetData] = useState<SpreadsheetData>([]);
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
    const [canNext, setCanNext] = useState<boolean | null>(false);
    const [canPrevious, setCanPrevious] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [confirmed, setConfirmed] = useState<boolean | null>(false);
    const [hasError, setHasError] = useState<boolean>(false);

    const [nextText, setNextText] = useState("Next");

    useEffect(() => {
        checkForUploadNext();
    }, [file]);

    useEffect(() => {
        checkForUploadNext();
    }, [year]);

    const checkForUploadNext = () => {
        if (tabIndex === 0) {
            setCanNext(year !== null && file !== null);
        }
    };

    useEffect(() => {
        if (tabIndex === 2) {
            setCanNext(confirmed === true);
        }
    }, [confirmed, tabIndex]);

    const checkFormat = (
        callback: (jsonData: SpreadsheetData | null) => void,
    ) => {
        if (!file) {
            callback(null);
            return;
        }

        const reader = new FileReader();
        reader.onload = (event: ProgressEvent<FileReader>) => {
            if (!event.target?.result) {
                callback(null);
                return;
            }

            const workbook = XLSX.read(event.target.result, {
                type: "binary",
            });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData: SpreadsheetData = XLSX.utils.sheet_to_json(
                worksheet,
                {
                    header: 1,
                },
            );

            callback(jsonData);
        };

        reader.readAsBinaryString(file);
    };

    const handleSubmit = async () => {
        if (spreadsheetData.length === 0) {
            toast.warning("No data to upload.");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch("/api/upload", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    formYear: year,
                    formData: JSON.stringify(spreadsheetData),
                }),
            });

            if (response.ok) {
                const data = await response.json();
                toast.success(
                    `Data uploaded successfully! Processed ${data.rowsProcessed || spreadsheetData.length - 1} rows.`,
                );
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to upload data");
            }
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? `Error uploading data: ${error.message}`
                    : "Error uploading data. Please try again.",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const next = async () => {
        if (canNext) {
            // If on confirmation page (index 2), submit data
            if (tabIndex === 2) {
                await handleSubmit();
            }
            switchTab((tabIndex + 1) % 3);
        }
    };

    const previous = () => {
        if (canPrevious) {
            switchTab(tabIndex - 1);
        }
    };

    const switchTab = (tabIndex: number) => {
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

            // Parse spreadsheet and check format
            checkFormat((jsonData) => {
                if (!jsonData || jsonData.length === 0) {
                    setTab(
                        <SpreadsheetPreviewFail
                            fileName={file?.name ?? "None"}
                            numRows={0}
                        />,
                    );
                    setCanNext(false);
                    setHasError(true);
                    return;
                }

                // Store the parsed data
                setSpreadsheetData(jsonData);

                // Calculate number of rows (count non-empty rows, excluding header)
                const nonEmptyRows = jsonData
                    .slice(1)
                    .filter((row) =>
                        row.some(
                            (cell) =>
                                cell !== null &&
                                cell !== undefined &&
                                cell !== "",
                        ),
                    );
                const calculatedNumRows = nonEmptyRows.length;

                // Check if format is valid
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

                if (hasAllColumns) {
                    setTab(
                        <SpreadsheetPreview
                            fileName={file?.name ?? "None"}
                            numRows={calculatedNumRows}
                            spreadsheetData={jsonData}
                        />,
                    );
                    setCanNext(true);
                    setHasError(false);
                } else {
                    setTab(
                        <SpreadsheetPreviewFail
                            fileName={file?.name ?? "None"}
                            numRows={calculatedNumRows}
                        />,
                    );
                    setCanNext(false);
                    setHasError(true);
                }
            });

            setNextText("Next");
            setCanPrevious(true);
        } else if (tabIndex === 2) {
            setTabIndex(2);
            setTab(
                <SpreadsheetConfirmation
                    spreadsheetData={spreadsheetData}
                    year={year}
                    setConfirmed={setConfirmed}
                />,
            );
            setNextText("Finish");
            setCanNext(confirmed);
        }
    };

    return (
        <div className="flex flex-col items-center justify-between max-w-2xl mx-auto py-8 gap-12">
            <div className="max-w-md w-full">
                <div className="mb-2">
                    <SpreadsheetStatusBar
                        tabIndex={tabIndex}
                        maxTabs={2}
                        hasError={hasError}
                    />
                </div>
                <div className="flex flex-row justify-between w-full font-semibold">
                    <p className="text-left flex-1 -translate-x-4">Upload</p>
                    <p className="text-center flex-1">Preview</p>
                    <p className="text-right flex-1 translate-x-10">
                        Confirmation
                    </p>
                </div>
            </div>

            <div className="flex-1">{tab}</div>

            <div className="flex justify-between w-full pb-4">
                {canPrevious && (
                    <button
                        className="py-1 w-40 rounded-lg bg-card text-foreground border border-border hover:bg-accent hover:cursor-pointer transition duration-300"
                        onClick={previous}
                        disabled={isSubmitting}
                    >
                        Previous
                    </button>
                )}

                {canNext && (
                    <button
                        className="ml-auto py-1 w-40 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 hover:cursor-pointer transition duration-300 disabled:bg-muted disabled:cursor-not-allowed"
                        onClick={next}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Uploading..." : nextText}
                    </button>
                )}
            </div>
        </div>
    );
}
