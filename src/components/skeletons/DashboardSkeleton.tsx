import { Skeleton } from "@/components/ui/skeleton";
import { StatCardSkeleton } from "./StatCardSkeleton";

export function DashboardSkeleton() {
    return (
        <div className="flex flex-col gap-8 w-full max-w-5xl px-6 py-10">
            {/* Header skeleton */}
            <Skeleton className="h-8 w-64" />

            {/* Dropdown skeleton */}
            <div className="w-40">
                <Skeleton className="h-10 w-full" />
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-3 gap-5">
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
            </div>
        </div>
    );
}
