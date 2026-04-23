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
"use client";

import { Map } from "@/components/ui/map";
import { Suspense, useEffect, useState, useRef, useMemo } from "react";
import { toast } from "sonner";
import {
    Loader2,
    Link,
    Share,
    Check,
    CheckCircle2,
    ShoppingBasket,
    ListFilter,
} from "lucide-react";
import { LoadError } from "@/components/ui/load-error";
import { capitalize } from "@/lib/utils";

// queryStates required for URL sharing with nuqs
import {
    useQueryState,
    parseAsInteger,
    parseAsString,
    parseAsBoolean,
} from "nuqs";

const VALID_METRICS = ["competing", "participating", "projects", "teachers"];

import "maplibre-gl/dist/maplibre-gl.css";

import YearDropdown from "@/components/YearDropdown";
import CountDropdown from "@/components/CountDropdown";
import { Checkbox } from "@/components/Checkbox";
import { Button } from "@/components/ui/button";
import { AnimatedToggleButton } from "@/components/ui/animated-toggle-button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { exportMapToPDF } from "@/lib/heatmap-export";
import { useHotkey } from "@/hooks/useHotkey";
import { useHeatmapLayers } from "@/hooks/useHeatmapLayers";
import { Cart } from "@/components/Cart";
import { CartIndicator } from "@/components/ui/cart-indicator";
import { PlusCircle } from "lucide-react";
import { useCart } from "@/hooks/useCart";
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
import HeatmapLegend from "@/components/HeatmapLegend";
import type { FilterDetail } from "@/lib/export-to-pdf";

type Region = {
    center: [number, number];
    zoom: number;
    // Restrict zoom to stay on MA approximately
    maxZoom: number;
    minZoom: number;
};

