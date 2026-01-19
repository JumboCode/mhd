"use client";

import { useState, useEffect } from "react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/Checkbox";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
} from "@/components/ui/command";
import { Check } from "lucide-react";

interface FilterValuePopoverProps {
    filterType: "school" | "city";
    options: string[];
    selectedValues: string[];
    onFinish: (selectedValues: string[]) => void;
    trigger: React.ReactNode;
}

export function FilterValuePopover({
    filterType,
    options,
    selectedValues,
    onFinish,
    trigger,
}: FilterValuePopoverProps) {
    const [open, setOpen] = useState(false);
    const [tempSelected, setTempSelected] = useState<string[]>(selectedValues);
    const [searchQuery, setSearchQuery] = useState("");

    // Reset temp selection when popover opens
    useEffect(() => {
        if (open) {
            setTempSelected(selectedValues);
            setSearchQuery("");
        }
    }, [open, selectedValues]);

    // Filter out null/undefined values and filter options based on search query
    const validOptions = (options || []).filter(
        (option) => option != null && typeof option === "string",
    );
    const filteredOptions = validOptions.filter((option) =>
        option.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const handleToggle = (value: string) => {
        setTempSelected((prev) =>
            prev.includes(value)
                ? prev.filter((v) => v !== value)
                : [...prev, value],
        );
    };

    const handleSelectAll = () => {
        setTempSelected(filteredOptions);
    };

    const handleClearAll = () => {
        setTempSelected([]);
    };

    const handleFinish = () => {
        onFinish(tempSelected);
        setOpen(false);
    };

    const handleCancel = () => {
        setTempSelected(selectedValues);
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>{trigger}</PopoverTrigger>
            <PopoverContent
                className="w-[400px] p-0"
                side="right"
                align="start"
                sideOffset={8}
            >
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Search options..."
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                    />
                    <div className="flex items-center justify-between px-3 py-2 border-b">
                        <button
                            type="button"
                            onClick={handleSelectAll}
                            className="text-sm text-primary hover:underline"
                        >
                            Select All
                        </button>
                        <button
                            type="button"
                            onClick={handleClearAll}
                            className="text-sm text-primary hover:underline"
                        >
                            Clear All
                        </button>
                    </div>
                    <CommandList className="max-h-[300px]">
                        <CommandEmpty>No options found.</CommandEmpty>
                        <CommandGroup>
                            {filteredOptions.map((option) => {
                                const isSelected =
                                    tempSelected.includes(option);
                                return (
                                    <CommandItem
                                        key={option}
                                        value={option}
                                        onSelect={() => handleToggle(option)}
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
                                            <span className="flex-1">
                                                {option}
                                            </span>
                                            {isSelected && (
                                                <Check className="h-4 w-4 text-primary" />
                                            )}
                                        </div>
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    </CommandList>
                    <div className="flex items-center justify-end gap-2 p-3 border-t">
                        <Button
                            variant="outline"
                            onClick={handleCancel}
                            className="h-9"
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleFinish} className="h-9">
                            Finish
                        </Button>
                    </div>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
