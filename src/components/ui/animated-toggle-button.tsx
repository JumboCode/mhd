"use client";

import * as React from "react";
import { useState } from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const variants = {
    initial: { opacity: 0, scale: 0.25, filter: "blur(4px)" },
    visible: { opacity: 1, scale: 1, filter: "blur(0px)" },
};

interface AnimatedToggleButtonProps extends Omit<ButtonProps, "children"> {
    /** Content shown in the default state */
    defaultContent: React.ReactNode;
    /** Content shown after activation (for `duration` ms) */
    activeContent: React.ReactNode;
    /** How long the active state lasts in ms (default: 2000) */
    duration?: number;
    /** Called when clicked (before toggling) */
    onClick?: () => void;
}

const AnimatedToggleButton = React.forwardRef<
    HTMLButtonElement,
    AnimatedToggleButtonProps
>(
    (
        { defaultContent, activeContent, duration = 2000, onClick, ...props },
        ref,
    ) => {
        const [isActive, setIsActive] = useState(false);

        const handleClick = () => {
            if (isActive) return;
            onClick?.();
            setIsActive(true);
            setTimeout(() => setIsActive(false), duration);
        };

        return (
            <MotionConfig
                transition={{ type: "spring", duration: 0.3, bounce: 0 }}
            >
                <Button
                    ref={ref}
                    {...props}
                    onClick={handleClick}
                    className={cn("relative overflow-hidden", props.className)}
                >
                    <AnimatePresence initial={false} mode="popLayout">
                        <motion.span
                            key={isActive ? "active" : "default"}
                            variants={variants}
                            initial="initial"
                            animate="visible"
                            exit="initial"
                            className="flex items-center gap-2"
                        >
                            {isActive ? activeContent : defaultContent}
                        </motion.span>
                    </AnimatePresence>
                </Button>
            </MotionConfig>
        );
    },
);
AnimatedToggleButton.displayName = "AnimatedToggleButton";

export { AnimatedToggleButton };
