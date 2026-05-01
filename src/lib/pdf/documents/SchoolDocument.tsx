/***************************************************************
 *
 *         /src/lib/pdf/documents/SchoolDocument.tsx
 *
 *         Two-page school report. Page 1: info + KPIs +
 *         pie chart with team-projects card. Page 2: 2x2
 *         line-chart grid + applied filters.
 *
 **************************************************************/

import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Title } from "../components/Title";
import { FiltersBox, type FilterDetail } from "../components/FiltersBox";
import { InfoCard, KpiRow, StatCard } from "../components/Cards";
import LineChartPdf from "../charts/LineChartPdf";
import PieChartPdf from "../charts/PieChartPdf";
import { COLORS } from "../theme";
import { type PieSlice } from "@/components/charts/chartTypes";

export type SchoolKPI = {
    label: string;
    value: string | number;
    percentChange: number | null;
};

export type SchoolDocumentInput = {
    schoolName: string;
    year: number | null;
    info: {
        town: string;
        region: string;
        division: string[];
        implementationModel: string;
        firstYear: string;
    };
    kpis: {
        projects: SchoolKPI;
        teachers: SchoolKPI;
        competing: SchoolKPI;
        participating: SchoolKPI;
    };
    seriesYears: (string | number)[];
    series: {
        competing: number[];
        participating: number[];
        teachers: number[];
        projects: number[];
    };
    pieSlices: PieSlice[];
    teamProjects: {
        teamCount: number;
        totalCount: number;
    };
};

const PAGE_WIDTH = 595.28;
const PADDING_TOP = 36;
const PADDING_BOTTOM = 50;
const PADDING_HORIZONTAL = 36;
const CONTENT_WIDTH = PAGE_WIDTH - PADDING_HORIZONTAL * 2;

const styles = StyleSheet.create({
    page: {
        paddingTop: PADDING_TOP,
        paddingBottom: PADDING_BOTTOM,
        paddingHorizontal: PADDING_HORIZONTAL,
        backgroundColor: "#ffffff",
        fontFamily: "DM Sans",
    },
    sectionHeading: {
        fontFamily: "DM Sans",
        fontSize: 12,
        color: COLORS.TEXT_PRIMARY,
        marginTop: 8,
        marginBottom: 4,
    },
    pieRow: {
        flexDirection: "row",
        gap: 8,
    },
    chartTitle: {
        fontFamily: "DM Sans",
        fontSize: 11,
        color: COLORS.TEXT_PRIMARY,
        marginBottom: 2,
    },
    yearNote: {
        fontFamily: "DM Sans",
        fontSize: 9,
        color: COLORS.MUTED_GRAY,
        marginBottom: 6,
    },
    chartGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    chartCell: {
        width: (CONTENT_WIDTH - 10) / 2,
        marginBottom: 8,
    },
});

function buildLineDataset(
    label: string,
    years: (string | number)[],
    values: number[],
) {
    return [
        {
            label,
            data: values.map((y, i) => ({ x: years[i], y })),
        },
    ];
}

