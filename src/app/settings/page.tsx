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

import { useCallback, useEffect, useState } from "react";
import { MultiSelectCombobox } from "../../components/ui/multi-select-combobox";
import { Trash, Plus, Pencil } from "lucide-react";
import { Combobox } from "@/components/Combobox";
import {
    Map,
    MapMarker,
    MarkerContent,
    MapControls,
    useMap,
} from "@/components/ui/map";
import { toast } from "sonner";

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

                    {/* School Locations Section */}
                    <SchoolLocationEditor />

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
                <div className="flex items-center justify-between py-6">
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

// Helper: registers click events on the map for the settings editor
function SettingsMapClickHandler({
    onMapClick,
}: {
    onMapClick: (lng: number, lat: number) => void;
}) {
    const { map } = useMap();

    useEffect(() => {
        if (!map) return;

        const handleClick = (e: { lngLat: { lng: number; lat: number } }) => {
            onMapClick(e.lngLat.lng, e.lngLat.lat);
        };

        map.on("click", handleClick);
        map.getCanvas().style.cursor = "crosshair";

        return () => {
            map.off("click", handleClick);
            map.getCanvas().style.cursor = "";
        };
    }, [map, onMapClick]);

    return null;
}

interface SchoolEntry {
    id: number;
    name: string;
    latitude: number | null;
    longitude: number | null;
}

function SchoolLocationEditor() {
    const [schools, setSchools] = useState<SchoolEntry[]>([]);
    const [selectedSchoolId, setSelectedSchoolId] = useState("");
    const [editing, setEditing] = useState(false);
    const [newPin, setNewPin] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);
    const [saving, setSaving] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        fetch("/api/schools?list=true")
            .then((res) => res.json())
            .then((data) => setSchools(data))
            .catch(() => toast.error("Failed to load schools"));
    }, []);

    const selectedSchool = schools.find(
        (s) => String(s.id) === selectedSchoolId,
    );

    const schoolOptions = schools.map((s) => ({
        value: String(s.id),
        label: s.name,
    }));

    const handleSchoolChange = (value: string) => {
        setSelectedSchoolId(value);
        setEditing(false);
        setNewPin(null);
    };

    const handleMapClick = useCallback((lng: number, lat: number) => {
        setNewPin({ latitude: lat, longitude: lng });
    }, []);

    const handleSave = async () => {
        if (!newPin || !selectedSchool) return;

        setSaving(true);
        try {
            const encodedName = encodeURIComponent(
                selectedSchool.name.replace(/ /g, "-"),
            );
            const response = await fetch(`/api/schools/${encodedName}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    latitude: newPin.latitude,
                    longitude: newPin.longitude,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error || "Failed to update school location",
                );
            }

            // Update local state
            setSchools((prev) =>
                prev.map((s) =>
                    s.id === selectedSchool.id
                        ? {
                              ...s,
                              latitude: newPin.latitude,
                              longitude: newPin.longitude,
                          }
                        : s,
                ),
            );
            setEditing(false);
            setNewPin(null);
            toast.success(`Location updated for ${selectedSchool.name}`);
        } catch (err) {
            const errorMsg =
                err instanceof Error ? err.message : "Failed to save location";
            toast.error(errorMsg);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setEditing(false);
        setNewPin(null);
    };

    const mapCenter: [number, number] =
        selectedSchool?.longitude != null && selectedSchool?.latitude != null
            ? [selectedSchool.longitude, selectedSchool.latitude]
            : [-72, 42.272];

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="font-bold">School Locations</h3>
            </div>
            <p className="text-sm text-gray-600">
                Search for a school to view and edit its location on the map.
            </p>
            <div className="w-72">
                <Combobox
                    options={schoolOptions}
                    value={selectedSchoolId}
                    onChange={handleSchoolChange}
                    placeholder="Search for a school..."
                />
            </div>

            {selectedSchool && mounted && (
                <div className="space-y-3">
                    <div className="h-80 rounded-lg overflow-hidden border border-gray-200 relative">
                        <Map
                            key={selectedSchool.id}
                            center={mapCenter}
                            zoom={12}
                            scrollZoom={true}
                            dragPan={true}
                            dragRotate={false}
                            doubleClickZoom={editing}
                            touchZoomRotate={editing}
                        >
                            {/* Current school location (red) */}
                            {selectedSchool.latitude != null &&
                                selectedSchool.longitude != null && (
                                    <MapMarker
                                        longitude={selectedSchool.longitude}
                                        latitude={selectedSchool.latitude}
                                    >
                                        <MarkerContent>
                                            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500/60 border-2 border-red-500 shadow-lg" />
                                        </MarkerContent>
                                    </MapMarker>
                                )}
                            {/* New pin (blue) */}
                            {newPin && (
                                <MapMarker
                                    longitude={newPin.longitude}
                                    latitude={newPin.latitude}
                                >
                                    <MarkerContent>
                                        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500/60 border-2 border-blue-500 shadow-lg" />
                                    </MarkerContent>
                                </MapMarker>
                            )}
                            {editing && (
                                <SettingsMapClickHandler
                                    onMapClick={handleMapClick}
                                />
                            )}
                        </Map>
                        {!editing && (
                            <button
                                onClick={() => setEditing(true)}
                                className="absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-gray-50 transition-colors"
                            >
                                <Pencil className="h-3.5 w-3.5" />
                                Edit Location
                            </button>
                        )}
                    </div>

                    {editing && (
                        <div className="flex items-center justify-between">
                            <div className="text-sm">
                                {newPin ? (
                                    <div className="bg-muted text-black px-2 rounded border">{`New location: ${newPin.latitude.toFixed(4)}, ${newPin.longitude.toFixed(4)}`}</div>
                                ) : (
                                    "Click on the map to set a new location"
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleCancel}
                                    className="rounded-md border border-gray-300 px-4 py-1.5 text-sm font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={!newPin || saving}
                                    className={`rounded-md px-4 py-1.5 text-sm font-medium text-white transition-colors ${
                                        newPin && !saving
                                            ? "bg-blue-600 hover:bg-blue-700"
                                            : "bg-gray-300 cursor-not-allowed"
                                    }`}
                                >
                                    {saving ? "Saving..." : "Save"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
