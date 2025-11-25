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
    const [teacherYearsOperator, setTeacherYearsOperator] = useState("=");
    const [teacherYearsValue, setTeacherYearsValue] = useState("1");

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

    const handleCheckboxToggle = (label: string, checked: boolean) => {
        if (label === "Gateway Cities") {
            setGatewayCities(checked);
            updateFilters({ gatewayCities: checked });
        } else if (label === "Individual Projects") {
            setIndividualProjects(checked);
            updateFilters({ individualProjects: checked });
        } else if (label === "Group Projects") {
            setGroupProjects(checked);
            updateFilters({ groupProjects: checked });
        }
    };

    const handleSchoolsChange = (values: string[]) => {
        setSelectedSchools(values);
        updateFilters({ selectedSchools: values });
    };

    const handleCitiesChange = (values: string[]) => {
        setSelectedCities(values);
        updateFilters({ selectedCities: values });
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
                    className="w-64 px-3 py-2 border border-gray-300 rounded-md"
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
                    className="w-64 px-3 py-2 border border-gray-300 rounded-md"
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
                        onToggle={handleCheckboxToggle}
                    />
                    <Checkbox
                        label="Individual Projects"
                        onToggle={handleCheckboxToggle}
                    />
                    <Checkbox
                        label="Group Projects"
                        onToggle={handleCheckboxToggle}
                    />

                    {/* Multiselect schools */}
                    <div>
                        <label className="block text-xs font-medium mb-1">
                            School:
                        </label>
                        <select
                            multiple
                            value={selectedSchools}
                            onChange={(e) =>
                                handleSchoolsChange(
                                    Array.from(
                                        e.target.selectedOptions,
                                        (option) => option.value,
                                    ),
                                )
                            }
                            className="w-64 px-3 py-2 border border-gray-300 rounded-md"
                            size={3}
                        >
                            {schools.map((school) => (
                                <option key={school} value={school}>
                                    {school}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Multiselect cities */}
                    <div>
                        <label className="block text-xs font-medium mb-1">
                            City/Town:
                        </label>
                        <select
                            multiple
                            value={selectedCities}
                            onChange={(e) =>
                                handleCitiesChange(
                                    Array.from(
                                        e.target.selectedOptions,
                                        (option) => option.value,
                                    ),
                                )
                            }
                            className="w-64 px-3 py-2 border border-gray-300 rounded-md"
                            size={3}
                        >
                            {cities.map((city) => (
                                <option key={city} value={city}>
                                    {city}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Teacher Participation */}
                    <div>
                        <label className="block text-xs font-medium mb-1">
                            Teacher # participation years:
                        </label>
                        <div className="flex gap-2">
                            <select
                                value={teacherYearsOperator}
                                onChange={(e) =>
                                    handleTeacherYearsOperatorChange(
                                        e.target.value,
                                    )
                                }
                                className="w-16 px-2 py-2 border border-gray-300 rounded-md"
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
                                className="w-24 px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
