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

// New type to hold structured filter data
export type FilterDetail = {
    label: string; // e.g. "School"
    values: string[]; // e.g. ["Lincoln High", "Washington Middle"]
};

export async function downloadGraphs(
    cart: string[],
    filterNames: string[],
    filterDetails: FilterDetail[][] = [],
) {
    if (cart.length === 0) {
        toast.error("Cart is empty");
        return;
    }

    const pdf = new jsPDF();

    for (let idx = 0; idx < cart.length; idx++) {
        const canvas = cart[idx];

        await new Promise<void>((resolve) => {
            const img = new Image();
            img.src = canvas;
            img.onload = () => {
                pdf.setFontSize(11);
                pdf.setFont("DMSans-VariableFont_opsz,wght", "normal");
                const time = new Date();
                const year = String(time.getFullYear());
                const month = String(time.getMonth() + 1);
                const day = String(time.getDate());

                const pageWidth = pdf.internal.pageSize.getWidth();
                const imgWidth = pageWidth;
                const imgHeight = (img.height / img.width) * imgWidth;

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

                // title formatting
                pdf.setFont("DMSans-VariableFont_opsz,wght", "normal");
                pdf.setFontSize(14);

                const wrappedTitle = pdf.splitTextToSize(
                    filterNames[idx],
                    pageWidth - margin * 2,
                );

                const titleY = 50;

                pdf.text(wrappedTitle, pageWidth / 2, titleY, {
                    align: "center",
                });

                const titleHeight = wrappedTitle.length * 7;

                const chartY = 50 + titleHeight;
                pdf.addImage(
                    canvas,
                    "JPEG",
                    margin,
                    chartY,
                    imgWidth * 0.8,
                    imgHeight * 0.8,
                );

                const details = filterDetails[idx];
                if (details && details.length > 0) {
                    let cursorY = chartY + imgHeight * 0.8 + 10;

                    pdf.setFontSize(11);
                    pdf.text("Applied Filters:", margin, cursorY);
                    cursorY += 6;
                    pdf.setFontSize(10);

                    details.forEach(({ label, values }) => {
                        if (cursorY > pdf.internal.pageSize.getHeight() - 20) {
                            pdf.addPage();
                            cursorY = 20;
                        }
                        const line = `${label}: ${values.join(", ")}`;
                        const wrapped = pdf.splitTextToSize(
                            line,
                            pageWidth - margin * 2,
                        );
                        pdf.text(wrapped, margin, cursorY);
                        cursorY += wrapped.length * 5 + 3;
                    });
                }

                if (idx < cart.length - 1) pdf.addPage();
                resolve();
            };
        });
    }

    pdf.save("chart.pdf");
}

export async function addToCart(
    chartRef: React.RefObject<HTMLDivElement | null>,
    cart: string[],
    setCart: Dispatch<SetStateAction<string[]>>,
    filterNames: string[],
    setFilterNames: Dispatch<SetStateAction<string[]>>,
    filterName: string,
    filterDetails: FilterDetail[], // NEW
    allFilterDetails: FilterDetail[][], // NEW
    setAllFilterDetails: Dispatch<SetStateAction<FilterDetail[][]>>, // NEW
): Promise<void> {
    const el = chartRef.current;
    if (!el) return;

    const canvas = await html2canvas(el, {
        backgroundColor: "#fff",
        scale: 2,
        height: el.scrollHeight,
        windowHeight: el.scrollHeight,
    });

    setCart([...cart, canvas.toDataURL()]);
    setFilterNames([...filterNames, filterName]);
    setAllFilterDetails([...allFilterDetails, filterDetails]); // NEW
}

export async function downloadSingleGraph(
    chartRef: React.RefObject<HTMLDivElement | null>,
    filterName: string,
    filterDetails: FilterDetail[] = [], // NEW
) {
    const el = chartRef.current;
    if (!el) return;

    const canvas = await html2canvas(el, {
        backgroundColor: "#fff",
        scale: 2,
        height: el.scrollHeight,
        windowHeight: el.scrollHeight,
    });

    await downloadGraphs([canvas.toDataURL()], [filterName], [filterDetails]); // NEW
}

export function clearCart(
    setCart: Dispatch<SetStateAction<string[]>>,
    setFilterNames: Dispatch<SetStateAction<string[]>>,
    setAllFilterDetails: Dispatch<SetStateAction<FilterDetail[][]>>, // NEW
) {
    setCart([]);
    setFilterNames([]);
    setAllFilterDetails([]); // NEW
    sessionStorage.removeItem("cartStorage");
    sessionStorage.removeItem("cartNameStorage");
}

export function deleteFromCart(
    cart: string[],
    setCart: Dispatch<SetStateAction<string[]>>,
    filterNames: string[],
    setFilterNames: Dispatch<SetStateAction<string[]>>,
    idx: number,
    allFilterDetails: FilterDetail[][], // NEW
    setAllFilterDetails: Dispatch<SetStateAction<FilterDetail[][]>>, // NEW
) {
    setCart(cart.filter((_, index) => index !== idx));
    setFilterNames(filterNames.filter((_, index) => index !== idx));
    setAllFilterDetails(allFilterDetails.filter((_, index) => index !== idx)); // NEW
}
