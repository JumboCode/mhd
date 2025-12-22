import { Skeleton } from "@/components/ui/skeleton";

export function GraphsPageSkeleton() {
    return (
        <div className="w-full min-h-screen flex bg-background">
            {/* Left Sidebar - Filter Panel */}
            <div className="flex flex-col border-r border-border p-8 bg-card w-70 h-screen overflow-y-auto sticky top-0 gap-12">
                <Skeleton className="h-6 w-32" />
                <div className="space-y-6">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-8 pt-4 shrink-0">
                    <Skeleton className="h-7 w-48" />
                    <div className="flex gap-3">
                        <Skeleton className="h-9 w-24" />
                        <Skeleton className="h-9 w-24" />
                    </div>
                </div>

                {/* Chart Controls */}
                <div className="flex items-center justify-between px-8 py-3 shrink-0">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-9 w-20" />
                        <Skeleton className="h-9 w-20" />
                    </div>
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-9 w-12" />
                        <Skeleton className="h-9 w-12" />
                        <Skeleton className="h-9 w-32" />
                    </div>
                </div>

                {/* Chart Area */}
                <div className="flex-1 flex items-center justify-center px-8 bg-background overflow-auto">
                    <Skeleton className="h-[500px] w-full max-w-4xl" />
                </div>

                {/* Footer */}
                <div className="flex flex-col justify-center items-end gap-3 px-8 pb-4 shrink-0">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-40" />
                </div>
            </div>
        </div>
    );
}
