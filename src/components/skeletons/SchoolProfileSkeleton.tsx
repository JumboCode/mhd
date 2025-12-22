import { Skeleton } from "@/components/ui/skeleton";
import { InfoRowSkeleton } from "./InfoRowSkeleton";
import { StatCardSkeletonWithAspect } from "./StatCardSkeleton";

export function SchoolProfileSkeleton() {
    return (
        <div className="h-screen w-full bg-background overflow-y-auto flex justify-center">
            <div className="w-full flex flex-col gap-8 py-8 max-w-5xl px-6">
                {/* Breadcrumbs skeleton */}
                <Skeleton className="h-6 w-48" />

                {/* Header skeleton */}
                <Skeleton className="h-8 w-64" />

                {/* Stats cards */}
                <div className="grid grid-cols-3 gap-8">
                    <StatCardSkeletonWithAspect />
                    <StatCardSkeletonWithAspect />
                    <StatCardSkeletonWithAspect />
                </div>

                {/* School information */}
                <div className="space-y-2 text-base">
                    <InfoRowSkeleton />
                    <InfoRowSkeleton />
                    <InfoRowSkeleton />
                </div>

                {/* Placeholders for charts */}
                <div className="grid grid-cols-3 gap-8">
                    <div className="border border-border rounded-lg p-6 col-span-2">
                        <div className="h-48 flex items-center justify-center bg-muted rounded">
                            <Skeleton className="h-6 w-32" />
                        </div>
                    </div>
                    <div className="border border-border rounded-lg p-6">
                        <div className="h-48 flex items-center justify-center bg-muted rounded">
                            <Skeleton className="h-6 w-24" />
                        </div>
                    </div>
                </div>

                {/* Data table placeholder */}
                <div className="border border-border rounded-lg p-6">
                    <Skeleton className="h-7 w-48 mb-4" />
                    <div className="h-48 flex items-center justify-center bg-muted rounded">
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>
            </div>
        </div>
    );
}
