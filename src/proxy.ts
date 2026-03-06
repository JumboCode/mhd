import { NextRequest, NextResponse } from "next/server";
// import { headers } from "next/headers";
// import { auth } from "@/lib/auth";
import { getSessionCookie } from "better-auth/cookies";
import { getSession } from "@/lib/auth-session";
import { DEV_BYPASS } from "@/lib/dev-config";

export async function proxy(request: NextRequest) {
    const session = await getSession();

    if (!session) {
        return NextResponse.redirect(new URL("/signin", request.url));
    }

    // TO DO - REMOVE: dev auth bypass
    if (process.env.NODE_ENV !== "development" || !DEV_BYPASS) {
        const sessionCookie = getSessionCookie(request);
        if (!sessionCookie) {
            return NextResponse.redirect(new URL("/", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    // Protect all routes except sign-in, and API auth routes
    matcher: [
        /*
         * Match all request paths except:
         * - /signin (sign-in page)
         * - /api/auth/* (auth API routes)
         * - /_next/* (Next.js internals)
         * - /static/* (static files)
         * - /*.* (files with extensions like favicon.ico, images, etc.)
         */
        "/((?!signin|api/auth|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$).*)",
    ],
};
