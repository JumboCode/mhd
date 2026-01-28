/***************************************************************
 *
 *                src/app/heat-map/page.tsx
 *
 *         Author: Chiara & Elki
 *           Date: 1/27/26
 *
 *        Summary: Heatmap + Clusters POC with MA region
 *
 **************************************************************/

import {
    Map,
    MapMarker,
    MarkerContent,
    MarkerTooltip,
    MapClusterLayer,
    MapPopup,
    MapRoute,
} from "@/components/ui/map";

import heatmapData from "../heat-map/data.json";
import countiesData from "../heat-map/counties.json";

const COUNTY_COLORS = [
    "#3b82f6",
    "#ef4444",
    "#22c55e",
    "#eab308",
    "#eab308",
    "#8b5cf6",
    "#ec4899",
    "#f97316",
    "#14b8a6",
    "#6366f1",
    "#84cc16",
    "#06b6d4",
    "#06b6d4",
    "#f43f5e",
    "#a855f7",
    "#10b981",
];

const counties = Object.values(countiesData).map((county, i) => ({
    name: county.name,
    coordinates: county.coordinates as [number, number][],
    color: COUNTY_COLORS[i % COUNTY_COLORS.length],
}));

export default function HeatMapPage() {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <div className="h-[600px] w-[800px] rounded-2xl overflow-hidden border border-slate-200">
                <Map center={[-72, 42.272]} zoom={7}>
                    {counties.map((county) => (
                        <MapRoute
                            key={county.name}
                            coordinates={county.coordinates}
                            color={county.color}
                            width={4}
                            opacity={0.5}
                        />
                    ))}
                    <MapClusterLayer
                        data={heatmapData as any}
                        clusterRadius={50}
                        clusterMaxZoom={14}
                        clusterColors={["#22c55e", "#eab308", "#ef4444"]}
                        pointColor="#3b82f6"
                    />
                </Map>
            </div>
        </div>
    );
}
