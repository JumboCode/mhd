/***************************************************************
 *
 *                SchoolInfoRow.tsx
 *
 *         Author: Dan Glorioso
 *           Date: 2/19/2026
 *
 *        Summary: Display key info about a school in a row
 *
 **************************************************************/

import { MapPin, BookOpen, Calendar } from "lucide-react";

interface SchoolInfoRowProps {
    town: string;
    implementationModel: string;
    firstYear: string;
    latitude?: number;
    longitude?: number;
}

export function SchoolInfoRow({
    town,
    implementationModel,
    firstYear,
    latitude,
    longitude,
}: SchoolInfoRowProps) {
    return (
        <div className="grid grid-cols-3 gap-6">
            {/* Town */}
            <div className="flex flex-col gap-2 p-4 rounded-lg border border-border">
                <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Town
                    </span>
                </div>
                <div className="flex flex-col">
                    <span className="text-lg font-semibold text-foreground">
                        {town}, MA
                    </span>
                    {latitude !== undefined && longitude !== undefined && (
                        <span className="pdf-coords-reveal hidden text-sm font-medium text-muted-foreground">
                            {latitude.toFixed(4)}°, {longitude.toFixed(4)}°
                        </span>
                    )}
                </div>
            </div>

            {/* Implementation Model */}
            <div className="flex flex-col gap-2 p-4 rounded-lg border border-border">
                <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Implementation Model
                    </span>
                </div>
                <span className="text-lg font-semibold text-foreground">
                    {implementationModel || "None"}
                </span>
            </div>

            {/* Data Since Year */}
            <div className="flex flex-col gap-2 p-4 rounded-lg border border-border">
                <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Data Since
                    </span>
                </div>
                <span className="text-lg font-semibold text-foreground">
                    {firstYear}
                </span>
            </div>
        </div>
    );
}
