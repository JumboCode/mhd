import React, { ReactElement, SVGProps } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function downloadGraph(
    svgRef: React.RefObject<SVGSVGElement | null>,
) {
    const newSVG = getClonedSvg(svgRef);
    const wrapper = document.createElement("div");
    if (newSVG != null) {
        wrapper.appendChild(newSVG);
    }

    document.body.append(wrapper);

    const canvas = await html2canvas(wrapper, {
        backgroundColor: "#fff",
        scale: 2, // higher resolution
    });

    const graphData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
        orientation: "landscape",
        unit: "pt",
        format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(graphData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("graph.pdf");
}

export function getClonedSvg(
    svgRef: React.RefObject<SVGSVGElement | null>,
): SVGSVGElement | null {
    const original = svgRef.current;
    if (!original) return null;

    const clone = original.cloneNode(true) as SVGSVGElement;

    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");

    return clone;
}
