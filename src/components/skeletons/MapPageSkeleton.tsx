import { Skeleton } from "@/components/ui/skeleton";

export function MapPageSkeleton() {
    return (
        <div className="flex p-8 flex-col h-screen w-full justify-center">
            {/* Header */}
            <div className="flex justify-between items-center mb-5">
                <Skeleton className="h-8 w-72" />
                <div className="hidden xl:flex gap-3">
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-32" />
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-9 w-28" />
                </div>
            </div>

            {/* Controls row */}
            <div className="flex flex-row flex-wrap shrink-0 pb-5 gap-1 items-end">
                <div className="flex flex-col gap-1.5 w-48">
                    <Skeleton className="h-3 w-14 ml-1" />
                    <Skeleton className="h-10 w-full rounded-md" />
                </div>
                <div className="flex flex-col gap-1.5 w-48">
                    <Skeleton className="h-3 w-10 ml-1" />
                    <Skeleton className="h-10 w-full rounded-md" />
                </div>
                <div className="flex flex-col gap-1.5 w-48">
                    <Skeleton className="h-3 w-24 ml-1" />
                    <Skeleton className="h-10 w-full rounded-md" />
                </div>
                <Skeleton className="h-10 w-24 rounded-md" />
            </div>

            {/* Map area */}
            <div className="flex-1 rounded-2xl overflow-hidden border border-border">
                <Skeleton className="h-full w-full rounded-none" />
            </div>
        </div>
    );
}
