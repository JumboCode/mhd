/***************************************************************
 *
 *         /src/lib/heatmap-export.tsx
 *
 *         Public entry point for exporting a MapLibre heatmap
 *         to PDF. The map canvas is WebGL → must stay raster.
 *
 **************************************************************/

import { pdf } from "@react-pdf/renderer";
import { toast } from "sonner";
import { Map } from "maplibre-gl";
import MapDocument, {
    type HeatmapLegendData,
} from "./pdf/documents/MapDocument";
import { type FilterDetail } from "./pdf/components/FiltersBox";
import { ensurePdfFontsRegistered } from "./pdf/theme";
import { deliverPdf } from "./pdf/output";

export async function exportMapToPDF(
    map: Map | null,
    title: string | null,
    filterDetails: FilterDetail[] = [],
    legend?: HeatmapLegendData,
    print = false,
): Promise<boolean> {
    if (!map) {
        toast.error("Map instance not found");
        return false;
    }
    ensurePdfFontsRegistered();

    try {
        const canvas = map.getCanvas();
        const dataURL = canvas.toDataURL("image/jpeg", 0.85);

        const safeTitle = title ?? "Heatmap";
        const blob = await pdf(
            <MapDocument
                title={safeTitle}
                imageDataUrl={dataURL}
                filterDetails={filterDetails}
                legend={legend}
            />,
        ).toBlob();
        deliverPdf(blob, safeTitle, print);
        return true;
    } catch {
        toast.error("Failed to export heatmap");
        return false;
    }
}
