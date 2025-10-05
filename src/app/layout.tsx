import type { Metadata } from "next";
import React from "react";
import "./globals.css";
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
            <body className="font-sans">{children}</body>
        </html>
    );
}
