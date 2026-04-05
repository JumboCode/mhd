"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ChevronLeft, ChevronRight, TriangleAlert } from "lucide-react";

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

    const MIN_YEAR = 1900;
    const MAX_YEAR = 2100;

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
        setYearStr(String(year));
    }, [year]);

    const hasData = !!currYear && !!yearsWithData?.has(currYear);

    const handleYearInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value.length > 4) return;
        setYearStr(value);
        if (value.length === 4) setYear(Number(value));
    };

    const handleYearBlur = () => {
        if (yearStr.length > 0 && yearStr.length < 4) {
            const padded = yearStr.padStart(4, "0");
            setYearStr(padded);
            setYear(Number(padded));
        }
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
            <div className="flex items-center w-[180px] rounded-md overflow-hidden shadow-sm">
                <Button
                    variant="outline"
                    onClick={decrementYear}
                    className="h-9 w-10 flex items-center justify-center rounded-none border-r-0 shadow-none"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="relative">
                    {yearsWithData && yearStr && (
                        <div
                            className={`absolute left-2 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full shrink-0 ${hasData ? "bg-green-500" : "bg-red-500"}`}
                        />
                    )}
                    <Input
                        type="number"
                        id="year"
                        name="Year"
                        value={yearStr}
                        onChange={handleYearInput}
                        onBlur={handleYearBlur}
                        className="h-9 w-[100px] text-center rounded-none border-y border-x-0 shadow-none focus-visible:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                </div>

                <Button
                    variant="outline"
                    onClick={incrementYear}
                    className="h-9 w-10 flex items-center justify-center rounded-none border-l-0 shadow-none"
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
