import { Skeleton } from "@/components/ui/skeleton";
import { StatCardSkeleton } from "./StatCardSkeleton";

export function DashboardSkeleton() {
    return (
        <div className="w-full">
            {/* Stats cards - 4 cards in grid */}
            <div className="grid grid-cols-4 gap-5">
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
            </div>

            {/* Charts section - matches Dashboard's side-by-side layout */}
            <div className="grid grid-cols-2 gap-5 my-5">
                {/* Projects chart skeleton */}
                <div className="px-6 pt-4 pb-2 rounded-lg border border-border">
                    <div className="text-center mb-2">
                        <Skeleton className="h-4 w-32 inline-block" />
                    </div>
                    <Skeleton className="h-[400px] w-full rounded-md" />
                </div>
                {/* Schools chart skeleton */}
                <div className="px-6 pt-4 pb-2 rounded-lg border border-border">
                    <div className="text-center mb-2">
                        <Skeleton className="h-4 w-32 inline-block" />
                    </div>
                    <Skeleton className="h-[400px] w-full rounded-md" />
                </div>
            </div>
        </div>
    );
}
