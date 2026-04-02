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

import React, { Dispatch, SetStateAction } from "react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import logoImg from "../../public/images/mhd-logo-full.png";
import { toast } from "sonner";
import "../app/fonts/DMSans-VariableFont_opsz,wght-normal";

export function downloadGraphs(cart: string[], filterNames: string[]) {
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
                    pdf.save("chart.pdf");
                    setTimeout(resolve, 1000);
                }
            };
        });
    });
}

export async function addToCart(
    chartRef: React.RefObject<HTMLDivElement | null>,
    cart: string[],
    setCart: Dispatch<SetStateAction<string[]>>,
    filterNames: string[],
    setFilterNames: Dispatch<SetStateAction<string[]>>,
    filterName: string,
): Promise<void> {
    const el = chartRef.current;
    if (!el) return;

    const canvas = await html2canvas(el, {
        backgroundColor: "#fff",
        scale: 2,
    });

    setCart([...cart, canvas.toDataURL()]);
    setFilterNames([...filterNames, filterName]);
}

export async function downloadSingleGraph(
    chartRef: React.RefObject<HTMLDivElement | null>,
    filterName: string,
) {
    const el = chartRef.current;
    if (!el) return;

    const canvas = await html2canvas(el, {
        backgroundColor: "#fff",
        scale: 2,
    });

    downloadGraphs([canvas.toDataURL()], [filterName]);
}

export function clearCart(
    setCart: Dispatch<SetStateAction<string[]>>,
    setFilterNames: Dispatch<SetStateAction<string[]>>,
) {
    // Resets cart and filter names
    setCart([]);
    setFilterNames([]);
}

export function deleteFromCart(
    cart: string[],
    setCart: Dispatch<SetStateAction<string[]>>,
    filterNames: string[],
    setFilterNames: Dispatch<SetStateAction<string[]>>,
    idx: number,
) {
    setCart(cart.filter((_, index) => index !== idx));
    setFilterNames(filterNames.filter((_, index) => index !== idx));
}
