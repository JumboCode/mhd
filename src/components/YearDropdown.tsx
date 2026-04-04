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

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type YearDropdownProps = {
    selectedYear?: number | null;
    onYearChange?: (year: number | null) => void;
    showDataIndicator?: boolean;
    school?: string | null;
};

export default function YearDropdown({
    selectedYear,
    onYearChange,
    showDataIndicator = false,
}: YearDropdownProps) {
    const [year, setYear] = useState<number | null>(null);
    const [yearsWithData, setYearsWithData] = useState<Set<number>>(new Set());
    const hasSetDefaultRef = useRef(false);
    const currentYear = new Date().getFullYear();
    const [years, setYears] = useState<number[]>(
        Array.from({ length: 10 }, (_, i) => currentYear - i),
    );

    useEffect(() => {
        async function fetchYearsWithData() {
            try {
                const res = await fetch("/api/years-with-data");
                if (!res.ok) return;
                const data = await res.json();
                const dataSet = new Set<number>(data.years);
                setYearsWithData(dataSet);

                const firstYear = Math.min(...dataSet);
                const lastYear = Math.max(...dataSet);

                const trimmed = Array.from(
                    { length: lastYear - firstYear + 1 },
                    (_, i) => firstYear + i,
                );

                setYears(trimmed);

                // Ensure the selection has a value
                if (trimmed.length > 0) {
                    setYear(Math.max(...trimmed));
                } else {
                    toast.error("No available years to view.");
                }
            } catch (err) {}
        }
        fetchYearsWithData();
    }, []);

    // Default to latest year with data when parent hasn't set a year
    useEffect(() => {
        if (
            yearsWithData.size > 0 &&
            (selectedYear === null || selectedYear === undefined) &&
            !hasSetDefaultRef.current
        ) {
            const latestYearWithData = Math.max(...yearsWithData);
            hasSetDefaultRef.current = true;
            onYearChange?.(latestYearWithData);
        }
    }, [yearsWithData, selectedYear, onYearChange]);

    useEffect(() => {
        setYear(selectedYear ?? null);
    }, [selectedYear]);

    const handleValueChange = (value: string) => {
        const selected = value ? Number(value) : null;
        setYear(selected);
        onYearChange?.(selected);
    };

    const hasData = (year: number) => yearsWithData.has(year);

    const handlePreviousYear = () => {
        const currentIndex = years.findIndex((y) => y === year);
        if (currentIndex < years.length - 1) {
            const newYear = years[currentIndex + 1];
            setYear(newYear);
            onYearChange?.(newYear);
        }
    };

    const handleNextYear = () => {
        const currentIndex = years.findIndex((y) => y === year);
        if (currentIndex > 0) {
            const newYear = years[currentIndex - 1];
            setYear(newYear);
            onYearChange?.(newYear);
        }
    };

    const isAtOldestYear = year === years[years.length - 1];
    const isAtNewestYear = year === years[0];

    return (
        <div className="flex items-stretch w-[180px] shadow-sm rounded-md">
            {/* Left Arrow Button */}
            <Button
                variant="outline"
                onClick={handlePreviousYear}
                disabled={!year || isAtOldestYear}
                className="h-9 w-10 rounded-r-none border-r-0 shadow-none z-[1]"
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Multi-year Dropdown */}
            <Select
                value={year?.toString() ?? ""}
                onValueChange={handleValueChange}
            >
                <SelectTrigger className="w-[100px] rounded-none h-9 text-center shadow-none z-[10]">
                    <SelectValue placeholder="Select a year" />
                </SelectTrigger>
                <SelectContent className="z-[100]">
                    {years.map((y) => (
                        <SelectItem
                            key={y}
                            value={y.toString()}
                            rightContent={
                                showDataIndicator ? (
                                    <div
                                        className={`h-2 w-2 rounded-full shrink-0 ${
                                            hasData(y)
                                                ? "bg-green-500"
                                                : "bg-red-500"
                                        }`}
                                    />
                                ) : null
                            }
                        >
                            {y}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Right Arrow Button */}
            <Button
                variant="outline"
                onClick={handleNextYear}
                disabled={!year || isAtNewestYear}
                className="h-9 w-10 rounded-l-none border-l-0 shadow-none z-[1]"
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
}
