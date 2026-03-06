"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

type TabsContextValue = {
    activeTab: string;
    registerTab: (value: string, element: HTMLButtonElement | null) => void;
    tabRects: Map<string, DOMRect>;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

const Tabs = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>
>(({ value, defaultValue, onValueChange, ...props }, ref) => {
    const [activeTab, setActiveTab] = React.useState(
        value || defaultValue || "",
    );
    const [tabRects, setTabRects] = React.useState<Map<string, DOMRect>>(
        new Map(),
    );

    React.useEffect(() => {
        if (value !== undefined) {
            setActiveTab(value);
        }
    }, [value]);

    const handleValueChange = (newValue: string) => {
        setActiveTab(newValue);
        onValueChange?.(newValue);
    };

    const registerTab = React.useCallback(
        (tabValue: string, element: HTMLButtonElement | null) => {
            if (element) {
                setTabRects((prev) => {
                    const next = new Map(prev);
                    next.set(tabValue, element.getBoundingClientRect());
                    return next;
                });
            }
        },
        [],
    );

    return (
        <TabsContext.Provider value={{ activeTab, registerTab, tabRects }}>
            <TabsPrimitive.Root
                ref={ref}
                value={value}
                defaultValue={defaultValue}
                onValueChange={handleValueChange}
                {...props}
            />
        </TabsContext.Provider>
    );
});
Tabs.displayName = "Tabs";

const TabsList = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.List>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, children, ...props }, ref) => {
    const context = React.useContext(TabsContext);
    const listRef = React.useRef<HTMLDivElement>(null);
    const [indicatorStyle, setIndicatorStyle] = React.useState<{
        width: number;
        x: number;
    } | null>(null);

    React.useEffect(() => {
        if (!listRef.current || !context?.activeTab) return;

        const activeButton = listRef.current.querySelector(
            `[data-state="active"]`,
        ) as HTMLButtonElement | null;

        if (activeButton) {
            const listRect = listRef.current.getBoundingClientRect();
            const buttonRect = activeButton.getBoundingClientRect();
            setIndicatorStyle({
                width: buttonRect.width,
                x: buttonRect.left - listRect.left,
            });
        }
    }, [context?.activeTab]);

    return (
        <TabsPrimitive.List
            ref={(node) => {
                (
                    listRef as React.MutableRefObject<HTMLDivElement | null>
                ).current = node;
                if (typeof ref === "function") ref(node);
                else if (ref) ref.current = node;
            }}
            className={cn(
                "relative inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
                className,
            )}
            {...props}
        >
            {indicatorStyle && (
                <motion.span
                    className="absolute left-0 top-1 bottom-1 rounded-md bg-background shadow"
                    initial={false}
                    animate={{
                        width: indicatorStyle.width,
                        x: indicatorStyle.x,
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 1500,
                        damping: 60,
                    }}
                />
            )}
            {children}
        </TabsPrimitive.List>
    );
});
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, children, value, ...props }, ref) => {
    return (
        <TabsPrimitive.Trigger
            ref={ref}
            value={value}
            className={cn(
                "relative z-10 inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground",
                className,
            )}
            {...props}
        >
            {children}
        </TabsPrimitive.Trigger>
    );
});
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.Content
        ref={ref}
        className={cn(
            "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            className,
        )}
        {...props}
    />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
