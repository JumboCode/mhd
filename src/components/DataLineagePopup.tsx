/***************************************************************
 *
 *                DataLineagePopup.tsx
 *
 *         Author: Zander
 *           Date: 4/19/2026
 *
 *        Summary: Dialog that explains how a chart metric is
 *                 computed — data origin pipeline and the effect
 *                 of each active filter, with per-year breakdowns.
 *
 **************************************************************/

"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    buildFilterPipeline,
    computeMetric,
    type YearRange,
    type FilterPipelineStep,
} from "@/lib/chart-data-pipeline";
import { type Project } from "@/lib/compute-chart-data";
import {
    type Filters,
    type MeasuredAs,
} from "@/components/GraphFilters/GraphFilters";

// ─── Internal types ───────────────────────────────────────────────────────────

type YearRow = {
    year: number;
    /** undefined on COUNT step — no prior stage to compare */
    input?: number;
    output: number;
    /** Override rendered text for the input cell (numeric input still used for delta) */
    inputDisplay?: string;
    /** Override rendered text for the output/value cell (numeric output still used for delta) */
    outputDisplay?: string;
    /** Explicit numeric delta; set when auto-derivation from input/output would be wrong */
    delta?: number;
    /** True when the year has no uploaded data at all (distinct from a filtered-to-zero result) */
    noData?: boolean;
};

type DataLineageItem = {
    title: string;
    description: string;
    expandable?: boolean;
    yearRows?: YearRow[];
    stepType?: "count" | "filter";
};

type DataLineageSection = {
    label: string;
    items: DataLineageItem[];
    color: "blue" | "orange";
};

export interface DataLineagePopupProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    filters: Filters;
    yearRange: YearRange;
    allProjects: Project[];
}

// ─── Style maps ───────────────────────────────────────────────────────────────

const borderColorClasses: Record<"blue" | "orange", string> = {
    blue: "border-blue-500",
    orange: "border-orange-400",
};

const lineColorClasses: Record<"blue" | "orange", string> = {
    blue: "bg-blue-200",
    orange: "bg-orange-200",
};

// ─── Static content maps ──────────────────────────────────────────────────────

const METRIC_TITLE: Record<MeasuredAs, string> = {
    "total-project-count": "Total Projects",
    "total-school-count": "Total Schools",
    "total-teacher-count": "Total Teachers",
    "total-student-count": "Total Students",
    "total-participating-student-count": "Total Participating Students",
    "total-competing-student-count": "Total Competing Students",
    "total-city-count": "Total Cities",
    "school-return-rate": "School Return Rate",
};

const METRIC_DESCRIPTION: Record<MeasuredAs, string> = {
    "total-project-count":
        "Counts the total number of project entries each year in the selected range.",
    "total-school-count":
        "Counts distinct schools with at least one project each year in the selected range.",
    "total-teacher-count":
        "Counts distinct teachers supervising at least one project each year.",
    "total-student-count":
        "Sums the number of students across all projects each year.",
    "total-participating-student-count":
        "Sums the number of students across all projects each year.",
    "total-competing-student-count":
        "Sums the number of students who competed at the school level each year.",
    "total-city-count":
        "Counts distinct cities/towns with at least one participating school each year.",
    "school-return-rate":
        "Percentage of schools in a given year that also participated in at least one prior year.",
};

const DATA_ORIGIN_STEPS: Record<MeasuredAs, DataLineageItem[]> = {
    "total-project-count": [
        {
            title: "CSV row uploaded",
            description:
                "Each row in the uploaded spreadsheet represents one project entry.",
        },
        {
            title: "Projects table",
            description:
                "Every row is stored as a project record with title, category, year, school, and teacher references.",
        },
    ],
    "total-school-count": [
        {
            title: 'CSV "schoolName" field',
            description:
                "Each uploaded row carries a school name identifying the participating school.",
        },
        {
            title: "Schools table (matched/created on upload)",
            description:
                "On upload, school names are fuzzy-matched to existing records or a new school entry is created.",
        },
        {
            title: "Projects table (schoolId FK)",
            description:
                "Each project row stores a foreign key back to the Schools table.",
        },
    ],
    "total-teacher-count": [
        {
            title: "CSV teacher name + email fields",
            description:
                "Each row carries the supervising teacher's name and email.",
        },
        {
            title: "Teachers table (deduplicated by email)",
            description:
                "Teachers are matched by email on upload so the same teacher is never double-counted.",
        },
        {
            title: "Projects table (teacherId FK)",
            description:
                "Each project row stores a foreign key back to the Teachers table.",
        },
    ],
    "total-student-count": [
        {
            title: 'CSV "numStudents" field',
            description:
                "Each project row in the CSV declares how many students worked on it.",
        },
        {
            title: "Projects table stores numStudents",
            description:
                "The student count is stored directly on the project record and summed at query time.",
        },
    ],
    "total-city-count": [
        {
            title: 'CSV "schoolTown" field',
            description:
                "Each row carries the city/town of the participating school.",
        },
        {
            title: "Schools table (town column)",
            description:
                "Town is stored on the school record and propagated to every project from that school.",
        },
        {
            title: "Projects table carries schoolTown via join",
            description:
                "At query time, project rows are joined to their school to retrieve the town value.",
        },
    ],
    "school-return-rate": [
        {
            title: 'CSV "schoolName" field',
            description:
                "Each uploaded row identifies the participating school.",
        },
        {
            title: "Schools table + full project history",
            description:
                "The return rate requires looking at every year of project data, not just the selected range.",
        },
        {
            title: "Prior-year participation lookup",
            description:
                "For each year, we find schools that participated that year, then check if they appear in any earlier year of the full dataset. Active filters do not affect the prior-year lookup — a school is 'returning' if it appeared in any prior year regardless of current filter scope.",
        },
    ],
};

