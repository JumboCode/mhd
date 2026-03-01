"use client";
/***************************************************************
 *
 *                src/app/heat-map/page.tsx
 *
 *         Author: Anne, Chiara & Elki, Steven
 *         Last updated: 2/14/26
 *
 *        Summary: Heatmap + Clusters within MA region
 *
 **************************************************************/

import { Map } from "@/components/ui/map";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { Loader2, Link } from "lucide-react";

// queryStates required for URL sharing with nuqs
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";

import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import regionsData from "@/data/regions.json";
import YearDropdown from "@/components/YearDropdown";
import CountDropdown from "@/components/CountDropdown";
import { Button } from "@/components/ui/button";

const regions = Object.values(regionsData).map((region) => ({
    name: region.name,
    coordinates: region.coordinates as [number, number][],
    color: "#af272f", // MHD red
}));

export default function HeatMapPage() {
    const [schoolPoints, setSchoolPoints] =
        useState<GeoJSON.FeatureCollection | null>(null);

    // Controlled by dropdowns, parameterized for link sharing
    // Year dropdown, set to range of our data
    const [year, setYear] = useQueryState(
        "year",
        parseAsInteger.withDefault(2025),
    );

    // totalStudents | totalProjects |totalTeachers
    const [metric, setMetric] = useQueryState(
        "metric",
        parseAsString.withDefault("Projects"),
    );

    // Reference to the map, needed for updating the heat layer
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapRef = useRef<any>(null);

    const popupRef = useRef<maplibregl.Popup | null>(null); // stores the popup instance
    const pinnedRef = useRef(false); // tracks if tooltip is pinned
    let pinned = false;

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
        const mapCurrent = mapRef.current;
        if (!mapCurrent) return;

        const map = mapCurrent.getMap ? mapCurrent.getMap() : mapCurrent;
        const popup = popupRef.current!;

        // Handler: clicks on the map canvas
        const handleMapClick = (e: MouseEvent) => {
            // Only care if tooltip is pinned
            if (!pinnedRef.current) return;

            // Check if a school pin was clicked
            const features = map.queryRenderedFeatures(
                map.unproject([e.clientX, e.clientY]), // convert click to map coordinates
                { layers: ["school-icons"] }, // your school icon layer
            );

            if (features.length === 0) {
                // Clicked somewhere else, close popup
                popup.remove();
                pinnedRef.current = false;
            }
        };

        // Add listener to MapLibre's canvas container
        map.getCanvasContainer().addEventListener("click", handleMapClick);

        return () => {
            map.getCanvasContainer().removeEventListener(
                "click",
                handleMapClick,
            );
        };
    }, [isLoaded]);

    useEffect(() => {
        // Get reference to map, from reference get actual map
        const mapCurrent = mapRef.current;
        if (!mapCurrent) return;

        const map = mapCurrent?.getMap ? mapCurrent.getMap() : mapCurrent;

        if (!popupRef.current) {
            popupRef.current = new maplibregl.Popup({
                closeButton: false,
                closeOnClick: false,
                className: "school-hover-popup",
                offset: 10,
            });
        }

        // Draw routes for regions
        if (!map.getSource("regions-source")) {
            map.addSource("regions-source", {
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

        // Dropdowns for hovering
        const popup = new maplibregl.Popup({
            closeButton: false,
            closeOnClick: false,
            className: "school-hover-popup",
            offset: 10,
        });

        // Heat layer, retrieve source from fetch data on page load
        const updateHeatLayer = () => {
            // Filter to only include schools with data for the selected metric
            const allFeatures = schoolPoints?.features || [];
            const filteredFeatures = allFeatures.filter(
                (f: GeoJSON.Feature) => (f.properties?.[metric] || 0) > 0,
            );
            const filteredData = {
                ...schoolPoints,
                features: filteredFeatures,
            };

            // Calculate maximum for weight based on the max by metric
            const values = filteredFeatures.map(
                (f: GeoJSON.Feature) => f.properties?.[metric] || 0,
            );
            const maxValue = Math.max(...values, 1);

            // The minimum intensity expressed is 0, and the school with
            // the maximum for the given metric has maximum intensity
            const weightExpression = [
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
                map.getSource("schoolSource").setData(filteredData);
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

            // Tooltips displaying information on hover
            // Only when schools are shown, does not appear otherwise.
            map.on(
                "mouseenter",
                "school-icons",
                (e: maplibregl.MapLayerMouseEvent) => {
                    map.getCanvas().style.cursor = "pointer";

                    const feature = e.features?.[0];
                    if (!feature) return;
                    const coordinates = (
                        feature.geometry as GeoJSON.Point
                    ).coordinates.slice() as [number, number];
                    const { name } = feature.properties;
                    const value = feature.properties[metric] || 0;

                    const schoolSlug = (name as string)
                        .toLowerCase()
                        .replace(/\s+/g, "-");
                    const profileUrl = `/schools/${schoolSlug}`;

                    const html = `
                    <div style="
                        background: white; 
                        padding: 16px; 
                        min-width: 140px; 
                        border-radius: 6px; 
                        border: 1px solid white; 
                        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                        font-family: 'Interstate', 'Interstate-Regular', sans-serif;
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
                    const popup = popupRef.current!;
                    popup.setLngLat(coordinates).setHTML(html).addTo(map);

                    // Click on the pin to pin the tooltip
                    map.once("click", "school-icons", () => {
                        pinnedRef.current = true;
                    });

                    const popupElement = popup.getElement();
                    if (popupElement) {
                        const content = popupElement.querySelector(
                            ".maplibregl-popup-content",
                        ) as HTMLElement;
                        const tip = popupElement.querySelector(
                            ".maplibregl-popup-tip",
                        ) as HTMLElement;
                        if (content) {
                            content.style.background = "transparent";
                            content.style.boxShadow = "none";
                            content.style.padding = "0";
                        }
                        if (tip) tip.style.display = "none";
                    }
                },
            );

            // might need to put this back
            // On hover off, remove popup
            // map.on("mouseleave", "school-icons", () => {
            //     map.getCanvas().style.cursor = "";
            //     popup.remove();
            // });

            map.on("mouseleave", "school-icons", () => {
                map.getCanvas().style.cursor = "";
                if (!pinnedRef.current) {
                    popupRef.current?.remove();
                }
            });

            // Fixed ordering for layers
            if (map.getLayer("regions-layer")) map.moveLayer("regions-layer");
            if (map.getLayer("schoolHeatLayer"))
                map.moveLayer("schoolHeatLayer");
            if (map.getLayer("school-icons")) map.moveLayer("school-icons");
        };

        // Force update if map loads properly
        if (map.isStyleLoaded()) {
            updateHeatLayer();
        } else {
            map.once("load", updateHeatLayer);
        }

        // Gets rid of schools layer on button click
        if (!showSchools && map.getLayer("school-icons")) {
            map.removeLayer("school-icons");
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
