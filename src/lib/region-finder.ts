import regionData from "@/data/regions.json";
import rawData from "@/data/regions.json";
import fs from "fs";

// read json
// loop over all regions to check collision
// return "" if none

export type Coordinate = {
    lat: number;
    long: number;
};

export type Region = {
    name: string;
    fips: string;
    polygon: Array<Coordinate>;
};

export function findRegionOf(
    latitude: number | null | undefined,
    longitude: number | null | undefined,
): string {
    if (!latitude || !longitude) {
        return "";
    }

    const point: Coordinate = { lat: latitude, long: longitude };
    const regions: Array<Region> = loadRegions();

    let region_in: string = "";

    for (const region of regions) {
        if (checkForCollision(point, region)) {
            region_in = region.name;
            break;
        }
    }

    return region_in;
}

function loadRegions(): Array<Region> {
    const regions: Region[] = Object.values(rawData).map((r: any) => ({
        name: r.name,
        fips: r.fips,
        polygon: r.coordinates.map(([long, lat]: [number, number]) => ({
            lat,
            long,
        })),
    }));

    return regions;
}

function checkForCollision(coord: Coordinate, region: Region): Boolean {
    let inside: Boolean = false;
    const lat: number = coord.lat;
    const long: number = coord.long;

    for (
        let i = 0, j = region.polygon.length - 1;
        i < region.polygon.length;
        j = i++
    ) {
        // Check one edge at a time
        const lat_i: number = region.polygon[i].lat;
        const long_i: number = region.polygon[i].long;

        const lat_j: number = region.polygon[j].lat;
        const long_j: number = region.polygon[j].long;

        const intersects =
            long_i > long !== long_j > long &&
            lat <
                ((lat_j - lat_i) * (long - long_i)) / (long_j - long_i) + lat_i;

        if (intersects) {
            inside = !inside;
        }
    }
    return inside;
}
