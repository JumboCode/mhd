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

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { createColumns, Schools } from "@/components/Columns";
import { SchoolsDataTable } from "@/components/DataTableSchools";
import SchoolSearchBar from "@/components/SchoolSearchbar";
import YearDropdown from "@/components/YearDropdown";
import { standardize } from "@/lib/school-name-standardize";

export default function SchoolsPage() {
    const [schoolInfo, setSchoolInfo] = useState<Schools[]>([]);
    const [prevYearSchoolInfo, setPrevYearSchoolInfo] = useState<Schools[]>([]);
    const [year, setYear] = useState<number | null>(null);
    const [search, setSearch] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const onCommit = useCallback(
        async (
            rowName: string,
            columnId: string,
            value: string | number | boolean,
        ) => {
            const res = await fetch(`/api/schools/${standardize(rowName)}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ [columnId]: value }),
            });
            if (res.ok) {
                setSchoolInfo((prev) =>
                    prev.map((row) =>
                        row.name === rowName
                            ? { ...row, [columnId]: value }
                            : row,
                    ),
                );
                toast.success("City updated.");
            } else {
                toast.error("Failed to update city.");
            }
        },
        [],
    );

    const columns = useMemo(() => createColumns(onCommit), [onCommit]);

    useEffect(() => {
        if (!year) return;

        setError(null);
        setIsLoading(true);

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
                setError(error.message || "Failed to load school data");
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [year]);

    useEffect(() => {
        if (!year) return;

        setError(null);

        fetch(`/api/schools?year=${year - 1}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch school data`);
                }
                return response.json();
            })
            .then((data) => {
                setPrevYearSchoolInfo(data);
            })
            .catch((error) => {
                setError(error.message || "Failed to load school data");
            });
    }, [year]);

    return (
        <div className="font-sans w-full max-w-full h-full min-h-0 flex flex-col overscroll-none">
            <div className="shrink-0 z-40 flex items-center h-16 px-6 backdrop-blur-xl bg-background/70 border-b">
                <Breadcrumbs />
                <div className="flex-1 text-center">
                    <h1 className="text-xl font-bold sm: pr-6"> Schools </h1>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative z-50">
                        <YearDropdown
                            selectedYear={year}
                            onYearChange={setYear}
                        />
                    </div>
                    <SchoolSearchBar search={search} setSearch={setSearch} />
                </div>
            </div>

            <div className="flex-1 min-h-0 flex flex-col overflow-hidden overscroll-none">
                {error && (
                    <div className="shrink-0 my-4 p-4 bg-destructive/10 border border-destructive rounded-md text-destructive">
                        {error}
                    </div>
                )}
                <div className="flex-1 min-h-0 min-w-0 overflow-hidden">
                    <SchoolsDataTable
                        columns={columns}
                        data={schoolInfo}
                        prevData={prevYearSchoolInfo}
                        globalFilter={search}
                        setGlobalFilter={setSearch}
                        isLoading={isLoading}
                    />
                </div>
            </div>
        </div>
    );
}
