/***************************************************************
 *
 *                SpreadsheetState.tsx
 *
 *         Author: Will O'Leary & Zander Barba
 *           Date: 11/14/2025
 *
 *        Summary: Manage the state of the spreadsheet uploading
 *        pipeline, including the uploading, previewing, school
 *        matching, and confirmation of data upload.
 *
 **************************************************************/

"use client";

import { type ReactElement, useEffect, useState, useCallback } from "react";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import SpreadsheetStatusBar from "@/components/SpreadsheetStatusBar";
import type { SpreadsheetData } from "@/types/spreadsheet";
import SpreadsheetConfirmation from "./SpreadsheetConfirmation";
import SpreadsheetPreview from "./SpreadsheetPreview";
import SpreadsheetPreviewFail from "./SpreadsheetPreviewFail";
import SpreadsheetUpload from "./SpreadsheetUpload";
import SpreadsheetEdits from "./SpreadsheetEdits";
import {
    ErrorReport,
    ErrorType,
    identifyErrors,
} from "@/lib/error-identification";
import {
    type KnownSchool,
    type SchoolWithCoordinates,
    type UploadedSchool,
    extractSchoolsFromSpreadsheet,
    getSchoolColumnIndices,
    matchSchools,
} from "@/lib/school-matching";

export default function SpreadsheetState() {
    const [file, setFile] = useState<File | undefined>();
    const [spreadsheetData, setSpreadsheetData] = useState<SpreadsheetData>([]);
    const [year, setYear] = useState<number | null>(new Date().getFullYear());
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
    const [yearHasData, setYearHasData] = useState(false);
    const [yearsWithData, setYearsWithData] = useState<Set<number>>(new Set());

    // School matching state
    const [knownSchools, setKnownSchools] = useState<KnownSchool[]>([]);
    const [matchedSchools, setMatchedSchools] = useState<
        SchoolWithCoordinates[]
    >([]);
    const [unmatchedSchools, setUnmatchedSchools] = useState<UploadedSchool[]>(
        [],
    );
    const [assignedLocations, setAssignedLocations] = useState<
        Map<string, { lat: number; long: number }>
    >(new Map());
    const [currentSchoolIndex, setCurrentSchoolIndex] = useState(0);
    const [progress, setProgress] = useState<number>(0);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [uploadedYear, setUploadedYear] = useState<number | null>(null);

    // Handler for when a school location is assigned via the map
    const handleSchoolLocationAssigned = useCallback(
        (schoolId: string, lat: number, long: number) => {
            setAssignedLocations((prev) => {
                const newMap = new Map(prev);
                newMap.set(schoolId, { lat, long });
                return newMap;
            });
        },
        [],
    );

    // Check if current school has a location assigned
    const currentSchoolHasLocation =
        unmatchedSchools.length === 0 ||
        (unmatchedSchools[currentSchoolIndex] &&
            assignedLocations.has(
                unmatchedSchools[currentSchoolIndex].schoolId,
            ));

    // Fetch years with data once on mount
    useEffect(() => {
        const fetchYearsWithData = async () => {
            try {
                const response = await fetch("/api/years");
                if (response.ok) {
                    const data = await response.json();
                    setYearsWithData(new Set(data.yearsWithData));
                }
            } catch (error) {
                toast.error("Failed to load year data");
            }
        };

        fetchYearsWithData();
    }, []);

    // Fetch known schools for matching on mount
    useEffect(() => {
        const fetchKnownSchools = async () => {
            try {
                const response = await fetch("/api/schools/known");
                if (response.ok) {
                    const data = await response.json();
                    setKnownSchools(data);
                }
            } catch (error) {
                toast.error("Failed to load known schools for matching");
            }
        };

        fetchKnownSchools();
    }, []);

    // Set default year to most recent year without data once yearsWithData loads
    useEffect(() => {
        if (yearsWithData.size === 0) return;
        const currentYear = new Date().getFullYear();
        let defaultYear = currentYear;
        while (defaultYear > 2000 && yearsWithData.has(defaultYear)) {
            defaultYear--;
        }
        setYear(defaultYear);
    }, [yearsWithData]);

    // Check if selected year has data whenever year changes
    useEffect(() => {
        setYearHasData(year !== null && yearsWithData.has(year));
    }, [year, yearsWithData]);

    useEffect(() => {
        checkForUploadNext();
    }, [file]);

    useEffect(() => {
        checkForUploadNext();
    }, [year]);

    const checkForUploadNext = () => {
        if (tabIndex === 0) {
            setCanNext(year !== null && !!file);
        }
    };

    useEffect(() => {
        if (tabIndex === 3) {
            setCanNext(confirmed === true);
        }
    }, [confirmed, tabIndex]);

    // Update canNext when assignedLocations changes (for school matching step)
    // User can proceed if current school has a location
    useEffect(() => {
        if (tabIndex === 2) {
            setCanNext(currentSchoolHasLocation);
        }
    }, [tabIndex, currentSchoolHasLocation]);

    // Re-render SpreadsheetEdits when assignedLocations or currentSchoolIndex changes
    useEffect(() => {
        if (tabIndex === 2 && unmatchedSchools.length > 0) {
            setTab(
                <SpreadsheetEdits
                    matchedSchools={matchedSchools}
                    unmatchedSchools={unmatchedSchools}
                    currentSchoolIndex={currentSchoolIndex}
                    onSchoolLocationAssigned={handleSchoolLocationAssigned}
                    assignedLocations={assignedLocations}
                />,
            );
        }
    }, [
        assignedLocations,
        tabIndex,
        unmatchedSchools.length,
        matchedSchools,
        handleSchoolLocationAssigned,
        currentSchoolIndex,
    ]);

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

            try {
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
            } catch {
                callback(null);
            }
        };

        reader.readAsBinaryString(file);
    };

    const handleSubmit = async (): Promise<boolean> => {
        if (spreadsheetData.length === 0) {
            toast.warning("No data to upload.");
            return false;
        }

        setIsSubmitting(true);

        // Build school coordinates array from matched schools and user-assigned locations
        const schoolCoordinates: {
            schoolId: string;
            lat: number | null;
            long: number | null;
        }[] = [];

        // Add matched schools
        for (const school of matchedSchools) {
            schoolCoordinates.push({
                schoolId: school.schoolId,
                lat: school.lat,
                long: school.long,
            });
        }

        // Add user-assigned locations for unmatched schools
        for (const school of unmatchedSchools) {
            const assigned = assignedLocations.get(school.schoolId);
            schoolCoordinates.push({
                schoolId: school.schoolId,
                lat: assigned?.lat ?? null,
                long: assigned?.long ?? null,
            });
        }

        try {
            const source = new EventSource("/api/upload");
            source.onmessage = (event) => {
                const data = JSON.parse(event.data);
                setProgress(data.progress);
                if (data.complete) {
                    source.close();
                }
            };
            const response = await fetch("/api/upload", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    formYear: year,
                    formData: JSON.stringify(spreadsheetData),
                    schoolCoordinates,
                }),
            });

            if (response.ok) {
                return true;
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
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetToUpload = () => {
        setUploadSuccess(false);
        setUploadedYear(null);
        setProgress(0);
        setConfirmed(false);
        setFile(undefined);
        switchTab(0);
    };

    const next = async () => {
        if (canNext) {
            // If on school matching page (index 2), handle sequential school navigation
            if (tabIndex === 2) {
                // Check if current school has location
                if (!currentSchoolHasLocation) {
                    toast.error(
                        "Please place a pin on the map to assign a location.",
                    );
                    return;
                }

                // If there are more schools to process, go to next school
                if (currentSchoolIndex < unmatchedSchools.length - 1) {
                    setCurrentSchoolIndex(currentSchoolIndex + 1);
                    return; // Stay on tab 2
                }
                // All schools done, proceed to confirmation
            }
            // If on confirmation page (index 3), submit data and show success
            if (tabIndex === 3) {
                const success = await handleSubmit();
                if (success) {
                    setUploadedYear(year);
                    setUploadSuccess(true);
                }
                return;
            }
            switchTab((tabIndex + 1) % 4);
        }
    };

    const previous = () => {
        if (canPrevious) {
            // If on school matching page and not on first school, go back to previous school
            if (tabIndex === 2 && currentSchoolIndex > 0) {
                setCurrentSchoolIndex(currentSchoolIndex - 1);
                return;
            }
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
            setCanNext(false); // Disable until async parse completes

            // Parse spreadsheet and check format
            checkFormat((jsonData) => {
                if (jsonData === null) {
                    setTab(
                        <SpreadsheetPreviewFail
                            fileName={file?.name ?? "None"}
                            numRows={0}
                            errorReport={{
                                errors: [
                                    {
                                        type: ErrorType.INVALID_TYPE,
                                        args: [],
                                    },
                                ],
                                calculatedNumRows: 0,
                            }}
                        />,
                    );
                    setCanNext(false);
                    setHasError(true);
                    return;
                }
                const report: ErrorReport = identifyErrors(jsonData);
                if (report.errors.length !== 0) {
                    setTab(
                        <SpreadsheetPreviewFail
                            fileName={file?.name ?? "None"}
                            numRows={report.calculatedNumRows}
                            errorReport={report}
                        />,
                    );
                    setCanNext(false);
                    setHasError(true);
                    return;
                }
                if (jsonData.length === 0) {
                    return;
                }

                // Store the parsed data
                setSpreadsheetData(jsonData);

                setTab(
                    <SpreadsheetPreview
                        fileName={file?.name ?? "None"}
                        numRows={report.calculatedNumRows}
                        spreadsheetData={jsonData}
                    />,
                );
                setCanNext(true);
                setHasError(false);
            });

            setNextText("Next");
            setCanPrevious(true);
        } else if (tabIndex === 2) {
            // School matching step - run matching and show SpreadsheetEdits
            setTabIndex(2);
            setCurrentSchoolIndex(0); // Reset to first school

            if (spreadsheetData.length > 0 && knownSchools.length > 0) {
                const headers = spreadsheetData[0];
                const columnIndices = getSchoolColumnIndices(headers);

                if (columnIndices) {
                    const uploadedSchools = extractSchoolsFromSpreadsheet(
                        spreadsheetData,
                        columnIndices,
                    );
                    const result = matchSchools(uploadedSchools, knownSchools);

                    setMatchedSchools(result.matched);
                    setUnmatchedSchools(result.unmatched);

                    // If all schools matched, allow proceeding immediately
                    if (result.unmatched.length === 0) {
                        setCanNext(true);
                    } else {
                        // Check if first school has a location
                        const firstSchoolHasLocation = assignedLocations.has(
                            result.unmatched[0].schoolId,
                        );
                        setCanNext(firstSchoolHasLocation);
                    }

                    setTab(
                        <SpreadsheetEdits
                            matchedSchools={result.matched}
                            unmatchedSchools={result.unmatched}
                            currentSchoolIndex={0}
                            onSchoolLocationAssigned={
                                handleSchoolLocationAssigned
                            }
                            assignedLocations={assignedLocations}
                        />,
                    );
                } else {
                    toast.error(
                        "Could not identify school columns in spreadsheet",
                    );
                    setCanNext(false);
                }
            } else if (knownSchools.length === 0) {
                toast.error("Known schools data not loaded yet. Please wait.");
                setCanNext(false);
            }

            setNextText("Next");
            setCanPrevious(true);
        } else if (tabIndex === 3) {
            setTabIndex(3);
            setTab(
                <SpreadsheetConfirmation
                    spreadsheetData={spreadsheetData}
                    year={year}
                    setConfirmed={setConfirmed}
                    yearHasData={yearHasData}
                />,
            );
            setNextText("Finish");
            setCanNext(confirmed);
        }
    };

    return (
        <div
            className={`flex flex-col items-center justify-between mx-auto py-8 gap-12 ${tabIndex === 2 ? "w-full max-w-[90vw] px-8" : "max-w-2xl"}`}
        >
            <div
                className={`w-full ${tabIndex === 2 ? "max-w-xl" : "max-w-md"}`}
            >
                <div className="mb-2">
                    <SpreadsheetStatusBar
                        tabIndex={tabIndex}
                        maxTabs={3}
                        hasError={hasError}
                    />
                </div>
                <div className="flex flex-row justify-between w-full font-semibold text-sm">
                    <p className="-translate-x-6">Upload</p>
                    <p className="">Preview</p>
                    <p className="">Schools</p>
                    <p className="translate-x-6">Confirm</p>
                </div>
            </div>

            <div className={`flex-1 ${tabIndex === 2 ? "w-full" : ""}`}>
                {uploadSuccess ? (
                    <div className="flex flex-col items-center gap-6 mt-8 max-w-lg text-center">
                        <CheckCircle2 className="h-14 w-14 text-green-500" />
                        <div className="flex flex-col gap-2">
                            <h1 className="text-2xl font-bold">
                                Upload complete
                            </h1>
                            <p className="text-muted-foreground">
                                Data for{" "}
                                <span className="font-medium text-foreground">
                                    {uploadedYear}
                                </span>{" "}
                                was successfully uploaded.
                            </p>
                        </div>
                        <button
                            className="mt-2 py-1 w-48 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer transition duration-300"
                            onClick={resetToUpload}
                        >
                            Upload another year
                        </button>
                    </div>
                ) : (
                    <>
                        {tab}
                        {isSubmitting && tabIndex === 3 && (
                            <div className="flex flex-col gap-2 mt-4 w-full max-w-lg">
                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="bg-primary h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Uploading... {progress}%
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {!uploadSuccess && (
                <div
                    className={`flex justify-between pb-4 ${tabIndex === 2 ? "w-full" : "w-full"}`}
                >
                    {canPrevious && (
                        <button
                            className="py-1 w-40 rounded-lg bg-card text-foreground border border-border hover:bg-accent hover:cursor-pointer transition duration-300"
                            onClick={previous}
                            disabled={isSubmitting}
                        >
                            Previous
                        </button>
                    )}

                    <button
                        className={
                            canNext
                                ? "ml-auto py-1 w-40 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer transition duration-300 disabled:bg-muted disabled:cursor-not-allowed"
                                : "ml-auto py-1 w-40 rounded-lg bg-gray-400 text-primary-foreground transition duration-300 cursor-not-allowed"
                        }
                        onClick={next}
                        disabled={!canNext || isSubmitting}
                    >
                        {isSubmitting ? "Uploading..." : nextText}
                    </button>
                </div>
            )}
        </div>
    );
}
