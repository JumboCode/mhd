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

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type YearDropdownProps = {
    selectedYear?: number | null;
    onYearChange?: (year: number | null) => void;
};

export default function YearDropdown({
    selectedYear,
    onYearChange,
}: YearDropdownProps) {
    const [year, setYear] = useState<number | null>(null);
    const [yearsWithData, setYearsWithData] = useState<Set<number>>(new Set());

    // Years from current year down to 10 years ago
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

    useEffect(() => {
        setYear(selectedYear ?? null);
    }, [selectedYear]);

    // Fetch years with data
    useEffect(() => {
        const fetchYearsWithData = async () => {
            try {
                const response = await fetch("/api/years");
                if (response.ok) {
                    const data = await response.json();
                    setYearsWithData(new Set(data.yearsWithData));
                }
            } catch (error) {
                toast.error("Failed to load year data");
            }
        };
        fetchYearsWithData();
    }, []);

    const handleValueChange = (value: string) => {
        const selected = value ? Number(value) : null;
        setYear(selected);
        onYearChange?.(selected);
    };

    const hasData = (year: number) => yearsWithData.has(year);

    return (
        <Select
            value={year?.toString() ?? ""}
            onValueChange={handleValueChange}
        >
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a year" />
            </SelectTrigger>
            <SelectContent>
                {years.map((y) => (
                    <SelectItem
                        key={y}
                        value={y.toString()}
                        rightContent={
                            <div
                                className={`h-2 w-2 rounded-full shrink-0 ${
                                    hasData(y) ? "bg-green-500" : "bg-red-500"
                                }`}
                            />
                        }
                    >
                        {y}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
