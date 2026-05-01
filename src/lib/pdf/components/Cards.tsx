/***************************************************************
 *
 *         /src/lib/pdf/components/Cards.tsx
 *
 *         InfoCard (school info two-column grid),
 *         KpiCard (number + trend %), and
 *         StatCard (centered big stat) used by the school report.
 *
 **************************************************************/

import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { COLORS } from "../theme";

const cardStyles = StyleSheet.create({
    base: {
        backgroundColor: COLORS.FILTER_BOX_BG,
        borderColor: COLORS.LIGHT_GRAY,
        borderWidth: 0.6,
        borderRadius: 3,
    },
});

/* ----------------------------- InfoCard -------------------------------- */

const infoStyles = StyleSheet.create({
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        paddingVertical: 6,
        paddingHorizontal: 8,
    },
    cell: {
        width: "50%",
        flexDirection: "row",
        paddingVertical: 3,
        paddingRight: 8,
    },
    label: {
        fontFamily: "DM Sans",
        fontSize: 10,
        color: COLORS.MUTED_GRAY,
        width: 105,
        paddingRight: 8,
    },
    value: {
        fontFamily: "DM Sans",
        fontSize: 10,
        color: COLORS.TEXT_PRIMARY,
        flex: 1,
    },
});

export function InfoCard({ rows }: { rows: [string, string][] }) {
    return (
        <View style={[cardStyles.base, infoStyles.grid]}>
            {rows.map(([k, v], i) => (
                <View style={infoStyles.cell} key={i}>
                    <Text style={infoStyles.label}>{k}</Text>
                    <Text style={infoStyles.value}>{v}</Text>
                </View>
            ))}
        </View>
    );
}

/* ----------------------------- KpiCard --------------------------------- */

const kpiStyles = StyleSheet.create({
    card: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 8,
        minHeight: 78,
    },
    label: {
        fontFamily: "DM Sans",
        fontSize: 8,
        color: COLORS.MUTED_GRAY,
        marginBottom: 6,
    },
    value: {
        fontFamily: "DM Sans",
        fontSize: 22,
        color: COLORS.TEXT_PRIMARY,
        marginBottom: 4,
    },
    trend: {
        fontFamily: "DM Sans",
        fontSize: 10,
    },
});

export type KpiCardProps = {
    label: string;
    value: string | number;
    percentChange: number | null;
};

function fmtPct(p: number | null): string {
    if (p === null) return "—";
    if (p === 0) return "—0.0%";
    const arrow = p > 0 ? "↑" : "↓";
    return `${arrow}${Math.abs(p).toFixed(1)}%`;
}

function pctColor(p: number | null): string {
    if (p === null || p === 0) return COLORS.MUTED_GRAY;
    if (p > 0) return COLORS.TREND_GREEN;
    return COLORS.TREND_RED;
}

export function KpiCard({ label, value, percentChange }: KpiCardProps) {
    return (
        <View style={[cardStyles.base, kpiStyles.card]}>
            <Text style={kpiStyles.label}>{label}</Text>
            <Text style={kpiStyles.value}>{String(value)}</Text>
            <Text style={[kpiStyles.trend, { color: pctColor(percentChange) }]}>
                {fmtPct(percentChange)}
            </Text>
        </View>
    );
}

export function KpiRow({ kpis }: { kpis: KpiCardProps[] }) {
    return (
        <View style={{ flexDirection: "row", gap: 6 }}>
            {kpis.map((k, i) => (
                <KpiCard key={i} {...k} />
            ))}
        </View>
    );
}

/* ----------------------------- StatCard -------------------------------- */

const statStyles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.FILTER_BOX_BG,
        borderColor: COLORS.LIGHT_GRAY,
        borderWidth: 0.6,
        borderRadius: 3,
        alignItems: "center",
        justifyContent: "center",
        padding: 12,
    },
    label: {
        fontFamily: "DM Sans",
        fontSize: 10,
        color: COLORS.MUTED_GRAY,
        marginBottom: 6,
    },
    value: {
        fontFamily: "DM Sans",
        fontSize: 26,
        color: COLORS.TEXT_PRIMARY,
        marginBottom: 4,
    },
    sub: {
        fontFamily: "DM Sans",
        fontSize: 9,
        color: COLORS.MUTED_GRAY,
    },
});

export function StatCard({
    label,
    value,
    sub,
    height,
}: {
    label: string;
    value: string;
    sub?: string;
    height?: number;
}) {
    return (
        <View style={height ? [statStyles.card, { height }] : statStyles.card}>
            <Text style={statStyles.label}>{label}</Text>
            <Text style={statStyles.value}>{value}</Text>
            {sub ? <Text style={statStyles.sub}>{sub}</Text> : null}
        </View>
    );
}
