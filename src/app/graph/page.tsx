/***************************************************************
 *
 *                graphs/page.tsx
 *
 *         Author: Jack, Anne, Elki, Zander, Chiara, and Steven
 *           Date: 1/30/2026
 *
 *         Summary: display bar/line graph of project data with toggle
 *
 **************************************************************/
"use client";

import {
    CalendarDays,
    ChartColumn,
    ChevronDown,
    LineChart,
    Link,
    Share,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import BarGraph, { type BarDataset } from "@/components/BarGraph";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import GraphFilters, {
    type Filters,
} from "@/components/GraphFilters/GraphFilters";
import LineGraph from "@/components/LineGraph";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    useQueryState,
    parseAsInteger,
    parseAsString,
    parseAsArrayOf,
} from "nuqs";
import { downloadGraph } from "@/lib/export-to-pdf";

type Project = {
    id: number;
    title: string;
    division: string;
    category: string;
    year: number;
    teamProject: boolean;
    schoolId: number;
    schoolName: string;
    schoolTown: string;
    teacherId: number;
    teacherName: string;
    teacherEmail: string;
    numStudents: number;
};

const defaultFilters: Filters = {
    individualProjects: true,
    groupProjects: true,
    selectedSchools: [],
    selectedCities: [],
    selectedProjectTypes: [],
    teacherYearsValue: "",
    teacherYearsOperator: "=",
    teacherYearsValue2: undefined,
    groupBy: "none",
    measuredAs: "total-school-count",
};

// possible values for measured as filter
const measuredAsLabels: Record<string, string> = {
    "total-school-count": "Total School Count",
    "total-student-count": "Total Student Count",
    "total-city-count": "Total City Count",
    "total-project-count": "Total Project Count",
    "total-teacher-count": "Total Teacher Count",
    "school-return-rate": "School Return Rate",
};

// possible values for group by filter
const groupByLabels: Record<string, string> = {
    "none": "None",
    "region": "Region",
    "school-type": "School Type",
    "division": "Division",
    "implementation-type": "Implementation Type",
    "project-type": "Project Type",
};

