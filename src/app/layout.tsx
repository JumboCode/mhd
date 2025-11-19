// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { ExpandedProvider } from "@/context/ExpandedContext";

import {
    interstate,
    millerBanner,
    millerDisplay,
    millerText,
} from "@/app/fonts";

export const metadata: Metadata = {
    title: "MHD",
    description: "MHD",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            className={`${millerBanner.variable} ${millerDisplay.variable} ${millerText.variable} ${interstate.variable}`}
        >
            <body className="font-sans flex">
                <ExpandedProvider>
                    {/* Sidebar stays fixed on the left */}
                    <Sidebar />

                    {/* Page content */}
                    <div className="flex-1">{children}</div>
                </ExpandedProvider>
            </body>
        </html>
    );
}
