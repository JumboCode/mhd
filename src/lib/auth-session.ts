// TO DO - REMOVE file: dev auth bypass
import { NextRequest } from "next/server";
import { auth } from "./auth";
import { headers } from "next/headers";
import { DEV_BYPASS, DEV_BYPASS_COOKIE } from "@/lib/dev-config";
import { DEV_SESSION_USER } from "@/lib/dev-session";

const DEV_SESSION = {
    user: DEV_SESSION_USER,
    session: {
        id: "dev-session",
        userId: "dev-user",
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    },
};

function hasDevBypassCookie(request: NextRequest): boolean {
    const cookie = request.cookies.get(DEV_BYPASS_COOKIE);
    return cookie?.value === "1";
}

export async function getSession(request?: NextRequest) {
    // TO DO - REMOVE: dev auth bypass - only return dev session when cookie is set
    if (
        request &&
        process.env.NODE_ENV === "development" &&
        DEV_BYPASS === true &&
        hasDevBypassCookie(request)
    ) {
        return DEV_SESSION;
    }
    return auth.api.getSession({ headers: await headers() });
}
