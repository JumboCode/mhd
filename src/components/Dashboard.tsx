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
import { GraphDataset } from "./LineGraph";
import { useRouter } from "next/navigation";

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

type chartFilters = {
    yearStart: number;
    yearEnd: number;
    isProjects: boolean;
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
     * Fetches data for the chart with total # of projects
     */
    useEffect(() => {
        const fetchData = async () => {
            setprojectsYearData([]);
            for (let i = 5; i >= 0; i--) {
                try {
                    const res = await fetch(
                        `/api/yearly-totals?year=${year - i}`,
                    );
                    const yearInfo = await res.json();

                    const thisYear: { x: string | number; y: number } = {
                        x: year - i,
                        y: yearInfo.yearlyStats.totals.total_projects,
                    };
                    setprojectsYearData((prev) => [thisYear, ...prev]);
                } catch {
                    toast.error(
                        "Failed to load dashboard data. Please try again.",
                    );
                }
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

    /*
     * Fetches data for the chart with total # of schools
     */
    useEffect(() => {
        const fetchData = async () => {
            setschoolYearData([]);
            for (let i = 5; i >= 0; i--) {
                try {
                    const res = await fetch(
                        `/api/yearly-totals?year=${year - i}`,
                    );
                    const yearInfo = await res.json();

                    const thisYear: { x: string | number; y: number } = {
                        x: year - i,
                        y: yearInfo.yearlyStats.totals.total_schools,
                    };
                    setschoolYearData((prev) => [thisYear, ...prev]);
                } catch {
                    toast.error(
                        "Failed to load dashboard data. Please try again.",
                    );
                }
            }
        };
        fetchData();
    }, [year]);

    const router = useRouter();

    const projectChartFilters = {
        yearStart: year - 5,
        yearEnd: year,
        isProjects: true,
    };

    const schoolChartFilters = {
        yearStart: year - 5,
        yearEnd: year,
        isProjects: false,
    };

    /**
     * linkToGraph
     * Routes the user to the page corresponding to a chart with the filters
     * passed in
     * @param filters The chart filters that are used to produce a link to a
     *                a chart on the actual charts page
     * returns: none
     */
    function linkToGraph(filters: chartFilters) {
        if (filters.isProjects) {
            router.push(
                `/chart?type=line&startYear=${filters.yearStart}&endYear=${filters.yearEnd}&measuredAs=total-project-count`,
            );
            return;
        }

        router.push(
            `/chart?type=line&startYear=${filters.yearStart}&endYear=${filters.yearEnd}`,
        );
    }

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
                    <div className="flex flex-col m-5 items-center justify-center rounded-lg border py-6 border-border">
                        Total # Projects
                        <button
                            onClick={() => linkToGraph(projectChartFilters)}
                        >
                            <MultiLineGraph
                                datasets={[projectsData]}
                                yAxisLabel={"Total # Projects"}
                                xAxisLabel="Year"
                            />
                        </button>
                        Total # Schools
                        <button onClick={() => linkToGraph(schoolChartFilters)}>
                            <MultiLineGraph
                                datasets={[schoolData]}
                                yAxisLabel={"Total # Schools"}
                                xAxisLabel="Year"
                            />
                        </button>
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
