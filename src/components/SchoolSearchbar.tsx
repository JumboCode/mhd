"use client";

import React from "react";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";

type SearchBarProps = {
    insideText?: string;
    onSearch?: (value: string) => void;
    className?: string;
};
export default function SchoolSearchBar({
    insideText = "Search",
    onSearch,
    className = "",
}: SearchBarProps) {
    const [searchValue, setSearch] = useState("");

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setSearch(value);
        onSearch?.(value);
    };

    return (
        <div className={`relative ${className}`}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
            <input
                type="text"
                value={searchValue}
                onChange={handleChange}
                placeholder={insideText}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md placeholder-gray-400 hover:border-gray-400 focus:border-[#22405D] focus:outline-none focus:ring-2 focus:ring-[#457BAF]/20"
            />
        </div>
    );
}
