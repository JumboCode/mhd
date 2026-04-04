/***************************************************************
 *
 *                SpreadsheetEdits.tsx
 *
 *         Author: Jack Liu, Justin Ngan
 *           Date: 02/28/2026
 *
 *        Summary: Map-based UI for assigning locations to
 *                 unmatched schools during spreadsheet upload.
 *                 Users navigate through schools one at a time.
 *
 **************************************************************/

"use client";

import { useCallback, useEffect, useState } from "react";
import { Map, MapMarker, MarkerContent, useMap } from "@/components/ui/map";
import { MapPin, HelpCircle } from "lucide-react";
import type {
    UploadedSchool,
    SchoolWithCoordinates,
} from "@/lib/school-matching";
import { toast } from "sonner";

interface SpreadsheetEditsProps {
    matchedSchools: SchoolWithCoordinates[];
    unmatchedSchools: UploadedSchool[];
    currentSchoolIndex: number;
    onSchoolLocationAssigned: (
        schoolId: string,
        lat: number,
        long: number,
    ) => void;
    assignedLocations: Map<string, { lat: number; long: number }>;
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

export default function SpreadsheetEdits({
    matchedSchools,
    unmatchedSchools,
    currentSchoolIndex,
    onSchoolLocationAssigned,
    assignedLocations,
}: SpreadsheetEditsProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const totalMatched = matchedSchools.length;
    const totalUnmatched = unmatchedSchools.length;

    const currentSchool = unmatchedSchools[currentSchoolIndex];
    const currentAssignment = currentSchool
        ? assignedLocations.get(currentSchool.schoolId)
        : undefined;
    const remainingCount = totalUnmatched - currentSchoolIndex;

    const handleMapClick = useCallback(
        async (long: number, lat: number) => {
            let validLocation: boolean = false;

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
            } finally {
            }

            if (validLocation && currentSchool) {
                onSchoolLocationAssigned(currentSchool.schoolId, lat, long);
            }
        },
        [currentSchool, onSchoolLocationAssigned],
    );

    // If no unmatched schools, show success message
    if (unmatchedSchools.length === 0) {
        return (
            <div className="w-full">
                {/* Question mark icon */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 mb-6">
                    <HelpCircle className="w-5 h-5 text-primary" />
                </div>

                <p className="text-lg font-medium text-foreground mb-1">
                    All {totalMatched} school{totalMatched !== 1 ? "s" : ""}{" "}
                    matched automatically
                </p>
                <p className="text-sm text-muted-foreground">
                    No location confirmation needed. You can proceed to the next
                    step.
                </p>
            </div>
        );
    }

    if (!mounted) return null;

    return (
        <div className="w-full flex flex-col gap-3">
            {/* Question mark icon */}
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                <HelpCircle className="w-4 h-4 text-primary" />
            </div>

            {/* School count message */}
            <p className="text-base font-medium text-foreground">
                {remainingCount} school{remainingCount !== 1 ? "s" : ""} need
                {remainingCount === 1 ? "s" : ""} location confirmation
            </p>

            {/* Instructions */}
            <p className="text-xs text-muted-foreground">
                Click on the map to place the pin, then press Next to confirm
            </p>

            {/* Current school info - smaller font */}
            {currentSchool && (
                <div className="text-left mt-2">
                    <p className="text-sm font-medium text-foreground">
                        {currentSchool.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {currentSchool.city}
                    </p>
                    <p className="text-xs text-muted-foreground">MA</p>
                </div>
            )}

            {/* Map - styled like mapPlacer */}
            <div className="relative h-[60vh] w-full rounded-lg overflow-hidden border border-border mt-2">
                <Map
                    center={
                        currentAssignment
                            ? [currentAssignment.long, currentAssignment.lat]
                            : [-71.5, 42.2] // Massachusetts center
                    }
                    zoom={currentAssignment ? 16 : 10}
                    scrollZoom={true}
                    dragPan={true}
                    dragRotate={false}
                    doubleClickZoom={false}
                    touchZoomRotate={false}
                >
                    {/* Show pin if location assigned */}
                    {currentAssignment && (
                        <MapMarker
                            longitude={currentAssignment.long}
                            latitude={currentAssignment.lat}
                        >
                            <MarkerContent>
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-500 shadow-lg cursor-pointer border-2 border-white">
                                    <MapPin className="h-5 w-5 text-white" />
                                </div>
                            </MarkerContent>
                        </MapMarker>
                    )}
                    <MapClickHandler onMapClick={handleMapClick} />
                </Map>
            </div>

            {/* Assigned coordinates display */}
            {currentAssignment && (
                <p className="text-xs text-green-600 dark:text-green-400">
                    📍 Location set: {currentAssignment.lat.toFixed(4)},{" "}
                    {currentAssignment.long.toFixed(4)}
                </p>
            )}

            {/* Click to place pin hint */}
            <p className="text-xs text-muted-foreground text-center">
                Click to place pin
            </p>
        </div>
    );
}
