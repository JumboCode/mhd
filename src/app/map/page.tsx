"use client";
/***************************************************************
 *
 * src/app/heat-map/page.tsx
 *
 * Author: Anne, Chiara & Elki, Steven
 * Last updated: 2/14/26
 *
 * Summary: Heatmap + Clusters within MA region
 *
 **************************************************************/

import { Map } from "@/components/ui/map";
import { Suspense, useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { Loader2, Link, Share } from "lucide-react";

// queryStates required for URL sharing with nuqs
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";

const VALID_METRICS = ["Students", "Projects", "Teachers"];

import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import regionsData from "@/data/regions.json";
import YearDropdown from "@/components/YearDropdown";
import CountDropdown from "@/components/CountDropdown";
import { Button } from "@/components/ui/button";
import { exportMapToPDF } from "@/lib/heatmap-export";

const regions = Object.values(regionsData).map((region) => ({
    name: region.name,
    coordinates: region.coordinates as [number, number][],
    color: "#af272f", // MHD red
}));

function HeatMapPage() {
    const [schoolPoints, setSchoolPoints] =
        useState<GeoJSON.FeatureCollection | null>(null);

    // Controlled by dropdowns, parameterized for link sharing
    // Year dropdown, set to range of our data
    const [year, setYear] = useQueryState("year", parseAsInteger);

    // totalStudents | totalProjects |totalTeachers
    const [metric, setMetric] = useQueryState(
        "metric",
        parseAsString.withDefault("Projects"),
    );

    // Reset invalid query params - set to null so YearDropdown defaults to latest year with data
    useEffect(() => {
        const currentYear = new Date().getFullYear();
        if (year !== null && (year > currentYear || year < 1990)) setYear(null);
    }, [year]);

    useEffect(() => {
        if (!VALID_METRICS.includes(metric)) setMetric("Projects");
    }, []);

    // Reference to the map, needed for updating the heat layer
    const mapRef = useRef<import("maplibre-gl").Map | null>(null);

    const popupRef = useRef<maplibregl.Popup | null>(null); // stores the popup instance
    const pinnedRef = useRef(false); // tracks if tooltip is pinned

    // Boolean to hide/show schools
    const [showSchools, setShowSchools] = useState(true);

    // Loading state
    const [isLoaded, setIsLoaded] = useState(false);

    const handleClick = () => {
        setShowSchools(!showSchools);
    };

    const copyURLtoClipboard = async () => {
        try {
            const url = window.location.href;
            await navigator.clipboard.writeText(url);
            toast.success("URL copied to clipboard!");
        } catch (error) {
            toast.error("Failed to copy URL to clipboard.");
        }
    };

    // Fetch school point data for heat layer
    useEffect(() => {
        if (year === null) return;
        setIsLoaded(false);
        fetch(`/api/heat-layer?year=${year}`)
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
                toast.error(error.message || "Failed to load school data");
                setIsLoaded(true);
            });
    }, [year]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                popupRef.current?.remove();
                pinnedRef.current = false;
            }
        };
        document.addEventListener("keydown", handleEscape);

        return () => document.removeEventListener("keydown", handleEscape);
    }, []);

    useEffect(() => {
        // Get reference to map, from reference get actual map
        const map = mapRef.current;
        if (!map) return;

        if (!popupRef.current) {
            popupRef.current = new maplibregl.Popup({
                closeButton: false,
                closeOnClick: false,
                className: "school-hover-popup",
                offset: 10,
            });
        }

        // Heat layer, retrieve source from fetch data on page load
        const updateHeatLayer = () => {
            // Draw routes for counties (must be inside style loaded check)
            if (!map.getSource("counties-source")) {
                map.addSource("counties-source", {
                    type: "geojson",
                    data: {
                        type: "FeatureCollection",
                        features: regions.map((c) => ({
                            type: "Feature",
                            geometry: {
                                type: "LineString",
                                coordinates: c.coordinates,
                            },
                            properties: {},
                        })),
                    },
                });
                map.addLayer({
                    id: "regions-layer",
                    type: "line",
                    source: "regions-source",
                    paint: {
                        "line-color": "#FF0000",
                        "line-width": 4,
                        "line-opacity": 0.5,
                    },
                });
            }
            // Filter to only include schools with data for the selected metric
            const allFeatures = schoolPoints?.features || [];
            const filteredFeatures = allFeatures.filter(
                (f: GeoJSON.Feature) => (f.properties?.[metric] || 0) > 0,
            );
            const filteredData = {
                ...schoolPoints,
                features: filteredFeatures,
            } as GeoJSON.FeatureCollection;

            // Calculate maximum for weight based on the max by metric
            const values = filteredFeatures.map(
                (f: GeoJSON.Feature) => f.properties?.[metric] || 0,
            );
            const maxValue = Math.max(...values, 1);

            // The minimum intensity expressed is 0, and the school with
            // the maximum for the given metric has maximum intensity
            const weightExpression: maplibregl.ExpressionSpecification = [
                "interpolate",
                ["linear"],
                ["get", metric],
                0,
                0,
                maxValue,
                1,
            ];

            // Store each coordinate pair as a single point in schoolPoints
            if (map.getSource("schoolSource")) {
                (
                    map.getSource("schoolSource") as maplibregl.GeoJSONSource
                ).setData(filteredData);
            } else {
                map.addSource("schoolSource", {
                    type: "geojson",
                    data: filteredData,
                });
            }

            // Add the heat layer
            if (map.getLayer("schoolHeatLayer")) {
                map.setPaintProperty(
                    "schoolHeatLayer",
                    "heatmap-weight",
                    weightExpression,
                );
            } else {
                map.addLayer({
                    id: "schoolHeatLayer",
                    type: "heatmap",
                    source: "schoolSource",
                    maxzoom: 24,
                    paint: {
                        // Weight based on selected metric
                        "heatmap-weight": weightExpression,
                        // Intensity increases with zoom
                        "heatmap-intensity": [
                            "interpolate",
                            ["linear"],
                            ["zoom"],
                            0,
                            1,
                            50,
                            3,
                        ],
                        // Blue color ramp
                        "heatmap-color": [
                            "interpolate",
                            ["linear"],
                            ["heatmap-density"],
                            0,
                            "rgba(33,102,172,0)",
                            0.2,
                            "rgb(103,169,207)",
                            0.4,
                            "rgb(209,229,240)",
                            0.6,
                            "rgb(253,219,199)",
                            0.8,
                            "rgb(239,138,98)",
                            1,
                            "rgb(178,24,43)",
                        ],
                        // Radius increases with zoom
                        "heatmap-radius": [
                            "interpolate",
                            ["linear"],
                            ["zoom"],
                            0,
                            40,
                            9,
                            50,
                        ],
                    },
                });
            }

            // School icon points
            const addSchoolIcons = () => {
                if (!map.getLayer("school-icons")) {
                    map.addLayer({
                        id: "school-icons",
                        type: "symbol",
                        source: "schoolSource",
                        layout: {
                            "icon-image": "school-icon",
                            "icon-size": 1,
                            "icon-allow-overlap": true,
                        },
                    });
                }
            };

            if (map.hasImage("school-icon")) {
                addSchoolIcons();
            } else {
                const img = new Image(26, 26);
                img.onload = () => {
                    if (!map.hasImage("school-icon")) {
                        map.addImage("school-icon", img);
                    }
                    addSchoolIcons();
                };
                img.src = "/images/school-heatmap-icon.svg";
            }

            // Fixed ordering for layers
            if (map.getLayer("regions-layer")) map.moveLayer("regions-layer");
            if (map.getLayer("schoolHeatLayer"))
                map.moveLayer("schoolHeatLayer");
            if (map.getLayer("school-icons")) map.moveLayer("school-icons");

            // Renders the tooltip popup and handles hover/click logic for
            // tooltips to persist/disappear
            const renderPopup = (feature: GeoJSON.Feature) => {
                const geometry = feature.geometry as GeoJSON.Point;
                const coordinates = geometry.coordinates.slice() as [
                    number,
                    number,
                ];
                const { name } = feature.properties || {};
                const value = feature.properties?.[metric] || 0;
                const schoolSlug =
                    name?.toLowerCase().replace(/\s+/g, "-") || "";
                const profileUrl = `/schools/${schoolSlug}`;

                const html = `
                    <div style="
                        background: white;
                        padding: 16px;
                        min-width: 140px;
                        border-radius: 6px;
                        border: 1px solid white;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                        font-family: 'DM Sans', sans-serif;
                        animation: fadeIn 0.2s ease-out forwards;
                    ">
                        <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: #111;">${name}</h3>
                        <p style="margin: 8px 0 0 0; font-size: 16px; color: #333; font-weight: 500;">
                            ${value.toLocaleString()} ${metric.toLowerCase()}
                        </p>
                        <a href="${profileUrl}" style="color: #af272f; text-decoration: underline;">View Profile</a>
                    </div>
                `;

                // Place popup right above the point
                popupRef
                    .current!.setLngLat(coordinates)
                    .setHTML(html)
                    .addTo(map);

                const el = popupRef.current!.getElement();
                if (el) {
                    const content = el.querySelector(
                        ".maplibregl-popup-content",
                    ) as HTMLElement;
                    const tip = el.querySelector(
                        ".maplibregl-popup-tip",
                    ) as HTMLElement;
                    if (content) {
                        content.style.background = "transparent";
                        content.style.boxShadow = "none";
                        content.style.padding = "0";
                    }
                    if (tip) tip.style.display = "none";
                }
            };

            // Tooltips displaying information on hover
            // Only when schools are shown, does not appear otherwise
            const onMouseEnter = (
                e: maplibregl.MapMouseEvent & {
                    features?: maplibregl.MapGeoJSONFeature[];
                },
            ) => {
                map.getCanvas().style.cursor = "pointer";
                if (!pinnedRef.current && e.features && e.features.length)
                    renderPopup(e.features[0]);
            };

            // On hover off, remove popup
            const onMouseLeave = () => {
                map.getCanvas().style.cursor = "";
                if (!pinnedRef.current) popupRef.current?.remove();
            };

            // Handle clicking on the map canvas
            const onMapClick = (e: maplibregl.MapMouseEvent) => {
                // Check if a school pin was clicked
                const features = map.queryRenderedFeatures(e.point, {
                    layers: ["school-icons"],
                });
                if (features.length) {
                    // Click on the pin to pin the tooltip
                    pinnedRef.current = true;
                    renderPopup(features[0]);
                } else {
                    // Clicked somewhere else, close popup
                    pinnedRef.current = false;
                    popupRef.current?.remove();
                }
            };

            // Popup logic only relevant if schools are shown
            if (showSchools) {
                map.on("mouseenter", "school-icons", onMouseEnter);
                map.on("mouseleave", "school-icons", onMouseLeave);
                map.on("click", onMapClick);
            }

            return () => {
                map.off("mouseenter", "school-icons", onMouseEnter);
                map.off("mouseleave", "school-icons", onMouseLeave);
                map.off("click", onMapClick);
            };
        };

        // Force update if map loads properly
        if (map.isStyleLoaded()) updateHeatLayer();
        else map.once("load", updateHeatLayer);

        // Gets rid of schools layer on button click
        if (!showSchools && map.getLayer("school-icons")) {
            map.removeLayer("school-icons");
            popupRef.current?.remove();
            pinnedRef.current = false;
        }
    }, [metric, schoolPoints, showSchools]);

    return (
        <div className="flex p-4 flex-col h-screen w-screen justify-center">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl py-4 font-semibold">Heatmap</h1>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={copyURLtoClipboard}
                    >
                        <Link className="w-4 h-4" />
                        Share
                    </Button>
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
                </div>
                <Button onClick={handleClick} className="w-32 py-2">
                    {showSchools ? "Hide Schools" : "Show Schools"}
                </Button>
            </div>
            <div className="flex-1 rounded-2xl overflow-hidden border border-slate-200 relative">
                <Map
                    center={[-71.7, 42.2]}
                    zoom={7}
                    theme="light"
                    styles={{ light: "/maps/positron.json" }}
                    // Restrict zoom to stay on MA approximately
                    maxZoom={24}
                    minZoom={7}
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
