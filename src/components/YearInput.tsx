"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ChevronLeft, ChevronRight, TriangleAlert } from "lucide-react";
import { isYearInRange, MAX_YEAR, MIN_YEAR } from "@/lib/year-validation";

type YearInputProps = {
    year?: number | null;
    onYearChange: (year: number | null) => void;
};

export default function YearInput({ year, onYearChange }: YearInputProps) {
    const [draft, setDraft] = useState<string | null>(null);
    const [lastValidYear, setLastValidYear] = useState<number | null>(
        year ?? null,
    );
    const [yearsWithData, setYearsWithData] = useState<Set<number> | null>(
        null,
    );

    // Sync lastValidYear when year prop changes externally (e.g. default year effect)
    useEffect(() => {
        if (draft === null && year !== null && year !== undefined) {
            setLastValidYear(year);
        }
    }, [year, draft]);

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

    // Derive display value: use draft while typing, otherwise derive from prop
    const displayValue = draft ?? (year ? String(year) : "");
    const displayYear = Number(displayValue);
    const isInvalid =
        draft !== null && draft.length === 4 && !isYearInRange(Number(draft));
    const hasData = !!displayYear && !!yearsWithData?.has(displayYear);

    const handleYearInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, "");
        if (value.length > 4) return;
        setDraft(value);
        if (value.length === 4) {
            const parsedYear = Number(value);
            if (isYearInRange(parsedYear)) {
                onYearChange(parsedYear);
                setLastValidYear(parsedYear);
            }
        } else {
            onYearChange(null);
        }
    };

    const handleYearBlur = () => {
        if (draft === null) return;
        if (!draft) {
            onYearChange(null);
            setDraft(null);
            return;
        }

        const normalized = draft.padStart(4, "0");
        const parsedYear = Number(normalized);
        if (isYearInRange(parsedYear)) {
            onYearChange(parsedYear);
            setLastValidYear(parsedYear);
        } else {
            onYearChange(lastValidYear);
        }
        setDraft(null);
    };

    const incrementYear = () => {
        if (year && year < MAX_YEAR) onYearChange(year + 1);
    };

    const decrementYear = () => {
        if (year && year > MIN_YEAR) onYearChange(year - 1);
    };

    return (
        <div className="flex flex-col gap-2">
            <div
                className={`flex items-center rounded-md border overflow-hidden w-fit ${isInvalid ? "border-red-500" : "border-border"}`}
            >
                <Button
                    variant="ghost"
                    onClick={decrementYear}
                    className="h-9 w-10 flex items-center justify-center rounded-none border-r border-border shadow-none"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center justify-center gap-1.5 px-2 w-[100px]">
                    {yearsWithData && displayValue && (
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
                        value={displayValue}
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
                    Data already exists for {displayYear}. Uploading will
                    overwrite it.
                </p>
            )}
        </div>
    );
}
