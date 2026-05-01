/***************************************************************
 *
 *         /src/lib/pdf/output.ts
 *
 *         Helpers for handing a generated PDF blob to the browser:
 *         either trigger a download or open it in a new tab.
 *
 **************************************************************/

export function deliverPdf(blob: Blob, filename: string, print: boolean) {
    const url = URL.createObjectURL(blob);
    if (print) {
        window.open(url, "_blank");
        return;
    }
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    // Allow the browser to start the download before revoking.
    setTimeout(() => URL.revokeObjectURL(url), 5000);
}
