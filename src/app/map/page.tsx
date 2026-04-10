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
import { LoadError } from "@/components/ui/load-error";

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
import { PlusCircle } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
        center: [-72.75, 42.35],
        zoom: 8.3,
        maxZoom: 24,
        minZoom: 7,
    },

    Central: {
        center: [-71.8, 42.35],
        zoom: 8.5,
        maxZoom: 24,
        minZoom: 7,
    },

    Boston: {
        center: [-71.06, 42.33],
        zoom: 10,
        maxZoom: 24,
        minZoom: 8,
    },

    Northeast: {
        center: [-71.2053, 42.4973],
        zoom: 8.6,
        maxZoom: 24,
        minZoom: 8,
    },

    Southeast: {
        center: [-70.7313, 41.7842],
        zoom: 8,
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

    const [regionView, setregionView] = useQueryState(
        "regionView",
        parseAsString.withDefault("Default"),
    );

    const [showSchools, setShowSchools] = useQueryState(
        "showSchools",
        parseAsBoolean.withDefault(true),
    );

    // Validate query params during render
    const currentYear = new Date().getFullYear();
    const year = rawYear > currentYear || rawYear < 1990 ? 2025 : rawYear;
    const metric = VALID_METRICS.includes(rawMetric) ? rawMetric : "Projects";

    // Reference to the map, needed for updating the heat layer
    const mapRef = useRef<import("maplibre-gl").Map | null>(null);

    // Loading state
    const [isLoaded, setIsLoaded] = useState(false);
    const [schoolDataError, setSchoolDataError] = useState<string | null>(null);

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
            });
    }, []);

    // Fetch school point data for heat layer
    const fetchSchoolData = () => {
        setIsLoaded(false);
        setSchoolDataError(null);
        fetch(`/api/heat-layer?year=${year}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Failed to load school data`);
                }
                return response.json();
            })
            .then((data) => {
                setSchoolPoints(data);
                setSchoolDataError(null);
                setIsLoaded(true);
            })
            .catch((error) => {
                setSchoolDataError(
                    error.message || "Failed to load school data",
                );
                setIsLoaded(true);
            });
    };

    useEffect(() => {
        fetchSchoolData();
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

    // Close popup whenever any setting changes
    const { closePopup } = useHeatmapLayers({
        mapRef,
        filteredSchoolPoints,
        metric,
        showSchools,
    });

    useEffect(() => {
        closePopup?.();
    }, [metric, year, regionView, onlyGatewaySchools, showSchools, closePopup]);

    useEffect(() => {
        if (!mapRef.current) {
            return;
        }
        const map = mapRef.current;
        map?.flyTo({
            center: regions[regionView].center,
            zoom: regions[regionView].zoom,
            essential: true,
        });
    }, [regionView]);

    const [cart, setCart] = useState<string[]>([]);

    const [filterNames, setFilterNames] = useState<string[]>([]);

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
        if (cart.length !== 0) {
            sessionStorage.setItem("cartStorage", JSON.stringify(cart));
        } else {
            sessionStorage.removeItem("cartStorage");
        }
    }, [cart]);

    // Update cart names when use changes the filters
    useEffect(() => {
        if (filterNames.length !== 0) {
            sessionStorage.setItem(
                "cartNameStorage",
                JSON.stringify(filterNames),
            );
        } else {
            sessionStorage.removeItem("cartNameStorage");
        }
    }, [filterNames]);

    const filterName = `Heatmap - ${metric} ${onlyGatewaySchools ? " for Schools Representing Gateway Cities" : ""} in ${regionView === "Default" ? "MA" : regionView + ` Region `} (${year})`;

    return (
        <div className="flex p-8 flex-col h-screen w-full justify-center">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl py-4 font-semibold">{filterName}</h1>
                <div className="flex gap-3">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <Share className="w-4 h-4" />
                                Export
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Export map to PDF?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will download a PDF of the current
                                    heatmap to your computer.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => {
                                        const mapCurrent = mapRef.current;
                                        if (!mapCurrent) return;
                                        exportMapToPDF(mapCurrent, filterName);
                                    }}
                                >
                                    Download
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <HoverCard>
                        <HoverCardTrigger
                            delay={10}
                            closeDelay={100}
                            render={
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-2"
                                    onClick={() => {
                                        const map = mapRef.current;
                                        if (!map) return;
                                        const mapImageData = map
                                            .getCanvas()
                                            .toDataURL("image/jpeg", 0.5);
                                        setCart([...cart, mapImageData]);
                                        setFilterNames([
                                            ...filterNames,
                                            filterName,
                                        ]);
                                    }}
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
                            Region View
                        </label>
                        <CountDropdown
                            selectedCount={regionView}
                            onCountChange={setregionView}
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
                {schoolDataError ? (
                    <LoadError
                        message={schoolDataError}
                        onRetry={fetchSchoolData}
                        className="h-full"
                    />
                ) : (
                    <>
                        <Map
                            center={regions[regionView].center}
                            zoom={regions[regionView].zoom}
                            // Restrict zoom to stay on MA approximately
                            maxZoom={regions[regionView].maxZoom}
                            minZoom={regions[regionView].minZoom}
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
                    </>
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
