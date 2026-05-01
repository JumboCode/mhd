/***************************************************************
 *
 *         /src/lib/pdf/charts/PieChartPdf.tsx
 *
 *         Vector donut chart + side legend for @react-pdf.
 *         Mirrors src/components/charts/PieChart.tsx.
 *
 **************************************************************/

import { G, Path, StyleSheet, Svg, Text, View } from "@react-pdf/renderer";
import { arc, pie, type PieArcDatum } from "d3";
import { CHART_COLORS, type PieSlice } from "@/components/charts/chartTypes";
import { COLORS } from "../theme";

export type PieChartPdfProps = {
    slices: PieSlice[];
    legendTitle?: string;
    width: number;
    height: number;
};

const FONT = "DM Sans";

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        backgroundColor: COLORS.FILTER_BOX_BG,
        borderColor: COLORS.LIGHT_GRAY,
        borderWidth: 0.6,
        borderRadius: 3,
        padding: 12,
    },
    legend: {
        flex: 1,
        flexDirection: "column",
        gap: 6,
    },
    legendTitle: {
        fontFamily: FONT,
        fontSize: 10,
        color: COLORS.TEXT_PRIMARY,
        marginBottom: 2,
    },
    legendRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    swatch: {
        width: 9,
        height: 9,
        borderRadius: 2,
    },
    legendText: {
        fontFamily: FONT,
        fontSize: 9,
        color: COLORS.TEXT_PRIMARY,
        flex: 1,
    },
});

type ResolvedSlice = PieSlice & { color: string };

export default function PieChartPdf({
    slices,
    legendTitle,
    width,
    height,
}: PieChartPdfProps) {
    if (slices.length === 0) return null;

    const resolved: ResolvedSlice[] = slices.map((s, i) => ({
        ...s,
        color: s.color ?? CHART_COLORS[i % CHART_COLORS.length],
    }));

    const pieSize = Math.min(height - 24, 130);
    const r = pieSize / 2;

    const pieLayout = pie<ResolvedSlice>()
        .sort(null)
        .value((d) => d.value)
        .padAngle(0.02);

    const arcGen = arc<PieArcDatum<ResolvedSlice>>()
        .innerRadius(r * 0.2)
        .outerRadius(r)
        .cornerRadius(4);

    const arcs = pieLayout(resolved);

    return (
        <View style={[styles.container, { width, minHeight: height }]}>
            <View style={{ width: pieSize, height: pieSize }}>
                <Svg width={pieSize} height={pieSize}>
                    <G transform={`translate(${r} ${r})`}>
                        {arcs.map((d, i) => (
                            <Path
                                key={i}
                                d={arcGen(d) ?? ""}
                                fill={d.data.color}
                            />
                        ))}
                    </G>
                </Svg>
            </View>

            <View style={styles.legend}>
                {legendTitle ? (
                    <Text style={styles.legendTitle}>{legendTitle}</Text>
                ) : null}
                {resolved.map((s, i) => (
                    <View style={styles.legendRow} key={i}>
                        <View
                            style={[
                                styles.swatch,
                                { backgroundColor: s.color },
                            ]}
                        />
                        <Text style={styles.legendText}>{s.label}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}
