import { Skeleton } from "@/components/ui/skeleton";
import { StatCardSkeleton } from "./StatCardSkeleton";

export function SchoolProfileSkeleton({
    skipHeader = false,
    contentOnly = false,
}: {
    skipHeader?: boolean;
    contentOnly?: boolean;
} = {}) {
    const content = (
        <>
            {!skipHeader && (
                <div className="flex flex-row items-center w-full">
                    <Skeleton className="h-8 w-64" />
                    <div className="ml-auto flex flex-row items-center gap-2">
                        <Skeleton className="h-10 w-[180px] rounded-md" />
                        <Skeleton className="h-10 w-10 rounded-md" />
                    </div>
                </div>
            )}

            {/* Stats cards */}
            <div className="grid grid-cols-3 gap-8">
                <StatCardSkeleton variant="with-aspect" />
                <StatCardSkeleton variant="with-aspect" />
                <StatCardSkeleton variant="with-aspect" />
            </div>

            {/* Info row placeholder */}
            <div className="flex flex-wrap gap-x-8 gap-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-1">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-5 w-24" />
                    </div>
                ))}
            </div>

            {/* Line chart card */}
            <div className="rounded-lg border border-border px-6 pt-4 pb-2">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-9 w-64 rounded-md" />
                </div>
                <Skeleton className="h-[300px] w-full rounded-md" />
            </div>

            {/* Pie chart placeholder */}
            <div className="grid grid-cols-3 gap-8">
                <div className="col-span-2 min-w-0 rounded-lg border border-border p-6">
                    <Skeleton className="h-[250px] w-full rounded-md" />
                </div>
            </div>

            {/* School location */}
            <div className="rounded-lg space-y-4">
                <Skeleton className="h-7 w-36" />
                <Skeleton className="h-[300px] w-full rounded-lg" />
            </div>

            {/* Data table */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <Skeleton className="h-7 w-44" />
                </div>
                <div className="rounded-lg border border-border p-4">
                    <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-10 w-full" />
                        ))}
                    </div>
                </div>
            </div>
        </>
    );

    if (contentOnly) {
        return <div className="w-full flex flex-col gap-6">{content}</div>;
    }

    return (
        <div className="w-full bg-background overflow-y-auto flex justify-center">
            <div className="w-full flex flex-col gap-6 py-8 max-w-5xl px-6">
                {content}
            </div>
        </div>
    );
}
