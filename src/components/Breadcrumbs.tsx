"use client";

import React from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function MHDBreadcrumb() {
    const pathname = usePathname();
    const crumbTrail = pathname.split("/").filter((item) => item !== "");
    const baseURL = window.location.origin;
    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link href="/">OVERVIEW</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                {crumbTrail.map((link, index) => {
                    let href = `${baseURL}/${crumbTrail.slice(0, index + 1).join("/")}`;
                    return (
                        <div className="inline-flex">
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <Link href={href}>
                                        {link.toUpperCase()}
                                    </Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        </div>
                    );
                })}
                {/* <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/docs/components">Components</Link>
          </BreadcrumbLink>
        </BreadcrumbItem> */}
                {/*this needed to be made dynamically*/}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
