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
    });

    downloadGraphs([canvas.toDataURL()], [filterName], print);
}
