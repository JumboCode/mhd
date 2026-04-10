"use client";

import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { Check, Copy } from "lucide-react";
import { forwardRef, useState } from "react";

import { cn } from "@/lib/utils";

const variants = {
    hidden: { opacity: 0, scale: 0.8, filter: "blur(2px)" },
    visible: { opacity: 1, scale: 1, filter: "blur(0px)" },
};

export type CopyButtonProps = Omit<
    React.ComponentPropsWithoutRef<"button">,
    "onClick"
> & {
    onCopy: () => boolean | Promise<boolean>;
};

export const CopyButton = forwardRef<HTMLButtonElement, CopyButtonProps>(
    function CopyButton({ onCopy, className, type = "button", ...props }, ref) {
        const [copied, setCopied] = useState(0);

        async function handleClick() {
            const ok = await Promise.resolve(onCopy());
            if (!ok) return;
            setCopied((n) => n + 1);
            setTimeout(() => setCopied((n) => n - 1), 1000);
        }

        return (
            <MotionConfig transition={{ duration: 0.15 }}>
                <button
                    ref={ref}
                    type={type}
                    className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-md border border-input bg-background text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                        className,
                    )}
                    onClick={handleClick}
                    {...props}
                >
                    <AnimatePresence mode="wait" initial={false}>
                        {copied ? (
                            <motion.span
                                key="check"
                                className="flex size-4 items-center justify-center"
                                variants={variants}
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                            >
                                <Check
                                    className="size-4 text-green-600"
                                    strokeWidth={2.5}
                                    aria-hidden
                                />
                            </motion.span>
                        ) : (
                            <motion.span
                                key="copy"
                                className="flex size-4 items-center justify-center"
                                variants={variants}
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                            >
                                <Copy className="size-4" aria-hidden />
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>
            </MotionConfig>
        );
    },
);
CopyButton.displayName = "CopyButton";
