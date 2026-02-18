/***************************************************************
 *
 *         /src/lib/export-to-pdf.ts
 *
 *         Author: Will and Justin
 *         Date: 2/1/2025
 *
 *        Summary: Export an svg graph as a pdf
 **************************************************************/

import React, { Dispatch, SetStateAction } from "react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import logoImg from "../../public/images/logo.png";
import { toast } from "sonner";
import "../app/fonts/interstate-bold-normal";

export function downloadGraphs(cart: string[], filterNames: string[]) {
    // Displays toast when there are no images to export
    if (cart.length == 0) {
        toast.error("Cart is empty");
    }

    const pdf = new jsPDF();

    // Does process for each graph in the cart
    cart.forEach((canvas: string, idx: number) => {
        const img = new Image();
        img.src = canvas;

        // Date data for image
        const time = new Date();
        const year = String(time.getFullYear());
        const month = String(time.getMonth());
        const day = String(time.getDate());

        img.onload = () => {
            const imgWidth = pdf.internal.pageSize.getWidth();
            const imgHeight = (img.height / img.width) * imgWidth;

            pdf.setFont("interstate-bold", "normal");

            pdf.text(`${month}/${day}/${year}`, 170, 15);
            pdf.addImage(
                logoImg.src,
                "PNG",
                20,
                10,
                logoImg.width * 0.03,
                logoImg.height * 0.03,
            );

            pdf.text(filterNames[idx], 25, 50);

            pdf.addImage(
                canvas,
                "JPEG",
                10,
                55,
                imgWidth * 0.9,
                imgHeight * 0.9,
            );

            if (idx < cart.length - 1) pdf.addPage();

            if (idx === cart.length - 1) pdf.save("graph.pdf");
        };
    });
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

export async function addToCart(
    svgRef: React.RefObject<SVGSVGElement | null>,
    cart: string[],
    setCart: Dispatch<SetStateAction<string[]>>,
    filterNames: string[],
    setFilterNames: Dispatch<SetStateAction<string[]>>,
    filterName: string,
): Promise<void> {
    const newSVG = getClonedSvg(svgRef);
    if (!newSVG) return;

    // Get SVG dimensions from viewBox or attributes with fallbacks
    const viewBox = newSVG.getAttribute("viewBox");
    let svgWidth = 1000;
    let svgHeight = 400;

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

    // Updates cart and filter names
    setCart([...cart, canvas.toDataURL()]);
    setFilterNames([...filterNames, filterName]);

    document.body.removeChild(wrapper);
}

export async function downloadSingleGraph(
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

export function clearCart(
    setCart: Dispatch<SetStateAction<string[]>>,
    setFilterNames: Dispatch<SetStateAction<string[]>>,
) {
    // Resets cart and filter names
    setCart([]);
    setFilterNames([]);
}

export function deleteFromCart(
    cart: string[],
    setCart: Dispatch<SetStateAction<string[]>>,
    filterNames: string[],
    setFilterNames: Dispatch<SetStateAction<string[]>>,
    idx: number,
) {
    setCart(cart.filter((_, index) => index !== idx));
    setFilterNames(filterNames.filter((_, index) => index !== idx));
}
