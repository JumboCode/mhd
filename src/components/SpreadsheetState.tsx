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

import {
    type ReactElement,
    useEffect,
    useState,
    useCallback,
    useRef,
} from "react";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";
import { useUnsavedChanges } from "@/components/UnsavedChangesContext";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import SpreadsheetStatusBar from "@/components/SpreadsheetStatusBar";
import type { SpreadsheetData } from "@/types/spreadsheet";
import SpreadsheetConfirmation from "./SpreadsheetConfirmation";
import SpreadsheetPreview from "./SpreadsheetPreview";
import SpreadsheetPreviewFail from "./SpreadsheetPreviewFail";
import SpreadsheetUpload from "./StudentInfoUpload";
import SchoolInfoUpload from "./SchoolInfoUpload";
import SpreadsheetEdits from "./SpreadsheetEdits";
import {
    ErrorReport,
    ErrorType,
    identifyErrors,
    schoolColumnSpec,
    studentColumnSpec,
} from "@/lib/error-identification";
import {
    type KnownSchool,
    type SchoolWithCoordinates,
    type UploadedSchool,
    buildSchoolTownMap,
    extractSchoolsFromSpreadsheet,
    getSchoolColumnIndices,
    matchSchools,
} from "@/lib/school-matching";
import { schoolRequiredColumns } from "@/lib/required-spreadsheet-columns";
import SpreadsheetConflicts, {
    type ConflictResolution,
} from "@/components/SpreadsheetConflicts";
import type { SchoolConflict } from "@/app/api/schools/check-conflicts/route";

// Step indices
const STEP_UPLOAD = 0;
const STEP_STUDENT_PREVIEW = 1;
const STEP_SCHOOL_UPLOAD = 2;
const STEP_SCHOOL_INFO_PREVIEW = 3;
const STEP_SCHOOL_MATCHING = 4;
const STEP_CONFIRM = 5;
const MAX_TABS = 5;

function parseFile(file: File): Promise<SpreadsheetData | null> {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            if (!event.target?.result) {
                resolve(null);
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
                    { header: 1 },
                );
                resolve(jsonData);
            } catch {
                resolve(null);
            }
        };
        reader.readAsBinaryString(file);
    });
}

