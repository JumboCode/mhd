/***************************************************************
 *
 *                dashboard.tsx
 *
 *         Author: Justin
 *           Date: 11/19/2025
 *
 *        Summary: Main dashboard page displaying yearly statistics
 *
 **************************************************************/

"use client";

import { useEffect, useState } from "react";
import YearDropdown from "@/components/YearDropdown";
import { StatCard } from "@/components/ui/stat-card";
import { ENTITY_CONFIG } from "@/lib/entity-config";
import MultiLineGraph from "./charts/LineGraph";
import type { GraphDataset } from "./charts/LineGraph";
import Link from "next/link";
import { DashboardSkeleton } from "@/components/skeletons/DashboardSkeleton";
import { LoadError } from "@/components/ui/load-error";
import { AlertCircle, X } from "lucide-react";

type Stats = {
    totals: {
        total_projects: number;
        total_teachers: number;
        total_competing_students: number;
        total_participating_students: number;
        total_schools: number;
        total_cities: number;
    };
    year: number;
};

type YearStats = {
    year: number;
    total_projects: number;
    total_teachers: number;
    total_competing_students: number;
    total_participating_students: number;
    total_schools: number;
};

type PercentChanges = {
    projects: number | null;
    teachers: number | null;
    competing_students: number | null;
    participating_students: number | null;
    schools: number | null;
};

