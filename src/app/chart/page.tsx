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
    Minus,
    PlusCircle,
    Share,
    ShoppingBasket,
    SlidersHorizontal,
    TrendingDown,
    TrendingUp,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { LoadError } from "@/components/ui/load-error";
import BarGraph from "@/components/charts/BarGraph";
import { type ChartDataset } from "@/components/charts/chartTypes";
import GraphFilters from "@/components/GraphFilters/GraphFilters";
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
import { useChartFilters } from "@/hooks/useChartFilters";
import { useChartData } from "@/hooks/useChartData";
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
import { downloadSingleGraph, type FilterDetail } from "@/lib/export-to-pdf";
import { useCart } from "@/hooks/useCart";
import { Cart } from "@/components/Cart";
import { CartIndicator } from "@/components/ui/cart-indicator";
import { Kbd } from "@/components/ui/kbd";
import { useHotkey } from "@/hooks/useHotkey";
import { computeChartDatasets } from "@/lib/chart-data-pipeline";
import { isYearInRange } from "@/lib/year-validation";
import {
    generateChartTitle,
    measuredAsLabels,
    groupByLabels,
} from "@/lib/chart-title";
import { DataLineagePopup } from "@/components/DataLineagePopup";
import { DataTable } from "@/components/DataTable";
import { CellValue } from "@/types/spreadsheet";

