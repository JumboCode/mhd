/***************************************************************
 *
 *         /src/lib/school-export.tsx
 *
 *         Public entry point for the multi-page school report
 *         PDF. Backed by @react-pdf/renderer.
 *
 **************************************************************/

import { pdf } from "@react-pdf/renderer";
import { toast } from "sonner";
import SchoolDocument, {
    type SchoolDocumentInput,
    type SchoolKPI,
} from "./pdf/documents/SchoolDocument";
import { ensurePdfFontsRegistered } from "./pdf/theme";
import { deliverPdf } from "./pdf/output";

export type SchoolExportInput = SchoolDocumentInput;
export type { SchoolKPI };

export async function exportSchoolToPDF(
    input: SchoolExportInput,
    print = false,
): Promise<boolean> {
    ensurePdfFontsRegistered();
    try {
        const blob = await pdf(<SchoolDocument input={input} />).toBlob();
        const filename = `school-report-${input.schoolName}${
            input.year !== null ? `-${input.year}` : ""
        }`;
        deliverPdf(blob, filename, print);
        return true;
    } catch {
        toast.error("Failed to export school report");
        return false;
    }
}
