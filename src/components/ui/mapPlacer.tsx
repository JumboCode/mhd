"use client";

import { useCallback, useEffect, useState } from "react";
import { Map, MapMarker, MapControls, useMap } from "@/components/ui/map";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Pencil } from "lucide-react";

interface SchoolCoordinates {
    latitude: number | null;
    longitude: number | null;
}

interface MapPlacerProps {
    schoolId: string;
    center?: [number, number];
    zoom?: number;
    onCoordinatesLoaded?: (coords: SchoolCoordinates) => void;
    schoolName?: string;
}

// Child component that registers click events on the map
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

export const MapPlacer = ({
    schoolId,
    center = [-72, 42.272],
    zoom = 8,
    onCoordinatesLoaded,
    schoolName,
}: MapPlacerProps) => {
    const [mounted, setMounted] = useState(false);
    const [coordinates, setCoordinates] = useState<SchoolCoordinates | null>(
        null,
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [newPin, setNewPin] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const fetchSchoolCoordinates = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const url = `/api/schools/${encodeURIComponent(schoolId)}`;
            const response = await fetch(url);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error ||
                        `Failed to fetch school data: ${response.statusText}`,
                );
            }

            const schoolData = await response.json();

            if (
                schoolData.latitude !== null &&
                schoolData.latitude !== undefined &&
                schoolData.longitude !== null &&
                schoolData.longitude !== undefined
            ) {
                const coords = {
                    latitude: schoolData.latitude,
                    longitude: schoolData.longitude,
                };
                setCoordinates(coords);
                onCoordinatesLoaded?.(coords);
            } else {
                // Fallback: try to fetch from CSV
                const csvResponse = await fetch("/MA_schools_long_lat.csv");
                if (csvResponse.ok) {
                    const csvText = await csvResponse.text();
                    const lines = csvText.split("\n");
                    for (let i = 1; i < lines.length; i++) {
                        const line = lines[i].trim();
                        if (!line) continue;

                        const parts = line.split(",");
                        if (parts.length < 7) continue;

                        const csvSchoolName = parts[0].trim();
                        if (
                            csvSchoolName.toLowerCase() ===
                            schoolId.toLowerCase()
                        ) {
                            const lat = parseFloat(parts[6].trim());
                            const lng = parseFloat(parts[7].trim());

                            if (!isNaN(lat) && !isNaN(lng)) {
                                const coords = {
                                    latitude: lat,
                                    longitude: lng,
                                };
                                setCoordinates(coords);
                                onCoordinatesLoaded?.(coords);
                                return;
                            }
                        }
                    }
                }
                setError("School coordinates not found");
            }
        } catch (err) {
            const errorMsg =
                err instanceof Error ? err.message : "An error occurred";
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    }, [schoolId, onCoordinatesLoaded]);

    useEffect(() => {
        if (mounted) {
            fetchSchoolCoordinates();
        }
    }, [mounted, fetchSchoolCoordinates]);

    const handleEditClick = () => {
        setNewPin(null);
        setEditDialogOpen(true);
    };

    const handleMapClick = useCallback((lng: number, lat: number) => {
        setNewPin({ latitude: lat, longitude: lng });
    }, []);

    const handleSave = async () => {
        if (!newPin) return;

        setSaving(true);
        try {
            const response = await fetch(
                `/api/schools/${encodeURIComponent(schoolId)}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        latitude: newPin.latitude,
                        longitude: newPin.longitude,
                    }),
                },
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error || "Failed to update school location",
                );
            }

            const updatedCoords = {
                latitude: newPin.latitude,
                longitude: newPin.longitude,
            };
            setCoordinates(updatedCoords);
            onCoordinatesLoaded?.(updatedCoords);
            setEditDialogOpen(false);
            toast.success("School location updated successfully!");
        } catch (err) {
            const errorMsg =
                err instanceof Error ? err.message : "Failed to save location";
            toast.error(errorMsg);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setNewPin(null);
        setEditDialogOpen(false);
    };

    const displayName =
        schoolName || decodeURIComponent(schoolId).replace(/-/g, " ");

    // Compute map center for the edit dialog
    const editMapCenter: [number, number] =
        coordinates?.longitude != null && coordinates?.latitude != null
            ? [coordinates.longitude, coordinates.latitude]
            : center;

    if (!mounted) return null;

    return (
        <>
            <div className="relative w-full h-full">
                <Map
                    center={
                        coordinates?.longitude != null &&
                        coordinates?.latitude != null
                            ? [coordinates.longitude, coordinates.latitude]
                            : center
                    }
                    zoom={
                        coordinates?.longitude != null &&
                        coordinates?.latitude != null
                            ? 12
                            : zoom
                    }
                    styles={{
                        light: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
                        dark: "https://basemaps.cartocdn.com/gl/voyager-nolabels-gl-style/style.json",
                    }}
                    scrollZoom={true}
                    dragPan={false}
                    dragRotate={false}
                    doubleClickZoom={false}
                    touchZoomRotate={false}
                >
                    {coordinates &&
                        coordinates.latitude !== null &&
                        coordinates.longitude !== null && (
                            <MapMarker
                                longitude={coordinates.longitude}
                                latitude={coordinates.latitude}
                            >
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 shadow-lg cursor-pointer border-2 border-white hover:bg-red-600 transition-colors" />
                            </MapMarker>
                        )}
                    <MapControls showZoom={true} position="bottom-right" />
                    {loading && (
                        <div className="absolute top-4 left-4 text-sm text-muted-foreground">
                            Loading school location...
                        </div>
                    )}
                    {error && (
                        <div className="absolute top-4 left-4 text-sm text-red-500">
                            {error}
                        </div>
                    )}
                </Map>
                <button
                    onClick={handleEditClick}
                    className="absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-accent transition-colors"
                >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                </button>
            </div>

            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent
                    className="sm:max-w-4xl h-[80vh] flex flex-col"
                    showCloseButton={false}
                >
                    <DialogHeader>
                        <DialogTitle>Edit Location: {displayName}</DialogTitle>
                        <DialogDescription>
                            Click on the map to drop a pin for the new location.
                            The red dot shows the current location.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 rounded-lg overflow-hidden border border-border">
                        <Map
                            center={editMapCenter}
                            zoom={12}
                            styles={{
                                light: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
                                dark: "https://basemaps.cartocdn.com/gl/voyager-nolabels-gl-style/style.json",
                            }}
                        >
                            {/* Current location marker (red) */}
                            {coordinates &&
                                coordinates.latitude !== null &&
                                coordinates.longitude !== null && (
                                    <MapMarker
                                        longitude={coordinates.longitude}
                                        latitude={coordinates.latitude}
                                    >
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/60 border-2 border-red-500 shadow-lg" />
                                    </MapMarker>
                                )}
                            {/* New pin location (blue) */}
                            {newPin && (
                                <MapMarker
                                    longitude={newPin.longitude}
                                    latitude={newPin.latitude}
                                >
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 shadow-lg border-2 border-white" />
                                </MapMarker>
                            )}
                            <MapClickHandler onMapClick={handleMapClick} />
                            <MapControls
                                showZoom={true}
                                position="bottom-right"
                            />
                        </Map>
                    </div>
                    {newPin && (
                        <p className="text-sm text-muted-foreground">
                            New location: {newPin.latitude.toFixed(4)},{" "}
                            {newPin.longitude.toFixed(4)}
                        </p>
                    )}
                    <DialogFooter>
                        <button
                            onClick={handleCancel}
                            className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!newPin || saving}
                            className={`rounded-md px-4 py-2 text-sm font-medium text-white transition-colors ${
                                newPin && !saving
                                    ? "bg-blue-600 hover:bg-blue-700"
                                    : "bg-gray-300 cursor-not-allowed"
                            }`}
                        >
                            {saving ? "Saving..." : "Save"}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
