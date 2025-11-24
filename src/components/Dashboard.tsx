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

export default function Dashboard() {
    const [year, setYear] = useState(2024);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    async function fetchStats(selectedYear: number) {
        setLoading(true);
        try {
            const res = await fetch(`/api/yearly-totals?year=${selectedYear}`);
            const data = await res.json();
            setStats(data);
        } catch (err) {
            console.error("fetchStats error:", err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchStats(year);
    }, [year]);

    return (
        <div className="flex flex-col gap-8 w-full max-w-5xl px-6">
            <div>{/* Toast here */}</div>
            {/* Header and dropdown menu */}
            <h1 className="text-2xl font-semibold">Overview Dashboard</h1>
            <div className="">
                {/* Dropdown menu */}
                <div className="w-40">
                    <select
                        value={year}
                        onChange={(e) => setYear(parseInt(e.target.value))}
                        className="border border-gray-300 rounded-lg px-3 md:px-4py-1.5 md:py-2 w-full text-sm md:text-base text-gray-700 shadow-sm"
                    >
                        {[2024, 2023, 2022, 2021].map((y) => (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {loading && <p className="text-gray-500">Loading...</p>}

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
                        <StatCard label="% Highschool" value={0} />
                    </div>
                </div>
            )}
        </div>
    );
}

/* Statcard component used to display all totals */
function StatCard({ label, value }: { label: string; value: number }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 py-6 gap-5">
            <span className="text-xs">{label}</span>
            <span className="font-mono text-5xl font-bold leading-none">
                {value}
            </span>
        </div>
    );
}
