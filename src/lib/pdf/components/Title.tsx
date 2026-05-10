/***************************************************************
 *
 *         /src/lib/pdf/components/Title.tsx
 *
 **************************************************************/

import { StyleSheet, Text } from "@react-pdf/renderer";
import { COLORS } from "../theme";

const styles = StyleSheet.create({
    title: {
        fontFamily: "DM Sans",
        fontSize: 16,
        color: COLORS.TEXT_PRIMARY,
        marginBottom: 10,
    },
});

export function Title({ children }: { children: React.ReactNode }) {
    return <Text style={styles.title}>{children}</Text>;
}