const COUNT_STEP_TITLE: Record<MeasuredAs, string> = {
    "total-project-count": "COUNT(rows) per year",
    "total-school-count": "COUNT(DISTINCT schoolId) per year",
    "total-teacher-count": "COUNT(DISTINCT teacherId) per year",
    "total-student-count": "SUM(numStudents) per year",
    "total-city-count": "COUNT(DISTINCT schoolTown) per year",
    "school-return-rate": "returningSchools / totalSchools per year",
};

const COUNT_STEP_DESCRIPTION: Record<MeasuredAs, string> = {
    "total-project-count":
        "Raw project count for each year in the selected range, before any filters are applied.",
    "total-school-count":
        "Distinct schools with at least one project that year, before filters.",
    "total-teacher-count":
        "Distinct teachers with at least one project that year, before filters.",
    "total-student-count":
        "Sum of numStudents across all projects that year, before filters.",
    "total-city-count":
        "Distinct school towns with at least one project that year, before filters.",
    "school-return-rate":
        "For each year: schools with a project that year AND at least one project in any prior year ÷ total schools that year. Before filters.",
};

const METRIC_UNIT_LABEL: Record<MeasuredAs, string> = {
    "total-project-count": "Projects",
    "total-school-count": "Schools",
    "total-teacher-count": "Teachers",
    "total-student-count": "Students",
    "total-city-count": "Cities",
    "school-return-rate": "Return Rate",
};

