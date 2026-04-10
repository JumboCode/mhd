import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";

import regionsData from "@/data/regions.json";
import { schoolProfileHrefWithReturnTo } from "@/lib/return-to";
import { standardize } from "@/lib/school-name-standardize";

const regions = Object.values(regionsData).map((region) => ({
    name: region.name,
    coordinates: region.coordinates as [number, number][],
}));

/**
 * Check if a point is inside a triangle defined by three vertices.
 * Uses the sign-of-cross-product (barycentric) method.
 */
function pointInTriangle(
    px: number,
    py: number,
    ax: number,
    ay: number,
    bx: number,
    by: number,
    cx: number,
    cy: number,
): boolean {
    const d1 = (px - bx) * (ay - by) - (ax - bx) * (py - by);
    const d2 = (px - cx) * (by - cy) - (bx - cx) * (py - cy);
    const d3 = (px - ax) * (cy - ay) - (cx - ax) * (py - ay);
    const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
    const hasPos = d1 > 0 || d2 > 0 || d3 > 0;
    return !(hasNeg && hasPos);
}

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

    const closePopup = () => {
        if (popupRef.current) {
            popupRef.current.remove();
        }
        pinnedRef.current = false;
    };

    // Dismiss popup on Escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                closePopup();
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
                if (!showSchools) return;
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

            // Tooltip popup with prediction cone
            //
            // The tooltip stays open when:
            //   1. The mouse is over the school icon
            //   2. The mouse is over the tooltip itself
            //   3. The mouse is inside a "prediction cone" — a triangle from the
            //      icon center to the left and right edges of the tooltip
            //   4. The tooltip was click-pinned (dismissed by Escape or clicking elsewhere)

            const renderPopup = (feature: GeoJSON.Feature) => {
                const geometry = feature.geometry as GeoJSON.Point;
                const coordinates = geometry.coordinates.slice() as [
                    number,
                    number,
                ];
                const { name } = feature.properties || {};
                const value = feature.properties?.[metric] || 0;
                const schoolSlug = standardize(name);
                const schoolPath = `/schools/${schoolSlug}`;
                const profileUrl =
                    typeof window !== "undefined"
                        ? schoolProfileHrefWithReturnTo(schoolPath, {
                              pathname: window.location.pathname,
                              search: window.location.search,
                          })
                        : schoolPath;

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
                            ${value.toLocaleString()} ${value === 1 ? metric.slice(0, -1).toLowerCase() : metric.toLowerCase()}
                        </p>
                        <a href="${profileUrl}" style="color: #af272f; text-decoration: underline;">View Profile &rarr;</a>
                    </div>
                `;

                popupRef
                    .current!.setLngLat(coordinates)
                    .setHTML(html)
                    .addTo(map);
            };

            // State for hover + prediction cone logic
            let hoverIconLngLat: [number, number] | null = null;
            let isOverTooltip = false;
            let isOverIcon = false;
            let dismissTimeout: ReturnType<typeof setTimeout> | null = null;

            const clearDismissTimeout = () => {
                if (dismissTimeout) {
                    clearTimeout(dismissTimeout);
                    dismissTimeout = null;
                }
            };

            const dismissIfNeeded = () => {
                if (pinnedRef.current || isOverTooltip || isOverIcon) return;
                // Small delay to allow mouse to reach the tooltip or cone check to run
                dismissTimeout = setTimeout(() => {
                    if (!pinnedRef.current && !isOverTooltip && !isOverIcon) {
                        popupRef.current?.remove();
                        hoverIconLngLat = null;
                    }
                }, 50);
            };

            // Listeners on the popup DOM element itself
            const onPopupMouseEnter = () => {
                isOverTooltip = true;
                clearDismissTimeout();
            };
            const onPopupMouseLeave = () => {
                isOverTooltip = false;
                dismissIfNeeded();
            };

            const attachPopupListeners = () => {
                const popupEl = popupRef.current?.getElement();
                if (popupEl) {
                    popupEl.addEventListener("mouseenter", onPopupMouseEnter);
                    popupEl.addEventListener("mouseleave", onPopupMouseLeave);
                    // Make sure pointer events work on the popup
                    popupEl.style.pointerEvents = "auto";
                }
            };
            const detachPopupListeners = () => {
                const popupEl = popupRef.current?.getElement();
                if (popupEl) {
                    popupEl.removeEventListener(
                        "mouseenter",
                        onPopupMouseEnter,
                    );
                    popupEl.removeEventListener(
                        "mouseleave",
                        onPopupMouseLeave,
                    );
                }
            };

            // Convert map-canvas-relative point to viewport coordinates
            const toViewport = (point: { x: number; y: number }) => {
                const canvasRect = map.getCanvas().getBoundingClientRect();
                return {
                    x: point.x + canvasRect.left,
                    y: point.y + canvasRect.top,
                };
            };

            // Get current viewport position of the hovered icon from its geo coords
            const getIconViewportPos = (): { x: number; y: number } | null => {
                if (!hoverIconLngLat) return null;
                const projected = map.project(
                    hoverIconLngLat as maplibregl.LngLatLike,
                );
                const vp = toViewport(projected);
                vp.y += 5;
                return vp;
            };

            // Check if cursor is inside the prediction cone between icon and tooltip
            const isInPredictionCone = (mapPoint: {
                x: number;
                y: number;
            }): boolean => {
                const iconPos = getIconViewportPos();
                if (!iconPos) return false;
                const popupEl = popupRef.current?.getElement();
                if (!popupEl) return false;

                const cursor = toViewport(mapPoint);
                const rect = popupEl.getBoundingClientRect();

                // Expand the cone slightly for a generous hit area
                const padding = 4;
                const yOffset = 9; // pull tooltip vertices up ~0.25cm

                // Triangle: icon center → tooltip bottom-left → tooltip bottom-right
                return pointInTriangle(
                    cursor.x,
                    cursor.y,
                    iconPos.x,
                    iconPos.y,
                    rect.left - padding,
                    rect.bottom + padding - yOffset,
                    rect.right + padding,
                    rect.bottom + padding - yOffset,
                );
            };

            // On mousemove over the map, check if cursor is in prediction cone
            const onMapMouseMove = (e: maplibregl.MapMouseEvent) => {
                if (pinnedRef.current || isOverIcon || isOverTooltip) return;
                if (!popupRef.current?.isOpen()) return;

                if (isInPredictionCone(e.point)) {
                    clearDismissTimeout();
                } else {
                    dismissIfNeeded();
                }
            };

            const onMouseEnter = (
                e: maplibregl.MapMouseEvent & {
                    features?: maplibregl.MapGeoJSONFeature[];
                },
            ) => {
                map.getCanvas().style.cursor = "pointer";
                isOverIcon = true;
                clearDismissTimeout();

                if (!pinnedRef.current && e.features && e.features.length) {
                    renderPopup(e.features[0]);
                    // Store the geo coordinates for prediction cone (reprojected dynamically)
                    const geom = e.features[0].geometry as GeoJSON.Point;
                    hoverIconLngLat = geom.coordinates.slice() as [
                        number,
                        number,
                    ];
                    attachPopupListeners();
                }
            };

            const onMouseLeave = () => {
                map.getCanvas().style.cursor = "";
                isOverIcon = false;
                if (!pinnedRef.current) {
                    dismissIfNeeded();
                }
            };

            const onMapClick = (e: maplibregl.MapMouseEvent) => {
                const features = map.queryRenderedFeatures(e.point, {
                    layers: ["school-icons"],
                });
                if (features.length) {
                    pinnedRef.current = true;
                    renderPopup(features[0]);
                    const geom = features[0].geometry as GeoJSON.Point;
                    hoverIconLngLat = geom.coordinates.slice() as [
                        number,
                        number,
                    ];
                    attachPopupListeners();
                } else {
                    pinnedRef.current = false;
                    isOverTooltip = false;
                    popupRef.current?.remove();
                    detachPopupListeners();
                    hoverIconLngLat = null;
                }
            };

            if (showSchools) {
                map.on("mouseenter", "school-icons", onMouseEnter);
                map.on("mouseleave", "school-icons", onMouseLeave);
                map.on("mousemove", onMapMouseMove);
                map.on("click", onMapClick);
            } else if (map.getLayer("school-icons")) {
                map.removeLayer("school-icons");
                popupRef.current?.remove();
                pinnedRef.current = false;
            }

            return () => {
                clearDismissTimeout();
                detachPopupListeners();
                map.off("mouseenter", "school-icons", onMouseEnter);
                map.off("mouseleave", "school-icons", onMouseLeave);
                map.off("mousemove", onMapMouseMove);
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

    return { closePopup };
}
