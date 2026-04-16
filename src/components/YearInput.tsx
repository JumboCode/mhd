"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ChevronLeft, ChevronRight, TriangleAlert } from "lucide-react";
import { isYearInRange, MAX_YEAR, MIN_YEAR } from "@/lib/year-validation";

type YearInputProps = {
    year?: number | null;
    setYear: (year: number | null) => void;
};

export default function YearInput({ year, setYear }: YearInputProps) {
    const [yearStr, setYearStr] = useState("");
    const [yearsWithData, setYearsWithData] = useState<Set<number> | null>(
        null,
    );
    const currYear = Number(yearStr);

    useEffect(() => {
        async function fetchYearsWithData() {
            try {
                const res = await fetch("/api/years");
                if (!res.ok) return;
                const data = await res.json();
                setYearsWithData(new Set(data.yearsWithData));
            } catch {}
        }
        fetchYearsWithData();
    }, []);

    useEffect(() => {
        setYearStr(year === null || year === undefined ? "" : String(year));
    }, [year]);

    const hasData = !!currYear && !!yearsWithData?.has(currYear);

    const handleYearInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, "");
        if (value.length > 4) return;
        setYearStr(value);
        if (value.length === 4) {
            const parsedYear = Number(value);
            setYear(isYearInRange(parsedYear) ? parsedYear : null);
        } else {
            setYear(null);
        }
    };

    const handleYearBlur = () => {
        if (!yearStr) {
            setYear(null);
            return;
        }

        const normalizedYear = yearStr.length < 4 ? yearStr.padStart(4, "0") : yearStr;
        setYearStr(normalizedYear);

        const parsedYear = Number(normalizedYear);
        if (!isYearInRange(parsedYear)) {
            setYear(null);
            return;
        }

        if (yearStr.length > 0 && yearStr.length < 4) {
            setYear(parsedYear);
            return;
        }

        setYear(parsedYear);
    };

    const incrementYear = () => {
        if (year && currYear < MAX_YEAR) {
            const newYear = currYear + 1;
            setYear(newYear);
            setYearStr(String(newYear));
        }
    };

    const decrementYear = () => {
        if (year && currYear > MIN_YEAR) {
            const newYear = currYear - 1;
            setYear(newYear);
            setYearStr(String(newYear));
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center rounded-md border border-border overflow-hidden w-fit">
                <Button
                    variant="ghost"
                    onClick={decrementYear}
                    className="h-9 w-10 flex items-center justify-center rounded-none border-r border-border shadow-none"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center justify-center gap-1.5 px-2 w-[100px]">
                    {yearsWithData && yearStr && (
                        <div
                            className={`h-2 w-2 rounded-full shrink-0 ${hasData ? "bg-green-500" : "bg-red-500"}`}
                        />
                    )}
                    <Input
                        type="text"
                        inputMode="numeric"
                        maxLength={4}
                        id="year"
                        name="Year"
                        value={yearStr}
                        onChange={handleYearInput}
                        onBlur={handleYearBlur}
                        className="h-9 w-[52px] p-0 text-center rounded-none border-0 shadow-none focus-visible:ring-0 bg-background [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                </div>

                <Button
                    variant="ghost"
                    onClick={incrementYear}
                    className="h-9 w-10 flex items-center justify-center rounded-none border-l border-border shadow-none"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
            {hasData && (
                <p className="flex items-center gap-1.5 text-sm text-amber-600 dark:text-amber-400">
                    <TriangleAlert className="h-4 w-4 shrink-0" />
                    Data already exists for {currYear}. Uploading will overwrite
                    it.
                </p>
            )}
        </div>
    );
}
