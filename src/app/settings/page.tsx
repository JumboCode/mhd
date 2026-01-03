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
import { MultiSelectCombobox } from "../../components/ui/multi-select-combobox";
import { Trash, Plus } from "lucide-react";

interface PermittedUser {
    email: string;
    lastSignIn: string;
}

export default function Settings() {
    const [selectedCities, setSelectedCities] = useState<string[]>([]);
    const [emailInput, setEmailInput] = useState("");
    const [permittedUsers, setPermittedUsers] = useState<PermittedUser[]>([
        {
            email: "something@mhd.com",
            lastSignIn: "3 days ago",
        },
        {
            email: "something@mhd.com",
            lastSignIn: "3 days ago",
        },
        {
            email: "something@mhd.com",
            lastSignIn: "3 days ago",
        },
    ]);

    // TO DO: Replace with actual gateway cities
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

    // Email validation function
    const isValidEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Add permitted user
    const handleAddUser = () => {
        const trimmedEmail = emailInput.trim();

        // Validate email format
        if (!isValidEmail(trimmedEmail)) {
            alert("Please enter a valid email address");
            return;
        }

        // Check for duplicates
        if (
            permittedUsers.some(
                (user) =>
                    user.email.toLowerCase() === trimmedEmail.toLowerCase(),
            )
        ) {
            alert("This email is already in the permitted users list");
            return;
        }

        // Add new user
        setPermittedUsers([
            ...permittedUsers,
            {
                email: trimmedEmail,
                lastSignIn: "3 days ago", // Mock data as requested
            },
        ]);

        // Clear input
        setEmailInput("");
        setHasUnsavedChanges(true);
    };

    // Remove permitted user
    const handleRemoveUser = (email: string) => {
        setPermittedUsers(
            permittedUsers.filter((user) => user.email !== email),
        );
        setHasUnsavedChanges(true);
    };

    // Handle Enter key press
    const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleAddUser();
        }
    };

    return (
        <div className="flex flex-col gap-12 p-6 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold">Settings</h1>
            </div>

            <section className="space-y-6">
                <h2 className="text-xl font-semibold">Preferences</h2>
                <p className="text-gray-600">
                    How would you like to view charts...
                </p>
            </section>

            <section className="space-y-6">
                <div>
                    <h2 className="text-xl font-semibold">Configuration</h2>
                    <p className="text-gray-600">
                        These settings configure how data is calculated. Only
                        edit these settings if you really mean to.
                    </p>
                </div>

                <div className="mt-6 space-y-6">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold">Gateway Cities</h3>
                        </div>
                        <div className="w-50 flex flex-row justify-between ">
                            <MultiSelectCombobox
                                options={cityOptions}
                                value={selectedCities}
                                onValueChange={handleCityChange}
                                placeholder="Select cities"
                                searchable
                            />
                            {/* TO DO: Once we have map, add toggle between map and table generated below */}
                        </div>
                        {selectedCities.length > 0 && (
                            <>
                                <p className="text-sm text-gray-600">
                                    {selectedCities.length}{" "}
                                    {selectedCities.length === 1
                                        ? "city"
                                        : "cities"}{" "}
                                    selected
                                </p>
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
                                                        {getCityLabel(
                                                            cityValue,
                                                        )}
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
                            </>
                        )}
                    </div>

                    {/* Permitted Users Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold">Permitted Users</h3>
                        </div>

                        <p className="text-sm text-gray-600">
                            These emails are permitted to sign into the
                            platform. Here you can also revoke access
                        </p>
                        <div className="flex rounded-lg border border-gray-300 shadow-sm overflow-hidden w-72">
                            <input
                                type="email"
                                placeholder="Email"
                                aria-label="Email"
                                value={emailInput}
                                onChange={(e) => setEmailInput(e.target.value)}
                                onKeyDown={handleEmailKeyDown}
                                className="flex-1 px-4 py-1 text-base text-gray-700 placeholder-gray-500 outline-none"
                            />
                            <button
                                type="button"
                                onClick={handleAddUser}
                                aria-label="Add Email"
                                className="bg-gray-200 hover:bg-gray-300 text-gray-600 transition-colors w-8 flex items-center justify-center border-l border-gray-300"
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
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {permittedUsers.map((user, i) => (
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
                                            <td className="p-4">
                                                <button
                                                    onClick={() =>
                                                        handleRemoveUser(
                                                            user.email,
                                                        )
                                                    }
                                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                                    aria-label={`Remove ${user.email}`}
                                                >
                                                    <Trash className="w-4 h-4" />
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
                            className={`px-6 py-2 rounded-lg ${
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
