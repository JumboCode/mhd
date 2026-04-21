/***************************************************************
 *
 *         /src/lib/pdf-layout.ts
 *
 *         Shared PDF layout utilities for chart and heatmap
 *         exports. Provides consistent header, title, filter
 *         box, and footer rendering.
 *
 **************************************************************/

import jsPDF from "jspdf";
import logoImg from "../../public/images/mhd-logo-full.png";
import mhsLogoImg from "../../public/images/mhs-logo-full.png";
import "../app/fonts/DMSans-VariableFont_opsz,wght-normal";

export type FilterDetail = {
    label: string;
    values: string[];
};

export const PDF_FONT = "DMSans-VariableFont_opsz,wght";
export const PAGE_MARGIN = 15;
export const BRAND_RED: [number, number, number] = [175, 39, 47];
export const MUTED_GRAY: [number, number, number] = [110, 110, 110];
export const LIGHT_GRAY: [number, number, number] = [220, 220, 220];
export const FILTER_BOX_BG: [number, number, number] = [247, 247, 247];

/**
 * Draws the page header (logo, org name, date, red accent line).
 * Returns the Y coordinate just below the accent line.
 */
export function drawHeader(pdf: jsPDF): number {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = PAGE_MARGIN;

    const logoY = 10;

    const mhdScale = 0.022;
    const mhdW = logoImg.width * mhdScale;
    const mhdH = logoImg.height * mhdScale;

    const mhsTargetH = mhdH;
    const mhsScale = mhsTargetH / mhsLogoImg.height;
    const mhsW = mhsLogoImg.width * mhsScale;
    const mhsH = mhsTargetH;

    pdf.addImage(logoImg.src, "PNG", margin, logoY, mhdW, mhdH);
    pdf.addImage(
        mhsLogoImg.src,
        "PNG",
        pageWidth - margin - mhsW,
        logoY,
        mhsW,
        mhsH,
    );

    const lineY = logoY + Math.max(mhdH, mhsH) + 3;
    pdf.setDrawColor(...BRAND_RED);
    pdf.setLineWidth(0.8);
    pdf.line(margin, lineY, pageWidth - margin, lineY);

    pdf.setFont(PDF_FONT, "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(...MUTED_GRAY);
    const time = new Date();
    const dateStr = time.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
    pdf.text(dateStr, pageWidth - margin, lineY + 5, { align: "right" });

    pdf.setTextColor(0, 0, 0);
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.2);

    return lineY + 10;
}

/**
 * Draws the page title. Returns the Y coordinate just below it.
 */
export function drawTitle(pdf: jsPDF, title: string, startY: number): number {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = PAGE_MARGIN;

    pdf.setFont(PDF_FONT, "normal");
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);

    const wrapped = pdf.splitTextToSize(title, pageWidth - margin * 2);
    pdf.text(wrapped, margin, startY);

    return startY + wrapped.length * 7 + 4;
}

/**
 * Draws the "Applied Filters" section inside a styled box.
 * Handles pagination if the box would overflow the page.
 * Returns the Y coordinate just below the box.
 */
export function drawFilters(
    pdf: jsPDF,
    filterDetails: FilterDetail[] | undefined,
    startY: number,
): number {
    if (!filterDetails || filterDetails.length === 0) return startY;

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = PAGE_MARGIN;
    const boxWidth = pageWidth - margin * 2;
    const innerPadding = 4;
    const lineHeight = 5;
    const footerReserve = 20;

    let cursorY = startY;
    if (cursorY + 12 > pageHeight - footerReserve) {
        pdf.addPage();
        cursorY = drawHeader(pdf);
    }

    pdf.setFont(PDF_FONT, "normal");
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text("Applied Filters", margin, cursorY);
    cursorY += 4;

    pdf.setFontSize(10);
    const wrappedLines: string[] = [];
    filterDetails.forEach(({ label, values }) => {
        const text = `${label}: ${values.join(", ")}`;
        const wrapped = pdf.splitTextToSize(text, boxWidth - innerPadding * 2);
        wrappedLines.push(...wrapped);
    });

    const boxHeight = wrappedLines.length * lineHeight + innerPadding * 2;

    if (cursorY + boxHeight > pageHeight - footerReserve) {
        pdf.addPage();
        cursorY = drawHeader(pdf);
        pdf.setFont(PDF_FONT, "normal");
        pdf.setFontSize(12);
        pdf.text("Applied Filters", margin, cursorY);
        cursorY += 4;
        pdf.setFontSize(10);
    }

    pdf.setFillColor(...FILTER_BOX_BG);
    pdf.setDrawColor(...LIGHT_GRAY);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(margin, cursorY, boxWidth, boxHeight, 2, 2, "FD");

    pdf.setTextColor(40, 40, 40);
    let textY = cursorY + innerPadding + lineHeight - 1.5;
    wrappedLines.forEach((line) => {
        pdf.text(line, margin + innerPadding, textY);
        textY += lineHeight;
    });
    pdf.setTextColor(0, 0, 0);

    return cursorY + boxHeight + 6;
}

/**
 * Draws the footer (divider, URL, page number) on a single page.
 */
function drawFooter(pdf: jsPDF, pageNum: number, totalPages: number): void {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = PAGE_MARGIN;

    pdf.setDrawColor(...LIGHT_GRAY);
    pdf.setLineWidth(0.3);
    pdf.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);

    pdf.setFont(PDF_FONT, "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(...MUTED_GRAY);
    pdf.text("https://www.masshist.org/", margin, pageHeight - 7);
    pdf.text(
        `Page ${pageNum} of ${totalPages}`,
        pageWidth - margin,
        pageHeight - 7,
        { align: "right" },
    );
    pdf.setTextColor(0, 0, 0);
}

/**
 * Applies the footer to every page in the PDF. Must be called
 * after all content has been added so the total page count is known.
 */
export function applyFootersToAllPages(pdf: jsPDF): void {
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        drawFooter(pdf, i, totalPages);
    }
}
