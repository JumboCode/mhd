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

import { useState, useEffect } from "react";

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
    const [year, setYear] = useState(2024);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchStats = async (selectedYear: number) => {
            setLoading(true);
            try {
                const res = await fetch(
                    `/api/yearly-totals?year=${selectedYear}`,
                );
                const data = await res.json();

                setStats(data.yearlyStats);
            } catch (error) {
                alert("Major error: big leagues are calling." + error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats(year);
    }, [year]);

    return (
        <div className="flex flex-col gap-8 w-full max-w-5xl px-6">
            <div>{/* TO DO: Toast here (if we want) */}</div>
            {/* Header and dropdown menu */}
            <h1 className="text-2xl font-semibold">Overview Dashboard</h1>
            <div className="">
                {/* Dropdown menu */}
                <div className="w-40">
                    <select
                        value={year}
                        onChange={(e) => setYear(parseInt(e.target.value))}
                        className="border border-input rounded-lg px-3 md:px-4py-1.5 md:py-2 w-full text-sm md:text-base text-foreground shadow-sm"
                    >
                        {[2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018].map(
                            (y) => (
                                <option key={y} value={y}>
                                    {y}
                                </option>
                            ),
                        )}
                    </select>
                </div>
            </div>

            {loading && <p className="text-muted-foreground">Loading...</p>}

            {stats && !loading && (
                <div className="">
                    <div className="grid grid-cols-3 gap-5">
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
                        {/* TO DO: Once we store type of school, make this correct */}
                        <StatCard label="% Highschool" value={12} />
                    </div>
                </div>
            )}
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
