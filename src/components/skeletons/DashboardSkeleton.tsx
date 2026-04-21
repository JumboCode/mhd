import { Skeleton } from "@/components/ui/skeleton";
import { StatCardSkeleton } from "./StatCardSkeleton";

export function DashboardSkeleton() {
    return (
        <div className="flex flex-col gap-5 w-full p-8 h-full overflow-hidden">
            {/* Title + year dropdown */}
            <div className="flex flex-row items-center">
                <Skeleton className="h-8 w-56" />
                <div className="ml-auto">
                    <Skeleton className="h-10 w-[180px] rounded-md" />
                </div>
            </div>
            {/* Stats cards - 4 cards in grid */}
            <div className="grid grid-cols-4 gap-5">
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
            </div>

            {/* Charts section - matches Dashboard's side-by-side layout */}
            <div className="grid grid-cols-2 gap-5">
                <div className="px-6 pt-4 pb-2 rounded-lg border border-border">
                    <div className="text-center mb-2">
                        <Skeleton className="h-4 w-32 mx-auto" />
                    </div>
                    <Skeleton className="h-[400px] w-full rounded-md" />
                </div>
                <div className="px-6 pt-4 pb-2 rounded-lg border border-border">
                    <div className="text-center mb-2">
                        <Skeleton className="h-4 w-32 mx-auto" />
                    </div>
                    <Skeleton className="h-[400px] w-full rounded-md" />
                </div>
            </div>
        </div>
    );
}
