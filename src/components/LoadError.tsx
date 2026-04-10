"use client";

import { AlertCircle, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LoadErrorProps = {
    message: string;
    onRetry: () => void;
    className?: string;
    compact?: boolean;
    heading?: string;
    retryLabel?: string;
    description?: string;
};

export default function LoadError({
    message,
    onRetry,
    className,
    compact = false,
    heading,
    retryLabel = "Retry",
    description = "Try again to reload this section.",
}: LoadErrorProps) {
    const title = heading ?? message;

    if (compact) {
        return (
            <div
                className={cn(
                    "flex w-full items-center gap-4 rounded-2xl border border-destructive/15 bg-[linear-gradient(135deg,rgba(239,68,68,0.08),rgba(255,255,255,0.96))] px-4 py-4 shadow-sm",
                    className,
                )}
            >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                    <AlertCircle className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1 text-left">
                    <p className="text-sm font-semibold text-foreground">
                        {title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {description}
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={onRetry}
                    className="gap-2 shrink-0"
                >
                    <RotateCcw className="h-4 w-4" />
                    {retryLabel}
                </Button>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "flex w-full flex-col items-center justify-center gap-5 rounded-[28px] border border-destructive/20 bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.08),rgba(255,255,255,0.98)_55%)] px-6 py-10 text-center shadow-sm",
                "min-h-[320px]",
                className,
            )}
        >
            <div className="flex max-w-xl flex-col items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                    <AlertCircle className="h-6 w-6" />
                </div>
                <p className="text-xl font-semibold text-foreground">{title}</p>
                <p className="max-w-md text-sm text-muted-foreground">
                    {description}
                </p>
            </div>

            <Button
                type="button"
                variant="outline"
                onClick={onRetry}
                className="gap-2"
            >
                <RotateCcw className="h-4 w-4" />
                {retryLabel}
            </Button>
        </div>
    );
}
