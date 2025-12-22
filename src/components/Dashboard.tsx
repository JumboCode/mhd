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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

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
            } catch {
                toast.error("Failed to load dashboard data. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchStats(year);
    }, [year]);

    return (
        <div className="flex flex-col gap-8 w-full max-w-5xl px-6">
            <h1 className="text-2xl font-semibold">Overview Dashboard</h1>
            <div className="">
                <div className="w-40">
                    <Select
                        value={year.toString()}
                        onValueChange={(value) => setYear(parseInt(value, 10))}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select a year" />
                        </SelectTrigger>
                        <SelectContent>
                            {[
                                2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018,
                            ].map((y) => (
                                <SelectItem key={y} value={y.toString()}>
                                    {y}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
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
                        {/* TODO: Once we store type of school, make this correct */}
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