export default function SpreadsheetState() {
    const searchParams = useSearchParams();
    const yearParam = searchParams.get("year");
    const initialYear = yearParam
        ? parseInt(yearParam, 10)
        : new Date().getFullYear();

    // Files
    const [file, setFile] = useState<File | undefined>();
    const [schoolInfoFile, setSchoolInfoFile] = useState<File | undefined>();

    // Parsed data
    const [spreadsheetData, setSpreadsheetData] = useState<SpreadsheetData>([]);
    const [schoolInfoData, setSchoolInfoData] = useState<SpreadsheetData>([]);

    // Year
    const [year, setYear] = useState<number | null>(initialYear);
    const [yearHasData, setYearHasData] = useState(false);
    const [yearsWithData, setYearsWithData] = useState<Set<number>>(new Set());

    // Navigation
    const [tabIndex, setTabIndex] = useState(0);
    const [tab, setTab] = useState<ReactElement>(
        <SpreadsheetUpload
            file={file}
            setFile={setFile}
            year={year}
            setYear={setYear}
        />,
    );
    const [canNext, setCanNext] = useState<boolean | null>(false);
    const [canPrevious, setCanPrevious] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [confirmed, setConfirmed] = useState<boolean | null>(false);
    const [hasError, setHasError] = useState<boolean>(false);
    const [nextText, setNextText] = useState("Next");

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

    // Conflict resolution state
    const [conflicts, setConflicts] = useState<SchoolConflict[]>([]);
    const [conflictDialogOpen, setConflictDialogOpen] = useState(false);
    const [conflictResolutions, setConflictResolutions] = useState<
        ConflictResolution[]
    >([]);
    const pendingUploadedSchoolsRef = useRef<UploadedSchool[]>([]);
    const [progress, setProgress] = useState<number>(0);
    const router = useRouter();
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [uploadedYear, setUploadedYear] = useState<number | null>(null);

    // Navigation blocking while upload is in progress
    const { setOnNavigationAttempt } = useUnsavedChanges();
    const isSubmittingRef = useRef(false);
    const [showLeaveDialog, setShowLeaveDialog] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState<string | null>(
        null,
    );

    // Keep ref in sync so sidebar nav handler always reads latest value
    useEffect(() => {
        isSubmittingRef.current = isSubmitting;
    }, [isSubmitting]);

    // Block browser refresh / tab close during upload
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isSubmitting) {
                e.preventDefault();
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () =>
            window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [isSubmitting]);

    // Block sidebar navigation during upload
    useEffect(() => {
        setOnNavigationAttempt(() => (href: string) => {
            if (isSubmittingRef.current) {
                setPendingNavigation(href);
                setShowLeaveDialog(true);
            } else {
                router.push(href);
            }
        });
        return () => {
            setOnNavigationAttempt(() => (href: string) => router.push(href));
        };
    }, [setOnNavigationAttempt]);

    const handleLeaveAnyway = () => {
        setShowLeaveDialog(false);
        if (pendingNavigation) router.push(pendingNavigation);
        setPendingNavigation(null);
    };

    const handleStay = () => {
        setShowLeaveDialog(false);
        setPendingNavigation(null);
    };

    const handleSchoolLocationAssigned = useCallback(
        (schoolKey: string, lat: number, long: number) => {
            setAssignedLocations((prev) => {
                const newMap = new Map(prev);
                newMap.set(schoolKey, { lat, long });
                return newMap;
            });
        },
        [],
    );

    const currentSchoolHasLocation =
        unmatchedSchools.length === 0 ||
        (unmatchedSchools[currentSchoolIndex] &&
            assignedLocations.has(
                unmatchedSchools[currentSchoolIndex].schoolKey,
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
            } catch {
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
            } catch {
                toast.error("Failed to load known schools for matching");
            }
        };
        fetchKnownSchools();
    }, []);

    // Set default year to current year once yearsWithData loads (skip if year was pre-filled via URL)
    useEffect(() => {
        if (yearsWithData.size === 0) return;
        if (!yearParam) setYear(new Date().getFullYear());
    }, [yearsWithData, yearParam]);

    // Check if selected year has data whenever year changes
    useEffect(() => {
        setYearHasData(year !== null && yearsWithData.has(year));
    }, [year, yearsWithData]);

    // Keep the upload tab's year/file props fresh (initial JSX state captures stale closure)
    useEffect(() => {
        if (tabIndex !== STEP_UPLOAD) return;
        setTab(
            <SpreadsheetUpload
                file={file}
                setFile={setFile}
                year={year}
                setYear={setYear}
            />,
        );
    }, [year, file, tabIndex]);

    // Enable Next on upload step only when student file and year are set
    useEffect(() => {
        if (tabIndex === STEP_UPLOAD) {
            setCanNext(year !== null && !!file);
        }
    }, [file, year, tabIndex]);

    // Enable Next on school upload step when school file is set
    useEffect(() => {
        if (tabIndex === STEP_SCHOOL_UPLOAD) {
            setCanNext(!!schoolInfoFile);
        }
    }, [schoolInfoFile, tabIndex]);

    // Enable Next on confirmation step when checkbox is checked
    useEffect(() => {
        if (tabIndex === STEP_CONFIRM) {
            setCanNext(confirmed === true);
        }
    }, [confirmed, tabIndex]);

    // Enable Next on school matching step when current school has location
    useEffect(() => {
        if (tabIndex === STEP_SCHOOL_MATCHING) {
            setCanNext(currentSchoolHasLocation);
        }
    }, [tabIndex, currentSchoolHasLocation]);

    // Re-render SpreadsheetEdits when assignedLocations or currentSchoolIndex changes
    useEffect(() => {
        if (tabIndex === STEP_SCHOOL_MATCHING && unmatchedSchools.length > 0) {
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

    const runSchoolMatching = (uploadedSchools: UploadedSchool[]) => {
        const result = matchSchools(uploadedSchools, knownSchools);
        setMatchedSchools(result.matched);
        setUnmatchedSchools(result.unmatched);

        if (result.unmatched.length === 0) {
            setCanNext(true);
        } else {
            setCanNext(assignedLocations.has(result.unmatched[0].schoolKey));
        }

        setTab(
            <SpreadsheetEdits
                matchedSchools={result.matched}
                unmatchedSchools={result.unmatched}
                currentSchoolIndex={0}
                onSchoolLocationAssigned={handleSchoolLocationAssigned}
                assignedLocations={assignedLocations}
            />,
        );
        setTabIndex(STEP_SCHOOL_MATCHING);
        setNextText("Next");
        setCanPrevious(true);
    };

    const handleConflictsResolved = (resolutions: ConflictResolution[]) => {
        setConflictResolutions(resolutions);
        setConflictDialogOpen(false);

        const useDbKeys = new Set(
            resolutions
                .filter((r) => r.action === "use-db")
                .map((r) => r.uploadedSchoolKey),
        );

        // Filter out schools that will be merged into existing ones from matching
        const schoolsForMatching = pendingUploadedSchoolsRef.current.filter(
            (s) => !useDbKeys.has(s.schoolKey),
        );

        runSchoolMatching(schoolsForMatching);
    };

    const handleSubmit = async (): Promise<boolean> => {
        if (spreadsheetData.length === 0) {
            toast.warning("No data to upload.");
            return false;
        }

        setIsSubmitting(true);

        const schoolCoordinates: {
            schoolKey: string;
            lat: number | null;
            long: number | null;
        }[] = [];

        for (const school of matchedSchools) {
            schoolCoordinates.push({
                schoolKey: school.schoolKey,
                lat: school.lat,
                long: school.long,
            });
        }

        for (const school of unmatchedSchools) {
            const assigned = assignedLocations.get(school.schoolKey);
            schoolCoordinates.push({
                schoolKey: school.schoolKey,
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
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    formYear: year,
                    formData: JSON.stringify(spreadsheetData),
                    schoolInfoData: JSON.stringify(schoolInfoData),
                    schoolCoordinates,
                    conflictResolutions,
                }),
            });

            if (response.ok) {
                return true;
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to upload data");
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
        if (!canNext) return;

        if (tabIndex === STEP_SCHOOL_MATCHING) {
            if (!currentSchoolHasLocation) {
                toast.error(
                    "Please place a pin on the map to assign a location.",
                );
                return;
            }
            if (currentSchoolIndex < unmatchedSchools.length - 1) {
                setCurrentSchoolIndex(currentSchoolIndex + 1);
                return;
            }
        }

        if (tabIndex === STEP_CONFIRM) {
            const success = await handleSubmit();
            if (success) {
                setUploadedYear(year);
                setUploadSuccess(true);
            }
            return;
        }

        switchTab(tabIndex + 1);
    };

    const previous = () => {
        if (!canPrevious) return;

        if (tabIndex === STEP_SCHOOL_MATCHING && currentSchoolIndex > 0) {
            setCurrentSchoolIndex(currentSchoolIndex - 1);
            return;
        }

        switchTab(tabIndex - 1);
    };

    const switchTab = async (index: number) => {
        if (index === STEP_UPLOAD) {
            setTabIndex(STEP_UPLOAD);
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
        } else if (index === STEP_STUDENT_PREVIEW) {
            setTabIndex(STEP_STUDENT_PREVIEW);
            setCanNext(false);

            const jsonData = file ? await parseFile(file) : null;

            if (!jsonData) {
                setTab(
                    <SpreadsheetPreviewFail
                        fileName={file?.name ?? "None"}
                        numRows={0}
                        errorReport={{
                            errors: [
                                { type: ErrorType.INVALID_TYPE, args: [] },
                            ],
                            calculatedNumRows: 0,
                        }}
                    />,
                );
                setCanNext(false);
                setHasError(true);
                setCanPrevious(true);
                setNextText("Next");
                return;
            }

            const report: ErrorReport = identifyErrors(
                jsonData,
                studentColumnSpec,
            );
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
                setCanPrevious(true);
                setNextText("Next");
                return;
            }

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
            setCanPrevious(true);
            setNextText("Next");
        } else if (index === STEP_SCHOOL_UPLOAD) {
            setTabIndex(STEP_SCHOOL_UPLOAD);
            setTab(
                <SchoolInfoUpload
                    schoolInfoFile={schoolInfoFile}
                    setSchoolInfoFile={setSchoolInfoFile}
                />,
            );
            setCanNext(!!schoolInfoFile);
            setHasError(false);
            setCanPrevious(true);
            setNextText("Next");
        } else if (index === STEP_SCHOOL_INFO_PREVIEW) {
            setTabIndex(STEP_SCHOOL_INFO_PREVIEW);
            setCanNext(false);

            const jsonData = schoolInfoFile
                ? await parseFile(schoolInfoFile)
                : null;

            if (!jsonData) {
                setTab(
                    <SpreadsheetPreviewFail
                        fileName={schoolInfoFile?.name ?? "None"}
                        numRows={0}
                        errorReport={{
                            errors: [
                                { type: ErrorType.INVALID_TYPE, args: [] },
                            ],
                            calculatedNumRows: 0,
                        }}
                    />,
                );
                setCanNext(false);
                setHasError(true);
                setCanPrevious(true);
                setNextText("Next");
                return;
            }

            const report: ErrorReport = identifyErrors(
                jsonData,
                schoolColumnSpec,
            );
            if (report.errors.length !== 0) {
                setTab(
                    <SpreadsheetPreviewFail
                        fileName={schoolInfoFile?.name ?? "None"}
                        numRows={report.calculatedNumRows}
                        errorReport={report}
                    />,
                );
                setCanNext(false);
                setHasError(true);
                setCanPrevious(true);
                setNextText("Next");
                return;
            }

            setSchoolInfoData(jsonData);
            setTab(
                <SpreadsheetPreview
                    fileName={schoolInfoFile?.name ?? "None"}
                    numRows={report.calculatedNumRows}
                    spreadsheetData={jsonData}
                    columns={schoolRequiredColumns}
                />,
            );
            setCanNext(true);
            setHasError(false);
            setCanPrevious(true);
            setNextText("Next");
        } else if (index === STEP_SCHOOL_MATCHING) {
            setCurrentSchoolIndex(0);

            if (spreadsheetData.length > 0 && knownSchools.length > 0) {
                const headers = spreadsheetData[0];
                const columnIndices = getSchoolColumnIndices(headers);

                if (columnIndices) {
                    const townMap = buildSchoolTownMap(schoolInfoData);
                    const uploadedSchools = extractSchoolsFromSpreadsheet(
                        spreadsheetData,
                        columnIndices,
                        townMap,
                    );

                    try {
                        const res = await fetch(
                            "/api/schools/check-conflicts",
                            {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    schools: uploadedSchools.map((s) => ({
                                        name: s.name,
                                        town: s.city,
                                        schoolKey: s.schoolKey,
                                    })),
                                }),
                            },
                        );
                        if (!res.ok) throw new Error(`HTTP ${res.status}`);
                        const data = await res.json();
                        if (data.conflicts && data.conflicts.length > 0) {
                            pendingUploadedSchoolsRef.current = uploadedSchools;
                            setConflicts(data.conflicts);
                            setConflictDialogOpen(true);
                            return;
                        }
                    } catch (err) {
                        console.error("Conflict check failed:", err);
                        toast.error("Could not check for school conflicts.");
                    }

                    runSchoolMatching(uploadedSchools);
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
        } else if (index === STEP_CONFIRM) {
            setTabIndex(STEP_CONFIRM);
            setNextText("Finish Upload");
            setCanNext(confirmed);
            setCanPrevious(true);
        }
    };

    const isWideTab = tabIndex === STEP_SCHOOL_MATCHING;

    return (
        <div
            className={`flex flex-col items-center justify-between mx-auto py-8 gap-12 ${isWideTab ? "w-full max-w-[90vw] px-8" : "max-w-2xl"}`}
        >
            <div className="w-full max-w-md">
                <div className="mb-2">
                    <SpreadsheetStatusBar
                        tabIndex={tabIndex}
                        maxTabs={MAX_TABS}
                        hasError={hasError}
                    />
                </div>
                <div className="relative w-full font-semibold text-sm h-4">
                    <p
                        className="absolute left-0 -translate-x-1/2 text-center whitespace-nowrap"
                        style={{ left: "0%" }}
                    >
                        Student
                    </p>
                    <p
                        className="absolute -translate-x-1/2 text-center whitespace-nowrap"
                        style={{ left: "33.33%" }}
                    >
                        School
                    </p>
                    <p
                        className="absolute -translate-x-1/2 text-center whitespace-nowrap"
                        style={{ left: "66.67%" }}
                    >
                        Location
                    </p>
                    <p
                        className="absolute -translate-x-1/2 text-center whitespace-nowrap"
                        style={{ left: "100%" }}
                    >
                        Confirm
                    </p>
                </div>
            </div>

            <div className={`flex-1 ${isWideTab ? "w-full" : ""}`}>
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
                        <div className="flex gap-3 mt-2">
                            <Button onClick={() => router.push("/")}>
                                View data
                            </Button>
                            <Button variant="outline" onClick={resetToUpload}>
                                Upload another year
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        {tabIndex === STEP_CONFIRM ? (
                            <SpreadsheetConfirmation
                                spreadsheetData={spreadsheetData}
                                schoolInfoData={schoolInfoData}
                                year={year}
                                setConfirmed={setConfirmed}
                                yearHasData={yearHasData}
                                disabled={isSubmitting}
                            />
                        ) : (
                            tab
                        )}
                        {isSubmitting && tabIndex === STEP_CONFIRM && (
                            <div className="flex flex-col gap-2 mt-4 w-full max-w-lg">
                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="bg-primary h-2 rounded-full transition-[width] duration-300"
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
                <div className={`flex justify-between pb-4 w-full`}>
                    {canPrevious && (
                        <Button
                            variant="outline"
                            onClick={previous}
                            disabled={isSubmitting}
                        >
                            Previous
                        </Button>
                    )}

                    <Button
                        className="ml-auto"
                        onClick={next}
                        disabled={!canNext || isSubmitting}
                    >
                        {isSubmitting ? "Uploading..." : nextText}
                    </Button>
                </div>
            )}

            <SpreadsheetConflicts
                open={conflictDialogOpen}
                conflicts={conflicts}
                onResolved={handleConflictsResolved}
            />

            {/* Warn user if they try to navigate away while upload is in progress */}
            <Dialog open={showLeaveDialog} onOpenChange={handleStay}>
                <DialogContent
                    showCloseButton={false}
                    onInteractOutside={(e) => e.preventDefault()}
                >
                    <DialogHeader>
                        <DialogTitle>Upload in Progress</DialogTitle>
                        <DialogDescription>
                            Leaving now will result in incomplete data being
                            saved. The year will appear as uploaded in Settings
                            but will be missing records. Are you sure you want
                            to leave?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleStay}>
                            Stay on Page
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleLeaveAnyway}
                        >
                            Leave Anyway
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
