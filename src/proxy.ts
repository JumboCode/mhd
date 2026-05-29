import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { getSession } from "@/lib/auth-session";

function safeRedirectTarget(redirect: string | null): string {
    if (redirect && redirect.startsWith("/") && !redirect.startsWith("//")) {
        return redirect;
    }
    return "/";
}

export async function proxy(request: NextRequest) {
    const session = await getSession();

    const pathname = request.nextUrl.pathname;

    if (pathname === "/signin") {
        if (session) {
            const redirect = request.nextUrl.searchParams.get("redirect");
            return NextResponse.redirect(
                new URL(safeRedirectTarget(redirect), request.url),
            );
        }
        return NextResponse.next();
    }

    if (!session) {
        const signinUrl = new URL("/signin", request.url);
        const originalPath = request.nextUrl.pathname + request.nextUrl.search;
        signinUrl.searchParams.set("redirect", originalPath);
        return NextResponse.redirect(signinUrl);
    }

    const sessionCookie = getSessionCookie(request);
    if (!sessionCookie) {
        const signinUrl = new URL("/signin", request.url);
        const originalPath = request.nextUrl.pathname + request.nextUrl.search;
        signinUrl.searchParams.set("redirect", originalPath);
        return NextResponse.redirect(signinUrl);
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
        "/((?!api/auth|api/check-email|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$).*)",
    ],
};
