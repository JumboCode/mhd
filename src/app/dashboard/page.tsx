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
    // {
    //     value: "region",
    //     label: "Region",
    // },
    // {
    //     value: "school_type",
    //     label: "School Type",
    // },
    {
        value: "division",
        label: "Division",
    },
    // {
    //     value: "implementation_type",
    //     label: "Implementation Type",
    // },
    {
        value: "project_type",
        label: "Project Type",
    },
];

const filterBy = [
    // {
    //     value: "gateway_cities",
    //     label: "Gateway Cities",
    // },
    {
        value: "school",
        label: "School",
    },
    {
        value: "city",
        label: "City",
    },
    // {
    //     value: "region",
    //     label: "Region",
    // },
    {
        value: "group",
        label: "Individual or Group Project",
    },
    {
        // is project type the same category?
        value: "category",
        label: "Project Type",
    },
    // {
    //     value: "teacher_participation_years",
    //     label: "Teacher # Participation Years",
    // },
];

export default function Bargraph() {
    const svgRef = useRef<SVGSVGElement | null>(null);

    // saves data from database
    const [data, setData] = useState<{ category: string; value: number }[]>([]);

    // combobox functions
    const [measure, setMeasure] = useState("");
    const [openMeasure, setOpenMeasure] = React.useState(false);
    const [group, setGroup] = useState("");
    const [openGroup, setOpenGroup] = React.useState(false);
    const [filter, setFilter] = useState("");
    const [openFilter, setOpenFilter] = React.useState(false);

    const [filterValue, setFilterValue] = useState("");
    const [openFilterValue, setOpenFilterValue] = useState(false);
    const [filterOptions, setFilterOptions] = useState<
        { value: string; label: string }[]
    >([]);
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

    useEffect(() => {
        async function fetchFilterOptions() {
            if (!filter) {
                setFilterOptions([]);
                setFilterValue("");
                return;
            }

            const response = await fetch(`/api/filter-options?type=${filter}`);
            const json = await response.json();
            setFilterOptions(json);
        }
        fetchFilterOptions();
    }, [filter]);

    // fetch datafrom database whenever filters are changed
    useEffect(() => {
        async function fetchData() {
            const response = await fetch("/api/bargraph", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    measure,
                    group,
                    filter,
                    filterValue,
                }),
            });
            const json = await response.json();
            setData(json);
        }
        fetchData();
    }, [measure, group, filter, filterValue]);

    // Render D3 bar chart
    useEffect(() => {
        console.log("making graph");
        if (!data.length) return;
        const svg = d3.select(svgRef.current);
        const width = 600;
        const height = 400;
        svg.selectAll("*").remove();

        const x = d3
            .scaleBand()
            .domain(data.map((d) => d.category))
            .range([0, width])
            .padding(0.1);
        const y = d3
            .scaleLinear()
            .domain([0, d3.max(data, (d) => d.value)!])
            .range([height, 0]);
        console.log(x);
        console.log(y);
        svg.append("g")
            .selectAll("rect")
            .data(data)
            .join("rect")
            .attr("x", (d) => x(d.category)!)
            .attr("y", (d) => y(d.value))
            .attr("width", x.bandwidth())
            .attr("height", (d) => height - y(d.value))
            .attr("fill", "steelblue");

        svg.append("g").call(d3.axisLeft(y));
        svg.append("g")
            .call(d3.axisBottom(x))
            .attr("transform", `translate(0,${height})`);
    }, [data]);

    return (
        <div>
            <div className="flex min-h screen">
                <div className="w-1/4 h-screen bg-[#FCFCFC] p-6 shadow-md">
                    {/* <h2>Entities</h2>
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
                </div> */}
                    <div className="flex flex-col gap-[50px] mb-4">
                        <div className="flex flex-col gap-[5px]">
                            <h2>Measured As</h2>
                            <Popover
                                open={openMeasure}
                                onOpenChange={setOpenMeasure}
                            >
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openMeasure}
                                        className="w-[200px] justify-between"
                                    >
                                        {measure
                                            ? measuredAs.find(
                                                  (measuredAs) =>
                                                      measuredAs.value ===
                                                      measure,
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
                                            <CommandEmpty>
                                                No measure found.
                                            </CommandEmpty>
                                            <CommandGroup>
                                                {measuredAs.map(
                                                    (measuredAs) => (
                                                        <CommandItem
                                                            key={
                                                                measuredAs.value
                                                            }
                                                            value={
                                                                measuredAs.value
                                                            }
                                                            onSelect={(
                                                                currentValue,
                                                            ) => {
                                                                setMeasure(
                                                                    currentValue ===
                                                                        measure
                                                                        ? ""
                                                                        : currentValue,
                                                                );
                                                                setOpenMeasure(
                                                                    false,
                                                                );
                                                            }}
                                                        >
                                                            {measuredAs.label}
                                                            <Check
                                                                className={cn(
                                                                    "ml-auto",
                                                                    measure ===
                                                                        measuredAs.value
                                                                        ? "opacity-100"
                                                                        : "opacity-0",
                                                                )}
                                                            />
                                                        </CommandItem>
                                                    ),
                                                )}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="flex flex-col gap-[5px]">
                            <h2>Group By</h2>
                            <Popover
                                open={openGroup}
                                onOpenChange={setOpenGroup}
                            >
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openGroup}
                                        className="w-[200px] justify-between"
                                    >
                                        {group
                                            ? groupBy.find(
                                                  (groupBy) =>
                                                      groupBy.value === group,
                                              )?.label
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
                                            <CommandEmpty>
                                                No group found.
                                            </CommandEmpty>
                                            <CommandGroup>
                                                {groupBy.map((groupBy) => (
                                                    <CommandItem
                                                        key={groupBy.value}
                                                        value={groupBy.value}
                                                        onSelect={(
                                                            currentValue,
                                                        ) => {
                                                            setGroup(
                                                                currentValue ===
                                                                    group
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
                                                                group ===
                                                                    groupBy.value
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
                        </div>
                        <div className="flex flex-col gap-[5px]">
                            <h2>Filter By</h2>
                            <Popover
                                open={openFilter}
                                onOpenChange={setOpenFilter}
                            >
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openFilter}
                                        className="w-[200px] justify-between"
                                    >
                                        {filter
                                            ? filterBy.find(
                                                  (filterBy) =>
                                                      filterBy.value === filter,
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
                                            <CommandEmpty>
                                                No filter found.
                                            </CommandEmpty>
                                            <CommandGroup>
                                                {filterBy.map((filterBy) => (
                                                    <CommandItem
                                                        key={filterBy.value}
                                                        value={filterBy.value}
                                                        onSelect={(
                                                            currentValue,
                                                        ) => {
                                                            setFilter(
                                                                currentValue ===
                                                                    filter
                                                                    ? ""
                                                                    : currentValue,
                                                            );
                                                            setOpenFilter(
                                                                false,
                                                            );
                                                        }}
                                                    >
                                                        {filterBy.label}
                                                        <Check
                                                            className={cn(
                                                                "ml-auto",
                                                                filter ===
                                                                    filterBy.value
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
                        </div>
                        {filter && (
                            <div className="flex flex-col gap-[5px]">
                                <h2>
                                    Select{" "}
                                    {
                                        filterBy.find((f) => f.value === filter)
                                            ?.label
                                    }
                                </h2>
                                <Popover
                                    open={openFilterValue}
                                    onOpenChange={setOpenFilterValue}
                                >
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={openFilterValue}
                                            className="w-[200px] justify-between"
                                        >
                                            {filterValue
                                                ? filterOptions.find(
                                                      (option) =>
                                                          option.value ===
                                                          filterValue,
                                                  )?.label
                                                : "Select..."}
                                            <ChevronsUpDown className="opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[200px] p-0">
                                        <Command>
                                            <CommandInput
                                                placeholder="Search..."
                                                className="h-9"
                                            />
                                            <CommandList>
                                                <CommandEmpty>
                                                    No options found.
                                                </CommandEmpty>
                                                <CommandGroup>
                                                    {filterOptions.map(
                                                        (option) => (
                                                            <CommandItem
                                                                key={
                                                                    option.value
                                                                }
                                                                value={
                                                                    option.value
                                                                }
                                                                onSelect={(
                                                                    currentValue,
                                                                ) => {
                                                                    setFilterValue(
                                                                        currentValue ===
                                                                            filterValue
                                                                            ? ""
                                                                            : currentValue,
                                                                    );
                                                                    setOpenFilterValue(
                                                                        false,
                                                                    );
                                                                }}
                                                            >
                                                                {option.label}
                                                                <Check
                                                                    className={cn(
                                                                        "ml-auto",
                                                                        filterValue ===
                                                                            option.value
                                                                            ? "opacity-100"
                                                                            : "opacity-0",
                                                                    )}
                                                                />
                                                            </CommandItem>
                                                        ),
                                                    )}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex-1 p-8">
                    <h1 className="text-2xl mb-6">Projects by Category</h1>
                    {/* Charts, tables, or other content go here */}
                    <svg ref={svgRef} width={928} height={500}></svg>
                    <div className="flex justify-end w-full mb-4">
                        <div className="inline-flex rounded-md shadow-sm border">
                            {/* 3Y */}
                            <button className="px-4 py-2 text-sm font-medium border-r hover:bg-gray-100">
                                3Y
                            </button>

                            {/* 5Y */}
                            <button className="px-4 py-2 text-sm font-medium border-r hover:bg-gray-100">
                                5Y
                            </button>

                            {/* Calendar Dropdown */}
                            <button className="px-4 py-2 text-sm font-medium hover:bg-gray-100 flex items-center gap-2">
                                <span>📅</span>
                                <span>Select Date</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
