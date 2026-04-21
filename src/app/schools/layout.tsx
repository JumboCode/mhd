import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: {
        template: "%s | MHD",
        default: "Schools",
    },
};

export default function SchoolsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <Suspense>{children}</Suspense>;
}
