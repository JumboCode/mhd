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

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { Button } from "@/components/ui/button";

import { ArrowLeftIcon } from "lucide-react";

export function MHDBreadcrumb() {
    const pathname = usePathname();
    const crumbTrail = pathname.split("/").filter((item) => item !== "");
    const backArrowHref = `/${crumbTrail.slice(0, crumbTrail.length - 2).join("/")}`;

    return (
        <div className="flex items-center gap-4">
            <Button
                asChild
                variant="ghost"
                size="icon"
                aria-label="Submit"
                className="outline  hover:bg-gray-100"
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
                                    : "text-gray-400"
                            }
                        >
                            <Link href="/">OVERVIEW</Link>
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
                                                : "text-gray-400"
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
