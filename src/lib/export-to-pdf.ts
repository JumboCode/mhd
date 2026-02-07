/***************************************************************
 *
 *         /src/lib/export-to-pdf.ts
 *
 *         Author: Will and Justin
 *         Date: 2/1/2025
 *
 *        Summary: Export an svg graph as a pdf
 **************************************************************/

import React from "react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

export async function downloadGraph(
    svgRef: React.RefObject<SVGSVGElement | null>,
) {
    const newSVG = getClonedSvg(svgRef);
    if (!newSVG) return;

    // Get SVG dimensions from viewBox or attributes with fallbacks
    const viewBox = newSVG.getAttribute("viewBox");
    let svgWidth = 1000;
    let svgHeight = 400;
    let aspectRatio = svgHeight / svgWidth;

    if (viewBox) {
        const viewBoxValues = viewBox.split(" ");
        svgWidth = parseFloat(viewBoxValues[2]) || 1000;
        svgHeight = parseFloat(viewBoxValues[3]) || 400;
    } else {
        const width = newSVG.getAttribute("width");
        const height = newSVG.getAttribute("height");
        if (width) svgWidth = parseFloat(width) || 1000;
        if (height) svgHeight = parseFloat(height) || 400;
    }

    aspectRatio = svgHeight / svgWidth;

    // Adds the svg element to the page temporarily (offscreen)
    const wrapper = document.createElement("div");
    wrapper.style.position = "fixed";
    wrapper.style.left = "-9999px";
    wrapper.style.top = "-9999px";
    wrapper.style.width = `${svgWidth}px`;
    wrapper.style.height = `${svgHeight}px`;
    wrapper.appendChild(newSVG);
    document.body.append(wrapper);

    const canvas = await html2canvas(wrapper, {
        backgroundColor: "#fff",
        scale: 2,
    });

    const pdf = new jsPDF();
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdfWidth * aspectRatio;

    // Add image with proper dimensions that match PDF width while preserving aspect ratio
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
