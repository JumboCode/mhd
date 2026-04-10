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
import { createColumns, Schools } from "@/components/Columns";
import { SchoolsDataTable } from "@/components/DataTableSchools";
import { SaveDiscardBar } from "@/components/EditableCells";
import SchoolSearchBar from "@/components/SchoolSearchbar";
import YearDropdown from "@/components/YearDropdown";
import { standardize } from "@/lib/school-name-standardize";
import { LoadError } from "@/components/ui/load-error";

export default function SchoolsPage() {
    const [schoolInfo, setSchoolInfo] = useState<Schools[]>([]);
    const [prevYearSchoolInfo, setPrevYearSchoolInfo] = useState<Schools[]>([]);
    const [year, setYear] = useState<number | null>(null);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [originalSchoolInfo, setOriginalSchoolInfo] = useState<Schools[]>([]);
    const [pendingChanges, setPendingChanges] = useState<
        Map<string, Partial<Schools>>
    >(new Map());
    const [saving, setSaving] = useState(false);
    const [schoolDataError, setSchoolDataError] = useState<string | null>(null);
    const [prevYearError, setPrevYearError] = useState<string | null>(null);
    const [retryTrigger, setRetryTrigger] = useState(0);

    const hasChanges = pendingChanges.size > 0;

    const onCommit = useCallback(
        (
            rowName: string,
            columnId: string,
            value: string | number | boolean,
        ) => {
            setSchoolInfo((prev) =>
                prev.map((row) =>
                    row.name === rowName ? { ...row, [columnId]: value } : row,
                ),
            );
            setPendingChanges((prev) => {
                const next = new Map(prev);
                next.set(rowName, {
                    ...(next.get(rowName) ?? {}),
                    [columnId]: value,
                });
                return next;
            });
        },
        [],
    );

    const handleSave = async () => {
        setSaving(true);
        try {
            const requests = Array.from(pendingChanges.entries()).map(
                ([rowName, changes]) =>
                    fetch(`/api/schools/${standardize(rowName)}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(changes),
                    }),
            );
            const results = await Promise.all(requests);
            const failed = results.filter((r) => !r.ok);
            if (failed.length > 0) {
                toast.error(
                    `${failed.length} update(s) failed. Please try again.`,
                );
            } else {
                toast.success("Changes saved successfully.");
                setOriginalSchoolInfo(schoolInfo);
                setPendingChanges(new Map());
            }
        } catch {
            toast.error("Failed to save changes. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleDiscard = useCallback(() => {
        setSchoolInfo(originalSchoolInfo);
        setPendingChanges(new Map());
    }, [originalSchoolInfo]);

    const columns = useMemo(() => createColumns(onCommit), [onCommit]);

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
                setSchoolInfo(data);
                setOriginalSchoolInfo(data);
                setPendingChanges(new Map());
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
                setPrevYearError("Previous year comparison data unavailable");
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
                <SaveDiscardBar
                    hasChanges={hasChanges}
                    saving={saving}
                    onSave={handleSave}
                    onDiscard={handleDiscard}
                />
            </div>
        </div>
    );
}
