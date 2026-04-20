import { DashboardSkeleton } from "@/components/skeletons/DashboardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="flex flex-col gap-5 w-full p-8">
            <div className="flex flex-row items-center">
                <Skeleton className="h-8 w-56" />
                <div className="ml-auto">
                    <Skeleton className="h-10 w-[180px] rounded-md" />
                </div>
            </div>
            <DashboardSkeleton />
        </div>
    );
}
