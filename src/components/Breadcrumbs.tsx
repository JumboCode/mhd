/***************************************************************
 *
 *                Breadcrumbs.tsx
 *
 *         Author: Anne Wu & Justin Ngan
 *           Date: 12/6/2025
 *
 *        Summary: Back control: icon (button look) + label in one
 *                 link. Honors ?returnTo= when set (e.g. map → school).
 *
 **************************************************************/

"use client";

import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { cn } from "@/lib/utils";
import {
    RETURN_TO_QUERY_KEY,
    labelForPathname,
    safeInternalReturnTo,
} from "@/lib/return-to";

function backTargetFromPath(pathname: string): { href: string; label: string } {
    const segments = pathname.split("/").filter((s) => s !== "");
    if (segments.length === 0) {
        return { href: "/", label: labelForPathname("/") };
    }
    const href =
        segments.length === 1 ? "/" : `/${segments.slice(0, -1).join("/")}`;
    return { href, label: labelForPathname(href.split("?")[0]) };
}

function BreadcrumbsInner({ className }: { className?: string }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const rawReturn = searchParams.get(RETURN_TO_QUERY_KEY);
    const returnTo = safeInternalReturnTo(rawReturn);

    const segments = pathname.split("/").filter((s) => s !== "");
    if (segments.length === 0) {
        return null;
    }

    const fromQuery =
        returnTo != null
            ? {
                  href: returnTo,
                  label: labelForPathname(returnTo.split("?")[0]),
              }
            : null;

    const { href, label } = fromQuery ?? backTargetFromPath(pathname);

    return (
        <Link
            href={href}
            aria-label={`Back to ${label}`}
            className={cn(
                "group inline-flex max-w-full items-center gap-3 rounded-md text-sm font-semibold text-mhd-black",
                "outline-none transition-colors",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                className,
            )}
        >
            <span
                className={cn(
                    "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-background",
                    "transition-colors group-hover:bg-accent group-active:bg-accent/90",
                )}
            >
                <ArrowLeftIcon className="h-4 w-4" aria-hidden />
            </span>
            <span
                className={cn(
                    "min-w-0 truncate underline-offset-4 transition-colors",
                    "group-hover:underline group-hover:decoration-muted-foreground/50",
                )}
            >
                {label}
            </span>
        </Link>
    );
}

function BreadcrumbsFallback({ className }: { className?: string }) {
    return (
        <div className={cn("flex items-center gap-3", className)} aria-hidden>
            <div className="h-7 w-7 shrink-0 rounded-md border border-border bg-muted/40" />
            <div className="h-4 w-24 max-w-[40%] rounded bg-muted/40" />
        </div>
    );
}

export function Breadcrumbs({ className }: { className?: string }) {
    return (
        <Suspense fallback={<BreadcrumbsFallback className={className} />}>
            <BreadcrumbsInner className={className} />
        </Suspense>
    );
}
