import { Skeleton } from "@/components/ui/skeleton";
import { StatCardSkeleton } from "./StatCardSkeleton";

export function DashboardSkeleton() {
    return (
        <div className="flex flex-col gap-8 w-full px-6 py-10">
            {/* Header row: title + dropdown */}
            <div className="flex flex-row items-center gap-5">
                <Skeleton className="h-8 w-48" />
                <div className="ml-auto">
                    <Skeleton className="h-10 w-36" />
                </div>
            </div>

            {/* Stats cards - 4 cards in grid */}
            <div className="grid grid-cols-4 gap-5">
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
            </div>

            {/* Charts section - matches Dashboard's bordered container */}
            <div className="flex flex-col my-5 rounded-lg border border-border divide-y divide-border">
                {/* Projects chart skeleton */}
                <div className="px-6 pt-4 pb-2">
                    <div className="text-center mb-2">
                        <Skeleton className="h-4 w-32 inline-block" />
                    </div>
                    <Skeleton className="h-[400px] w-full rounded-md" />
                </div>
                {/* Schools chart skeleton */}
                <div className="px-6 pt-4 pb-2">
                    <div className="text-center mb-2">
                        <Skeleton className="h-4 w-32 inline-block" />
                    </div>
                    <Skeleton className="h-[400px] w-full rounded-md" />
                </div>
            </div>
        </div>
    );
}
