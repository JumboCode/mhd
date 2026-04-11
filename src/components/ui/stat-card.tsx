"use client";

import * as React from "react";
import NextLink from "next/link";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

/**
 * Generates an SVG path string for a sparkline from data points.
 * Uses simple linear interpolation - no external dependencies.
 */
function generateSparklinePath(
    data: number[],
    width: number,
    height: number,
    padding: number = 4,
): string {
    if (data.length < 2) return "";

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const xStep = (width - padding * 2) / (data.length - 1);

    const points = data.map((value, index) => {
        const x = padding + index * xStep;
        const y =
            height - padding - ((value - min) / range) * (height - padding * 2);
        return `${x},${y}`;
    });

    return `M ${points.join(" L ")}`;
}

/**
 * Internal sparkline component - renders a subtle line graph
 */
function Sparkline({
    data,
    strokeColor = "rgb(251 146 60 / 0.3)",
    fillColor = "rgb(251 146 60 / 0.10)",
    className,
}: {
    data: number[];
    strokeColor?: string;
    fillColor?: string;
    className?: string;
}) {
    const path = generateSparklinePath(data, 100, 100, 0);

    if (!path) return null;

    const fillPath = `${path} L 100,100 L 0,100 Z`;

    return (
        <svg
            viewBox="0 0 100 100"
            className={cn("absolute inset-0 h-full w-full", className)}
            preserveAspectRatio="none"
            aria-hidden="true"
        >
            <path d={fillPath} fill={fillColor} stroke="none" />
            <path
                d={path}
                fill="none"
                stroke={strokeColor}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
            />
        </svg>
    );
}

/**
 * Internal trend indicator - shows up/down arrow with percentage
 */
function TrendIndicator({
    value,
    className,
}: {
    value: number;
    className?: string;
}) {
    const isPositive = value >= 0;

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 text-sm font-medium",
                isPositive ? "text-green-600" : "text-red-600",
                className,
            )}
        >
            {isPositive ? (
                <TrendingUp className="h-5 w-5" />
            ) : (
                <TrendingDown className="h-5 w-5" />
            )}
            {Math.abs(value).toFixed(1)}%
        </span>
    );
}

export interface StatCardProps {
    /** Label displayed above the value */
    label: string;
    /** The main value to display */
    value: number | string;
    /** Icon to display next to the label */
    icon?: React.ElementType;
    /** Icon color (CSS variable or color value) - adds subtle entity tint */
    iconColor?: string;
    /** Historical data points for the sparkline (optional) */
    sparklineData?: number[];
    /** Sparkline stroke color */
    sparklineStroke?: string;
    /** Sparkline fill color */
    sparklineFill?: string;
    /** Percentage change to show with trend indicator (optional) */
    percentChange?: number;
    /** Whether to show the trend indicator (defaults to true if percentChange provided) */
    showTrend?: boolean;
    /** Layout variant */
    variant?: "default" | "with-aspect";
    /** Optional link URL – wraps the card in a Next.js Link */
    href?: string;
    /** Additional CSS classes */
    className?: string;
}

/**
 * StatCard - Displays a statistic with optional sparkline and trend indicator.
 *
 * Features:
 * - Tabular numbers for proper digit alignment
 * - Optional subtle sparkline background showing historical trend
 * - Optional trend indicator (up/down arrow with percentage)
 */
export function StatCard({
    label,
    value,
    icon: Icon,
    iconColor,
    sparklineData,
    sparklineStroke,
    sparklineFill,
    percentChange,
    showTrend = percentChange !== undefined,
    variant = "default",
    href,
    className,
}: StatCardProps) {
    const formattedValue =
        typeof value === "number"
            ? new Intl.NumberFormat("en-US").format(value)
            : value;

    const sharedClassName = cn(
        "relative flex flex-col items-center justify-center",
        "rounded-lg border border-border bg-card overflow-hidden",
        {
            "py-6 gap-5": variant === "default",
            "p-6 aspect-[247/138] gap-5": variant === "with-aspect",
        },
        href && "transition-colors hover:bg-accent/50 cursor-pointer",
        className,
    );

    const Wrapper = href
        ? (props: { children: React.ReactNode }) => (
              <NextLink href={href} className={sharedClassName}>
                  {props.children}
              </NextLink>
          )
        : (props: { children: React.ReactNode }) => (
              <div className={sharedClassName}>{props.children}</div>
          );

    return (
        <Wrapper>
            {/* Label */}
            <span
                className={cn(
                    "relative flex items-center gap-1.5 text-muted-foreground",
                    variant === "default" ? "text-xs" : "text-sm",
                )}
            >
                {Icon && (
                    <Icon
                        className="h-4 w-4"
                        style={iconColor ? { color: iconColor } : undefined}
                    />
                )}
                {label}
            </span>

            <div className="flex flex-col gap-1">
                {/* Value with optional trend */}
                <span className="tabular-nums text-5xl font-bold leading-none">
                    {formattedValue}
                </span>

                {showTrend && percentChange !== undefined && (
                    <TrendIndicator value={percentChange} />
                )}
            </div>

            {/* Sparkline background */}
            {sparklineData && sparklineData.length > 1 && (
                <Sparkline
                    data={sparklineData}
                    strokeColor={sparklineStroke}
                    fillColor={sparklineFill}
                />
            )}
        </Wrapper>
    );
}
