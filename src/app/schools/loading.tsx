import { TableSkeleton } from "@/components/skeletons/TableSkeleton";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="font-sans h-full w-full max-w-full flex flex-col overflow-hidden px-6 py-5">
            <div className="flex items-center shrink-0 pb-5">
                <Breadcrumbs />
                <div className="flex-1 text-center">
                    <Skeleton className="h-7 w-24 mx-auto" />
                </div>
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-[180px]" />
                    <Skeleton className="h-10 w-64" />
                </div>
            </div>
            <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                <div className="flex-1 overflow-hidden min-h-0">
                    <TableSkeleton rows={10} cols={6} />
                </div>
            </div>
        </div>
    );
}