const GROUP_BY_DESCRIPTIONS: Record<string, string> = {
    "none": "No grouping — all data shown as a single series.",
    "region": "Projects split by the school's geographic region.",
    "school-type": "Projects split by school type (public, charter, etc.).",
    "division":
        "Projects split by division (Junior, Senior, Young Historian). Note: a school offering multiple divisions will contribute to each relevant series, so division totals can exceed the overall project count.",
    "implementation-model":
        "Projects split by the school's implementation model.",
    "project-type": "Projects split by project category/type.",
    "gateway-school":
        "Projects split by whether the school is a Gateway city school.",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function yearsInRange(start: number, end: number): number[] {
    const result: number[] = [];
    for (let y = start; y <= end; y++) result.push(y);
    return result;
}

function metricForYear(
    projects: Project[],
    year: number,
    metric: MeasuredAs,
    allProjects: Project[],
): number {
    const yearProjects = projects.filter((p) => p.year === year);
    if (yearProjects.length === 0) return 0;
    return computeMetric(yearProjects, metric, allProjects);
}

function fmtValue(value: number, metric: MeasuredAs): string {
    if (metric === "school-return-rate") {
        return `${(value * 100).toFixed(1)}%`;
    }
    return value.toLocaleString();
}

// ─── Build sections ───────────────────────────────────────────────────────────

function buildLineageSections(
    allProjects: Project[],
    filters: Filters,
    yearRange: YearRange,
): DataLineageSection[] {
    const metric = filters.measuredAs;
    const years = yearsInRange(yearRange.start, yearRange.end);

    // ── DATA ORIGIN ──
    const originSteps: DataLineageItem[] = [...DATA_ORIGIN_STEPS[metric]];

    // Pre-build set of years that have any data at all
    const yearsWithData = new Set(allProjects.map((p) => p.year));

    // Expandable raw-count step (unfiltered, scoped to year range)
    const countYearRows: YearRow[] = years.map((year) => {
        if (!yearsWithData.has(year)) return { year, output: 0, noData: true };

        const yearProjects = allProjects.filter((p) => p.year === year);

        if (metric === "school-return-rate") {
            const schoolsThisYear = new Set(
                yearProjects.map((p) => p.schoolId),
            );
            const returning = new Set(
                allProjects
                    .filter(
                        (x) => schoolsThisYear.has(x.schoolId) && x.year < year,
                    )
                    .map((p) => p.schoolId),
            );
            const total = schoolsThisYear.size;
            const rate = total > 0 ? returning.size / total : 0;
            return {
                year,
                output: rate,
                outputDisplay: `${returning.size} ÷ ${total} = ${(rate * 100).toFixed(1)}%`,
            };
        }

        return {
            year,
            output: metricForYear(allProjects, year, metric, allProjects),
        };
    });

    originSteps.push({
        title: `${COUNT_STEP_TITLE[metric]}: ${yearRange.start}–${yearRange.end}`,
        description: COUNT_STEP_DESCRIPTION[metric],
        expandable: true,
        stepType: "count",
        yearRows: countYearRows,
    });

    // ── ACTIVE FILTERS & GROUPING ──
    // Year-range is excluded here — it's already represented by the COUNT step above.
    const allPipelineSteps: FilterPipelineStep[] = buildFilterPipeline(
        allProjects,
        filters,
        yearRange,
    );
    const pipeline = allPipelineSteps.filter((s) => s.id !== "year-range");

    const filterItems: DataLineageItem[] = pipeline.map((step) => {
        // Use the full pipeline index to find the correct preceding step.
        // Year-range is always index 0, so fullIdx >= 1 for all visible steps.
        const fullIdx = allPipelineSteps.findIndex((s) => s.id === step.id);
        const prevProjects = allPipelineSteps[fullIdx - 1].projects;

        const yearRows: YearRow[] = years.map((year) => {
            if (!yearsWithData.has(year))
                return { year, input: 0, output: 0, noData: true };

            if (metric === "school-return-rate") {
                const prevYearProjs = prevProjects.filter(
                    (p) => p.year === year,
                );
                const currYearProjs = step.projects.filter(
                    (p) => p.year === year,
                );

                const schoolsBefore = new Set(
                    prevYearProjs.map((p) => p.schoolId),
                );
                const schoolsAfter = new Set(
                    currYearProjs.map((p) => p.schoolId),
                );

                const totalBefore = schoolsBefore.size;
                const totalAfter = schoolsAfter.size;

                const retBefore = new Set(
                    allProjects
                        .filter(
                            (x) =>
                                schoolsBefore.has(x.schoolId) && x.year < year,
                        )
                        .map((p) => p.schoolId),
                ).size;
                const retAfter = new Set(
                    allProjects
                        .filter(
                            (x) =>
                                schoolsAfter.has(x.schoolId) && x.year < year,
                        )
                        .map((p) => p.schoolId),
                ).size;

                const rateBefore =
                    totalBefore > 0 ? retBefore / totalBefore : 0;
                const rateAfter = totalAfter > 0 ? retAfter / totalAfter : 0;

                const deltaPp = rateAfter - rateBefore;

                return {
                    year,
                    input: rateBefore,
                    output: rateAfter,
                    delta: deltaPp,
                    inputDisplay: `${retBefore} ÷ ${totalBefore} = ${(rateBefore * 100).toFixed(1)}%`,
                    outputDisplay: `${retAfter} ÷ ${totalAfter} = ${(rateAfter * 100).toFixed(1)}%`,
                };
            }

            return {
                year,
                input: metricForYear(prevProjects, year, metric, allProjects),
                output: metricForYear(step.projects, year, metric, allProjects),
            };
        });

        const filterDescriptions: Record<string, string> = {
            "project-scope":
                filters.individualProjects && !filters.groupProjects
                    ? 'Only individual (non-team) projects — rows where "teamProject" is false.'
                    : 'Only group/team projects — rows where "teamProject" is true.',
            "gateway":
                'Only schools flagged as Gateway city schools — the "gatewaySchool" field equals "Gateway".',
            "school": `Limited to ${filters.selectedSchools.length} selected school${filters.selectedSchools.length > 1 ? "s" : ""}: ${filters.selectedSchools.slice(0, 3).join(", ")}${filters.selectedSchools.length > 3 ? "…" : ""}.`,
            "city": `Limited to schools in ${filters.selectedCities.length} selected cit${filters.selectedCities.length > 1 ? "ies" : "y"}: ${filters.selectedCities.slice(0, 3).join(", ")}${filters.selectedCities.length > 3 ? "…" : ""}.`,
            "project-type": `Limited to ${filters.selectedProjectTypes.length} selected type${filters.selectedProjectTypes.length > 1 ? "s" : ""}: ${filters.selectedProjectTypes.slice(0, 3).join(", ")}${filters.selectedProjectTypes.length > 3 ? "…" : ""}.`,
            "teacher-years": `Only projects supervised by teachers whose total participation years across all data is ${filters.teacherYearsOperator === "between" ? `between ${filters.teacherYearsValue} and ${filters.teacherYearsValue2}` : `${filters.teacherYearsOperator} ${filters.teacherYearsValue}`}.`,
        };

        return {
            title: step.label,
            description: filterDescriptions[step.id] ?? step.label,
            expandable: true,
            stepType: "filter",
            yearRows,
        };
    });

    // Group-by (non-expandable — describes series split, not row filtering)
    if (filters.groupBy !== "none") {
        filterItems.push({
            title: `Grouped by: ${filters.groupBy}`,
            description:
                GROUP_BY_DESCRIPTIONS[filters.groupBy] ??
                `Data split by ${filters.groupBy}.`,
        });
    }

    const sections: DataLineageSection[] = [
        { label: "DATA ORIGIN", color: "blue", items: originSteps },
    ];
    if (filterItems.length > 0) {
        sections.push({
            label: "ACTIVE FILTERS & GROUPING",
            color: "orange",
            items: filterItems,
        });
    }
    return sections;
}

// ─── YearRows ─────────────────────────────────────────────────────────────────

function YearRows({
    rows,
    metric,
    stepType,
}: {
    rows: YearRow[];
    metric: MeasuredAs;
    stepType: "count" | "filter";
}) {
    const th =
        "px-2 py-1.5 text-left text-[11px] font-medium text-muted-foreground whitespace-nowrap";
    const td = "px-2 py-1.5 font-mono tabular-nums text-xs";

    return (
        <div className="mt-1 -ml-2 w-full border-l-2 border-border pl-3 overflow-x-auto">
            <table className="w-full border-collapse text-xs">
                <thead>
                    <tr className="bg-muted border-b border-border">
                        <th className={th}>Year</th>
                        {stepType === "count" ? (
                            <th className={cn(th, "text-center")}>
                                Unfiltered {METRIC_UNIT_LABEL[metric]}
                            </th>
                        ) : (
                            <>
                                <th className={cn(th, "text-center")}>
                                    Initial
                                </th>
                                <th className={cn(th, "text-center")}>
                                    Filtered
                                </th>
                                <th className={cn(th, "text-center")}>Δ</th>
                            </>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => {
                        if (row.noData) {
                            const ndCell = (
                                <td
                                    className={cn(
                                        td,
                                        "text-center text-muted-foreground italic",
                                    )}
                                >
                                    n.d.
                                </td>
                            );
                            const dashCell = (
                                <td
                                    className={cn(
                                        td,
                                        "text-center text-muted-foreground",
                                    )}
                                >
                                    —
                                </td>
                            );
                            return (
                                <tr
                                    key={row.year}
                                    className="border-b border-border/50 last:border-0"
                                >
                                    <td
                                        className={cn(
                                            td,
                                            "text-muted-foreground",
                                        )}
                                    >
                                        {row.year}
                                    </td>
                                    {ndCell}
                                    {stepType !== "count" && dashCell}
                                    {stepType !== "count" && dashCell}
                                </tr>
                            );
                        }

                        const delta =
                            row.delta !== undefined
                                ? row.delta
                                : row.input !== undefined
                                  ? row.output - row.input
                                  : null;

                        if (stepType === "count") {
                            return (
                                <tr
                                    key={row.year}
                                    className="border-b border-border/50 last:border-0 hover:bg-muted/50"
                                >
                                    <td
                                        className={cn(
                                            td,
                                            "text-muted-foreground",
                                        )}
                                    >
                                        {row.year}
                                    </td>
                                    <td
                                        className={cn(
                                            td,
                                            "text-center font-medium",
                                        )}
                                    >
                                        {row.outputDisplay ??
                                            fmtValue(row.output, metric)}
                                    </td>
                                </tr>
                            );
                        }

                        return (
                            <tr
                                key={row.year}
                                className="border-b border-border/50 last:border-0 hover:bg-muted/50"
                            >
                                <td className={cn(td, "text-muted-foreground")}>
                                    {row.year}
                                </td>
                                <td
                                    className={cn(
                                        td,
                                        "text-center text-muted-foreground",
                                    )}
                                >
                                    {row.inputDisplay ??
                                        fmtValue(row.input!, metric)}
                                </td>
                                <td
                                    className={cn(
                                        td,
                                        "text-center font-medium",
                                    )}
                                >
                                    {row.outputDisplay ??
                                        fmtValue(row.output, metric)}
                                </td>
                                <td className={cn(td, "text-center")}>
                                    {delta !== null && delta !== 0 ? (
                                        <span
                                            className={
                                                delta < 0
                                                    ? "text-red-500"
                                                    : "text-green-600"
                                            }
                                        >
                                            {delta > 0 ? "+" : ""}
                                            {metric === "school-return-rate"
                                                ? `${(delta * 100).toFixed(1)}pp`
                                                : delta.toLocaleString()}
                                        </span>
                                    ) : (
                                        <span className="text-muted-foreground">
                                            —
                                        </span>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

// ─── ExpandableStepItem ───────────────────────────────────────────────────────

function ExpandableStepItem({
    item,
    color,
    isLast,
    metric,
}: {
    item: DataLineageItem;
    color: "blue" | "orange";
    isLast: boolean;
    metric: MeasuredAs;
}) {
    const [open, setOpen] = useState(false);

    return (
        <div className="flex gap-3">
            <div className="flex flex-col items-center shrink-0">
                <div
                    className={`w-5 h-5 rounded-full border-2 bg-white mt-0.5 shrink-0 ${borderColorClasses[color]}`}
                />
                {!isLast && (
                    <div
                        className={`w-px flex-1 my-1 ${lineColorClasses[color]}`}
                    />
                )}
            </div>
            <div className={`${isLast ? "pb-0" : "pb-4"} flex-1 min-w-0`}>
                <button
                    className="flex items-start gap-1 w-full text-left cursor-pointer rounded-sm px-2 -mx-2 py-1.5 hover:bg-accent transition-colors group"
                    onClick={() => setOpen((v) => !v)}
                >
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold leading-snug">
                            {item.title}
                        </p>
                        <p className="text-sm text-muted-foreground mt-0.5 leading-snug">
                            {item.description}
                        </p>
                    </div>
                    {open ? (
                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5 transition-transform" />
                    ) : (
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5 transition-transform group-hover:translate-x-0.5" />
                    )}
                </button>
                {open && item.yearRows && (
                    <YearRows
                        rows={item.yearRows}
                        metric={metric}
                        stepType={item.stepType ?? "filter"}
                    />
                )}
            </div>
        </div>
    );
}

// ─── StepItem (non-expandable) ────────────────────────────────────────────────

function StepItem({
    item,
    color,
    isLast,
}: {
    item: DataLineageItem;
    color: "blue" | "orange";
    isLast: boolean;
}) {
    return (
        <div className="flex gap-3">
            <div className="flex flex-col items-center shrink-0">
                <div
                    className={`w-5 h-5 rounded-full border-2 bg-white mt-0.5 shrink-0 ${borderColorClasses[color]}`}
                />
                {!isLast && (
                    <div
                        className={`w-px flex-1 my-1 ${lineColorClasses[color]}`}
                    />
                )}
            </div>
            <div className={`${isLast ? "pb-0" : "pb-4"}`}>
                <p className="text-sm font-semibold leading-snug">
                    {item.title}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5 leading-snug">
                    {item.description}
                </p>
            </div>
        </div>
    );
}

// ─── DataLineagePopup ─────────────────────────────────────────────────────────

export function DataLineagePopup({
    open,
    onOpenChange,
    filters,
    yearRange,
    allProjects,
}: DataLineagePopupProps) {
    const metric = filters.measuredAs;
    const sections = buildLineageSections(allProjects, filters, yearRange);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="max-w-md max-h-[85vh] overflow-y-auto"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                        Data Lineage: {METRIC_TITLE[metric]}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        {METRIC_DESCRIPTION[metric]}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-5 mt-1">
                    {sections.map((section) => (
                        <div key={section.label}>
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                                {section.label}
                            </p>
                            <div>
                                {section.items.map((item, i) =>
                                    item.expandable ? (
                                        <ExpandableStepItem
                                            key={i}
                                            item={item}
                                            color={section.color}
                                            isLast={
                                                i === section.items.length - 1
                                            }
                                            metric={metric}
                                        />
                                    ) : (
                                        <StepItem
                                            key={i}
                                            item={item}
                                            color={section.color}
                                            isLast={
                                                i === section.items.length - 1
                                            }
                                        />
                                    ),
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
