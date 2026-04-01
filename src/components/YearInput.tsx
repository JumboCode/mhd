"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
        setYearStr(String(year));
    }, [year]);

    const hasData = !!currYear && !!yearsWithData?.has(currYear);

    const handleYearInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (year) {
            const value = e.target.value;
            setYear(Number(value));
            setYearStr(value);
        }
    };

    const incrementYear = () => {
        if (year && currYear < 2100) {
            const newYear = currYear + 1;
            setYear(newYear);
            setYearStr(String(newYear));
        }
    };

    const decrementYear = () => {
        if (year && currYear > 2000) {
            const newYear = currYear - 1;
            setYear(newYear);
            setYearStr(String(newYear));
        }
    };

    return (
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
    );
}
