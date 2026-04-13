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
    school = null,
}: YearDropdownProps) {
    const [year, setYear] = useState<number | null>(null);
    const [yearsWithData, setYearsWithData] = useState<Set<number>>(new Set());
    // Years this specific school participated in (only populated when school prop is set)
    const [schoolYears, setSchoolYears] = useState<Set<number>>(new Set());
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
                const yearNumbers: number[] = data.years.map(
                    (e: { year: number }) => e.year,
                );
                const dataSet = new Set<number>(yearNumbers);
                setYearsWithData(dataSet);

                const trimmed = Array.from(dataSet).sort((a, b) => b - a);

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

    // When a school is provided, fetch which years that school participated in
    useEffect(() => {
        if (!school) {
            setSchoolYears(new Set());
            return;
        }
        async function fetchSchoolYears() {
            try {
                const res = await fetch(
                    `/api/years-with-data?school=${encodeURIComponent(school!)}`,
                );
                if (!res.ok) return;
                const data = await res.json();
                const nums: number[] = Array.isArray(data.years)
                    ? data.years.map((y: number) => y)
                    : [];
                setSchoolYears(new Set(nums));
            } catch (err) {}
        }
        fetchSchoolYears();
    }, [school]);

    // Default to latest year with data when parent hasn't set a year.
    // When a school is provided, wait for schoolYears to load before defaulting
    // so we can land on the latest year that school actually participated in.
    useEffect(() => {
        if (selectedYear !== null && selectedYear !== undefined) {
            return; // parent already has a year
        }
        if (hasSetDefaultRef.current) return;

        if (school) {
            // Wait until both global years and school years have loaded
            if (yearsWithData.size > 0 && schoolYears.size > 0) {
                hasSetDefaultRef.current = true;
                onYearChange?.(Math.max(...schoolYears));
            }
        } else if (yearsWithData.size > 0) {
            hasSetDefaultRef.current = true;
            onYearChange?.(Math.max(...yearsWithData));
        }
    }, [yearsWithData, schoolYears, selectedYear, onYearChange, school]);

    useEffect(() => {
        setYear(selectedYear ?? null);
    }, [selectedYear]);

    const handleValueChange = (value: string) => {
        const selected = value ? Number(value) : null;
        setYear(selected);
        onYearChange?.(selected);
    };

    // When a school is provided, arrow navigation skips years the school didn't participate in
    const navigableYears =
        school && schoolYears.size > 0
            ? years.filter((y) => schoolYears.has(y))
            : years;

    const handlePreviousYear = () => {
        const currentIndex = navigableYears.findIndex((y) => y === year);
        if (currentIndex > 0) {
            const newYear = navigableYears[currentIndex - 1];
            setYear(newYear);
            onYearChange?.(newYear);
        }
    };

    const handleNextYear = () => {
        const currentIndex = navigableYears.findIndex((y) => y === year);
        if (currentIndex < navigableYears.length - 1) {
            const newYear = navigableYears[currentIndex + 1];
            setYear(newYear);
            onYearChange?.(newYear);
        }
    };

    const isAtOldestYear =
        navigableYears.length === 0 ||
        year === navigableYears[navigableYears.length - 1];
    const isAtNewestYear =
        navigableYears.length === 0 || year === navigableYears[0];

    return (
        <div className="flex items-stretch w-[180px] shadow-sm rounded-md">
            {/* Left Arrow Button */}
            <Button
                variant="outline"
                onClick={handleNextYear}
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
                    <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent className="z-[100] max-h-120 overflow-y-auto">
                    {years.map((y) => {
                        const schoolParticipated =
                            school && schoolYears.size > 0
                                ? schoolYears.has(y)
                                : true;
                        return (
                            <SelectItem
                                key={y}
                                value={y.toString()}
                                disabled={!schoolParticipated}
                                rightContent={
                                    showDataIndicator ? (
                                        schoolParticipated ? (
                                            <div className="h-2 w-2 rounded-full shrink-0 bg-green-500" />
                                        ) : (
                                            <div className="h-2 w-2 rounded-full shrink-0 border-1 border-green-500" />
                                        )
                                    ) : null
                                }
                            >
                                {y}
                            </SelectItem>
                        );
                    })}
                </SelectContent>
            </Select>

            {/* Right Arrow Button */}
            <Button
                variant="outline"
                onClick={handlePreviousYear}
                disabled={!year || isAtNewestYear}
                className="h-9 w-10 rounded-l-none border-l-0 shadow-none z-[1]"
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
}
