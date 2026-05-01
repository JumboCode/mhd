/***************************************************************
 *
 *         /src/lib/pdf/components/Footer.tsx
 *
 *         Page footer: divider, MHS link, page number.
 *         Rendered with `fixed` so it appears on every page,
 *         positioned absolutely at the bottom of the page.
 *
 **************************************************************/

import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { COLORS } from "../theme";

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        left: 36,
        right: 36,
        bottom: 18,
    },
    divider: {
        height: 0.6,
        backgroundColor: COLORS.LIGHT_GRAY,
        marginBottom: 6,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    text: {
        fontFamily: "DM Sans",
        fontSize: 9,
        color: COLORS.MUTED_GRAY,
    },
});

export function Footer() {
    return (
        <View style={styles.container} fixed>
            <View style={styles.divider} />
            <View style={styles.row}>
                <Text style={styles.text}>https://www.masshist.org/</Text>
                <Text
                    style={styles.text}
                    render={({ pageNumber, totalPages }) =>
                        `Page ${pageNumber} of ${totalPages}`
                    }
                />
            </View>
        </View>
    );
}
