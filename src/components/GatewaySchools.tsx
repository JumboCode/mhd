"use client";

import { useEffect, useState } from "react";
import { Combobox } from "@/components/Combobox";
import { Trash } from "lucide-react";
import { toast } from "sonner";

interface SchoolEntry {
    id: number;
    name: string;
    latitude: number | null;
    longitude: number | null;
    gateway?: boolean;
}

export default function GatewaySchools() {
    const [schools, setSchools] = useState<SchoolEntry[]>([]);
    const [gatewaySchools, setGatewaySchools] = useState<SchoolEntry[]>([]);
    const [selectedSchoolId, setSelectedSchoolId] = useState("");

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

    // Add school as gateway
    const handleAddSchool = async (value: string) => {
        setSelectedSchoolId(value);

        const school = schools.find((s) => String(s.id) === value);
        if (!school) return;

        if (gatewaySchools.some((s) => s.id === school.id)) {
            toast("School already added");
            return;
        }

        // Optimistic update
        setGatewaySchools((prev) => [...prev, school]);

        try {
            const res = await fetch(`/api/schools/${school.name}/gateway`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ gateway: true }),
            });

            if (!res.ok) throw new Error("Failed to update school");
            toast.success(`${school.name} set as gateway`);
        } catch (err) {
            setGatewaySchools((prev) => prev.filter((s) => s.id !== school.id));
            toast.error(
                err instanceof Error ? err.message : "Failed to add school",
            );
        }
    };

    // Remove school as gateway
    const handleRemoveSchool = async (id: number) => {
        const school = gatewaySchools.find((s) => s.id === id);
        if (!school) return;

        // Optimistic update
        setGatewaySchools((prev) => prev.filter((s) => s.id !== id));

        try {
            const res = await fetch(`/api/schools/${school.name}/gateway`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ gateway: false }),
            });

            if (!res.ok) throw new Error("Failed to update school");
            toast.success(`${school.name} removed as gateway`);
        } catch (err) {
            // Revert optimistic update on failure
            setGatewaySchools((prev) => [...prev, school]);
            toast.error(
                err instanceof Error ? err.message : "Failed to remove school",
            );
        }
    };

    return (
        <div className="space-y-3">
            <p className="text-sm text-gray-600">
                Select schools to include as gateway schools.
            </p>

            {/* Dropdown */}
            <div className="w-72">
                <Combobox
                    options={schoolOptions}
                    value={selectedSchoolId}
                    onChange={handleAddSchool}
                    placeholder="Search for a school..."
                />
            </div>

            {/* Table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                                School
                            </th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
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
                                    <td className="px-4 py-3 text-sm">
                                        {school.name}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <button
                                            onClick={() =>
                                                handleRemoveSchool(school.id)
                                            }
                                            className="text-gray-400 hover:text-red-500 transition-colors"
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
}
