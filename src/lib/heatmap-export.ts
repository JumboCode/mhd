/***************************************************************
 *
 *         /src/lib/heatmap-export.ts
 *
 *         Author: Chiara Hansini Elki
 *         Date: 3/3/2026
 *
 *        Summary: Export a mapLibre heatmap to PDF
 **************************************************************/

import { useState } from "react";
import jsPDF from "jspdf";
import logoImg from "../../public/images/logo.png";
import { toast } from "sonner";
import { Map } from "maplibre-gl";
import "../app/fonts/interstate-bold-normal";

export async function exportMapToPDF(
    map: Map | null,
    title: string = "Heatmap",
) {
    if (!map) {
        toast.error("Map instance not found");
        return;
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

        pdf.setFont("interstate-bold", "normal");

        pdf.text(`${month}/${day}/${year}`, 155, 15);
        pdf.addImage(
            logoImg.src,
            "PNG",
            20,
            10,
            logoImg.width * 0.03,
            logoImg.height * 0.03,
        );

        pdf.text(title, 20, 50);

        // Calculate dimensions to maintain aspect ratio
        // 10px margin
        const margin = 20;
        const imgWidth = pdfWidth - margin * 2;
        const imgHeight = imgWidth * aspectRatio;

        pdf.addImage(dataURL, "JPEG", margin, 55, imgWidth, imgHeight);

        pdf.save("heatmap.pdf");
        toast.success("Heatmap exported successfully!");
    } catch (error) {
        toast.error("Failed to export heatmap");
    }
}

export function useMapExport() {
    const [isExporting, setIsExporting] = useState(false);

    const exportToPDF = async (map: Map | null, title: string = "Heatmap") => {
        setIsExporting(true);
        try {
            await exportMapToPDF(map, title);
        } finally {
            setIsExporting(false);
        }
    };

    return { exportToPDF, isExporting };
}
