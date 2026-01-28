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

const western = [
    [-73.2613, 42.75],
    [-73.5084, 42.1035],
    [-72.4843, 42.0725],
    [-72.4602, 42.75],
    [-73.2613, 42.75],
] as [number, number][];

const central = [
    [-72.4843, 42.0725],
    [-72.4602, 42.75],
    [-71.5501, 42.7078],
    [-71.5645, 42.0258],
    [-72.4843, 42.0725],
] as [number, number][];

const northeast = [
    [-71.5501, 42.7078],
    [-70.8161, 42.8729],
    [-71.0254, 42.3261],
    [-71.5645, 42.0258],
    [-71.5501, 42.7078],
] as [number, number][];

const southeast = [
    [-71.5645, 42.0258],
    [-70.7764, 41.3303],
    [-69.9715, 41.2608],
    [-70.2334, 42.0881],
    [-71.0254, 42.3261],
    [-71.5645, 42.0258],
] as [number, number][];

export default function HeatMapPage() {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <div className="h-[600px] w-[800px] rounded-2xl overflow-hidden border border-slate-200">
                <Map center={[-72, 42.272]} zoom={7}>
                    <MapRoute
                        coordinates={western}
                        color="#3b82f6"
                        width={4}
                        opacity={0.5}
                    />
                    <MapRoute
                        coordinates={central}
                        color="red"
                        width={4}
                        opacity={0.5}
                    />
                    <MapRoute
                        coordinates={northeast}
                        color="orange"
                        width={4}
                        opacity={0.5}
                    />
                    <MapRoute
                        coordinates={southeast}
                        color="purple"
                        width={4}
                        opacity={0.5}
                    />
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
