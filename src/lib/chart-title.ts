/**
 * Pure functions for generating chart titles.
 */

import { measuredAsLabels, groupByLabels } from "@/lib/compute-chart-data";

export { measuredAsLabels, groupByLabels };

export type ActiveFilters = {
    schools: number;
    cities: number;
    projectTypes: number;
    divisions?: number;
    schoolTypes?: number;
    regions?: number;
    implementationTypes?: number;
    hasTeacherYearsFilter: boolean;
    onlyGatewaySchools: boolean;
};

/**
 * Generate a dynamic chart title based on current configuration.
 */
export function generateChartTitle(
    chartType: string,
    measuredAs: string,
    groupBy: string,
    yearStart: number,
    yearEnd: number,
    activeFilters: ActiveFilters,
): string {
    const chartTypeLabel = chartType === "bar" ? "Bar Chart" : "Line Chart";
    const measuredAsLabel = measuredAsLabels[measuredAs] || "Unknown Metric";
    const groupByLabel = groupByLabels[groupBy] || "None";

    const dateRange =
        yearStart === yearEnd ? `${yearStart}` : `${yearStart}-${yearEnd}`;

    let gateway = "";
    if (measuredAs === "total-school-count") {
        gateway = " Representing Gateway Cities";
    } else {
        gateway = "for Schools Representing Gateway Cities";
    }

    let mainTitle = `${chartTypeLabel} - ${measuredAsLabel} ${activeFilters.onlyGatewaySchools ? gateway : ""}`;

    if (groupBy !== "none") {
        mainTitle += ` by ${groupByLabel}`;
    }

    mainTitle += ` (${dateRange})`;

    const filterDetails: string[] = [];

    if (activeFilters.schools > 0) {
        filterDetails.push(
            `${activeFilters.schools} school${activeFilters.schools > 1 ? "s" : ""}`,
        );
    }
    if (activeFilters.cities > 0) {
        filterDetails.push(
            `${activeFilters.cities} cit${activeFilters.cities > 1 ? "ies" : "y"}`,
        );
    }
    if (activeFilters.projectTypes > 0) {
        filterDetails.push(
            `${activeFilters.projectTypes} project type${activeFilters.projectTypes > 1 ? "s" : ""}`,
        );
    }
    if (activeFilters.divisions && activeFilters.divisions > 0) {
        filterDetails.push(
            `${activeFilters.divisions} division${activeFilters.divisions > 1 ? "s" : ""}`,
        );
    }
    if (activeFilters.schoolTypes && activeFilters.schoolTypes > 0) {
        filterDetails.push(
            `${activeFilters.schoolTypes} school type${activeFilters.schoolTypes > 1 ? "s" : ""}`,
        );
    }
    if (activeFilters.regions && activeFilters.regions > 0) {
        filterDetails.push(
            `${activeFilters.regions} region${activeFilters.regions > 1 ? "s" : ""}`,
        );
    }
    if (
        activeFilters.implementationTypes &&
        activeFilters.implementationTypes > 0
    ) {
        filterDetails.push(
            `${activeFilters.implementationTypes} implementation type${activeFilters.implementationTypes > 1 ? "s" : ""}`,
        );
    }
    if (activeFilters.hasTeacherYearsFilter) {
        filterDetails.push("teacher filter applied");
    }

    if (filterDetails.length > 0) {
        mainTitle += ` • Filtered: ${filterDetails.join(", ")}`;
    }

    return mainTitle;
}
