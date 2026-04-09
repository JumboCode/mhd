import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Schools",
};

export default function SchoolProfileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
