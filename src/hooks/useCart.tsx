"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    ReactNode,
} from "react";
import { toast } from "sonner";
import { type Filters } from "@/components/GraphFilters/GraphFilters";
import {
    computeGraphDataset,
    measuredAsLabels,
    groupByLabels,
    type Project,
} from "@/lib/compute-chart-data";
import {
    type FilterDetail,
    type ChartDocumentItem,
    downloadGraphs,
} from "@/lib/export-to-pdf";

/**
 * Chart items store only the filter params — no data or pre-rendered
 * preview image. The dataset is fetched and computed on demand
 * (preview hover, export) and the chart is rendered as true vector
 * via @react-pdf/renderer.
 */
export type ChartCartParams = {
    chartType: "bar" | "line";
    filters: Filters;
    yearStart: number;
    yearEnd: number;
    tableData?: {
        cols: { header: string; accessorKey: string }[];
        rows: Record<string, unknown>[];
    };
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
 * Fetch projects + gateway-school list, then compute the chart dataset.
 * Throws on network/API errors.
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
        if (items.length === 0) {
            toast.error("Cart is empty");
            return;
        }

        setIsExporting(true);
        try {
            const docItems: ChartDocumentItem[] = await Promise.all(
                items.map(async (item): Promise<ChartDocumentItem> => {
                    if (item.type === "map") {
                        return {
                            type: "map",
                            title: item.filterName,
                            imageDataUrl: item.imageDataUrl,
                            filterDetails: item.filterDetails,
                        };
                    }
                    const dataset = await fetchAndComputeDataset(item.params);
                    const yAxisLabel =
                        measuredAsLabels[item.params.filters.measuredAs] ||
                        "Total Schools";
                    const legendTitle =
                        item.params.filters.groupBy === "none"
                            ? undefined
                            : groupByLabels[item.params.filters.groupBy];
                    return {
                        type: "chart",
                        chartType: item.params.chartType,
                        title: item.filterName,
                        dataset,
                        yAxisLabel,
                        legendTitle,
                        xAxisLabel: "Year",
                        filterDetails: item.filterDetails,
                    };
                }),
            );

            await downloadGraphs(docItems, false, "chart");
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
