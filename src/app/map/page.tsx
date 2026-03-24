"use client";
/***************************************************************
 *
 * src/app/heat-map/page.tsx
 *
 * Author: Anne, Chiara & Elki, Steven, Will
 * Last updated: 2/14/26
 *
 * Summary: Heatmap + Clusters within MA region
 *
 **************************************************************/

import { Map } from "@/components/ui/map";
import { Suspense, useEffect, useState, useRef, useMemo } from "react";
import { toast } from "sonner";
import { Loader2, Link, Share } from "lucide-react";

// queryStates required for URL sharing with nuqs
import {
    useQueryState,
    parseAsInteger,
    parseAsString,
    parseAsBoolean,
} from "nuqs";

const VALID_METRICS = ["Students", "Projects", "Teachers"];

import "maplibre-gl/dist/maplibre-gl.css";

import YearDropdown from "@/components/YearDropdown";
import CountDropdown from "@/components/CountDropdown";
import { Button } from "@/components/ui/button";
import { exportMapToPDF } from "@/lib/heatmap-export";
import { useHeatmapLayers } from "@/hooks/useHeatmapLayers";
import { Cart } from "@/components/Cart";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import { addToCart } from "@/lib/export-to-pdf";
import { PlusCircle } from "lucide-react";

type Region = {
    center: [number, number];
    zoom: number;
    // Restrict zoom to stay on MA approximately
    maxZoom: number;
    minZoom: number;
};

const regions: Record<string, Region> = {
    Default: {
        center: [-71.7, 42.2],
        zoom: 7,
        maxZoom: 24,
        minZoom: 7,
    },
    Western: {
        center: [-73.2, 42.3],
        zoom: 8,
        maxZoom: 24,
        minZoom: 7,
    },

    Central: {
        center: [-72.0, 42.3],
        zoom: 8,
        maxZoom: 24,
        minZoom: 7,
    },

    Boston: {
        center: [-71.1, 42.35],
        zoom: 9,
        maxZoom: 24,
        minZoom: 8,
    },

    Northeast: {
        center: [-70.9, 42.6],
        zoom: 9,
        maxZoom: 24,
        minZoom: 8,
    },

    Southeast1: {
        center: [-70.9, 42.0],
        zoom: 9,
        maxZoom: 24,
        minZoom: 8,
    },

    Southeast2: {
        center: [-70.2, 41.75],
        zoom: 9,
        maxZoom: 24,
        minZoom: 8,
    },

    Southeast3: {
        center: [-71.0, 41.7],
        zoom: 9,
        maxZoom: 24,
        minZoom: 8,
    },
};

