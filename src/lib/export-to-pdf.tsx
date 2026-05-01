/***************************************************************
 *
 *         /src/lib/export-to-pdf.ts
 *
 *         Public entry points for chart-cart and single-chart
 *         PDF exports. Backed by @react-pdf/renderer for true
 *         vector output.
 *
 **************************************************************/

import { pdf } from "@react-pdf/renderer";
import { toast } from "sonner";
import { type ChartDataset } from "@/components/charts/chartTypes";
import ChartDocument, {
    type ChartDocumentItem,
} from "./pdf/documents/ChartDocument";
import { type FilterDetail } from "./pdf/components/FiltersBox";
import { ensurePdfFontsRegistered } from "./pdf/theme";
import { deliverPdf } from "./pdf/output";

export type { FilterDetail };
export type { ChartDocumentItem };

/**
 * Render the multi-page chart cart as a vector PDF and either
 * download it or open it for printing.
 */
export async function downloadGraphs(
    items: ChartDocumentItem[],
    print = false,
    filename?: string,
): Promise<void> {
    if (items.length === 0) {
        toast.error("Cart is empty");
        return;
    }
    ensurePdfFontsRegistered();

    try {
        const blob = await pdf(<ChartDocument items={items} />).toBlob();
        const name = filename || items[0]?.title || "chart";
        deliverPdf(blob, name, print);
    } catch {
        toast.error("Failed to export PDF");
    }
}

/**
 * One-shot export for a single chart. Wraps the chart params in
 * a one-element ChartDocumentItem array and forwards to downloadGraphs.
 */
export async function downloadSingleGraph(
    chartType: "bar" | "line",
    dataset: ChartDataset[],
    yAxisLabel: string,
    legendTitle: string | undefined,
    filterName: string,
    filterDetails: FilterDetail[] = [],
    print = false,
): Promise<void> {
    const item: ChartDocumentItem = {
        type: "chart",
        chartType,
        title: filterName,
        dataset,
        yAxisLabel,
        legendTitle,
        xAxisLabel: "Year",
        filterDetails,
    };
    await downloadGraphs([item], print, filterName);
}
