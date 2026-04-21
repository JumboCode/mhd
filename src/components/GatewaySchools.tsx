/***************************************************************
 *
 *                /components/GatewaySchools.tsx
 *
 *         Author: Zander & Anne
 *           Date: 3/1/2026
 *
 *        Summary: Component for displaying current gateway
 *                 schools and modifying this flag for each.
 *
 **************************************************************/

"use client";

import { useEffect, useState, useImperativeHandle, forwardRef } from "react";
import { Combobox } from "@/components/Combobox";
import { Plus, Trash, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { LoadError } from "@/components/ui/load-error";
import { Skeleton } from "@/components/ui/skeleton";
import { standardize } from "@/lib/string-standardize";

/**
 * Represents a single school entry in the system.
 */
interface SchoolEntry {
    id: number;
    name: string;
    latitude: number | null;
    longitude: number | null;
    gateway?: boolean;
}

/**
 * Represents the imperative handle for GatewaySchools component.
 */
export interface GatewaySchoolsHandle {
    save: () => Promise<void>;
    discard: () => void;
}

/**
 * React component for managing gateway schools.
 *
 * - Loads all schools for selection
 * - Displays current gateway schools in a table
 * - Allows adding/removing schools from gateway status
 */
const GatewaySchools = forwardRef<
    GatewaySchoolsHandle,
    { onDirtyChange?: (isDirty: boolean) => void }
>(function GatewaySchools({ onDirtyChange }, ref) {
    const [schools, setSchools] = useState<SchoolEntry[]>([]);
    const [gatewaySchools, setGatewaySchools] = useState<SchoolEntry[]>([]);
    const [originalGatewayIds, setOriginalGatewayIds] = useState<Set<number>>(
        new Set(),
    );
    const [selectedSchoolId, setSelectedSchoolId] = useState("");
    const [pendingAdditions, setPendingAdditions] = useState<SchoolEntry[]>([]);
    const [pendingRemovals, setPendingRemovals] = useState<SchoolEntry[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load all schools for dropdown and gateway schools
    const fetchData = () => {
        setError(null);
        Promise.all([
            fetch("/api/schools?list=true").then((res) => res.json()),
            fetch("/api/schools?gateway=true&list=true").then((res) =>
                res.json(),
            ),
        ])
            .then(([allSchools, gatewaySchoolsData]) => {
                setSchools(allSchools);
                setGatewaySchools(gatewaySchoolsData);
                setOriginalGatewayIds(
                    new Set(gatewaySchoolsData.map((s: SchoolEntry) => s.id)),
                );
                setError(null);
            })
            .catch(() => {
                setError("Failed to load schools data");
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    useEffect(() => {
        fetchData();
    }, []);

    const schoolOptions = schools.map((s) => ({
        value: String(s.id),
        label: s.name,
    }));

    /**
     * Adds a school as a gateway school (or undoes a pending removal).
     * Updates UI and stages the change without making an API call.
     */
    const handleAddSchool = (value: string) => {
        setSelectedSchoolId(value);
        const school = schools.find((s) => String(s.id) === value);
        if (!school) return;

        // If pending removal, selecting it again undoes the removal
        if (pendingRemovals.some((s) => s.id === school.id)) {
            const newRemovals = pendingRemovals.filter(
                (s) => s.id !== school.id,
            );
            setPendingRemovals(newRemovals);
            onDirtyChange?.(
                pendingAdditions.length > 0 || newRemovals.length > 0,
            );
            return;
        }

        if (gatewaySchools.some((s) => s.id === school.id)) {
            toast("School already added");
            return;
        }

        setGatewaySchools((prev) => [...prev, school]);
        const newAdditions = [...pendingAdditions, school];
        setPendingAdditions(newAdditions);
        onDirtyChange?.(newAdditions.length > 0 || pendingRemovals.length > 0);
    };

    /**
     * Removes a school from the gateway list.
     * - If it's an originally-loaded gateway school, marks it as pending removal (keeps in list).
     * - If it's a pending addition, removes it from the list entirely.
     */
    const handleRemoveSchool = (id: number) => {
        const school = gatewaySchools.find((s) => s.id === id);
        if (!school) return;

        if (originalGatewayIds.has(id)) {
            // Mark as pending removal — keep in list, styled differently
            const newRemovals = [...pendingRemovals, school];
            setPendingRemovals(newRemovals);
            onDirtyChange?.(
                pendingAdditions.length > 0 || newRemovals.length > 0,
            );
        } else {
            // It was a pending addition — just remove it from the list
            setGatewaySchools((prev) => prev.filter((s) => s.id !== id));
            const newAdditions = pendingAdditions.filter((s) => s.id !== id);
            setPendingAdditions(newAdditions);
            onDirtyChange?.(
                newAdditions.length > 0 || pendingRemovals.length > 0,
            );
        }
    };

    /**
     * Undoes a pending removal, restoring the school to its normal state.
     */
    const handleUndoRemoval = (id: number) => {
        const newRemovals = pendingRemovals.filter((s) => s.id !== id);
        setPendingRemovals(newRemovals);
        onDirtyChange?.(pendingAdditions.length > 0 || newRemovals.length > 0);
    };

    useImperativeHandle(ref, () => ({
        save: async () => {
            try {
                await Promise.all([
                    ...pendingAdditions.map((school) =>
                        fetch(
                            `/api/schools/${standardize(school.name)}/gateway`,
                            {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ gateway: true }),
                            },
                        ),
                    ),
                    ...pendingRemovals.map((school) =>
                        fetch(
                            `/api/schools/${standardize(school.name)}/gateway`,
                            {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ gateway: false }),
                            },
                        ),
                    ),
                ]);
                const hadChanges =
                    pendingAdditions.length > 0 || pendingRemovals.length > 0;
                // Remove pending-removal schools from the visible list
                setGatewaySchools((prev) =>
                    prev.filter(
                        (s) => !pendingRemovals.some((r) => r.id === s.id),
                    ),
                );
                const saved = new Set([
                    ...Array.from(originalGatewayIds),
                    ...pendingAdditions.map((s) => s.id),
                ]);
                pendingRemovals.forEach((s) => saved.delete(s.id));
                setOriginalGatewayIds(saved);
                setPendingAdditions([]);
                setPendingRemovals([]);
                onDirtyChange?.(false);
                if (hadChanges) toast.success("Gateway schools saved");
            } catch {
                toast.error("Failed to save gateway schools");
            }
        },
        discard: () => {
            // Remove pending additions, keep pending removals in list
            setGatewaySchools((prev) =>
                prev.filter(
                    (s) => !pendingAdditions.some((a) => a.id === s.id),
                ),
            );
            setPendingAdditions([]);
            setPendingRemovals([]);
            onDirtyChange?.(false);
        },
    }));

    return (
        <div className="space-y-3">
            {error ? (
                <LoadError
                    message={error}
                    onRetry={fetchData}
                    className="py-8"
                />
            ) : (
                <>
                    <div className="w-72 w-fit">
                        <Combobox
                            options={schoolOptions}
                            value={selectedSchoolId}
                            onChange={handleAddSchool}
                            placeholder="Search for a school..."
                            checkedValues={gatewaySchools
                                .filter(
                                    (s) =>
                                        !pendingRemovals.some(
                                            (r) => r.id === s.id,
                                        ),
                                )
                                .map((s) => String(s.id))}
                        />
                    </div>

                    <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b-2 border-gray-200">
                                <tr className="divide-x-2 divide-gray-200">
                                    <th className="text-center px-4 py-3 text-sm font-medium text-gray-500 w-[60%]">
                                        School
                                    </th>
                                    <th className="text-center px-4 py-3 text-sm font-medium text-gray-500 w-[25%]">
                                        Status
                                    </th>
                                    <th className="text-center px-4 py-3 text-sm font-medium text-gray-500 w-[15%]">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {isLoading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <tr key={i}>
                                            <td className="px-4 py-3 w-[60%]">
                                                <Skeleton className="h-4 w-48" />
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <Skeleton className="h-4 w-16 mx-auto" />
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <Skeleton className="h-4 w-4 mx-auto" />
                                            </td>
                                        </tr>
                                    ))
                                ) : gatewaySchools.length > 0 ? (
                                    gatewaySchools.map((school) => {
                                        const isPendingAdd =
                                            pendingAdditions.some(
                                                (s) => s.id === school.id,
                                            );
                                        const isPendingRemove =
                                            pendingRemovals.some(
                                                (s) => s.id === school.id,
                                            );
                                        return (
                                            <tr
                                                key={school.id}
                                                className={
                                                    isPendingRemove
                                                        ? "bg-red-50"
                                                        : isPendingAdd
                                                          ? "bg-green-50"
                                                          : "hover:bg-gray-50"
                                                }
                                            >
                                                <td
                                                    className={`px-4 py-3 text-sm w-[60%] ${isPendingRemove ? "line-through text-gray-400" : ""}`}
                                                >
                                                    {school.name}
                                                </td>
                                                <td className="px-4 py-2 text-sm text-center">
                                                    <div className="flex items-center justify-center">
                                                        {isPendingRemove ? (
                                                            <span className="inline-flex items-center justify-center gap-1.5 w-24 px-3 py-1 rounded-sm text-xs font-medium bg-red-100 text-red-600 border border-red-300">
                                                                <Trash className="w-3 h-3" />
                                                                Removing
                                                            </span>
                                                        ) : isPendingAdd ? (
                                                            <span className="inline-flex items-center justify-center gap-1.5 w-24 px-3 py-1 rounded-sm text-xs font-medium bg-green-100 text-green-700 border border-green-300">
                                                                <Plus className="w-3 h-3" />
                                                                Adding
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                </td>
                                                <td className="text-sm p-0">
                                                    {isPendingRemove ? (
                                                        <button
                                                            onClick={() =>
                                                                handleUndoRemoval(
                                                                    school.id,
                                                                )
                                                            }
                                                            className="w-full h-full px-4 py-3 flex items-center justify-center text-red-400 hover:text-gray-500 transition-colors cursor-pointer"
                                                            aria-label={`Undo remove ${school.name}`}
                                                        >
                                                            <Undo2 className="w-4 h-4" />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() =>
                                                                handleRemoveSchool(
                                                                    school.id,
                                                                )
                                                            }
                                                            className="w-full h-full px-4 py-3 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                                                            aria-label={`Remove ${school.name}`}
                                                        >
                                                            <Trash className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={3}
                                            className="px-4 py-3 text-sm text-gray-500 text-center"
                                        >
                                            No gateway schools
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
});

export default GatewaySchools;
