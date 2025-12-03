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
import Checkbox from "@/components/Checkbox";

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
                <select
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
                </select>
            </div>

            {/* Group By */}
            <div>
                <label className="block text-sm font-semibold mb-2">
                    Group by:
                </label>
                <select
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
                </select>
            </div>

            {/* Filter By */}
            <div>
                <h2 className="text-sm font-semibold mb-3">Filter by:</h2>
                <div className="space-y-4">
                    {/* Checkboxes */}
                    <Checkbox
                        label="Gateway Cities"
                        onToggle={(_, checked) => {
                            setGatewayCities(checked);
                            updateFilters({ gatewayCities: checked });
                        }}
                    />
                    <Checkbox
                        label="Individual Projects"
                        onToggle={(_, checked) => {
                            setIndividualProjects(checked);
                            updateFilters({ individualProjects: checked });
                        }}
                    />
                    <Checkbox
                        label="Group Projects"
                        onToggle={(_, checked) => {
                            setGroupProjects(checked);
                            updateFilters({ groupProjects: checked });
                        }}
                    />

                    {/* Multiselect schools */}
                    <div>
                        <label className="block text-xs font-medium mb-1">
                            School:
                        </label>
                        <div className="w-full h-24 overflow-y-auto border border-gray-300 rounded-md p-2 bg-white">
                            {schools.map((school) => (
                                <div
                                    key={school}
                                    className="flex items-start py-1"
                                >
                                    <Checkbox
                                        label={school}
                                        onToggle={handleSchoolCheckboxToggle}
                                        isChecked={selectedSchools.includes(
                                            school,
                                        )}
                                    />
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => handleSchoolsChange([])}
                            className="text-xs text-blue-600 hover:underline mt-1"
                        >
                            Clear selection
                        </button>
                    </div>

                    {/* Multiselect cities */}
                    <div>
                        <label className="block text-xs font-medium mb-1">
                            City/Town:
                        </label>
                        <div className="w-full h-24 overflow-y-auto border border-gray-300 rounded-md p-2 bg-white">
                            {cities.map((city) => (
                                <div
                                    key={city}
                                    className="flex items-start py-1"
                                >
                                    <Checkbox
                                        label={city}
                                        onToggle={handleCityCheckboxToggle}
                                        isChecked={selectedCities.includes(
                                            city,
                                        )}
                                    />
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => handleCitiesChange([])}
                            className="text-xs text-blue-600 hover:underline mt-1"
                        >
                            Clear selection
                        </button>
                    </div>

                    {/* Teacher Participation */}
                    <div>
                        <Checkbox
                            label="Filter by Teacher Participation"
                            onToggle={handleTeacherFilterToggle}
                        />
                        <div className="flex gap-2 mt-2 pl-6">
                            <select
                                value={teacherYearsOperator}
                                onChange={(e) =>
                                    handleTeacherYearsOperatorChange(
                                        e.target.value,
                                    )
                                }
                                className="w-16 px-2 py-2 border border-gray-300 rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
                                disabled={!teacherFilterEnabled}
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
                                className="w-24 px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
                                disabled={!teacherFilterEnabled}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
