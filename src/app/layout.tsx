// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

import { Toaster } from "sonner";
import {
    interstate,
    millerBanner,
    millerDisplay,
    millerText,
} from "@/app/fonts";
import ResponsiveLayout from "@/components/ResponsiveLayout";
import Sidebar from "@/components/Sidebar";

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
                <ResponsiveLayout>
                    <Sidebar />
                    <main className="flex-1 flex justify-center">
                        {children}
                    </main>
                </ResponsiveLayout>
                <Toaster />
            </body>
        </html>
    );
}
