/***************************************************************
 *
 *         /src/lib/pdf/charts/BarChartPdf.tsx
 *
 *         Vector bar chart for @react-pdf documents. Mirrors the
 *         layout of src/components/charts/BarGraph.tsx but renders
 *         entirely with @react-pdf/renderer SVG primitives in
 *         real chart-space coordinates (no preserveAspectRatio
 *         hacks, no fontScale).
 *
 **************************************************************/

import {
    G,
    Line,
    Path,
    StyleSheet,
    Svg,
    Text as SvgText,
    Text,
    View,
} from "@react-pdf/renderer";
import { max, scaleBand, scaleLinear } from "d3";
import {
    type ChartDataset,
    CHART_COLORS,
} from "@/components/charts/chartTypes";
import { COLORS, getEntityColorPdf } from "../theme";

export type BarChartPdfProps = {
    dataset: ChartDataset[];
    yAxisLabel: string;
    xAxisLabel?: string;
    legendTitle?: string;
    width: number;
    height: number;
};

const FONT = "DM Sans";

const styles = StyleSheet.create({
    container: { width: "100%" },
    legendRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        marginTop: 4,
    },
    legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
    legendSwatch: { width: 7, height: 7, borderRadius: 1 },
    legendText: {
        fontFamily: FONT,
        fontSize: 8,
        color: COLORS.MUTED_GRAY,
    },
    legendTitle: {
        fontFamily: FONT,
        fontSize: 8,
        color: COLORS.TEXT_PRIMARY,
        width: "100%",
        marginTop: 2,
    },
});

export default function BarChartPdf({
    dataset,
    yAxisLabel,
    xAxisLabel,
    legendTitle,
    width,
    height,
}: BarChartPdfProps) {
    if (dataset.length === 0 || dataset.every((d) => d.data.length === 0)) {
        return null;
    }

    const allXValues = Array.from(
        new Set(dataset.flatMap((ds) => ds.data.map((d) => String(d.x)))),
    );
    const maxY = max(dataset.flatMap((ds) => ds.data.map((d) => d.y))) ?? 0;

    const yScaleProbe = scaleLinear().domain([0, maxY]).nice();
    const yTicks = yScaleProbe.ticks(6).filter((t) => Number.isInteger(t));
    const yTickMaxLen = yTicks
        .reduce((a, b) => Math.max(a, b), 0)
        .toLocaleString().length;

    // Margins (pt)
    const mTop = 6;
    const mRight = 8;
    const mBottom = 32;
    const mLeft = Math.max(28, 14 + yTickMaxLen * 4);

    const innerW = width - mLeft - mRight;
    const innerH = height - mTop - mBottom;

    const outerScale = scaleBand()
        .domain(allXValues)
        .range([0, innerW])
        .padding(0.25);
    const innerScale = scaleBand()
        .domain(dataset.map((ds) => ds.label))
        .range([0, outerScale.bandwidth()])
        .padding(dataset.length > 1 ? 0.05 : 0);
    const yScale = scaleLinear().domain([0, maxY]).range([innerH, 0]).nice();

    const getColor = (i: number): string => {
        if (dataset.length === 1) {
            const c = getEntityColorPdf(yAxisLabel);
            if (c) return c;
        }
        return CHART_COLORS[i % CHART_COLORS.length];
    };

    const cornerR = 2;
    const hasLegend = dataset.length > 1 || !!legendTitle;

    return (
        <View style={styles.container}>
            <Svg width={width} height={height}>
                {/* Y-axis title (rotated) */}
                <SvgText
                    x={6}
                    y={mTop + innerH / 2}
                    transform={`rotate(-90 6 ${mTop + innerH / 2})`}
                    fill={COLORS.MUTED_GRAY}
                    style={{ fontFamily: FONT, fontSize: 7 }}
                    textAnchor="middle"
                >
                    {yAxisLabel}
                </SvgText>

                {/* Y tick labels + grid lines */}
                {yTicks.map((tick, i) => {
                    const y = mTop + yScale(tick);
                    return (
                        <G key={`yt-${i}`}>
                            {i > 0 && (
                                <Line
                                    x1={mLeft}
                                    x2={mLeft + innerW}
                                    y1={y}
                                    y2={y}
                                    stroke={COLORS.GRID_LINE}
                                    strokeWidth={0.4}
                                    strokeDasharray="2 2"
                                />
                            )}
                            <SvgText
                                x={mLeft - 3}
                                y={y + 2.5}
                                fill={COLORS.MUTED_GRAY}
                                style={{ fontFamily: FONT, fontSize: 7 }}
                                textAnchor="end"
                            >
                                {tick.toLocaleString()}
                            </SvgText>
                        </G>
                    );
                })}

                {/* Bars */}
                {dataset.map((ds, si) =>
                    ds.data.map((point, pi) => {
                        const xKey = String(point.x);
                        const xPos =
                            mLeft +
                            (outerScale(xKey) ?? 0) +
                            (innerScale(ds.label) ?? 0);
                        const w = innerScale.bandwidth();
                        const yTop = mTop + yScale(point.y);
                        const barH = Math.max(0, mTop + yScale(0) - yTop);
                        if (barH === 0) return null;
                        const r = Math.min(cornerR, w / 2, barH);
                        const d = `M ${xPos},${yTop + barH} L ${xPos + w},${yTop + barH} L ${xPos + w},${yTop + r} Q ${xPos + w},${yTop} ${xPos + w - r},${yTop} L ${xPos + r},${yTop} Q ${xPos},${yTop} ${xPos},${yTop + r} Z`;
                        return (
                            <Path
                                key={`b-${si}-${pi}`}
                                d={d}
                                fill={getColor(si)}
                            />
                        );
                    }),
                )}

                {/* Axes (L-shape) */}
                <Path
                    d={`M ${mLeft} ${mTop} L ${mLeft} ${mTop + innerH} L ${mLeft + innerW} ${mTop + innerH}`}
                    fill="none"
                    stroke={COLORS.AXIS_LINE}
                    strokeWidth={0.6}
                />

                {/* X tick labels */}
                {allXValues.map((xVal, i) => {
                    const cx =
                        mLeft +
                        (outerScale(xVal) ?? 0) +
                        outerScale.bandwidth() / 2;
                    return (
                        <SvgText
                            key={`xt-${i}`}
                            x={cx}
                            y={mTop + innerH + 9}
                            fill={COLORS.MUTED_GRAY}
                            style={{ fontFamily: FONT, fontSize: 7 }}
                            textAnchor="middle"
                        >
                            {xVal}
                        </SvgText>
                    );
                })}

                {/* X axis title */}
                {xAxisLabel ? (
                    <SvgText
                        x={mLeft + innerW / 2}
                        y={height - 4}
                        fill={COLORS.MUTED_GRAY}
                        style={{ fontFamily: FONT, fontSize: 7 }}
                        textAnchor="middle"
                    >
                        {xAxisLabel}
                    </SvgText>
                ) : null}
            </Svg>

            {hasLegend ? (
                <View style={styles.legendRow}>
                    {legendTitle ? (
                        <Text style={styles.legendTitle}>{legendTitle}</Text>
                    ) : null}
                    {dataset.map((ds, i) => (
                        <View style={styles.legendItem} key={i}>
                            <View
                                style={[
                                    styles.legendSwatch,
                                    { backgroundColor: getColor(i) },
                                ]}
                            />
                            <Text style={styles.legendText}>{ds.label}</Text>
                        </View>
                    ))}
                </View>
            ) : null}
        </View>
    );
}
