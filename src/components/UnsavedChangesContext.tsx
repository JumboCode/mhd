/***************************************************************
 *
 *                UnsavedChangesContext.tsx
 *
 *         Author: Justin
 *           Date: 3/25/2026
 *
 *        Summary: Context for handling unsaved changes
 *        in the settings page.
 *
 **************************************************************/

"use client";

import { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";

interface UnsavedChangesContextType {
    hasUnsavedChanges: boolean;
    setHasUnsavedChanges: (value: boolean) => void;
    onNavigationAttempt: (href: string) => void;
    setOnNavigationAttempt: (fn: (href: string) => void) => void;
}

const UnsavedChangesContext = createContext<UnsavedChangesContextType | null>(
    null,
);

export function UnsavedChangesProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const router = useRouter();
    const [onNavigationAttempt, setOnNavigationAttempt] = useState<
        (href: string) => void
    >(() => (href: string) => router.push(href));

    return (
        <UnsavedChangesContext.Provider
            value={{
                hasUnsavedChanges,
                setHasUnsavedChanges,
                onNavigationAttempt,
                setOnNavigationAttempt,
            }}
        >
            {children}
        </UnsavedChangesContext.Provider>
    );
}

export function useUnsavedChanges() {
    const ctx = useContext(UnsavedChangesContext);
    if (!ctx)
        throw new Error(
            "useUnsavedChanges must be used within UnsavedChangesProvider",
        );
    return ctx;
}
