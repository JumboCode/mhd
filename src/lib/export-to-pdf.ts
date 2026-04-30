/***************************************************************
 *
 *         /src/lib/export-to-pdf.ts
 *
 *         Author: Will and Justin
 *         Date: 2/1/2026
 *
 *         Modified by Steven on 3/24/26
 *
 *        Summary: Export chart data URLs as a multi-page PDF.
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

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Failed to load chart image"));
        img.src = src;
    });
}

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
    const pageWidth = pdf.internal.pageSize.getWidth();
    const maxImgWidth = (pageWidth - PAGE_MARGIN * 2) * 0.85;

    for (let idx = 0; idx < cart.length; idx++) {
        const dataUrl = cart[idx];
        const img = await loadImage(dataUrl);

        if (idx > 0) pdf.addPage();

        const afterHeader = drawHeader(pdf);
        const afterTitle = drawTitle(pdf, filterNames[idx], afterHeader + 2);

        const finalH = (img.height / img.width) * maxImgWidth;
        const chartX = (pageWidth - maxImgWidth) / 2;

        pdf.addImage(
            dataUrl,
            "PNG",
            chartX,
            afterTitle,
            maxImgWidth,
            finalH,
            undefined,
            "FAST",
        );

        drawFilters(pdf, filterDetails[idx], afterTitle + finalH + 10);
    }

    applyFootersToAllPages(pdf);

    if (print) {
        const blob = pdf.output("blob");
        window.open(URL.createObjectURL(blob), "_blank");
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
