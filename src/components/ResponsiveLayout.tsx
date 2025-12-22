// Don't allow mobile users to access the app

"use client";

import { HeartCrack } from "lucide-react";
import { useEffect, useState } from "react";

export default function ResponsiveLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isMobile, setIsMobile] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 768); // md breakpoint is 768px
        };

        checkScreenSize();

        window.addEventListener("resize", checkScreenSize);

        return () => {
            window.removeEventListener("resize", checkScreenSize);
        };
    }, []);

    if (!mounted) {
        return <>{children}</>;
    }

    if (isMobile) {
        return (
            <div className="flex items-center justify-center h-screen w-screen bg-background">
                <div className="flex flex-col items-center gap-4">
                    <HeartCrack className="h-6 w-6 text-foreground" />
                    <p className="text-sm text-foreground text-center">
                        We&apos;re sorry, screens of this size are unsupported
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
