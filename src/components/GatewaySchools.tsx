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
}

export default function GatewaySchools() {
    const [schools, setSchools] = useState<SchoolEntry[]>([]);
    const [selectedSchoolId, setSelectedSchoolId] = useState("");
    const [gatewaySchools, setGatewaySchools] = useState<SchoolEntry[]>([]);

    // Load all schools
    useEffect(() => {
        fetch("/api/schools?list=true")
            .then((res) => res.json())
            .then((data) => setSchools(data))
            .catch(() => toast.error("Failed to load schools"));
    }, []);

    const schoolOptions = schools.map((s) => ({
        value: String(s.id),
        label: s.name,
    }));

    const handleAddSchool = (value: string) => {
        setSelectedSchoolId(value);

        const school = schools.find((s) => String(s.id) === value);
        if (!school) return;

        // prevent duplicates
        if (gatewaySchools.some((s) => s.id === school.id)) {
            toast("School already added");
            return;
        }

        setGatewaySchools((prev) => [...prev, school]);
    };

    const handleRemoveSchool = (id: number) => {
        setGatewaySchools((prev) => prev.filter((s) => s.id !== id));
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
