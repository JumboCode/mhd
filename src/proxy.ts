import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getSessionCookie } from "better-auth/cookies";

export async function proxy(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return NextResponse.redirect(new URL("/graphs", request.url));
    }

    const sessionCookie = getSessionCookie(request);

    if (!sessionCookie) {
        return NextResponse.redirect(new URL("/", request.url));
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
        //"/((?!signin|api/auth|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$).*)",
    ],
};
