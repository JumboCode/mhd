/***************************************************************
 *
 *                new_bargraph/page.tsx
 *
 *         Author: Elki Laranas and Zander Barba
 *         Edited by: Chiara and Steven
 *         Date: 12/6/2025
 *
 *        Summary: display bar graph of project data
 *
 **************************************************************/
"use client";

import { useState, useEffect, useMemo } from "react";
import BarGraph, { BarDataset } from "@/components/NewBargraph";
import FilterPanel, { Filters } from "@/components/NewFilterPanel";

import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { TrendingUp } from "lucide-react";

type FilterPanelProps = {
    schools: string[];
    cities: string[];
    filters: Filters;
    onFiltersChange: (filters: Filters) => void;
};

// define Project type
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
    studentCount: number;
};

// define default filters type
const defaultFilters: Filters = {
    individualProjects: true,
    groupProjects: true,
    gatewayCities: false,
    selectedSchools: [],
    selectedCities: [],
    teacherYearsValue: "",
    teacherYearsOperator: "=",
    groupBy: "region",
    measuredAs: "total-count",
};

// possible values for measured as filter
const measuredAsLabels: Record<string, string> = {
    "total-count": "Total Count",
    "total-student-count": "Total Student Count",
    "total-city-count": "Total City Count",
    "total-project-count": "Total Project Count",
    "total-teacher-count": "Total Teacher Count",
    "school-return-rate": "School Return Rate",
};

// possible values for group by filter
const groupByLabels: Record<string, string> = {
    "region": "Region",
    "school-type": "School Type",
    "division": "Division",
    "implementation-type": "Implementation Type",
    "project-type": "Project Type",
};

export default function BarGraphPage() {
    const [allProjects, setAllProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<Filters>(defaultFilters);

    // Fetch all project data
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await fetch("/api/bargraph_projects");
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

    // Memoize graph dataset calculation to run only when data or filters change
    const barDataset: BarDataset[] = useMemo(() => {
        if (!allProjects.length) return [];

        // Pre-calculate teacher participation years if filter is active
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

        // Filter projects based on the active filters from the FilterPanel
        const filteredProjects = allProjects.filter((p) => {
            if (!filters) return true;

            // Individual vs Group Projects
            if (filters.individualProjects && !filters.groupProjects && p.group)
                return false;
            if (
                filters.groupProjects &&
                !filters.individualProjects &&
                !p.group
            )
                return false;

            // Selected Schools
            if (
                filters.selectedSchools.length > 0 &&
                !filters.selectedSchools.includes(p.schoolName)
            )
                return false;

            // Selected Cities
            if (
                filters.selectedCities.length > 0 &&
                !filters.selectedCities.includes(p.schoolTown)
            )
                return false;

            // Teacher Years Participation
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

        // Determine the key to group data by for different lines on the graph
        let groupKey: keyof Project = "category"; // Default fallback

        // set groupKey based on filter selection
        if (filters?.groupBy === "division") {
            groupKey = "division";
        } else if (filters?.groupBy === "project-type") {
            groupKey = "category";
        } else if (filters?.groupBy === "region") {
            groupKey = "schoolTown";
        }

        // Get a sorted list of unique group names (e.g., all categories or all towns)
        const uniqueGroups = Array.from(
            new Set(
                filteredProjects.map((p) => String(p[groupKey] || "Unknown")),
            ),
        ).sort();

        // added to handle measured by filter!
        function computeMetric(projects: Project[], metric: string) {
            switch (metric) {
                case "total-count":

                // case "total-student-count":
                //     return projects.reduce((sum, p) => sum + (p.studentCount ?? 0), 0);

                case "total-project-count":
                    return projects.length;

                case "total-teacher-count":
                    return new Set(projects.map((p) => p.teacherId)).size;

                case "total-city-count":
                    return new Set(projects.map((p) => p.schoolTown)).size;

                case "school-return-rate": {
                    // schools that have projects in this year for this group
                    const schoolsThisYear = new Set(
                        projects.map((p) => p.schoolId),
                    );
                    const year = projects[0].year;

                    // all earlier participation by these same schools
                    const priorParticipation = allProjects.filter(
                        (x) => schoolsThisYear.has(x.schoolId) && x.year < year,
                    );

                    const returningSchools = new Set(
                        priorParticipation.map((p) => p.schoolId),
                    );

                    return returningSchools.size / schoolsThisYear.size || 0;
                }

                default:
                    return projects.length;
            }
        }

        // Format the filtered and grouped data for the LineGraph component
        return uniqueGroups.map((groupName) => {
            // Isolate projects belonging to the current group
            const projectsInGroup = filteredProjects.filter(
                (p) => String(p[groupKey] || "Unknown") === groupName,
            );

            // Count the number of projects per year within this group
            // const countsByYear = projectsInGroup.reduce(
            //     (acc, curr) => {
            //         acc[curr.year] = (acc[curr.year] || 0) + 1;
            //         return acc;
            //     },
            //     {} as Record<number, number>,
            // );

            const uniqueGroups = Array.from(
                new Set(
                    filteredProjects.map((p) =>
                        String(p[groupKey] || "Unknown"),
                    ),
                ),
            );

            const projectsByYear: Record<number, Project[]> = {};

            projectsInGroup.forEach((p) => {
                if (!projectsByYear[p.year]) projectsByYear[p.year] = [];
                projectsByYear[p.year].push(p);
            });

            const metric = filters?.measuredAs || "total-count";

            const dataPoints = Object.entries(projectsByYear)
                .map(([year, projs]) => ({
                    x: Number(year),
                    y: computeMetric(projs, metric),
                }))
                .sort((a, b) => a.x - b.x);

            return {
                label: groupName,
                data: dataPoints,
            };
        });
    }, [allProjects, filters]);

    // Data for FilterPanel Dropdowns
    const schools = Array.from(
        new Set(allProjects.map((p) => p.schoolName)),
    ).sort();
    const cities = Array.from(
        new Set(allProjects.map((p) => p.schoolTown)),
    ).sort();

    return (
        <div className="flex min-h-screen flex-row">
            <div className="flex flex-col border p-8 bg-gray-50 w-1/4 min-w-[300px] h-screen overflow-y-auto sticky top-0">
                <h1 className="text-3xl font-bold mb-6">Bar Graph</h1>
                <FilterPanel
                    schools={schools}
                    cities={cities}
                    onFiltersChange={setFilters}
                />
            </div>

            <div className="flex-1 flex justify-center items-start pt-10 overflow-x-auto">
                {loading ? (
                    <p className="text-xl text-gray-500 mt-20">
                        Loading project data...
                    </p>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>Bar Graph</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <BarGraph
                                dataset={barDataset}
                                yAxisLabel={
                                    measuredAsLabels[filters.measuredAs]
                                }
                                xAxisLabel={groupByLabels[filters.groupBy]}
                            />
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
