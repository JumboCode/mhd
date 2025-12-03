"use client";

import { useState } from "react";
import { MultiSelect } from "../../components/ui/multi-select";

export default function Settings() {
    const [selectedCities, setSelectedCities] = useState<string[]>([]);

    // Placeholder city options (City 1, City 2, etc.)
    const cityOptions = [
        { value: "city-1", label: "City 1" },
        { value: "city-2", label: "City 2" },
        { value: "city-3", label: "City 3" },
        { value: "city-4", label: "City 4" },
        { value: "city-5", label: "City 5" },
        { value: "city-6", label: "City 6" },
        { value: "city-7", label: "City 7" },
        { value: "city-8", label: "City 8" },
    ];

    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const handleCityChange = (values: string[]) => {
        setSelectedCities(values);
        setHasUnsavedChanges(true);
    };

    const handleSave = () => {
        console.log("Saving cities:", selectedCities);
        setHasUnsavedChanges(false);
    };

    return (
        <div className="flex flex-col pl-50 gap-8 p-6 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold mb-8">Settings</h1>
            </div>

            <section className="space-y-3">
                <h2 className="text-2xl font-semibold">Preferences</h2>
                <p className="text-gray-600">
                    How would you like to view charts
                </p>
            </section>

            <section className="space-y-6">
                <div>
                    <h2 className="text-2xl font-semibold">Configuration</h2>
                    <p className="text-gray-600">
                        These settings configure how data is calculated. Only
                        edit these settings if you really mean to.
                    </p>
                </div>

                <div className="mt-6 space-y-6">
                    {/* Gateway Cities Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-medium">
                                Gateway Cities
                            </h3>
                        </div>

                        <MultiSelect
                            options={cityOptions}
                            value={selectedCities}
                            onValueChange={handleCityChange}
                            placeholder="Select gateway cities..."
                            searchable
                        />

                        {selectedCities.length > 0 && (
                            <p className="text-sm text-gray-600">
                                {selectedCities.length}{" "}
                                {selectedCities.length === 1
                                    ? "city"
                                    : "cities"}{" "}
                                selected
                            </p>
                        )}
                    </div>

                    {/* Permitted Users Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-medium">
                                Permitted Users
                            </h3>
                            <button className="px-4 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50">
                                Email
                            </button>
                        </div>

                        <p className="text-sm text-gray-600">
                            These emails are permitted to log into the system,
                            users can also transfer access.
                        </p>

                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                                            Email
                                        </th>
                                        <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                                            Last Signed In
                                        </th>
                                        <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                                            Remove
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {[
                                        {
                                            email: "something@gmail.com",
                                            lastSignIn: "2 days ago",
                                        },
                                        {
                                            email: "something@gmail.com",
                                            lastSignIn: "2 days ago",
                                        },
                                        {
                                            email: "something@gmail.com",
                                            lastSignIn: "2 days ago",
                                        },
                                    ].map((user, i) => (
                                        <tr
                                            key={i}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-4 py-3 text-sm">
                                                {user.email}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {user.lastSignIn}
                                            </td>
                                            <td className="px-4 py-3">
                                                <button className="text-gray-400 hover:text-gray-600">
                                                    <svg
                                                        className="w-5 h-5"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                        />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Save Section */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input
                            type="checkbox"
                            checked={hasUnsavedChanges}
                            onChange={(e) =>
                                setHasUnsavedChanges(e.target.checked)
                            }
                            className="rounded border-gray-300"
                        />
                        <span>You have unsaved changes - save?</span>
                    </label>
                    <button
                        onClick={handleSave}
                        disabled={!hasUnsavedChanges}
                        className={`px-6 py-2 rounded ${
                            hasUnsavedChanges
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                    >
                        Save
                    </button>
                </div>
            </section>
        </div>
    );
}
