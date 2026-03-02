"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Trash } from "lucide-react";

export default function YearsOfData() {
    const [years, setYears] = useState<number[]>([]);
    const [yearsWithData, setYearsWithData] = useState<Set<number>>(new Set());

    // Fetch years and determine which ones have data
    useEffect(() => {
        async function fetchYears() {
            try {
                const res = await fetch("/api/years-with-data");
                if (!res.ok) throw new Error("Failed to fetch years");

                const data = await res.json(); // expects { years: number[] }
                if (!data.years || data.years.length === 0) return;

                const existingYears: number[] = data.years;

                const minYear = Math.min(...existingYears);
                const maxYear = Math.max(...existingYears);

                const allYears = Array.from(
                    { length: maxYear - minYear + 1 },
                    (_, i) => maxYear - i,
                );

                setYears(allYears);
                setYearsWithData(new Set(existingYears));
            } catch (err) {
                console.error(err);
                toast.error("Failed to load years");
            }
        }

        fetchYears();
    }, []);
    function handleRemoveYear(year: number) {
        fetch(`/api/delete-year?year=${year}`, {
            method: "DELETE", // ← important
        })
            .then((response) => {
                if (!response.ok) {
                    toast(`Failed to delete data for ${year}.`);
                } else {
                    setYears((prev) => prev.filter((y) => y !== year));
                    setYearsWithData((prev) => {
                        const newSet = new Set(prev);
                        newSet.delete(year);
                        return newSet;
                    });
                    toast.success(`Deleted data for ${year}.`);
                }
            })
            .catch(() => {
                toast(`Failed to delete data for ${year}.`);
            });
    }

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden w-full">
            <table className="w-full">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                            Year
                        </th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                            Status
                        </th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                    {years.length > 0 ? (
                        years.map((year) => (
                            <tr key={year} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm">{year}</td>
                                <td className="px-4 py-3 text-sm">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`h-2 w-2 rounded-full ${
                                                yearsWithData.has(year)
                                                    ? "bg-green-500"
                                                    : "bg-red-500"
                                            }`}
                                        />
                                        <span className="text-gray-600">
                                            {yearsWithData.has(year)
                                                ? "Available"
                                                : "Unavailable"}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-sm">
                                    <button
                                        onClick={() => handleRemoveYear(year)}
                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                        aria-label={`Remove ${year}`}
                                    >
                                        <Trash className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan={3}
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
}
