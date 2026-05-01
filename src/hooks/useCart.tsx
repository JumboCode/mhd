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
import { ChartDataset } from "@/components/charts/chartTypes";
import { renderChartToDataUrl } from "@/lib/render-chart";
import { type FilterDetail, downloadGraphs } from "@/lib/export-to-pdf";

/**
 * Chart items store only the filter params — no data.
 * Data is fetched from the API at export time.
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
 * Fetch projects and gateway schools, then compute the chart dataset.
 * Throws on network/API errors so the caller can handle them.
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
) {
    const yAxisLabel =
        measuredAsLabels[params.filters.measuredAs] || "Total Schools";
    const legendTitle =
        params.filters.groupBy === "none"
            ? undefined
            : groupByLabels[params.filters.groupBy];

    return renderChartToDataUrl(
        params.chartType,
        dataset,
        yAxisLabel,
        legendTitle,
    );
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
                    item.type === "chart" && item.previewDataUrl === undefined,
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
                        (
                            value,
                        ): value is { index: number; previewDataUrl: string } =>
                            value !== null,
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
                            typeof item.previewDataUrl === "string" ||
                            !generatedByIndex.has(index)
                        ) {
                            return item;
                        }
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
                    if (item.previewDataUrl) {
                        imageDataUrls.push(item.previewDataUrl);
                    } else {
                        const dataset = await fetchAndComputeDataset(
                            item.params,
                        );
                        const dataUrl = await renderChartToImage(
                            item.params,
                            dataset,
                        );
                        imageDataUrls.push(dataUrl);
                    }
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
