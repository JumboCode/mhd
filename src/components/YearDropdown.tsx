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

    // Years from 2000 to 2025
    const years = Array.from({ length: 26 }, (_, i) => 2000 + i);

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
            className="border rounded p-2 w-48"
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