export default function GraphsPage() {
    const [allProjects, setAllProjects] = useState<Project[]>([]);
    const [gatewayCities, setGatewayCities] = useState<string[]>([]);

    // Setting hooks
    const [timePeriod, setTimePeriod] = useQueryState(
        "period",
        parseAsString.withDefault("custom"),
    );
    const [startYear, setStartYear] = useQueryState(
        "startYear",
        parseAsInteger.withDefault(2020),
    );
    const [endYear, setEndYear] = useQueryState(
        "endYear",
        parseAsInteger.withDefault(2025),
    );
    const yearRange = useMemo(
        () => ({
            start: startYear,
            end: endYear,
        }),
        [startYear, endYear],
    );
    const [tempYearRange, setTempYearRange] = useState({
        start: startYear,
        end: endYear,
    });
    const [yearRangeOpen, setYearRangeOpen] = useState(false);

    const [chartType, setChartType] = useQueryState(
        "type",
        parseAsString.withDefault("line"),
    );

    // Filter hooks
    const [groupBy, setGroupBy] = useQueryState(
        "groupBy",
        parseAsString.withDefault("none"),
    );
    const [measuredAs, setMeasuredAs] = useQueryState(
        "measuredAs",
        parseAsString.withDefault("total-school-count"),
    );
    const [selectedSchools, setSelectedSchools] = useQueryState(
        "schools",
        parseAsArrayOf(parseAsString).withDefault([]),
    );
    const [selectedCities, setSelectedCities] = useQueryState(
        "cities",
        parseAsArrayOf(parseAsString).withDefault([]),
    );
    const [selectedProjectTypes, setSelectedProjectTypes] = useQueryState(
        "projectTypes",
        parseAsArrayOf(parseAsString).withDefault([]),
    );
    const [teacherYearsValue, setTeacherYearsValue] = useQueryState(
        "teacherYearsValue",
        parseAsString.withDefault(""),
    );
    const [teacherYearsOperator, setTeacherYearsOperator] = useQueryState(
        "teacherYearsOperator",
        parseAsString.withDefault("="),
    );
    const [teacherYearsValue2, setTeacherYearsValue2] = useQueryState(
        "teacherYearsValue2",
        parseAsString.withDefault(""),
    );

    const filters: Filters = useMemo(
        () => ({
            individualProjects: true,
            groupProjects: true,
            selectedSchools,
            selectedCities,
            selectedProjectTypes,
            teacherYearsValue,
            teacherYearsOperator: teacherYearsOperator as
                | "="
                | ">"
                | "<"
                | "between",
            teacherYearsValue2: teacherYearsValue2 || undefined,
            groupBy: groupBy as any,
            measuredAs: measuredAs as any,
        }),
        [
            selectedSchools,
            selectedCities,
            selectedProjectTypes,
            teacherYearsValue,
            teacherYearsOperator,
            teacherYearsValue2,
            groupBy,
            measuredAs,
        ],
    );
    const svgRef = useRef<SVGSVGElement | null>(null);

    // Fetch all project data
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await fetch("/api/projects");
                if (!response.ok) throw new Error("Failed to fetch");
                const data = await response.json();
                setAllProjects(data);
            } catch {
                toast.error(
                    "Failed to load project data. Please refresh the page.",
                );
            }
        };
        fetchProjects();
    }, []);

    // Fetch gateway cities
    useEffect(() => {
        const fetchGatewayCities = async () => {
            try {
                const response = await fetch("/api/gateway-cities");
                if (!response.ok) throw new Error("Failed to fetch");
                const data = await response.json();
                setGatewayCities(data);
            } catch {
                // Silently fail - gateway cities are optional
                setGatewayCities([]);
            }
        };
        fetchGatewayCities();
    }, []);

    // Sync tempYearRange with yearRange only when popover opens in custom mode
    useEffect(() => {
        if (yearRangeOpen && timePeriod === "custom") {
            setTempYearRange(yearRange);
        }
    }, [yearRangeOpen, timePeriod, yearRange]);

    // Could break when loggin in using liveshare? (network url issue w/ "npm run dev")
    const copyURLtoClipboard = async () => {
        try {
            const url = window.location.href;
            await navigator.clipboard.writeText(url);
            toast.success("URL copied to clipboard!");
        } catch (error) {
            console.log(error);
        }
    };

    // Calculate the current year range based on time period selection
    useMemo(() => {
        if (timePeriod === "custom") {
            return;
        }

        const allYears = allProjects.map((p) => p.year);
        const maxYear = Math.max(...allYears, new Date().getFullYear()) - 1;

        if (timePeriod === "3y") {
            //return { start: maxYear - 2, end: maxYear };
            setStartYear(maxYear - 2);
            setEndYear(maxYear);
            return;
        } else if (timePeriod === "5y") {
            //return { start: maxYear - 4, end: maxYear };
            setStartYear(maxYear - 4);
            setEndYear(maxYear);
            return;
        }

        // "all" - use full range
        const minYear = Math.min(...allYears);
        setStartYear(minYear);
        setEndYear(maxYear);
    }, [timePeriod, allProjects]);

    // Memoize graph dataset calculation to run only when data or filters change
    const graphDataset: BarDataset[] = useMemo(() => {
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

        // Filter projects based on the active filters
        const filteredProjects = allProjects.filter((p) => {
            if (!filters) return true;

            // Year range filter
            if (p.year < yearRange.start || p.year > yearRange.end) {
                return false;
            }

            // Individual vs Group Projects
            if (
                filters.individualProjects &&
                !filters.groupProjects &&
                p.teamProject
            )
                return false;
            if (
                filters.groupProjects &&
                !filters.individualProjects &&
                !p.teamProject
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

            // Selected Project Types
            if (
                filters.selectedProjectTypes.length > 0 &&
                !filters.selectedProjectTypes.includes(p.category)
            )
                return false;

            // Teacher Years Participation
            if (filters.teacherYearsValue) {
                const yearsActive = teacherYearsMap.get(p.teacherId) || 0;
                const op = filters.teacherYearsOperator;

                if (op === "=") {
                    const target = parseInt(filters.teacherYearsValue, 10);
                    if (yearsActive !== target) return false;
                } else if (op === ">") {
                    const target = parseInt(filters.teacherYearsValue, 10);
                    if (yearsActive <= target) return false;
                } else if (op === "<") {
                    const target = parseInt(filters.teacherYearsValue, 10);
                    if (yearsActive >= target) return false;
                } else if (op === "between" && filters.teacherYearsValue2) {
                    const min = parseInt(filters.teacherYearsValue, 10);
                    const max = parseInt(filters.teacherYearsValue2, 10);
                    if (yearsActive < min || yearsActive > max) return false;
                }
            }

            return true;
        });

        // Determine the key to group data by for different lines on the graph
        let groupKey: keyof Project | null = null;

        // set groupKey based on filter selection
        if (filters?.groupBy === "none") {
            setGroupBy("none");
            groupKey = null; // No grouping
        } else if (filters?.groupBy === "division") {
            setGroupBy("division");
            groupKey = "division";
        } else if (filters?.groupBy === "project-type") {
            setGroupBy("project-type");
            groupKey = "category";
        } else if (filters?.groupBy === "region") {
            setGroupBy("region");
            // TO DO: Add proper 'region' field to Project type and database. Currently using schoolTown (city) as a temporary substitute
            groupKey = "schoolTown";
        } else if (filters?.groupBy === "school-type") {
            setGroupBy("school-type");
            // TO DO: Add 'schoolType' field to Project type and database, then map it here
            groupKey = "category"; // Temporary fallback
        } else if (filters?.groupBy === "implementation-type") {
            setGroupBy("implementation-type");
            // TO DO: Add 'implementationType' field to Project type and database, then map it here
            groupKey = "category"; // Temporary fallback
        }

        // Get a sorted list of unique group names
        // If groupKey is null (none grouping), use a single "All" group
        const uniqueGroups =
            groupKey === null
                ? ["All"]
                : Array.from(
                      new Set(
                          filteredProjects.map((p) =>
                              String(p[groupKey] || "Unknown"),
                          ),
                      ),
                  ).sort();

        // added to handle measured by filter!
        function computeMetric(projects: Project[], metric: string) {
            switch (metric) {
                case "total-project-count":
                    return projects.length;

                case "total-student-count":
                    return projects.reduce(
                        (sum, p) => sum + (p.numStudents || 0),
                        0,
                    );

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

        // Format the filtered and grouped data for the graph components
        return uniqueGroups.map((groupName) => {
            // Isolate projects belonging to the current group
            // If groupKey is null (none grouping), include all filtered projects
            const projectsInGroup =
                groupKey === null
                    ? filteredProjects
                    : filteredProjects.filter(
                          (p) => String(p[groupKey] || "Unknown") === groupName,
                      );

            const projectsByYear: Record<number, Project[]> = {};

            projectsInGroup.forEach((p) => {
                if (!projectsByYear[p.year]) projectsByYear[p.year] = [];
                projectsByYear[p.year].push(p);
            });

            setMeasuredAs(filters?.measuredAs || "total-school-count");
            const metric = filters?.measuredAs || "total-school-count";

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
    }, [
        allProjects,
        selectedSchools,
        selectedCities,
        selectedProjectTypes,
        teacherYearsValue,
        teacherYearsOperator,
        teacherYearsValue2,
        groupBy,
        measuredAs,
        yearRange,
    ]);

    // Calculate filtered count (based on selected 'measured by' category)
    const filteredProjectCount = useMemo(() => {
        return graphDataset.reduce((total, dataset) => {
            return (
                total + dataset.data.reduce((sum, point) => sum + point.y, 0)
            );
        }, 0);
    }, [graphDataset]);

    // Data for filter dropdowns
    const schools = Array.from(
        new Set(allProjects.map((p) => p.schoolName)),
    ).sort();
    const cities = Array.from(
        new Set(allProjects.map((p) => p.schoolTown)),
    ).sort();
    const projectTypes = Array.from(
        new Set(allProjects.map((p) => p.category)),
    ).sort();

    return (
        <div className="w-full min-h-screen flex bg-background">
            {/* Left Sidebar - Filter Panel */}
            <div className="flex flex-col border-r border-border p-8 bg-card w-70 h-screen overflow-y-auto sticky top-0 gap-12">
                <Breadcrumbs />
                <GraphFilters
                    schools={schools}
                    cities={cities}
                    projectTypes={projectTypes}
                    gatewayCities={gatewayCities}
                    filters={filters}
                    onFiltersChange={(newFilters) => {
                        setSelectedSchools(newFilters.selectedSchools);
                        setSelectedCities(newFilters.selectedCities);
                        setSelectedProjectTypes(
                            newFilters.selectedProjectTypes,
                        );
                        setGroupBy(newFilters.groupBy);
                        setMeasuredAs(newFilters.measuredAs);
                        setTeacherYearsValue(newFilters.teacherYearsValue);
                        setTeacherYearsOperator(
                            newFilters.teacherYearsOperator,
                        );
                        setTeacherYearsValue2(
                            newFilters.teacherYearsValue2 ?? "",
                        );
                    }}
                />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {allProjects.length > 0 ? (
                    <div className="flex flex-col gap-4 h-full overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between px-8 pt-4 shrink-0">
                            <h1 className="text-xl font-semibold text-foreground">
                                Projects by {groupByLabels[filters.groupBy]}
                            </h1>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-2"
                                    onClick={() => downloadGraph(svgRef)}
                                >
                                    <Share className="w-4 h-4" />
                                    Export
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-2"
                                    onClick={copyURLtoClipboard}
                                >
                                    <Link className="w-4 h-4" />
                                    Share
                                </Button>
                            </div>
                        </div>

                        {/* Chart Controls */}
                        <div className="flex items-center justify-between px-8 py-3 shrink-0">
                            <div className="flex items-center">
                                <Tabs
                                    value={chartType}
                                    onValueChange={(value) =>
                                        setChartType(value as "line" | "bar")
                                    }
                                >
                                    <TabsList>
                                        <TabsTrigger
                                            value="line"
                                            className="gap-2"
                                        >
                                            <LineChart className="w-4 h-4" />
                                            Line
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="bar"
                                            className="gap-2"
                                        >
                                            <ChartColumn className="w-4 h-4" />
                                            Bar
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>

                            <div className="flex items-center">
                                <Button
                                    type="button"
                                    variant={
                                        timePeriod === "3y"
                                            ? "default"
                                            : "outline"
                                    }
                                    size="sm"
                                    onClick={() => setTimePeriod("3y")}
                                    className="rounded-l-md rounded-r-none border-r-0"
                                >
                                    3y
                                </Button>
                                <Button
                                    type="button"
                                    variant={
                                        timePeriod === "5y"
                                            ? "default"
                                            : "outline"
                                    }
                                    size="sm"
                                    onClick={() => setTimePeriod("5y")}
                                    className="rounded-none border-l-0 border-r-0 -ml-px"
                                >
                                    5y
                                </Button>
                                <Popover
                                    open={yearRangeOpen}
                                    onOpenChange={setYearRangeOpen}
                                >
                                    <PopoverTrigger asChild>
                                        <Button
                                            type="button"
                                            variant={
                                                timePeriod === "custom"
                                                    ? "default"
                                                    : "outline"
                                            }
                                            size="sm"
                                            onClick={() => {
                                                if (timePeriod !== "custom") {
                                                    setTimePeriod("custom");
                                                }
                                            }}
                                            className="rounded-r-md rounded-l-none border-l-0 -ml-px flex items-center gap-2"
                                        >
                                            <CalendarDays />
                                            {yearRange.start} - {yearRange.end}
                                            <ChevronDown />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80">
                                        <div className="space-y-4">
                                            <h4 className="font-semibold text-sm">
                                                Select Year Range
                                            </h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-xs text-muted-foreground mb-1 block">
                                                        Start Year
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={
                                                            tempYearRange.start
                                                        }
                                                        onChange={(e) =>
                                                            setTempYearRange({
                                                                ...tempYearRange,
                                                                start:
                                                                    parseInt(
                                                                        e.target
                                                                            .value,
                                                                    ) || 2020,
                                                            })
                                                        }
                                                        className="w-full px-3 py-2 border border-input rounded-md text-sm"
                                                        min="2000"
                                                        max={tempYearRange.end}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-muted-foreground mb-1 block">
                                                        End Year
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={
                                                            tempYearRange.end
                                                        }
                                                        onChange={(e) =>
                                                            setTempYearRange({
                                                                ...tempYearRange,
                                                                end:
                                                                    parseInt(
                                                                        e.target
                                                                            .value,
                                                                    ) || 2025,
                                                            })
                                                        }
                                                        className="w-full px-3 py-2 border border-input rounded-md text-sm"
                                                        min={
                                                            tempYearRange.start
                                                        }
                                                        max="2100"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex gap-2 justify-end">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        setYearRangeOpen(false)
                                                    }
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() => {
                                                        setStartYear(
                                                            tempYearRange.start,
                                                        );
                                                        setEndYear(
                                                            tempYearRange.end,
                                                        );
                                                        setTimePeriod("custom");
                                                        setYearRangeOpen(false);
                                                    }}
                                                >
                                                    Apply
                                                </Button>
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        {/* Chart Area */}

                        {Math.round(filteredProjectCount) != 0 ? (
                            <div className="flex-1 flex items-center justify-center px-8 bg-background overflow-auto">
                                {chartType === "bar" ? (
                                    <BarGraph
                                        dataset={graphDataset}
                                        yAxisLabel={
                                            measuredAsLabels[filters.measuredAs]
                                        }
                                        xAxisLabel="Year"
                                        legendTitle={
                                            filters.groupBy === "none"
                                                ? undefined
                                                : groupByLabels[filters.groupBy]
                                        }
                                        svgRefCopy={svgRef}
                                    />
                                ) : (
                                    <LineGraph
                                        datasets={graphDataset}
                                        yAxisLabel={
                                            measuredAsLabels[filters.measuredAs]
                                        }
                                        xAxisLabel="Year"
                                        legendTitle={
                                            filters.groupBy === "none"
                                                ? undefined
                                                : groupByLabels[filters.groupBy]
                                        }
                                        svgRefCopy={svgRef}
                                    />
                                )}
                            </div>
                        ) : (
                            /* If no data is found that fits the filters, display this */
                            <div className="flex-1 flex items-center justify-center px-8 bg-background overflow-auto">
                                No Data Found
                            </div>
                        )}

                        {/* Footer */}
                        <div className="flex flex-col justify-center items-end gap-3 px-8 pb-4 text-xs text-foreground shrink-0">
                            <p className="font-medium">
                                <span className="font-mono bg-gray/4 border rounded-sm border-gray/2 py-1 px-2">
                                    {Math.round(filteredProjectCount)}
                                </span>{" "}
                                data rows total
                            </p>
                            {/* TO DO: get most recent date from db but requires storing date */}
                            <p>
                                <span className="font-mono bg-gray/4 border rounded-sm border-gray/2 py-1 px-2">
                                    06/25/2025
                                </span>{" "}
                                data last updated
                            </p>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
