/***************************************************************
 *
 *         /src/lib/pdf/components/FiltersBox.tsx
 *
 *         "Applied Filters" rounded grey card.
 *
 **************************************************************/

import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { COLORS } from "../theme";

export type FilterDetail = {
    label: string;
    values: string[];
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
    },
    line: {
        fontFamily: "DM Sans",
        fontSize: 10,
        color: COLORS.TEXT_SECONDARY,
        lineHeight: 1.35,
    },
});

export function FiltersBox({ filters }: { filters: FilterDetail[] }) {
    if (!filters || filters.length === 0) return null;

    return (
        <View style={styles.wrap} wrap={false}>
            <Text style={styles.heading}>Applied Filters</Text>
            <View style={styles.card}>
                {filters.map(({ label, values }, i) => (
                    <Text key={i} style={styles.line}>
                        {label}: {values.join(", ")}
                    </Text>
                ))}
            </View>
        </View>
    );
}
