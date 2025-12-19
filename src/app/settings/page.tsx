/***************************************************************
 *
 *                page.tsx
 *
 *         Author: Will and Hansini
 *           Date: 12/6/2025
 *
 *        Summary: Basic outline of settings page
 *
 **************************************************************/

"use client";

import { useState } from "react";
import { MultiSelect } from "../../components/ui/multi-select";
import { Trash, Plus } from "lucide-react";

export default function Settings() {
    const [selectedCities, setSelectedCities] = useState<string[]>([]);

    // Placeholder city options, eventually will be pulled from db
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

    const handleDeleteCity = (cityValue: string) => {
        setSelectedCities((prevCities) =>
            prevCities.filter((value) => value !== cityValue),
        );
        setHasUnsavedChanges(true);
    };

    const getCityLabel = (value: string) => {
        return cityOptions.find((opt) => opt.value === value)?.label || value;
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
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-medium">
                                Gateway Cities
                            </h3>
                        </div>
                        <div className="w-50">
                            <MultiSelect
                                options={cityOptions}
                                value={selectedCities}
                                onValueChange={handleCityChange}
                                placeholder="Select cities"
                                searchable
                            />
                        </div>
                        {selectedCities.length > 0 && (
                            <p className="text-sm text-gray-600">
                                {selectedCities.length}{" "}
                                {selectedCities.length === 1
                                    ? "city"
                                    : "cities"}{" "}
                                selected
                            </p>
                        )}
                        <div className="bg-white rounded-lg border border-gray-200 mt-4">
                            <table className="min-w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-sm font-medium text-gray-500 tracking-wider w-3/4 border-b border-gray-200"
                                        >
                                            City
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-center text-sm font-medium text-gray-500 tracking-wider w-1/4 border-b border-gray-200"
                                        >
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100">
                                    {selectedCities.map((cityValue) => (
                                        <tr
                                            key={cityValue}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-3 whitespace-nowrap text-base font-normal text-gray-900">
                                                {getCityLabel(cityValue)}
                                            </td>
                                            <td className="px-6 py-3 whitespace-nowrap text-sm text-center">
                                                <button
                                                    onClick={() =>
                                                        handleDeleteCity(
                                                            cityValue,
                                                        )
                                                    }
                                                    className="text-gray-400 hover:text-red-500 p-1 transition-colors duration-150 ease-in-out"
                                                    title={`Delete ${getCityLabel(cityValue)}`}
                                                >
                                                    <Trash className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Permitted Users Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-medium">
                                Permitted Users
                            </h3>
                        </div>

                        <p className="text-sm text-gray-600">
                            These emails are permitted to sign into the
                            platform. Here you can also revoke access
                        </p>
                        <div className="flex rounded-lg border border-gray-300 shadow-sm overflow-hidden w-60">
                            <input
                                type="email"
                                placeholder="Email"
                                aria-label="Email"
                                className="flex-1 px-4 py-2 text-base text-gray-700 placeholder-gray-500"
                            />
                            <button
                                type="button"
                                aria-label="Email"
                                className={`
                            bg-gray-200 hover:bg-gray-300 text-gray-600 transition-colors
                            w-12 flex items-center justify-center border-l border-gray-300`}
                            >
                                <Plus className="w-6 h-6" />
                            </button>
                        </div>

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
                                                    <Trash className="w-4 h-4"></Trash>
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
                <div className="flex items-center justify-between pt-6">
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                        <span>You have unsaved changes - save?</span>
                    </label>
                    <div className="flex gap-2">
                        <button
                            className="pl-2 pr-6 py-2 text-base text-gray-700 placeholder-gray-500
                            rounded-lg border border-gray-300 shadow-sm w-6"
                        >
                            <Trash className="h-4 w-4" />
                        </button>
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
                </div>
            </section>
        </div>
    );
}
