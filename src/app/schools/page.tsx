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
import { createColumns, Schools } from "@/components/Columns";
import { SchoolsDataTable } from "@/components/DataTableSchools";
import SchoolSearchBar from "@/components/SchoolSearchbar";
import YearDropdown from "@/components/YearDropdown";
import { LoadError } from "@/components/ui/load-error";

export default function SchoolsPage() {
    const [schoolInfo, setSchoolInfo] = useState<Schools[]>([]);
    const [prevYearSchoolInfo, setPrevYearSchoolInfo] = useState<Schools[]>([]);
    const [year, setYear] = useState<number | null>(null);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [schoolDataError, setSchoolDataError] = useState<string | null>(null);
    const [prevYearError, setPrevYearError] = useState<string | null>(null);
    const [retryTrigger, setRetryTrigger] = useState(0);

    const columns = useMemo(() => createColumns(), []);

    const fetchSchoolData = useCallback(() => {
        setRetryTrigger((prev) => prev + 1);
    }, []);

    useEffect(() => {
        if (!year) return;

        setIsLoading(true);
        setSchoolDataError(null);

        fetch(`/api/schools?year=${year}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Failed to load school data`);
                }
                return response.json();
            })
            .then((data) => {
                const filtered = data.filter(
                    (s: Schools) =>
                        s.numStudents > 0 ||
                        s.numTeachers > 0 ||
                        s.numProjects > 0,
                );
                setSchoolInfo(filtered);
                setSchoolDataError(null);
            })
            .catch(() => {
                setSchoolDataError("Failed to load school data");
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [year, retryTrigger]);

    useEffect(() => {
        if (!year) return;

        setPrevYearError(null);
        setPrevYearSchoolInfo([]);

        fetch(`/api/schools?year=${year - 1}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch previous year data`);
                }
                return response.json();
            })
            .then((data) => {
                setPrevYearSchoolInfo(data);
                setPrevYearError(null);
            })
            .catch(() => {
                setPrevYearError(
                    "This is the earliest year of available data — year-over-year comparisons are not available.",
                );
            });
    }, [year]);

    return (
        <div className="font-sans w-full max-w-full h-full min-h-0 flex flex-col overscroll-none">
            <div className="shrink-0 z-40 flex items-center h-16 px-6 backdrop-blur-xl bg-background/70 border-b justify-between">
                <h1 className="text-lg font-bold">Schools</h1>

                <div className="flex items-center gap-4">
                    <div className="relative z-50">
                        <YearDropdown
                            selectedYear={year}
                            onYearChange={setYear}
                            showDataIndicator={true}
                        />
                    </div>
                    <SchoolSearchBar search={search} setSearch={setSearch} />
                </div>
            </div>

            <div className="flex-1 min-h-0 flex flex-col overflow-hidden overscroll-none">
                <div className="flex-1 min-h-0 min-w-0 overflow-hidden">
                    {schoolDataError ? (
                        <LoadError
                            message={schoolDataError}
                            onRetry={fetchSchoolData}
                            className="h-full"
                        />
                    ) : (
                        <SchoolsDataTable
                            columns={columns}
                            data={schoolInfo}
                            prevData={prevYearSchoolInfo}
                            globalFilter={search}
                            setGlobalFilter={setSearch}
                            isLoading={isLoading}
                            prevYearError={prevYearError}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
