"use client";

import { usePathname } from "next/navigation";
import ResponsiveLayout from "@/components/ResponsiveLayout";
import Sidebar from "@/components/Sidebar";

export default function ConditionalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isAuthPage = pathname === "/signin" || pathname === "/signup";

    // If on auth pages, just render children without sidebar
    if (isAuthPage) {
        return <main className="w-full h-full">{children}</main>;
    }

    // Otherwise, render with sidebar and responsive layout
    return (
        <ResponsiveLayout>
            <Sidebar />
            <main className="flex-1 flex justify-center overflow-hidden">
                {children}
            </main>
        </ResponsiveLayout>
    );
}
