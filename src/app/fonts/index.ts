import localFont from "next/font/local";

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
        { path: "./millertext-roman.otf", weight: "400", style: "normal" },
        { path: "./millertext-italic.otf", weight: "400", style: "italic" },
        { path: "./millertext-romansc.otf", weight: "400", style: "normal" },
        { path: "./millertext-italicsc.otf", weight: "400", style: "italic" },
    ],
    variable: "--font-miller-text",
    display: "swap",
});

export const interstate = localFont({
    src: [
        { path: "./interstate-light.otf", weight: "300", style: "normal" },
        { path: "./interstate-regular.otf", weight: "400", style: "normal" },
        { path: "./interstate-bold.otf", weight: "700", style: "normal" },
        { path: "./interstate-black.otf", weight: "900", style: "normal" },
    ],
    variable: "--font-interstate",
    display: "swap",
});
