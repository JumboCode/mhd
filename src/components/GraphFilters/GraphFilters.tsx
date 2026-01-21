/***************************************************************
 *
 *                GraphFilters.tsx
 *
 *         Author: Elki & Zander
 *           Date: 11/24/2025
 *
 *        Summary: temp filter panel for line/bar graph pages
 *
 **************************************************************/

// TODO: Eliminate invalid options/combinations based on filters

"use client";

import { useState } from "react";
import { Combobox } from "@/components/Combobox";
import { AddFilterPopover } from "./AddFilterPopover";
import { FilterValuePopover } from "./FilterValuePopover";
import { Info, X } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Filter, filterOptions } from "./constants";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "../ui/button";

const measuredAsOptions = [
    { value: "total-school-count", label: "Total School Count" },
    { value: "total-student-count", label: "Total Student Count" },
    { value: "total-city-count", label: "Total City Count" },
    { value: "total-project-count", label: "Total Project Count" },
    { value: "total-teacher-count", label: "Total Teacher Count" },
    { value: "school-return-rate", label: "School Return Rate" },
];

const groupByOptions = [
    { value: "region", label: "Region" },
    { value: "school-type", label: "School Type" },
    { value: "division", label: "Division (Junior/Senior)" },
    { value: "implementation-type", label: "Implementation Type" },
    { value: "project-type", label: "Project Type" },
];

export type Filters = {
    measuredAs: string;
    groupBy: string;
    individualProjects: boolean;
    groupProjects: boolean;
    selectedSchools: string[];
    selectedCities: string[];
    selectedProjectTypes: string[];
    teacherYearsOperator: string;
    teacherYearsValue: string;
    teacherYearsValue2?: string; // For range filtering (between)
};

type GraphFiltersProps = {
    schools: string[];
    cities: string[];
    projectTypes?: string[]; // List of project type options
    gatewayCities?: string[]; // List of gateway city names
    onFiltersChange: (filters: Filters) => void;
};

