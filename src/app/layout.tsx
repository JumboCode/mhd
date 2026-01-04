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
import ConditionalLayout from "@/components/ConditionalLayout";

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
            <body className="font-sans flex flex-row h-screen overflow-hidden">
                <ConditionalLayout>{children}</ConditionalLayout>
                <Toaster />
            </body>
        </html>
    );
}
