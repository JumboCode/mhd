/***************************************************************
 *
 *                schools/[name]/page.tsx
 *
 *         Author: Elki Laranas & Hansini Gundavarapu
 *           Date: 11/16/2025
 *
 *        Summary: Page to display individual school profiles
 *
 **************************************************************/

"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { SchoolProfileSkeleton } from "@/components/skeletons/SchoolProfileSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { SchoolLocationEditor } from "@/components/SchoolLocationEditor";
import { SchoolInfoRow } from "@/components/SchoolInfoRow";
import { StatCard } from "@/components/ui/stat-card";
import { ENTITY_CONFIG } from "@/lib/entity-config";
import type { MeasuredAs } from "@/components/GraphFilters/GraphFilters";
import YearDropdown from "@/components/YearDropdown";
import MultiLineGraph, { GraphDataset } from "@/components/charts/LineGraph";
import { Info } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    EditableProjectsTable,
    ProjectRow as EditableProjectRow,
} from "@/components/EditableProjectsTable";
import PieChart from "@/components/charts/PieChart";
import { projectCategoryDistribution } from "@/lib/utils";
import { AlertCircle, X, EllipsisVertical, Merge } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MergeSchoolDialog from "@/components/MergeSchoolDialog";

// interface such that data can be blank if API is loading
type SchoolData = {
    id: number;
    name: string;
    town: string;
    studentCount: string;
    teacherCount: string;
    projectCount: string;
    firstYear: string;
    projects: ProjectRow[];
    region: string;
    division: string[];
    implementationModel: string;
    schoolType: string;
};

type ProjectRow = EditableProjectRow;

