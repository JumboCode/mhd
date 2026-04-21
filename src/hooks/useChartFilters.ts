"use client";

import { useCallback, useMemo, useState } from "react";
import {
    useQueryStates,
    parseAsString,
    parseAsInteger,
    parseAsBoolean,
    parseAsArrayOf,
} from "nuqs";
import { toast } from "sonner";
import {
    type Filters,
    type GroupBy,
    type MeasuredAs,
} from "@/components/GraphFilters/GraphFilters";
import { type YearRange } from "@/lib/chart-data-pipeline";
import { normalizeMeasuredAs } from "@/lib/compute-chart-data";

// Schema for batched filter query params
const filterParsers = {
    groupBy: parseAsString
        .withDefault("none")
        .withOptions({ clearOnDefault: false }),
    measuredAs: parseAsString
        .withDefault("total-school-count")
        .withOptions({ clearOnDefault: false }),
    schools: parseAsArrayOf(parseAsString).withDefault([]),
    cities: parseAsArrayOf(parseAsString).withDefault([]),
    projectTypes: parseAsArrayOf(parseAsString).withDefault([]),
    divisions: parseAsArrayOf(parseAsString).withDefault([]),
    schoolTypes: parseAsArrayOf(parseAsString).withDefault([]),
    regions: parseAsArrayOf(parseAsString).withDefault([]),
    implementationTypes: parseAsArrayOf(parseAsString).withDefault([]),
    teacherYearsValue: parseAsString.withDefault(""),
    teacherYearsOperator: parseAsString.withDefault("="),
    teacherYearsValue2: parseAsString.withDefault(""),
    onlyGatewaySchools: parseAsBoolean.withDefault(false),
};

// Schema for year/chart params (separate for clarity)
const chartParsers = {
    period: parseAsString.withDefault("custom"),
    startYear: parseAsInteger
        .withDefault(2020)
        .withOptions({ clearOnDefault: false }),
    endYear: parseAsInteger
        .withDefault(2025)
        .withOptions({ clearOnDefault: false }),
    type: parseAsString
        .withDefault("bar")
        .withOptions({ clearOnDefault: false }),
};

export type UseChartFiltersReturn = {
    // Year range
    yearRange: YearRange;
    updateYearRange: (
        start: number,
        end: number,
        options?: { notifyIfSwapped?: boolean },
    ) => void;
    startYear: number;
    endYear: number;
    setStartYear: (year: number) => void;
    setEndYear: (year: number) => void;

    // Time period preset
    timePeriod: string;
    setTimePeriod: (period: string) => void;

    // Temp year range for picker popover
    tempYearRange: YearRange;
    setTempYearRange: (range: YearRange) => void;
    yearRangeOpen: boolean;
    setYearRangeOpen: (open: boolean) => void;

    // Chart type
    chartType: string;
    setChartType: (type: string) => void;

    // Filter values (from batched state)
    groupBy: string;
    setGroupBy: (value: string) => void;
    measuredAs: string;
    setMeasuredAs: (value: string | MeasuredAs) => void;
    selectedSchools: string[];
    setSelectedSchools: (schools: string[]) => void;
    selectedCities: string[];
    setSelectedCities: (cities: string[]) => void;
    selectedProjectTypes: string[];
    setSelectedProjectTypes: (types: string[]) => void;
    selectedDivisions: string[];
    setSelectedDivisions: (divisions: string[]) => void;
    selectedSchoolTypes: string[];
    setSelectedSchoolTypes: (types: string[]) => void;
    selectedRegions: string[];
    setSelectedRegions: (regions: string[]) => void;
    selectedImplementationTypes: string[];
    setSelectedImplementationTypes: (types: string[]) => void;
    teacherYearsValue: string;
    setTeacherYearsValue: (value: string) => void;
    teacherYearsOperator: string;
    setTeacherYearsOperator: (op: string) => void;
    teacherYearsValue2: string;
    setTeacherYearsValue2: (value: string) => void;
    onlyGatewaySchools: boolean;
    setOnlyGatewaySchools: (value: boolean) => void;

    // Batch update filters (type matches filterParsers schema)
    setFilters: (
        updates: Partial<{
            groupBy: string | null;
            measuredAs: string | null;
            schools: string[] | null;
            cities: string[] | null;
            projectTypes: string[] | null;
            divisions: string[] | null;
            schoolTypes: string[] | null;
            regions: string[] | null;
            implementationTypes: string[] | null;
            teacherYearsValue: string | null;
            teacherYearsOperator: string | null;
            teacherYearsValue2: string | null;
            onlyGatewaySchools: boolean | null;
        }>,
    ) => void;

    // Computed filters object
    filters: Filters;
};

