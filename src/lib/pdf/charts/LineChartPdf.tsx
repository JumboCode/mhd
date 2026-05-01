/***************************************************************
 *
 *         /src/lib/pdf/charts/LineChartPdf.tsx
 *
 *         Vector line chart for @react-pdf documents. Mirrors
 *         src/components/charts/LineGraph.tsx but renders with
 *         @react-pdf SVG primitives.
 *
 **************************************************************/

import {
    Circle,
    Defs,
    G,
    Line,
    LinearGradient,
    Path,
    Stop,
    StyleSheet,
    Svg,
    Text as SvgText,
    Text,
    View,
} from "@react-pdf/renderer";
import { area as d3Area, extent, line as d3Line, max, scaleLinear } from "d3";
import {
    type ChartDataset,
    CHART_COLORS,
} from "@/components/charts/chartTypes";
import { COLORS, getEntityColorPdf } from "../theme";

export type LineChartPdfProps = {
    datasets: ChartDataset[];
    yAxisLabel: string;
    xAxisLabel?: string;
    legendTitle?: string;
    showPointLabels?: boolean;
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
    legendDot: { width: 7, height: 7, borderRadius: 3.5 },
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

export default function LineChartPdf({
    datasets,
    yAxisLabel,
    xAxisLabel,
    legendTitle,
    showPointLabels = false,
    width,
    height,
}: LineChartPdfProps) {
    const allPoints = datasets.flatMap((d) => d.data);
    if (allPoints.length === 0) return null;

    const xNums = allPoints
        .map((d) => Number(d.x))
        .filter((n) => Number.isFinite(n));
    const xExtent = extent(xNums) as [number, number];
    if (xExtent[0] === undefined || xExtent[0] === null) return null;

    const yMax = max(allPoints.map((d) => d.y)) ?? 10;
    const yScaleProbe = scaleLinear().domain([0, yMax]).nice();
    const yTicks = yScaleProbe.ticks(6).filter((t) => Number.isInteger(t));
    const yTickMaxLen = yTicks
        .reduce((a, b) => Math.max(a, b), 0)
        .toLocaleString().length;

    // Reserve extra headroom + right padding when point labels are shown so
    // the topmost / rightmost label doesn't get clipped by the SVG edge.
    const mTop = showPointLabels ? 14 : 6;
    const mRight = showPointLabels ? 16 : 8;
    const mBottom = 32;
    const mLeft = Math.max(28, 14 + yTickMaxLen * 4);

    const innerW = width - mLeft - mRight;
    const innerH = height - mTop - mBottom;

    const xScale = scaleLinear()
        .domain(xExtent)
        .range([mLeft, mLeft + innerW]);
    const yScale = scaleLinear()
        .domain([0, yMax])
        .range([mTop + innerH, mTop])
        .nice();

    const xTicks = xScale.ticks().filter((t) => Number.isInteger(t));

    const getColor = (i: number): string => {
        if (datasets.length === 1) {
            const c = getEntityColorPdf(yAxisLabel);
            if (c) return c;
        }
        return CHART_COLORS[i % CHART_COLORS.length];
    };

    const lineGen = d3Line<{ x: string | number; y: number }>()
        .x((d) => xScale(Number(d.x)))
        .y((d) => yScale(d.y));

    const areaGen = d3Area<{ x: string | number; y: number }>()
        .x((d) => xScale(Number(d.x)))
        .y0(mTop + innerH)
        .y1((d) => yScale(d.y));

    const hasLegend = datasets.length > 1 || !!legendTitle;
    const showAreas = datasets.length === 1;

    return (
        <View style={styles.container}>
            <Svg width={width} height={height}>
                <Defs>
                    {showAreas
                        ? datasets.map((ds, i) => (
                              <LinearGradient
                                  key={`grad-${i}`}
                                  id={`area-${i}`}
                                  x1="0"
                                  y1="0"
                                  x2="0"
                                  y2="1"
                              >
                                  <Stop
                                      offset="0%"
                                      stopColor={getColor(i)}
                                      stopOpacity={0.22}
                                  />
                                  <Stop
                                      offset="100%"
                                      stopColor={getColor(i)}
                                      stopOpacity={0}
                                  />
                              </LinearGradient>
                          ))
                        : null}
                </Defs>

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
                    const y = yScale(tick);
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

                {/* Area fills */}
                {showAreas
                    ? datasets.map((ds, i) => {
                          const a = areaGen(ds.data);
                          if (!a) return null;
                          return (
                              <Path
                                  key={`area-${i}`}
                                  d={a}
                                  fill={`url(#area-${i})`}
                              />
                          );
                      })
                    : null}

                {/* Lines */}
                {datasets.map((ds, i) => {
                    const d = lineGen(ds.data);
                    if (!d) return null;
                    return (
                        <Path
                            key={`line-${i}`}
                            d={d}
                            fill="none"
                            stroke={getColor(i)}
                            strokeWidth={1.2}
                        />
                    );
                })}

                {/* Dots */}
                {datasets.map((ds, si) =>
                    ds.data.map((p, pi) => (
                        <Circle
                            key={`dot-${si}-${pi}`}
                            cx={xScale(Number(p.x))}
                            cy={yScale(p.y)}
                            r={2}
                            fill={getColor(si)}
                        />
                    )),
                )}

                {/* Point labels (always above the dot) */}
                {showPointLabels
                    ? datasets.flatMap((ds, si) =>
                          ds.data.map((p, pi) => {
                              const cx = xScale(Number(p.x));
                              const leftEdge = mLeft;
                              const rightEdge = mLeft + innerW;
                              const anchor =
                                  cx <= leftEdge + 1
                                      ? "start"
                                      : cx >= rightEdge - 1
                                        ? "end"
                                        : "middle";
                              return (
                                  <SvgText
                                      key={`lab-${si}-${pi}`}
                                      x={cx}
                                      y={yScale(p.y) - 4}
                                      fill={COLORS.TEXT_PRIMARY}
                                      style={{ fontFamily: FONT, fontSize: 7 }}
                                      textAnchor={anchor}
                                  >
                                      {p.y.toLocaleString()}
                                  </SvgText>
                              );
                          }),
                      )
                    : null}

                {/* Axes (L-shape) */}
                <Path
                    d={`M ${mLeft} ${mTop} L ${mLeft} ${mTop + innerH} L ${mLeft + innerW} ${mTop + innerH}`}
                    fill="none"
                    stroke={COLORS.AXIS_LINE}
                    strokeWidth={0.6}
                />

                {/* X tick labels */}
                {xTicks.map((tick, i) => {
                    const isFirst = i === 0;
                    const isLast = i === xTicks.length - 1;
                    const cx = xScale(tick);
                    const anchor = isFirst
                        ? "start"
                        : isLast
                          ? "end"
                          : "middle";
                    return (
                        <SvgText
                            key={`xt-${i}`}
                            x={cx}
                            y={mTop + innerH + 9}
                            fill={COLORS.MUTED_GRAY}
                            style={{ fontFamily: FONT, fontSize: 7 }}
                            textAnchor={anchor}
                        >
                            {tick}
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
                    {datasets.map((ds, i) => (
                        <View style={styles.legendItem} key={i}>
                            <View
                                style={[
                                    styles.legendDot,
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
