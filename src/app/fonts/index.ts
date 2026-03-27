import localFont from "next/font/local";
import { DM_Sans } from "next/font/google";

export const dmSans = DM_Sans({
    subsets: ["latin"],
    variable: "--font-dm-sans",
    display: "swap",
});

export const millerBanner = localFont({
    src: [
        { path: "./millerbanner-roman.otf", weight: "400", style: "normal" },
        { path: "./millerbanner-italic.otf", weight: "400", style: "italic" },
        { path: "./millerbanner-semibold.otf", weight: "600", style: "normal" },
    ],
    variable: "--font-miller-banner",
    display: "swap",
});

export const millerDisplay = localFont({
    src: [
        { path: "./millerdisplay-light.otf", weight: "300", style: "normal" },
        { path: "./millerdisplay-roman.otf", weight: "400", style: "normal" },
    ],
    variable: "--font-miller-display",
    display: "swap",
});

export const millerText = localFont({
    src: [
        { path: "./millertext-romansc.otf", weight: "400", style: "normal" },
        { path: "./millertext-roman.otf", weight: "400", style: "normal" },
        { path: "./millertext-italic.otf", weight: "400", style: "italic" },
        { path: "./millertext-italicsc.otf", weight: "400", style: "italic" },
    ],
    variable: "--font-miller-text",
    display: "swap",
});
