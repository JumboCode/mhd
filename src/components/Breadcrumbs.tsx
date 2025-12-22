/***************************************************************
 *
 *                Breadcrumbs.tsx
 *
 *         Author: Anne Wu & Justin Ngan
 *           Date: 12/6/2025
 *
 *        Summary: Component to track page routes and return to
 *                 previous pages
 *
 **************************************************************/

"use client";

import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";

export function Breadcrumbs() {
    const pathname = usePathname();
    const crumbTrail = pathname.split("/").filter((item) => item !== "");
    const backArrowHref = `/${crumbTrail.slice(0, crumbTrail.length - 1).join("/")}`;

    // Determine if we're on an Analysis page (map or graphs)
    const isAnalysisPage = pathname === "/map" || pathname === "/graphs";
    const firstBreadcrumbLabel = isAnalysisPage ? "ANALYSIS" : "OVERVIEW";
    const firstBreadcrumbHref = isAnalysisPage
        ? pathname === "/map"
            ? "/map"
            : "/graphs"
        : "/";

    return (
        <div className="flex items-center gap-4 font-semibold">
            <Button
                asChild
                variant="ghost"
                size="icon"
                aria-label="Submit"
                className="outline hover:bg-accent h-7 w-7"
            >
                <Link href={backArrowHref}>
                    <ArrowLeftIcon />
                </Link>
            </Button>
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink
                            asChild
                            className={
                                pathname === "/"
                                    ? "text-mhd-black"
                                    : "text-muted-foreground"
                            }
                        >
                            <Link href={firstBreadcrumbHref}>
                                {firstBreadcrumbLabel}
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    {crumbTrail.map((link, index) => {
                        const href = `/${crumbTrail.slice(0, index + 1).join("/")}`;
                        const isCurrent = pathname === href;

                        return (
                            <React.Fragment key={href}>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbLink
                                        asChild
                                        className={
                                            isCurrent
                                                ? "text-mhd-black"
                                                : "text-muted-foreground"
                                        }
                                    >
                                        <Link href={href}>
                                            {link.toUpperCase()}
                                        </Link>
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                            </React.Fragment>
                        );
                    })}
                </BreadcrumbList>
            </Breadcrumb>
        </div>
    );
}
