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
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SchoolProfileSkeleton } from "@/components/skeletons/SchoolProfileSkeleton";
import { MapPlacer } from "@/components/ui/mapPlacer";
import { SchoolInfoRow } from "@/components/SchoolInfoRow";
import { StatCard } from "@/components/ui/stat-card";
import { ENTITY_CONFIG } from "@/lib/entity-config";
import YearDropdown from "@/components/YearDropdown";
import MultiLineGraph, { GraphDataset } from "@/components/LineGraph";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";

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
};

type MapCoordinates = {
    latitude: number | null;
    longitude: number | null;
};

type ProjectRow = {
    id: string;
    title: string;
    numStudents: number;
    year: number;
};

export default function SchoolProfilePage() {
    const params = useParams();
    const schoolName = params.name as string;
    const router = useRouter();

    const [schoolData, setSchoolData] = useState<SchoolData | null>(null);
    const [coordinates, setCoordinates] = useState<MapCoordinates | null>(null);
    const [year, setYear] = useState<number>(2025);
    const [projects, setProjects] = useState<ProjectRow[]>([]);
    const [studentYearData, setstudentYearData] = useState<
        { x: string | number; y: number }[]
    >([]);

    const projectColumns: ColumnDef<ProjectRow>[] = [
        {
            accessorKey: "title",
            header: "Title",
        },
        {
            accessorKey: "numStudents",
            header: "Students",
        },
        {
            accessorKey: "year",
            header: "Year",
        },
    ];

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
            })
            .catch(() => {
                toast.error(
                    "Failed to load school data. Redirecting to schools page...",
                );
                // Redirect after showing error
                setTimeout(() => {
                    router.push("/schools");
                }, 2000);
            });
    }, [schoolName, router, year]);

    // Fetches student data for the last 5 years in parallel
    useEffect(() => {
        const fetchData = async () => {
            const years = Array.from({ length: 6 }, (_, i) => year - (5 - i));
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
            } catch {
                toast.error("Failed to load dashboard data. Please try again.");
            }
        };
        fetchData();
    }, [year, schoolName]);

    const studentData: GraphDataset = {
        label: "Students by Year",
        data: studentYearData,
    };

    const studentsHref = `/chart?type=line&startYear=${year - 5}&endYear=${year}&measuredAs=total-student-count&schools=${encodeURIComponent(schoolData?.name ?? "")}`;

    if (!schoolData) {
        return <SchoolProfileSkeleton />;
    }

    return (
        <div className="h-screen w-full bg-background overflow-y-auto flex justify-center">
            <div className="w-full flex flex-col gap-6 py-8 max-w-5xl px-6">
                <Breadcrumbs />
                {/* Header with school name */}
                <div className="flex flex-row items-center w-full">
                    <h1 className="text-2xl font-bold">{schoolData.name}</h1>
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
                        variant="with-aspect"
                    />
                    <StatCard
                        label={ENTITY_CONFIG.teachers.label}
                        value={schoolData.teacherCount}
                        icon={ENTITY_CONFIG.teachers.icon}
                        iconColor={ENTITY_CONFIG.teachers.color}
                        variant="with-aspect"
                    />
                    <StatCard
                        label={ENTITY_CONFIG.students.label}
                        value={schoolData.studentCount}
                        icon={ENTITY_CONFIG.students.icon}
                        iconColor={ENTITY_CONFIG.students.color}
                        variant="with-aspect"
                    />
                </div>

                {/* Info Row */}
                <SchoolInfoRow
                    town={schoolData.town}
                    instructionalModel={schoolData.instructionalModel}
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

                {/* Placeholders for charts */}
                <div className="grid grid-cols-3 gap-8">
                    <PlaceholderCard
                        title="Region Distribution"
                        className="col-span-2"
                    />
                    <PlaceholderCard title="% Highschool" />
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

                {/* Data table placeholder */}
                <div className="border border-border rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4 text-foreground">
                        Project Data
                    </h2>
                    <DataTable
                        columns={projectColumns}
                        data={projects}
                    ></DataTable>
                </div>
            </div>
        </div>
    );
}

// Reusable placeholder card component
function PlaceholderCard({
    title,
    className = "",
}: {
    title: string;
    className?: string;
}) {
    return (
        <div className={`border border-border rounded-lg p-6 ${className}`}>
            <div className="h-48 flex items-center justify-center bg-muted rounded">
                <div className="text-center">
                    <p className="text-sm font-semibold text-foreground">
                        {title}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                        Chart placeholder
                    </p>
                </div>
            </div>
        </div>
    );
}