function HeatMapPage() {
    const [schoolPoints, setSchoolPoints] =
        useState<GeoJSON.FeatureCollection | null>(null);

    // Controlled by dropdowns, parameterized for link sharing
    // Year dropdown, set to range of our data
    const [rawYear, setYear] = useQueryState(
        "year",
        parseAsInteger.withDefault(2025),
    );

    // totalStudents | totalProjects |totalTeachers
    const [rawMetric, setMetric] = useQueryState(
        "metric",
        parseAsString.withDefault("Projects"),
    );

    // gateway school toggle variable
    const [onlyGatewaySchools, setOnlyGatewaySchools] = useQueryState(
        "onlyGatewaySchools",
        parseAsBoolean.withDefault(false),
    );

    const [regionName, setRegionName] = useState<string>("Default");

    // Validate query params during render
    const currentYear = new Date().getFullYear();
    const year = rawYear > currentYear || rawYear < 1990 ? 2025 : rawYear;
    const metric = VALID_METRICS.includes(rawMetric) ? rawMetric : "Projects";

    // Reference to the map, needed for updating the heat layer
    const mapRef = useRef<import("maplibre-gl").Map | null>(null);

    // Boolean to hide/show schools
    const [showSchools, setShowSchools] = useState(true);

    // Loading state
    const [isLoaded, setIsLoaded] = useState(false);

    const copyURLtoClipboard = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            toast.success("URL copied to clipboard!");
        } catch {
            toast.error("Failed to copy URL to clipboard.");
        }
    };

    const [gatewaySchools, setGatewaySchools] = useState<string[]>([]);

    // Fetch gateway schools
    useEffect(() => {
        fetch("/api/schools?gateway=true&list=true")
            .then((res) => res.json())
            .then((data) => {
                const schoolNames: string[] = data.map(
                    (school: { name: string }) => school.name,
                );

                setGatewaySchools(schoolNames);
            })
            .catch(() => toast.error("Failed to load gateway schools"));
    }, []);

    // Fetch school point data for heat layer
    useEffect(() => {
        const controller = new AbortController();
        setIsLoaded(false);
        fetch(`/api/heat-layer?year=${year}`, { signal: controller.signal })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch school data`);
                }
                return response.json();
            })
            .then((data) => {
                setSchoolPoints(data);
                setIsLoaded(true);
            })
            .catch((error) => {
                if (error.name === "AbortError") return;
                toast.error(error.message || "Failed to load school data");
                setIsLoaded(true);
            });
        return () => controller.abort();
    }, [year]);

    // Filter school points based on the gateway toggle
    const filteredSchoolPoints = useMemo(() => {
        if (!schoolPoints) return null;
        if (!onlyGatewaySchools) return schoolPoints;

        return {
            ...schoolPoints,
            features: schoolPoints.features.filter((feature) =>
                gatewaySchools.includes(feature.properties?.name),
            ),
        };
    }, [schoolPoints, onlyGatewaySchools]);

    useHeatmapLayers({ mapRef, filteredSchoolPoints, metric, showSchools });

    const [cart, setCart] = useState<string[]>([]);

    const [filterNames, setFilterNames] = useState<string[]>([]);

    const htmlMapRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const cartStorage = sessionStorage.getItem("cartStorage");
        const cartNameStorage = sessionStorage.getItem("cartNameStorage");

        if (cartStorage) {
            setCart(JSON.parse(cartStorage));
        }

        if (cartNameStorage) {
            setFilterNames(JSON.parse(cartNameStorage));
        }
    }, []);

    // Update cart in session storage when user changes cart
    useEffect(() => {
        if (cart.length != 0) {
            sessionStorage.setItem("cartStorage", JSON.stringify(cart));
        }
    }, [cart]);

    // Update cart names when use changes the filters
    useEffect(() => {
        if (filterNames.length != 0) {
            sessionStorage.setItem(
                "cartNameStorage",
                JSON.stringify(filterNames),
            );
        }
    }, [filterNames]);

    const filterName = `Heatmap - ${metric} (${year})${onlyGatewaySchools ? " - Gateway Only" : ""}`;

    return (
        <div className="flex p-4 flex-col h-screen w-full justify-center">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl py-4 font-semibold">Heatmap</h1>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => {
                            const mapCurrent = mapRef.current;
                            if (!mapCurrent) return;
                            // Call the heatmap export function
                            exportMapToPDF(mapCurrent);
                        }}
                    >
                        <Share className="w-4 h-4" />
                        Export
                    </Button>
                    <HoverCard>
                        <HoverCardTrigger
                            delay={10}
                            closeDelay={100}
                            render={
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-2"
                                    onClick={() =>
                                        addToCart(
                                            htmlMapRef,
                                            cart,
                                            setCart,
                                            filterNames,
                                            setFilterNames,
                                            filterName,
                                        )
                                    }
                                >
                                    <PlusCircle className="w-4 h-4" />
                                    Add to
                                </Button>
                            }
                        />
                        <HoverCardContent
                            className="flex flex-col gap-0.5 mt-2"
                            align="end"
                        >
                            <Cart
                                filterNames={filterNames}
                                cart={cart}
                                setCart={setCart}
                                setFilterNames={setFilterNames}
                            />
                        </HoverCardContent>
                    </HoverCard>
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={copyURLtoClipboard}
                    >
                        <Link className="w-4 h-4" />
                        Share
                    </Button>
                </div>
            </div>
            <div className="flex flex-row justify-between items-end gap-4 shrink-0 pb-5">
                <div className="flex flex-row items-center gap-4">
                    <div className="flex flex-col gap-1.5 w-48">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">
                            Counts
                        </label>
                        <CountDropdown
                            selectedCount={metric}
                            onCountChange={setMetric}
                            options={["Students", "Projects", "Teachers"]}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5 w-48">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">
                            Year
                        </label>
                        <YearDropdown
                            showDataIndicator={true}
                            selectedYear={year}
                            onYearChange={setYear}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5 w-48">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">
                            Counts
                        </label>
                        <CountDropdown
                            selectedCount={regionName}
                            onCountChange={setRegionName}
                            options={Object.keys(regions)}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5 w-48">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">
                            Filters
                        </label>
                        <div className="flex items-center h-10 px-2">
                            <input
                                id="gateway-toggle"
                                type="checkbox"
                                className="w-4 h-4 cursor-pointer rounded border-slate-300"
                                checked={onlyGatewaySchools}
                                onChange={(e) =>
                                    setOnlyGatewaySchools(e.target.checked)
                                }
                            />
                            <label
                                htmlFor="gateway-toggle"
                                className="ml-2 text-sm cursor-pointer select-none"
                            >
                                Gateway Schools Only
                            </label>
                        </div>
                    </div>
                </div>

                <Button
                    onClick={() => setShowSchools(!showSchools)}
                    className="w-32 py-2"
                >
                    {showSchools ? "Hide Schools" : "Show Schools"}
                </Button>
            </div>
            <div className="flex-1 rounded-2xl overflow-hidden border border-slate-200 relative">
                <Map
                    center={regions[regionName].center}
                    zoom={regions[regionName].zoom}
                    // Restrict zoom to stay on MA approximately
                    maxZoom={regions[regionName].maxZoom}
                    minZoom={regions[regionName].minZoom}
                    // Restrict canvas to stay on MA approximately
                    maxBounds={[
                        [-74.5, 40.2],
                        [-68.9, 43.9],
                    ]}
                    // Allows layers to be added
                    ref={mapRef}
                />
                {!isLoaded && (
                    // Gray overlay + loading wheel
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-500/20 backdrop-blur-sm">
                        <Loader2 className="h-12 w-12 animate-spin text-slate-800" />
                    </div>
                )}
            </div>
        </div>
    );
}

export default function MapPage() {
    return (
        <Suspense>
            <HeatMapPage />
        </Suspense>
    );
}
