import { getAuth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export async function GET(req: Request) {
    return toNextJsHandler(getAuth()).GET(req);
}

export async function POST(req: Request) {
    return toNextJsHandler(getAuth()).POST(req);
}