export default function SchoolProfilePage() {
    const params = useParams();
    const schoolName = params.name as string;
    const router = useRouter();

    const [schoolData, setSchoolData] = useState<SchoolData | null>(null);
    const [prevYearData, setPrevYearData] = useState<SchoolData | null>(null);

    const [year, setYear] = useState<number | null>(null);
    const [projects, setProjects] = useState<ProjectRow[]>([]);
    const [editingName, setEditingName] = useState(false);
    const [nameDraft, setNameDraft] = useState("");
    const nameInputRef = useRef<HTMLInputElement>(null);
    const [studentYearData, setstudentYearData] = useState<
        { x: string | number; y: number }[]
    >([]);
    const [allYearsData, setAllYearsData] = useState<SchoolData[]>([]);
    const [showPrevYearWarning, setShowPrevYearWarning] = useState(true);
    const [mergeOpen, setMergeOpen] = useState(false);

    useEffect(() => {
        setShowPrevYearWarning(true);
    }, [year]);

    // Check on mount whether this school has been merged away
    useEffect(() => {
        fetch(`/api/schools/${schoolName}`)
            .then(async (r) => {
                if (r.status === 301) {
                    const data = await r.json();
                    if (data.redirectTo) {
                        router.replace(`/schools/${data.redirectTo}`);
                    }
                }
            })
            .catch(() => {});
    }, [schoolName, router]);

    useEffect(() => {
        if (!year) return;
        const controller = new AbortController();
        const { signal } = controller;

        const fetchAll = async () => {
            try {
                // Fetch 6 years in one batch: year-5..year-1 for sparklines + year for current.
                // year-1 is index 4 (prev), year is index 5 (curr).
                // All state updates happen atomically after the await, and the AbortController
                // ensures stale responses from prior navigations are discarded.
                const fetchYears = Array.from(
                    { length: 6 },
                    (_, i) => year - (5 - i),
                );
                // fetchYears = [year-5, year-4, year-3, year-2, year-1, year]
                //   index 4 = year-1 (previous year for trend)
                //   index 5 = year   (current year)
                //   index 0..4 = last 5 years for sparkline

                const responses = await Promise.all(
                    fetchYears.map((y) =>
                        fetch(`/api/schools/${schoolName}?year=${y}`, {
                            signal,
                        }).then(async (r) => {
                            if (r.status === 301) return r.json();
                            if (!r.ok)
                                throw new Error(`Failed to fetch year ${y}`);
                            return r.json();
                        }),
                    ),
                );

                if (signal.aborted) return;

                // If the school has been merged away, redirect to the absorbing school
                if (responses[5]?.redirectTo) {
                    router.replace(`/schools/${responses[5].redirectTo}`);
                    return;
                }

                const curr = responses[5]; // current year
                const sparklineResults = responses.slice(1); // year-4..year (5 items)
                const sparklineYears = fetchYears.slice(1);

                // Find the most recent prior year where this school actually
                // had data (projectCount > 0). Scanning from year-1 backwards
                // avoids treating sparse/gap years as the meaningful baseline.
                const prev =
                    [...sparklineResults]
                        .slice(0, 4) // year-4..year-1 (exclude current)
                        .reverse()
                        .find((d) => Number(d.projectCount) > 0) ?? null;

                // Sparkline points (5 years ending at current year)
                const points = sparklineResults.map((d, i) => ({
                    x: sparklineYears[i],
                    y: Number(d.studentCount),
                }));

                setSchoolData(curr);
                setPrevYearData(prev);
                setProjects(curr.projects);
                setstudentYearData(points);
                setAllYearsData(sparklineResults);
            } catch (err: unknown) {
                if (signal.aborted) return;
                const isAbort =
                    err instanceof Error && err.name === "AbortError";
                if (!isAbort) {
                    toast.error(
                        "Failed to load school data. Redirecting to schools page.",
                    );
                    setTimeout(() => {
                        router.push("/schools");
                    }, 2000);
                }
            }
        };

        fetchAll();
        return () => controller.abort();
    }, [schoolName, router, year]);

    const handleNameDoubleClick = () => {
        setNameDraft(schoolData?.name ?? "");
        setEditingName(true);
        setTimeout(() => nameInputRef.current?.select(), 0);
    };

    const handleNameCommit = async () => {
        setEditingName(false);
        if (!schoolData || nameDraft.trim() === schoolData.name) return;
        const res = await fetch(`/api/schools/${schoolName}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: nameDraft.trim() }),
        });
        if (res.ok) {
            setSchoolData((prev) =>
                prev ? { ...prev, name: nameDraft.trim() } : prev,
            );
            toast.success("School name updated.");
        } else {
            toast.error("Failed to update school name.");
        }
    };

    const studentData: GraphDataset = {
        label: "Students by Year",
        data: studentYearData,
    };

    const chartHref = (measuredAs: MeasuredAs) =>
        year !== null
            ? `/chart?type=line&startYear=${year - 5}&endYear=${year}&measuredAs=${measuredAs}&schools=${encodeURIComponent(schoolData?.name ?? "")}`
            : "#";

    // Calculate sparkline data arrays from allYearsData
    const projectsSparkline = allYearsData.map((d) =>
        Number(d.projectCount || 0),
    );
    const teachersSparkline = allYearsData.map((d) =>
        Number(d.teacherCount || 0),
    );
    const studentsSparkline = allYearsData.map((d) =>
        Number(d.studentCount || 0),
    );

    // Calculate percent changes against the previous chronological year.
    // null = either year has no data for this school (shows flat/no-trend icon).
    const calcPct = (current: number, previous: number) => {
        if (current === 0 || previous === 0) return null;
        return ((current - previous) / previous) * 100;
    };

    const projectsPercentChange = calcPct(
        Number(schoolData?.projectCount || 0),
        Number(prevYearData?.projectCount || 0),
    );
    const teachersPercentChange = calcPct(
        Number(schoolData?.teacherCount || 0),
        Number(prevYearData?.teacherCount || 0),
    );
    const studentsPercentChange = calcPct(
        Number(schoolData?.studentCount || 0),
        Number(prevYearData?.studentCount || 0),
    );

    const firstYearNumeric = Number(schoolData?.firstYear);
    const isOldestSchoolYearSelected =
        year !== null &&
        Number.isFinite(firstYearNumeric) &&
        year === firstYearNumeric;
    const trendIndicatorsUnavailable =
        projectsPercentChange === null &&
        teachersPercentChange === null &&
        studentsPercentChange === null;
    const showComparisonWarning =
        isOldestSchoolYearSelected && trendIndicatorsUnavailable;

    if (!schoolData) {
        return (
            <div className="h-screen w-full bg-background overflow-y-auto flex justify-center">
                <div className="w-full flex flex-col gap-6 py-8 max-w-5xl px-6">
                    <div className="flex flex-row items-center w-full">
                        <Skeleton className="h-8 w-64" />
                        <div className="ml-auto flex flex-row items-center gap-2">
                            <YearDropdown
                                selectedYear={year}
                                onYearChange={(selectedYear) => {
                                    if (selectedYear !== null) {
                                        setYear(selectedYear);
                                    }
                                }}
                                showDataIndicator={true}
                                school={schoolName}
                            />
                            <Button variant="ghost" size="icon">
                                <EllipsisVertical className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <SchoolProfileSkeleton skipHeader contentOnly />
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-background overflow-y-auto flex justify-center">
            <div className="w-full flex flex-col gap-6 py-8 max-w-5xl px-6">
                {/* Header with school name — double-click to edit */}
                <div className="flex flex-row items-center w-full">
                    {editingName ? (
                        <input
                            ref={nameInputRef}
                            className="text-2xl font-bold border-b border-blue-400 outline-none bg-transparent"
                            value={nameDraft}
                            onChange={(e) => setNameDraft(e.target.value)}
                            onBlur={handleNameCommit}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleNameCommit();
                                if (e.key === "Escape") {
                                    setEditingName(false);
                                    setNameDraft(schoolData.name);
                                }
                            }}
                            autoFocus
                        />
                    ) : (
                        <h1
                            className="text-2xl font-bold cursor-text"
                            onDoubleClick={handleNameDoubleClick}
                            title="Double-click to edit"
                        >
                            {schoolData.name}
                        </h1>
                    )}
                    <div className="ml-auto flex flex-row items-center gap-2">
                        <YearDropdown
                            selectedYear={year}
                            onYearChange={(selectedYear) => {
                                if (selectedYear !== null) {
                                    setYear(selectedYear);
                                }
                            }}
                            showDataIndicator={true}
                            school={schoolName}
                        />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <EllipsisVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="mt-2 min-w-48"
                            >
                                <DropdownMenuItem
                                    onClick={() => setMergeOpen(true)}
                                >
                                    <div className="flex items-center gap-2">
                                        <Merge className="h-4 w-4" />
                                        Merge school
                                    </div>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <MergeSchoolDialog
                    open={mergeOpen}
                    onOpenChange={setMergeOpen}
                    currentSchoolId={schoolData.id}
                    currentSchoolName={schoolData.name}
                    onMergeComplete={() => router.push("/schools")}
                />

                {/* Stats cards */}
                {showComparisonWarning && showPrevYearWarning && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 text-yellow-900 text-sm rounded-md">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <span className="flex-1">
                            This is the earliest year of available data for this
                            school — year-over-year comparisons are not
                            available.
                        </span>
                        <button
                            onClick={() => setShowPrevYearWarning(false)}
                            className="flex-shrink-0 hover:bg-yellow-100 rounded p-1"
                            aria-label="Dismiss"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}
                <div className="grid grid-cols-3 gap-8">
                    <StatCard
                        label={ENTITY_CONFIG.projects.label}
                        value={schoolData.projectCount}
                        icon={ENTITY_CONFIG.projects.icon}
                        iconColor={ENTITY_CONFIG.projects.color}
                        sparklineData={projectsSparkline}
                        sparklineStroke={ENTITY_CONFIG.projects.colorMid}
                        sparklineFill={ENTITY_CONFIG.projects.colorMuted}
                        percentChange={projectsPercentChange}
                        showTrend={true}
                        variant="with-aspect"
                        href={chartHref("total-project-count")}
                    />
                    <StatCard
                        label={ENTITY_CONFIG.teachers.label}
                        value={schoolData.teacherCount}
                        icon={ENTITY_CONFIG.teachers.icon}
                        iconColor={ENTITY_CONFIG.teachers.color}
                        sparklineData={teachersSparkline}
                        sparklineStroke={ENTITY_CONFIG.teachers.colorMid}
                        sparklineFill={ENTITY_CONFIG.teachers.colorMuted}
                        percentChange={teachersPercentChange}
                        showTrend={true}
                        variant="with-aspect"
                        href={chartHref("total-teacher-count")}
                    />
                    <StatCard
                        label={ENTITY_CONFIG.students.label}
                        value={schoolData.studentCount}
                        icon={ENTITY_CONFIG.students.icon}
                        iconColor={ENTITY_CONFIG.students.color}
                        sparklineData={studentsSparkline}
                        sparklineStroke={ENTITY_CONFIG.students.colorMid}
                        sparklineFill={ENTITY_CONFIG.students.colorMuted}
                        percentChange={studentsPercentChange}
                        showTrend={true}
                        variant="with-aspect"
                        href={chartHref("total-student-count")}
                    />
                </div>

                {/* Info Row */}
                <SchoolInfoRow
                    town={schoolData.town}
                    region={schoolData.region}
                    implementationModel={schoolData.implementationModel}
                    firstYear={schoolData.firstYear}
                />
                <Link
                    href={chartHref("total-student-count")}
                    className="block rounded-lg border border-border px-6 pt-4 pb-2 hover:bg-muted/40 transition-colors"
                >
                    <p className="text-sm font-medium text-center mb-2">
                        Total # Students
                    </p>
                    <MultiLineGraph
                        datasets={[studentData]}
                        yAxisLabel={"Total # Students"}
                        xAxisLabel="Year"
                    />
                </Link>

                {/* Project type distribution — same 3-col grid as stats; spans 2 cells */}
                {projects.length !== 0 && (
                    <div className="grid grid-cols-3 gap-8">
                        <div className="col-span-2 min-w-0">
                            <PieChart
                                slices={projectCategoryDistribution(projects)}
                                legendTitle="Project Type Distribution"
                                emptyMessage="No project data"
                            />
                        </div>
                    </div>
                )}

                {/* School location map */}
                <div className="rounded-lg space-y-4">
                    <h2 className="text-xl font-semibold text-foreground">
                        School Location
                    </h2>
                    <SchoolLocationEditor
                        fixedSchool={{ name: schoolData.name }}
                    />
                </div>

                {/* Editable project data table */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <h2 className="text-xl font-semibold text-foreground">
                            View and Edit Data
                        </h2>
                        <Tooltip>
                            <TooltipTrigger>
                                <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                                Double-click any cell to edit. Teacher changes
                                apply globally across all projects.
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    <EditableProjectsTable
                        key={`${schoolName}-${year}`}
                        initialData={projects}
                    />
                </div>
            </div>
        </div>
    );
}
