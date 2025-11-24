"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { d3BarChart } from "./chart";
import { Check, ChevronsUpDown } from "lucide-react";
import { projects, teachers } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

// import { NextRequest, NextResponse } from "next/server";
// import { pgTable, integer, text, serial, boolean } from "drizzle-orm/pg-core";
// import { db } from "@/lib/db";
// import {
//     students,
//     schools,
//     teachers,
//     projects,
//     yearlyTeacherParticipation,
//     yearlySchoolParticipation,
// } from "@/lib/schema";

const measuredAs = [
    {
        value: "total_number_of_schools",
        label: "Total Number of Schools",
    },
    {
        value: "total_student_of_schools",
        label: "Total Student Count",
    },
    {
        value: "total_city_count",
        label: "Total City Count",
    },
    {
        value: "total_project_count",
        label: "Total Project Count",
    },
    {
        value: "total_teacher_count",
        label: "Total Teacher Count",
    },
    {
        value: "school_return_rate",
        label: "School Return Rate",
    },
];

const groupBy = [
    {
        value: "region",
        label: "Region",
    },
    {
        value: "school_type",
        label: "School Type",
    },
    {
        value: "division",
        label: "Division",
    },
    {
        value: "implementation_type",
        label: "Implementation Type",
    },
    {
        value: "project_type",
        label: "Project Type",
    },
];

const filterBy = [
    {
        value: "gateway_cities",
        label: "Gateway Cities",
    },
    {
        value: "school",
        label: "School",
    },
    {
        value: "city",
        label: "City",
    },
    {
        value: "region",
        label: "Region",
    },
    {
        value: "ind_or_group_proj",
        label: "Individual or Group Project",
    },
    {
        value: "project_type",
        label: "Project Type",
    },
    {
        value: "teacher_participation_years",
        label: "Teacher # Participation Years",
    },
];

