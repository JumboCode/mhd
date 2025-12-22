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
import { SchoolsDataTable } from "@/components/DataTableSchools";
import { columns } from "@/components/Columns";
import YearDropdown from "@/components/YearDropdown";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import SchoolSearchBar from "@/components/SchoolSearchbar";

export default function SchoolsPage() {
    const [schoolInfo, setSchoolInfo] = useState([]);
    const [year, setYear] = useState<number | null>(2025);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!year) return;

        setIsLoading(true);
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
                setIsLoading(false);
            })
            .catch((error) => {
                // eslint-disable-next-line no-console
                console.log(error);
                setError(error.message || "Failed to load school data");
                setIsLoading(false);
            });
    }, [year]);

    return (
        <div className="font-sans mt-5">
            <div className="w-11/12 mx-auto">
                <div className="flex items-center font-bold">
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
                        isLoading={isLoading}
                    />
                </div>
            </div>
        </div>
    );
}