const regions: Record<string, Region> = {
    default: {
        center: [-71.7, 42.2],
        zoom: 7,
        maxZoom: 24,
        minZoom: 7,
    },
    western: {
        center: [-72.75, 42.35],
        zoom: 8.3,
        maxZoom: 24,
        minZoom: 7,
    },
    central: {
        center: [-71.8, 42.35],
        zoom: 8.5,
        maxZoom: 24,
        minZoom: 7,
    },
    boston: {
        center: [-71.06, 42.33],
        zoom: 10,
        maxZoom: 24,
        minZoom: 8,
    },
    northeast: {
        center: [-71.2053, 42.4973],
        zoom: 8.6,
        maxZoom: 24,
        minZoom: 8,
    },
    southeast: {
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
    // Year dropdown — null default lets YearDropdown pick the most recent year with data
    const [rawYear, setYear] = useQueryState("year", parseAsInteger);

    // totalStudents | totalProjects | totalTeachers (lowercase in URL)
    const [rawMetric, setRawMetric] = useQueryState(
        "metric",
        parseAsString
            .withDefault("projects")
            .withOptions({ clearOnDefault: false }),
    );

    // gateway school toggle variable
    const [onlyGatewaySchools, setOnlyGatewaySchools] = useQueryState(
        "onlyGatewaySchools",
        parseAsBoolean.withDefault(false),
    );

    const [rawRegionView, setRegionView] = useQueryState(
        "regionView",
        parseAsString
            .withDefault("default")
            .withOptions({ clearOnDefault: false }),
    );
    const regionView = rawRegionView.toLowerCase();

    const [showSchools, setShowSchools] = useQueryState(
        "showSchools",
        parseAsBoolean.withDefault(true),
    );

    const [showHeatmap, setShowHeatmap] = useQueryState(
        "showHeatmap",
        parseAsBoolean.withDefault(true),
    );

    const [showRegions, setShowRegions] = useQueryState(
        "showRegions",
        parseAsBoolean.withDefault(true),
    );

    // Validate query params during render
    const currentYear = new Date().getFullYear();
    const year =
        rawYear !== null && rawYear >= 1990 && rawYear <= currentYear
            ? rawYear
            : null;
    const metric = capitalize(
        VALID_METRICS.includes(rawMetric.toLowerCase())
            ? rawMetric.toLowerCase()
            : "projects",
    );

    /** Wrapper so CountDropdown can set lowercase metric in URL */
    const setMetric = (value: string) => setRawMetric(value.toLowerCase());

    // Reference to the map, needed for updating the heat layer
    const mapRef = useRef<import("maplibre-gl").Map | null>(null);

    // Loading state
    const [isLoaded, setIsLoaded] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const [exportDialogOpen, setExportDialogOpen] = useState(false);
    const [schoolDataError, setSchoolDataError] = useState<string | null>(null);

    const copyURLtoClipboard = async () => {
        await navigator.clipboard.writeText(window.location.href);
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
        if (year === null) return;
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
        year,
        showSchools,
        showHeatmap,
        showRegions,
    });

    useEffect(() => {
        closePopup?.();
    }, [
        metric,
        year,
        regionView,
        onlyGatewaySchools,
        showSchools,
        showHeatmap,
        showRegions,
        closePopup,
    ]);

    useEffect(() => {
        if (!mapRef.current) {
            return;
        }
        const region = regions[regionView] ?? regions.default;
        const map = mapRef.current;
        map?.flyTo({
            center: region.center,
            zoom: region.zoom,
            essential: true,
        });
    }, [regionView]);

    const { items, addMapItem, hasItem, removeByName } = useCart();

    const filterName = year
        ? `Heatmap \u2013 ${metric}${onlyGatewaySchools ? " for Schools Representing Gateway Cities" : ""} in ${regionView === "default" ? "MA" : capitalize(regionView) + " Region"} (${year})`
        : `Heatmap \u2013 ${metric}${onlyGatewaySchools ? " for Schools Representing Gateway Cities" : ""} in ${regionView === "default" ? "MA" : capitalize(regionView) + " Region"}`;

    const mapInCart = hasItem(filterName);

    const currentFilterDetails = useMemo<FilterDetail[]>(
        () => [
            { label: "Metric", values: [metric] },
            { label: "Year", values: [year ? String(year) : "All Years"] },
            {
                label: "Region",
                values: [
                    regionView === "default"
                        ? "All of MA"
                        : `${capitalize(regionView)} Region`,
                ],
            },
            ...(onlyGatewaySchools
                ? [
                      {
                          label: "Gateway Schools",
                          values: ["Only Gateway Schools"],
                      },
                  ]
                : []),
            {
                label: "Layers",
                values: [
                    ...(showSchools ? ["Schools"] : []),
                    ...(showHeatmap ? ["Heatmap"] : []),
                    ...(showRegions ? ["Regions"] : []),
                ].length
                    ? [
                          ...(showSchools ? ["Schools"] : []),
                          ...(showHeatmap ? ["Heatmap"] : []),
                          ...(showRegions ? ["Regions"] : []),
                      ]
                    : ["None"],
            },
        ],
        [
            metric,
            year,
            regionView,
            onlyGatewaySchools,
            showSchools,
            showHeatmap,
            showRegions,
        ],
    );

    // Cmd+S to open export dialog, Cmd+P to print PDF
    useHotkey(
        "s",
        () => {
            if (!exportDialogOpen) setExportDialogOpen(true);
        },
        { meta: true },
    );
    useHotkey(
        "p",
        () => {
            const map = mapRef.current;
            if (!map) return;
            exportMapToPDF(map, filterName, currentFilterDetails, true);
        },
        { meta: true },
    );

    return (
        <div className="flex p-8 flex-col h-screen w-full justify-center">
            <div className="flex justify-between items-center mb-5">
                <h1 className="text-lg xl:text-2xl font-semibold">
                    {filterName}
                </h1>
                {/* Actions - hidden on smaller screens */}
                <div className="hidden xl:flex gap-3">
                    <AlertDialog
                        open={exportDialogOpen}
                        onOpenChange={setExportDialogOpen}
                    >
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
                                        exportMapToPDF(
                                            mapCurrent,
                                            filterName,
                                            currentFilterDetails,
                                        );
                                    }}
                                >
                                    Download
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => {
                            if (mapInCart) {
                                removeByName(filterName);
                            } else {
                                const map = mapRef.current;
                                if (!map) return;
                                const mapImageData = map
                                    .getCanvas()
                                    .toDataURL("image/jpeg", 0.5);
                                addMapItem(
                                    filterName,
                                    mapImageData,
                                    currentFilterDetails,
                                );
                            }
                        }}
                    >
                        {mapInCart ? (
                            <>
                                <CheckCircle2 className="w-4 h-4" />
                                Remove
                            </>
                        ) : (
                            <>
                                <PlusCircle className="w-4 h-4" />
                                Add to cart
                            </>
                        )}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 relative"
                        onClick={() => setCartOpen(true)}
                    >
                        <ShoppingBasket className="w-4 h-4" />
                        Cart
                        <CartIndicator
                            count={items.length}
                            className="absolute -top-2 -right-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground"
                        />
                    </Button>
                    <AnimatedToggleButton
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={copyURLtoClipboard}
                        defaultContent={
                            <>
                                <Link className="w-4 h-4" />
                                Copy link
                            </>
                        }
                        activeContent={
                            <>
                                <Check className="w-4 h-4" />
                                Copy link
                            </>
                        }
                    />
                </div>

                {/* Share popover - visible on smaller screens */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="xl:hidden flex items-center gap-2"
                        >
                            <Share className="w-4 h-4" />
                            Share
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56" align="end">
                        <div className="flex flex-col gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="justify-start"
                                onClick={async () => {
                                    const mapCurrent = mapRef.current;
                                    if (!mapCurrent) return;
                                    const exported = await exportMapToPDF(
                                        mapCurrent,
                                        filterName,
                                        currentFilterDetails,
                                    );
                                    if (exported) {
                                        toast.success(
                                            "Map exported successfully!",
                                        );
                                    }
                                }}
                            >
                                <Share className="w-4 h-4 mr-2" />
                                Export to PDF
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="justify-start"
                                onClick={() => {
                                    if (mapInCart) {
                                        removeByName(filterName);
                                    } else {
                                        const map = mapRef.current;
                                        if (!map) return;
                                        const mapImageData = map
                                            .getCanvas()
                                            .toDataURL("image/jpeg", 0.5);
                                        addMapItem(
                                            filterName,
                                            mapImageData,
                                            currentFilterDetails,
                                        );
                                    }
                                }}
                            >
                                {mapInCart ? (
                                    <>
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        Remove from cart
                                    </>
                                ) : (
                                    <>
                                        <PlusCircle className="w-4 h-4 mr-2" />
                                        Add to cart
                                    </>
                                )}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="justify-start relative"
                                onClick={() => setCartOpen(true)}
                            >
                                <ShoppingBasket className="w-4 h-4 mr-2" />
                                View cart
                                <CartIndicator
                                    count={items.length}
                                    className="ml-auto inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground"
                                />
                            </Button>
                            <AnimatedToggleButton
                                variant="ghost"
                                size="sm"
                                className="justify-start"
                                onClick={copyURLtoClipboard}
                                defaultContent={
                                    <>
                                        <Link className="w-4 h-4 mr-2" />
                                        Copy link
                                    </>
                                }
                                activeContent={
                                    <>
                                        <Check className="w-4 h-4 mr-2" />
                                        Copy link
                                    </>
                                }
                            />
                        </div>
                    </PopoverContent>
                </Popover>

                <Sheet open={cartOpen} onOpenChange={setCartOpen}>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Cart</SheetTitle>
                        </SheetHeader>
                        <Cart />
                    </SheetContent>
                </Sheet>
            </div>
            <div className="flex flex-row flex-wrap shrink-0 pb-5 gap-1 items-end">
                <div className="flex flex-col gap-1.5 w-48">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">
                        Counts
                    </label>
                    <CountDropdown
                        selectedCount={metric}
                        onCountChange={setMetric}
                        options={VALID_METRICS.map(capitalize)}
                    />
                </div>
                <div className="flex flex-col gap-1.5 w-48">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">
                        Year
                    </label>
                    <YearDropdown
                        selectedYear={year}
                        onYearChange={(y) => setYear(y)}
                        enableArrowHotkeys={true}
                        showDataIndicator={true}
                    />
                </div>
                <div className="flex flex-col gap-1.5 w-48">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">
                        Region View
                    </label>
                    <CountDropdown
                        selectedCount={capitalize(regionView)}
                        onCountChange={(v) => setRegionView(v.toLowerCase())}
                        options={Object.keys(regions).map(capitalize)}
                    />
                </div>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="gap-2">
                            <ListFilter className="w-4 h-4" />
                            Filters
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56" align="start">
                        <div className="flex flex-col gap-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <Checkbox
                                    checked={showSchools}
                                    onCheckedChange={(v) =>
                                        setShowSchools(v === true)
                                    }
                                />
                                <span className="text-sm">Show Schools</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <Checkbox
                                    checked={showHeatmap}
                                    onCheckedChange={(v) =>
                                        setShowHeatmap(v === true)
                                    }
                                />
                                <span className="text-sm">Show Heatmap</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <Checkbox
                                    checked={showRegions}
                                    onCheckedChange={(v) =>
                                        setShowRegions(v === true)
                                    }
                                />
                                <span className="text-sm">Show Regions</span>
                            </label>
                            <hr className="border-slate-200" />
                            <label className="flex items-center gap-2 cursor-pointer">
                                <Checkbox
                                    checked={onlyGatewaySchools}
                                    onCheckedChange={(v) =>
                                        setOnlyGatewaySchools(v === true)
                                    }
                                />
                                <span className="text-sm">
                                    Gateway Schools Only
                                </span>
                            </label>
                        </div>
                    </PopoverContent>
                </Popover>
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
                            center={
                                (regions[regionView] ?? regions.default).center
                            }
                            zoom={(regions[regionView] ?? regions.default).zoom}
                            // Restrict zoom to stay on MA approximately
                            maxZoom={
                                (regions[regionView] ?? regions.default).maxZoom
                            }
                            minZoom={
                                (regions[regionView] ?? regions.default).minZoom
                            }
                            // Restrict canvas to stay on MA approximately
                            maxBounds={[
                                [-74.5, 40.2],
                                [-68.9, 43.9],
                            ]}
                            // Allows layers to be added
                            ref={mapRef}
                        />
                        {showHeatmap && isLoaded && (
                            <div className="absolute bottom-4 left-4 z-10 bg-white/80 backdrop-blur-md rounded-lg px-3 py-2 shadow-sm border border-slate-200">
                                <HeatmapLegend
                                    colors={[
                                        "rgba(255,255,204,0)",
                                        "rgb(255,237,160)",
                                        "rgb(254,178,76)",
                                        "rgb(253,141,60)",
                                        "rgb(227,74,51)",
                                        "rgb(175,39,47)",
                                    ]}
                                    startLabel="Low"
                                    endLabel="High"
                                />
                            </div>
                        )}
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
