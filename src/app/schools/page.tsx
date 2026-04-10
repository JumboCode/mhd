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
import { SaveDiscardBar } from "@/components/EditableCells";
import SchoolSearchBar from "@/components/SchoolSearchbar";
import YearDropdown from "@/components/YearDropdown";
import LoadError from "@/components/LoadError";
import { standardize } from "@/lib/school-name-standardize";

export default function SchoolsPage() {
    const [schoolInfo, setSchoolInfo] = useState<Schools[]>([]);
    const [prevYearSchoolInfo, setPrevYearSchoolInfo] = useState<Schools[]>([]);
    const [year, setYear] = useState<number | null>(null);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [schoolLoadError, setSchoolLoadError] = useState<string | null>(null);
    const [prevYearLoadError, setPrevYearLoadError] = useState<string | null>(
        null,
    );
    const [originalSchoolInfo, setOriginalSchoolInfo] = useState<Schools[]>([]);
    const [pendingChanges, setPendingChanges] = useState<
        Map<string, Partial<Schools>>
    >(new Map());
    const [saving, setSaving] = useState(false);

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

    const fetchSchoolInfo = useCallback((selectedYear: number) => {
        setIsLoading(true);
        setSchoolLoadError(null);

        fetch(`/api/schools?year=${selectedYear}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch school data");
                }
                return response.json();
            })
            .then((data) => {
                setSchoolInfo(data);
                setOriginalSchoolInfo(data);
                setPendingChanges(new Map());
            })
            .catch(() => {
                setSchoolInfo([]);
                setOriginalSchoolInfo([]);
                setPendingChanges(new Map());
                setSchoolLoadError("Failed to load school data.");
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    const fetchPrevYearSchoolInfo = useCallback((selectedYear: number) => {
        setPrevYearLoadError(null);

        fetch(`/api/schools?year=${selectedYear - 1}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch school data");
                }
                return response.json();
            })
            .then((data) => {
                setPrevYearSchoolInfo(data);
            })
            .catch(() => {
                setPrevYearSchoolInfo([]);
                setPrevYearLoadError("Failed to load previous year data.");
            });
    }, []);

    useEffect(() => {
        if (!year) return;
        fetchSchoolInfo(year);
    }, [year, fetchSchoolInfo]);

    useEffect(() => {
        if (!year) return;
        fetchPrevYearSchoolInfo(year);
    }, [year, fetchPrevYearSchoolInfo]);

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
                <div className="flex-1 min-h-0 min-w-0 overflow-hidden">
                    {schoolLoadError ? (
                        <div className="h-full p-6">
                            <LoadError
                                message={schoolLoadError}
                                onRetry={() => year && fetchSchoolInfo(year)}
                                className="h-full min-h-0"
                            />
                        </div>
                    ) : (
                        <div className="flex h-full flex-col">
                            {prevYearLoadError && year && (
                                <div className="p-4 pb-0">
                                    <LoadError
                                        message={prevYearLoadError}
                                        onRetry={() =>
                                            fetchPrevYearSchoolInfo(year)
                                        }
                                        compact
                                    />
                                </div>
                            )}
                            <div className="flex-1 min-h-0">
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
