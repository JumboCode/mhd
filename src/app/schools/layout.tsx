import type { Metadata } from "next";

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
    return children;
}
