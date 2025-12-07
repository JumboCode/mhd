"use client";

import { useState, useEffect, useMemo } from "react";
import LineGraph, { GraphDataset } from "@/components/LineGraph";
import GraphFilters, { Filters } from "@/components/GraphFilters";

type Project = {
    id: number;
    title: string;
    division: string;
    category: string;
    year: number;
    group: boolean;
    schoolId: number;
    schoolName: string;
    schoolTown: string;
    teacherId: number;
    teacherFirstName: string;
    teacherLastName: string;
};

const measuredAsLabels: Record<string, string> = {
    "total-count": "Total Count",
    "total-student-count": "Total Student Count",
    "total-city-count": "Total City Count",
    "total-project-count": "Total Project Count",
    "total-teacher-count": "Total Teacher Count",
    "school-return-rate": "School Return Rate",
};

const groupByLabels: Record<string, string> = {
    "region": "Region",
    "school-type": "School Type",
    "division": "Division",
    "implementation-type": "Implementation Type",
    "project-type": "Project Type",
};

export default function LineGraphPage() {
    const [allProjects, setAllProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<Filters | null>(null);

    // Fetch all project data on mount
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await fetch("/api/projects");
                if (!response.ok) throw new Error("Failed to fetch");
                const data = await response.json();
                setAllProjects(data);
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    // Memoize graph dataset calculation, runs only on data/filter change
    const graphDatasets: GraphDataset[] = useMemo(() => {
        if (!allProjects.length) return [];

        // Pre-calculate teacher participation years if filter active
        const teacherYearsMap = new Map<number, number>();
        if (filters?.teacherYearsValue) {
            const tempMap: Record<number, Set<number>> = {};
            allProjects.forEach((p) => {
                if (!tempMap[p.teacherId]) tempMap[p.teacherId] = new Set();
                tempMap[p.teacherId].add(p.year);
            });
            Object.entries(tempMap).forEach(([tId, yearsSet]) => {
                teacherYearsMap.set(Number(tId), yearsSet.size);
            });
        }

        // Filter projects based on active filters
        const filteredProjects = allProjects.filter((p) => {
            if (!filters) return true;

            if (filters.individualProjects && !filters.groupProjects && p.group)
                return false;
            if (
                filters.groupProjects &&
                !filters.individualProjects &&
                !p.group
            )
                return false;

            if (
                filters.selectedSchools.length > 0 &&
                !filters.selectedSchools.includes(p.schoolName)
            )
                return false;

            if (
                filters.selectedCities.length > 0 &&
                !filters.selectedCities.includes(p.schoolTown)
            )
                return false;

            if (filters.teacherYearsValue) {
                const yearsActive = teacherYearsMap.get(p.teacherId) || 0;
                const target = parseInt(filters.teacherYearsValue, 10);
                const op = filters.teacherYearsOperator;

                if (op === "=" && yearsActive !== target) return false;
                if (op === ">" && yearsActive <= target) return false;
                if (op === "<" && yearsActive >= target) return false;
            }

            return true;
        });

        // Determine group key for graph lines from filters
        let groupKey: keyof Project = "category"; // Default fallback

        if (filters?.groupBy === "division") {
            groupKey = "division";
        } else if (filters?.groupBy === "project-type") {
            groupKey = "category";
        } else if (filters?.groupBy === "region") {
            groupKey = "schoolTown";
        }

        // Get sorted list of unique group names
        const uniqueGroups = Array.from(
            new Set(
                filteredProjects.map((p) => String(p[groupKey] || "Unknown")),
            ),
        ).sort();

        // Format filtered/grouped data for LineGraph component
        return uniqueGroups.map((groupName) => {
            // Isolate projects for current group
            const projectsInGroup = filteredProjects.filter(
                (p) => String(p[groupKey] || "Unknown") === groupName,
            );

            // Count projects per year within group
            const countsByYear = projectsInGroup.reduce(
                (acc, curr) => {
                    acc[curr.year] = (acc[curr.year] || 0) + 1;
                    return acc;
                },
                {} as Record<number, number>,
            );

            const dataPoints = Object.entries(countsByYear)
                .map(([year, count]) => ({
                    year: Number(year),
                    value: count,
                }))
                .sort((a, b) => a.year - b.year);

            return {
                label: groupName,
                data: dataPoints,
            };
        });
    }, [allProjects, filters]);

    // Data for GraphFilters dropdowns
    const schools = Array.from(
        new Set(allProjects.map((p) => p.schoolName)),
    ).sort();
    const cities = Array.from(
        new Set(allProjects.map((p) => p.schoolTown)),
    ).sort();

    return (
        <div className="flex min-h-screen flex-row">
            {/* Filters sidebar */}
            <div className="flex flex-col border p-8 bg-gray-50 w-1/4 min-w-[300px] h-screen overflow-y-auto sticky top-0">
                <h1 className="text-3xl font-bold mb-6">Line Graph</h1>
                <GraphFilters
                    schools={schools}
                    cities={cities}
                    onFiltersChange={setFilters}
                />
            </div>

            {/* Main content area */}
            <div className="flex-1 flex justify-center items-start pt-10 overflow-x-auto">
                {loading ? (
                    <p className="text-xl text-gray-500 mt-20">
                        Loading project data...
                    </p>
                ) : (
                    <LineGraph
                        datasets={graphDatasets}
                        yAxisLabel={
                            measuredAsLabels[
                                filters?.measuredAs || "total-count"
                            ]
                        }
                        groupByLabel={
                            groupByLabels[filters?.groupBy || "region"]
                        }
                    />
                )}
            </div>
        </div>
    );
}