export default function GraphFilters({
    schools,
    cities,
    projectTypes = [],
    gatewayCities = [],
    onFiltersChange,
}: GraphFiltersProps) {
    const [measuredAs, setMeasuredAs] = useState("total-school-count");
    const [groupBy, setGroupBy] = useState("region");
    const [individualProjects, setIndividualProjects] = useState(true);
    const [groupProjects, setGroupProjects] = useState(true);
    const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
    const [selectedCities, setSelectedCities] = useState<string[]>([]);
    const [selectedProjectTypes, setSelectedProjectTypes] = useState<string[]>(
        [],
    );
    const [teacherYearsOperator, setTeacherYearsOperator] = useState("=");
    const [teacherYearsValue, setTeacherYearsValue] = useState("");
    const [teacherYearsValue2, setTeacherYearsValue2] = useState<string>("");

    const [selectedFilters, setSelectedFilters] = useState<Filter[]>([]);

    const updateFilters = (updates: Partial<Filters>) => {
        const newFilters: Filters = {
            measuredAs,
            groupBy,
            individualProjects,
            groupProjects,
            selectedSchools,
            selectedCities,
            selectedProjectTypes,
            teacherYearsOperator,
            teacherYearsValue,
            teacherYearsValue2,
            ...updates,
        };
        onFiltersChange(newFilters);
    };

    const handleMeasuredAsChange = (value: string) => {
        setMeasuredAs(value);
        updateFilters({ measuredAs: value });
    };

    const handleGroupByChange = (value: string) => {
        setGroupBy(value);
        updateFilters({ groupBy: value });
    };

    const handleSchoolsChange = (values: string[]) => {
        setSelectedSchools(values);
        updateFilters({ selectedSchools: values });
    };

    const handleCitiesChange = (values: string[]) => {
        setSelectedCities(values);
        updateFilters({ selectedCities: values });
    };

    const handleProjectTypesChange = (values: string[]) => {
        setSelectedProjectTypes(values);
        updateFilters({ selectedProjectTypes: values });
    };

    const handleSchoolCheckboxToggle = (school: string, checked: boolean) => {
        const newSelection = checked
            ? [...selectedSchools, school]
            : selectedSchools.filter((s) => s !== school);
        setSelectedSchools(newSelection);
        updateFilters({ selectedSchools: newSelection });
    };

    const handleCityCheckboxToggle = (city: string, checked: boolean) => {
        const newSelection = checked
            ? [...selectedCities, city]
            : selectedCities.filter((c) => c !== city);
        setSelectedCities(newSelection);
        updateFilters({ selectedCities: newSelection });
    };

    const handleTeacherYearsOperatorChange = (value: string) => {
        setTeacherYearsOperator(value);
        updateFilters({ teacherYearsOperator: value });
    };

    const handleTeacherYearsValueChange = (value: string) => {
        setTeacherYearsValue(value);
        updateFilters({ teacherYearsValue: value });
    };

    const handleFilterSelect = (value: Filter) => {
        setSelectedFilters((prev) => [...prev, value]);
        // Initialize teacher participation filter with default values
        if (value.value === "teacher-participation" && !teacherYearsValue) {
            setTeacherYearsValue("1");
            updateFilters({ teacherYearsValue: "1" });
        }
    };

    const handleFilterRemove = (value: Filter) => {
        setSelectedFilters((prev) =>
            prev.filter((f) => f.value !== value.value),
        );

        if (value.value === "teacher-participation") {
            setTeacherYearsOperator("=");
            setTeacherYearsValue("");
            setTeacherYearsValue2("");
            updateFilters({
                teacherYearsOperator: "=",
                teacherYearsValue: "",
                teacherYearsValue2: undefined,
            });
        } else if (value.value === "project-type") {
            setSelectedProjectTypes([]);
            updateFilters({ selectedProjectTypes: [] });
        } else if (value.value === "school") {
            setSelectedSchools([]);
            updateFilters({ selectedSchools: [] });
        } else if (value.value === "city") {
            setSelectedCities([]);
            updateFilters({ selectedCities: [] });
        }
    };

    const handleFilterValueFinish = (
        filterType: "school" | "city" | "project-type",
        values: string[],
    ) => {
        if (filterType === "school") {
            setSelectedSchools(values);
            updateFilters({ selectedSchools: values });
        } else if (filterType === "city") {
            setSelectedCities(values);
            updateFilters({ selectedCities: values });
        } else if (filterType === "project-type") {
            setSelectedProjectTypes(values);
            updateFilters({ selectedProjectTypes: values });
        }
    };

    const handleTeacherParticipationFinish = (
        operator: string,
        value: string,
        value2?: string,
    ) => {
        setTeacherYearsOperator(operator);
        setTeacherYearsValue(value);
        if (value2 !== undefined) {
            setTeacherYearsValue2(value2);
            updateFilters({
                teacherYearsOperator: operator,
                teacherYearsValue: value,
                teacherYearsValue2: value2,
            });
        } else {
            setTeacherYearsValue2("");
            updateFilters({
                teacherYearsOperator: operator,
                teacherYearsValue: value,
                teacherYearsValue2: undefined,
            });
        }
    };

    // Helper function to truncate comma-separated values
    const truncateValues = (
        values: string[],
        maxLength: number = 50,
    ): string => {
        if (values.length === 0) return "";
        const joined = values.join(", ");
        if (joined.length <= maxLength) return joined;
        return joined.substring(0, maxLength).trim() + "...";
    };

    // Get display text for filter chip
    const getFilterDisplayText = (filter: Filter): string => {
        if (filter.value === "school") {
            const count = selectedSchools.length;
            if (count === 0) return filter.label;
            const truncated = truncateValues(selectedSchools);
            return `${filter.label}: ${truncated}`;
        }
        if (filter.value === "city") {
            const count = selectedCities.length;
            if (count === 0) return filter.label;
            const truncated = truncateValues(selectedCities);
            return `${filter.label}: ${truncated}`;
        }
        if (filter.value === "project-type") {
            const count = selectedProjectTypes.length;
            if (count === 0) return filter.label;
            const truncated = truncateValues(selectedProjectTypes);
            return `${filter.label}: ${truncated}`;
        }
        if (filter.value === "teacher-participation") {
            if (!teacherYearsValue) return filter.label;
            const op = teacherYearsOperator;
            const opSymbol =
                op === "="
                    ? "="
                    : op === "<"
                      ? "<"
                      : op === ">"
                        ? ">"
                        : op === "between"
                          ? "between"
                          : "";
            if (op === "between" && teacherYearsValue2) {
                return `${filter.label}: ${opSymbol} ${teacherYearsValue}-${teacherYearsValue2}`;
            }
            return `${filter.label}: ${opSymbol} ${teacherYearsValue}`;
        }
        return filter.label;
    };

    return (
        <div className="mb-8 space-y-6">
            {/* Measured As */}
            <div>
                <label
                    htmlFor="measuredAs"
                    className="block text-sm font-semibold mb-2 text-foreground"
                >
                    Measured as
                </label>
                <Combobox
                    options={measuredAsOptions}
                    value={measuredAs}
                    onChange={handleMeasuredAsChange}
                />
            </div>

            {/* Group By */}
            <div>
                <label
                    htmlFor="groupBy"
                    className="block text-sm font-semibold mb-2 text-foreground"
                >
                    Group by
                </label>
                <Combobox
                    options={groupByOptions}
                    value={groupBy}
                    onChange={handleGroupByChange}
                />
            </div>

            {/* Filter By */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <h2 className="text-sm font-semibold text-foreground">
                            Filter by
                        </h2>
                        <Tooltip>
                            <TooltipTrigger>
                                <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                                Filters of the same type are additive
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </div>

                <div className="flex flex-col w-full items-center gap-2">
                    {/* Active Filter Chips */}
                    {selectedFilters.length > 0 &&
                        selectedFilters.map((filter) => {
                            const isSchoolOrCity =
                                filter.value === "school" ||
                                filter.value === "city";
                            const isProjectType =
                                filter.value === "project-type";
                            const isSchoolCityOrProjectType =
                                filter.value === "school" ||
                                filter.value === "city" ||
                                filter.value === "project-type";
                            const isTeacherParticipation =
                                filter.value === "teacher-participation";
                            const displayText = getFilterDisplayText(filter);
                            const chipContent = (
                                <div className="text-sm border rounded-sm px-2 py-2 w-full flex items-center justify-between cursor-pointer hover:bg-muted transition-colors">
                                    <p className="flex-1 text-left">
                                        {displayText}
                                    </p>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 group hover:cursor-pointer hover:scale-105"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleFilterRemove(filter);
                                        }}
                                    >
                                        <X className="h-4 w-4 text-muted-foreground transition-transform duration-150 group-hover:scale-105" />
                                    </Button>
                                </div>
                            );

                            if (isSchoolCityOrProjectType) {
                                return (
                                    <FilterValuePopover
                                        key={filter.value}
                                        filterType={
                                            filter.value as
                                                | "school"
                                                | "city"
                                                | "project-type"
                                        }
                                        options={
                                            filter.value === "school"
                                                ? schools
                                                : filter.value === "city"
                                                  ? cities
                                                  : projectTypes
                                        }
                                        selectedValues={
                                            filter.value === "school"
                                                ? selectedSchools
                                                : filter.value === "city"
                                                  ? selectedCities
                                                  : selectedProjectTypes
                                        }
                                        gatewayCities={
                                            filter.value === "city"
                                                ? gatewayCities
                                                : undefined
                                        }
                                        onFinish={(values) =>
                                            handleFilterValueFinish(
                                                filter.value as
                                                    | "school"
                                                    | "city"
                                                    | "project-type",
                                                values,
                                            )
                                        }
                                        trigger={chipContent}
                                    />
                                );
                            }

                            if (isTeacherParticipation) {
                                const isRangeMode =
                                    teacherYearsOperator === "between";
                                return (
                                    <div
                                        key={filter.value}
                                        className="text-sm border rounded-sm w-full overflow-hidden"
                                    >
                                        {/* Header */}
                                        <div className="px-2 py-2 flex items-center justify-between">
                                            <span className="text-foreground font-medium">
                                                {filter.label}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 group"
                                                onClick={() =>
                                                    handleFilterRemove(filter)
                                                }
                                            >
                                                <X className="h-4 w-4 text-muted-foreground cursor-pointer transition-transform transition-colors duration-150 group-hover:scale-110 group-hover:text-destructive" />
                                            </Button>
                                        </div>

                                        {/* Expanded Content */}
                                        <div className="px-2 pb-2 border-t pt-2 space-y-2">
                                            {isRangeMode ? (
                                                <>
                                                    <Select
                                                        value={
                                                            teacherYearsOperator
                                                        }
                                                        onValueChange={(
                                                            value,
                                                        ) => {
                                                            setTeacherYearsOperator(
                                                                value,
                                                            );
                                                            updateFilters({
                                                                teacherYearsOperator:
                                                                    value,
                                                            });
                                                        }}
                                                    >
                                                        <SelectTrigger className="h-8 text-xs w-full">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="=">
                                                                =
                                                            </SelectItem>
                                                            <SelectItem value="<">
                                                                &lt;
                                                            </SelectItem>
                                                            <SelectItem value=">">
                                                                &gt;
                                                            </SelectItem>
                                                            <SelectItem value="between">
                                                                between
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            value={
                                                                teacherYearsValue
                                                            }
                                                            onChange={(e) => {
                                                                const val =
                                                                    e.target
                                                                        .value;
                                                                setTeacherYearsValue(
                                                                    val,
                                                                );
                                                                updateFilters({
                                                                    teacherYearsValue:
                                                                        val,
                                                                });
                                                            }}
                                                            placeholder="Min"
                                                            className="h-8 text-xs flex-1"
                                                        />
                                                        <span className="text-muted-foreground">
                                                            -
                                                        </span>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            value={
                                                                teacherYearsValue2
                                                            }
                                                            onChange={(e) => {
                                                                const val =
                                                                    e.target
                                                                        .value;
                                                                setTeacherYearsValue2(
                                                                    val,
                                                                );
                                                                updateFilters({
                                                                    teacherYearsValue2:
                                                                        val,
                                                                });
                                                            }}
                                                            placeholder="Max"
                                                            className="h-8 text-xs flex-1"
                                                        />
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <Select
                                                        value={
                                                            teacherYearsOperator
                                                        }
                                                        onValueChange={(
                                                            value,
                                                        ) => {
                                                            setTeacherYearsOperator(
                                                                value,
                                                            );
                                                            updateFilters({
                                                                teacherYearsOperator:
                                                                    value,
                                                            });
                                                        }}
                                                    >
                                                        <SelectTrigger className="h-8 text-xs w-[60px]">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="=">
                                                                =
                                                            </SelectItem>
                                                            <SelectItem value="<">
                                                                &lt;
                                                            </SelectItem>
                                                            <SelectItem value=">">
                                                                &gt;
                                                            </SelectItem>
                                                            <SelectItem value="between">
                                                                between
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        value={
                                                            teacherYearsValue
                                                        }
                                                        onChange={(e) => {
                                                            const val =
                                                                e.target.value;
                                                            setTeacherYearsValue(
                                                                val,
                                                            );
                                                            updateFilters({
                                                                teacherYearsValue:
                                                                    val,
                                                            });
                                                        }}
                                                        placeholder="Number"
                                                        className="h-8 text-xs flex-1"
                                                    />
                                                    <span className="text-muted-foreground text-xs whitespace-nowrap">
                                                        years
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div className="w-full" key={filter.value}>
                                    {chipContent}
                                </div>
                            );
                        })}

                    {/* Add Filter Button with Popover */}
                    {selectedFilters.length !== filterOptions.length && (
                        <AddFilterPopover
                            selectedFilters={selectedFilters}
                            onFilterSelect={handleFilterSelect}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
