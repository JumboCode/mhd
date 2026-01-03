/***************************************************************
 *
 *                DataTableSchools,tsx
 *
 *         Author: Anne Wu & Justin Ngan
 *           Date: 12/6/2025
 *
 *        Summary: Component to be used to do a global search
 *                 within the schools table
 *
 **************************************************************/

"use client";

import { Search, X } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SearchBarProps = {
    placeholder?: string;
    className?: string;
    search: string;
    setSearch: (value: string) => void;
};
export default function SchoolSearchBar({
    placeholder = "Search",
    className = "",
    search,
    setSearch,
}: SearchBarProps) {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setSearch(value);
    };

    const handleClear = () => {
        setSearch("");
    };

    return (
        <div className={`relative ${className}`}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
                type="text"
                value={search}
                onChange={handleChange}
                placeholder={placeholder}
                className="pl-9 pr-9"
            />
            {search && (
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={handleClear}
                    aria-label="Clear search"
                >
                    <X className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
}
