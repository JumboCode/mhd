"use client";

import { useState, useRef, useCallback, useEffect } from "react";
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
import { DEV_BYPASS, DEV_BYPASS_COOKIE } from "@/lib/dev-config"; // TO DO - REMOVE: dev auth bypass
import { DEV_SESSION_USER } from "@/lib/dev-session"; // TO DO - REMOVE: dev auth bypass
import { useUnsavedChanges } from "@/components/UnsavedChangesContext";

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const { data: authSession, isPending } = authClient.useSession();
    const { onNavigationAttempt } = useUnsavedChanges();
    // TO DO - REMOVE: dev auth bypass - show dev user when in dev mode with no real session
    const session =
        authSession ??
        (!isPending && DEV_BYPASS ? { user: DEV_SESSION_USER } : null);

    // Magnetic hover effect state
    const navContainerRef = useRef<HTMLDivElement>(null);
    const [selectorStyle, setSelectorStyle] = useState({
        top: 0,
        left: 0,
        height: 0,
        width: 0,
        opacity: 0,
    });

    const styleFromRect = useCallback(
        (targetRect: DOMRect, containerRect: DOMRect) => ({
            top: targetRect.top - containerRect.top,
            left: targetRect.left - containerRect.left,
            height: targetRect.height,
            width: targetRect.width,
            opacity: 1 as number,
        }),
        [],
    );

    const positionAtActive = useCallback(() => {
        const container = navContainerRef.current;
        if (!container) return;
        const activeLink = container.querySelector<HTMLElement>(
            '[data-active="true"]',
        );
        if (!activeLink) {
            setSelectorStyle((prev) => ({ ...prev, opacity: 0 }));
            return;
        }
        setSelectorStyle(
            styleFromRect(
                activeLink.getBoundingClientRect(),
                container.getBoundingClientRect(),
            ),
        );
    }, [styleFromRect]);

    useEffect(() => {
        positionAtActive();
    }, [pathname, positionAtActive]);

    const handleItemMouseEnter = useCallback(
        (e: React.MouseEvent<HTMLElement>) => {
            const target = e.currentTarget;
            const container = navContainerRef.current;
            if (!container) return;
            const containerRect = container.getBoundingClientRect();
            const targetRect = target.getBoundingClientRect();
            setSelectorStyle(styleFromRect(targetRect, containerRect));
        },
        [styleFromRect],
    );

    const handleNavMouseLeave = useCallback(() => {
        positionAtActive();
    }, [positionAtActive]);

    const handleSignOut = async () => {
        // TO DO - REMOVE: dev auth bypass - clear cookie and redirect when in dev mode
        if (DEV_BYPASS && !authSession) {
            document.cookie = `${DEV_BYPASS_COOKIE}=; path=/; max-age=0`;
            router.push("/signin");
            return;
        }

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
            title: "OVERVIEW",
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
            ],
        },
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
                        <Link href="/">
                            <Image
                                src="/images/logo.png"
                                alt="MHD Logo"
                                width={125}
                                height={125}
                                priority
                            />
                        </Link>
                    </h1>
                </div>

                <div
                    className="mt-4 px-3 relative"
                    ref={navContainerRef}
                    onMouseLeave={handleNavMouseLeave}
                >
                    {/* Sliding selector */}
                    <div
                        className="absolute bg-accent rounded-lg pointer-events-none z-0"
                        style={{
                            top: selectorStyle.top,
                            left: selectorStyle.left,
                            height: selectorStyle.height,
                            width: selectorStyle.width,
                            opacity: selectorStyle.opacity,
                            transition:
                                "top 150ms cubic-bezier(0.4, 0, 0.2, 1), left 350ms cubic-bezier(0.4, 0, 0.2, 1), height 350ms cubic-bezier(0.4, 0, 0.2, 1), width 350ms cubic-bezier(0.4, 0, 0.2, 1), opacity 350ms cubic-bezier(0.4, 0, 0.2, 1)",
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
                                            onClick={(e) => {
                                                e.preventDefault();
                                                onNavigationAttempt(item.href);
                                            }}
                                            data-active={
                                                isActive ? "true" : undefined
                                            }
                                            className={`
                                                    flex items-center gap-3 px-3 py-2 rounded-lg transition-colors relative z-10
                                                    ${isActive ? "font-semibold" : ""}
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
                        <button
                            suppressHydrationWarning
                            className="text-sm font-medium text-foreground overflow-hidden whitespace-nowrap hover:text-accent-foreground cursor-pointer"
                        >
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
