"use client";

import { usePathname } from "next/navigation";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";
import {
    LayoutDashboard,
    Map,
    BarChart3,
    School,
    FileUp,
    Settings,
} from "lucide-react";

interface HelpSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const pages = [
    {
        value: "/",
        label: "Dashboard",
        icon: LayoutDashboard,
        description:
            "A high-level summary of MHD program data for a selected year.",
        features: [
            "Use the year selector to switch between available data years.",
            "View total counts for students, projects, and teachers across all schools.",
            "Trend lines show how each metric has changed year over year.",
            "Percent change indicators highlight growth or decline from the prior year.",
        ],
    },
    {
        value: "/map",
        label: "Map",
        icon: Map,
        description:
            "An interactive heatmap of participating schools across Massachusetts.",
        features: [
            "Switch the Counts dropdown between Students, Projects, and Teachers to change what the heatmap visualizes.",
            "Use the Year dropdown to select which year's data is displayed.",
            "Change Region View to zoom into Western, Central, Boston, Northeast, or Southeast MA.",
            "Open Filters to toggle school markers, the heatmap overlay, and region boundaries on or off.",
            "Enable Gateway Schools Only to restrict the view to gateway city schools.",
            "Click a school cluster or marker to see a popup with that school's data.",
            "Export saves the current map as a PDF. Copy link shares the exact view via URL.",
            "Add to cart to collect multiple figure (map and chart) configurations into a combined export.",
            "Keyboard: ⌘S opens the export dialog, ⌘P downloads a PDF directly.",
        ],
    },
    {
        value: "/chart",
        label: "Chart",
        icon: BarChart3,
        description:
            "Bar and line charts for exploring project data with detailed filtering.",
        features: [
            "Toggle between Bar and Line chart types using the tabs at the top.",
            "Open the Filters panel to narrow data by school, city, project type, or teacher experience.",
            "Use Group By to segment the chart by school, city, or project type.",
            "Measured As controls whether the y-axis shows raw counts or percentages.",
            "Export saves the current chart as a PDF. Copy link shares the current filter state via URL.",
            "Add to cart to collect multiple chart configurations for a combined export.",
            "Keyboard: ⌘S opens the export dialog.",
        ],
    },
    {
        value: "/schools",
        label: "Schools",
        icon: School,
        description:
            "A table of all participating schools and their data for a selected year.",
        features: [
            "Use the Year dropdown to select which year to display.",
            "Search by school name using the search bar.",
            "Columns show year-over-year comparisons — arrows indicate change from the prior year.",
            "Click any school row to open that school's detailed profile.",
            "Click column headers to sort by that metric.",
        ],
    },
    {
        value: "/upload",
        label: "Upload Data",
        icon: FileUp,
        description: "Import new program data by uploading a spreadsheet.",
        features: [
            "Drag and drop a spreadsheet file or click to browse.",
            "Preview the parsed data before confirming the upload.",
            "Validation errors are highlighted so you can correct the source file and re-upload.",
            "Confirm the upload to commit the new data to the database.",
        ],
    },
    {
        value: "/settings",
        label: "Settings",
        icon: Settings,
        description:
            "Admin tools for configuring program-wide data and school metadata.",
        features: [
            "Gateway Schools: add or remove schools designated as gateway city schools.",
            "Years of Data: control which years are available across the app.",
            "School Locations: edit the map coordinates for individual schools.",
            "Changes are not saved automatically — click Save to apply all edits.",
            "Navigating away with unsaved changes will prompt you to save or discard.",
        ],
    },
];

function pathnameToValue(pathname: string): string {
    if (pathname === "/") return "/";
    if (pathname.startsWith("/schools/")) return "/schools";
    const clean = pathname.replace(/\/$/, "");
    const match = pages.find(
        (p) => p.value !== "/" && clean.startsWith(p.value),
    );
    return match?.value ?? "/";
}

export function HelpSheet({ open, onOpenChange }: HelpSheetProps) {
    const pathname = usePathname();
    const defaultValue = pathnameToValue(pathname);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="flex flex-col w-80 sm:max-w-80 overflow-hidden"
            >
                <SheetHeader className="shrink-0">
                    <SheetTitle>Help</SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto -mx-6 px-6">
                    <Accordion
                        type="single"
                        collapsible
                        defaultValue={defaultValue}
                    >
                        {pages.map(
                            ({
                                value,
                                label,
                                icon: Icon,
                                description,
                                features,
                            }) => (
                                <AccordionItem key={value} value={value}>
                                    <AccordionTrigger>
                                        <span className="flex items-center gap-2">
                                            <Icon
                                                size={15}
                                                className="shrink-0 text-muted-foreground"
                                            />
                                            {label}
                                        </span>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <p className="text-muted-foreground mb-3">
                                            {description}
                                        </p>
                                        <ul className="space-y-2">
                                            {features.map((feature, i) => (
                                                <li
                                                    key={i}
                                                    className="flex gap-2"
                                                >
                                                    <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-muted-foreground/60 shrink-0" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </AccordionContent>
                                </AccordionItem>
                            ),
                        )}
                    </Accordion>
                </div>
            </SheetContent>
        </Sheet>
    );
}
