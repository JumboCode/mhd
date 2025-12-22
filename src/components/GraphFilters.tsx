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

import { Checkbox } from "@/components/Checkbox";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

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
    const [gatewayCities, setGatewayCities] = useState(false);
    const [individualProjects, setIndividualProjects] = useState(false);
    const [groupProjects, setGroupProjects] = useState(false);
    const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
    const [selectedCities, setSelectedCities] = useState<string[]>([]);
    const [teacherFilterEnabled, setTeacherFilterEnabled] = useState(false);
    const [teacherYearsOperator, setTeacherYearsOperator] = useState("=");
    const [teacherYearsValue, setTeacherYearsValue] = useState("");
    const [openAccordionItems, setOpenAccordionItems] = useState<string[]>([]);
    const [showAllFilters, setShowAllFilters] = useState(false);

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

    // Get active filters for display as chips
    const getActiveFilters = () => {
        const active: Array<{
            key: string;
            label: string;
            accordionValue: string;
        }> = [];

        if (gatewayCities) {
            active.push({
                key: "gateway-cities",
                label: "Gateway Cities",
                accordionValue: "gateway-cities",
            });
        }
        if (selectedSchools.length > 0) {
            active.push({
                key: "schools",
                label: `Schools (${selectedSchools.length})`,
                accordionValue: "school",
            });
        }
        if (selectedCities.length > 0) {
            active.push({
                key: "cities",
                label: `Cities (${selectedCities.length})`,
                accordionValue: "city",
            });
        }
        if (individualProjects || groupProjects) {
            active.push({
                key: "project-type",
                label: "Project Type",
                accordionValue: "project-type",
            });
        }
        if (teacherFilterEnabled) {
            active.push({
                key: "teacher",
                label: "Teacher Participation",
                accordionValue: "teacher-participation",
            });
        }

        return active;
    };

    const activeFilters = getActiveFilters();

    // Determine which accordion items should be visible
    const shouldShowAccordionItem = (itemValue: string) => {
        // Show all filters if user clicked "+ Add Filter"
        if (showAllFilters) return true;

        // Show if the filter is active
        if (itemValue === "gateway-cities" && gatewayCities) return true;
        if (itemValue === "school" && selectedSchools.length > 0) return true;
        if (itemValue === "city" && selectedCities.length > 0) return true;
        if (
            itemValue === "project-type" &&
            (individualProjects || groupProjects)
        )
            return true;
        if (itemValue === "teacher-participation" && teacherFilterEnabled)
            return true;

        return false;
    };

    // Helper to check if a filter is active
    const isFilterActive = (itemValue: string) => {
        if (itemValue === "gateway-cities" && gatewayCities) return true;
        if (itemValue === "school" && selectedSchools.length > 0) return true;
        if (itemValue === "city" && selectedCities.length > 0) return true;
        if (
            itemValue === "project-type" &&
            (individualProjects || groupProjects)
        )
            return true;
        if (itemValue === "teacher-participation" && teacherFilterEnabled)
            return true;
        return false;
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
                <h2
                    id="filterBy"
                    className="text-sm font-semibold mb-3 text-foreground"
                >
                    Filter by
                </h2>

                {/* Active Filter Chips */}
                {activeFilters.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                        {activeFilters.map((filter) => (
                            <div
                                key={filter.key}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-muted border border-border rounded-md text-sm cursor-pointer hover:bg-accent"
                                onClick={() => {
                                    // Open the corresponding accordion item
                                    if (
                                        !openAccordionItems.includes(
                                            filter.accordionValue,
                                        )
                                    ) {
                                        setOpenAccordionItems([
                                            ...openAccordionItems,
                                            filter.accordionValue,
                                        ]);
                                    }
                                }}
                            >
                                {filter.label}
                            </div>
                        ))}
                    </div>
                )}

                {/* Add Filter Button */}
                <button
                    type="button"
                    className="flex items-center gap-1 text-sm text-foreground hover:text-foreground mb-4"
                    onClick={() => {
                        if (showAllFilters) {
                            // Hide all non-active filters
                            setShowAllFilters(false);
                            // Close all accordion items except active ones
                            const activeItems = [
                                "gateway-cities",
                                "school",
                                "city",
                                "project-type",
                                "teacher-participation",
                            ].filter((item) => isFilterActive(item));
                            setOpenAccordionItems(activeItems);
                        } else {
                            // Show all filters (but closed)
                            setShowAllFilters(true);
                            setOpenAccordionItems([]);
                        }
                    }}
                >
                    <span className="text-lg font-light">
                        {showAllFilters ? "−" : "+"}
                    </span>
                    {showAllFilters ? "Hide Filters" : "Add Filter"}
                </button>

                <Accordion
                    type="multiple"
                    className="w-full"
                    value={openAccordionItems}
                    onValueChange={setOpenAccordionItems}
                >
                    {/* Gateway Cities */}
                    {shouldShowAccordionItem("gateway-cities") && (
                        <AccordionItem value="gateway-cities">
                            <AccordionTrigger>Gateway Cities</AccordionTrigger>
                            <AccordionContent>
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="gateway-cities-checkbox"
                                        checked={gatewayCities}
                                        onCheckedChange={(checked) => {
                                            const isChecked = checked === true;
                                            setGatewayCities(isChecked);
                                            updateFilters({
                                                gatewayCities: isChecked,
                                            });
                                        }}
                                    />
                                    <label
                                        htmlFor="gateway-cities-checkbox"
                                        className="text-sm cursor-pointer"
                                    >
                                        Gateway Cities
                                    </label>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    )}

                    {/* School Filter */}
                    {shouldShowAccordionItem("school") && (
                        <AccordionItem value="school">
                            <AccordionTrigger>School</AccordionTrigger>
                            <AccordionContent>
                                <div className="max-h-40 overflow-y-auto space-y-1 border rounded-md p-2">
                                    {schools.map((school) => (
                                        <div
                                            key={school}
                                            className="flex items-center gap-2"
                                        >
                                            <Checkbox
                                                id={`school-checkbox-${school}`}
                                                checked={selectedSchools.includes(
                                                    school,
                                                )}
                                                onCheckedChange={(checked) => {
                                                    const isChecked =
                                                        checked === true;
                                                    handleSchoolCheckboxToggle(
                                                        school,
                                                        isChecked,
                                                    );
                                                }}
                                            />
                                            <label
                                                htmlFor={`school-checkbox-${school}`}
                                                className="text-sm cursor-pointer"
                                            >
                                                {school}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => handleSchoolsChange([])}
                                    className="mt-2 text-xs text-primary"
                                >
                                    Clear selection
                                </button>
                            </AccordionContent>
                        </AccordionItem>
                    )}

                    {/* City Filter */}
                    {shouldShowAccordionItem("city") && (
                        <AccordionItem value="city">
                            <AccordionTrigger>City</AccordionTrigger>
                            <AccordionContent>
                                <div className="max-h-40 overflow-y-auto space-y-1 border rounded-md p-2">
                                    {cities.map((city) => (
                                        <div
                                            key={city}
                                            className="flex items-center gap-2"
                                        >
                                            <Checkbox
                                                id={`city-checkbox-${city}`}
                                                checked={selectedCities.includes(
                                                    city,
                                                )}
                                                onCheckedChange={(checked) => {
                                                    const isChecked =
                                                        checked === true;
                                                    handleCityCheckboxToggle(
                                                        city,
                                                        isChecked,
                                                    );
                                                }}
                                            />
                                            <label
                                                htmlFor={`city-checkbox-${city}`}
                                                className="text-sm cursor-pointer"
                                            >
                                                {city}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => handleCitiesChange([])}
                                    className="mt-2 text-xs text-primary"
                                >
                                    Clear selection
                                </button>
                            </AccordionContent>
                        </AccordionItem>
                    )}

                    {/* Project Type */}
                    {shouldShowAccordionItem("project-type") && (
                        <AccordionItem value="project-type">
                            <AccordionTrigger>Project Type</AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="individual-projects-checkbox"
                                            checked={individualProjects}
                                            onCheckedChange={(checked) => {
                                                const isChecked =
                                                    checked === true;
                                                setIndividualProjects(
                                                    isChecked,
                                                );
                                                updateFilters({
                                                    individualProjects:
                                                        isChecked,
                                                });
                                            }}
                                        />
                                        <label
                                            htmlFor="individual-projects-checkbox"
                                            className="text-sm cursor-pointer"
                                        >
                                            Individual Projects
                                        </label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="group-projects-checkbox"
                                            checked={groupProjects}
                                            onCheckedChange={(checked) => {
                                                const isChecked =
                                                    checked === true;
                                                setGroupProjects(isChecked);
                                                updateFilters({
                                                    groupProjects: isChecked,
                                                });
                                            }}
                                        />
                                        <label
                                            htmlFor="group-projects-checkbox"
                                            className="text-sm cursor-pointer"
                                        >
                                            Group Projects
                                        </label>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    )}

                    {/* Teacher Participation */}
                    {shouldShowAccordionItem("teacher-participation") && (
                        <AccordionItem value="teacher-participation">
                            <AccordionTrigger>
                                Teacher Participation
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="teacher-filter-checkbox"
                                        onCheckedChange={(checked) =>
                                            handleTeacherFilterToggle(
                                                "Enable Teacher Participation Filter",
                                                checked === true,
                                            )
                                        }
                                        checked={teacherFilterEnabled}
                                    />
                                    <label
                                        htmlFor="teacher-filter-checkbox"
                                        className="text-sm cursor-pointer"
                                    >
                                        Enable Teacher Participation Filter
                                    </label>
                                </div>

                                <div className="flex gap-2 mt-4">
                                    <select
                                        value={teacherYearsOperator}
                                        onChange={(e) =>
                                            handleTeacherYearsOperatorChange(
                                                e.target.value,
                                            )
                                        }
                                        disabled={!teacherFilterEnabled}
                                        className="border px-2 py-1 rounded-md w-16"
                                    >
                                        <option value="<">&lt;</option>
                                        <option value="=">=</option>
                                        <option value=">">&gt;</option>
                                    </select>

                                    <input
                                        type="number"
                                        min="1"
                                        value={teacherYearsValue}
                                        onChange={(e) =>
                                            handleTeacherYearsValueChange(
                                                e.target.value,
                                            )
                                        }
                                        disabled={!teacherFilterEnabled}
                                        className="border px-2 py-1 rounded-md w-20"
                                    />
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    )}
                </Accordion>
            </div>
        </div>
    );
}
