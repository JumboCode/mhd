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

import {
    MapPinned,
    MapPin,
    BookOpen,
    Calendar,
    GraduationCap,
} from "lucide-react";

interface SchoolInfoRowProps {
    town: string;
    region: string;
    implementationModel: string;
    firstYear: string;
    division: string[];
}

export function SchoolInfoRow({
    town,
    region,
    implementationModel,
    firstYear,
    division,
}: SchoolInfoRowProps) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-3 gap-6">
                {/* Town */}
                <div className="flex flex-col gap-2 p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                            Town
                        </span>
                    </div>
                    <span className="text-lg font-semibold text-foreground">
                        {town}, MA
                    </span>
                </div>

                {/* Region */}
                <div className="flex flex-col gap-2 p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-2">
                        <MapPinned className="w-5 h-5" />
                        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                            Region
                        </span>
                    </div>
                    <span className="text-lg font-semibold text-foreground">
                        {region || "Unknown"}
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
            <div className="grid grid-cols-2 gap-6">
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

                {/* Division */}
                <div className="flex flex-col gap-2 p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-2">
                        <GraduationCap className="w-5 h-5" />
                        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                            Division
                        </span>
                    </div>
                    <span className="text-lg font-semibold text-foreground">
                        {division.length === 0 ? "n/a" : division.join(", ")}
                    </span>
                </div>
            </div>
        </div>
    );
}
