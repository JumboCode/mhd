"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    ReactNode,
} from "react";
import { createRoot } from "react-dom/client";
import html2canvas from "html2canvas-pro";
import { toast } from "sonner";
import { type Filters } from "@/components/GraphFilters/GraphFilters";
import {
    computeGraphDataset,
    measuredAsLabels,
    groupByLabels,
    type Project,
} from "@/lib/compute-chart-data";
import { ChartDataset } from "@/components/charts/chartTypes";
import BarGraph from "@/components/charts/BarGraph";
import MultiLineGraph from "@/components/charts/LineGraph";
import { downloadGraphs, type FilterDetail } from "@/lib/export-to-pdf";

/**
 * Chart items store only the filter params — no data.
 * Data is fetched from the API at export time.
 */
export type ChartCartParams = {
    chartType: "bar" | "line";
    filters: Filters;
    yearStart: number;
    yearEnd: number;
};

export type CartItem =
    | {
          type: "chart";
          filterName: string;
          params: ChartCartParams;
          filterDetails: FilterDetail[];
      }
    | {
          type: "map";
          filterName: string;
          imageDataUrl: string;
          filterDetails: FilterDetail[];
      };

type CartContextValue = {
    items: CartItem[];
    addChartItem: (
        filterName: string,
        params: ChartCartParams,
        filterDetails?: FilterDetail[],
    ) => void;
    addMapItem: (
        filterName: string,
        imageDataUrl: string,
        filterDetails?: FilterDetail[],
    ) => void;
    removeItem: (index: number) => void;
    removeByName: (filterName: string) => void;
    clearCart: () => void;
    exportAll: () => Promise<void>;
    isExporting: boolean;
    hasItem: (filterName: string) => boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "cart";

/**
 * Fetch projects and gateway schools, then compute the chart dataset.
 * Throws on network/API errors so the caller can handle them.
 */
async function fetchAndComputeDataset(params: ChartCartParams) {
    const [projectsRes, gatewayRes] = await Promise.all([
        fetch("/api/projects"),
        fetch("/api/schools?gateway=true&list=true"),
    ]);

    if (!projectsRes.ok) throw new Error("Failed to load project data");
    if (!gatewayRes.ok) throw new Error("Failed to load gateway schools");

    const rawProjects: Project[] = await projectsRes.json();
    const gatewaySchools: string[] = (await gatewayRes.json()).map(
        (s: { name: string }) => s.name,
    );

    const projects = rawProjects.map((p) => ({
        ...p,
        gatewaySchool: gatewaySchools.includes(p.schoolName)
            ? "Gateway"
            : "Non-Gateway",
    }));

    return computeGraphDataset(projects, {
        filters: params.filters,
        yearStart: params.yearStart,
        yearEnd: params.yearEnd,
    });
}

/** Render a chart component offscreen and capture it as a data URL. */
async function renderChartToImage(
    params: ChartCartParams,
    dataset: ChartDataset[],
) {
    const yAxisLabel =
        measuredAsLabels[params.filters.measuredAs] || "Total Schools";
    const legendTitle =
        params.filters.groupBy === "none"
            ? undefined
            : groupByLabels[params.filters.groupBy];

    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.left = "-9999px";
    container.style.top = "0";
    container.style.width = "800px";
    container.style.height = "500px";
    container.style.backgroundColor = "#fff";
    document.body.appendChild(container);

    const root = createRoot(container);

    if (params.chartType === "bar") {
        root.render(
            <BarGraph
                dataset={dataset}
                yAxisLabel={yAxisLabel}
                xAxisLabel="Year"
                legendTitle={legendTitle}
            />,
        );
    } else {
        root.render(
            <MultiLineGraph
                datasets={dataset}
                yAxisLabel={yAxisLabel}
                xAxisLabel="Year"
                legendTitle={legendTitle}
            />,
        );
    }

    await new Promise((resolve) => setTimeout(resolve, 100));

    const canvas = await html2canvas(container, {
        backgroundColor: "#fff",
        scale: 2,
    });
    const dataUrl = canvas.toDataURL();

    root.unmount();
    document.body.removeChild(container);

    return dataUrl;
}

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isExporting, setIsExporting] = useState(false);

    // Load from sessionStorage on mount
    useEffect(() => {
        try {
            const stored = sessionStorage.getItem(STORAGE_KEY);
            if (stored) {
                setItems(JSON.parse(stored));
            }
        } catch {
            // ignore parse errors
        }
    }, []);

    // Sync to sessionStorage when items change
    useEffect(() => {
        if (items.length === 0) {
            sessionStorage.removeItem(STORAGE_KEY);
        } else {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        }
    }, [items]);

    const addChartItem = useCallback(
        (
            filterName: string,
            params: ChartCartParams,
            filterDetails: FilterDetail[] = [],
        ) => {
            setItems((prev) => [
                ...prev,
                { type: "chart", filterName, params, filterDetails },
            ]);
        },
        [],
    );

    const addMapItem = useCallback(
        (
            filterName: string,
            imageDataUrl: string,
            filterDetails: FilterDetail[] = [],
        ) => {
            setItems((prev) => [
                ...prev,
                { type: "map", filterName, imageDataUrl, filterDetails },
            ]);
        },
        [],
    );

    const removeItem = useCallback((index: number) => {
        setItems((prev) => prev.filter((_, i) => i !== index));
    }, []);

    const removeByName = useCallback((filterName: string) => {
        setItems((prev) => prev.filter((i) => i.filterName !== filterName));
    }, []);

    const hasItem = useCallback(
        (filterName: string) => items.some((i) => i.filterName === filterName),
        [items],
    );

    const clearCart = useCallback(() => {
        setItems([]);
        sessionStorage.removeItem(STORAGE_KEY);
    }, []);

    const exportAll = useCallback(async () => {
        setIsExporting(true);

        if (items.length === 0) {
            toast.error("Cart is empty");
            setIsExporting(false);
            return;
        }

        try {
            // Generate images for each item
            const imageDataUrls: string[] = [];
            for (const item of items) {
                if (item.type === "map") {
                    imageDataUrls.push(item.imageDataUrl);
                } else {
                    const dataset = await fetchAndComputeDataset(item.params);
                    const dataUrl = await renderChartToImage(
                        item.params,
                        dataset,
                    );
                    imageDataUrls.push(dataUrl);
                }
            }

            await downloadGraphs(
                imageDataUrls,
                items.map((i) => i.filterName),
                items.map((i) => i.filterDetails ?? []),
                false,
                "chart",
            );
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : "Failed to export",
            );
        } finally {
            setIsExporting(false);
        }
    }, [items]);

    return (
        <CartContext.Provider
            value={{
                items,
                addChartItem,
                addMapItem,
                removeItem,
                removeByName,
                clearCart,
                exportAll,
                isExporting,
                hasItem,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
