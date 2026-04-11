import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-regular transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer active:scale-[0.97]",
    {
        variants: {
            variant: {
                default:
                    "relative overflow-hidden bg-gradient-to-t from-[#0F38B9] to-[#265AFF] text-primary-foreground shadow hover:brightness-110",
                destructive:
                    "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
                outline:
                    "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
                secondary:
                    "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
                ghost: "hover:bg-accent hover:text-accent-foreground",
                link: "text-primary underline-offset-4 hover:underline",
            },
            size: {
                default: "h-9 px-4 py-2",
                sm: "h-8 rounded-md px-3 text-xs",
                lg: "h-10 rounded-md px-8",
                icon: "h-9 w-9",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    },
);

export interface ButtonProps
    extends
        React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        { className, variant, size, asChild = false, children, ...props },
        ref,
    ) => {
        const Comp = asChild ? Slot : "button";
        const isDefault = variant === "default" || variant === undefined;
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            >
                {isDefault ? (
                    <>
                        <span className="absolute inset-[1px] rounded-[calc(var(--radius-md)-1px)] bg-primary" />
                        <span className="relative z-10 flex items-center gap-2">
                            {children}
                        </span>
                    </>
                ) : (
                    children
                )}
            </Comp>
        );
    },
);
Button.displayName = "Button";

export { Button, buttonVariants };
