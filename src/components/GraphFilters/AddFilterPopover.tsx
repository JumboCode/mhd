import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Filter, filterOptions } from "./constants";

interface AddFilterPopoverProps {
    selectedFilters: Filter[];
    onFilterSelect: (value: Filter) => void;
}

export function AddFilterPopover(props: AddFilterPopoverProps) {
    const [open, setOpen] = useState(false);

    const handleFilterSelect = (value: Filter) => {
        setOpen(false);
        props.onFilterSelect(value);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className="flex items-center gap-1 text-sm text-foreground hover:text-foreground py-2 cursor-pointer w-full bg-background hover:bg-muted rounded-sm px-2"
                >
                    + Add Filter
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="start">
                <div className="space-y-1">
                    {filterOptions
                        .filter(
                            (filter) => !props.selectedFilters.includes(filter),
                        )
                        .map((filter) => (
                            <button
                                key={filter.value}
                                type="button"
                                onClick={() => handleFilterSelect(filter)}
                                className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                            >
                                {filter.label}
                            </button>
                        ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}
