// Generic component for filtering values in a popover for graphs

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
import type { MultiSelectFilterType } from "./constants";

export type FilterOption = string | { label: string; value: string };

interface FilterValuePopoverProps {
    filterType: MultiSelectFilterType;
    options: FilterOption[];
    selectedValues: string[];
    gatewayCities?: string[]; // List of gateway city names (only for city filter)
    onFinish: (selectedValues: string[]) => void;
    trigger: React.ReactNode;
    autoOpen?: boolean; // When this becomes true, the popover opens automatically
    onAutoOpenComplete?: () => void; // Called after auto-open so parent can reset
}

export function FilterValuePopover({
    filterType,
    options,
    selectedValues,
    gatewayCities = [],
    onFinish,
    trigger,
    autoOpen = false,
    onAutoOpenComplete,
}: FilterValuePopoverProps) {
    const [open, setOpen] = useState(false);
    const [tempSelected, setTempSelected] = useState<string[]>(selectedValues);
    const [searchQuery, setSearchQuery] = useState("");

    // Block Radix "interact outside" dismiss events briefly after auto-open
    const dismissLockedRef = useRef(false);

    // Stable ref for the callback
    const onAutoOpenCompleteRef = useRef(onAutoOpenComplete);
    onAutoOpenCompleteRef.current = onAutoOpenComplete;

    // Auto-open when parent signals
    useEffect(() => {
        if (autoOpen) {
            dismissLockedRef.current = true;
            setOpen(true);
            onAutoOpenCompleteRef.current?.();
        }
        console.log(options);
    }, [autoOpen]);

    // Separate effect to unlock dismiss — not tied to autoOpen changing,
    // so it won't get cleaned up when autoOpen resets to false
    useEffect(() => {
        if (dismissLockedRef.current) {
            const timer = setTimeout(() => {
                dismissLockedRef.current = false;
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [open]);

    // Prevent Radix from closing this popover via outside interactions while locked
    const handleDismissEvent = useCallback((e: Event) => {
        if (dismissLockedRef.current) {
            e.preventDefault();
        }
    }, []);

    // Reset temp selection when popover opens
    useEffect(() => {
        if (open) {
            setTempSelected(selectedValues);
            setSearchQuery("");
        }
    }, [open, selectedValues]);

    // Normalize all options to { label, value } pairs
    const normalizedOptions = (options || [])
        .filter((o) => o !== null && o !== undefined)
        .map((o) => (typeof o === "string" ? { label: o, value: o } : o));
    const filteredOptions = normalizedOptions.filter((o) =>
        o.label.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const handleToggle = (value: string) => {
        setTempSelected((prev) =>
            prev.includes(value)
                ? prev.filter((v) => v !== value)
                : [...prev, value],
        );
    };

    const handleSelectAll = () => {
        setTempSelected(filteredOptions.map((o) => o.value));
    };

    const handleClearAll = () => {
        setTempSelected([]);
    };

    const handleSelectGatewayCities = () => {
        // Get all gateway cities that are in the options
        const optionValues = new Set(normalizedOptions.map((o) => o.value));
        const gatewayInOptions = gatewayCities.filter((city) =>
            optionValues.has(city),
        );

        // Select all gateway cities (merge with existing selections)
        const newSelection = [
            ...new Set([...tempSelected, ...gatewayInOptions]),
        ];
        setTempSelected(newSelection);
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
                onInteractOutside={handleDismissEvent}
                onFocusOutside={handleDismissEvent}
            >
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Search options..."
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                    />
                    <div className="flex items-center justify-between px-3 py-2 border-b gap-2">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={
                                    filteredOptions.every((o) =>
                                        tempSelected.includes(o.value),
                                    )
                                        ? handleClearAll
                                        : handleSelectAll
                                }
                                className="text-sm text-primary hover:underline hover:cursor-pointer"
                            >
                                {filteredOptions.every((o) =>
                                    tempSelected.includes(o.value),
                                )
                                    ? "Deselect All"
                                    : "Select All"}
                            </button>
                            {filterType === "school" &&
                                gatewayCities.length > 0 && (
                                    <>
                                        <span className="text-muted-foreground">
                                            |
                                        </span>
                                        <button
                                            type="button"
                                            onClick={handleSelectGatewayCities}
                                            className="text-sm text-primary hover:underline hover:cursor-pointer"
                                        >
                                            Gateway Schools
                                        </button>
                                    </>
                                )}
                        </div>
                        <button
                            type="button"
                            onClick={handleClearAll}
                            className="text-sm text-primary hover:underline hover:cursor-pointer"
                        >
                            Clear All
                        </button>
                    </div>
                    <CommandList className="max-h-[300px]">
                        <CommandEmpty>No options found.</CommandEmpty>
                        <CommandGroup>
                            {filteredOptions.map((option) => {
                                const isSelected = tempSelected.includes(
                                    option.value,
                                );
                                return (
                                    <CommandItem
                                        key={option.value}
                                        value={option.label}
                                        onSelect={() =>
                                            handleToggle(option.value)
                                        }
                                        className={`cursor-pointer ${isSelected ? "text-blue-800" : ""}`}
                                    >
                                        <div className="flex items-center gap-2 w-full">
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={() =>
                                                    handleToggle(option.value)
                                                }
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            />
                                            <span className="flex-1">
                                                {option.label}
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
                            onClick={handleCancel}
                            className="h-9"
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleFinish} className="h-9">
                            Apply
                        </Button>
                    </div>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
