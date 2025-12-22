import { Skeleton } from "@/components/ui/skeleton";

export function StatCardSkeleton() {
    return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-border py-6 gap-5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-12 w-32" />
        </div>
    );
}

export function StatCardSkeletonWithAspect() {
    return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-border p-6 aspect-247/138 gap-5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-12 w-32" />
        </div>
    );
}
