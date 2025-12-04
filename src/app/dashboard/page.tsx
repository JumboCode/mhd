"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { d3BarChart } from "./chart";
import {
    Check,
    ChevronsUpDown,
    ArrowRightFromLine,
    Link,
    CalendarDays,
    ChevronDown,
} from "lucide-react";
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

// possible values for measure filter
const measuredAs = [
    {
        value: "total_number_of_schools",
        label: "Total Number of Schools",
    },
    {
        value: "total_student_count",
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

// possible values for group filter
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
        value: "category",
        label: "Project Type",
    },
];

// possible values for filter
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

type Project = {
    id: number;
    title: string;
    division: string;
    category: string;
    year: number;
    group: boolean;
    schoolId: number;
    schoolName: string;
    schoolTown: string;
    teacherId: number;
    teacherFirstName: string;
    teacherLastName: string;
};

export default function Bargraph() {
    const svgRef = useRef<SVGSVGElement | null>(null);

    // saves data from database
    const [data, setData] = useState<{ category: string; value: number }[]>([]);

    // save user input values
    const [allProjects, setAllProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
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

    // populate options in filter dropdown
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
    // useEffect(() => {
    //     async function fetchData() {
    //         const response = await fetch("/api/bargraph", {
    //             method: "POST",
    //             headers: { "Content-Type": "application/json" },
    //             body: JSON.stringify({
    //                 measure,
    //                 group,
    //                 filter,
    //                 filterValue,
    //             }),
    //         });
    //         const json = await response.json();
    //         setData(json);
    //     }
    //     fetchData();
    // }, [measure, group, filter, filterValue]);

    // Fetch all project data on component mount
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                // const response = await fetch("/api/bargraph");
                const response = await fetch("/api/bargraph", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                });
                if (!response.ok) throw new Error("Failed to fetch");
                const data = await response.json();
                setAllProjects(data);
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

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
                    <div className="flex flex-col gap-[50px] mb-4">
                        <div className="flex flex-col gap-[5px]">
                            <h2 className="font-bold">Measured As</h2>
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
                                        <ChevronDown className="opacity-50" />
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
                                                            // onSelect={(currentValue) => {
                                                            //     setFilterValue(currentValue); // just set the value
                                                            //     setOpenFilterValue(false);    // close the popover
                                                            // }}
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
                            <h2 className="font-bold">Group By</h2>
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
                                        <ChevronDown className="opacity-50" />
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
                            <h2 className="font-bold">Filter By</h2>
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
                                        <ChevronDown className="opacity-50" />
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
                                            <ChevronDown className="opacity-50" />
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
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl">Projects by Category</h1>
                        <div className="flex gap-2">
                            <button className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-gray-100 flex items-center gap-2">
                                <ArrowRightFromLine className="h-4 w-4" />
                                Export
                            </button>
                            <button className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-gray-100 flex items-center gap-2">
                                <Link className="h-4 w-4" />
                                Share
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-end w-full mb-4">
                        <div className="inline-flex rounded-md border">
                            {/* 3Y */}
                            <button className="px-6 py-2 text-sm font-medium border-r hover:bg-gray-100">
                                3y
                            </button>

                            {/* 5Y */}
                            <button className="px-6 py-2 text-sm font-medium border-r hover:bg-gray-100">
                                5y
                            </button>

                            {/* Calendar Dropdown */}
                            <button className="px-4 py-2 text-sm font-medium rounded-r bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2 rounded-r-md">
                                <CalendarDays className="h-4 w-4" />
                                <span>2020-2025</span>
                                <ChevronDown className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                    {/* Charts, tables, or other content go here */}
                    <svg ref={svgRef} width={928} height={500}></svg>
                </div>
            </div>
        </div>
    );
}
