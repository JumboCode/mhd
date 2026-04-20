import { SchoolsTableSkeleton } from "@/components/skeletons/SchoolsTableSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="font-sans w-full max-w-full h-full min-h-0 flex flex-col overscroll-none">
            <div className="shrink-0 z-40 flex items-center h-16 px-6 backdrop-blur-xl bg-background/70 border-b justify-between">
                <Skeleton className="h-6 w-20" />
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-[180px]" />
                    <Skeleton className="h-10 w-64" />
                </div>
            </div>
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden overscroll-none">
                <div className="flex-1 min-h-0 min-w-0 overflow-hidden">
                    <SchoolsTableSkeleton />
                </div>
            </div>
        </div>
    );
}
