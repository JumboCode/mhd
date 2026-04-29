/***************************************************************
 *
 *                schools/page.tsx
 *
 *         Author: Anne Wu & Justin Ngan
 *           Date: 11/16/2025
 *
 *        Summary: Page to display all school profiles
 *
 **************************************************************/

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createColumns, Schools } from "@/components/Columns";
import { SchoolsDataTable } from "@/components/DataTableSchools";
import SchoolSearchBar from "@/components/SchoolSearchbar";
import YearDropdown from "@/components/YearDropdown";
import { LoadError } from "@/components/ui/load-error";
import { Skeleton } from "@/components/ui/skeleton";
import { useSchoolsFilters, SchoolsFilters } from "@/hooks/useSchoolsFilters";
import {
    SchoolsFilterButton,
    ActiveFilterChips,
} from "@/components/SchoolsFilters";

export default function SchoolsPage() {
    const [schoolInfo, setSchoolInfo] = useState<Schools[]>([]);
    const [prevYearSchoolInfo, setPrevYearSchoolInfo] = useState<Schools[]>([]);
    const [year, setYear] = useState<number | null>(null);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [schoolDataError, setSchoolDataError] = useState<string | null>(null);
    const [prevYearError, setPrevYearError] = useState<string | null>(null);
    const [retryTrigger, setRetryTrigger] = useState(0);

    const {
        filters,
        setFilters,
        clearAll,
        hasActiveFilters,
        activeFilterCount,
    } = useSchoolsFilters();

    const columns = useMemo(() => createColumns(), []);

    const fetchSchoolData = useCallback(() => {
        setRetryTrigger((prev) => prev + 1);
    }, []);

    useEffect(() => {
        if (!year) return;

        setIsLoading(true);
        setSchoolDataError(null);

        fetch(`/api/schools?year=${year}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Failed to load school data`);
                }
                return response.json();
            })
            .then((data) => {
                const filtered = data.filter(
                    (s: Schools) =>
                        s.numStudents > 0 ||
                        (s.competingStudents ?? 0) > 0 ||
                        s.numTeachers > 0 ||
                        s.numProjects > 0,
                );
                setSchoolInfo(filtered);
                setSchoolDataError(null);
            })
            .catch(() => {
                setSchoolDataError("Failed to load school data");
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [year, retryTrigger]);

    useEffect(() => {
        if (!year) return;

        setPrevYearError(null);
        setPrevYearSchoolInfo([]);

        fetch(`/api/schools?year=${year - 1}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch previous year data`);
                }
                return response.json();
            })
            .then((data) => {
                setPrevYearSchoolInfo(data);
                setPrevYearError(null);
            })
            .catch(() => {
                setPrevYearError(
                    "This is the earliest year of available data — year-over-year comparisons are not available.",
                );
            });
    }, [year]);

    // Each filter category points at the school field it filters on.
    // `get` may return a string or string[] (e.g. `division`); both are handled uniformly.
    const filterAccessors = useMemo(
        () =>
            [
                { key: "cities", get: (s: Schools) => s.city },
                { key: "regions", get: (s: Schools) => s.region },
                { key: "divisions", get: (s: Schools) => s.division },
                { key: "schoolTypes", get: (s: Schools) => s.schoolType },
                {
                    key: "implementationTypes",
                    get: (s: Schools) => s.implementationModel,
                },
            ] as const satisfies ReadonlyArray<{
                key: keyof SchoolsFilters;
                get: (s: Schools) => string | string[] | null | undefined;
            }>,
        [],
    );

    // Derive unique, sorted filter options from school data
    const filterOptions = useMemo(() => {
        const sets = Object.fromEntries(
            filterAccessors.map(({ key }) => [key, new Set<string>()]),
        ) as Record<keyof SchoolsFilters, Set<string>>;

        for (const school of schoolInfo) {
            for (const { key, get } of filterAccessors) {
                const value = get(school);
                if (Array.isArray(value)) {
                    for (const v of value) if (v) sets[key].add(v);
                } else if (value) {
                    sets[key].add(value);
                }
            }
        }

        return Object.fromEntries(
            Object.entries(sets).map(([key, set]) => [
                key,
                Array.from(set).sort(),
            ]),
        ) as Record<keyof SchoolsFilters, string[]>;
    }, [schoolInfo, filterAccessors]);

    // Apply filters to school data — empty selection means "match anything"
    const filteredData = useMemo(() => {
        return schoolInfo.filter((school) =>
            filterAccessors.every(({ key, get }) => {
                const selected = filters[key];
                if (selected.length === 0) return true;
                const value = get(school);
                return Array.isArray(value)
                    ? value.some((v) => selected.includes(v))
                    : !!value && selected.includes(value);
            }),
        );
    }, [schoolInfo, filters, filterAccessors]);

    const handleFilterChange = (
        key: keyof SchoolsFilters,
        values: string[],
    ) => {
        setFilters({ [key]: values });
    };

    const handleRemoveFilter = (
        category: keyof SchoolsFilters,
        value: string,
    ) => {
        const current = filters[category];
        setFilters({ [category]: current.filter((v) => v !== value) });
    };

    return (
        <div className="font-sans w-full max-w-full h-full min-h-0 flex flex-col overscroll-none">
            <div className="shrink-0 z-40 flex items-center h-16 px-6 backdrop-blur-xl bg-background/70 border-b">
                <div className="flex flex-col shrink-0">
                    <h1 className="text-lg font-bold leading-tight">Schools</h1>
                    <div className="h-4 mt-0.5 flex items-center">
                        {isLoading || year === null ? (
                            <Skeleton className="h-3 w-28" />
                        ) : schoolDataError ? null : (
                            <p className="text-xs text-muted-foreground tabular-nums leading-none">
                                {hasActiveFilters
                                    ? `${filteredData.length} of ${schoolInfo.length} schools`
                                    : `${schoolInfo.length} schools`}
                                {` · ${year}`}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex-1 flex justify-center px-8">
                    <SchoolSearchBar
                        search={search}
                        setSearch={setSearch}
                        className="w-full max-w-md"
                    />
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <SchoolsFilterButton
                        filters={filters}
                        options={filterOptions}
                        onFiltersChange={handleFilterChange}
                        activeFilterCount={activeFilterCount}
                    />
                    <div className="relative z-50">
                        <YearDropdown
                            selectedYear={year}
                            onYearChange={setYear}
                            showDataIndicator={false}
                            enableArrowHotkeys={true}
                        />
                    </div>
                </div>
            </div>

            {hasActiveFilters && (
                <ActiveFilterChips
                    filters={filters}
                    onRemove={handleRemoveFilter}
                    onClearAll={clearAll}
                />
            )}

            <div className="flex-1 min-h-0 flex flex-col overflow-hidden overscroll-none">
                <div className="flex-1 min-h-0 min-w-0 overflow-hidden">
                    {schoolDataError ? (
                        <LoadError
                            message={schoolDataError}
                            onRetry={fetchSchoolData}
                            className="h-full"
                        />
                    ) : (
                        <SchoolsDataTable
                            columns={columns}
                            data={filteredData}
                            prevData={prevYearSchoolInfo}
                            globalFilter={search}
                            setGlobalFilter={setSearch}
                            isLoading={isLoading}
                            prevYearError={prevYearError}
                            selectedYear={year}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
