"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ChangeTownDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    schoolSlug: string;
    schoolTown: string;
    currentTown: string;
    year: number | null;
    onChangeTownComplete: (newTown: string) => void;
}

export function ChangeTownDialog({
    open,
    onOpenChange,
    schoolSlug,
    schoolTown,
    currentTown,
    year,
    onChangeTownComplete,
}: ChangeTownDialogProps) {
    const router = useRouter();
    const [townDraft, setTownDraft] = useState(currentTown);
    const [saving, setSaving] = useState(false);

    const handleOpenChange = (newOpen: boolean) => {
        if (newOpen) {
            setTownDraft(currentTown);
        }
        onOpenChange(newOpen);
    };

    const handleSave = async () => {
        const next = townDraft.trim();
        if (!next) {
            toast.error("Town name cannot be empty.");
            return;
        }
        if (next === currentTown) {
            onOpenChange(false);
            return;
        }
        setSaving(true);
        try {
            const res = await fetch(
                `/api/schools/${schoolSlug}/${schoolTown}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ city: next }),
                },
            );
            const data = (await res.json()) as { error?: string };
            if (res.ok) {
                onChangeTownComplete(next);
                onOpenChange(false);
                toast.success("Town updated.");
                const newTownSlug = next.toLowerCase().replace(/\s+/g, "-");
                const q = year !== null ? `?year=${year}` : "";
                router.replace(`/schools/${schoolSlug}/${newTownSlug}${q}`);
            } else {
                toast.error(
                    typeof data.error === "string"
                        ? data.error
                        : "Failed to update town.",
                );
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent showCloseButton={!saving}>
                <DialogHeader>
                    <DialogTitle>Change town</DialogTitle>
                    <DialogDescription>
                        Update the town for this school.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-2 py-2">
                    <label
                        htmlFor="school-town"
                        className="text-sm font-medium leading-none"
                    >
                        Town
                    </label>
                    <Input
                        id="school-town"
                        value={townDraft}
                        onChange={(e) => setTownDraft(e.target.value)}
                        disabled={saving}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                void handleSave();
                            }
                        }}
                        autoComplete="off"
                    />
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        type="button"
                        disabled={saving}
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        disabled={
                            saving ||
                            townDraft.trim() === "" ||
                            townDraft.trim() === currentTown
                        }
                        onClick={() => void handleSave()}
                    >
                        {saving ? "Saving…" : "Save"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
