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
import { toast } from "sonner";
import YearDropdown from "@/components/YearDropdown";
import MultiLineGraph from "./LineGraph";
import type { GraphDataset } from "./LineGraph";
import Link from "next/link";

type Stats = {
    totals: {
        total_projects: number;
        total_teachers: number;
        total_students: number;
        total_schools: number;
        total_cities: number;
    };
    year: number;
};

export default function Dashboard() {
    const [year, setYear] = useState(() => new Date().getFullYear());
    const [stats, setStats] = useState<Stats | null>(null);

    useEffect(() => {
        const fetchStats = async (selectedYear: number) => {
            try {
                const res = await fetch(
                    `/api/yearly-totals?year=${selectedYear}`,
                );
                const data = await res.json();

                setStats(data.yearlyStats);
            } catch {
                toast.error("Failed to load dashboard data. Please try again.");
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
        const fetchData = async () => {
            const years = Array.from({ length: 6 }, (_, i) => year - (5 - i));
            try {
                const results = await Promise.all(
                    years.map((y) =>
                        fetch(`/api/yearly-totals?year=${y}`).then((r) =>
                            r.json(),
                        ),
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
                toast.error("Failed to load dashboard data. Please try again.");
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

    const projectsHref = `/chart?type=line&startYear=${year - 5}&endYear=${year}&measuredAs=total-project-count`;
    const schoolsHref = `/chart?type=line&startYear=${year - 5}&endYear=${year}`;

    return (
        <div className="flex flex-col gap-8 w-full px-6 py-10">
            <div className="flex flex-row gap-5">
                <h1 className="text-2xl font-semibold">Overview Dashboard</h1>
                <div className="">
                    <YearDropdown
                        showDataIndicator={true}
                        selectedYear={year}
                        onYearChange={(selectedYear) => {
                            if (selectedYear !== null) {
                                setYear(selectedYear);
                            }
                        }}
                    />
                </div>
            </div>

            {stats ? (
                <div className="">
                    <div className="grid grid-cols-4 gap-5">
                        <StatCard
                            label="Total # Projects"
                            value={stats.totals.total_projects}
                        />
                        <StatCard
                            label="Total # Teachers"
                            value={stats.totals.total_teachers}
                        />
                        <StatCard
                            label="Total # Students"
                            value={stats.totals.total_students}
                        />
                        <StatCard
                            label="# Schools"
                            value={stats.totals.total_schools}
                        />
                        {/* TODO: Once we store type of school, make this correct */}
                    </div>
                    <div className="flex flex-col my-5 rounded-lg border border-border divide-y divide-border">
                        <Link
                            href={projectsHref}
                            className="block px-6 pt-4 pb-2 hover:bg-muted/40 transition-colors"
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
                            className="block px-6 pt-4 pb-2 hover:bg-muted/40 transition-colors"
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
            ) : null}
        </div>
    );
}

/* Statcard component used to display all totals */
function StatCard({ label, value }: { label: string; value: number }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-border py-6 gap-5">
            <span className="text-xs">{label}</span>
            <span className="font-mono text-5xl font-bold leading-none">
                {value}
            </span>
        </div>
    );
}
