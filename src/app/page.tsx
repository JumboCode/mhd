import type { Metadata } from "next";
import { Suspense } from "react";
import Dashboard from "@/components/Dashboard";
import { DashboardSkeleton } from "@/components/skeletons/DashboardSkeleton";

export const metadata: Metadata = {
    title: "Dashboard | MHD",
};

export default function Home() {
    return (
        <Suspense fallback={<DashboardSkeleton />}>
            <Dashboard />
        </Suspense>
    );
}
