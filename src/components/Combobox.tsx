/***************************************************************
 *
 *         /api/components/Combobox.tsx
 *
 *         Author: Chiara and Steven
 *         Date: 12/6/2025
 *
 *        Summary: reusable dropdown component with search feature
 *
 **************************************************************/

"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CommandList } from "cmdk";

type Option = {
    value: string;
    label: string;
    /** Optional abbreviated label shown in the closed trigger. */
    shortLabel?: string;
};

type ComboBoxProps = {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    /** Values that should display a checkmark, independent of the selected value. */
    checkedValues?: string[];
};

export function Combobox({
    options,
    value,
    onChange,
    placeholder,
    checkedValues,
}: ComboBoxProps) {
    const [open, setOpen] = React.useState(false);

    const selected = options.find((option) => option.value === value);
    const selectedLabel =
        selected?.shortLabel ?? selected?.label ?? placeholder ?? "Select...";

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {selectedLabel}
                    <ChevronsUpDown className="opacity-50 h-4 w-4" />
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-full p-0">
                <Command>
                    <CommandInput placeholder={placeholder ?? "Search..."} />

                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandList className="max-h-60 overflow-y-auto">
                        <CommandGroup>
                            {options.map((opt) => (
                                <CommandItem
                                    key={opt.value}
                                    onSelect={() => {
                                        onChange(opt.value);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            (
                                                checkedValues
                                                    ? checkedValues.includes(
                                                          opt.value,
                                                      )
                                                    : opt.value === value
                                            )
                                                ? "opacity-100"
                                                : "opacity-0",
                                        )}
                                    />
                                    {opt.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