export default function SchoolDocument({
    input,
}: {
    input: SchoolDocumentInput;
}) {
    const titleText =
        input.year !== null
            ? `School Report – ${input.schoolName} (${input.year})`
            : `School Report – ${input.schoolName}`;

    // Enrich pie slice labels with count + percentage so they're readable
    // in the static PDF (which has no hover tooltip).
    const totalSliceValue = input.pieSlices.reduce((s, x) => s + x.value, 0);
    const enrichedSlices = input.pieSlices.map((s) => {
        const pct =
            totalSliceValue > 0
                ? Math.round((s.value / totalSliceValue) * 100)
                : 0;
        return {
            ...s,
            label: `${s.label} — ${s.value} (${pct}%)`,
        };
    });

    const infoRows: [string, string][] = [
        ["Town", input.info.town ? `${input.info.town}, MA` : "—"],
        ["Region", input.info.region || "Unknown"],
        [
            "Division",
            input.info.division.length ? input.info.division.join(", ") : "—",
        ],
        ["Implementation Model", input.info.implementationModel || "—"],
        ["Data Since", input.info.firstYear || "—"],
    ];

    const total = input.teamProjects.totalCount;
    const team = input.teamProjects.teamCount;
    const hasProjects = total > 0;
    const pctTeam = hasProjects ? Math.round((team / total) * 100) : 0;

    // Year range note for page 2
    const yearVals = input.seriesYears
        .map((y) => Number(y))
        .filter((n) => Number.isFinite(n));
    const minYr = yearVals.length ? Math.min(...yearVals) : null;
    const maxYr = yearVals.length ? Math.max(...yearVals) : null;
    const firstYr = Number(input.info.firstYear);
    const showYearNote =
        minYr !== null &&
        maxYr !== null &&
        Number.isFinite(firstYr) &&
        firstYr < minYr;

    const trendCharts: { title: string; yLabel: string; values: number[] }[] = [
        {
            title: "Competing Students",
            yLabel: "Competing Students",
            values: input.series.competing,
        },
        {
            title: "Participating Students",
            yLabel: "Participating Students",
            values: input.series.participating,
        },
        {
            title: "Teachers",
            yLabel: "Teachers",
            values: input.series.teachers,
        },
        {
            title: "Projects",
            yLabel: "Projects",
            values: input.series.projects,
        },
    ];

    const filterDetails: FilterDetail[] = [
        { label: "School", values: [input.schoolName] },
    ];
    if (input.year !== null) {
        filterDetails.push({
            label: "Year",
            values: [String(input.year)],
        });
    }
    if (minYr !== null && maxYr !== null) {
        filterDetails.push({
            label: "Trend Range",
            values: [`${minYr}–${maxYr}`],
        });
    }

    const pieW = CONTENT_WIDTH * 0.62;
    const teamW = CONTENT_WIDTH - pieW - 8;
    const pieH = 170;

    const cellH = 200;

    return (
        <Document>
            {/* ---------- Page 1: Summary ---------- */}
            <Page size="A4" style={styles.page}>
                <Header />
                <Title>{titleText}</Title>

                <Text style={styles.sectionHeading}>School Info</Text>
                <InfoCard rows={infoRows} />

                <Text style={styles.sectionHeading}>Summary Stats</Text>
                <KpiRow
                    kpis={[
                        input.kpis.projects,
                        input.kpis.teachers,
                        input.kpis.competing,
                        input.kpis.participating,
                    ]}
                />

                <Text style={styles.sectionHeading}>
                    Project Type Distribution
                </Text>
                <View style={styles.pieRow}>
                    {input.pieSlices.length > 0 ? (
                        <PieChartPdf
                            slices={enrichedSlices}
                            width={pieW}
                            height={pieH}
                        />
                    ) : (
                        <StatCard
                            label="Project Types"
                            value="—"
                            sub="No project data"
                            height={pieH}
                        />
                    )}
                    <View style={{ width: teamW }}>
                        {hasProjects ? (
                            <StatCard
                                label="Team Projects"
                                value={`${pctTeam}%`}
                                sub={`${team} of ${total} projects`}
                                height={pieH}
                            />
                        ) : (
                            <StatCard
                                label="Team Projects"
                                value="—"
                                sub="No project data"
                                height={pieH}
                            />
                        )}
                    </View>
                </View>

                <Footer />
            </Page>

            {/* ---------- Page 2: Trends ---------- */}
            <Page size="A4" style={styles.page}>
                <Header />
                <Text
                    style={{
                        fontFamily: "DM Sans",
                        fontSize: 14,
                        color: COLORS.TEXT_PRIMARY,
                        marginBottom: 4,
                    }}
                >
                    Trends Over Time
                </Text>
                {showYearNote ? (
                    <Text style={styles.yearNote}>
                        Showing {minYr}–{maxYr}. Data available since {firstYr}{" "}
                        — see dashboard for full history.
                    </Text>
                ) : null}

                <View style={styles.chartGrid}>
                    {trendCharts.map((c, i) => (
                        <View key={i} style={styles.chartCell}>
                            <Text style={styles.chartTitle}>{c.title}</Text>
                            <LineChartPdf
                                datasets={buildLineDataset(
                                    c.yLabel,
                                    input.seriesYears,
                                    c.values,
                                )}
                                yAxisLabel={c.yLabel}
                                xAxisLabel="Year"
                                showPointLabels
                                width={(CONTENT_WIDTH - 10) / 2}
                                height={cellH}
                            />
                        </View>
                    ))}
                </View>

                <FiltersBox filters={filterDetails} />

                <Footer />
            </Page>
        </Document>
    );
}
