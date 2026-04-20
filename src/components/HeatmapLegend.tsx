/***************************************************************
 *
 *                /components/GatewaySchools.tsx
 *
 *         Author: Justin
 *           Date: 3/1/2026
 *
 *        Summary: Component for displaying current gateway
 *                 schools and modifying this flag for each.
 *
 **************************************************************/
import React from "react";

interface HeatmapLegendProps {
    colors: string[];
    startLabel: string;
    endLabel: string;
    height?: number;
    width?: number;
}
export default function HeatmapLegend({
    colors,
    startLabel,
    endLabel,
    height = 28,
    width = 150,
}: HeatmapLegendProps) {
    const gradient = `linear-gradient(to right, ${colors.join(",")})`;

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: "transparent",
            }}
        >
            <span
                style={{ fontSize: 13, color: "#797979", whiteSpace: "nowrap" }}
            >
                {startLabel}
            </span>
            <div
                style={{
                    flex: 1,
                    width,
                    height,
                    borderRadius: 4,
                    background: gradient,
                }}
            />
            <span
                style={{ fontSize: 13, color: "#797979", whiteSpace: "nowrap" }}
            >
                {endLabel}
            </span>
        </div>
    );
}
