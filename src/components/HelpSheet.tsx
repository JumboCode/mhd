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

function OutlinedDot() {
    return (
        <span className="inline-block h-2 w-2 rounded-full border border-green-500 align-middle mx-0.5" />
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
            <>
                Use the year selector to switch between available data years. A{" "}
                <GreenDot /> filled green dot next to a year means data is
                available for that year.
            </>,
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
            "Change Region View to zoom into pre-set views of competition regions.",
            "Open Filters to toggle school markers, the heatmap overlay, and region boundaries on or off.",
            "Enable Gateway Schools Only to restrict the view to gateway city schools.",
            "Click a school marker to see a popup with that school's data. Click the View Profile button to redirect to that school's profile page.",
            "Export saves the current map as a PDF.",
            "Copy link shares the exact view and filter state via URL.",
            <>
                Add to cart to collect maps and charts for a combined export.
                The <CartBadge /> Cart button shows how many items you&apos;ve
                collected — click it to open the cart and initiate a bulk
                export.
            </>,
            "Use the ‹ or › arrow keys to switch between available years.",
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
            "Use the date range picker in the top right to set the timeframe. Choose from the past 3 or 5 years relative to the latest year of data, or set a custom year range.",
            "Open the Filters panel to narrow data by school, city, project type, teacher experience, and more. Filters are organized by type — you can select one value per filter type, and multiple filter types can be active at the same time.",
            "Measured As controls what the y-axis measures — use the dropdown to select from the available count and rate options.",
            "Use Group By to combine data points into common categories such as school, city, or project type.",
            "Export saves the current chart as a PDF.",
            "Copy link shares the current filter state via URL.",
            <>
                Add to cart to collect charts and maps for a combined export.
                The <CartBadge /> Cart button shows how many items you&apos;ve
                collected — click it to open the cart and initiate a bulk
                export.
            </>,
            "Keyboard: ⌘S opens the export dialog, ⌘P downloads a PDF directly, B switches to bar chart, L switches to line chart.",
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
            "Search by school name, city, or region using the search bar.",
            <>
                The # Students, # Teachers, and # Projects columns show
                year-over-year change:
                <TrendLegend />
            </>,
            "Use the ‹ or › arrow keys to switch between available years.",
            "Click any school name to open that school's detailed profile page.",
            "Click column headers to sort the table by that metric in ascending or descending order.",
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
                In the Year dropdown: a <GreenDot /> filled dot means the school
                participated that year; an <OutlinedDot /> outlined dot means
                data exists for that year but the school did not participate.
            </>,
            <>
                The three stat cards show projects, teachers, and students for
                the selected year with year-over-year trend indicators:
                <TrendLegend />
            </>,
            "The student count line graph shows enrollment history over the past 5 years. Click it to open the Chart page filtered to this school.",
            "The project type distribution pie chart breaks down projects by category for the selected year.",
            "School Location shows the school's pin on a map. Drag the pin to update its coordinates. Regions are automatically updated based on the new coordinates.",
            "The View and Edit Data table lists all project records for the selected year. Double-click any cell to edit it. Teacher changes apply globally across all of that teacher's projects.",
            "Double-click the school name at the top of the page to rename the school.",
            "Use the ⋮ menu to access Merge School, which combines this school's records with another school.",
        ],
    },
    {
        value: "/upload",
        label: "Upload Data",
        icon: FileUp,
        description:
            "A multi-step process for importing new yearly program data, broken into tabs.",
        features: [
            "Step 1 — Enter the year for the data being uploaded (new year or overwrite an existing year) and upload the student spreadsheet. A template is available to download. Drag and drop the file or click to browse.",
            "Step 2 — Validation checks the student spreadsheet format and data types. Any errors are highlighted so you can correct the source file and re-upload.",
            "Step 3 — Upload the school spreadsheet in the same way. Another template is available for this file as well.",
            "Step 4 — Validation checks the school spreadsheet, then schools are matched to their locations on the map based on previously known schools.",
            "Step 5 — Any schools whose locations could not be matched must be placed manually. Drag a pin onto the map for each unmatched school.",
            "Step 6 — Review a summary and confirm the upload to commit all data to the database.",
        ],
    },
    {
        value: "/settings",
        label: "Settings",
        icon: Settings,
        description:
            "Admin tools for configuring application-wide settings and school metadata.",
        features: [
            "Gateway Schools: add or remove schools designated as schools representing students from gateway cities.",
            "School Locations: edit the map coordinates for individual schools. Regions are automatically updated based on the new coordinates.",
            "Years of Data: delete or upload years of participation data across the app.",
            "Changes are not saved automatically — click Save to apply all edits.",
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
