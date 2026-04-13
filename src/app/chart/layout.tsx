import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Bar Chart",
};

export default function ChartLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
