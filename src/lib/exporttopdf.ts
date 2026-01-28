import React, { ReactElement, SVGProps } from "react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

export async function downloadGraph(
    svgRef: React.RefObject<SVGSVGElement | null>,
) {
    const newSVG = getClonedSvg(svgRef);

    //if (!newSVG) { console.log("SVG is empty"); return; }
    const wrapper = document.createElement("div");
    if (newSVG != null) {
        wrapper.appendChild(newSVG);
    }

    document.body.append(wrapper);

    const canvas = await html2canvas(wrapper, {
        backgroundColor: "#fff",
        scale: 2,
    });

    const graphData = canvas.toDataURL("image/png");

    const pdf = new jsPDF();

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(canvas, "JPEG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("graph.pdf");
}

export function getClonedSvg(
    svgRef: React.RefObject<SVGSVGElement | null>,
): SVGSVGElement | null {
    const original = svgRef.current;
    if (!original) return null;

    const clone = original.cloneNode(true) as SVGSVGElement;

    return clone;
}
