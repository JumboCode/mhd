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

import { Search } from "lucide-react";
import type React from "react";
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

    return (
        <Input
            type="text"
            value={search}
            onChange={handleChange}
            placeholder={placeholder}
        />
    );
}
