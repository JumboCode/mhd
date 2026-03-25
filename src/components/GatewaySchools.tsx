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
import { Trash } from "lucide-react";
import { toast } from "sonner";
import { standardize } from "@/lib/school-name-standardize";

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
    { onUnsavedChange?: () => void }
>(function GatewaySchools({ onUnsavedChange }, ref) {
    const [schools, setSchools] = useState<SchoolEntry[]>([]);
    const [gatewaySchools, setGatewaySchools] = useState<SchoolEntry[]>([]);
    const [selectedSchoolId, setSelectedSchoolId] = useState("");
    const [pendingAdditions, setPendingAdditions] = useState<SchoolEntry[]>([]);
    const [pendingRemovals, setPendingRemovals] = useState<SchoolEntry[]>([]);

    // Load all schools for dropdown
    useEffect(() => {
        fetch("/api/schools?list=true")
            .then((res) => res.json())
            .then((data) => setSchools(data))
            .catch(() => toast.error("Failed to load schools"));
    }, []);

    // Load only gateway schools on mount
    useEffect(() => {
        fetch("/api/schools?gateway=true&list=true")
            .then((res) => res.json())
            .then((data) => setGatewaySchools(data))
            .catch(() => toast.error("Failed to load gateway schools"));
    }, []);

    const schoolOptions = schools.map((s) => ({
        value: String(s.id),
        label: s.name,
    }));

    /**
     * Adds a school as a gateway school.
     * Updates UI and stages the change without making an API call.
     *
     * @param value ID of the school to add
     */
    const handleAddSchool = (value: string) => {
        setSelectedSchoolId(value);
        const school = schools.find((s) => String(s.id) === value);
        if (!school) return;
        if (gatewaySchools.some((s) => s.id === school.id)) {
            toast("School already added");
            return;
        }
        setGatewaySchools((prev) => [...prev, school]);
        setPendingAdditions((prev) => [...prev, school]);
        setPendingRemovals((prev) => prev.filter((s) => s.id !== school.id));
        onUnsavedChange?.();
    };

    /**
     * Removes a school from the gateway list.
     * Updates UI and stages the change without making an API call.
     *
     * @param id ID of the school to remove
     */
    const handleRemoveSchool = (id: number) => {
        const school = gatewaySchools.find((s) => s.id === id);
        if (!school) return;
        setGatewaySchools((prev) => prev.filter((s) => s.id !== id));
        setPendingRemovals((prev) => [...prev, school]);
        setPendingAdditions((prev) => prev.filter((s) => s.id !== id));
        onUnsavedChange?.();
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
                setPendingAdditions([]);
                setPendingRemovals([]);
                toast.success("Gateway schools saved");
            } catch {
                toast.error("Failed to save gateway schools");
            }
        },
        discard: () => {
            setGatewaySchools((prev) => {
                const withoutAdditions = prev.filter(
                    (s) => !pendingAdditions.some((a) => a.id === s.id),
                );
                return [...withoutAdditions, ...pendingRemovals];
            });
            setPendingAdditions([]);
            setPendingRemovals([]);
        },
    }));

    return (
        <div className="space-y-3">
            <div className="w-72 w-fit">
                <Combobox
                    options={schoolOptions}
                    value={selectedSchoolId}
                    onChange={handleAddSchool}
                    placeholder="Search for a school..."
                />
            </div>

            <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                        <tr className="divide-x-2 divide-gray-200">
                            <th className="text-center px-4 py-3 text-sm font-medium text-gray-500 w-[80%]">
                                School
                            </th>
                            <th className="text-center px-4 py-3 text-sm font-medium text-gray-500">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {gatewaySchools.length > 0 ? (
                            gatewaySchools.map((school) => (
                                <tr
                                    key={school.id}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="px-4 py-3 text-sm w-[80%]">
                                        {school.name}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-center">
                                        <button
                                            onClick={() =>
                                                handleRemoveSchool(school.id)
                                            }
                                            className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                                            aria-label={`Remove ${school.name}`}
                                        >
                                            <Trash className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={2}
                                    className="px-4 py-3 text-sm text-gray-500 text-center"
                                >
                                    No gateway schools
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
});

export default GatewaySchools;
