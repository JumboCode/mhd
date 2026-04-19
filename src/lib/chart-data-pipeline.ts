/**
 * Pure functions for chart data transformation.
 * No React, no side effects.
 */

import { type Project } from "@/lib/compute-chart-data";
import { type ChartDataset } from "@/components/charts/chartTypes";
import {
    type Filters,
    type MeasuredAs,
    type GroupBy,
} from "@/components/GraphFilters/GraphFilters";

export type YearRange = {
    start: number;
    end: number;
};

/**
 * Pre-calculate how many years each teacher has participated.
 */
export function buildTeacherYearsMap(
    allProjects: Project[],
): Map<number, number> {
    const tempMap: Record<number, Set<number>> = {};
    for (const p of allProjects) {
        if (!tempMap[p.teacherId]) tempMap[p.teacherId] = new Set();
        tempMap[p.teacherId].add(p.year);
    }
    const result = new Map<number, number>();
    for (const [tId, yearsSet] of Object.entries(tempMap)) {
        result.set(Number(tId), yearsSet.size);
    }
    return result;
}

/**
 * Filter projects based on active filters and year range.
 */
export function filterProjects(
    allProjects: Project[],
    filters: Filters | null,
    yearRange: YearRange,
    teacherYearsMap: Map<number, number>,
): Project[] {
    if (!filters) return allProjects;

    return allProjects.filter((p) => {
        // Year range filter
        if (p.year < yearRange.start || p.year > yearRange.end) {
            return false;
        }

        // Individual vs Group Projects
        if (
            filters.individualProjects &&
            !filters.groupProjects &&
            p.teamProject
        )
            return false;
        if (
            filters.groupProjects &&
            !filters.individualProjects &&
            !p.teamProject
        )
            return false;

        // Selected Schools
        if (
            filters.selectedSchools.length > 0 &&
            !filters.selectedSchools.includes(p.schoolName)
        )
            return false;

        // Gateway schools filter
        if (filters.onlyGatewaySchools && p.gatewaySchool !== "Gateway") {
            return false;
        }

        // Selected Cities
        if (
            filters.selectedCities.length > 0 &&
            !filters.selectedCities.includes(p.schoolTown)
        )
            return false;

        // Selected Project Types
        if (
            filters.selectedProjectTypes.length > 0 &&
            !filters.selectedProjectTypes.includes(p.category)
        )
            return false;

        // Selected Divisions (schoolDivisions is an array; match if ANY overlap)
        if (filters.selectedDivisions && filters.selectedDivisions.length > 0) {
            const divs = p.schoolDivisions;
            if (!divs || divs.length === 0) {
                if (!filters.selectedDivisions.includes("Unassigned"))
                    return false;
            } else {
                const normalized = divs.map(normalizeDivision);
                const hasMatch = normalized.some((d) =>
                    filters.selectedDivisions.includes(d),
                );
                if (!hasMatch) return false;
            }
        }

        // Selected School Types
        if (
            filters.selectedSchoolTypes &&
            filters.selectedSchoolTypes.length > 0
        ) {
            const v = p.schoolSchoolType || "Unassigned";
            if (!filters.selectedSchoolTypes.includes(v)) return false;
        }

        // Selected Regions
        if (filters.selectedRegions && filters.selectedRegions.length > 0) {
            const v = p.schoolRegion || "Unassigned";
            if (!filters.selectedRegions.includes(v)) return false;
        }

        // Selected Implementation Types
        if (
            filters.selectedImplementationTypes &&
            filters.selectedImplementationTypes.length > 0
        ) {
            const v = p.schoolImplementationModel || "Unassigned";
            if (!filters.selectedImplementationTypes.includes(v)) return false;
        }

        // Teacher Years Participation
        if (filters.teacherYearsValue) {
            const yearsActive = teacherYearsMap.get(p.teacherId) || 0;
            const op = filters.teacherYearsOperator;

            if (op === "=") {
                const target = parseInt(filters.teacherYearsValue, 10);
                if (yearsActive !== target) return false;
            } else if (op === ">") {
                const target = parseInt(filters.teacherYearsValue, 10);
                if (yearsActive <= target) return false;
            } else if (op === "<") {
                const target = parseInt(filters.teacherYearsValue, 10);
                if (yearsActive >= target) return false;
            } else if (op === "between" && filters.teacherYearsValue2) {
                const min = parseInt(filters.teacherYearsValue, 10);
                const max = parseInt(filters.teacherYearsValue2, 10);
                if (yearsActive < min || yearsActive > max) return false;
            }
        }

        return true;
    });
}

/**
 * Compute a metric value for a set of projects.
 * @param allProjects - needed for school-return-rate calculation
 */
export function computeMetric(
    projects: Project[],
    metric: MeasuredAs,
    allProjects: Project[],
): number {
    if (projects.length === 0) return 0;

    switch (metric) {
        case "total-school-count":
            return new Set(projects.map((p) => p.schoolId)).size;

        case "total-project-count":
            return projects.length;

        case "total-student-count":
            return projects.reduce((sum, p) => sum + (p.numStudents || 0), 0);

        case "total-teacher-count":
            return new Set(projects.map((p) => p.teacherId)).size;

        case "total-city-count":
            return new Set(projects.map((p) => p.schoolTown)).size;

        case "school-return-rate": {
            const schoolsThisYear = new Set(projects.map((p) => p.schoolId));
            const year = projects[0].year;
            const priorParticipation = allProjects.filter(
                (x) => schoolsThisYear.has(x.schoolId) && x.year < year,
            );
            const returningSchools = new Set(
                priorParticipation.map((p) => p.schoolId),
            );
            return returningSchools.size / schoolsThisYear.size || 0;
        }

        default:
            return projects.length;
    }
}

