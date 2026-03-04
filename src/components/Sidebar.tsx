"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    Map,
    BarChart3,
    LayoutDashboard,
    School,
    FileUp,
    Settings as SettingsIcon,
    LogOut,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const { data: session } = authClient.useSession();

    // Magnetic hover effect state
    const navContainerRef = useRef<HTMLDivElement>(null);
    const [hoverStyle, setHoverStyle] = useState({
        top: 0,
        height: 0,
        opacity: 0,
    });

    const handleItemMouseEnter = useCallback(
        (e: React.MouseEvent<HTMLElement>) => {
            const target = e.currentTarget;
            const container = navContainerRef.current;
            if (!container) return;
            const containerRect = container.getBoundingClientRect();
            const targetRect = target.getBoundingClientRect();
            setHoverStyle({
                top: targetRect.top - containerRect.top,
                height: targetRect.height,
                opacity: 1,
            });
        },
        [],
    );

    const handleNavMouseLeave = useCallback(() => {
        setHoverStyle((prev) => ({ ...prev, opacity: 0 }));
    }, []);

    const handleSignOut = async () => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push("/signin");
                },
            },
        });
    };

    const sections = [
        {
            title: "ANALYSIS",
            items: [
                {
                    href: "/map",
                    label: "Map",
                    icon: <Map size={20} />,
                },
                {
                    href: "/chart",
                    label: "Chart",
                    icon: <BarChart3 size={20} />,
                },
            ],
        },
        {
            title: "DATA",
            items: [
                {
                    href: "/",
                    label: "Dashboard",
                    icon: <LayoutDashboard size={20} />,
                },
                {
                    href: "/schools",
                    label: "Schools",
                    icon: <School size={20} />,
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
    ];

    return (
        <aside className="h-full bg-card border-r border-border flex flex-col justify-between w-56 flex-shrink-0">
            <div className="flex-1 overflow-hidden">
                <div className="px-6 py-5 flex items-center justify-center">
                    <h1>
                        <Image
                            src="/images/logo.png"
                            alt="Logo"
                            width={80}
                            height={40}
                            priority
                        />
                    </h1>
                </div>

                <div
                    className="mt-4 px-3 relative"
                    ref={navContainerRef}
                    onMouseLeave={handleNavMouseLeave}
                >
                    {/* Magnetic hover highlight */}
                    <div
                        className="absolute left-2 right-2 bg-accent rounded-lg pointer-events-none z-0"
                        style={{
                            top: hoverStyle.top,
                            height: hoverStyle.height,
                            opacity: hoverStyle.opacity,
                            transition:
                                "top 150ms ease-out, height 150ms ease-out, opacity 150ms ease-out",
                        }}
                    />

                    {sections.map((section) => (
                        <div key={section.title} className="mb-5 relative z-10">
                            <p className="text-xs font-semibold text-anti-brand-dark mb-2 px-2 overflow-hidden whitespace-nowrap">
                                {section.title}
                            </p>

                            <nav className="flex flex-col space-y-1">
                                {section.items.map((item) => {
                                    const isActive = pathname === item.href;

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onMouseEnter={handleItemMouseEnter}
                                            className={`
                                                flex items-center gap-3 px-3 py-2 rounded-lg transition-colors relative z-10
                                                ${
                                                    isActive
                                                        ? "font-semibold bg-accent"
                                                        : ""
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

            <div className="px-4 py-5 self-center flex items-center gap-3">
                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                    <PopoverTrigger asChild>
                        <button className="text-sm font-medium text-foreground overflow-hidden whitespace-nowrap hover:text-accent-foreground cursor-pointer">
                            {session?.user?.email || "Loading..."}
                        </button>
                    </PopoverTrigger>
                    <PopoverContent align="center" className="w-48 p-0">
                        <div className="flex flex-col space-y-2">
                            <button
                                onClick={handleSignOut}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent text-sm font-medium w-full text-left"
                            >
                                <LogOut size={16} />
                                Sign Out
                            </button>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        </aside>
    );
}
