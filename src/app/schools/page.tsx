/***************************************************************
 *
 *                schools/page.tsx
 *
 *         Author: Anne Wu & Justin Ngan
 *           Date: 11/16/2025
 *
 *        Summary: Page to display all school profiles
 *
 **************************************************************/

"use client";

import { useEffect, useState } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { columns } from "@/components/Columns";
import { SchoolsDataTable } from "@/components/DataTableSchools";
import SchoolSearchBar from "@/components/SchoolSearchbar";
import YearDropdown from "@/components/YearDropdown";

export default function SchoolsPage() {
    const [schoolInfo, setSchoolInfo] = useState([]);
    const [year, setYear] = useState<number | null>(2025);
    const [search, setSearch] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!year) return;

        setError(null);

        fetch(`/api/schools?year=${year}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch school data`);
                }
                return response.json();
            })
            .then((data) => {
                setSchoolInfo(data);
            })
            .catch((error) => {
                console.log(error);
                setError(error.message || "Failed to load school data");
            });
    }, [year]);

    return (
        <div className="font-sans h-full w-full max-w-full flex flex-col overflow-hidden px-6 py-5">
            <div className="flex items-center shrink-0 pb-5">
                <Breadcrumbs />
                <div className="flex-1 text-center">
                    <h1 className="text-xl font-bold sm: pr-6"> Schools </h1>
                </div>

                <div className="flex items-center gap-4">
                    <YearDropdown selectedYear={year} onYearChange={setYear} />
                    <SchoolSearchBar search={search} setSearch={setSearch} />
                </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                {error && (
                    <div className="mb-4 p-4 bg-destructive/10 border border-destructive rounded-md text-destructive shrink-0">
                        {error}
                    </div>
                )}
                <div className="flex-1 overflow-hidden min-h-0">
                    <SchoolsDataTable
                        columns={columns}
                        data={schoolInfo}
                        globalFilter={search}
                        setGlobalFilter={setSearch}
                    />
                </div>
            </div>
        </div>
    );
}
