/***************************************************************
 *
 *                FilterPanel.tsx
 *
 *         Author: Elki & Zander
 *           Date: 11/24/2025
 *
 *        Summary: temp filter panel for line/bar graph pages
 *
 **************************************************************/

"use client";

import { useState } from "react";
import Checkbox from "@/components/NewCheckbox";
import { Combobox } from "@/components/Combobox";

const measuredAsOptions = [
    { value: "total-count", label: "Total Count" },
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

import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
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

type FilterPanelProps = {
    schools: string[];
    cities: string[];
    onFiltersChange: (filters: Filters) => void;
};

export default function FilterPanel({
    schools,
    cities,
    onFiltersChange,
}: FilterPanelProps) {
    const [measuredAs, setMeasuredAs] = useState("total-count");
    const [groupBy, setGroupBy] = useState("region");
    const [gatewayCities, setGatewayCities] = useState(false);
    const [individualProjects, setIndividualProjects] = useState(false);
    const [groupProjects, setGroupProjects] = useState(false);
    const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
    const [selectedCities, setSelectedCities] = useState<string[]>([]);
    const [teacherFilterEnabled, setTeacherFilterEnabled] = useState(false);
    const [teacherYearsOperator, setTeacherYearsOperator] = useState("=");
    const [teacherYearsValue, setTeacherYearsValue] = useState("");

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

    return (
        <div className="mb-8 space-y-6">
            {/* Measured As */}
            <div>
                <label className="block text-sm font-semibold mb-2">
                    Measured as (y-axis):
                </label>
                <Combobox
                    options={measuredAsOptions}
                    value={measuredAs}
                    onChange={handleMeasuredAsChange}
                />
                {/* <select
                    value={measuredAs}
                    onChange={(e) => handleMeasuredAsChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                    <option value="total-count">Total Count</option>
                    <option value="total-student-count">
                        Total Student Count
                    </option>
                    <option value="total-city-count">Total City Count</option>
                    <option value="total-project-count">
                        Total Project Count
                    </option>
                    <option value="total-teacher-count">
                        Total Teacher Count
                    </option>
                    <option value="school-return-rate">
                        School Return Rate
                    </option>
                </select> */}
            </div>

            {/* Group By */}
            <div>
                <label className="block text-sm font-semibold mb-2">
                    Group by:
                </label>
                <Combobox
                    options={groupByOptions}
                    value={groupBy}
                    onChange={handleGroupByChange}
                />
                {/* <select
                    value={groupBy}
                    onChange={(e) => handleGroupByChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                    <option value="region">Region</option>
                    <option value="school-type">School Type</option>
                    <option value="division">Division (Junior/Senior)</option>
                    <option value="implementation-type">
                        Implementation Type
                    </option>
                    <option value="project-type">Project Type</option>
                </select> */}
            </div>

            {/* Filter By */}
            <div>
                <h2 className="text-sm font-semibold mb-3">
                    Filter by (additive filters):
                </h2>

                <Accordion type="multiple" className="w-full">
                    {/* Gateway Cities */}
                    <AccordionItem value="gateway-cities">
                        <AccordionTrigger>Gateway Cities</AccordionTrigger>
                        <AccordionContent>
                            <Checkbox
                                label="Gateway Cities"
                                isChecked={gatewayCities}
                                onToggle={(_, checked) => {
                                    setGatewayCities(checked);
                                    updateFilters({ gatewayCities: checked });
                                }}
                            />
                        </AccordionContent>
                    </AccordionItem>

                    {/* School Filter */}
                    <AccordionItem value="school">
                        <AccordionTrigger>School</AccordionTrigger>
                        <AccordionContent>
                            <div className="max-h-40 overflow-y-auto space-y-1 border rounded-md p-2">
                                {schools.map((school) => (
                                    <Checkbox
                                        key={school}
                                        label={school}
                                        isChecked={selectedSchools.includes(
                                            school,
                                        )}
                                        onToggle={handleSchoolCheckboxToggle}
                                    />
                                ))}
                            </div>
                            <button
                                onClick={() => handleSchoolsChange([])}
                                className="mt-2 text-xs text-blue-600"
                            >
                                Clear selection
                            </button>
                        </AccordionContent>
                    </AccordionItem>

                    {/* City Filter */}
                    <AccordionItem value="city">
                        <AccordionTrigger>City</AccordionTrigger>
                        <AccordionContent>
                            <div className="max-h-40 overflow-y-auto space-y-1 border rounded-md p-2">
                                {cities.map((city) => (
                                    <Checkbox
                                        key={city}
                                        label={city}
                                        isChecked={selectedCities.includes(
                                            city,
                                        )}
                                        onToggle={handleCityCheckboxToggle}
                                    />
                                ))}
                            </div>
                            <button
                                onClick={() => handleCitiesChange([])}
                                className="mt-2 text-xs text-blue-600"
                            >
                                Clear selection
                            </button>
                        </AccordionContent>
                    </AccordionItem>

                    {/* Project Type */}
                    <AccordionItem value="project-type">
                        <AccordionTrigger>Project Type</AccordionTrigger>
                        <AccordionContent>
                            <Checkbox
                                label="Individual Projects"
                                isChecked={individualProjects}
                                onToggle={(_, checked) => {
                                    setIndividualProjects(checked);
                                    updateFilters({
                                        individualProjects: checked,
                                    });
                                }}
                            />
                            <Checkbox
                                label="Group Projects"
                                isChecked={groupProjects}
                                onToggle={(_, checked) => {
                                    setGroupProjects(checked);
                                    updateFilters({ groupProjects: checked });
                                }}
                            />
                        </AccordionContent>
                    </AccordionItem>

                    {/* Teacher Participation */}
                    <AccordionItem value="teacher-participation">
                        <AccordionTrigger>
                            Teacher Participation
                        </AccordionTrigger>
                        <AccordionContent>
                            <Checkbox
                                label="Enable Teacher Participation Filter"
                                onToggle={handleTeacherFilterToggle}
                                isChecked={teacherFilterEnabled}
                            />

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
                </Accordion>
            </div>
        </div>
    );
}
