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
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SchoolProfileSkeleton } from "@/components/skeletons/SchoolProfileSkeleton";
import { MapPlacer } from "@/components/ui/mapPlacer";
import { SchoolInfoRow } from "@/components/SchoolInfoRow";
import YearDropdown from "@/components/YearDropdown";
import MultiLineGraph from "@/components/LineGraph";
import BarGraph from "@/components/BarGraph";
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
    const [year, setYear] = useState<number | null>(2025);
    const [projects, setProjects] = useState<ProjectRow[]>([]);

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

    if (!schoolData) {
        return <SchoolProfileSkeleton />;
    }

    return (
        <div className="h-screen w-full bg-background overflow-y-auto flex justify-center">
            <div className="w-full flex flex-col gap-6 py-8 max-w-5xl px-6">
                <Breadcrumbs />
                {/* Header with school name */}
                <h1 className="text-2xl font-bold">{schoolData.name}</h1>
                <YearDropdown
                    showDataIndicator={true}
                    selectedYear={year}
                    onYearChange={setYear}
                />

                {/* Stats cards */}
                <div className="grid grid-cols-3 gap-8">
                    <StatCard
                        label="Total # Projects"
                        value={schoolData.projectCount}
                    />
                    <StatCard
                        label="Total # Teachers"
                        value={schoolData.teacherCount}
                    />
                    <StatCard
                        label="Total # Students"
                        value={schoolData.studentCount}
                    />
                </div>

                {/* Info Row */}
                <SchoolInfoRow
                    town={schoolData.town}
                    instructionalModel={schoolData.instructionalModel}
                    firstYear={schoolData.firstYear}
                />

                {/* Placeholders for charts */}
                <div className="grid grid-cols-3 gap-8">
                    <PlaceholderCard
                        title="Region Distribution"
                        className="col-span-2"
                    />
                    <PlaceholderCard title="% Highschool" />
                </div>

                {/* School location map */}
                <div className="border border-border rounded-lg px-6 py-4 space-y-4">
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
                        View and edit data
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

// Reusable stat card component
function StatCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-border p-6 aspect-[247/138] gap-5">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="font-mono text-5xl font-bold leading-none">
                {value}
            </span>
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
