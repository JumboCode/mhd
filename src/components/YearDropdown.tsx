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
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type YearDropdownProps = {
    selectedYear?: number | null;
    onYearChange?: (year: number | null) => void;
    showDataIndicator?: boolean;
};

export default function YearDropdown({
    selectedYear,
    onYearChange,
    showDataIndicator = false,
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
                <SelectContent className="z-[10]">
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
