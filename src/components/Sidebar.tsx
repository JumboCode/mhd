"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Map, BarChart3, Calendar, Upload, Settings } from "lucide-react";

export default function Sidebar() {
    const pathname = usePathname();

    const sections = [
        {
            title: "VISUALIZATIONS",
            items: [
                { href: "/map", label: "Map", icon: <Map size={20} /> },
                {
                    href: "/graphs",
                    label: "Chart",
                    icon: <BarChart3 size={20} />,
                },
            ],
        },
        {
            title: "DATA",
            items: [
                { href: "/", label: "Overview", icon: <Calendar size={20} /> }, // TO DO: Make Overview a dorpdown
                {
                    href: "/upload",
                    label: "Upload Data",
                    icon: <Upload size={20} />,
                },
                {
                    href: "/settings",
                    label: "Settings",
                    icon: <Settings size={20} />,
                },
            ],
        },
    ];

    return (
        <aside className="h-screen bg-white border-r border-gray-200 flex flex-col justify-between w-56 flex-shrink-0">
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
                                    const isActive = pathname === item.href;

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`
                                                flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                                                ${
                                                    isActive
                                                        ? "text-black font-semibold"
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
                                })}
                            </nav>
                        </div>
                    ))}
                </div>
            </div>

            <div className="px-4 py-5 flex items-center gap-3">
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
