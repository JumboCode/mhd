/***************************************************************
 *
 *                /components/YearsOfData.tsx
 *
 *         Author: Zander & Anne
 *           Date: 3/1/2026
 *
 *        Summary: Component for displaying the existing years
 *                 of data and option to delete.
 *
 **************************************************************/

"use client";

import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { toast } from "sonner";
import { Check, Trash, Upload, X } from "lucide-react";
import Link from "next/link";

export interface YearsOfDataHandle {
    save: () => Promise<void>;
    discard: () => void;
}

type YearEntry = {
    year: number;
    uploadedAt: string | null;
    lastUpdatedAt: string | null;
};

function formatDate(iso: string | null): string {
    if (!iso) return "—";
    return new Date(iso).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

const YearsOfData = forwardRef<
    YearsOfDataHandle,
    { onUnsavedChange?: () => void }
>(function YearsOfData({ onUnsavedChange }, ref) {
    const [entries, setEntries] = useState<YearEntry[]>([]);
    const [yearsWithData, setYearsWithData] = useState<Set<number>>(new Set());
    const [pendingRemovals, setPendingRemovals] = useState<number[]>([]);
    const [originalEntries, setOriginalEntries] = useState<YearEntry[]>([]);
    const [originalYearsWithData, setOriginalYearsWithData] = useState<
        Set<number>
    >(new Set());

    useEffect(() => {
        async function fetchYears() {
            try {
                const res = await fetch("/api/years-with-data");
                if (!res.ok) throw new Error("Failed to fetch years");

                const data = await res.json();
                if (!data.years || data.years.length === 0) return;

                const fetched: YearEntry[] = data.years;
                const existingYears = fetched.map((e) => e.year);
                const minYear = Math.min(...existingYears);
                const maxYear = Math.max(...existingYears);

                const metaMap = new Map(fetched.map((e) => [e.year, e]));

                const allEntries: YearEntry[] = Array.from(
                    { length: maxYear - minYear + 1 },
                    (_, i) => {
                        const year = maxYear - i;
                        return (
                            metaMap.get(year) ?? {
                                year,
                                uploadedAt: null,
                                lastUpdatedAt: null,
                            }
                        );
                    },
                );

                setEntries(allEntries);
                setYearsWithData(new Set(existingYears));
                setOriginalEntries(allEntries);
                setOriginalYearsWithData(new Set(existingYears));
            } catch {
                toast.error("Failed to load years");
            }
        }

        fetchYears();
    }, []);

    const handleRemoveYear = (year: number) => {
        setEntries((prev) => prev.filter((e) => e.year !== year));
        setYearsWithData((prev) => {
            const newSet = new Set(prev);
            newSet.delete(year);
            return newSet;
        });
        setPendingRemovals((prev) => [...prev, year]);
        onUnsavedChange?.();
    };

    useImperativeHandle(ref, () => ({
        save: async () => {
            try {
                await Promise.all(
                    pendingRemovals.map((year: number) =>
                        fetch(`/api/delete-year?year=${year}`, {
                            method: "DELETE",
                        }),
                    ),
                );
                const hadChanges = pendingRemovals.length > 0;
                setPendingRemovals([]);
                setOriginalEntries(entries);
                setOriginalYearsWithData(new Set(yearsWithData));
                if (hadChanges) toast.success("Years saved");
            } catch {
                toast.error("Failed to save years");
            }
        },
        discard: () => {
            setEntries(originalEntries);
            setYearsWithData(originalYearsWithData);
            setPendingRemovals([]);
        },
    }));

    return (
        <div className="border-2 border-gray-200 rounded-lg overflow-hidden w-full">
            <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr className="divide-x-2 divide-gray-200">
                        <th className="text-center px-4 py-3 text-sm font-medium text-gray-500 w-[15%]">
                            Year
                        </th>
                        <th className="text-center px-4 py-3 text-sm font-medium text-gray-500 w-[20%]">
                            Status
                        </th>
                        <th className="text-center px-4 py-3 text-sm font-medium text-gray-500 w-[27%]">
                            Uploaded
                        </th>
                        <th className="text-center px-4 py-3 text-sm font-medium text-gray-500 w-[27%]">
                            Last Updated
                        </th>
                        <th className="text-center px-4 py-3 text-sm font-medium text-gray-500 w-[11%]">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                    {entries.length > 0 ? (
                        entries.map((entry) => (
                            <tr key={entry.year} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm text-center">
                                    {entry.year}
                                </td>
                                <td className="px-4 py-3 text-sm text-center">
                                    <div className="flex items-center justify-center">
                                        {yearsWithData.has(entry.year) ? (
                                            <span className="inline-flex items-center justify-center gap-1.5 w-24 px-3 py-1 rounded-sm text-xs font-medium bg-green-100 text-green-700 border border-green-300">
                                                <Check className="w-3 h-3" />
                                                Uploaded
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center justify-center gap-1.5 w-24 px-3 py-1 rounded-sm text-xs font-medium bg-red-100 text-red-600 border border-red-300">
                                                <X className="w-3 h-3" />
                                                Missing
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-center text-gray-600">
                                    {formatDate(entry.uploadedAt)}
                                </td>
                                <td className="px-4 py-3 text-sm text-center text-gray-600">
                                    {formatDate(entry.lastUpdatedAt)}
                                </td>
                                <td className="text-sm p-0">
                                    {yearsWithData.has(entry.year) ? (
                                        <button
                                            onClick={() =>
                                                handleRemoveYear(entry.year)
                                            }
                                            className="w-full h-full px-4 py-3 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                                            aria-label={`Delete ${entry.year}`}
                                        >
                                            <Trash className="w-4 h-4" />
                                        </button>
                                    ) : (
                                        <Link
                                            href="/upload"
                                            className="w-full h-full px-4 py-3 flex items-center justify-center text-gray-400 hover:text-blue-500 transition-colors"
                                            aria-label={`Upload ${entry.year}`}
                                        >
                                            <Upload className="w-4 h-4" />
                                        </Link>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan={5}
                                className="px-4 py-3 text-sm text-gray-500 text-center"
                            >
                                No years available
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
});

export default YearsOfData;
