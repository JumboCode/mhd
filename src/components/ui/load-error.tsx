import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface LoadErrorProps {
    message: string;
    onRetry?: () => void;
    className?: string;
}

export function LoadError({ message, onRetry, className }: LoadErrorProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center gap-4",
                "rounded-lg border border-border bg-card",
                "p-6",
                className,
            )}
        >
            <AlertCircle className="h-8 w-8 text-destructive" />
            <div className="text-center">
                <p className="font-semibold text-foreground">{message}</p>
            </div>
            {onRetry && (
                <Button onClick={onRetry} variant="outline" size="sm">
                    Try Again
                </Button>
            )}
        </div>
    );
}
