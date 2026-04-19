import { useState } from "react";
import { Plus } from "lucide-react";
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
                    className="flex items-center justify-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground w-full rounded-lg border border-dashed border-border hover:border-foreground/40 bg-transparent hover:bg-muted/40 px-3 py-2 cursor-pointer transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Add filter
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
