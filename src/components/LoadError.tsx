"use client";

import { AlertCircle, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LoadErrorProps = {
    message: string;
    onRetry: () => void;
    className?: string;
    compact?: boolean;
};

export default function LoadError({
    message,
    onRetry,
    className,
    compact = false,
}: LoadErrorProps) {
    return (
        <div
            className={cn(
                "flex w-full flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-destructive/30 bg-destructive/5 text-center",
                compact ? "px-4 py-5" : "min-h-[320px] px-6 py-10",
                className,
            )}
        >
            <div className="flex max-w-xl flex-col items-center gap-2">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                    <AlertCircle className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-foreground">{message}</p>
                <p className="text-sm text-muted-foreground">
                    Try again to reload this section.
                </p>
            </div>

            <Button
                type="button"
                variant="outline"
                onClick={onRetry}
                className="gap-2"
            >
                <RotateCcw className="h-4 w-4" />
                Retry
            </Button>
        </div>
    );
}
