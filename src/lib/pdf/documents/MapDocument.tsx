/***************************************************************
 *
 *         /src/lib/pdf/documents/MapDocument.tsx
 *
 *         PDF for a single MapLibre heatmap export. The map is
 *         a WebGL canvas and must remain raster.
 *
 **************************************************************/

import { Document, Image, Page, StyleSheet } from "@react-pdf/renderer";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Title } from "../components/Title";
import { FiltersBox, type FilterDetail } from "../components/FiltersBox";

const styles = StyleSheet.create({
    page: {
        paddingTop: 36,
        paddingBottom: 50,
        paddingHorizontal: 36,
        backgroundColor: "#ffffff",
        fontFamily: "DM Sans",
    },
    image: {
        width: "100%",
        marginTop: 6,
    },
});

export default function MapDocument({
    title,
    imageDataUrl,
    filterDetails,
}: {
    title: string;
    imageDataUrl: string;
    filterDetails?: FilterDetail[];
}) {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <Header />
                <Title>{title}</Title>
                {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf Image, not HTML */}
                <Image src={imageDataUrl} style={styles.image} />
                <FiltersBox filters={filterDetails ?? []} />
                <Footer />
            </Page>
        </Document>
    );
}
