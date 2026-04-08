"use client";

import React from "react";
import { cn } from "@/lib/utils";

type SortDirection = "asc" | "desc" | false;

interface ChevronsUpDownSortProps {
    sortDirection: SortDirection;
    className?: string;
}

/**
 * Chevrons-up-down icon with sort-state highlighting:
 * - ASCENDING: top arrow highlighted, bottom arrow muted
 * - DESCENDING: bottom arrow highlighted, top arrow muted
 * - else: both arrows same color
 */
export function ChevronsUpDownSort({
    sortDirection,
    className,
}: ChevronsUpDownSortProps) {
    const topStroke =
        sortDirection === "desc" ? "var(--primary)" : "currentColor";
    const bottomStroke =
        sortDirection === "asc" ? "var(--primary)" : "currentColor";
    const topOpacity =
        sortDirection === "desc" ? 1 : sortDirection === "asc" ? 0.35 : 0.6;
    const bottomOpacity =
        sortDirection === "asc" ? 1 : sortDirection === "desc" ? 0.35 : 0.6;

    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn("h-4 w-4 shrink-0", className)}
        >
            {/* Top arrow (points up) - highlighted when ASCENDING */}
            <path
                d="M7 9L12 4L17 9"
                stroke={topStroke}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={topOpacity}
            />
            {/* Bottom arrow (points down) - highlighted when DESCENDING */}
            <path
                d="M7 15L12 20L17 15"
                stroke={bottomStroke}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={bottomOpacity}
            />
        </svg>
    );
}