/**
 * Build chart datasets from grouped projects.
 * Pure function - no setState calls.
 */
export function buildDatasets(
    groups: string[],
    getProjectsInGroup: (groupName: string) => Project[],
    metric: MeasuredAs,
    allProjects: Project[],
): ChartDataset[] {
    return groups.map((groupName) => {
        const projectsInGroup = getProjectsInGroup(groupName);
        const projectsByYear: Record<number, Project[]> = {};

        for (const p of projectsInGroup) {
            if (!projectsByYear[p.year]) projectsByYear[p.year] = [];
            projectsByYear[p.year].push(p);
        }

        const dataPoints = Object.entries(projectsByYear)
            .map(([year, projs]) => ({
                x: Number(year),
                y: computeMetric(projs, metric, allProjects),
            }))
            .sort((a, b) => a.x - b.x);

        return { label: groupName, data: dataPoints };
    });
}

/**
 * Normalize division names for consistent grouping.
 */
export function normalizeDivision(d: string): string {
    const lower = d.toLowerCase();
    if (lower.startsWith("junior")) return "Junior";
    if (lower.startsWith("senior")) return "Senior";
    if (lower.startsWith("young")) return "Young Historian";
    return d;
}

/**
 * Get unique division groups from projects.
 */
export function getDivisionGroups(projects: Project[]): string[] {
    const allDivisionGroups = new Set<string>();

    for (const p of projects) {
        const divs = p.schoolDivisions;
        if (!divs || divs.length === 0) {
            allDivisionGroups.add("Unassigned");
        } else {
            for (const d of divs) {
                allDivisionGroups.add(normalizeDivision(d));
            }
        }
    }

    return Array.from(allDivisionGroups).sort((a, b) =>
        a === "Unassigned" ? 1 : b === "Unassigned" ? -1 : a.localeCompare(b),
    );
}

/**
 * Get projects matching a division group.
 */
export function getProjectsInDivision(
    projects: Project[],
    groupName: string,
): Project[] {
    return projects.filter((p) => {
        const divs = p.schoolDivisions;
        if (groupName === "Unassigned") return !divs || divs.length === 0;
        return divs?.some((d) => normalizeDivision(d) === groupName) ?? false;
    });
}

/**
 * Map groupBy value to the Project field key.
 */
export function getGroupKey(groupBy: GroupBy): keyof Project | null {
    switch (groupBy) {
        case "none":
            return null;
        case "project-type":
            return "category";
        case "region":
            return "schoolRegion";
        case "school-type":
            return "schoolSchoolType";
        case "implementation-model":
            return "schoolImplementationModel";
        case "gateway-school":
            return "gatewaySchool";
        case "division":
            return null; // handled separately
        default:
            return null;
    }
}

/**
 * Get unique groups from projects based on a field key.
 */
export function getUniqueGroups(
    projects: Project[],
    groupKey: keyof Project | null,
): string[] {
    if (groupKey === null) return ["All"];

    const groups = new Set(
        projects.map((p) => String(p[groupKey] || "Unassigned")),
    );

    return Array.from(groups).sort((a, b) =>
        a === "Unassigned" ? 1 : b === "Unassigned" ? -1 : a.localeCompare(b),
    );
}

/**
 * Get projects matching a group value for a given key.
 */
export function getProjectsInGroup(
    projects: Project[],
    groupKey: keyof Project | null,
    groupName: string,
): Project[] {
    if (groupKey === null) return projects;
    return projects.filter(
        (p) => String(p[groupKey] || "Unassigned") === groupName,
    );
}

/**
 * Main entry point: compute chart datasets from projects and filters.
 * Returns both the datasets and the resolved metric.
 */
export function computeChartDatasets(
    allProjects: Project[],
    filters: Filters,
    yearRange: YearRange,
): { datasets: ChartDataset[]; metric: MeasuredAs } {
    if (!allProjects.length) {
        return { datasets: [], metric: filters.measuredAs };
    }

    const teacherYearsMap = filters.teacherYearsValue
        ? buildTeacherYearsMap(allProjects)
        : new Map<number, number>();

    const filteredProjects = filterProjects(
        allProjects,
        filters,
        yearRange,
        teacherYearsMap,
    );

    const metric = filters.measuredAs;

    // Division groupBy: special handling for array field
    if (filters.groupBy === "division") {
        const groups = getDivisionGroups(filteredProjects);
        const datasets = buildDatasets(
            groups,
            (groupName) => getProjectsInDivision(filteredProjects, groupName),
            metric,
            allProjects,
        );
        return { datasets, metric };
    }

    // All other groupBy values
    const groupKey = getGroupKey(filters.groupBy);
    const groups = getUniqueGroups(filteredProjects, groupKey);
    const datasets = buildDatasets(
        groups,
        (groupName) =>
            getProjectsInGroup(filteredProjects, groupKey, groupName),
        metric,
        allProjects,
    );

    return { datasets, metric };
}
