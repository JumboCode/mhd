/***************************************************************
 *
 *         /src/lib/exporttopdf.ts
 *
 *         Author: Will and Justin
 *         Date: 2/1/2025
 *
 *        Summary: Export an svg graph as a pdf
 **************************************************************/

import React, { ReactElement, SVGProps } from "react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

export async function downloadGraph(
    svgRef: React.RefObject<SVGSVGElement | null>,
) {
    const newSVG = getClonedSvg(svgRef);

    // Adds the svg element to the page temporarily
    const wrapper = document.createElement("div");
    if (newSVG != null) {
        wrapper.appendChild(newSVG);
    }

    document.body.append(wrapper);

    const canvas = await html2canvas(wrapper, {
        backgroundColor: "#fff",
        scale: 2,
    });

    const pdf = new jsPDF();

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    //Creates a jsPDF object with the following specifications
    pdf.addImage(canvas, "JPEG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("graph.pdf");

    document.body.removeChild(wrapper);
}

export function getClonedSvg(
    svgRef: React.RefObject<SVGSVGElement | null>,
): SVGSVGElement | null {
    const original = svgRef.current;
    if (!original) return null;

    //Creates and returns a clone of the svg element passed in
    const clone = original.cloneNode(true) as SVGSVGElement;

    return clone;
}
