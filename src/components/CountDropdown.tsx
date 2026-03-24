/***************************************************************
 *
 *                CountDropdown.tsx
 *
 *         Author: Anne Wu
 *           Date: 2/14/2026
 *
 *        Summary: Count Dropdown menu for the heatmap
 *
 **************************************************************/

"use client";

import { useEffect, useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type CountDropdownProps = {
    selectedCount?: string;
    onCountChange?: (year: string) => void;
    options: string[];
};

export default function CountDropdown({
    selectedCount,
    onCountChange,
    options,
}: CountDropdownProps) {
    const [toCount, setToCount] = useState(selectedCount);

    useEffect(() => {
        setToCount(selectedCount);
    }, [selectedCount]);

    const handleValueChange = (value: string) => {
        setToCount(value);
        onCountChange?.(value);
    };

    return (
        <Select value={toCount ?? ""} onValueChange={handleValueChange}>
            <SelectTrigger className="w-45">
                <SelectValue placeholder="Select what to count" />
            </SelectTrigger>
            <SelectContent>
                {options.map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                        {y}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
