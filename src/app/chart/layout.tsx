import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Bar Chart",
};

export default function ChartLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <Suspense>{children}</Suspense>;
}
