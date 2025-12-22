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

        fetch(`/api/schools?year=` + year)
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
                // eslint-disable-next-line no-console
                console.log(error);
                setError(error.message || "Failed to load school data");
            });
    }, [year]);

    return (
        <div className="font-sans mt-5">
            <div className="w-11/12 mx-auto">
                <div className="flex items-center">
                    {/*Table and charts need to be a toggle */}
                    <Breadcrumbs />
                    <div className="flex-1 text-center">
                        <h1 className="text-xl font-bold sm: pr-6">
                            {" "}
                            Schools{" "}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <YearDropdown
                            selectedYear={year}
                            onYearChange={setYear}
                        />
                        <SchoolSearchBar
                            search={search}
                            setSearch={setSearch}
                        />
                    </div>
                </div>

                <div className="mt-5 overflow-x-auto">
                    {error && (
                        <div className="mb-4 p-4 bg-destructive/10 border border-destructive rounded-md text-destructive">
                            {error}
                        </div>
                    )}
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
