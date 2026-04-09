/***************************************************************
 *
 *                src/components/InvalidURLHandler.tsx
 *
 *         Author: Shayne Sidman
 *           Date: 4/8/2026
 *
 *        Summary: Handler for invalid URLs; redirect to dashboard
 *
 **************************************************************/
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function InvalidURLHandler() {
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        if (searchParams.get("toast") === "invalid-url") {
            toast.error(
                "Invalid URL. You have been redirected to the dashboard.",
            );
            router.push("/");
        }
    }, [searchParams]);

    return null;
}
