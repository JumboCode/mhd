import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { COLORS } from "../theme";

export type HeatmapLegendData = {
    colors: string[];
    startLabel: string;
    endLabel: string;
};

const styles = StyleSheet.create({
    wrap: {
        marginTop: 10,
    },
    heading: {
        fontFamily: "DM Sans",
        fontSize: 12,
        color: COLORS.TEXT_PRIMARY,
        marginBottom: 4,
    },
    card: {
        backgroundColor: COLORS.FILTER_BOX_BG,
        borderColor: COLORS.LIGHT_GRAY,
        borderWidth: 0.6,
        borderRadius: 3,
        paddingVertical: 6,
        paddingHorizontal: 8,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    label: {
        fontFamily: "DM Sans",
        fontSize: 10,
        color: COLORS.TEXT_SECONDARY,
    },
    bar: {
        flexDirection: "row",
        height: 10,
        flex: 1,
        borderRadius: 2,
        overflow: "hidden",
    },
    strip: {
        flex: 1,
        height: "100%",
    },
});

export function HeatmapLegendPdf({ legend }: { legend: HeatmapLegendData }) {
    return (
        <View style={styles.wrap} wrap={false}>
            <Text style={styles.heading}>Legend</Text>
            <View style={styles.card}>
                <Text style={styles.label}>{legend.startLabel}</Text>
                <View style={styles.bar}>
                    {legend.colors.map((color, i) => (
                        <View
                            key={i}
                            style={[styles.strip, { backgroundColor: color }]}
                        />
                    ))}
                </View>
                <Text style={styles.label}>{legend.endLabel}</Text>
            </View>
        </View>
    );
}
