/***************************************************************
 *
 *                src/components/MergeSchools.tsx
 *
 *         Author: Shayne Sidman
 *           Date: 4/15/2026
 *
 *        Summary: Merge two schools, replacing all instances of merged school
 *                 with the absorbing school.
 *
 **************************************************************/

"use client";

import { useEffect, useState } from "react";
import { Combobox } from "@/components/Combobox";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { LoadError } from "@/components/ui/load-error";

interface SchoolEntry {
    id: number;
    name: string;
}

export default function MergeSchools() {
    const [schools, setSchools] = useState<SchoolEntry[]>([]);
    const [baseSchoolId, setBaseSchoolId] = useState("");
    const [mergingSchoolId, setMergingSchoolId] = useState("");
    const [showConfirm, setShowConfirm] = useState(false);
    const [merging, setMerging] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSchools = () => {
        setError(null);
        fetch("/api/schools?list=true")
            .then((res) => res.json())
            .then(setSchools)
            .catch(() => setError("Failed to load schools"));
    };

    useEffect(() => {
        fetchSchools();
    }, []);

    const schoolOptions = schools.map((s) => ({
        value: String(s.id),
        label: s.name,
    }));

    const baseSchool = schools.find((s) => String(s.id) === baseSchoolId);
    const mergingSchool = schools.find((s) => String(s.id) === mergingSchoolId);

    const canMerge =
        baseSchoolId && mergingSchoolId && baseSchoolId !== mergingSchoolId;

    const handleConfirm = async () => {
        if (!baseSchool || !mergingSchool) return;
        setMerging(true);
        try {
            const res = await fetch("/api/schools/merge", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    baseSchoolId: Number(baseSchoolId),
                    mergingSchoolId: Number(mergingSchoolId),
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Merge failed");
            toast.success(data.message);
            setBaseSchoolId("");
            setMergingSchoolId("");
            // Refresh the school list so the merged-away school disappears
            fetchSchools();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Merge failed");
        } finally {
            setMerging(false);
            setShowConfirm(false);
        }
    };

    if (error) {
        return (
            <LoadError
                message={error}
                onRetry={fetchSchools}
                className="py-8"
            />
        );
    }

    return (
        <>
            <div className="space-y-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                            Base school (survives)
                        </p>
                        <div className="min-w-72">
                            <Combobox
                                options={schoolOptions.filter(
                                    (o) => o.value !== mergingSchoolId,
                                )}
                                value={baseSchoolId}
                                onChange={setBaseSchoolId}
                                placeholder="Search for a school..."
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                            School to merge in (will be removed)
                        </p>
                        <div className="min-w-72">
                            <Combobox
                                options={schoolOptions.filter(
                                    (o) => o.value !== baseSchoolId,
                                )}
                                value={mergingSchoolId}
                                onChange={setMergingSchoolId}
                                placeholder="Search for a school..."
                            />
                        </div>
                    </div>

                    <Button
                        variant="default"
                        disabled={!canMerge}
                        onClick={() => setShowConfirm(true)}
                    >
                        Merge
                    </Button>
                </div>
            </div>

            <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Merge</DialogTitle>
                        <DialogDescription>
                            All data for{" "}
                            <span className="font-medium text-foreground">
                                {mergingSchool?.name}
                            </span>{" "}
                            will be moved into{" "}
                            <span className="font-medium text-foreground">
                                {baseSchool?.name}
                            </span>
                            .{" "}
                            <span className="font-medium text-foreground">
                                {mergingSchool?.name}
                            </span>{" "}
                            will be permanently removed. This cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowConfirm(false)}
                            disabled={merging}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="default"
                            onClick={handleConfirm}
                            disabled={merging}
                        >
                            {merging ? "Merging..." : "Merge"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