export default function Bargraph() {
    const [entity, setEntity] = useState<"School" | "Project">("School");
    const svgRef = useRef<SVGSVGElement | null>(null);
    const [data, setData] = useState<{ category: string; value: number }[]>([]);

    // combobox functions
    const [measure, setMeasure] = useState("Total Count");
    const [openMeasure, setOpenMeasure] = React.useState(false);
    const [group, setGroup] = useState("Category");
    const [openGroup, setOpenGroup] = React.useState(false);
    const [filter, setFilter] = useState("Category");
    const [openFilter, setOpenFilter] = React.useState(false);
    // const [value, setValue] = React.useState("")

    const handleMeasureSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        // const measureSelected = e.target.value ? e.target.value : null;
        setMeasure(e.target.value);
        // onMeasureChange?.(measureSelected);
    };

    const handleGroupSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        // const measureSelected = e.target.value ? e.target.value : null;
        setGroup(e.target.value);
        // onMeasureChange?.(measureSelected);
    };

    const handleFilterSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        // const measureSelected = e.target.value ? e.target.value : null;
        setFilter(e.target.value);
        // onMeasureChange?.(measureSelected);
    };

    // type MeasureDropdownProps = {
    //     selectedMeasure?: number | null;
    //     onMeasureChange?: (year: number | null) => void;
    // };

    // useEffect(() => {
    //     // Declare the chart dimensions and margins.
    //     const width = 928;
    //     const height = 500;
    //     const marginTop = 30;
    //     const marginRight = 0;
    //     const marginBottom = 30;
    //     const marginLeft = 40;

    //     // Declare the x (horizontal position) scale.
    //     const x = d3.scaleBand()
    //         .domain(d3.groupSort(data, ([d]) => -d.frequency, (d) => d.letter)) // descending frequency
    //         .range([marginLeft, width - marginRight])
    //         .padding(0.1);

    //     // Declare the y (vertical position) scale.
    //     const y = d3.scaleLinear()
    //         .domain([0, d3.max(data, (d) => d.frequency)])
    //         .range([height - marginBottom, marginTop]);

    //     // Create the SVG container.
    //     const svg = d3.create("svg")
    //         .attr("width", width)
    //         .attr("height", height)
    //         .attr("viewBox", [0, 0, width, height])
    //         .attr("style", "max-width: 100%; height: auto;");

    //     // Add a rect for each bar.
    //     svg.append("g")
    //         .attr("fill", "steelblue")
    //         .selectAll()
    //         .data(data)
    //         .join("rect")
    //         .attr("x", (d) => x(d.letter))
    //         .attr("y", (d) => y(d.frequency))
    //         .attr("height", (d) => y(0) - y(d.frequency))
    //         .attr("width", x.bandwidth());

    //     // Add the x-axis and label.
    //     svg.append("g")
    //         .attr("transform", `translate(0,${height - marginBottom})`)
    //         .call(d3.axisBottom(x).tickSizeOuter(0));

    //     // Add the y-axis and label, and remove the domain line.
    //     svg.append("g")
    //         .attr("transform", `translate(${marginLeft},0)`)
    //         .call(d3.axisLeft(y).tickFormat((y) => (y * 100).toFixed()))
    //         .call(g => g.select(".domain").remove())
    //         .call(g => g.append("text")
    //             .attr("x", -marginLeft)
    //             .attr("y", 10)
    //             .attr("fill", "currentColor")
    //             .attr("text-anchor", "start")
    //             .text("↑ Frequency (%)"));

    //     // Return the SVG element.
    //     // return svg.node();
    // }, [entity]);

    return (
        <div>
            <h2>Entities</h2>
            <div className="flex gap-4 mb-4">
                <button
                    onClick={() => setEntity("School")}
                    className={`px-3 py-1 rounded ${entity === "School" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                >
                    School
                </button>
                <button
                    onClick={() => setEntity("Project")}
                    className={`px-3 py-1 rounded ${entity === "Project" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                >
                    Project
                </button>
            </div>
            <h2>Measured As</h2>
            <Popover open={openMeasure} onOpenChange={setOpenMeasure}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openMeasure}
                        className="w-[200px] justify-between"
                    >
                        {measure
                            ? measuredAs.find(
                                  (measuredAs) => measuredAs.value === measure,
                              )?.label
                            : "Total Count"}
                        <ChevronsUpDown className="opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                    <Command>
                        <CommandInput
                            placeholder="Search measure..."
                            className="h-9"
                        />
                        <CommandList>
                            <CommandEmpty>No measure found.</CommandEmpty>
                            <CommandGroup>
                                {measuredAs.map((measuredAs) => (
                                    <CommandItem
                                        key={measuredAs.value}
                                        value={measuredAs.value}
                                        onSelect={(currentValue) => {
                                            setMeasure(
                                                currentValue === measure
                                                    ? ""
                                                    : currentValue,
                                            );
                                            setOpenMeasure(false);
                                        }}
                                    >
                                        {measuredAs.label}
                                        <Check
                                            className={cn(
                                                "ml-auto",
                                                measure === measuredAs.value
                                                    ? "opacity-100"
                                                    : "opacity-0",
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            <h2>Group By</h2>
            <Popover open={openGroup} onOpenChange={setOpenGroup}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openGroup}
                        className="w-[200px] justify-between"
                    >
                        {group
                            ? groupBy.find((groupBy) => groupBy.value === group)
                                  ?.label
                            : "Category"}
                        <ChevronsUpDown className="opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                    <Command>
                        <CommandInput
                            placeholder="Search groups..."
                            className="h-9"
                        />
                        <CommandList>
                            <CommandEmpty>No group found.</CommandEmpty>
                            <CommandGroup>
                                {groupBy.map((groupBy) => (
                                    <CommandItem
                                        key={groupBy.value}
                                        value={groupBy.value}
                                        onSelect={(currentValue) => {
                                            setGroup(
                                                currentValue === group
                                                    ? ""
                                                    : currentValue,
                                            );
                                            setOpenGroup(false);
                                        }}
                                    >
                                        {groupBy.label}
                                        <Check
                                            className={cn(
                                                "ml-auto",
                                                group === groupBy.value
                                                    ? "opacity-100"
                                                    : "opacity-0",
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            <h2>Filter By</h2>
            <Popover open={openFilter} onOpenChange={setOpenFilter}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openFilter}
                        className="w-[200px] justify-between"
                    >
                        {filter
                            ? filterBy.find(
                                  (filterBy) => filterBy.value === filter,
                              )?.label
                            : "Category"}
                        <ChevronsUpDown className="opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                    <Command>
                        <CommandInput
                            placeholder="Search filter..."
                            className="h-9"
                        />
                        <CommandList>
                            <CommandEmpty>No filter found.</CommandEmpty>
                            <CommandGroup>
                                {filterBy.map((filterBy) => (
                                    <CommandItem
                                        key={filterBy.value}
                                        value={filterBy.value}
                                        onSelect={(currentValue) => {
                                            setFilter(
                                                currentValue === filter
                                                    ? ""
                                                    : currentValue,
                                            );
                                            setOpenFilter(false);
                                        }}
                                    >
                                        {filterBy.label}
                                        <Check
                                            className={cn(
                                                "ml-auto",
                                                filter === filterBy.value
                                                    ? "opacity-100"
                                                    : "opacity-0",
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            {/* <svg ref={svgRef} width={928} height={500}></svg> */}
        </div>
    );
}

// Measured as (y-axis):
// Total Count: the total number of schools
// Total Student Count: the total number of students
// Total City Count
// Total project count
// Total teacher count
// School return rate

// Group by (category / group):
// Region
// School type
// Division (junior or senior)
// Implementation type
// Project type

// Filter by (additive filters):
// Gateway cities: checkbox
// School: multiselect
// City: multiselect
// Region: multiselect
// Individual or group project?
// Project type
// Teacher # participation years (<,>,=)
