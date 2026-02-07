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

import { Map, MapRoute } from "@/components/ui/map";

import countiesData from "@/data/counties.json";

const counties = Object.values(countiesData).map((county) => ({
    name: county.name,
    coordinates: county.coordinates as [number, number][],
    color: "#FF0000",
}));

export default function HeatMapPage() {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <div className="w-9/10 h-9/10 rounded-2xl overflow-hidden border border-slate-200">
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
                </Map>
            </div>
        </div>
    );
}
