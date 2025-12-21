import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    const sessionCookie = getSessionCookie(request);

    if (!sessionCookie) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
}

export const config = {
    runtime: "nodejs",
    matcher: ["/dummyPage"], // Apply middleware to specific routes
};
