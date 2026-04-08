/***************************************************************
 *
 *                /not-found.tsx
 *
 *         Author: Elki
 *           Date: 4/7/2025
 *
 *        Summary: Reroutes user to homepage on 404 (invalid URL)
 *
 **************************************************************/
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function NotFound() {
    const router = useRouter();

    useEffect(() => {
        // Timer so toast can show
        setTimeout(() => {
            toast.error(
                "Invalid URL. You have been redirected to the homepage.",
            );
        }, 50);

        // Reroute to homepage
        router.replace("/");
    }, [router]);

    return null;
}