export function useChartFilters(): UseChartFiltersReturn {
    // Batched filter state
    const [filterState, setFilterState] = useQueryStates(filterParsers);

    // Batched chart/year state
    const [chartState, setChartState] = useQueryStates(chartParsers);

    // Year range normalization
    const normalizeYearRange = useCallback((start: number, end: number) => {
        if (start <= end) {
            return { start, end };
        }
        return { start: end, end: start };
    }, []);

    const updateYearRange = useCallback(
        (
            start: number,
            end: number,
            options?: { notifyIfSwapped?: boolean },
        ) => {
            const normalized = normalizeYearRange(start, end);
            if (options?.notifyIfSwapped && start > end) {
                toast.info(
                    "Year range was swapped to keep start year before end year.",
                );
            }
            setChartState({
                startYear: normalized.start,
                endYear: normalized.end,
            });
        },
        [normalizeYearRange, setChartState],
    );

    const yearRange = useMemo(
        () => normalizeYearRange(chartState.startYear, chartState.endYear),
        [chartState.startYear, chartState.endYear, normalizeYearRange],
    );

    // Local UI state (not in URL)
    const [tempYearRange, setTempYearRange] = useState({
        start: chartState.startYear,
        end: chartState.endYear,
    });
    const [yearRangeOpen, setYearRangeOpen] = useState(false);

    // Computed filters object for chart-data-pipeline
    const filters: Filters = useMemo(
        () => ({
            individualProjects: true,
            groupProjects: true,
            selectedSchools: filterState.schools,
            selectedCities: filterState.cities,
            selectedProjectTypes: filterState.projectTypes,
            selectedDivisions: filterState.divisions,
            selectedSchoolTypes: filterState.schoolTypes,
            selectedRegions: filterState.regions,
            selectedImplementationTypes: filterState.implementationTypes,
            teacherYearsValue: filterState.teacherYearsValue,
            teacherYearsOperator: filterState.teacherYearsOperator as
                | "="
                | ">"
                | "<"
                | "between",
            teacherYearsValue2: filterState.teacherYearsValue2 || undefined,
            groupBy: filterState.groupBy as GroupBy,
            onlyGatewaySchools: filterState.onlyGatewaySchools,
            measuredAs: normalizeMeasuredAs(
                filterState.measuredAs,
            ) as MeasuredAs,
        }),
        [filterState],
    );

    return {
        // Year range
        yearRange,
        updateYearRange,
        startYear: chartState.startYear,
        endYear: chartState.endYear,
        setStartYear: (year) => setChartState({ startYear: year }),
        setEndYear: (year) => setChartState({ endYear: year }),

        // Time period
        timePeriod: chartState.period,
        setTimePeriod: (period) => setChartState({ period }),

        // Temp year range (local state)
        tempYearRange,
        setTempYearRange,
        yearRangeOpen,
        setYearRangeOpen,

        // Chart type
        chartType: chartState.type,
        setChartType: (type) => setChartState({ type }),

        // Individual filter accessors
        groupBy: filterState.groupBy,
        setGroupBy: (value) => setFilterState({ groupBy: value }),
        measuredAs: normalizeMeasuredAs(filterState.measuredAs),
        setMeasuredAs: (value) =>
            setFilterState({
                measuredAs: normalizeMeasuredAs(value as string),
            }),
        selectedSchools: filterState.schools,
        setSelectedSchools: (schools) => setFilterState({ schools }),
        selectedCities: filterState.cities,
        setSelectedCities: (cities) => setFilterState({ cities }),
        selectedProjectTypes: filterState.projectTypes,
        setSelectedProjectTypes: (types) =>
            setFilterState({ projectTypes: types }),
        selectedDivisions: filterState.divisions,
        setSelectedDivisions: (divisions) => setFilterState({ divisions }),
        selectedSchoolTypes: filterState.schoolTypes,
        setSelectedSchoolTypes: (types) =>
            setFilterState({ schoolTypes: types }),
        selectedRegions: filterState.regions,
        setSelectedRegions: (regions) => setFilterState({ regions }),
        selectedImplementationTypes: filterState.implementationTypes,
        setSelectedImplementationTypes: (types) =>
            setFilterState({ implementationTypes: types }),
        teacherYearsValue: filterState.teacherYearsValue,
        setTeacherYearsValue: (value) =>
            setFilterState({ teacherYearsValue: value }),
        teacherYearsOperator: filterState.teacherYearsOperator,
        setTeacherYearsOperator: (op) =>
            setFilterState({ teacherYearsOperator: op }),
        teacherYearsValue2: filterState.teacherYearsValue2,
        setTeacherYearsValue2: (value) =>
            setFilterState({ teacherYearsValue2: value }),
        onlyGatewaySchools: filterState.onlyGatewaySchools,
        setOnlyGatewaySchools: (value) =>
            setFilterState({ onlyGatewaySchools: value }),

        // Batch update
        setFilters: setFilterState,

        // Computed
        filters,
    };
}
