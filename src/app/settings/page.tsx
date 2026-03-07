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
import { Trash, Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/Combobox";
import YearsOfData from "@/components/YearsOfData";
import { Map, MapMarker, MarkerContent, useMap } from "@/components/ui/map";
import { toast } from "sonner";
import GatewaySchools from "@/components/GatewaySchools";
import { standardize } from "@/lib/school-name-standardize";

interface PermittedUser {
    email: string;
    lastSignIn: string;
}

export default function Settings() {
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

    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const handleSave = () => {
        setHasUnsavedChanges(false);
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
                            <h3 className="font-bold">Gateway Schools</h3>
                        </div>
                        <GatewaySchools />
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

                    <div className="mt-6 space-y-6">
                        <div className="space-y-3">
                            <div className="space-y-6 w-full">
                                <h3 className="font-bold">Available Data</h3>
                                <YearsOfData />
                            </div>
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
            const slugName = standardize(selectedSchool.name);
            const response = await fetch(`/api/schools/${slugName}`, {
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
        selectedSchool?.longitude && selectedSchool?.latitude
            ? [selectedSchool?.longitude, selectedSchool?.latitude]
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
                            theme="light"
                            scrollZoom={true}
                            dragPan={true}
                            dragRotate={false}
                            doubleClickZoom={editing}
                            touchZoomRotate={editing}
                        >
                            {/* Current school location (red) */}
                            {selectedSchool.latitude &&
                                selectedSchool.longitude && (
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
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditing(true)}
                                className="absolute top-3 right-3 z-10 shadow-sm"
                            >
                                <Pencil className="h-3.5 w-3.5" />
                                Edit Location
                            </Button>
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
                                <Button
                                    variant="outline"
                                    onClick={handleCancel}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    disabled={!newPin || saving}
                                >
                                    {saving ? "Saving..." : "Save"}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
