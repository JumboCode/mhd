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
import { MapPlacer } from "@/components/ui/mapPlacer";
import { SchoolInfoRow } from "@/components/SchoolInfoRow";
import { StatCard } from "@/components/ui/stat-card";
import { ENTITY_CONFIG } from "@/lib/entity-config";
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

// interface such that data can be blank if API is loading
type SchoolData = {
    name: string;
    town: string;
    studentCount: string;
    teacherCount: string;
    projectCount: string;
    firstYear: string;
    projects: ProjectRow[];
    instructionalModel: string;
    region: string;
    implementationModel: string;
};

type MapCoordinates = {
    latitude: number | null;
    longitude: number | null;
};

type ProjectRow = EditableProjectRow;

export default function SchoolProfilePage() {
    const params = useParams();
    const schoolName = params.name as string;
    const router = useRouter();

    const [schoolData, setSchoolData] = useState<SchoolData | null>(null);
    const [coordinates, setCoordinates] = useState<MapCoordinates | null>(null);
    const [year, setYear] = useState<number | null>(null);
    const [projects, setProjects] = useState<ProjectRow[]>([]);
    const [editingName, setEditingName] = useState(false);
    const [nameDraft, setNameDraft] = useState("");
    const nameInputRef = useRef<HTMLInputElement>(null);
    const [instructionalModel, setInstructionalModel] = useState("Dummy 1");
    const [studentYearData, setstudentYearData] = useState<
        { x: string | number; y: number }[]
    >([]);
    const [allYearsData, setAllYearsData] = useState<SchoolData[]>([]);

    useEffect(() => {
        if (!year) return;

        fetch(`/api/schools/${schoolName}?year=${year}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch school data`);
                }
                return response.json();
            })
            .then((data) => {
                setSchoolData(data);
                setProjects(data.projects);
                setInstructionalModel(data.instructionalModel ?? "Dummy 1");
            })
            .catch(() => {
                toast.error(
                    "Failed to load school data. Redirecting to schools page.",
                );
                // Redirect after showing error
                setTimeout(() => {
                    router.push("/schools");
                }, 2000);
            });
    }, [schoolName, router, year]);

    // Fetches data for the last 5 years in parallel for sparklines
    useEffect(() => {
        if (!year) return;
        const fetchData = async () => {
            const years = Array.from({ length: 5 }, (_, i) => year - (4 - i));
            try {
                const results = await Promise.all(
                    years.map((y) =>
                        fetch(`/api/schools/${schoolName}?year=${y}`).then(
                            (r) => r.json(),
                        ),
                    ),
                );
                const points = results.map((yearInfo, i) => ({
                    x: years[i],
                    y: Number(yearInfo.studentCount),
                }));
                setstudentYearData(points);
                setAllYearsData(results);
            } catch {
                toast.error("Failed to load dashboard data. Please try again.");
            }
        };
        fetchData();
    }, [year, schoolName]);

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

    const studentsHref =
        year !== null
            ? `/chart?type=line&startYear=${year - 5}&endYear=${year}&measuredAs=total-student-count&schools=${encodeURIComponent(schoolData?.name ?? "")}`
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

    // Calculate percent changes (current year vs previous year)
    const calculatePercentChange = (current: number, previous: number) => {
        if (previous === 0) return null;
        return ((current - previous) / previous) * 100;
    };

    const currentProjects = Number(schoolData?.projectCount || 0);
    const previousProjects =
        allYearsData.length >= 2
            ? Number(allYearsData[allYearsData.length - 2]?.projectCount || 0)
            : 0;
    const projectsPercentChange = calculatePercentChange(
        currentProjects,
        previousProjects,
    );

    const currentTeachers = Number(schoolData?.teacherCount || 0);
    const previousTeachers =
        allYearsData.length >= 2
            ? Number(allYearsData[allYearsData.length - 2]?.teacherCount || 0)
            : 0;
    const teachersPercentChange = calculatePercentChange(
        currentTeachers,
        previousTeachers,
    );

    const currentStudents = Number(schoolData?.studentCount || 0);
    const previousStudents =
        allYearsData.length >= 2
            ? Number(allYearsData[allYearsData.length - 2]?.studentCount || 0)
            : 0;
    const studentsPercentChange = calculatePercentChange(
        currentStudents,
        previousStudents,
    );

    if (!schoolData) {
        return (
            <div className="h-screen w-full bg-background overflow-y-auto flex justify-center">
                <div className="w-full flex flex-col gap-6 py-8 max-w-5xl px-6">
                    <div className="flex flex-row items-center w-full">
                        <Skeleton className="h-8 w-64" />
                        <div className="ml-auto">
                            <YearDropdown
                                showDataIndicator={true}
                                selectedYear={year}
                                onYearChange={(selectedYear) => {
                                    if (selectedYear !== null) {
                                        setYear(selectedYear);
                                    }
                                }}
                                school={decodeURIComponent(schoolName)}
                            />
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
                    <div className="ml-auto">
                        <YearDropdown
                            showDataIndicator={true}
                            selectedYear={year}
                            onYearChange={(selectedYear) => {
                                if (selectedYear !== null) {
                                    setYear(selectedYear);
                                }
                            }}
                            school={schoolData.name}
                        />
                    </div>
                </div>

                {/* Stats cards */}
                <div className="grid grid-cols-3 gap-8">
                    <StatCard
                        label={ENTITY_CONFIG.projects.label}
                        value={schoolData.projectCount}
                        icon={ENTITY_CONFIG.projects.icon}
                        iconColor={ENTITY_CONFIG.projects.color}
                        sparklineData={projectsSparkline}
                        sparklineStroke={ENTITY_CONFIG.projects.colorMid}
                        sparklineFill={ENTITY_CONFIG.projects.colorMuted}
                        percentChange={projectsPercentChange ?? undefined}
                        variant="with-aspect"
                    />
                    <StatCard
                        label={ENTITY_CONFIG.teachers.label}
                        value={schoolData.teacherCount}
                        icon={ENTITY_CONFIG.teachers.icon}
                        iconColor={ENTITY_CONFIG.teachers.color}
                        sparklineData={teachersSparkline}
                        sparklineStroke={ENTITY_CONFIG.teachers.colorMid}
                        sparklineFill={ENTITY_CONFIG.teachers.colorMuted}
                        percentChange={teachersPercentChange ?? undefined}
                        variant="with-aspect"
                    />
                    <StatCard
                        label={ENTITY_CONFIG.students.label}
                        value={schoolData.studentCount}
                        icon={ENTITY_CONFIG.students.icon}
                        iconColor={ENTITY_CONFIG.students.color}
                        sparklineData={studentsSparkline}
                        sparklineStroke={ENTITY_CONFIG.students.colorMid}
                        sparklineFill={ENTITY_CONFIG.students.colorMuted}
                        percentChange={studentsPercentChange ?? undefined}
                        variant="with-aspect"
                    />
                </div>

                {/* Info Row */}
                <SchoolInfoRow
                    town={schoolData.town}
                    instructionalModel={instructionalModel}
                    firstYear={schoolData.firstYear}
                />
                <Link
                    href={studentsHref}
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
                <div className="grid grid-cols-3 gap-8">
                    <div className="col-span-2 min-w-0">
                        <PieChart
                            slices={projectCategoryDistribution(projects)}
                            legendTitle="Project Type Distribution"
                            emptyMessage="No project data"
                        />
                    </div>
                </div>

                {/* School location map */}
                <div className="rounded-lg space-y-4">
                    <h2 className="text-xl font-semibold mb-4 text-foreground">
                        School Location
                    </h2>
                    <div className="h-80 rounded-lg overflow-hidden border border-border">
                        <MapPlacer
                            schoolId={schoolName}
                            schoolName={schoolData.name}
                            onCoordinatesLoaded={setCoordinates}
                        />
                    </div>
                    <div className="mt-3 text-sm text-muted-foreground flex justify-between items-center">
                        <div className="flex items-center gap-1.5">
                            {coordinates &&
                                coordinates.latitude !== null &&
                                coordinates.longitude !== null && (
                                    <div className="bg-muted text-black px-2 rounded border">
                                        <span>
                                            Coordinates:{" "}
                                            {coordinates.latitude.toFixed(6)},{" "}
                                            {coordinates.longitude.toFixed(6)}
                                        </span>
                                    </div>
                                )}
                        </div>
                        <div>
                            {/* TO DO: Replace with actual dates from db */}
                            Last Updated:{" "}
                            {new Date().toLocaleDateString("en-US", {
                                month: "2-digit",
                                day: "2-digit",
                                year: "numeric",
                            })}
                        </div>
                    </div>
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
