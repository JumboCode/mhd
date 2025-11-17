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
    const [year, setYear] = useState<number | null | undefined>(null);

    // Years from 2016 to 2025
    const years = Array.from({ length: 10 }, (_, i) => 2025 - i);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = e.target.value ? Number(e.target.value) : null;
        setYear(selected);
        onYearChange?.(selected);
    };

    useEffect(() => {
        setYear(selectedYear);
    }, [selectedYear]);

    return (
        <select
            value={year ?? ""}
            onChange={handleChange}
            className="border border-gray-300 rounded px-4 py-2 w-48 font-normal text-gray-600"
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
