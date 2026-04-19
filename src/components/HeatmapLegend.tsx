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
function HeatmapLegend({
    colors,
    startLabel,
    endLabel,
    height = 28,
    width = 320,
}: HeatmapLegendProps) {
    const gradient = 'linear-gradient(to right, ${colors.join(",")})';

    return (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13, color: "#888", whiteSpace: "nowrap" }}>
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
            <span style={{ fontSize: 13, color: "#888", whiteSpace: "nowrap" }}>
                {endLabel}
            </span>
        </div>
    );
}
