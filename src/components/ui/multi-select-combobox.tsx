"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

export interface MultiSelectComboboxOption {
    label: string;
    value: string;
}

export interface MultiSelectComboboxProps {
    options: MultiSelectComboboxOption[];
    value?: string[];
    defaultValue?: string[];
    onValueChange: (value: string[]) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    searchable?: boolean;
}

export function MultiSelectCombobox({
    options,
    value,
    defaultValue = [],
    onValueChange,
    placeholder = "Select options",
    className,
    disabled = false,
    searchable = true,
}: MultiSelectComboboxProps) {
    const isControlled = value !== undefined;
    const [internal, setInternal] = React.useState(defaultValue);
    const selected = isControlled ? value! : internal;
    const [open, setOpen] = React.useState(false);

    const setSelected = (vals: string[]) => {
        if (!isControlled) setInternal(vals);
        onValueChange(vals);
    };

    const toggle = (val: string) => {
        if (selected.includes(val)) {
            setSelected(selected.filter((x) => x !== val));
        } else {
            setSelected([...selected, val]);
        }
    };

    const selectAll = () => {
        setSelected(options.map((o) => o.value));
    };

    const clearAll = () => {
        setSelected([]);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn(
                        "w-full justify-between h-auto px-3 py-1",
                        className,
                    )}
                >
                    <div className="flex flex-wrap gap-1 flex-1">
                        {selected.length === 0 ? (
                            <span className="text-muted-foreground">
                                {placeholder}
                            </span>
                        ) : (
                            selected.map((val) => {
                                const opt = options.find(
                                    (o) => o.value === val,
                                );
                                if (!opt) return null;

                                return (
                                    <span
                                        key={val}
                                        className="flex items-center gap-1 bg-secondary px-2 py-1 rounded text-sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggle(val);
                                        }}
                                    >
                                        {opt.label}
                                        <X className="h-3 w-3 cursor-pointer hover:text-destructive" />
                                    </span>
                                );
                            })
                        )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
                <Command>
                    {searchable && (
                        <CommandInput placeholder="Search options..." />
                    )}
                    <CommandList>
                        <CommandEmpty>No option found.</CommandEmpty>
                        <CommandGroup>
                            <CommandItem
                                onSelect={() => {
                                    if (selected.length === options.length) {
                                        clearAll();
                                    } else {
                                        selectAll();
                                    }
                                }}
                                className="cursor-pointer"
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        selected.length === options.length
                                            ? "opacity-100"
                                            : "opacity-0",
                                    )}
                                />
                                Select All
                            </CommandItem>
                        </CommandGroup>
                        <CommandSeparator />
                        <CommandGroup>
                            {options.map((option) => {
                                const isSelected = selected.includes(
                                    option.value,
                                );
                                return (
                                    <CommandItem
                                        key={option.value}
                                        value={option.value}
                                        onSelect={() => {
                                            toggle(option.value);
                                        }}
                                        className="cursor-pointer"
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                isSelected
                                                    ? "opacity-100"
                                                    : "opacity-0",
                                            )}
                                        />
                                        {option.label}
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
