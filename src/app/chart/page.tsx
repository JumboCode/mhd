/***************************************************************
 *
 *                chart/page.tsx
 *
 *         Author: Jack, Anne, Elki, Zander, Chiara, and Steven
 *           Date: 1/30/2026
 *         Modified 3/24/26
 *
 *         Summary: display bar/line chart of project data with toggle
 *
 **************************************************************/
"use client";

import {
    CalendarDays,
    ChartColumn,
    Check,
    CheckCircle2,
    ChevronDown,
    LineChart,
    Link,
    Loader2,
    PlusCircle,
    Share,
    ShoppingBasket,
    SlidersHorizontal,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { LoadError } from "@/components/ui/load-error";
import BarGraph from "@/components/charts/BarGraph";
import { type ChartDataset } from "@/components/charts/chartTypes";
import GraphFilters, {
    type Filters,
    type GroupBy,
    type MeasuredAs,
} from "@/components/GraphFilters/GraphFilters";
import LineGraph from "@/components/charts/LineGraph";
import { Button } from "@/components/ui/button";
import { AnimatedToggleButton } from "@/components/ui/animated-toggle-button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    useQueryState,
    parseAsInteger,
    parseAsString,
    parseAsArrayOf,
    parseAsBoolean,
} from "nuqs";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { downloadSingleGraph } from "@/lib/export-to-pdf";
import { useCart } from "@/hooks/useCart";
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
    standardizedSchoolName: string;
    schoolTown: string;
    schoolRegion: string;
    teacherId: number;
    teacherName: string;
    teacherEmail: string;
    numStudents: number;
    schoolDivisions: string[] | null;
    schoolImplementationModel: string | null;
    schoolSchoolType: string | null;
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
    "implementation-model": "Implementation Model",
    "project-type": "Project Type",
    "gateway-school": "Schools Representing Gateway Cities",
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
        onlyGatewaySchools: boolean;
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

    let gateway = "";

    if (measuredAs === "total-school-count") {
        gateway = " Representing Gateway Cities";
    } else {
        gateway = "for Schools Representing Gateway Cities";
    }

    // Build main title
    let mainTitle = `${chartTypeLabel} - ${measuredAsLabel} ${activeFilters.onlyGatewaySchools ? gateway : ""}`;

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
    const [isExporting, setIsExporting] = useState(false);
    const [exportDialogOpen, setExportDialogOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [projectDataError, setProjectDataError] = useState<string | null>(
        null,
    );

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

    useEffect(() => {
        document.title = `${chartType === "bar" ? "Bar Chart" : "Line Chart"} | MHD`;
    }, [chartType]);

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

    const { items, addChartItem, hasItem, removeByName } = useCart();

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
    const fetchProjects = useCallback(async () => {
        setIsLoaded(false);
        setProjectDataError(null);
        try {
            const response = await fetch("/api/projects");
            if (!response.ok) throw new Error("Failed to load project data");

            const data = await response.json();

            const updatedProjects = data.map((p: Project) => ({
                ...p,
                gatewaySchool: gatewaySchools.includes(p.schoolName)
                    ? "Gateway"
                    : "Non-Gateway",
            }));

            setAllProjects(updatedProjects);
            setProjectDataError(null);
        } catch (error) {
            setProjectDataError(
                error instanceof Error
                    ? error.message
                    : "Failed to load project data",
            );
        } finally {
            setIsLoaded(true);
        }
    }, [gatewaySchools]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    // Fetch gateway schools
    useEffect(() => {
        fetch("/api/schools?gateway=true&list=true")
            .then((res) => res.json())
            .then((data) => {
                const schoolNames: string[] = data.map(
                    (school: { name: string }) => school.name,
                );

                setGatewaySchools(schoolNames);
            });
    }, []);

    const filterName = generateChartTitle(
        chartType,
        measuredAs,
        groupBy,
        yearRange.start,
        yearRange.end,
        {
            schools: selectedSchools.length,
            cities: selectedCities.length,
            projectTypes: selectedProjectTypes.length,
            hasTeacherYearsFilter: teacherYearsValue !== "",
            onlyGatewaySchools: onlyGatewaySchools,
        },
    );

    const chartInCart = hasItem(filterName);

    // Cmd+S to open export dialog, Cmd+P to print PDF
    useHotkey(
        "s",
        () => {
            if (!exportDialogOpen) setExportDialogOpen(true);
        },
        { meta: true },
    );
    useHotkey(
        "p",
        () => {
            downloadSingleGraph(chartRef, filterName, true);
        },
        { meta: true },
    );

    // Sync tempYearRange with yearRange only when popover opens in custom mode
    useEffect(() => {
        if (yearRangeOpen && timePeriod === "custom") {
            setTempYearRange(yearRange);
        }
    }, [yearRangeOpen, timePeriod, yearRange]);

    const copyURLtoClipboard = async () => {
        const url = window.location.href;
        await navigator.clipboard.writeText(url);
    };

    // Calculate the current year range based on time period selection
    useMemo(() => {
        if (timePeriod === "custom" || allProjects.length === 0) {
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

        function computeMetric(projects: Project[], metric: string) {
            switch (metric) {
                case "total-school-count":
                    return new Set(projects.map((p) => p.schoolId)).size;

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
                    const schoolsThisYear = new Set(
                        projects.map((p) => p.schoolId),
                    );
                    const year = projects[0].year;
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

        function buildDatasets(
            groups: string[],
            getProjectsInGroup: (groupName: string) => Project[],
        ) {
            const metric = filters?.measuredAs || "total-school-count";
            setMeasuredAs(metric as MeasuredAs);
            return groups.map((groupName) => {
                const projectsInGroup = getProjectsInGroup(groupName);
                const projectsByYear: Record<number, Project[]> = {};
                projectsInGroup.forEach((p) => {
                    if (!projectsByYear[p.year]) projectsByYear[p.year] = [];
                    projectsByYear[p.year].push(p);
                });
                const dataPoints = Object.entries(projectsByYear)
                    .map(([year, projs]) => ({
                        x: Number(year),
                        y: computeMetric(projs, metric),
                    }))
                    .sort((a, b) => a.x - b.x);
                return { label: groupName, data: dataPoints };
            });
        }

        // Division groupby: school-level array field, one project can belong to multiple groups
        if (filters.groupBy === "division") {
            const normalizeDivision = (d: string): string => {
                const lower = d.toLowerCase();
                if (lower.startsWith("junior")) return "Junior";
                if (lower.startsWith("senior")) return "Senior";
                if (lower.startsWith("young")) return "Young Historian";
                return d;
            };

            const allDivisionGroups = new Set<string>();
            filteredProjects.forEach((p) => {
                const divs = p.schoolDivisions;
                if (!divs || divs.length === 0) {
                    allDivisionGroups.add("Unassigned");
                } else {
                    divs.forEach((d) =>
                        allDivisionGroups.add(normalizeDivision(d)),
                    );
                }
            });

            const divisionGroups = Array.from(allDivisionGroups).sort((a, b) =>
                a === "Unassigned"
                    ? 1
                    : b === "Unassigned"
                      ? -1
                      : a.localeCompare(b),
            );

            return buildDatasets(divisionGroups, (groupName) =>
                filteredProjects.filter((p) => {
                    const divs = p.schoolDivisions;
                    if (groupName === "Unassigned")
                        return !divs || divs.length === 0;
                    return (
                        divs?.some((d) => normalizeDivision(d) === groupName) ??
                        false
                    );
                }),
            );
        }

        // Determine the key to group data by for all other groupBys
        let groupKey: keyof Project | null = null;

        switch (filters.groupBy) {
            case "none":
                groupKey = null;
                break;
            case "project-type":
                groupKey = "category";
                break;
            case "region":
                groupKey = "schoolRegion";
                break;
            case "school-type":
                groupKey = "schoolSchoolType";
                break;
            case "implementation-model":
                groupKey = "schoolImplementationModel";
                break;
            case "gateway-school":
                groupKey = "gatewaySchool";
                break;
        }

        const uniqueGroups =
            groupKey === null
                ? ["All"]
                : Array.from(
                      new Set(
                          filteredProjects.map((p) =>
                              String(p[groupKey] || "Unassigned"),
                          ),
                      ),
                  ).sort((a, b) =>
                      a === "Unassigned"
                          ? 1
                          : b === "Unassigned"
                            ? -1
                            : a.localeCompare(b),
                  );

        return buildDatasets(uniqueGroups, (groupName) =>
            groupKey === null
                ? filteredProjects
                : filteredProjects.filter(
                      (p) => String(p[groupKey] || "Unassigned") === groupName,
                  ),
        );
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
            <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
                <SheetContent side="left" className="w-80 overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
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
                                setTeacherYearsValue(
                                    newFilters.teacherYearsValue,
                                );
                                setTeacherYearsOperator(
                                    newFilters.teacherYearsOperator,
                                );
                                setTeacherYearsValue2(
                                    newFilters.teacherYearsValue2 ?? "",
                                );
                                setOnlyGatewaySchools(
                                    newFilters.onlyGatewaySchools,
                                );
                            }}
                        />
                    </div>
                </SheetContent>
            </Sheet>

            {/* Large screens: Always show sidebar */}
            <div className="hidden lg:flex flex-col border-r border-border p-8 bg-card w-70 h-screen overflow-y-auto sticky top-0 gap-12">
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
                <div className="flex flex-col gap-5 h-full overflow-hidden">
                    {/* Header - title and actions */}
                    <div className="flex items-center justify-between px-8 pt-8 shrink-0 gap-4">
                        <div className="relative">
                            <AnimatePresence initial={false} mode="popLayout">
                                <motion.h1
                                    key={chartType}
                                    className="text-xl font-semibold text-foreground"
                                    transition={{
                                        duration: 0.15,
                                        ease: "easeOut",
                                    }}
                                    initial={{
                                        opacity: 0,
                                        x: slideDirection.current * -20,
                                    }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{
                                        opacity: 0,
                                        x: slideDirection.current * -20,
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
                                            onlyGatewaySchools:
                                                onlyGatewaySchools,
                                        },
                                    )}
                                </motion.h1>
                            </AnimatePresence>
                        </div>

                        {/* Actions - hidden when sidebar is collapsed */}
                        <div className="hidden xl:flex gap-3">
                            <AlertDialog
                                open={exportDialogOpen}
                                onOpenChange={setExportDialogOpen}
                            >
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex items-center gap-2"
                                        disabled={isExporting}
                                    >
                                        {isExporting ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Share className="w-4 h-4" />
                                                Export
                                            </>
                                        )}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            Export graph to PDF?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will download a PDF of the
                                            current graph to your computer.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>
                                            Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={async () => {
                                                setExportDialogOpen(false);
                                                setIsExporting(true);
                                                await downloadSingleGraph(
                                                    chartRef,
                                                    filterName,
                                                );
                                                setIsExporting(false);
                                                toast.success(
                                                    "Chart exported successfully!",
                                                );
                                            }}
                                        >
                                            Download
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                                onClick={() => {
                                    if (chartInCart) {
                                        removeByName(filterName);
                                    } else {
                                        addChartItem(filterName, {
                                            chartType: chartType as
                                                | "bar"
                                                | "line",
                                            filters,
                                            yearStart: yearRange.start,
                                            yearEnd: yearRange.end,
                                        });
                                    }
                                }}
                            >
                                {chartInCart ? (
                                    <>
                                        <CheckCircle2 className="w-4 h-4" />
                                        Remove
                                    </>
                                ) : (
                                    <>
                                        <PlusCircle className="w-4 h-4" />
                                        Add to cart
                                    </>
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2 relative"
                                onClick={() => setCartOpen(true)}
                            >
                                <ShoppingBasket className="w-4 h-4" />
                                Cart
                                {items.length > 0 && (
                                    <span className="absolute -top-2 -right-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                                        {items.length}
                                    </span>
                                )}
                            </Button>
                            <AnimatedToggleButton
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                                onClick={copyURLtoClipboard}
                                defaultContent={
                                    <>
                                        <Link className="w-4 h-4" />
                                        Copy link
                                    </>
                                }
                                activeContent={
                                    <>
                                        <Check className="w-4 h-4" />
                                        Copy link
                                    </>
                                }
                            />
                        </div>

                        {/* Share popover - visible when sidebar is collapsed */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="xl:hidden flex items-center gap-2"
                                >
                                    <Share className="w-4 h-4" />
                                    Share
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-56" align="end">
                                <div className="flex flex-col gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="justify-start"
                                        disabled={isExporting}
                                        onClick={async () => {
                                            setIsExporting(true);
                                            await downloadSingleGraph(
                                                chartRef,
                                                filterName,
                                            );
                                            setIsExporting(false);
                                            toast.success(
                                                "Chart exported successfully!",
                                            );
                                        }}
                                    >
                                        {isExporting ? (
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        ) : (
                                            <Share className="w-4 h-4 mr-2" />
                                        )}
                                        Export to PDF
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="justify-start"
                                        onClick={() => {
                                            if (chartInCart) {
                                                removeByName(filterName);
                                            } else {
                                                addChartItem(filterName, {
                                                    chartType: chartType as
                                                        | "bar"
                                                        | "line",
                                                    filters,
                                                    yearStart: yearRange.start,
                                                    yearEnd: yearRange.end,
                                                });
                                            }
                                        }}
                                    >
                                        {chartInCart ? (
                                            <>
                                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                                Remove from cart
                                            </>
                                        ) : (
                                            <>
                                                <PlusCircle className="w-4 h-4 mr-2" />
                                                Add to cart
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="justify-start relative"
                                        onClick={() => setCartOpen(true)}
                                    >
                                        <ShoppingBasket className="w-4 h-4 mr-2" />
                                        View cart
                                        {items.length > 0 && (
                                            <span className="ml-auto inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                                                {items.length}
                                            </span>
                                        )}
                                    </Button>
                                    <AnimatedToggleButton
                                        variant="ghost"
                                        size="sm"
                                        className="justify-start"
                                        onClick={copyURLtoClipboard}
                                        defaultContent={
                                            <>
                                                <Link className="w-4 h-4 mr-2" />
                                                Copy link
                                            </>
                                        }
                                        activeContent={
                                            <>
                                                <Check className="w-4 h-4 mr-2" />
                                                Copy link
                                            </>
                                        }
                                    />
                                </div>
                            </PopoverContent>
                        </Popover>

                        <Sheet open={cartOpen} onOpenChange={setCartOpen}>
                            <SheetContent>
                                <SheetHeader>
                                    <SheetTitle>Cart</SheetTitle>
                                </SheetHeader>
                                <Cart />
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* Controls row */}
                    <div className="flex items-center justify-between px-8 shrink-0">
                        <div className="flex items-center gap-3">
                            {/* Filters button (lg and below) */}
                            <Button
                                onClick={() => setFilterOpen(true)}
                                size="sm"
                                variant="outline"
                                className="lg:hidden flex items-center gap-2"
                            >
                                <SlidersHorizontal className="w-4 h-4" />
                            </Button>

                            {/* Bar/Line tabs */}
                            <Tabs
                                value={chartType}
                                onValueChange={handleChartTypeChange}
                            >
                                <TabsList>
                                    <TabsTrigger value="bar" className="gap-2">
                                        <ChartColumn className="w-4 h-4" />
                                        Bar
                                        <Kbd>B</Kbd>
                                    </TabsTrigger>
                                    <TabsTrigger value="line" className="gap-2">
                                        <LineChart className="w-4 h-4" />
                                        Line
                                        <Kbd>L</Kbd>
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>

                        {/* Time range */}
                        <div className="flex items-center">
                            <Button
                                type="button"
                                variant={
                                    timePeriod === "3y" ? "default" : "outline"
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
                                    timePeriod === "5y" ? "default" : "outline"
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
                                                    value={tempYearRange.start}
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
                                                    value={tempYearRange.end}
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
                                                    min={tempYearRange.start}
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
                    <div className="relative flex-1 overflow-hidden">
                        {projectDataError ? (
                            <LoadError
                                message={projectDataError}
                                onRetry={fetchProjects}
                                className="h-full"
                            />
                        ) : (
                            <>
                                {/* Loading overlay */}
                                {!isLoaded && (
                                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white backdrop-blur-sm">
                                        <Loader2 className="h-12 w-12 animate-spin text-slate-800" />
                                    </div>
                                )}

                                {Math.round(filteredProjectCount) !== 0 ? (
                                    <div
                                        ref={chartRef}
                                        className="h-full w-full"
                                    >
                                        <AnimatePresence initial={false}>
                                            <motion.div
                                                key={chartType}
                                                className="flex h-full w-full items-center justify-center px-8 bg-background overflow-auto"
                                                initial={{
                                                    opacity: 0,
                                                    x:
                                                        slideDirection.current *
                                                        -50,
                                                }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{
                                                    opacity: 0,
                                                    x:
                                                        slideDirection.current *
                                                        -50,
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
                                                                filters
                                                                    .measuredAs
                                                            ]
                                                        }
                                                        xAxisLabel="Year"
                                                        legendTitle={
                                                            filters.groupBy ===
                                                            "none"
                                                                ? undefined
                                                                : groupByLabels[
                                                                      filters
                                                                          .groupBy
                                                                  ]
                                                        }
                                                        tooltipFormatter={
                                                            tooltipFormatter
                                                        }
                                                    />
                                                ) : (
                                                    <LineGraph
                                                        datasets={graphDataset}
                                                        yAxisLabel={
                                                            measuredAsLabels[
                                                                filters
                                                                    .measuredAs
                                                            ]
                                                        }
                                                        xAxisLabel="Year"
                                                        legendTitle={
                                                            filters.groupBy ===
                                                            "none"
                                                                ? undefined
                                                                : groupByLabels[
                                                                      filters
                                                                          .groupBy
                                                                  ]
                                                        }
                                                        tooltipFormatter={
                                                            tooltipFormatter
                                                        }
                                                    />
                                                )}
                                            </motion.div>
                                        </AnimatePresence>
                                    </div>
                                ) : (
                                    /*  No data found */
                                    <div className="flex h-full w-full items-center justify-center px-8 bg-background">
                                        {isLoaded ? "No Data Found" : ""}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

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
            </div>
        </div>
    );
}
