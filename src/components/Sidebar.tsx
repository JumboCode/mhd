/***************************************************************
 *
 *                Sidebar.tsx
 *
 *         Author: Justin
 *           Date: 11/19/2025
 *
 *        Summary: Sidebar UI component that expands upon hover
 *
 **************************************************************/

"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    Map,
    BarChart3,
    Table2,
    Calendar,
    Upload,
    Settings,
} from "lucide-react";
import { useExpanded } from "@/context/ExpandedContext";

export default function Sidebar() {
    const { isExpanded, setIsExpanded } = useExpanded();

    const sections = [
        {
            title: "VISUALISATIONS",
            items: [
                { href: "/map", label: "Map", icon: <Map size={20} /> },
                {
                    href: "/chart",
                    label: "Chart",
                    icon: <BarChart3 size={20} />,
                },
                { href: "/table", label: "Table", icon: <Table2 size={20} /> },
            ],
        },
        {
            title: "DATA",
            items: [
                { href: "/", label: "Overview", icon: <Calendar size={20} /> },
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
        <motion.aside
            className="fixed top-0 left-0 h-screen bg-white border-r border-gray-200 flex flex-col justify-between"
            animate={{ width: isExpanded ? 224 : 72 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            <div className="flex-1 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-center">
                    <motion.h1
                        animate={{ opacity: isExpanded ? 1 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <img
                            src="/images/logo.png"
                            alt="Logo"
                            className="w-20 h-12"
                        />
                    </motion.h1>
                </div>

                <div className="mt-4 px-3">
                    {sections.map((section) => (
                        <div key={section.title} className="mb-5">
                            <motion.p
                                className="text-xs font-semibold text-gray-400 mb-2 px-2 overflow-hidden whitespace-nowrap"
                                animate={{ opacity: isExpanded ? 1 : 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                {section.title}
                            </motion.p>

                            <nav className="flex flex-col space-y-1">
                                {section.items.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-900 transition-colors"
                                    >
                                        <div className="flex items-center justify-center w-6">
                                            {item.icon}
                                        </div>
                                        <motion.span
                                            className="text-sm font-medium overflow-hidden whitespace-nowrap"
                                            animate={{
                                                opacity: isExpanded ? 1 : 0,
                                            }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            {item.label}
                                        </motion.span>
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    ))}
                </div>
            </div>
            {/* Account name and picture */}
            <div className="px-4 py-5 border-t border-gray-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                    <img
                        src="/images/profile.png"
                        alt="Profile"
                        className="w-full h-full object-cover"
                    />
                </div>
                <motion.span
                    className="text-sm font-medium text-gray-700 overflow-hidden whitespace-nowrap"
                    animate={{ opacity: isExpanded ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    Admin Name
                </motion.span>
            </div>
        </motion.aside>
    );
}
