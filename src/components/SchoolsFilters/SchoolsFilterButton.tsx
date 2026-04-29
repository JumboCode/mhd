"use client";

import { useState } from "react";
import { ListFilter, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
} from "@/components/ui/command";
import { Checkbox } from "@/components/Checkbox";
import { Badge } from "@/components/ui/badge";
import type { SchoolsFilters } from "@/hooks/useSchoolsFilters";

type FilterCategory = {
    key: keyof SchoolsFilters;
    label: string;
    options: string[];
};

type SchoolsFilterButtonProps = {
    filters: SchoolsFilters;
    options: {
        cities: string[];
        regions: string[];
        divisions: string[];
        schoolTypes: string[];
        implementationTypes: string[];
    };
    onFiltersChange: (key: keyof SchoolsFilters, values: string[]) => void;
    activeFilterCount: number;
};

const filterCategories: { key: keyof SchoolsFilters; label: string }[] = [
    { key: "cities", label: "City" },
    { key: "regions", label: "Region" },
    { key: "divisions", label: "Division" },
    { key: "schoolTypes", label: "School Type" },
    { key: "implementationTypes", label: "Implementation Model" },
];

export function SchoolsFilterButton({
    filters,
    options,
    onFiltersChange,
    activeFilterCount,
}: SchoolsFilterButtonProps) {
    const [open, setOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState<FilterCategory | null>(
        null,
    );
    const [tempSelected, setTempSelected] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    const handleOpenChange = (next: boolean) => {
        setOpen(next);
        if (!next) {
            setActiveCategory(null);
            setSearchQuery("");
        }
    };

    const handleCategorySelect = (key: keyof SchoolsFilters) => {
        const category = filterCategories.find((c) => c.key === key);
        if (category) {
            setActiveCategory({
                ...category,
                options: options[key],
            });
            setTempSelected(filters[key]);
            setSearchQuery("");
        }
    };

    const handleToggle = (value: string) => {
        setTempSelected((prev) =>
            prev.includes(value)
                ? prev.filter((v) => v !== value)
                : [...prev, value],
        );
    };

    const filteredOptions = activeCategory
        ? activeCategory.options.filter((opt) =>
              opt.toLowerCase().includes(searchQuery.toLowerCase()),
          )
        : [];

    const handleApply = () => {
        if (activeCategory) {
            onFiltersChange(activeCategory.key, tempSelected);
        }
        setActiveCategory(null);
    };

    const handleBack = () => {
        setActiveCategory(null);
        setSearchQuery("");
    };

    const handleSelectAll = () => {
        setTempSelected(filteredOptions);
    };

    const handleClearAll = () => {
        setTempSelected([]);
    };

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <ListFilter className="h-4 w-4" />
                    Filters
                    {activeFilterCount > 0 && (
                        <Badge
                            variant="secondary"
                            className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs tabular-nums"
                        >
                            {activeFilterCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] p-0" align="end">
                {activeCategory ? (
                    <Command shouldFilter={false}>
                        <div className="flex items-center border-b px-2">
                            <button
                                type="button"
                                onClick={handleBack}
                                aria-label="Back to filter categories"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:scale-[0.96]"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </button>
                            <span className="font-medium text-sm py-2 ml-1">
                                {activeCategory.label}
                            </span>
                        </div>
                        <CommandInput
                            placeholder={`Search ${activeCategory.label.toLowerCase()}...`}
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                        />
                        <div className="flex items-center justify-between px-3 py-2 border-b">
                            <button
                                type="button"
                                onClick={
                                    filteredOptions.every((o) =>
                                        tempSelected.includes(o),
                                    )
                                        ? handleClearAll
                                        : handleSelectAll
                                }
                                className="text-sm text-primary hover:underline"
                            >
                                {filteredOptions.every((o) =>
                                    tempSelected.includes(o),
                                )
                                    ? "Deselect All"
                                    : "Select All"}
                            </button>
                            <button
                                type="button"
                                onClick={handleClearAll}
                                className="text-sm text-primary hover:underline"
                            >
                                Clear
                            </button>
                        </div>
                        <CommandList className="max-h-[240px]">
                            <CommandEmpty>No options found.</CommandEmpty>
                            <CommandGroup>
                                {filteredOptions.map((option) => {
                                    const isSelected =
                                        tempSelected.includes(option);
                                    return (
                                        <CommandItem
                                            key={option}
                                            value={option}
                                            onSelect={() =>
                                                handleToggle(option)
                                            }
                                            className="cursor-pointer"
                                        >
                                            <div className="flex items-center gap-2 w-full">
                                                <Checkbox
                                                    checked={isSelected}
                                                    onCheckedChange={() =>
                                                        handleToggle(option)
                                                    }
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                />
                                                <span className="flex-1 truncate">
                                                    {option}
                                                </span>
                                            </div>
                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                        </CommandList>
                        <div className="flex items-center justify-end gap-2 p-3 border-t">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleBack}
                            >
                                Cancel
                            </Button>
                            <Button size="sm" onClick={handleApply}>
                                Apply
                            </Button>
                        </div>
                    </Command>
                ) : (
                    <div className="py-2">
                        <div className="px-3 py-2 text-sm font-medium text-muted-foreground">
                            Filter by
                        </div>
                        {filterCategories.map((category) => {
                            const count = filters[category.key].length;
                            return (
                                <button
                                    key={category.key}
                                    type="button"
                                    onClick={() =>
                                        handleCategorySelect(category.key)
                                    }
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-between"
                                >
                                    <span>{category.label}</span>
                                    {count > 0 && (
                                        <Badge
                                            variant="secondary"
                                            className="text-xs tabular-nums"
                                        >
                                            {count}
                                        </Badge>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
