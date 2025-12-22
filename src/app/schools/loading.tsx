import { TableSkeleton } from "@/components/skeletons/TableSkeleton";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="font-sans mt-5">
            <div className="w-11/12 mx-auto">
                <div className="flex items-center font-bold">
                    <Breadcrumbs />
                    <div className="flex-1 text-center">
                        <Skeleton className="h-7 w-24 mx-auto" />
                    </div>
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-[180px]" />
                        <Skeleton className="h-10 w-64" />
                    </div>
                </div>
                <div className="mt-5 overflow-x-auto">
                    <TableSkeleton rows={10} cols={6} />
                </div>
            </div>
        </div>
    );
}
