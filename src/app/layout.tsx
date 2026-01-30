/***************************************************************
 *
 *                GraphFilters.tsx
 *
 *         Author: Anne, Jack
 *           Date: 1/30/2026
 *
 *
 **************************************************************/

// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

import { Toaster } from "sonner";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import {
    interstate,
    millerBanner,
    millerDisplay,
    millerText,
} from "@/app/fonts";
import ConditionalLayout from "@/components/ConditionalLayout";
import { TooltipProvider } from "@/components/ui/tooltip";

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
                <NuqsAdapter>
                    <ConditionalLayout>
                        <TooltipProvider>{children}</TooltipProvider>
                    </ConditionalLayout>
                </NuqsAdapter>
                <Toaster />
            </body>
        </html>
    );
}
