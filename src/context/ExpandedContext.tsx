/***************************************************************
 *
 *                ExpandedContext.tsx
 *
 *         Author: Justin
 *           Date: 11/19/2025
 *
 *        Summary: Context file that turns isExpanded into a
 *                 global state that can be accessed by any component
 *
 **************************************************************/

"use client";

import React, { createContext, useContext, useState } from "react";

interface ExpandedContextType {
    isExpanded: boolean;
    setIsExpanded: (expanded: boolean) => void;
}

const ExpandedContext = createContext<ExpandedContextType | undefined>(
    undefined,
);

export function ExpandedProvider({ children }: { children: React.ReactNode }) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <ExpandedContext.Provider value={{ isExpanded, setIsExpanded }}>
            {children}
        </ExpandedContext.Provider>
    );
}

export function useExpanded() {
    const context = useContext(ExpandedContext);
    if (context === undefined) {
        throw new Error("useExpanded must be used within an ExpandedProvider");
    }
    return context;
}
