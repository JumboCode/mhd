/***************************************************************
 *
 *                layout.tsx
 *
 *         Author: Anne, Jack
 *           Date: 1/30/2026
 *
 *
 **************************************************************/

import type { Metadata } from "next";
import "./globals.css";

import { Toaster } from "sonner";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { dmSans, millerBanner, millerDisplay, millerText } from "@/app/fonts";
import ConditionalLayout from "@/components/ConditionalLayout";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UnsavedChangesProvider } from "@/components/UnsavedChangesContext";

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
            className={`${millerBanner.variable} ${millerDisplay.variable} ${millerText.variable} ${dmSans.variable}`}
        >
            <body className="font-sans flex flex-row h-screen overflow-hidden">
                <UnsavedChangesProvider>
                    <NuqsAdapter>
                        <ConditionalLayout>
                            <TooltipProvider>{children}</TooltipProvider>
                        </ConditionalLayout>
                    </NuqsAdapter>
                </UnsavedChangesProvider>
                <Toaster />
            </body>
        </html>
    );
}
