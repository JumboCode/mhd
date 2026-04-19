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
import logoImg from "../../public/images/mhd-logo-full.png";
import { toast } from "sonner";
import { Map } from "maplibre-gl";
import "../app/fonts/DMSans-VariableFont_opsz,wght-normal";
import type { FilterDetail } from "./export-to-pdf";

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
        const dataURL = canvas.toDataURL("image/jpeg", 1.0);

        const pdf = new jsPDF();

        // Metadata
        const time = new Date();
        const year = String(time.getFullYear());
        const month = String(time.getMonth() + 1).padStart(2, "0");
        const day = String(time.getDate()).padStart(2, "0");

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const aspectRatio = canvas.height / canvas.width;

        pdf.setFont("DMSans-VariableFont_opsz,wght", "normal");

        pdf.text(`${month}/${day}/${year}`, 155, 15);
        pdf.addImage(
            logoImg.src,
            "PNG",
            20,
            10,
            logoImg.width * 0.03,
            logoImg.height * 0.03,
        );

        const margin = 20;
        const safeTitle = title ?? "Heatmap";
        const wrappedTitle = pdf.splitTextToSize(
            safeTitle,
            pdfWidth - margin * 2,
        );
        pdf.text(wrappedTitle, margin, 50);

        // Calculate dimensions to maintain aspect ratio
        const titleHeight = wrappedTitle.length * 7;
        const imgWidth = pdfWidth - margin * 2;
        const imgHeight = imgWidth * aspectRatio;

        const imgY = 50 + titleHeight;
        pdf.addImage(dataURL, "JPEG", margin, imgY, imgWidth, imgHeight);

        if (filterDetails.length > 0) {
            let cursorY = imgY + imgHeight + 10;
            pdf.setFontSize(11);
            pdf.text("Applied Filters:", margin, cursorY);
            cursorY += 6;
            pdf.setFontSize(10);
            filterDetails.forEach(({ label, values }) => {
                if (cursorY > pdf.internal.pageSize.getHeight() - 20) {
                    pdf.addPage();
                    cursorY = 20;
                }
                const wrapped = pdf.splitTextToSize(
                    `${label}: ${values.join(", ")}`,
                    pdfWidth - margin * 2,
                );
                pdf.text(wrapped, margin, cursorY);
                cursorY += wrapped.length * 5 + 3;
            });
        }

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
