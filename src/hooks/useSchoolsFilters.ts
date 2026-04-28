"use client";

import { useMemo } from "react";
import { useQueryStates, parseAsArrayOf, parseAsString } from "nuqs";

const filterParsers = {
    cities: parseAsArrayOf(parseAsString).withDefault([]),
    regions: parseAsArrayOf(parseAsString).withDefault([]),
    divisions: parseAsArrayOf(parseAsString).withDefault([]),
    schoolTypes: parseAsArrayOf(parseAsString).withDefault([]),
    implementationTypes: parseAsArrayOf(parseAsString).withDefault([]),
};

export type SchoolsFilters = {
    cities: string[];
    regions: string[];
    divisions: string[];
    schoolTypes: string[];
    implementationTypes: string[];
};

export type UseSchoolsFiltersReturn = {
    filters: SchoolsFilters;
    setCities: (cities: string[]) => void;
    setRegions: (regions: string[]) => void;
    setDivisions: (divisions: string[]) => void;
    setSchoolTypes: (types: string[]) => void;
    setImplementationTypes: (types: string[]) => void;
    setFilters: (updates: Partial<SchoolsFilters>) => void;
    clearAll: () => void;
    hasActiveFilters: boolean;
    activeFilterCount: number;
};

export function useSchoolsFilters(): UseSchoolsFiltersReturn {
    const [filterState, setFilterState] = useQueryStates(filterParsers);

    const hasActiveFilters = useMemo(() => {
        return (
            filterState.cities.length > 0 ||
            filterState.regions.length > 0 ||
            filterState.divisions.length > 0 ||
            filterState.schoolTypes.length > 0 ||
            filterState.implementationTypes.length > 0
        );
    }, [filterState]);

    const activeFilterCount = useMemo(() => {
        return (
            filterState.cities.length +
            filterState.regions.length +
            filterState.divisions.length +
            filterState.schoolTypes.length +
            filterState.implementationTypes.length
        );
    }, [filterState]);

    const clearAll = () => {
        setFilterState({
            cities: [],
            regions: [],
            divisions: [],
            schoolTypes: [],
            implementationTypes: [],
        });
    };

    return {
        filters: filterState,
        setCities: (cities) => setFilterState({ cities }),
        setRegions: (regions) => setFilterState({ regions }),
        setDivisions: (divisions) => setFilterState({ divisions }),
        setSchoolTypes: (types) => setFilterState({ schoolTypes: types }),
        setImplementationTypes: (types) =>
            setFilterState({ implementationTypes: types }),
        setFilters: setFilterState,
        clearAll,
        hasActiveFilters,
        activeFilterCount,
    };
}
