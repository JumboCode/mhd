"use client";

import { useEffect, useState } from "react";
import { Map, MapMarker } from "@/components/ui/map";

interface SchoolCoordinates {
    latitude: number | null;
    longitude: number | null;
}

interface MapPlacerProps {
    /**
     * School identifier (name or ID) to fetch and plot on map
     */
    schoolId: string;
    /**
     * Optional center coordinates for the map [longitude, latitude]
     */
    center?: [number, number];
    /**
     * Optional zoom level (default: 8)
     */
    zoom?: number;
    /**
     * Optional callback when coordinates are loaded
     */
    onCoordinatesLoaded?: (coords: SchoolCoordinates) => void;
}

export const MapPlacer = ({
    schoolId,
    center = [-72, 42.272], // Default MA center
    zoom = 8,
    onCoordinatesLoaded,
}: MapPlacerProps) => {
    const [mounted, setMounted] = useState(false);
    const [coordinates, setCoordinates] = useState<SchoolCoordinates | null>(
        null,
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const fetchSchoolCoordinates = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch school data using the school's name (URL-encoded)
                const url = `/api/schools/${encodeURIComponent(schoolId)}`;
                console.log("Fetching from:", url);
                const response = await fetch(url);

                console.log("Response status:", response.status);

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(
                        errorData.error ||
                            `Failed to fetch school data: ${response.statusText}`,
                    );
                }

                const schoolData = await response.json();
                console.log("School data:", schoolData);

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
                    console.log("Setting coordinates from API:", coords);
                    setCoordinates(coords);
                    onCoordinatesLoaded?.(coords);
                } else {
                    console.log(
                        "Coordinates not in API response, trying CSV fallback",
                    );
                    // Fallback: try to fetch from CSV
                    const csvResponse = await fetch("/MA_schools_long_lat.csv");
                    if (csvResponse.ok) {
                        const csvText = await csvResponse.text();
                        const lines = csvText.split("\n");
                        // Parse CSV to find matching school
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
                                    console.log(
                                        "Found coordinates in CSV:",
                                        coords,
                                    );
                                    setCoordinates(coords);
                                    onCoordinatesLoaded?.(coords);
                                    return;
                                }
                            }
                        }
                    }
                    console.log("Coordinates not found in database or CSV");
                    setError("School coordinates not found");
                }
            } catch (err) {
                const errorMsg =
                    err instanceof Error ? err.message : "An error occurred";
                console.error("Error fetching coordinates:", errorMsg);
                setError(errorMsg);
            } finally {
                setLoading(false);
            }
        };

        if (mounted) {
            fetchSchoolCoordinates();
        }
    }, [schoolId, mounted, onCoordinatesLoaded]);

    if (!mounted) return null;

    return (
        <Map
            center={center}
            zoom={zoom}
            styles={{
                light: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
                dark: "https://basemaps.cartocdn.com/gl/voyager-nolabels-gl-style/style.json",
            }}
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
    );
};
