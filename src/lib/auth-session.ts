// TO DO - REMOVE file: dev auth bypass
import { auth } from "./auth";
import { headers } from "next/headers";
import { DEV_BYPASS } from "@/lib/dev-config";

const DEV_SESSION = {
    user: {
        id: "dev",
        email: "dev@masshist.org",
        name: "Development",
        emailVerified: true,
    },
    session: {
        id: "dev-session",
        userId: "dev-user",
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    },
};

export async function getSession() {
    // TO DO - REMOVE: dev auth bypass
    if (process.env.NODE_ENV === "development" && DEV_BYPASS === true) {
        return DEV_SESSION;
    }
    return auth.api.getSession({ headers: await headers() });
}
