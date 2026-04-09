import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Schools",
};

export default function SchoolsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
