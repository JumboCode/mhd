import { NextRequest, NextResponse } from "next/server";
// import { headers } from "next/headers";
// import { auth } from "@/lib/auth";
import { getSessionCookie } from "better-auth/cookies";
import { getSession } from "@/lib/auth-session";
import { DEV_BYPASS } from "@/lib/dev-config"; // TO DO - REMOVE: dev auth bypass

function safeRedirectTarget(redirect: string | null): string {
    if (redirect && redirect.startsWith("/") && !redirect.startsWith("//")) {
        return redirect;
    }
    return "/";
}

export async function proxy(request: NextRequest) {
    const session = await getSession(request);

    const pathname = request.nextUrl.pathname;

    // TO DO - REMOVE: dev auth bypass - redirect to landing if already signed in
    if (pathname === "/signin") {
        if (session) {
            const redirect = request.nextUrl.searchParams.get("redirect");
            return NextResponse.redirect(
                new URL(safeRedirectTarget(redirect), request.url),
            );
        }
        return NextResponse.next(); // allow through to signin page
    }

    if (!session) {
        const signinUrl = new URL("/signin", request.url);
        const originalPath = request.nextUrl.pathname + request.nextUrl.search;
        signinUrl.searchParams.set("redirect", originalPath);
        return NextResponse.redirect(signinUrl);
    }

    // TO DO - REMOVE: dev auth bypass - skip cookie check when in dev mode
    if (process.env.NODE_ENV !== "development" || !DEV_BYPASS) {
        const sessionCookie = getSessionCookie(request);
        if (!sessionCookie) {
            const signinUrl = new URL("/signin", request.url);
            const originalPath =
                request.nextUrl.pathname + request.nextUrl.search;
            signinUrl.searchParams.set("redirect", originalPath);
            return NextResponse.redirect(signinUrl);
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
