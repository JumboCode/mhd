"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SchoolsFilters } from "@/hooks/useSchoolsFilters";

type FilterChip = {
    category: keyof SchoolsFilters;
    categoryLabel: string;
    value: string;
};

type ActiveFilterChipsProps = {
    filters: SchoolsFilters;
    onRemove: (category: keyof SchoolsFilters, value: string) => void;
    onClearAll: () => void;
};

const categoryLabels: Record<keyof SchoolsFilters, string> = {
    cities: "City",
    regions: "Region",
    divisions: "Division",
    schoolTypes: "School Type",
    implementationTypes: "Impl. Model",
};

export function ActiveFilterChips({
    filters,
    onRemove,
    onClearAll,
}: ActiveFilterChipsProps) {
    const chips: FilterChip[] = [];

    for (const key of Object.keys(filters) as Array<keyof SchoolsFilters>) {
        for (const value of filters[key]) {
            chips.push({
                category: key,
                categoryLabel: categoryLabels[key],
                value,
            });
        }
    }

    if (chips.length === 0) return null;

    return (
        <div className="flex items-center gap-2 px-6 py-2 border-b bg-muted/30 flex-wrap">
            <span className="text-sm text-muted-foreground shrink-0">
                Filters:
            </span>
            {chips.map((chip) => (
                <div
                    key={`${chip.category}-${chip.value}`}
                    className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-background border rounded-md"
                >
                    <span className="text-muted-foreground">
                        {chip.categoryLabel}:
                    </span>
                    <span className="font-medium truncate max-w-[150px]">
                        {chip.value}
                    </span>
                    <button
                        type="button"
                        onClick={() => onRemove(chip.category, chip.value)}
                        aria-label={`Remove ${chip.categoryLabel} ${chip.value}`}
                        className="relative ml-1 -mr-1 inline-flex h-5 w-5 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:scale-[0.96] before:absolute before:inset-[-10px] before:content-['']"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </div>
            ))}
            <Button
                variant="ghost"
                size="sm"
                onClick={onClearAll}
                className="text-muted-foreground hover:text-foreground h-7 px-2"
            >
                Clear all
            </Button>
        </div>
    );
}
