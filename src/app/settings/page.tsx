/***************************************************************
 *
 *                page.tsx
 *
 *         Author: Will, Hansini, and Justin
 *           Date: 12/6/2025
 *
 *        Summary: Basic outline of settings page
 *
 **************************************************************/

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Trash, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/Combobox";
import YearsOfData, { YearsOfDataHandle } from "@/components/YearsOfData";
import { Map, MapMarker, MarkerContent, useMap } from "@/components/ui/map";
import { toast } from "sonner";
import GatewaySchools, {
    GatewaySchoolsHandle,
} from "@/components/GatewaySchools";
import { standardize } from "@/lib/school-name-standardize";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PermittedUsers from "@/components/PermittedUsers";
import { useRouter } from "next/navigation";
import { useUnsavedChanges } from "@/components/UnsavedChangesContext";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

export default function Settings() {
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const router = useRouter();
    const { setOnNavigationAttempt } = useUnsavedChanges();
    const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState<string | null>(
        null,
    );

    const handleSave = async () => {
        await Promise.all([
            gatewaySchoolsRef.current?.save(),
            yearsOfDataRef.current?.save(),
        ]);
        setHasUnsavedChanges(false);
    };

    const handleDiscard = () => {
        gatewaySchoolsRef.current?.discard();
        yearsOfDataRef.current?.discard();
        setHasUnsavedChanges(false);
    };

    const handleNavigationAttempt = useCallback(
        (href: string) => {
            if (hasUnsavedChanges) {
                setPendingNavigation(href);
                setShowUnsavedDialog(true);
            } else {
                router.push(href);
            }
        },
        [hasUnsavedChanges, router],
    );

    useEffect(() => {
        setOnNavigationAttempt(() => handleNavigationAttempt);
    }, [handleNavigationAttempt, setOnNavigationAttempt]);

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () =>
            window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [hasUnsavedChanges]);

    const handleDialogDiscard = () => {
        gatewaySchoolsRef.current?.discard();
        yearsOfDataRef.current?.discard();
        setHasUnsavedChanges(false);
        setShowUnsavedDialog(false);
        if (pendingNavigation) router.push(pendingNavigation);
        setPendingNavigation(null);
    };

    const handleDialogSave = async () => {
        await handleSave();
        setShowUnsavedDialog(false);
        if (pendingNavigation) router.push(pendingNavigation);
        setPendingNavigation(null);
    };

    const handleDialogCancel = () => {
        setShowUnsavedDialog(false);
        setPendingNavigation(null);
    };

    const gatewaySchoolsRef = useRef<GatewaySchoolsHandle>(null);
    const yearsOfDataRef = useRef<YearsOfDataHandle>(null);

    return (
        <div className="flex flex-col gap-12 p-6 max-w-4xl pb-24">
            <div>
                <h1 className="text-3xl font-bold">Settings</h1>
            </div>
            <Tabs defaultValue="data-management">
                <TabsList>
                    <TabsTrigger value="data-management">
                        Data Management
                    </TabsTrigger>
                    <TabsTrigger value="team-access">Team & Access</TabsTrigger>
                </TabsList>
                {/* Data management tab */}
                <TabsContent value="data-management" className="mt-6 space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold">Preferences</h2>
                        <p className="text-gray-600">
                            How would you like to view charts...
                        </p>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold">Configuration</h2>
                        <p className="text-gray-600">
                            These settings configure how data is calculated.
                            Only edit these settings if you really mean to.
                        </p>
                    </div>
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <h3 className="font-bold">Gateway Cities</h3>
                            <GatewaySchools
                                ref={gatewaySchoolsRef}
                                onUnsavedChange={() =>
                                    setHasUnsavedChanges(true)
                                }
                            />
                        </div>
                        <SchoolLocationEditor />
                        <div className="space-y-3">
                            <h3 className="font-bold">Available Data</h3>
                            <YearsOfData
                                ref={yearsOfDataRef}
                                onUnsavedChange={() =>
                                    setHasUnsavedChanges(true)
                                }
                            />
                        </div>
                    </div>
                </TabsContent>

                {/* Team and access tab */}
                <TabsContent value="team-access" className="mt-6 space-y-5">
                    <PermittedUsers
                        onUnsavedChange={() => setHasUnsavedChanges(true)}
                    />
                </TabsContent>
            </Tabs>

            {hasUnsavedChanges && (
                <div className="fixed bottom-0 left-56 right-0 z-50 flex items-center justify-between px-8 py-4 bg-white border-t border-gray-200 shadow-lg">
                    <span className="text-sm text-gray-600">
                        You have unsaved changes
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={handleDiscard}
                            className="pl-2 pr-2 py-2 text-base text-gray-700 rounded-lg border border-gray-300 shadow-sm flex items-center gap-2 hover:bg-gray-100"
                        >
                            <Trash className="h-4 w-4" />
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                        >
                            Save
                        </button>
                    </div>
                </div>
            )}
            {/* If user tries to leave page with unsaved changes */}
            <Dialog open={showUnsavedDialog} onOpenChange={handleDialogCancel}>
                <DialogContent onInteractOutside={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle>Unsaved Changes</DialogTitle>
                        <DialogDescription>
                            You have unsaved changes. What would you like to do?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <button
                            onClick={handleDialogCancel}
                            className="px-4 py-2 text-sm text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDialogDiscard}
                            className="px-4 py-2 text-sm text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50"
                        >
                            Discard Changes
                        </button>
                        <button
                            onClick={handleDialogSave}
                            className="px-6 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                        >
                            Save
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
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
            <div className="min-w-72 w-fit">
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
