"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useRef,
    ReactNode,
} from "react";
import { createRoot } from "react-dom/client";
import html2canvas from "html2canvas-pro";
import BarGraph from "@/components/charts/BarGraph";
import MultiLineGraph from "@/components/charts/LineGraph";
import { type ChartDataset } from "@/components/charts/chartTypes";
import { toast } from "sonner";
import { type Filters } from "@/components/GraphFilters/GraphFilters";
import {
    computeGraphDataset,
    measuredAsLabels,
    groupByLabels,
    type Project,
    type SchoolParticipation,
    type TeacherParticipation,
} from "@/lib/compute-chart-data";
import {
    type FilterDetail,
    type ChartDocumentItem,
    downloadGraphs,
} from "@/lib/export-to-pdf";

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
          previewDataUrl?: string;
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
    ensureChartPreviews: () => Promise<void>;
    isExporting: boolean;
    isGeneratingPreviews: boolean;
    hasItem: (filterName: string) => boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "cart";

/**
 * Fetch projects + gateway-school list, then compute the chart dataset.
 * Throws on network/API errors.
 */
async function fetchAndComputeDataset(params: ChartCartParams) {
    const [projectsRes, gatewayRes, schoolRes, teacherRes] = await Promise.all([
        fetch("/api/projects"),
        fetch("/api/schools?gateway=true&list=true"),
        fetch("/api/school-participations"),
        fetch("/api/teacher-participations"),
    ]);

    if (!projectsRes.ok) throw new Error("Failed to load project data");
    if (!gatewayRes.ok) throw new Error("Failed to load gateway schools");
    if (!schoolRes.ok)
        throw new Error("Failed to load school participation data");
    if (!teacherRes.ok)
        throw new Error("Failed to load teacher participation data");

    const rawProjects: Project[] = await projectsRes.json();
    const gatewaySchools: string[] = (await gatewayRes.json()).map(
        (s: { name: string }) => s.name,
    );
    const rawSchoolParticipations: (SchoolParticipation & {
        gateway: boolean;
    })[] = await schoolRes.json();
    const rawTeacherParticipations: (TeacherParticipation & {
        gateway: boolean;
    })[] = await teacherRes.json();

    const projects = rawProjects.map((p) => ({
        ...p,
        gatewaySchool: gatewaySchools.includes(p.schoolName)
            ? "Gateway"
            : "Non-Gateway",
    }));

    const schoolParticipations = rawSchoolParticipations.map((s) => ({
        ...s,
        gatewaySchool: s.gateway ? "Gateway" : "Non-Gateway",
    }));

    const teacherParticipations = rawTeacherParticipations.map((t) => ({
        ...t,
        gatewaySchool: t.gateway ? "Gateway" : "Non-Gateway",
    }));

    return computeGraphDataset(projects, {
        filters: params.filters,
        yearStart: params.yearStart,
        yearEnd: params.yearEnd,
        schoolParticipations,
        teacherParticipations,
    });
}

async function renderChartToImage(
    params: ChartCartParams,
    dataset: ChartDataset[],
): Promise<string> {
    const yAxisLabel =
        measuredAsLabels[params.filters.measuredAs] || "Total Schools";
    const legendTitle =
        params.filters.groupBy === "none"
            ? undefined
            : groupByLabels[params.filters.groupBy];

    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.top = "-9999px";
    container.style.left = "-9999px";
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

    let dataUrl: string;
    try {
        const canvas = await Promise.race([
            html2canvas(container, {
                backgroundColor: "#fff",
                scale: 2,
                x: 0,
                y: 0,
                width: 800,
                height: 500,
                useCORS: true,
                allowTaint: true,
                onclone: (_doc, el) => {
                    el.style.fontFamily = "sans-serif";
                },
            }),
            new Promise<never>((_, reject) =>
                setTimeout(
                    () => reject(new Error("html2canvas timeout")),
                    5000,
                ),
            ),
        ]);
        dataUrl = canvas.toDataURL();
    } finally {
        root.unmount();
        document.body.removeChild(container);
    }

    return dataUrl;
}

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isExporting, setIsExporting] = useState(false);
    const [isGeneratingPreviews, setIsGeneratingPreviews] = useState(false);
    const isGeneratingPreviewsRef = useRef(false);

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

    const ensureChartPreviews = useCallback(async () => {
        if (isGeneratingPreviewsRef.current) return;

        const chartIndexes = items
            .map((item, index) => ({ item, index }))
            .filter(
                ({ item }) =>
                    item.type === "chart" && item.previewDataUrl === null,
            );

        if (chartIndexes.length === 0) return;

        isGeneratingPreviewsRef.current = true;
        setIsGeneratingPreviews(true);

        try {
            const generated = await Promise.all(
                chartIndexes.map(async ({ item, index }) => {
                    if (item.type !== "chart") return null;
                    const dataset = await fetchAndComputeDataset(item.params);
                    const previewDataUrl = await renderChartToImage(
                        item.params,
                        dataset,
                    );
                    return { index, previewDataUrl };
                }),
            );

            const generatedByIndex = new Map(
                generated
                    .filter(
                        (v): v is { index: number; previewDataUrl: string } =>
                            v !== null,
                    )
                    .map(({ index, previewDataUrl }) => [
                        index,
                        previewDataUrl,
                    ]),
            );

            if (generatedByIndex.size > 0) {
                setItems((prev) =>
                    prev.map((item, index) => {
                        if (
                            item.type !== "chart" ||
                            item.previewDataUrl !== null ||
                            !generatedByIndex.has(index)
                        )
                            return item;
                        return {
                            ...item,
                            previewDataUrl: generatedByIndex.get(index)!,
                        };
                    }),
                );
            }
        } catch {
            toast.error("Failed to generate one or more chart previews");
        } finally {
            isGeneratingPreviewsRef.current = false;
            setIsGeneratingPreviews(false);
        }
    }, [items]);

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
                        tableData: item.params.tableData,
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
                ensureChartPreviews,
                isExporting,
                isGeneratingPreviews,
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
