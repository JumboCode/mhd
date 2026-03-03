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

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Trash } from "lucide-react";

/**
 * React component for managing yearly dataset entries.
 *
 * - Loads all years that exist in the system
 * - Visually indicates which years contain data
 * - Allows deletion of an entire year's data
 */
export default function YearsOfData() {
    const [years, setYears] = useState<number[]>([]);
    const [yearsWithData, setYearsWithData] = useState<Set<number>>(new Set());

    /**
     * Loads all years from the API and determines which contain data.
     * Generates a continuous descending range between min and max year.
     */
    useEffect(() => {
        async function fetchYears() {
            try {
                const res = await fetch("/api/years-with-data");
                if (!res.ok) throw new Error("Failed to fetch years");

                const data = await res.json();
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
                toast.error("Failed to load years");
            }
        }

        fetchYears();
    }, []);

    /**
     * Deletes all data associated with a given year.
     * Uses optimistic UI updates on success.
     *
     * @param year Year to delete
     */
    function handleRemoveYear(year: number) {
        fetch(`/api/delete-year?year=${year}`, {
            method: "DELETE",
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
        <div className="border-2 border-gray-200 rounded-lg overflow-hidden w-full">
            <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr className="divide-x-2 divide-gray-200">
                        <th className="text-center px-4 py-3 text-sm font-medium text-gray-500 w-[40%]">
                            Year
                        </th>
                        <th className="text-center px-4 py-3 text-sm font-medium text-gray-500 w-[40%]">
                            Status
                        </th>
                        <th className="text-center px-4 py-3 text-sm font-medium text-gray-500 w-[20%]">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                    {years.length > 0 ? (
                        years.map((year) => (
                            <tr key={year} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm text-center">
                                    {year}
                                </td>
                                <td className="px-4 py-3 text-sm text-center">
                                    <div className="flex items-center justify-center gap-2">
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
                                <td className="px-4 py-3 text-sm text-center">
                                    <button
                                        onClick={() => handleRemoveYear(year)}
                                        className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
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
