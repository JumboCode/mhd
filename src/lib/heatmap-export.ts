/***************************************************************
 *
 *         /src/lib/heatmap-export.ts
 *
 *         Author: Chiara Hansini Elki
 *         Date: 3/3/2026
 *
 *        Summary: Export a mapLibre heatmap to PDF
 **************************************************************/

import jsPDF from "jspdf";
import { toast } from "sonner";
import { Map } from "maplibre-gl";
import "../app/fonts/DMSans-VariableFont_opsz,wght-normal";
import {
    drawHeader,
    drawTitle,
    drawFilters,
    applyFootersToAllPages,
    PAGE_MARGIN,
    type FilterDetail,
} from "./pdf-layout";

export async function exportMapToPDF(
    map: Map | null,
    title: string | null,
    filterDetails: FilterDetail[] = [],
    print = false,
): Promise<boolean> {
    if (!map) {
        toast.error("Map instance not found");
        return false;
    }

    try {
        const canvas = map.getCanvas();
        const dataURL = canvas.toDataURL("image/jpeg", 0.75);

        const pdf = new jsPDF({ compress: true });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const margin = PAGE_MARGIN;

        const afterHeader = drawHeader(pdf);
        const safeTitle = title ?? "Heatmap";
        const afterTitle = drawTitle(pdf, safeTitle, afterHeader + 2);

        const aspectRatio = canvas.height / canvas.width;
        const maxImgWidth = pageWidth - margin * 2;
        const finalW = maxImgWidth;
        const finalH = finalW * aspectRatio;
        const imgX = (pageWidth - finalW) / 2;

        pdf.addImage(
            dataURL,
            "JPEG",
            imgX,
            afterTitle,
            finalW,
            finalH,
            undefined,
            "FAST",
        );

        const afterImg = afterTitle + finalH + 10;
        drawFilters(pdf, filterDetails, afterImg);

        applyFootersToAllPages(pdf);

        if (print) {
            const blob = pdf.output("blob");
            const url = URL.createObjectURL(blob);
            window.open(url, "_blank");
        } else {
            const filename = title || "heatmap";
            pdf.save(`${filename}.pdf`);
        }
        return true;
    } catch {
        toast.error("Failed to export heatmap");
        return false;
    }
}
