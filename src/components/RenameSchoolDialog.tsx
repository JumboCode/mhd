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

interface RenameSchoolDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    schoolSlug: string;
    currentName: string;
    year: number | null;
    onRenameComplete: (newName: string) => void;
}

export function RenameSchoolDialog({
    open,
    onOpenChange,
    schoolSlug,
    currentName,
    year,
    onRenameComplete,
}: RenameSchoolDialogProps) {
    const router = useRouter();
    const [nameDraft, setNameDraft] = useState(currentName);
    const [saving, setSaving] = useState(false);

    // Reset draft when dialog opens with new name
    const handleOpenChange = (newOpen: boolean) => {
        if (newOpen) {
            setNameDraft(currentName);
        }
        onOpenChange(newOpen);
    };

    const handleSave = async () => {
        const next = nameDraft.trim();
        if (!next) {
            toast.error("School name cannot be empty.");
            return;
        }
        if (next === currentName) {
            onOpenChange(false);
            return;
        }
        setSaving(true);
        try {
            const res = await fetch(`/api/schools/${schoolSlug}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: next }),
            });
            const data = (await res.json()) as {
                standardizedName?: string;
                error?: string;
            };
            if (res.ok) {
                onRenameComplete(next);
                onOpenChange(false);
                toast.success("School name updated.");
                const newSlug = data.standardizedName;
                if (newSlug && newSlug !== schoolSlug) {
                    const q = year !== null ? `?year=${year}` : "";
                    router.replace(`/schools/${newSlug}${q}`);
                }
            } else {
                toast.error(
                    typeof data.error === "string"
                        ? data.error
                        : "Failed to update school name.",
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
                    <DialogTitle>Rename school</DialogTitle>
                    <DialogDescription>
                        Update the display name for this school.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-2 py-2">
                    <label
                        htmlFor="school-rename"
                        className="text-sm font-medium leading-none"
                    >
                        Name
                    </label>
                    <Input
                        id="school-rename"
                        value={nameDraft}
                        onChange={(e) => setNameDraft(e.target.value)}
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
                            nameDraft.trim() === "" ||
                            nameDraft.trim() === currentName
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
