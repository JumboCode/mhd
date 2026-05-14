"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type AllowedEmail = {
    id: number;
    email: string;
    createdAt: string;
};

export default function AuthorizedUsers() {
    const [entries, setEntries] = useState<AllowedEmail[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [inputEmail, setInputEmail] = useState("");
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        fetch("/api/allowed-emails")
            .then((r) => r.json())
            .then(setEntries)
            .catch(() => toast.error("Failed to load authorized users"))
            .finally(() => setLoading(false));
    }, []);

    const handleAdd = async () => {
        const email = inputEmail.trim().toLowerCase();
        if (!email) return;
        setAdding(true);
        try {
            const res = await fetch("/api/allowed-emails", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            if (res.status === 409) {
                toast.error("This email is already authorized.");
                return;
            }
            if (!res.ok) throw new Error();
            const created: AllowedEmail = await res.json();
            setEntries((prev) => [...prev, created]);
            setInputEmail("");
            setDialogOpen(false);
            toast.success(`${created.email} added.`);
        } catch {
            toast.error("Failed to add email.");
        } finally {
            setAdding(false);
        }
    };

    const handleRemove = async (entry: AllowedEmail) => {
        try {
            const res = await fetch(`/api/allowed-emails?id=${entry.id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error();
            setEntries((prev) => prev.filter((e) => e.id !== entry.id));
            toast.success(`${entry.email} removed.`);
        } catch {
            toast.error("Failed to remove email.");
        }
    };

    return (
        <>
            <div className="border border-gray-200 rounded-lg overflow-hidden w-full shadow-[0_1px_2px_rgba(0,0,0,0.04),0_1px_4px_rgba(0,0,0,0.04)]">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                                Email
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[200px]">
                                Added
                            </th>
                            <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[80px]">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {loading ? (
                            <tr>
                                <td
                                    colSpan={3}
                                    className="px-4 py-6 text-sm text-gray-400 text-center"
                                >
                                    Loading…
                                </td>
                            </tr>
                        ) : entries.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={3}
                                    className="px-4 py-6 text-sm text-gray-400 text-center"
                                >
                                    No authorized users yet.
                                </td>
                            </tr>
                        ) : (
                            entries.map((entry) => (
                                <tr
                                    key={entry.id}
                                    className="hover:bg-gray-50 transition-colors duration-150"
                                >
                                    <td className="px-4 py-3 text-sm">
                                        {entry.email}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 tabular-nums">
                                        {new Date(
                                            entry.createdAt,
                                        ).toLocaleString(undefined, {
                                            dateStyle: "medium",
                                            timeStyle: "short",
                                        })}
                                    </td>
                                    <td className="px-2 py-2 text-right">
                                        <button
                                            onClick={() => handleRemove(entry)}
                                            className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
                                            aria-label={`Remove ${entry.email}`}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex justify-end">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDialogOpen(true)}
                        className="flex items-center gap-2"
                    >
                        <UserPlus className="w-4 h-4" />
                        Add user
                    </Button>
                </div>
            </div>

            <Dialog
                open={dialogOpen}
                onOpenChange={(open) => {
                    setDialogOpen(open);
                    if (!open) setInputEmail("");
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add authorized user</DialogTitle>
                        <DialogDescription>
                            Enter the email address of the person you want to
                            grant access to.
                        </DialogDescription>
                    </DialogHeader>
                    <Input
                        type="email"
                        placeholder="name@example.com"
                        value={inputEmail}
                        onChange={(e) => setInputEmail(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleAdd();
                        }}
                        autoFocus
                    />
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAdd}
                            disabled={adding || !inputEmail.trim()}
                        >
                            {adding ? "Adding…" : "Add"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
