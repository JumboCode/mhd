"use client";

import { useCallback, useEffect, useState } from "react";
import { Map, MapMarker, MarkerContent, useMap } from "@/components/ui/map";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Pencil, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [newPin, setNewPin] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);
    const [saving, setSaving] = useState(false);
    const [mapKey, setMapKey] = useState(0);

    useEffect(() => {
        setMounted(true);
    }, []);

    const fetchSchoolCoordinates = useCallback(async () => {
        try {
            setLoading(true);

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
                toast.error("School coordinates not found");
            }
        } catch (error) {
            const errorMsg =
                error instanceof Error ? error.message : "An error occurred";
            toast.error(errorMsg);
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
            setMapKey((k) => k + 1);
            toast.success("School location updated successfully!");
        } catch (error) {
            const errorMsg =
                error instanceof Error
                    ? error.message
                    : "Failed to save location";
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
                    key={mapKey}
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
                    scrollZoom={true}
                    dragPan={true}
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
                                <MarkerContent>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-500 shadow-lg cursor-pointer border-2 border-white">
                                        <MapPin className="h-5 w-5 text-white" />
                                    </div>
                                </MarkerContent>
                            </MapMarker>
                        )}
                    {loading && (
                        <div className="absolute top-4 left-4 text-sm text-muted-foreground">
                            Loading school location...
                        </div>
                    )}
                </Map>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEditClick}
                    className="absolute top-3 right-3 z-10 shadow-sm"
                >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit Location
                </Button>
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
                        <Map center={editMapCenter} zoom={12}>
                            {/* Current location marker (red) */}
                            {coordinates &&
                                coordinates.latitude !== null &&
                                coordinates.longitude !== null && (
                                    <MapMarker
                                        longitude={coordinates.longitude}
                                        latitude={coordinates.latitude}
                                    >
                                        <MarkerContent>
                                            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500/60 border-2 border-red-500 shadow-lg" />
                                        </MarkerContent>
                                    </MapMarker>
                                )}
                            {/* New pin location (blue) */}
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
                            <MapClickHandler onMapClick={handleMapClick} />
                        </Map>
                    </div>
                    <DialogFooter>
                        <div
                            className={`w-full flex flex-row items-center ${newPin ? "justify-between" : "justify-end"}`}
                        >
                            {newPin && (
                                <div className="bg-muted text-sm text-black px-2 rounded border">
                                    New location: {newPin.latitude.toFixed(4)},{" "}
                                    {newPin.longitude.toFixed(4)}
                                </div>
                            )}
                            <div className="space-x-2">
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
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