export default function Dashboard() {
    const [year, setYear] = useState<number | null>(null);
    const [stats, setStats] = useState<Stats | null>(null);
    const [allYearsStats, setAllYearsStats] = useState<YearStats[]>([]);
    const [percentChanges, setPercentChanges] = useState<PercentChanges | null>(
        null,
    );
    const [error, setError] = useState<string | null>(null);
    const [showPrevYearWarning, setShowPrevYearWarning] = useState(true);

    useEffect(() => {
        setShowPrevYearWarning(true);
    }, [year]);

    useEffect(() => {
        if (year === null) return;
        const fetchStats = async (selectedYear: number) => {
            setError(null);
            try {
                const res = await fetch(
                    `/api/yearly-totals?year=${selectedYear}`,
                );
                if (!res.ok) throw new Error("Failed to load dashboard data");
                const data = await res.json();

                setStats(data.yearlyStats);
                setAllYearsStats(data.allYearsStats || []);
                setPercentChanges(data.percentChanges || null);
            } catch {
                setError("Failed to load dashboard data");
            }
        };

        fetchStats(year);
    }, [year]);
    const [projectsyearData, setprojectsYearData] = useState<
        { x: string | number; y: number }[]
    >([]);
    const [schoolyearData, setschoolYearData] = useState<
        { x: string | number; y: number }[]
    >([]);

    /*
     * Fetches data for both charts in parallel across all years.
     * Uses Promise.all so all years load at once before updating state.
     */
    useEffect(() => {
        if (year === null) return;
        const fetchData = async () => {
            const years = Array.from({ length: 6 }, (_, i) => year - (5 - i));
            setError(null);
            try {
                const results = await Promise.all(
                    years.map((y) =>
                        fetch(`/api/yearly-totals?year=${y}`).then((r) => {
                            if (!r.ok) throw new Error("Failed to fetch data");
                            return r.json();
                        }),
                    ),
                );
                const projectsPoints = results.map((yearInfo, i) => ({
                    x: years[i],
                    y: yearInfo.yearlyStats.totals.total_projects as number,
                }));
                const schoolsPoints = results.map((yearInfo, i) => ({
                    x: years[i],
                    y: yearInfo.yearlyStats.totals.total_schools as number,
                }));
                setprojectsYearData(projectsPoints);
                setschoolYearData(schoolsPoints);
            } catch {
                setError("Failed to load dashboard data");
            }
        };
        fetchData();
    }, [year]);

    const projectsData: GraphDataset = {
        label: "Projects by Year",
        data: projectsyearData,
    };

    const schoolData: GraphDataset = {
        label: "Schools by Year",
        data: schoolyearData,
    };

    const projectsHref =
        year !== null
            ? `/chart?type=line&startYear=${year - 5}&endYear=${year}&measuredAs=total-project-count`
            : "#";
    const schoolsHref =
        year !== null
            ? `/chart?type=line&startYear=${year - 5}&endYear=${year}`
            : "#";

    // Extract sparkline data arrays from allYearsStats (up to selected year)
    // Include all years in the range, filling in 0 for missing years
    const sparklineYears =
        year !== null ? Array.from({ length: 6 }, (_, i) => year - 5 + i) : [];
    const statsMap = new Map(allYearsStats.map((s) => [s.year, s]));
    const projectsSparkline = sparklineYears.map(
        (y) => statsMap.get(y)?.total_projects ?? 0,
    );
    const teachersSparkline = sparklineYears.map(
        (y) => statsMap.get(y)?.total_teachers ?? 0,
    );
    const competingStudentsSparkline = sparklineYears.map(
        (y) => statsMap.get(y)?.total_competing_students ?? 0,
    );
    const participatingStudentsSparkline = sparklineYears.map(
        (y) => statsMap.get(y)?.total_participating_students ?? 0,
    );
    const schoolsSparkline = sparklineYears.map(
        (y) => statsMap.get(y)?.total_schools ?? 0,
    );

    const oldestYearWithData =
        allYearsStats.length > 0
            ? Math.min(...allYearsStats.map((s) => s.year))
            : null;
    const showFirstYearComparisonWarning =
        year !== null &&
        oldestYearWithData !== null &&
        year === oldestYearWithData &&
        percentChanges === null;

    const handleRetry = () => {
        setError(null);
        setStats(null);
        if (year !== null) {
            setYear(year);
        }
    };

    return (
        <div className="flex flex-col gap-5 w-full p-8">
            <div className="flex flex-row items-center">
                <h1 className="text-2xl font-semibold">Overview Dashboard</h1>
                <div className="ml-auto">
                    <YearDropdown
                        selectedYear={year}
                        onYearChange={(selectedYear) => {
                            if (selectedYear !== null) {
                                setYear(selectedYear);
                            }
                        }}
                        showDataIndicator={false}
                    />
                </div>
            </div>

            {error ? (
                <LoadError
                    message={error}
                    onRetry={handleRetry}
                    className="h-96"
                />
            ) : stats ? (
                <div className="">
                    {showFirstYearComparisonWarning && showPrevYearWarning && (
                        <div className="mb-5 flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 text-yellow-900 text-sm rounded-md">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            <span className="flex-1">
                                This is the earliest year of available data —
                                year-over-year comparisons are not available.
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
                    <div className="grid grid-cols-5 gap-5">
                        <StatCard
                            label={ENTITY_CONFIG.projects.label}
                            value={stats.totals.total_projects}
                            icon={ENTITY_CONFIG.projects.icon}
                            iconColor={ENTITY_CONFIG.projects.color}
                            sparklineData={projectsSparkline}
                            sparklineStroke={ENTITY_CONFIG.projects.colorMid}
                            sparklineFill={ENTITY_CONFIG.projects.colorMuted}
                            percentChange={
                                percentChanges?.projects ?? undefined
                            }
                            showTrend={true}
                            href="/chart?measuredAs=total-project-count&type=line"
                        />
                        <StatCard
                            label={ENTITY_CONFIG.teachers.label}
                            value={stats.totals.total_teachers}
                            icon={ENTITY_CONFIG.teachers.icon}
                            iconColor={ENTITY_CONFIG.teachers.color}
                            sparklineData={teachersSparkline}
                            sparklineStroke={ENTITY_CONFIG.teachers.colorMid}
                            sparklineFill={ENTITY_CONFIG.teachers.colorMuted}
                            percentChange={
                                percentChanges?.teachers ?? undefined
                            }
                            showTrend={true}
                            href="/chart?measuredAs=total-teacher-count&type=line"
                        />
                        <StatCard
                            label="Total # Competing"
                            value={stats.totals.total_competing_students ?? 0}
                            icon={ENTITY_CONFIG.studentsCompeting.icon}
                            iconColor={ENTITY_CONFIG.studentsCompeting.color}
                            sparklineData={competingStudentsSparkline}
                            sparklineStroke={
                                ENTITY_CONFIG.studentsCompeting.colorMid
                            }
                            sparklineFill={
                                ENTITY_CONFIG.studentsCompeting.colorMuted
                            }
                            percentChange={
                                percentChanges?.competing_students ?? undefined
                            }
                            showTrend={true}
                            href="/chart?measuredAs=total-competing-student-count&type=line"
                        />
                        <StatCard
                            label="Total # Participating"
                            value={stats.totals.total_participating_students}
                            icon={ENTITY_CONFIG.studentsParticipating.icon}
                            iconColor={
                                ENTITY_CONFIG.studentsParticipating.color
                            }
                            sparklineData={participatingStudentsSparkline}
                            sparklineStroke={
                                ENTITY_CONFIG.studentsParticipating.colorMid
                            }
                            sparklineFill={
                                ENTITY_CONFIG.studentsParticipating.colorMuted
                            }
                            percentChange={
                                percentChanges?.participating_students ??
                                undefined
                            }
                            showTrend={true}
                            href="/chart?measuredAs=total-participating-student-count&type=line"
                        />
                        <StatCard
                            label={ENTITY_CONFIG.schools.label}
                            value={stats.totals.total_schools}
                            icon={ENTITY_CONFIG.schools.icon}
                            iconColor={ENTITY_CONFIG.schools.color}
                            sparklineData={schoolsSparkline}
                            sparklineStroke={ENTITY_CONFIG.schools.colorMid}
                            sparklineFill={ENTITY_CONFIG.schools.colorMuted}
                            percentChange={percentChanges?.schools ?? undefined}
                            showTrend={true}
                            href="/chart?measuredAs=total-school-count&type=line"
                        />
                        {/* TODO: Once we store type of school, make this correct */}
                    </div>
                    <div className="grid grid-cols-2 gap-5 my-5">
                        <Link
                            href={projectsHref}
                            className="block px-6 pt-4 pb-2 rounded-lg border border-border hover:bg-muted/40 transition-colors"
                        >
                            <p className="text-sm font-medium text-center mb-2">
                                Total # Projects
                            </p>
                            <MultiLineGraph
                                datasets={[projectsData]}
                                yAxisLabel={"Total # Projects"}
                                xAxisLabel="Year"
                            />
                        </Link>
                        <Link
                            href={schoolsHref}
                            className="block px-6 pt-4 pb-2 rounded-lg border border-border hover:bg-muted/40 transition-colors"
                        >
                            <p className="text-sm font-medium text-center mb-2">
                                Total # Schools
                            </p>
                            <MultiLineGraph
                                datasets={[schoolData]}
                                yAxisLabel={"Total # Schools"}
                                xAxisLabel="Year"
                            />
                        </Link>
                    </div>
                </div>
            ) : (
                <DashboardSkeleton />
            )}
        </div>
    );
}
