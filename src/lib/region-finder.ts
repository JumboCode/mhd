/***************************************************************
 *
 *                region-finder.ts
 *
 *         Author: Zander & Chiara
 *         Date: 03/25/2026
 *
 *        Summary: Main raycasting method for determining
 *        the region of a long/lat coordinate.
 *
 **************************************************************/

/**
 * Flow:
 * 1. Validate that latitude and longitude are provided
 * 2. Load all regions from the JSON data file
 * 3. Run point-in-polygon raycasting for each region
 * 4. Return the name of the matching region, or "" if none
 */

import rawData from "@/data/regions.json";

/**
 * Represents a geographic point.
 */
export type Coordinate = {
    lat: number;
    long: number;
};

/**
 * Represents a named geographic region defined by a polygon boundary.
 */
export type Region = {
    name: string;
    fips: string;
    polygon: Array<Coordinate>;
};

/**
 * Raw shape of a region entry as stored in regions.json.
 */
type RawRegion = {
    name: string;
    fips: string;
    coordinates: number[][];
};

/**
 * Determines which region a given coordinate falls within.
 *
 * Iterates over all known regions and uses point-in-polygon
 * raycasting to find the first match.
 *
 * @param latitude  Latitude of the point to locate
 * @param longitude Longitude of the point to locate
 * @returns The name of the containing region, or "" if unresolved
 */
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

/**
 * Parses the raw regions JSON into typed Region objects.
 *
 * Remaps GeoJSON-style [long, lat] coordinate pairs into
 * the Coordinate format used throughout this module.
 *
 * @returns Array of Region objects with normalized polygon coordinates
 */
function loadRegions(): Array<Region> {
    const regions: Region[] = Object.values(
        rawData as Record<string, RawRegion>,
    ).map((r) => ({
        name: r.name,
        fips: r.fips,
        polygon: r.coordinates.map(([long, lat]) => ({
            lat,
            long,
        })),
    }));

    return regions;
}

/**
 * Determines whether a coordinate falls inside a region's polygon
 * using the ray casting algorithm.
 *
 * Casts a ray from the point and counts edge crossings. An odd
 * number of crossings indicates the point is inside the polygon.
 *
 * @param coord  The coordinate to test
 * @param region The region whose polygon boundary is checked
 * @returns True if the coordinate is inside the region, false otherwise
 */
function checkForCollision(coord: Coordinate, region: Region): boolean {
    let inside: boolean = false;
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
