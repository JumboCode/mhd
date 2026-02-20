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
    instructionalModel: string;
    firstYear: string;
}

export function SchoolInfoRow({
    town,
    instructionalModel,
    firstYear,
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
                <span className="text-lg font-semibold text-foreground">
                    {town}, MA
                </span>
            </div>

            {/* Instruction Model */}
            <div className="flex flex-col gap-2 p-4 rounded-lg border border-border">
                <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Instruction Model
                    </span>
                </div>
                <span className="text-lg font-semibold text-foreground">
                    {instructionalModel}
                </span>
            </div>

            {/* First Year Participating */}
            <div className="flex flex-col gap-2 p-4 rounded-lg border border-border">
                <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        First Year
                    </span>
                </div>
                <span className="text-lg font-semibold text-foreground">
                    {firstYear}
                </span>
            </div>
        </div>
    );
}
