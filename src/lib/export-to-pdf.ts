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

import jsPDF from "jspdf";
import { toast } from "sonner";
import "../app/fonts/DMSans-VariableFont_opsz,wght-normal";
import {
    drawHeader,
    drawTitle,
    drawFilters,
    applyFootersToAllPages,
    PAGE_MARGIN,
    type FilterDetail,
} from "./pdf-layout";
import { type ChartDataset } from "@/components/charts/chartTypes";
import { renderChartToDataUrl } from "@/lib/render-chart";

export type { FilterDetail };

export async function downloadGraphs(
    cart: string[],
    filterNames: string[],
    filterDetails: FilterDetail[][] = [],
    print = false,
    filename?: string,
) {
    if (cart.length === 0) {
        toast.error("Cart is empty");
        return;
    }

    const pdf = new jsPDF({ compress: true });

    for (let idx = 0; idx < cart.length; idx++) {
        const canvas = cart[idx];

        await new Promise<void>((resolve) => {
            const img = new Image();
            img.src = canvas;
            img.onload = () => {
                if (idx > 0) pdf.addPage();

                const pageWidth = pdf.internal.pageSize.getWidth();
                const margin = PAGE_MARGIN;

                const afterHeader = drawHeader(pdf);
                const afterTitle = drawTitle(
                    pdf,
                    filterNames[idx],
                    afterHeader + 2,
                );

                const maxImgWidth = pageWidth - margin * 2;
                const scale = 0.85;
                const finalW = maxImgWidth * scale;
                const finalH = (img.height / img.width) * finalW;
                const chartX = (pageWidth - finalW) / 2;

                pdf.addImage(
                    canvas,
                    "JPEG",
                    chartX,
                    afterTitle,
                    finalW,
                    finalH,
                    undefined,
                    "FAST",
                );

                const afterChart = afterTitle + finalH + 10;
                drawFilters(pdf, filterDetails[idx], afterChart);

                resolve();
            };
        });
    }

    applyFootersToAllPages(pdf);

    if (print) {
        const blob = pdf.output("blob");
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
    } else {
        const name = filename || filterNames[0] || "chart";
        pdf.save(`${name}.pdf`);
    }
}

export async function downloadSingleGraph(
    chartType: "bar" | "line",
    dataset: ChartDataset[],
    yAxisLabel: string,
    legendTitle: string | undefined,
    filterName: string,
    filterDetails: FilterDetail[] = [],
    print = false,
) {
    const dataUrl = await renderChartToDataUrl(
        chartType,
        dataset,
        yAxisLabel,
        legendTitle,
    );

    await downloadGraphs([dataUrl], [filterName], [filterDetails], print);
}
