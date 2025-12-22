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

import React from "react";
import { Search } from "lucide-react";
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

    return (
        <div className={`relative ${className}`}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3 h-[30px]" />
            <input
                type="text"
                value={search}
                onChange={handleChange}
                placeholder={placeholder}
                className="w-full pl-8 py-1 font-normal text-sm border border-input rounded placeholder-muted-foreground hover:border-border focus:border-[#22405D] focus:outline-none focus:ring-2 focus:ring-[#457BAF]/20"
            />
        </div>
    );
}