export default function ChartPage() {
    const [isExporting, setIsExporting] = useState(false);
    const [exportDialogOpen, setExportDialogOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const [dataLineageOpen, setDataLineageOpen] = useState(false);

    // All chart filters and URL state from single hook
    const {
        // Year range
        yearRange,
        updateYearRange,
        startYear,
        endYear,
        setStartYear,
        setEndYear,
        timePeriod,
        setTimePeriod,
        yearRangeOpen,
        setYearRangeOpen,
        // Chart type
        chartType,
        setChartType,
        // Filters
        groupBy,
        setGroupBy,
        measuredAs,
        setMeasuredAs,
        selectedSchools,
        setSelectedSchools,
        selectedCities,
        setSelectedCities,
        selectedProjectTypes,
        setSelectedProjectTypes,
        selectedDivisions,
        setSelectedDivisions,
        selectedSchoolTypes,
        setSelectedSchoolTypes,
        selectedRegions,
        setSelectedRegions,
        selectedImplementationTypes,
        setSelectedImplementationTypes,
        teacherYearsValue,
        setTeacherYearsValue,
        teacherYearsOperator,
        setTeacherYearsOperator,
        teacherYearsValue2,
        setTeacherYearsValue2,
        onlyGatewaySchools,
        setOnlyGatewaySchools,
        // Computed
        filters,
    } = useChartFilters();

    const { items, addChartItem, hasItem, removeByName } = useCart();
    const [tempYearRange, setTempYearRange] = useState({
        start: yearRange.start,
        end: yearRange.end,
    });

    // Chart type animation direction
    const slideDirection = useRef(0);
    const handleChartTypeChange = useCallback(
        (value: string) => {
            slideDirection.current = value === "line" ? -1 : 1;
            setChartType(value);
        },
        [setChartType],
    );

    useEffect(() => {
        document.title = `${chartType === "bar" ? "Bar Chart" : "Line Chart"} | MHD`;
    }, [chartType]);

    // Keyboard shortcuts for chart type
    useHotkey("b", () => handleChartTypeChange("bar"));
    useHotkey("l", () => handleChartTypeChange("line"));
    useHotkey("?", () => setDataLineageOpen((v) => !v));

    const chartRef = useRef<HTMLDivElement | null>(null);

    // All data fetching from single hook
    const {
        allProjects,
        gatewaySchools,
        isLoaded,
        projectDataError,
        fetchProjects,
        dataLastUpdated,
    } = useChartData(yearRange);

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
            divisions: selectedDivisions.length,
            schoolTypes: selectedSchoolTypes.length,
            regions: selectedRegions.length,
            implementationTypes: selectedImplementationTypes.length,
            hasTeacherYearsFilter: teacherYearsValue !== "",
            onlyGatewaySchools: onlyGatewaySchools,
        },
    );

    const chartInCart = hasItem(filterName);

    const filterDetails = useMemo<FilterDetail[]>(
        () => [
            ...(selectedSchools.length > 0
                ? [{ label: "Schools", values: selectedSchools }]
                : []),
            ...(selectedCities.length > 0
                ? [{ label: "Cities", values: selectedCities }]
                : []),
            ...(selectedProjectTypes.length > 0
                ? [{ label: "Project Types", values: selectedProjectTypes }]
                : []),
            ...(selectedDivisions.length > 0
                ? [{ label: "Divisions", values: selectedDivisions }]
                : []),
            ...(selectedSchoolTypes.length > 0
                ? [{ label: "School Types", values: selectedSchoolTypes }]
                : []),
            ...(selectedRegions.length > 0
                ? [{ label: "Regions", values: selectedRegions }]
                : []),
            ...(selectedImplementationTypes.length > 0
                ? [
                      {
                          label: "Implementation Types",
                          values: selectedImplementationTypes,
                      },
                  ]
                : []),
            ...(onlyGatewaySchools
                ? [
                      {
                          label: "Gateway Schools",
                          values: ["Only Gateway Schools"],
                      },
                  ]
                : []),
            ...(teacherYearsValue !== ""
                ? [
                      {
                          label: "Teacher Years",
                          values: [
                              teacherYearsOperator === "between"
                                  ? `between ${teacherYearsValue} and ${teacherYearsValue2}`
                                  : `${teacherYearsOperator} ${teacherYearsValue}`,
                          ],
                      },
                  ]
                : []),
            {
                label: "Measured As",
                values: [measuredAsLabels[measuredAs] ?? measuredAs],
            },
            {
                label: "Grouped By",
                values: [groupByLabels[groupBy] ?? groupBy],
            },
            {
                label: "Year Range",
                values: [`${yearRange.start} – ${yearRange.end}`],
            },
        ],
        [
            selectedSchools,
            selectedCities,
            selectedProjectTypes,
            selectedDivisions,
            selectedSchoolTypes,
            selectedRegions,
            selectedImplementationTypes,
            onlyGatewaySchools,
            teacherYearsValue,
            teacherYearsOperator,
            teacherYearsValue2,
            measuredAs,
            groupBy,
            yearRange,
        ],
    );

    // Memoize graph dataset calculation
    const graphDataset: ChartDataset[] = useMemo(() => {
        if (!allProjects.length || !filters) return [];
        const { datasets } = computeChartDatasets(
            allProjects,
            filters,
            yearRange,
        );
        return datasets;
    }, [allProjects, filters, yearRange]);

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
            downloadSingleGraph(
                chartType as "bar" | "line",
                graphDataset,
                measuredAsLabels[filters.measuredAs],
                filters.groupBy === "none"
                    ? undefined
                    : groupByLabels[filters.groupBy],
                filterName,
                filterDetails,
                true,
            );
        },
        { meta: true },
    );

    // Sync tempYearRange with yearRange when the popover opens
    useEffect(() => {
        if (yearRangeOpen) {
            setTempYearRange({ start: yearRange.start, end: yearRange.end });
        }
    }, [yearRangeOpen, yearRange]);

    // Keep query params normalized if an invalid range is loaded from URL.
    useEffect(() => {
        if (startYear <= endYear) return;
        setStartYear(endYear);
        setEndYear(startYear);
    }, [startYear, endYear, setStartYear, setEndYear]);

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
            updateYearRange(maxYear - 2, maxYear);
            return;
        } else if (timePeriod === "5y") {
            //return { start: maxYear - 4, end: maxYear };
            updateYearRange(maxYear - 4, maxYear);
            return;
        }

        // "all" - use full range
        const minYear = Math.min(...allYears);
        updateYearRange(minYear, maxYear);
    }, [timePeriod, allProjects, updateYearRange]);

    const { cols, rows } = useMemo(() => {
        if (!graphDataset.length) return { cols: [], rows: [] };

        const isReturnRate = filters.measuredAs === "school-return-rate";

        const allYears = Array.from(
            new Set(graphDataset.flatMap((ds) => ds.data.map((d) => d.x))),
        ).sort((a, b) => Number(a) - Number(b));

        const hasGroupBy = filters.groupBy !== "none";
        const cols = [
            { id: "year", accessorKey: "year", header: "Year" },
            ...graphDataset.flatMap((ds) => {
                const valueHeader =
                    ds.label === "All"
                        ? (measuredAsLabels[filters.measuredAs] ?? ds.label)
                        : ds.label;
                const prefix = graphDataset.length === 1 ? "" : `${ds.label} `;
                const pctRawKey = `${ds.label}__pctRaw`;

                const valueCols = [
                    {
                        id: ds.label,
                        accessorKey: ds.label,
                        header: valueHeader,
                    },
                ];

                if (hasGroupBy) return valueCols;

                return [
                    ...valueCols,
                    {
                        id: `${ds.label}__delta`,
                        accessorKey: `${ds.label}__delta`,
                        header: `${prefix}Δ`,
                        cell: ({
                            row,
                        }: {
                            row: { original: Record<string, CellValue> };
                        }) => {
                            const formatted = row.original[
                                `${ds.label}__delta`
                            ] as string;
                            if (formatted === "—")
                                return (
                                    <span className="text-muted-foreground">
                                        —
                                    </span>
                                );
                            const color = formatted.startsWith("+")
                                ? "text-[#46A758]"
                                : formatted.startsWith("-")
                                  ? "text-[#E5484D]"
                                  : "text-[#808080]";
                            return <span className={color}>{formatted}</span>;
                        },
                    },
                    {
                        id: `${ds.label}__pct`,
                        accessorKey: `${ds.label}__pct`,
                        header: `${prefix}% Change`,
                        cell: ({
                            row,
                        }: {
                            row: { original: Record<string, CellValue> };
                        }) => {
                            const raw = row.original[pctRawKey];
                            const formatted = row.original[
                                `${ds.label}__pct`
                            ] as string;
                            if (
                                raw === null ||
                                raw === undefined ||
                                formatted === "—"
                            ) {
                                return (
                                    <span className="text-muted-foreground">
                                        —
                                    </span>
                                );
                            }
                            const pct = raw as number;
                            const absStr = `${Math.abs(pct).toFixed(1)}%`;
                            if (Math.abs(pct) < 0.5) {
                                return (
                                    <div className="flex items-center gap-1 text-[#808080]">
                                        <Minus size={14} />
                                        {absStr}
                                    </div>
                                );
                            }
                            if (pct > 0) {
                                return (
                                    <div className="flex items-center gap-1 text-[#46A758]">
                                        <TrendingUp size={14} />
                                        {absStr}
                                    </div>
                                );
                            }
                            return (
                                <div className="flex items-center gap-1 text-[#E5484D]">
                                    <TrendingDown size={14} />
                                    {absStr}
                                </div>
                            );
                        },
                    },
                ];
            }),
        ];

        const rows = allYears.map((year, yearIdx) => {
            const row: Record<string, CellValue> = { year };
            graphDataset.forEach((ds) => {
                const point = ds.data.find((d) => d.x === year);
                const prevPoint =
                    yearIdx > 0
                        ? ds.data.find((d) => d.x === allYears[yearIdx - 1])
                        : undefined;

                if (point !== undefined) {
                    row[ds.label] = isReturnRate
                        ? `${(point.y * 100).toFixed(1)}%`
                        : Math.round(point.y);

                    if (prevPoint !== undefined) {
                        const delta = point.y - prevPoint.y;
                        const pct =
                            prevPoint.y !== 0
                                ? (delta / prevPoint.y) * 100
                                : null;

                        row[`${ds.label}__delta`] = isReturnRate
                            ? `${delta >= 0 ? "+" : ""}${(delta * 100).toFixed(1)}pp`
                            : `${delta >= 0 ? "+" : ""}${Math.round(delta)}`;

                        row[`${ds.label}__pct`] =
                            pct !== null
                                ? `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`
                                : "—";
                        row[`${ds.label}__pctRaw`] = pct;
                    } else {
                        row[`${ds.label}__delta`] = "—";
                        row[`${ds.label}__pct`] = "—";
                        row[`${ds.label}__pctRaw`] = null;
                    }
                } else {
                    row[ds.label] = "—";
                    row[`${ds.label}__delta`] = "—";
                    row[`${ds.label}__pct`] = "—";
                    row[`${ds.label}__pctRaw`] = null;
                }
            });
            return row;
        });

        return { cols, rows };
    }, [graphDataset, filters.measuredAs, filters.groupBy]);

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

    // Data for filter dropdowns — disambiguate schools sharing the same name
    // by appending the town. Only schools with multiple distinct towns get the
    // "(Town)" suffix. Value uses \x00 as separator so filter logic can split
    // it back into name + town without ambiguity.
    const schoolTownSets = new Map<string, Set<string>>();
    for (const p of allProjects) {
        if (!schoolTownSets.has(p.schoolName))
            schoolTownSets.set(p.schoolName, new Set());
        schoolTownSets.get(p.schoolName)!.add(p.schoolTown);
    }
    const seenSchoolKeys = new Set<string>();
    const schools = allProjects
        .flatMap((p) => {
            const key = `${p.schoolName}\x00${p.schoolTown}`;
            if (seenSchoolKeys.has(key)) return [];
            seenSchoolKeys.add(key);
            const isDup = (schoolTownSets.get(p.schoolName)?.size ?? 0) > 1;
            return [
                isDup
                    ? { label: `${p.schoolName} (${p.schoolTown})`, value: key }
                    : p.schoolName,
            ];
        })
        .sort((a, b) => {
            const la = typeof a === "string" ? a : a.label;
            const lb = typeof b === "string" ? b : b.label;
            return la.localeCompare(lb);
        });
    const cities = Array.from(
        new Set(allProjects.map((p) => p.schoolTown)),
    ).sort();
    const projectTypes = Array.from(
        new Set(allProjects.map((p) => p.category)),
    ).sort();

    const normalizeDivision = (d: string): string => {
        const lower = d.toLowerCase();
        if (lower.startsWith("junior")) return "Junior";
        if (lower.startsWith("senior")) return "Senior";
        if (lower.startsWith("young")) return "Young Historian";
        return d;
    };
    const divisions = (() => {
        const set = new Set<string>();
        let hasMissing = false;
        for (const p of allProjects) {
            if (!p.schoolDivisions || p.schoolDivisions.length === 0) {
                hasMissing = true;
                continue;
            }
            for (const d of p.schoolDivisions) set.add(normalizeDivision(d));
        }
        const list = Array.from(set).sort();
        if (hasMissing) list.push("Unassigned");
        return list;
    })();
    const withUnassigned = (values: (string | null | undefined)[]) => {
        const set = new Set<string>();
        let hasMissing = false;
        for (const v of values) {
            if (v === null || v === undefined || v === "") hasMissing = true;
            else set.add(v);
        }
        const list = Array.from(set).sort();
        if (hasMissing) list.push("Unassigned");
        return list;
    };
    const schoolTypes = withUnassigned(
        allProjects.map((p) => p.schoolSchoolType),
    );
    const regions = withUnassigned(allProjects.map((p) => p.schoolRegion));
    const implementationTypes = withUnassigned(
        allProjects.map((p) => p.schoolImplementationModel),
    );

    const rangeInvalid =
        !isYearInRange(tempYearRange.start) ||
        !isYearInRange(tempYearRange.end) ||
        tempYearRange.start > tempYearRange.end;

    return (
        <>
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
                                divisions={divisions}
                                schoolTypes={schoolTypes}
                                regions={regions}
                                implementationTypes={implementationTypes}
                                gatewaySchools={gatewaySchools}
                                filters={filters}
                                onFiltersChange={(newFilters) => {
                                    setSelectedSchools(
                                        newFilters.selectedSchools,
                                    );
                                    setSelectedCities(
                                        newFilters.selectedCities,
                                    );
                                    setSelectedProjectTypes(
                                        newFilters.selectedProjectTypes,
                                    );
                                    setSelectedDivisions(
                                        newFilters.selectedDivisions,
                                    );
                                    setSelectedSchoolTypes(
                                        newFilters.selectedSchoolTypes,
                                    );
                                    setSelectedRegions(
                                        newFilters.selectedRegions,
                                    );
                                    setSelectedImplementationTypes(
                                        newFilters.selectedImplementationTypes,
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
                        divisions={divisions}
                        schoolTypes={schoolTypes}
                        regions={regions}
                        implementationTypes={implementationTypes}
                        gatewaySchools={gatewaySchools}
                        filters={filters}
                        onFiltersChange={(newFilters) => {
                            setSelectedSchools(newFilters.selectedSchools);
                            setSelectedCities(newFilters.selectedCities);
                            setSelectedProjectTypes(
                                newFilters.selectedProjectTypes,
                            );
                            setSelectedDivisions(newFilters.selectedDivisions);
                            setSelectedSchoolTypes(
                                newFilters.selectedSchoolTypes,
                            );
                            setSelectedRegions(newFilters.selectedRegions);
                            setSelectedImplementationTypes(
                                newFilters.selectedImplementationTypes,
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
                            if (teacherYearsValue2 !== undefined) {
                                const min = parseInt(
                                    newFilters.teacherYearsValue,
                                    10,
                                );
                                const max = parseInt(
                                    newFilters.teacherYearsValue2 ?? "",
                                    10,
                                );
                                if (max <= min) {
                                    setTeacherYearsValue2(
                                        newFilters.teacherYearsValue,
                                    );
                                }
                            }
                            setOnlyGatewaySchools(
                                newFilters.onlyGatewaySchools,
                            );
                        }}
                    />
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex flex-col gap-5 h-full overflow-hidden">
                        {/* Header - title and actions */}
                        <div className="flex items-center justify-between px-8 pt-8 shrink-0 gap-4">
                            <div className="min-w-0 flex-1">
                                <AnimatePresence
                                    initial={false}
                                    mode="popLayout"
                                >
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
                                                        chartType as
                                                            | "bar"
                                                            | "line",
                                                        graphDataset,
                                                        measuredAsLabels[
                                                            filters.measuredAs
                                                        ],
                                                        filters.groupBy ===
                                                            "none"
                                                            ? undefined
                                                            : groupByLabels[
                                                                  filters
                                                                      .groupBy
                                                              ],
                                                        filterName,
                                                        filterDetails,
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
                                            addChartItem(
                                                filterName,
                                                {
                                                    chartType: chartType as
                                                        | "bar"
                                                        | "line",
                                                    filters,
                                                    yearStart: yearRange.start,
                                                    yearEnd: yearRange.end,
                                                    tableData: { cols, rows },
                                                },
                                                filterDetails,
                                            );
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
                                    <CartIndicator
                                        count={items.length}
                                        className="absolute -top-2 -right-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground"
                                    />
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
                                                    chartType as "bar" | "line",
                                                    graphDataset,
                                                    measuredAsLabels[
                                                        filters.measuredAs
                                                    ],
                                                    filters.groupBy === "none"
                                                        ? undefined
                                                        : groupByLabels[
                                                              filters.groupBy
                                                          ],
                                                    filterName,
                                                    filterDetails,
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
                                                    addChartItem(
                                                        filterName,
                                                        {
                                                            chartType:
                                                                chartType as
                                                                    | "bar"
                                                                    | "line",
                                                            filters,
                                                            yearStart:
                                                                yearRange.start,
                                                            yearEnd:
                                                                yearRange.end,
                                                            tableData: {
                                                                cols,
                                                                rows,
                                                            },
                                                        },
                                                        filterDetails,
                                                    );
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
                                            <CartIndicator
                                                count={items.length}
                                                className="ml-auto inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground"
                                            />
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

                            {/* Time range */}
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
                                                    disabled={rangeInvalid}
                                                    onClick={() => {
                                                        updateYearRange(
                                                            tempYearRange.start,
                                                            tempYearRange.end,
                                                            {
                                                                notifyIfSwapped: true,
                                                            },
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
                        <div className="relative flex-1 mb-4">
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
                                                    className="flex h-full w-full items-center justify-center px-8 bg-background"
                                                    initial={{
                                                        opacity: 0,
                                                        x:
                                                            slideDirection.current *
                                                            -50,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        x: 0,
                                                    }}
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
                                                            dataset={
                                                                graphDataset
                                                            }
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
                                                            datasets={
                                                                graphDataset
                                                            }
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

                        {/* Data table */}
                        <div className="px-8 overflow-x-auto max-h-64 overflow-y-auto border-border">
                            <DataTable data={rows} columns={cols} />
                        </div>

                        {/* Footer */}
                        <div className="flex flex-col items-end gap-3 px-8 pb-4 text-xs text-foreground shrink-0">
                            {isLoaded && (
                                <p className="font-medium">
                                    <span className="font-mono bg-gray/4 border rounded-sm border-gray/2 py-1 px-2">
                                        {Math.round(filteredProjectCount)}
                                    </span>{" "}
                                    data rows total
                                </p>
                            )}
                            {dataLastUpdated && (
                                <p>
                                    <span className="font-mono bg-gray/4 border rounded-sm border-gray/2 py-1 px-2">
                                        {dataLastUpdated.toLocaleDateString(
                                            "en-US",
                                            {
                                                month: "2-digit",
                                                day: "2-digit",
                                                year: "numeric",
                                            },
                                        )}
                                    </span>{" "}
                                    data last updated
                                </p>
                            )}
                            <button
                                onClick={() => setDataLineageOpen((v) => !v)}
                                className="font-medium hover:underline cursor-pointer"
                            >
                                Where does this data come from?
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <DataLineagePopup
                open={dataLineageOpen}
                onOpenChange={setDataLineageOpen}
                filters={filters}
                yearRange={yearRange}
                allProjects={allProjects}
            />
        </>
    );
}
