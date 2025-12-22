import { Skeleton } from "@/components/ui/skeleton";

type TableSkeletonProps = {
    rows?: number;
    cols?: number;
};

export function TableSkeleton({ rows = 8, cols = 5 }: TableSkeletonProps) {
    return (
        <div className="overflow-x-auto rounded-md border">
            <div className="border-separate border-spacing-0">
                {/* Header */}
                <div className="sticky top-0 z-10 border-b bg-muted">
                    <div className="flex">
                        {Array.from({ length: cols }).map((_, c) => (
                            <div
                                key={c}
                                className={`flex-1 p-4 border-r ${
                                    c === 0
                                        ? "sticky left-0 z-30 min-w-[200px] w-[200px]"
                                        : ""
                                }`}
                            >
                                <Skeleton className="h-4 w-24 mx-auto" />
                            </div>
                        ))}
                    </div>
                </div>
                {/* Rows */}
                <div className="divide-y">
                    {Array.from({ length: rows }).map((_, r) => (
                        <div key={r} className="flex">
                            {Array.from({ length: cols }).map((_, c) => (
                                <div
                                    key={c}
                                    className={`flex-1 p-4 border-r ${
                                        c === 0
                                            ? "sticky left-0 z-20 bg-muted min-w-[200px] w-[200px]"
                                            : ""
                                    }`}
                                >
                                    <Skeleton className="h-4 w-20 mx-auto" />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
