/***************************************************************
 *
 *                SchoolLocationEditor.tsx
 *
 *         Author: Will, Hansini, and Justin
 *           Date: 12/6/2025
 *
 *        Summary: Inline map editor for updating a school's location.
 *                 Used on settings page (with school selector dropdown)
 *                 and on the school profile page (locked to a specific school).
 *
 **************************************************************/

"use client";

import {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useState,
} from "react";
import Image from "next/image";
import { Map, MapMarker, MarkerContent, useMap } from "@/components/ui/map";
import { Combobox } from "@/components/Combobox";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { standardize } from "@/lib/string-standardize";

// Registers crosshair click events on the map
function MapClickHandler({
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

type SchoolLocationEditorProps = {
    onUnsavedChange?: () => void;
    /**
     * When provided, hides the school selector dropdown and locks the editor
     * to this specific school. Save/Cancel buttons are shown inline.
     */
    fixedSchool?: { name: string };
};

export const SchoolLocationEditor = forwardRef<
    SchoolLocationEditorHandle,
    SchoolLocationEditorProps
>(function SchoolLocationEditor(
    { onUnsavedChange = () => {}, fixedSchool },
    ref,
) {
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

    // When locked to a fixed school, auto-select it once the list loads
    useEffect(() => {
        if (!fixedSchool || schools.length === 0) return;
        const match = schools.find(
            (s) => standardize(s.name) === standardize(fixedSchool.name),
        );
        if (match) {
            setSelectedSchoolId(String(match.id));
            setEditing(true);
        }
    }, [fixedSchool, schools]);

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
            let validLocation = false;
            try {
                const res = await fetch(
                    `/api/coordinate-to-region/?lat=${lat}&long=${long}`,
                );
                const data = await res.json();
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
            toast.error(
                err instanceof Error ? err.message : "Failed to save location",
            );
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
            ? [selectedSchool.longitude, selectedSchool.latitude]
            : [-72, 42.272];

    return (
        <div className="space-y-3">
            {!fixedSchool && (
                <div className="w-72">
                    <Combobox
                        options={schoolOptions}
                        value={selectedSchoolId}
                        onChange={handleSchoolChange}
                        placeholder="Search for a school..."
                    />
                </div>
            )}

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
                            {/* Current location (blue) */}
                            {selectedSchool.latitude &&
                                selectedSchool.longitude && (
                                    <MapMarker
                                        longitude={selectedSchool.longitude}
                                        latitude={selectedSchool.latitude}
                                    >
                                        <MarkerContent>
                                            <Image
                                                src="/maps/location-marker.svg"
                                                alt="Current location"
                                                width={32}
                                                height={32}
                                                className="h-10 w-10"
                                            />
                                        </MarkerContent>
                                    </MapMarker>
                                )}
                            {/* New pin (red) */}
                            {newPin && (
                                <MapMarker
                                    longitude={newPin.longitude}
                                    latitude={newPin.latitude}
                                >
                                    <MarkerContent>
                                        <Image
                                            src="/maps/location-marker-red.svg"
                                            alt="New location"
                                            width={32}
                                            height={32}
                                            className="h-10 w-10"
                                        />
                                    </MarkerContent>
                                </MapMarker>
                            )}
                            {editing && (
                                <MapClickHandler onMapClick={handleMapClick} />
                            )}
                        </Map>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <div>
                            {newPin ? (
                                <div className="bg-muted text-black px-2 rounded border">{`New location: ${newPin.latitude.toFixed(4)}, ${newPin.longitude.toFixed(4)}`}</div>
                            ) : (
                                <span className="text-muted-foreground">
                                    Click on the map to set a new location
                                </span>
                            )}
                        </div>
                        {/* Inline save/cancel only in fixed-school mode */}
                        {fixedSchool && newPin && (
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCancel}
                                >
                                    Cancel
                                </Button>
                                <Button size="sm" onClick={handleSave}>
                                    Save
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
});
