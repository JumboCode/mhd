// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

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
            <body className="font-sans flex flex-row h-screen">
                <Sidebar />
                <main className="flex-1 flex justify-center">{children}</main>
            </body>
        </html>
    );
}
