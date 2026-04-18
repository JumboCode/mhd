/***************************************************************
 *
 *         /src/lib/export-to-pdf.ts
 *
 *         Author: Will and Justin
 *         Date: 2/1/2026
 *
 *         Modified by Steven on 3/24/26
 *
 *        Summary: Export an svg graph as a pdf
 **************************************************************/

import React from "react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import logoImg from "../../public/images/mhd-logo-full.png";
import { toast } from "sonner";
import "../app/fonts/DMSans-VariableFont_opsz,wght-normal";

export function downloadGraphs(
    cart: string[],
    filterNames: string[],
    print = false,
) {
    // Displays toast when there are no images to export
    if (cart.length === 0) {
        toast.error("Cart is empty");
        return Promise.resolve();
    }

    return new Promise((resolve) => {
        const pdf = new jsPDF();

        // Does process for each graph in the cart
        cart.forEach((canvas: string, idx: number) => {
            const img = new Image();
            img.src = canvas;

            // Date data for image
            const time = new Date();
            const year = String(time.getFullYear());
            const month = String(time.getMonth() + 1);
            const day = String(time.getDate());

            img.onload = () => {
                const imgWidth = pdf.internal.pageSize.getWidth();
                const imgHeight = (img.height / img.width) * imgWidth;

                pdf.setFont("DMSans-VariableFont_opsz,wght", "normal");

                pdf.text(`${month}/${day}/${year}`, 170, 15);
                pdf.addImage(
                    logoImg.src,
                    "PNG",
                    15,
                    10,
                    logoImg.width * 0.03,
                    logoImg.height * 0.03,
                );

                const margin = 15;
                const wrappedTitle = pdf.splitTextToSize(
                    filterNames[idx],
                    pdf.internal.pageSize.getWidth() - margin * 2,
                );
                pdf.text(wrappedTitle, margin, 50);

                const titleHeight = wrappedTitle.length * 7;
                pdf.addImage(
                    canvas,
                    "JPEG",
                    15,
                    50 + titleHeight,
                    imgWidth * 0.9,
                    imgHeight * 0.9,
                );

                if (idx < cart.length - 1) pdf.addPage();

                if (idx === cart.length - 1) {
                    if (print) {
                        const blob = pdf.output("blob");
                        const url = URL.createObjectURL(blob);
                        window.open(url, "_blank");
                    } else {
                        const filename = filterNames[0] || "chart";
                        pdf.save(`${filename}.pdf`);
                    }
                    setTimeout(resolve, 1000);
                }
            };
        });
    });
}

/**
 * Helper to download a single React component (like a graph or page wrapper) as a PDF.
 * Uses html2canvas to take a DOM snapshot.
 *
 * Note on formatting: We utilize the `onclone` callback to modify the DOM of the
 * cloned, off-screen snapshot right before html2canvas captures it. This allows us
 * to do things like reposition the school map next to the pie chart specifically
 * for the PDF without impacting the live, visible page layout.
 */
export async function downloadSingleGraph(
    chartRef: React.RefObject<HTMLDivElement | null>,
    filterName: string,
    print = false,
) {
    const el = chartRef.current;
    if (!el) return;

    const canvas = await html2canvas(el, {
        backgroundColor: "#fff",
        scale: 2,
        /*
        onclone essentially screenshots the DOM and returns it, this is used
        to modify the profile page so it formats well in the PDF
        */
        onclone: (doc) => {
            // have pie chart and map side by side
            const mapTitle = Array.from(doc.querySelectorAll("h2")).find((h) =>
                h.textContent?.includes("School Location"),
            );
            if (!mapTitle) return;

            const mapContainer = mapTitle.parentElement;
            const pieGrid = mapContainer?.previousElementSibling;

            if (mapContainer && pieGrid && pieGrid.classList.contains("grid")) {
                mapTitle.remove();

                pieGrid.className = "flex flex-row items-stretch gap-8 w-full";

                const pieWrapper = pieGrid.firstElementChild as HTMLElement;
                if (pieWrapper) pieWrapper.className = "flex-1 min-w-0";

                pieGrid.appendChild(mapContainer);

                mapContainer.className = "flex-1 min-w-0 flex flex-col";

                const mapInnerDiv = mapContainer.querySelector(".h-80");
                if (mapInnerDiv) {
                    mapInnerDiv.className = mapInnerDiv.className.replace(
                        "h-80",
                        "h-[272px] w-full",
                    );

                    // draw the school dot (original dot layer doesn't get captured)
                    const dot = doc.createElement("div");
                    dot.className =
                        "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-red-500/60 border-2 border-red-500 shadow-lg";
                    dot.style.zIndex = "50";
                    mapInnerDiv.appendChild(dot);
                }
            }
        },
    });

    downloadGraphs([canvas.toDataURL()], [filterName], print);
}
