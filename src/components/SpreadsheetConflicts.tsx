"use client";

import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { SchoolConflict } from "@/app/api/schools/check-conflicts/route";

export type ConflictResolution = {
    uploadedSchoolKey: string;
    uploadedSchoolName: string;
    action: "use-db" | "keep-distinct";
    dbSchoolId: number;
    dbSchoolStandardizedName: string;
    dbSchoolTown: string;
};

type Props = {
    open: boolean;
    conflicts: SchoolConflict[];
    onResolved: (resolutions: ConflictResolution[]) => void;
};

export default function SpreadsheetConflicts({
    open,
    conflicts,
    onResolved,
}: Props) {
    // Local state: one decision per conflict, keyed by uploadedSchoolKey
    const [decisions, setDecisions] = useState<
        Record<string, "use-db" | "keep-distinct" | null>
    >({});

    // Reset when dialog opens with new conflicts
    useEffect(() => {
        if (open) {
            const initial: Record<string, null> = {};
            for (const c of conflicts) {
                initial[c.uploaded.schoolKey] = null;
            }
            setDecisions(initial);
        }
    }, [open, conflicts]);

    const allResolved = conflicts.every(
        (c) => decisions[c.uploaded.schoolKey] != null,
    );

    const handleConfirm = () => {
        const resolutions: ConflictResolution[] = conflicts.map((c) => ({
            uploadedSchoolKey: c.uploaded.schoolKey,
            uploadedSchoolName: c.uploaded.name,
            action: decisions[c.uploaded.schoolKey] ?? "keep-distinct",
            dbSchoolId: c.db.id,
            dbSchoolStandardizedName: c.db.standardizedName,
            dbSchoolTown: c.db.town,
        }));
        onResolved(resolutions);
    };

    return (
        <Dialog open={open} onOpenChange={() => {}}>
            <DialogContent
                className="max-w-2xl"
                showCloseButton={false}
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>School Name Conflicts</DialogTitle>
                    <DialogDescription>
                        The following uploaded schools share a name with an
                        existing school but have a different town. For each,
                        choose whether to treat them as the same school or keep
                        them distinct.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto py-1 pr-1">
                    {conflicts.map((c) => {
                        const decision = decisions[c.uploaded.schoolKey];
                        return (
                            <div
                                key={c.uploaded.schoolKey}
                                className="rounded-lg border p-4 flex flex-col gap-3"
                            >
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setDecisions((d) => ({
                                                ...d,
                                                [c.uploaded.schoolKey]:
                                                    "keep-distinct",
                                            }))
                                        }
                                        className={`rounded-md border px-3 py-2 text-sm text-left transition-colors ${
                                            decision === "keep-distinct"
                                                ? "border-primary bg-primary/5 ring-1 ring-primary"
                                                : "border-border hover:bg-muted/40"
                                        }`}
                                    >
                                        <p className="text-xs text-muted-foreground mb-0.5">
                                            Uploaded
                                        </p>
                                        <p className="font-medium">
                                            {c.uploaded.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {c.uploaded.town}
                                        </p>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setDecisions((d) => ({
                                                ...d,
                                                [c.uploaded.schoolKey]:
                                                    "use-db",
                                            }))
                                        }
                                        className={`rounded-md border px-3 py-2 text-sm text-left transition-colors ${
                                            decision === "use-db"
                                                ? "border-primary bg-primary/5 ring-1 ring-primary"
                                                : "border-border hover:bg-muted/40"
                                        }`}
                                    >
                                        <p className="text-xs text-muted-foreground mb-0.5">
                                            Existing in database
                                        </p>
                                        <p className="font-medium">
                                            {c.db.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {c.db.town}
                                        </p>
                                    </button>
                                </div>
                                {decision === null && (
                                    <p className="text-xs text-amber-600">
                                        Select one to continue
                                    </p>
                                )}
                                {decision === "keep-distinct" && (
                                    <p className="text-xs text-muted-foreground">
                                        Will be uploaded as a new separate
                                        school.
                                    </p>
                                )}
                                {decision === "use-db" && (
                                    <p className="text-xs text-muted-foreground">
                                        Uploaded data will be added to the
                                        existing school. This choice will be
                                        remembered for future uploads.
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>

                <DialogFooter>
                    <Button onClick={handleConfirm} disabled={!allResolved}>
                        Continue
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
