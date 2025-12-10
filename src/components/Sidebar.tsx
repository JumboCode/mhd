"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Map,
    BarChart3,
    LayoutDashboard,
    FileUp,
    Settings as SettingsIcon,
    ChevronDown,
    ChevronRight,
} from "lucide-react";

export default function Sidebar() {
    const pathname = usePathname();
    const [isOverviewOpen, setIsOverviewOpen] = useState(false);

    // Automatically open Overview if any subitem is active
    useEffect(() => {
        const overviewSubitems = ["/", "/schools"];
        const isAnyOverviewSubitemActive = overviewSubitems.some(
            (href) => pathname === href,
        );
        if (isAnyOverviewSubitemActive) {
            setIsOverviewOpen(true);
        }
    }, [pathname]);

    const sections = [
        {
            title: "DATA",
            items: [
                {
                    label: "Overview",
                    icon: <LayoutDashboard size={20} />,
                    isExpandable: true,
                    subitems: [
                        { href: "/", label: "Dashboard" },
                        { href: "/schools", label: "Schools" },
                    ],
                },
                {
                    href: "/upload",
                    label: "Upload Data",
                    icon: <FileUp size={20} />,
                },
                {
                    href: "/settings",
                    label: "Settings",
                    icon: <SettingsIcon size={20} />,
                },
            ],
        },
        {
            title: "ANALYSIS",
            items: [
                { href: "/map", label: "Map", icon: <Map size={20} /> },
                {
                    href: "/graphs",
                    label: "Chart",
                    icon: <BarChart3 size={20} />,
                },
            ],
        },
    ];

    return (
        <aside className="h-full bg-white border-r border-gray-200 flex flex-col justify-between w-56 flex-shrink-0">
            <div className="flex-1 overflow-hidden">
                <div className="px-6 py-5 flex items-center justify-center">
                    <h1>
                        <img
                            src="/images/logo.png"
                            alt="Logo"
                            className="w-20 h-12"
                        />
                    </h1>
                </div>

                <div className="mt-4 px-3">
                    {sections.map((section) => (
                        <div key={section.title} className="mb-5">
                            <p className="text-xs font-semibold text-gray-400 mb-2 px-2 overflow-hidden whitespace-nowrap">
                                {section.title}
                            </p>

                            <nav className="flex flex-col space-y-1">
                                {section.items.map((item) => {
                                    if (item.isExpandable && item.subitems) {
                                        // Expandable item (Overview)
                                        const isAnySubitemActive =
                                            item.subitems.some(
                                                (sub) => pathname === sub.href,
                                            );

                                        return (
                                            <div key={item.label}>
                                                <button
                                                    onClick={() =>
                                                        setIsOverviewOpen(
                                                            !isOverviewOpen,
                                                        )
                                                    }
                                                    className={`
                                                        w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors
                                                        ${
                                                            isAnySubitemActive
                                                                ? "text-black hover:bg-blue-50 hover:text-blue-900"
                                                                : "text-gray-700 hover:bg-blue-50 hover:text-blue-900"
                                                        }
                                                    `}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center justify-center w-6">
                                                            {item.icon}
                                                        </div>
                                                        <span className="text-sm overflow-hidden whitespace-nowrap">
                                                            {item.label}
                                                        </span>
                                                    </div>
                                                    {isOverviewOpen ? (
                                                        <ChevronDown
                                                            size={16}
                                                        />
                                                    ) : (
                                                        <ChevronRight
                                                            size={16}
                                                        />
                                                    )}
                                                </button>

                                                {isOverviewOpen && (
                                                    <div className="ml-12 mt-1 flex flex-col space-y-1">
                                                        {item.subitems.map(
                                                            (subitem) => {
                                                                const isActive =
                                                                    pathname ===
                                                                    subitem.href;

                                                                return (
                                                                    <Link
                                                                        key={
                                                                            subitem.href
                                                                        }
                                                                        href={
                                                                            subitem.href
                                                                        }
                                                                        className={`
                                                                            px-3 py-1.5 rounded-lg transition-colors text-sm
                                                                            ${
                                                                                isActive
                                                                                    ? "text-black font-semibold bg-blue-100"
                                                                                    : "text-gray-600 hover:bg-blue-50 hover:text-blue-900"
                                                                            }
                                                                        `}
                                                                    >
                                                                        {
                                                                            subitem.label
                                                                        }
                                                                    </Link>
                                                                );
                                                            },
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    } else {
                                        // Regular item
                                        const isActive = pathname === item.href;

                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href!}
                                                className={`
                                                    flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                                                    ${
                                                        isActive
                                                            ? "text-black font-semibold bg-blue-100"
                                                            : "text-gray-700 hover:bg-blue-50 hover:text-blue-900"
                                                    }
                                                `}
                                            >
                                                <div className="flex items-center justify-center w-6">
                                                    {item.icon}
                                                </div>
                                                <span className="text-sm overflow-hidden whitespace-nowrap">
                                                    {item.label}
                                                </span>
                                            </Link>
                                        );
                                    }
                                })}
                            </nav>
                        </div>
                    ))}
                </div>
            </div>

            <div className="px-4 py-5 self-center flex items-center gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                    <img
                        src="/images/drake.png"
                        alt="Profile"
                        className="w-full h-full object-cover"
                    />
                </div>
                <span className="text-sm font-medium text-gray-700 overflow-hidden whitespace-nowrap">
                    Admin Name
                </span>
            </div>
        </aside>
    );
}
