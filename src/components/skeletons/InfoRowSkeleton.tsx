import { Skeleton } from "@/components/ui/skeleton";

export function InfoRowSkeleton() {
    return (
        <div className="space-y-1">
            <Skeleton className="h-5 w-32" />
        </div>
    );
}
