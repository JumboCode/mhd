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
import { StatCard } from "@/components/ui/stat-card";
import { ENTITY_CONFIG } from "@/lib/entity-config";

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

type YearStats = {
    year: number;
    total_projects: number;
    total_teachers: number;
    total_students: number;
    total_schools: number;
};

type PercentChanges = {
    projects: number | null;
    teachers: number | null;
    students: number | null;
    schools: number | null;
};

export default function Dashboard() {
    const [year, setYear] = useState(() => new Date().getFullYear());
    const [stats, setStats] = useState<Stats | null>(null);
    const [allYearsStats, setAllYearsStats] = useState<YearStats[]>([]);
    const [percentChanges, setPercentChanges] = useState<PercentChanges | null>(
        null,
    );

    useEffect(() => {
        const fetchStats = async (selectedYear: number) => {
            try {
                const res = await fetch(
                    `/api/yearly-totals?year=${selectedYear}`,
                );
                const data = await res.json();

                setStats(data.yearlyStats);
                setAllYearsStats(data.allYearsStats || []);
                setPercentChanges(data.percentChanges || null);
            } catch {
                toast.error("Failed to load dashboard data. Please try again.");
            }
        };

        fetchStats(year);
    }, [year]);

    // Extract sparkline data arrays from allYearsStats (up to selected year)
    const filteredStats = allYearsStats.filter((s) => s.year <= year);
    const projectsSparkline = filteredStats.map((s) => s.total_projects);
    const teachersSparkline = filteredStats.map((s) => s.total_teachers);
    const studentsSparkline = filteredStats.map((s) => s.total_students);
    const schoolsSparkline = filteredStats.map((s) => s.total_schools);

    return (
        <div className="flex flex-col gap-8 w-full px-6 py-10">
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

            {stats ? (
                <div className="">
                    <div className="grid grid-cols-3 gap-5">
                        <StatCard
                            label={ENTITY_CONFIG.projects.label}
                            value={stats.totals.total_projects}
                            icon={ENTITY_CONFIG.projects.icon}
                            sparklineData={projectsSparkline}
                            sparklineStroke={ENTITY_CONFIG.projects.colorMid}
                            sparklineFill={ENTITY_CONFIG.projects.colorLight}
                            percentChange={
                                percentChanges?.projects ?? undefined
                            }
                        />
                        <StatCard
                            label={ENTITY_CONFIG.teachers.label}
                            value={stats.totals.total_teachers}
                            icon={ENTITY_CONFIG.teachers.icon}
                            sparklineData={teachersSparkline}
                            sparklineStroke={ENTITY_CONFIG.teachers.colorMid}
                            sparklineFill={ENTITY_CONFIG.teachers.colorLight}
                            percentChange={
                                percentChanges?.teachers ?? undefined
                            }
                        />
                        <StatCard
                            label={ENTITY_CONFIG.students.label}
                            value={stats.totals.total_students}
                            icon={ENTITY_CONFIG.students.icon}
                            sparklineData={studentsSparkline}
                            sparklineStroke={ENTITY_CONFIG.students.colorMid}
                            sparklineFill={ENTITY_CONFIG.students.colorLight}
                            percentChange={
                                percentChanges?.students ?? undefined
                            }
                        />
                        <StatCard
                            label={ENTITY_CONFIG.schools.label}
                            value={stats.totals.total_schools}
                            icon={ENTITY_CONFIG.schools.icon}
                            sparklineData={schoolsSparkline}
                            sparklineStroke={ENTITY_CONFIG.schools.colorMid}
                            sparklineFill={ENTITY_CONFIG.schools.colorLight}
                            percentChange={percentChanges?.schools ?? undefined}
                        />
                        {/* TODO: Once we store type of school, make this correct */}
                        <StatCard label="% Highschool" value={12} />
                    </div>
                </div>
            ) : null}
        </div>
    );
}
