"use client";

import { useEffect, useState } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Combobox } from "@/components/Combobox";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface SchoolOption {
    id: number;
    name: string;
}

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentSchoolId: number;
    currentSchoolName: string;
    onMergeComplete: () => void;
}

// "outward" = current school merges INTO other (current disappears)
// "inward"  = other school merges INTO current (other disappears)
type Direction = "outward" | "inward";

export default function MergeSchoolDialog({
    open,
    onOpenChange,
    currentSchoolId,
    currentSchoolName,
    onMergeComplete,
}: Props) {
    const [schools, setSchools] = useState<SchoolOption[]>([]);
    const [otherSchoolId, setOtherSchoolId] = useState("");
    const [direction, setDirection] = useState<Direction>("outward");
    const [confirmed, setConfirmed] = useState(false);
    const [merging, setMerging] = useState(false);

    useEffect(() => {
        if (!open) return;
        fetch("/api/schools?list=true")
            .then((r) => r.json())
            .then((data: SchoolOption[]) =>
                setSchools(data.filter((s) => s.id !== currentSchoolId)),
            );
    }, [open, currentSchoolId]);

    // Reset inner state whenever the dialog opens
    useEffect(() => {
        if (open) {
            setOtherSchoolId("");
            setDirection("outward");
            setConfirmed(false);
        }
    }, [open]);

    const otherSchool = schools.find((s) => String(s.id) === otherSchoolId);

    const mergingSchool =
        direction === "outward" ? currentSchoolName : otherSchool?.name;
    const baseSchool =
        direction === "outward" ? otherSchool?.name : currentSchoolName;

    const handleMerge = async () => {
        if (!otherSchool) return;
        setMerging(true);
        try {
            const baseSchoolId =
                direction === "outward" ? otherSchool.id : currentSchoolId;
            const mergingSchoolId =
                direction === "outward" ? currentSchoolId : otherSchool.id;

            const res = await fetch("/api/schools/merge", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ baseSchoolId, mergingSchoolId }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Merge failed");
            toast.success(data.message);
            onOpenChange(false);
            onMergeComplete();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Merge failed");
        } finally {
            setMerging(false);
        }
    };

    const schoolOptions = schools.map((s) => ({
        value: String(s.id),
        label: s.name,
    }));

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Merge Schools</DialogTitle>
                </DialogHeader>

                {/* School picker */}
                <div className="space-y-4">
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                            Other school
                        </p>
                        <Combobox
                            options={schoolOptions}
                            value={otherSchoolId}
                            onChange={setOtherSchoolId}
                            placeholder="Search for a school..."
                        />
                    </div>

                    {/* Direction visualiser */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            {/* Current school */}
                            <div
                                className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium text-center transition-colors ${
                                    direction === "outward"
                                        ? "border-destructive/50 bg-destructive/5"
                                        : "border-green-500/40 bg-green-50"
                                }`}
                            >
                                {currentSchoolName}
                            </div>

                            {/* Arrow button — click to flip direction */}
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                    setDirection((d) =>
                                        d === "outward" ? "inward" : "outward",
                                    )
                                }
                                title="Click to reverse direction"
                            >
                                {direction === "outward" ? (
                                    <ArrowRight className="h-5 w-5" />
                                ) : (
                                    <ArrowLeft className="h-5 w-5" />
                                )}
                            </Button>

                            {/* Other school */}
                            <div
                                className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium text-center transition-colors ${
                                    direction === "inward"
                                        ? "border-destructive/50 bg-destructive/5"
                                        : otherSchool
                                          ? "border-green-500/40 bg-green-50"
                                          : "bg-muted/40 text-muted-foreground"
                                }`}
                            >
                                {otherSchool?.name ?? (
                                    <span className="italic font-normal">
                                        select a school
                                    </span>
                                )}
                            </div>
                        </div>

                        <p className="text-xs text-muted-foreground text-center pt-1">
                            The arrow points toward the school that survives.
                            Click the arrow button to reverse the direction.
                        </p>
                    </div>

                    {/* Explanation */}
                    {otherSchool && (
                        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm space-y-1">
                            <p>
                                All data from{" "}
                                <span className="font-semibold">
                                    {mergingSchool}
                                </span>{" "}
                                will be moved into{" "}
                                <span className="font-semibold">
                                    {baseSchool}
                                </span>
                                .
                            </p>
                            <p>
                                <span className="font-semibold">
                                    {mergingSchool}
                                </span>{" "}
                                will be permanently removed.{" "}
                                <span className="font-semibold">
                                    This cannot be undone.
                                </span>
                            </p>
                        </div>
                    )}

                    {/* Confirmation checkbox */}
                    {otherSchool && (
                        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={confirmed}
                                onChange={(e) => setConfirmed(e.target.checked)}
                            />
                            I understand this is permanent and cannot be undone
                        </label>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={merging}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="default"
                        onClick={handleMerge}
                        disabled={!otherSchool || !confirmed || merging}
                    >
                        {merging ? "Merging..." : "Merge"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
