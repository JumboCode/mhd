import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";

import regionsData from "@/data/regions.json";
import { standardize } from "@/lib/school-name-standardize";

const regions = Object.values(regionsData).map((region) => ({
    name: region.name,
    coordinates: region.coordinates as [number, number][],
}));

interface UseHeatmapLayersOptions {
    mapRef: React.RefObject<maplibregl.Map | null>;
    filteredSchoolPoints: GeoJSON.FeatureCollection | null;
    metric: string;
    showSchools: boolean;
}

export function useHeatmapLayers({
    mapRef,
    filteredSchoolPoints,
    metric,
    showSchools,
}: UseHeatmapLayersOptions) {
    const popupRef = useRef<maplibregl.Popup | null>(null);
    const pinnedRef = useRef(false);

    // Dismiss popup on Escape
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

    // Sync heat layer, school icons, and popups with the map
    useEffect(() => {
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

        const updateHeatLayer = () => {
            // Region boundary lines
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

            // Filter to only include schools with data for the selected metric
            const allFeatures = filteredSchoolPoints?.features || [];
            const filteredFeatures = allFeatures.filter(
                (f: GeoJSON.Feature) => (f.properties?.[metric] || 0) > 0,
            );
            const filteredData = {
                ...filteredSchoolPoints,
                features: filteredFeatures,
            } as GeoJSON.FeatureCollection;

            // Calculate maximum for weight based on the max by metric
            const values = filteredFeatures.map(
                (f: GeoJSON.Feature) => f.properties?.[metric] || 0,
            );
            const maxValue = Math.max(...values, 1);

            const weightExpression: maplibregl.ExpressionSpecification = [
                "interpolate",
                ["linear"],
                ["get", metric],
                0,
                0,
                maxValue,
                1,
            ];

            // School data source
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

            // Heat layer
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
                        "heatmap-weight": weightExpression,
                        "heatmap-intensity": [
                            "interpolate",
                            ["linear"],
                            ["zoom"],
                            0,
                            1,
                            50,
                            3,
                        ],
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

            // Tooltip popup
            const renderPopup = (feature: GeoJSON.Feature) => {
                const geometry = feature.geometry as GeoJSON.Point;
                const coordinates = geometry.coordinates.slice() as [
                    number,
                    number,
                ];
                const { name } = feature.properties || {};
                const value = feature.properties?.[metric] || 0;
                const schoolSlug = standardize(name);
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
                        <p style="margin: 2px 0 8px 0; font-size: 16px; color: #333; font-weight: 500;">
                            ${value.toLocaleString()} ${metric.toLowerCase()}
                        </p>
                        <a href="${profileUrl}" style="color: #af272f; text-decoration: underline;">View Profile &rarr;</a>
                    </div>
                `;

                popupRef
                    .current!.setLngLat(coordinates)
                    .setHTML(html)
                    .addTo(map);
            };

            const onMouseEnter = (
                e: maplibregl.MapMouseEvent & {
                    features?: maplibregl.MapGeoJSONFeature[];
                },
            ) => {
                map.getCanvas().style.cursor = "pointer";
                if (!pinnedRef.current && e.features && e.features.length)
                    renderPopup(e.features[0]);
            };

            const onMouseLeave = () => {
                map.getCanvas().style.cursor = "";
                if (!pinnedRef.current) popupRef.current?.remove();
            };

            const onMapClick = (e: maplibregl.MapMouseEvent) => {
                const features = map.queryRenderedFeatures(e.point, {
                    layers: ["school-icons"],
                });
                if (features.length) {
                    pinnedRef.current = true;
                    renderPopup(features[0]);
                } else {
                    pinnedRef.current = false;
                    popupRef.current?.remove();
                }
            };

            if (showSchools) {
                map.on("mouseenter", "school-icons", onMouseEnter);
                map.on("mouseleave", "school-icons", onMouseLeave);
                map.on("click", onMapClick);
            } else if (map.getLayer("school-icons")) {
                map.removeLayer("school-icons");
                popupRef.current?.remove();
                pinnedRef.current = false;
            }

            return () => {
                map.off("mouseenter", "school-icons", onMouseEnter);
                map.off("mouseleave", "school-icons", onMouseLeave);
                map.off("click", onMapClick);
            };
        };

        let cleanup: (() => void) | undefined;

        const onLoad = () => {
            cleanup = updateHeatLayer();
        };

        if (map.isStyleLoaded()) {
            cleanup = updateHeatLayer();
        } else {
            map.once("load", onLoad);
        }

        return () => {
            cleanup?.();
            map.off("load", onLoad);
        };
    }, [metric, filteredSchoolPoints, showSchools]);
}
