import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Heatmap",
};

export default function MapLayout({ children }: { children: React.ReactNode }) {
    return <Suspense>{children}</Suspense>;
}
