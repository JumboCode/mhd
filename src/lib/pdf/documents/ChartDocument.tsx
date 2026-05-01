/***************************************************************
 *
 *         /src/lib/pdf/documents/ChartDocument.tsx
 *
 *         Multi-page PDF with one page per cart item. Chart items
 *         render as true vector via BarChartPdf / LineChartPdf;
 *         map items render as a raster <Image>.
 *
 **************************************************************/

import { Document, Image, Page, StyleSheet, View } from "@react-pdf/renderer";
import { type ChartDataset } from "@/components/charts/chartTypes";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Title } from "../components/Title";
import { FiltersBox, type FilterDetail } from "../components/FiltersBox";
import BarChartPdf from "../charts/BarChartPdf";
import LineChartPdf from "../charts/LineChartPdf";

export type ChartItem = {
    type: "chart";
    chartType: "bar" | "line";
    title: string;
    dataset: ChartDataset[];
    yAxisLabel: string;
    xAxisLabel?: string;
    legendTitle?: string;
    filterDetails?: FilterDetail[];
};

export type MapItem = {
    type: "map";
    title: string;
    imageDataUrl: string;
    filterDetails?: FilterDetail[];
};

export type ChartDocumentItem = ChartItem | MapItem;

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
    chartWrap: {
        marginTop: 6,
    },
    mapImage: {
        width: "100%",
        marginTop: 6,
    },
});

function ChartItemPage({ item }: { item: ChartItem }) {
    const chartW = CONTENT_WIDTH;
    const chartH = 360;
    return (
        <>
            <Title>{item.title}</Title>
            <View style={styles.chartWrap}>
                {item.chartType === "bar" ? (
                    <BarChartPdf
                        dataset={item.dataset}
                        yAxisLabel={item.yAxisLabel}
                        xAxisLabel={item.xAxisLabel ?? "Year"}
                        legendTitle={item.legendTitle}
                        width={chartW}
                        height={chartH}
                    />
                ) : (
                    <LineChartPdf
                        datasets={item.dataset}
                        yAxisLabel={item.yAxisLabel}
                        xAxisLabel={item.xAxisLabel ?? "Year"}
                        legendTitle={item.legendTitle}
                        width={chartW}
                        height={chartH}
                    />
                )}
            </View>
            <FiltersBox filters={item.filterDetails ?? []} />
        </>
    );
}

function MapItemPage({ item }: { item: MapItem }) {
    return (
        <>
            <Title>{item.title}</Title>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf Image, not HTML */}
            <Image src={item.imageDataUrl} style={styles.mapImage} />
            <FiltersBox filters={item.filterDetails ?? []} />
        </>
    );
}

export default function ChartDocument({
    items,
}: {
    items: ChartDocumentItem[];
}) {
    return (
        <Document>
            {items.map((item, i) => (
                <Page key={i} size="A4" style={styles.page}>
                    <Header />
                    {item.type === "chart" ? (
                        <ChartItemPage item={item} />
                    ) : (
                        <MapItemPage item={item} />
                    )}
                    <Footer />
                </Page>
            ))}
        </Document>
    );
}
