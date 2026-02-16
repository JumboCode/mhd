"use client";
/***************************************************************
 *
 *                src/app/heat-map/page.tsx
 *
 *         Author: Anne, Chiara & Elki, Steven
 *         Last updated: 2/14/26
 *
 *        Summary: Heatmap + Clusters POC with MA region
 *
 **************************************************************/

import { Map, MapRoute } from "@/components/ui/map";
import { useEffect, useState, useRef } from "react";

import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import countiesData from "@/data/counties.json";
import YearDropdown from "@/components/YearDropdown";
import CountDropdown from "@/components/CountDropdown";

const counties = Object.values(countiesData).map((county) => ({
    name: county.name,
    coordinates: county.coordinates as [number, number][],
    color: "#FF0000",
}));

export default function HeatMapPage() {
    const [schoolPoints, setSchoolPoints] = useState<any>(null);

    // Controlled by dropdowns
    // Year dropdown, set to range of our data
    const [year, setYear] = useState<number | null>(2025);
    // totalStudents | totalProjects |totalTeachers
    const [metric, setMetric] = useState<string>("Projects");

    const [error, setError] = useState<string | null>(null);

    // Reference to the map, needed for updating the heat layer
    const mapRef = useRef<any>(null);

    // Boolean to hide/show schools
    const [showSchools, setShowSchools] = useState(true);

    const handleClick = () => {
        setShowSchools(!showSchools);
    };

    //fetch school point data for heat layer
    useEffect(() => {
        fetch(`/api/heat-layer?year=${year}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch school data`);
                }
                return response.json();
            })
            .then((data) => {
                setSchoolPoints(data);
            })
            .catch((error) => {
                setError(error.message || "Failed to load school data");
            });
    }, [year]);

    useEffect(() => {
        // Get reference to map, from reference get actual map
        const mapCurrent = mapRef.current;
        if (!mapCurrent) return;

        const map = mapCurrent?.getMap ? mapCurrent.getMap() : mapCurrent;

        // Draw routes for counties
        if (!map.getSource("counties-source")) {
            map.addSource("counties-source", {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: counties.map((c) => ({
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
                id: "counties-layer",
                type: "line",
                source: "counties-source",
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
            // Calculate maximum for weight based on the max by metric
            const features = schoolPoints.features || [];
            const values = features.map((f: any) => f.properties[metric] || 0);
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
                map.getSource("schoolSource").setData(schoolPoints);
            } else {
                map.addSource("schoolSource", {
                    type: "geojson",
                    data: schoolPoints,
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

            // Circles for school points
            if (!map.getLayer("circles")) {
                map.addLayer({
                    id: "circles",
                    type: "circle",
                    source: "schoolSource",
                    paint: {
                        "circle-radius": 6,
                        "circle-color": "gray",
                        "circle-stroke-width": 0.5,
                        "circle-stroke-color": "#ffffff",
                    },
                });
            }

            // Tooltips displaying information on hover
            // Only when schools are shown, does not appear otherwise.
            map.on("mouseenter", "circles", (e: any) => {
                map.getCanvas().style.cursor = "pointer";

                const feature = e.features[0];
                const coordinates = feature.geometry.coordinates.slice();
                const { name } = feature.properties;
                const value = feature.properties[metric] || 0;

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
                    </div>
                `;

                // Place popup right above the point
                popup.setLngLat(coordinates).setHTML(html).addTo(map);

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
            });

            // On hover off, remove popup
            map.on("mouseleave", "circles", () => {
                map.getCanvas().style.cursor = "";
                popup.remove();
            });

            // Fixed ordering for layers
            if (map.getLayer("counties-layer")) map.moveLayer("counties-layer");
            if (map.getLayer("schoolHeatLayer"))
                map.moveLayer("schoolHeatLayer");
            if (map.getLayer("circles")) map.moveLayer("circles");
        };

        // Force update if map loads properly
        if (map.isStyleLoaded()) {
            updateHeatLayer();
        } else {
            map.once("load", updateHeatLayer);
        }

        // Gets rid of schools layer on button click
        if (!showSchools) {
            map.removeLayer("circles");
        }
    }, [metric, schoolPoints, showSchools]);

    return (
        <div className="flex p-4 flex-col h-screen w-screen justify-center">
            <h1 className="text-2xl py-4 font-semibold">Heatmap</h1>
            <div className="flex items-center gap-4 shrink-0 pb-5">
                <CountDropdown
                    selectedCount={metric}
                    onCountChange={setMetric}
                />
                <YearDropdown selectedYear={year} onYearChange={setYear} />
                <button
                    onClick={handleClick}
                    className="ml-auto px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors duration-200"
                >
                    {showSchools ? "Hide Schools" : "Show Schools"}
                </button>
            </div>
            <div className="flex-1 rounded-2xl overflow-hidden border border-slate-200">
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
            </div>
        </div>
    );
}
