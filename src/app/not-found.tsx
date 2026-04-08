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
        // Toast
        toast.success(
            "Page not found. You have been redirected to the homepage.",
        );
        // Timer so toast can show
        const timer = setTimeout(() => {
            router.replace("/");
        }, 1500);

        return () => clearTimeout(timer);
    }, [router]);

    return null;
}
