/***************************************************************
 *
 *         /src/lib/pdf/components/Header.tsx
 *
 *         Page header: two logos, brand-red divider, date.
 *
 **************************************************************/

import { Image, StyleSheet, Text, View } from "@react-pdf/renderer";
import { COLORS } from "../theme";

const styles = StyleSheet.create({
    container: {
        marginBottom: 14,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    mhdLogo: {
        height: 28,
    },
    mhsLogo: {
        height: 28,
    },
    divider: {
        marginTop: 6,
        height: 1.6,
        backgroundColor: COLORS.BRAND_RED,
        width: "100%",
    },
    date: {
        marginTop: 4,
        textAlign: "right",
        fontFamily: "DM Sans",
        fontSize: 9,
        color: COLORS.MUTED_GRAY,
    },
});

function formatDate(): string {
    return new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

export function Header() {
    return (
        <View style={styles.container} fixed>
            <View style={styles.row}>
                {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf Image, not HTML */}
                <Image src="/images/mhd-logo-full.png" style={styles.mhdLogo} />
                {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf Image, not HTML */}
                <Image src="/images/mhs-logo-full.png" style={styles.mhsLogo} />
            </View>
            <View style={styles.divider} />
            <Text style={styles.date}>{formatDate()}</Text>
        </View>
    );
}
