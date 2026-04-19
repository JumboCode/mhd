"use client";

import { usePathname } from "next/navigation";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
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
    BookOpen,
    FileUp,
    Settings,
    TrendingUp,
    TrendingDown,
    Minus,
    ShoppingBasket,
} from "lucide-react";
import type { ReactNode } from "react";

interface HelpSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

// Small reusable inline indicator components
function GreenDot() {
    return (
        <span className="inline-block h-2 w-2 rounded-full bg-green-500 align-middle mx-0.5" />
    );
}

function TrendLegend() {
    return (
        <div className="mt-1.5 space-y-1.5 pl-1">
            <div className="flex items-center gap-2 text-green-600">
                <TrendingUp className="h-3.5 w-3.5 shrink-0" />
                <span>Increase from prior year</span>
            </div>
            <div className="flex items-center gap-2 text-red-600">
                <TrendingDown className="h-3.5 w-3.5 shrink-0" />
                <span>Decrease from prior year</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
                <Minus className="h-3.5 w-3.5 shrink-0" />
                <span>No change or no prior year data</span>
            </div>
        </div>
    );
}

function CartBadge() {
    return (
        <span className="relative inline-flex align-middle mx-0.5">
            <ShoppingBasket className="inline h-3.5 w-3.5" />
            <span className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 rounded-full bg-primary text-[8px] font-medium text-primary-foreground flex items-center justify-center leading-none">
                2
            </span>
        </span>
    );
}

interface Page {
    value: string;
    label: string;
    icon: React.ElementType;
    description: string;
    features: ReactNode[];
}

const pages: Page[] = [
    {
        value: "/",
        label: "Dashboard",
        icon: LayoutDashboard,
        description:
            "A high-level summary of MHD program data for a selected year.",
        features: [
            "Use the year selector to switch between available data years.",
            "View total counts for students, projects, teachers, and schools.",
            <>
                Each stat card shows a percentage change from the prior year:
                <TrendLegend />
            </>,
            "Click any stat card to jump to the Chart page filtered to that metric.",
            "The two line graphs show total projects and schools over the past 6 years.",
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
            <>
                In the Year dropdown, a <GreenDot /> filled green dot next to a
                year means data is available for that year.
            </>,
            "Change Region View to zoom into Western, Central, Boston, Northeast, or Southeast MA.",
            "Open Filters to toggle school markers, the heatmap overlay, and region boundaries on or off.",
            "Enable Gateway Schools Only to restrict the view to gateway city schools.",
            "Click a school cluster or marker to see a popup with that school's data.",
            "Export saves the current map as a PDF. Copy link shares the exact view via URL.",
            <>
                Add to cart to collect maps and charts for a combined export.
                The <CartBadge /> badge on the Cart button shows how many items
                you&apos;ve collected.
            </>,
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
            <>
                Add to cart to collect charts and maps for a combined export.
                The <CartBadge /> badge on the Cart button shows how many items
                you&apos;ve collected.
            </>,
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
            <>
                In the Year dropdown, a <GreenDot /> filled green dot means data
                is available for that year.
            </>,
            "Search by school name using the search bar.",
            <>
                The # Students, # Teachers, and # Projects columns show
                year-over-year change:
                <TrendLegend />
            </>,
            "Click any school row to open that school's detailed profile.",
            "Click column headers to sort the table by that metric.",
        ],
    },
    {
        value: "/schools/profile",
        label: "School Profile",
        icon: BookOpen,
        description:
            "A detailed view of a single school's data, history, and project records.",
        features: [
            <>
                In the Year dropdown, a <GreenDot /> filled green dot means the
                school participated that year. Years the school didn&apos;t
                participate in are grayed out and unselectable.
            </>,
            <>
                The three stat cards show projects, teachers, and students for
                the selected year with year-over-year trend indicators:
                <TrendLegend />
            </>,
            "The student count line graph shows enrollment history over the past 5 years. Click it to open the Chart page filtered to this school.",
            "The project type distribution pie chart breaks down projects by category for the selected year.",
            "School Location shows the school's pin on a map. Drag the pin to update its coordinates.",
            "The View and Edit Data table lists all project records for the selected year. Double-click any cell to edit it. Teacher changes apply globally across all of that teacher's projects.",
            "Double-click the school name at the top of the page to rename the school.",
            "Use the ⋮ menu to access Merge School, which combines this school's records with another school.",
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
    if (pathname.startsWith("/schools/")) return "/schools/profile";
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
                                                    <span className="leading-relaxed">
                                                        {feature}
                                                    </span>
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
