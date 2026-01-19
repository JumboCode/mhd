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

// TO DO: Eliminate invalid options/combinations based on filters

"use client";

import { useState } from "react";
import { Combobox } from "@/components/Combobox";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/Checkbox";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { AddFilterPopover } from "./AddFilterPopover";
import { Info, X } from "lucide-react";
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
    gatewayCities: boolean;
    individualProjects: boolean;
    groupProjects: boolean;
    selectedSchools: string[];
    selectedCities: string[];
    teacherYearsOperator: string;
    teacherYearsValue: string;
};

type GraphFiltersProps = {
    schools: string[];
    cities: string[];
    onFiltersChange: (filters: Filters) => void;
};

export default function GraphFilters({
    schools,
    cities,
    onFiltersChange,
}: GraphFiltersProps) {
    const [measuredAs, setMeasuredAs] = useState("total-school-count");
    const [groupBy, setGroupBy] = useState("region");
    const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
    const [selectedCities, setSelectedCities] = useState<string[]>([]);
    const [teacherYearsOperator, setTeacherYearsOperator] = useState("=");
    const [teacherYearsValue, setTeacherYearsValue] = useState("");
    const [openAccordionItems, setOpenAccordionItems] = useState<string[]>([]);
    const [selectedFilters, setSelectedFilters] = useState<Filter[]>([]);

    const updateFilters = (updates: Partial<Filters>) => {
        const newFilters: Filters = {
            measuredAs,
            groupBy,
            gatewayCities,
            individualProjects,
            groupProjects,
            selectedSchools,
            selectedCities,
            teacherYearsOperator,
            teacherYearsValue,
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

    const handleTeacherFilterToggle = (label: string, checked: boolean) => {
        setTeacherFilterEnabled(checked);
        if (checked) {
            // When enabling, set a default value if it's empty
            const newValue = teacherYearsValue || "1";
            setTeacherYearsValue(newValue);
            updateFilters({ teacherYearsValue: newValue });
        } else {
            // When disabling, clear the value to mark it as inactive
            setTeacherYearsValue("");
            updateFilters({ teacherYearsValue: "" });
        }
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
    };

    const handleFilterRemove = (value: Filter) => {
        setSelectedFilters((prev) =>
            prev.filter((f) => f.value !== value.value),
        );
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
                        selectedFilters.map((filter) => (
                            <div
                                className="text-sm border rounded-sm px-2 py-2 w-full flex items-center justify-between"
                                key={filter.value}
                            >
                                <p key={filter.value} onClick={() => {}}>
                                    {filter.label}
                                </p>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => handleFilterRemove(filter)}
                                >
                                    <X className="h-4 w-4 text-muted-foreground text cursor-pointer" />
                                </Button>
                            </div>
                        ))}

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
