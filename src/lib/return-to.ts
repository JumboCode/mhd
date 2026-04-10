/** Query key for “return here” when opening a school from another page (e.g. map). */
export const RETURN_TO_QUERY_KEY = "returnTo";

const ROUTE_LABELS: Record<string, string> = {
    "/": "Overview",
    "/schools": "Schools",
    "/chart": "Chart",
    "/map": "Map",
    "/upload": "Upload",
    "/settings": "Settings",
    "/signin": "Sign in",
    "/graphs": "Graphs",
};

function humanizePathSegment(segment: string): string {
    const decoded = decodeURIComponent(segment);
    return decoded
        .split("-")
        .map(
            (word) =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(" ");
}

/** Human-readable title for a path (pathname only, no query). */
export function labelForPathname(pathname: string): string {
    const normalized =
        pathname === "" || pathname === "/"
            ? "/"
            : pathname.replace(/\/$/, "") || "/";
    if (ROUTE_LABELS[normalized]) {
        return ROUTE_LABELS[normalized];
    }
    const segments = normalized.split("/").filter(Boolean);
    const last = segments[segments.length - 1];
    return last ? humanizePathSegment(last) : "Overview";
}

/**
 * Validates a returnTo value: must be an in-app path (relative, same-origin).
 * Returns pathname + search + hash, or null.
 */
export function safeInternalReturnTo(raw: string | null): string | null {
    if (raw == null || raw === "") return null;
    let decoded: string;
    try {
        decoded = decodeURIComponent(raw);
    } catch {
        return null;
    }
    if (decoded.length > 2048) return null;
    if (!decoded.startsWith("/") || decoded.startsWith("//")) return null;
    if (decoded.includes("://") || decoded.includes("\\")) return null;

    let parsed: URL;
    try {
        parsed = new URL(decoded, "http://local.invalid");
    } catch {
        return null;
    }
    if (parsed.username || parsed.password || parsed.host !== "local.invalid") {
        return null;
    }
    return parsed.pathname + parsed.search + parsed.hash;
}

/** Append ?returnTo=… for links from a page (e.g. map) into a school profile. */
export function schoolProfileHrefWithReturnTo(
    schoolPath: string,
    currentLocation: { pathname: string; search: string },
): string {
    const target = `${currentLocation.pathname}${currentLocation.search}`;
    const param = encodeURIComponent(target);
    const joiner = schoolPath.includes("?") ? "&" : "?";
    return `${schoolPath}${joiner}${RETURN_TO_QUERY_KEY}=${param}`;
}
