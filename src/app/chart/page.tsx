/***************************************************************
 *
 *                chart/page.tsx
 *
 *         Author: Jack, Anne, Elki, Zander, Chiara, and Steven
 *           Date: 1/30/2026
 *
 *         Summary: display bar/line chart of project data with toggle
 *
 **************************************************************/
"use client";

import {
    CalendarDays,
    ChartColumn,
    ChevronDown,
    LineChart,
    Link,
    PlusCircle,
    Share,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import BarGraph from "@/components/BarGraph";
import { type ChartDataset } from "@/components/chartTypes";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import GraphFilters, {
    type Filters,
    type GroupBy,
    type MeasuredAs,
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
    parseAsBoolean,
} from "nuqs";
import { addToCart, downloadSingleGraph } from "@/lib/export-to-pdf";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Cart } from "@/components/Cart";
import { Kbd } from "@/components/ui/kbd";
import { useHotkey } from "@/hooks/useHotkey";

type Project = {
    id: number;
    title: string;
    division: string;
    category: string;
    gatewaySchool: string;
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

// possible values for measured as filter
const measuredAsLabels: Record<string, string> = {
    "total-school-count": "Total Schools",
    "total-student-count": "Total Students",
    "total-city-count": "Total Cities",
    "total-project-count": "Total Projects",
    "total-teacher-count": "Total Teachers",
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
    "gateway-school": "Gateway School",
};

// Helper function for generating dynamic titles
const generateChartTitle = (
    chartType: string,
    measuredAs: string,
    groupBy: string,
    yearStart: number,
    yearEnd: number,
    activeFilters: {
        schools: number;
        cities: number;
        projectTypes: number;
        hasTeacherYearsFilter: boolean;
    },
): string => {
    // Chart type
    const chartTypeLabel = chartType === "bar" ? "Bar Chart" : "Line Chart";

    // Measured as label
    const measuredAsLabel = measuredAsLabels[measuredAs] || "Unknown Metric";

    // Group by label
    const groupByLabel = groupByLabels[groupBy] || "None";

    // Date range
    const dateRange =
        yearStart === yearEnd ? `${yearStart}` : `${yearStart}-${yearEnd}`;

    // Build main title
    let mainTitle = `${chartTypeLabel} - ${measuredAsLabel}`;

    // Add group by if not "None"
    if (groupBy !== "none") {
        mainTitle += ` by ${groupByLabel}`;
    }

    // Add date range
    mainTitle += ` (${dateRange})`;

    // Build filter details
    const filterDetails: string[] = [];

    if (activeFilters.schools > 0) {
        filterDetails.push(
            `${activeFilters.schools} school${activeFilters.schools > 1 ? "s" : ""}`,
        );
    }
    if (activeFilters.cities > 0) {
        filterDetails.push(
            `${activeFilters.cities} cit${activeFilters.cities > 1 ? "ies" : "y"}`,
        );
    }
    if (activeFilters.projectTypes > 0) {
        filterDetails.push(
            `${activeFilters.projectTypes} project type${activeFilters.projectTypes > 1 ? "s" : ""}`,
        );
    }
    if (activeFilters.hasTeacherYearsFilter) {
        filterDetails.push("teacher filter applied");
    }

    // Add filter details if any filters are active
    if (filterDetails.length > 0) {
        mainTitle += ` • Filtered: ${filterDetails.join(", ")}`;
    }

    return mainTitle;
};

export default function ChartPage() {
    const [allProjects, setAllProjects] = useState<Project[]>([]);
    const [gatewaySchools, setGatewaySchools] = useState<string[]>([]);

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
        parseAsString.withDefault("bar"),
    );
    const slideDirection = useRef(0);
    const handleChartTypeChange = useCallback(
        (value: string) => {
            slideDirection.current = value === "line" ? -1 : 1;
            setChartType(value as "bar" | "line");
        },
        [setChartType],
    );

    // Keyboard shortcuts for chart type
    useHotkey("b", () => handleChartTypeChange("bar"));
    useHotkey("l", () => handleChartTypeChange("line"));

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

    const [onlyGatewaySchools, setOnlyGatewaySchools] = useQueryState(
        "onlyGatewaySchools",
        parseAsBoolean.withDefault(false),
    );

    const [cart, setCart] = useState<string[]>([]);

    const [filterNames, setFilterNames] = useState<string[]>([]);

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
            groupBy: groupBy as GroupBy,
            onlyGatewaySchools: onlyGatewaySchools,
            measuredAs: measuredAs as MeasuredAs,
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
            onlyGatewaySchools,
        ],
    );
    const chartRef = useRef<HTMLDivElement | null>(null);

    // Fetch all project data
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await fetch("/api/projects");
                if (!response.ok) throw new Error("Failed to fetch");

                const data = await response.json();

                const updatedProjects = data.map((p: Project) => ({
                    ...p,
                    gatewaySchool: gatewaySchools.includes(p.schoolName)
                        ? "Gateway"
                        : "Non-Gateway",
                }));

                setAllProjects(updatedProjects);
            } catch {
                toast.error(
                    "Failed to load project data. Please refresh the page.",
                );
            }
        };

        fetchProjects();
    }, [gatewaySchools]);

    // Fetch gateway schools
    useEffect(() => {
        fetch("/api/schools?gateway=true&list=true")
            .then((res) => res.json())
            .then((data) => {
                const schoolNames: string[] = data.map(
                    (school: { name: string }) => school.name,
                );

                setGatewaySchools(schoolNames);
            })
            .catch(() => toast.error("Failed to load gateway schools"));
    }, []);

    /* Fetch and set cart to and from session storage to persist between refreshes */

    const filterName = `Projects by ${groupByLabels[filters.groupBy]}`;

    // Fetch all graphs from session storage on load
    useEffect(() => {
        const cartStorage = sessionStorage.getItem("cartStorage");
        const cartNameStorage = sessionStorage.getItem("cartNameStorage");

        if (cartStorage) {
            setCart(JSON.parse(cartStorage));
        }

        if (cartNameStorage) {
            setFilterNames(JSON.parse(cartNameStorage));
        }
    }, []);

    // Update cart in session storage when user changes cart
    useEffect(() => {
        if (cart.length != 0) {
            sessionStorage.setItem("cartStorage", JSON.stringify(cart));
        }
    }, [cart]);

    // Update cart names when use changes the filters
    useEffect(() => {
        if (filterNames.length != 0) {
            sessionStorage.setItem(
                "cartNameStorage",
                JSON.stringify(filterNames),
            );
        }
    }, [filterNames]);

    // Sync tempYearRange with yearRange only when popover opens in custom mode
    useEffect(() => {
        if (yearRangeOpen && timePeriod === "custom") {
            setTempYearRange(yearRange);
        }
    }, [yearRangeOpen, timePeriod, yearRange]);

    const copyURLtoClipboard = async () => {
        try {
            const url = window.location.href;
            await navigator.clipboard.writeText(url);
            toast.success("URL copied to clipboard!");
        } catch {
            toast.error("Failed to copy URL to clipboard");
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
    const graphDataset: ChartDataset[] = useMemo(() => {
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

            if (filters.onlyGatewaySchools && p.gatewaySchool !== "Gateway") {
                return false;
            }

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

        switch (filters.groupBy) {
            case "none":
                groupKey = null;
                break;
            case "division":
                groupKey = "division";
                break;
            case "project-type":
                groupKey = "category";
                break;
            case "region":
                groupKey = "schoolTown"; // temp
                break;
            case "school-type":
                groupKey = "category"; // temp
                break;
            case "implementation-type":
                groupKey = "category"; // temp
                break;
            case "gateway-school":
                groupKey = "gatewaySchool";
                break;
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
        onlyGatewaySchools,
    ]);

    // Calculate filtered count (based on selected 'measured by' category)
    const filteredProjectCount = useMemo(() => {
        return graphDataset.reduce((total, dataset) => {
            return (
                total +
                dataset.data.reduce(
                    (sum: number, point: { x: string | number; y: number }) =>
                        sum + point.y,
                    0,
                )
            );
        }, 0);
    }, [graphDataset]);

    const tooltipFormatter = useCallback(
        (d: { x: string | number; y: number }, label: string) => {
            const metric =
                measuredAsLabels[filters.measuredAs] || filters.measuredAs;
            const value =
                filters.measuredAs === "school-return-rate"
                    ? `${(d.y * 100).toFixed(1)}%`
                    : Math.round(d.y).toLocaleString();
            return filters.groupBy === "none"
                ? `${d.x}: ${value} ${metric}`
                : `${label} · ${d.x}: ${value}`;
        },
        [filters.measuredAs, filters.groupBy],
    );

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
                    gatewaySchools={gatewaySchools}
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
                        setOnlyGatewaySchools(newFilters.onlyGatewaySchools);
                    }}
                />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {allProjects.length > 0 ? (
                    <div className="flex flex-col gap-4 h-full overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between px-8 pt-4 shrink-0">
                            <div className="relative">
                                <AnimatePresence
                                    initial={false}
                                    mode="popLayout"
                                >
                                    <motion.h1
                                        key={chartType}
                                        className="text-xl font-semibold text-foreground whitespace-nowrap"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{
                                            duration: 0.15,
                                            ease: "easeOut",
                                        }}
                                    >
                                        {generateChartTitle(
                                            chartType,
                                            measuredAs,
                                            groupBy,
                                            yearRange.start,
                                            yearRange.end,
                                            {
                                                schools: selectedSchools.length,
                                                cities: selectedCities.length,
                                                projectTypes:
                                                    selectedProjectTypes.length,
                                                hasTeacherYearsFilter:
                                                    teacherYearsValue !== "",
                                            },
                                        )}
                                    </motion.h1>
                                </AnimatePresence>
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-2"
                                    onClick={() =>
                                        downloadSingleGraph(chartRef)
                                    }
                                >
                                    <Share className="w-4 h-4" />
                                    Export
                                </Button>
                                <HoverCard>
                                    <HoverCardTrigger
                                        delay={10}
                                        closeDelay={100}
                                        render={
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex items-center gap-2"
                                                onClick={() =>
                                                    addToCart(
                                                        chartRef,
                                                        cart,
                                                        setCart,
                                                        filterNames,
                                                        setFilterNames,
                                                        filterName,
                                                    )
                                                }
                                            >
                                                <PlusCircle className="w-4 h-4" />
                                                Add to
                                            </Button>
                                        }
                                    />
                                    <HoverCardContent
                                        className="flex flex-col gap-0.5 mt-2"
                                        align="end"
                                    >
                                        <Cart
                                            filterNames={filterNames}
                                            cart={cart}
                                            setCart={setCart}
                                            setFilterNames={setFilterNames}
                                        />
                                    </HoverCardContent>
                                </HoverCard>

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
                                    onValueChange={handleChartTypeChange}
                                >
                                    <TabsList>
                                        <TabsTrigger
                                            value="bar"
                                            className="gap-2"
                                        >
                                            <ChartColumn className="w-4 h-4" />
                                            Bar
                                            <Kbd>B</Kbd>
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="line"
                                            className="gap-2"
                                        >
                                            <LineChart className="w-4 h-4" />
                                            Line
                                            <Kbd>L</Kbd>
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

                        {Math.round(filteredProjectCount) !== 0 ? (
                            <div className="relative flex-1 overflow-hidden">
                                <AnimatePresence initial={false}>
                                    <motion.div
                                        key={chartType}
                                        className="flex h-full w-full items-center justify-center px-8 bg-background overflow-auto"
                                        initial={{
                                            opacity: 0,
                                            x: slideDirection.current * -50,
                                        }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{
                                            opacity: 0,
                                            x: slideDirection.current * -50,
                                            position: "absolute",
                                            inset: 0,
                                        }}
                                        transition={{
                                            duration: 0.15,
                                            ease: "easeInOut",
                                        }}
                                    >
                                        {chartType === "bar" ? (
                                            <BarGraph
                                                dataset={graphDataset}
                                                yAxisLabel={
                                                    measuredAsLabels[
                                                        filters.measuredAs
                                                    ]
                                                }
                                                xAxisLabel="Year"
                                                legendTitle={
                                                    filters.groupBy === "none"
                                                        ? undefined
                                                        : groupByLabels[
                                                              filters.groupBy
                                                          ]
                                                }
                                                chartRef={chartRef}
                                                tooltipFormatter={
                                                    tooltipFormatter
                                                }
                                            />
                                        ) : (
                                            <LineGraph
                                                datasets={graphDataset}
                                                yAxisLabel={
                                                    measuredAsLabels[
                                                        filters.measuredAs
                                                    ]
                                                }
                                                xAxisLabel="Year"
                                                legendTitle={
                                                    filters.groupBy === "none"
                                                        ? undefined
                                                        : groupByLabels[
                                                              filters.groupBy
                                                          ]
                                                }
                                                chartRef={chartRef}
                                                tooltipFormatter={
                                                    tooltipFormatter
                                                }
                                            />
                                        )}
                                    </motion.div>
                                </AnimatePresence>
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
