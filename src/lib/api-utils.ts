import { NextResponse } from "next/server";
import type { ZodType, ZodError } from "zod";

/**
 * Formats a ZodError into a human-readable string.
 * Uses the first issue's message by default.
 */
function formatZodError(error: ZodError): string {
    const issue = error.issues[0];
    if (issue.path.length > 0) {
        return `${issue.path.join(".")}: ${issue.message}`;
    }
    return issue.message;
}

/**
 * Parses `data` against a zod schema.
 * Returns `{ data }` on success or a 400 NextResponse on failure.
 */
export function parseOrError<T>(
    schema: ZodType<T>,
    data: unknown,
): { success: true; data: T } | { success: false; response: NextResponse } {
    const result = schema.safeParse(data);
    if (!result.success) {
        return {
            success: false,
            response: NextResponse.json(
                { error: formatZodError(result.error) },
                { status: 400 },
            ),
        };
    }
    return { success: true, data: result.data };
}

/**
 * Extracts search params from a request URL into a plain object.
 */
export function searchParamsToObject(req: Request): Record<string, string> {
    const { searchParams } = new URL(req.url);
    const obj: Record<string, string> = {};
    searchParams.forEach((value, key) => {
        obj[key] = value;
    });
    return obj;
}

/**
 * Returns a standardized 500 error response.
 * Never exposes internal error details to the client.
 */
export function internalError(): NextResponse {
    return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
    );
}
