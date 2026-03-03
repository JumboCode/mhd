import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardSkeletonProps {
    variant?: "default" | "with-aspect";
    className?: string;
}

export function StatCardSkeleton({
    variant = "default",
    className,
}: StatCardSkeletonProps = {}) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center rounded-lg border border-border gap-5",
                {
                    "py-6": variant === "default",
                    "p-6 aspect-[247/138]": variant === "with-aspect",
                },
                className,
            )}
        >
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-12 w-32" />
        </div>
    );
}

/** @deprecated Use StatCardSkeleton with variant="with-aspect" instead */
export function StatCardSkeletonWithAspect() {
    return <StatCardSkeleton variant="with-aspect" />;
}
