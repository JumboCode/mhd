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

import {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/Combobox";
import YearsOfData, { YearsOfDataHandle } from "@/components/YearsOfData";
import { Map, MapMarker, MarkerContent, useMap } from "@/components/ui/map";
import { toast } from "sonner";
import GatewaySchools, {
    GatewaySchoolsHandle,
} from "@/components/GatewaySchools";
import { standardize } from "@/lib/string-standardize";
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
    const gatewaySchoolsRef = useRef<GatewaySchoolsHandle>(null);
    const yearsOfDataRef = useRef<YearsOfDataHandle>(null);
    const { setOnNavigationAttempt } = useUnsavedChanges();
    const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState<string | null>(
        null,
    );

    const schoolLocationRef = useRef<SchoolLocationEditorHandle>(null);

    const handleSave = async () => {
        try {
            await Promise.all([
                gatewaySchoolsRef.current?.save(),
                yearsOfDataRef.current?.save(),
                schoolLocationRef.current?.save(),
            ]);
            setHasUnsavedChanges(false);
        } catch {
            // save was cancelled (e.g. user dismissed a confirmation dialog)
        }
    };

    const handleDiscard = () => {
        gatewaySchoolsRef.current?.discard();
        yearsOfDataRef.current?.discard();
        schoolLocationRef.current?.discard();
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
        handleDiscard();
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

    return (
        <div className="flex flex-col gap-12 p-8 max-w-4xl pb-24">
            <div>
                <h1 className="text-3xl font-bold">Settings</h1>
            </div>
            <div className="space-y-6">
                <div>
                    <h3 className="font-bold">Schools in Gateway Cities</h3>
                    <h4 className="mb-2">
                        Select schools that represent students from gateway
                        cities.
                    </h4>
                    <GatewaySchools
                        ref={gatewaySchoolsRef}
                        onUnsavedChange={() => setHasUnsavedChanges(true)}
                    />
                </div>
                <SchoolLocationEditor
                    ref={schoolLocationRef}
                    onUnsavedChange={() => setHasUnsavedChanges(true)}
                />
                <div className="space-y-3">
                    <h3 className="font-bold">Merge Schools</h3>
                    <h4 className="mb-2">
                        Move all data from one school into another. The merged
                        school will be permanently removed.
                    </h4>
                    <MergeSchools />
                </div>
                <div className="space-y-3">
                    <h3 className="font-bold">Available Data</h3>
                    <YearsOfData
                        ref={yearsOfDataRef}
                        onUnsavedChange={() => setHasUnsavedChanges(true)}
                    />
                </div>
            </div>

            <div
                className={`fixed bottom-0 left-56 right-0 z-50 flex items-center justify-between px-8 py-4 bg-white/20 backdrop-blur-md shadow-lg transition-transform duration-200 ease-in-out ${hasUnsavedChanges ? "translate-y-0" : "translate-y-full"}`}
            >
                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
                    You have unsaved changes — save?
                </span>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleDiscard}>
                        Discard Changes
                    </Button>
                    <Button size="sm" onClick={handleSave}>
                        Save
                    </Button>
                </div>
            </div>
            {/* If user tries to leave page with unsaved changes */}
            <Dialog open={showUnsavedDialog} onOpenChange={handleDialogCancel}>
                <DialogContent
                    showCloseButton={false}
                    onInteractOutside={(e) => e.preventDefault()}
                >
                    <DialogHeader>
                        <DialogTitle>Unsaved Changes</DialogTitle>
                        <DialogDescription>
                            You have unsaved changes. What would you like to do?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleDialogCancel}>
                            Cancel
                        </Button>
                        <Button variant="outline" onClick={handleDialogDiscard}>
                            Discard Changes
                        </Button>
                        <Button onClick={handleDialogSave}>Save</Button>
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

export interface SchoolLocationEditorHandle {
    save: () => Promise<void>;
    discard: () => void;
}

const SchoolLocationEditor = forwardRef<
    SchoolLocationEditorHandle,
    { onUnsavedChange: () => void }
>(function SchoolLocationEditor({ onUnsavedChange }, ref) {
    const [schools, setSchools] = useState<SchoolEntry[]>([]);
    const [selectedSchoolId, setSelectedSchoolId] = useState("");
    const [editing, setEditing] = useState(false);
    const [newPin, setNewPin] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        fetch("/api/schools?list=true")
            .then((res) => res.json())
            .then((data) => setSchools(data));
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
        setEditing(true);
        setNewPin(null);
    };

    const handleMapClick = useCallback(
        async (long: number, lat: number) => {
            let validLocation: boolean = false;

            try {
                const res = await fetch(
                    `/api/coordinate-to-region/?lat=${lat}&long=${long}`,
                );
                const data = await res.json();

                // Location is only in MA if it has a region
                if (res.ok && data.region) {
                    validLocation = true;
                } else {
                    toast.error(
                        "A school's location must fall within Massachusetts.",
                    );
                }
            } catch {
                toast.error("Error validating school location");
            }

            if (validLocation) {
                setNewPin({ latitude: lat, longitude: long });
                onUnsavedChange();
            }
        },
        [onUnsavedChange],
    );

    const handleSave = async () => {
        if (!newPin || !selectedSchool) return;

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
            setNewPin(null);
            toast.success(`Location updated for ${selectedSchool.name}`);
        } catch (err) {
            const errorMsg =
                err instanceof Error ? err.message : "Failed to save location";
            toast.error(errorMsg);
        }
    };

    const handleCancel = () => {
        setNewPin(null);
    };

    useImperativeHandle(ref, () => ({
        save: handleSave,
        discard: handleCancel,
    }));

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
                    </div>

                    <div className="text-sm">
                        {newPin ? (
                            <div className="bg-muted text-black px-2 rounded border">{`New location: ${newPin.latitude.toFixed(4)}, ${newPin.longitude.toFixed(4)}`}</div>
                        ) : (
                            "Click on the map to set a new location"
                        )}
                    </div>
                </div>
            )}
        </div>
    );
});
