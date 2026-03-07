import { cn } from "@/lib/utils";

interface KbdProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * Keyboard shortcut indicator component
 *
 * @example
 * <Kbd>B</Kbd>
 */
export function Kbd({ children, className }: KbdProps) {
    return (
        <kbd
            className={cn(
                "inline-flex h-5 min-w-5 items-center justify-center rounded bg-muted-foreground/15 px-1 font-mono text-[11px] font-medium text-muted-foreground",
                className,
            )}
        >
            {children}
        </kbd>
    );
}
