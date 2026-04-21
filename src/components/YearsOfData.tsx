/***************************************************************
 *
 *                /components/YearsOfData.tsx
 *
 *         Author: Zander & Anne
 *           Date: 3/1/2026
 *
 *        Summary: Component for displaying the existing years
 *                 of data and option to delete.
 *
 **************************************************************/

"use client";

import {
    useState,
    useEffect,
    useImperativeHandle,
    forwardRef,
    useRef,
} from "react";
import { toast } from "sonner";
import { Check, Trash, Upload, X } from "lucide-react";
import Link from "next/link";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface YearsOfDataHandle {
    save: () => Promise<void>;
    discard: () => void;
}

type YearEntry = {
    year: number;
    uploadedAt: string | null;
    lastUpdatedAt: string | null;
};

function formatDate(iso: string | null): string {
    if (!iso) return "—";
    return new Date(iso).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

const YearsOfData = forwardRef<
    YearsOfDataHandle,
    { onUnsavedChange?: () => void }
>(function YearsOfData({ onUnsavedChange }, ref) {
    const [entries, setEntries] = useState<YearEntry[]>([]);
    const [yearsWithData, setYearsWithData] = useState<Set<number>>(new Set());
    const [pendingRemovals, setPendingRemovals] = useState<number[]>([]);
    const [originalEntries, setOriginalEntries] = useState<YearEntry[]>([]);
    const [originalYearsWithData, setOriginalYearsWithData] = useState<
        Set<number>
    >(new Set());

    // Confirmation dialog for destructive saves
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);
    const [pendingProjectCounts, setPendingProjectCounts] = useState<
        Record<number, number>
    >({});
    const saveResolverRef = useRef<((confirmed: boolean) => void) | null>(null);

    useEffect(() => {
        async function fetchYears() {
            try {
                const res = await fetch("/api/years-with-data");
                if (!res.ok) throw new Error("Failed to fetch years");

                const data = await res.json();
                if (!data.years || data.years.length === 0) return;

                const fetched: YearEntry[] = data.years;
                const existingYears = fetched.map((e) => e.year);
                const minYear = Math.min(...existingYears);
                const maxYear = Math.max(...existingYears);

                const metaMap = new Map(fetched.map((e) => [e.year, e]));

                const allEntries: YearEntry[] = Array.from(
                    { length: maxYear - minYear + 1 },
                    (_, i) => {
                        const year = maxYear - i;
                        return (
                            metaMap.get(year) ?? {
                                year,
                                uploadedAt: null,
                                lastUpdatedAt: null,
                            }
                        );
                    },
                );

                setEntries(allEntries);
                setYearsWithData(new Set(existingYears));
                setOriginalEntries(allEntries);
                setOriginalYearsWithData(new Set(existingYears));
            } catch {
                toast.error("Failed to load years");
            }
        }

        fetchYears();
    }, []);

    const handleRemoveYear = (year: number) => {
        setEntries((prev) => prev.filter((e) => e.year !== year));
        setYearsWithData((prev) => {
            const newSet = new Set(prev);
            newSet.delete(year);
            return newSet;
        });
        setPendingRemovals((prev) => [...prev, year]);
        onUnsavedChange?.();
    };

    useImperativeHandle(ref, () => ({
        save: async () => {
            if (pendingRemovals.length > 0) {
                // Fetch project counts for all pending years in parallel
                const counts: Record<number, number> = {};
                await Promise.all(
                    pendingRemovals.map(async (year) => {
                        try {
                            const res = await fetch(
                                `/api/yearly-totals?year=${year}`,
                            );
                            const data = await res.json();
                            counts[year] =
                                data.yearlyStats?.totals?.total_projects ?? 0;
                        } catch {
                            counts[year] = 0;
                        }
                    }),
                );
                setPendingProjectCounts(counts);
                setShowSaveConfirm(true);

                const confirmed = await new Promise<boolean>((resolve) => {
                    saveResolverRef.current = resolve;
                });

                if (!confirmed) {
                    throw new Error("cancelled");
                }
            }

            try {
                await Promise.all(
                    pendingRemovals.map((year: number) =>
                        fetch(`/api/delete-year?year=${year}`, {
                            method: "DELETE",
                        }),
                    ),
                );
                const hadChanges = pendingRemovals.length > 0;
                setPendingRemovals([]);
                setOriginalEntries(entries);
                setOriginalYearsWithData(new Set(yearsWithData));
                if (hadChanges) toast.success("Years saved");
            } catch (e) {
                if ((e as Error).message !== "cancelled") {
                    toast.error("Failed to save years");
                }
                throw e;
            }
        },
        discard: () => {
            setEntries(originalEntries);
            setYearsWithData(originalYearsWithData);
            setPendingRemovals([]);
        },
    }));

    const resolveDialog = (confirmed: boolean) => {
        saveResolverRef.current?.(confirmed);
        saveResolverRef.current = null;
        setShowSaveConfirm(false);
    };

    return (
        <>
            <div className="border-2 border-gray-200 rounded-lg overflow-hidden w-full">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                        <tr className="divide-x-2 divide-gray-200">
                            <th className="text-center px-4 py-3 text-sm font-medium text-gray-500 w-[15%]">
                                Year
                            </th>
                            <th className="text-center px-4 py-3 text-sm font-medium text-gray-500 w-[20%]">
                                Status
                            </th>
                            <th className="text-center px-4 py-3 text-sm font-medium text-gray-500 w-[27%]">
                                Uploaded
                            </th>
                            <th className="text-center px-4 py-3 text-sm font-medium text-gray-500 w-[27%]">
                                Last Updated
                            </th>
                            <th className="text-center px-4 py-3 text-sm font-medium text-gray-500 w-[11%]">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {entries.length > 0 ? (
                            entries.map((entry) => (
                                <tr
                                    key={entry.year}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="px-4 py-3 text-sm text-center">
                                        {entry.year}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-center">
                                        <div className="flex items-center justify-center">
                                            {yearsWithData.has(entry.year) ? (
                                                <span className="inline-flex items-center justify-center gap-1.5 w-24 px-3 py-1 rounded-sm text-xs font-medium bg-green-100 text-green-700 border border-green-300">
                                                    <Check className="w-3 h-3" />
                                                    Uploaded
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center justify-center gap-1.5 w-24 px-3 py-1 rounded-sm text-xs font-medium bg-red-100 text-red-600 border border-red-300">
                                                    <X className="w-3 h-3" />
                                                    Missing
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-center text-gray-600">
                                        {formatDate(entry.uploadedAt)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-center text-gray-600">
                                        {formatDate(entry.lastUpdatedAt)}
                                    </td>
                                    <td className="text-sm p-0">
                                        {yearsWithData.has(entry.year) ? (
                                            <button
                                                onClick={() =>
                                                    handleRemoveYear(entry.year)
                                                }
                                                className="w-full h-full px-4 py-3 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                                                aria-label={`Delete ${entry.year}`}
                                            >
                                                <Trash className="w-4 h-4" />
                                            </button>
                                        ) : (
                                            <Link
                                                href={`/upload?year=${entry.year}`}
                                                className="w-full h-full px-4 py-3 flex items-center justify-center text-gray-400 hover:text-blue-500 transition-colors"
                                                aria-label={`Upload ${entry.year}`}
                                            >
                                                <Upload className="w-4 h-4" />
                                            </Link>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="px-4 py-3 text-sm text-gray-500 text-center"
                                >
                                    No years available
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Dialog
                open={showSaveConfirm}
                onOpenChange={(open) => !open && resolveDialog(false)}
            >
                <DialogContent
                    showCloseButton={false}
                    onInteractOutside={(e) => e.preventDefault()}
                >
                    <DialogHeader>
                        <DialogTitle>
                            Permanently delete{" "}
                            {pendingRemovals.length === 1
                                ? "1 year"
                                : `${pendingRemovals.length} years`}{" "}
                            of data?
                        </DialogTitle>
                        <DialogDescription asChild>
                            <div className="space-y-3">
                                <p>
                                    This will permanently delete all data for
                                    the following{" "}
                                    {pendingRemovals.length === 1
                                        ? "year"
                                        : "years"}
                                    . This action cannot be undone.
                                </p>
                                <div className="rounded-md border border-red-200 bg-red-50 divide-y divide-red-200">
                                    {pendingRemovals
                                        .slice()
                                        .sort((a, b) => b - a)
                                        .map((year) => (
                                            <div
                                                key={year}
                                                className="flex items-center justify-between px-4 py-2 text-sm"
                                            >
                                                <span className="font-semibold text-red-800">
                                                    {year}
                                                </span>
                                                <span className="text-red-700">
                                                    {pendingProjectCounts[
                                                        year
                                                    ] ?? 0}{" "}
                                                    project
                                                    {(pendingProjectCounts[
                                                        year
                                                    ] ?? 0) !== 1
                                                        ? "s"
                                                        : ""}
                                                </span>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => resolveDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            className="text-white"
                            onClick={() => resolveDialog(true)}
                        >
                            Delete permanently
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
});

export default YearsOfData;
