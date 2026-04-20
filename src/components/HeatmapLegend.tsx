/***************************************************************
 *
 *                /components/GatewaySchools.tsx
 *
 *         Author: Justin
 *           Date: 4/19/2026
 *
 *        Summary: Component for displaying the heatmap legend
 *
 **************************************************************/
import React from "react";

interface HeatmapLegendProps {
    colors: string[];
    startLabel: string;
    endLabel: string;
    squareSize?: number;
}
export default function HeatmapLegend({
    colors,
    startLabel,
    endLabel,
    squareSize = 24,
}: HeatmapLegendProps) {
    const gradient = `linear-gradient(to right, ${colors.join(",")})`;

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
            }}
        >
            <span
                style={{ fontSize: 13, color: "#676767", whiteSpace: "nowrap" }}
            >
                {startLabel}
            </span>
            <div style={{ display: "flex", gap: 4 }}>
                {colors.map((color, index) => (
                    <div
                        key={index}
                        style={{
                            width: squareSize,
                            height: squareSize,
                            backgroundColor: color,
                        }}
                    />
                ))}
            </div>
            <span
                style={{ fontSize: 13, color: "#676767", whiteSpace: "nowrap" }}
            >
                {endLabel}
            </span>
        </div>
    );
}
