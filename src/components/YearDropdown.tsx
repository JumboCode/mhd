/***************************************************************
 *
 *                YearDropdown.tsx
 *
 *         Author: Will O'Leary & Zander Barba
 *           Date: 11/14/2025
 *
 *        Summary: Year Dropdown menu for the spreadsheet
 *        uploading process
 *
 **************************************************************/

"use client";

import React, { useState, useEffect } from "react";

type YearDropdownProps = {
    selectedYear?: number | null;
    onYearChange?: (year: number | null) => void;
};

export default function YearDropdown({
    selectedYear,
    onYearChange,
}: YearDropdownProps) {
    const [year, setYear] = useState<number | null>(null);

    // Years from current year down to 10 years ago
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = e.target.value ? Number(e.target.value) : null;
        setYear(selected);
        onYearChange?.(selected);
    };

    useEffect(() => {
        setYear(selectedYear ?? null);
    }, [selectedYear]);

    return (
        <select
            value={year ?? ""}
            onChange={handleChange}
            className="border border-gray-300 rounded px-4 py-1.5 w-30 font-normal text-sm text-gray-600 h-[34px] hover:border-gray-400 focus:border-[#22405D] focus:outline-none focus:ring-2 focus:ring-[#457BAF]/20"
        >
            <option value="">Select a year</option>
            {years.map((y) => (
                <option key={y} value={y}>
                    {y}
                </option>
            ))}
        </select>
    );
}
