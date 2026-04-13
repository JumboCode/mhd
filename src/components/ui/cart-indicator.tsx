"use client";

import { useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface CartIndicatorProps {
    count: number;
    className?: string;
}

export function CartIndicator({ count, className }: CartIndicatorProps) {
    const prevCount = useRef(count);

    useEffect(() => {
        prevCount.current = count;
    }, [count]);

    const direction = count > prevCount.current ? -1 : 1; // -1 = from top, 1 = from bottom

    return (
        <AnimatePresence>
            {count > 0 && (
                <motion.span
                    initial={{ opacity: 0, filter: "blur(2px)", scale: 0.9 }}
                    animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                    exit={{ opacity: 0, filter: "blur(2px)" }}
                    transition={{ duration: 0.2, ease: [0.2, 0.8, 0.3, 1] }}
                    className={className}
                >
                    <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span
                            key={count}
                            initial={{ opacity: 0, y: direction * -3 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: direction * 3 }}
                            transition={{
                                duration: 0.2,
                                ease: [0.2, 0.8, 0.3, 1],
                            }}
                        >
                            {count}
                        </motion.span>
                    </AnimatePresence>
                </motion.span>
            )}
        </AnimatePresence>
    );
}
