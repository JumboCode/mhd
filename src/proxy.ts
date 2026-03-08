import { NextRequest, NextResponse } from "next/server";
// import { headers } from "next/headers";
// import { auth } from "@/lib/auth";
import { getSessionCookie } from "better-auth/cookies";
import { getSession } from "@/lib/auth-session";
import { DEV_BYPASS } from "@/lib/dev-config"; // TO DO - REMOVE: dev auth bypass

export async function proxy(request: NextRequest) {
    const session = await getSession(request);

    const pathname = request.nextUrl.pathname;

    // TO DO - REMOVE: dev auth bypass - redirect to landing if already signed in
    if (pathname === "/signin") {
        if (session) return NextResponse.redirect(new URL("/", request.url));
        return NextResponse.next(); // allow through to signin page
    }

    if (!session) {
        return NextResponse.redirect(new URL("/signin", request.url));
    }

    // TO DO - REMOVE: dev auth bypass - skip cookie check when bypass enabled
    if (!DEV_BYPASS) {
        const sessionCookie = getSessionCookie(request);
        if (!sessionCookie) {
            return NextResponse.redirect(new URL("/signin", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    // Protect all routes except sign-in, and API auth routes
    matcher: [
        /*
         * Match all request paths except:
         * - /api/auth/* (auth API routes)
         * - /_next/* (Next.js internals)
         * - /*.* (files with extensions like favicon.ico, images, etc.)
         * Note: signin IS matched so we can redirect to / when already signed in
         */
        "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$).*)",
    ],
};
