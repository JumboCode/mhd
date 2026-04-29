/***************************************************************
 *
 *                chart-data-pipeline.ts
 *
 *         Author: Tika, Zander
 *           Date: 4/19/2026
 *
 *        Summary: Pure functions for filtering and aggregating
 *                 project data into chart datasets.
 *
 **************************************************************/

import {
    type Project,
    type SchoolParticipation,
    type TeacherParticipation,
    filterSchoolParticipations,
    filterTeacherParticipations,
} from "@/lib/compute-chart-data";
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
 * Compute a metric value for a set of projects.
 * Pass schoolRecords to use yearlySchoolParticipation data for school/city counts.
 * @param allProjects - needed for school-return-rate calculation
 */
export function computeMetric(
    projects: Project[],
    metric: MeasuredAs,
    allProjects: Project[],
    schoolRecords?: SchoolParticipation[],
    teacherRecords?: TeacherParticipation[],
): number {
    switch (metric) {
        case "total-school-count":
            if (schoolRecords !== undefined)
                return new Set(schoolRecords.map((s) => s.schoolId)).size;
            return new Set(projects.map((p) => p.schoolId)).size;

        case "total-project-count":
            return projects.length;

        case "total-student-count":
        case "total-participating-student-count":
            return projects.reduce((sum, p) => sum + (p.numStudents || 0), 0);

        case "total-competing-student-count": {
            const seen = new Set<string>();
            let total = 0;
            for (const p of projects) {
                const key = `${p.schoolId}-${p.year}`;
                if (seen.has(key)) continue;
                seen.add(key);
                total += p.schoolCompetingStudents ?? 0;
            }
            return total;
        }

        case "total-teacher-count":
            if (teacherRecords !== undefined)
                return new Set(teacherRecords.map((t) => t.teacherId)).size;
            return new Set(projects.map((p) => p.teacherId)).size;

        case "total-city-count":
            if (schoolRecords !== undefined)
                return new Set(schoolRecords.map((s) => s.schoolTown)).size;
            return new Set(projects.map((p) => p.schoolTown)).size;

        case "school-return-rate": {
            if (projects.length === 0) return 0;
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
 * Get school participation records matching a division group.
 */
export function getSchoolRecordsInDivision(
    records: SchoolParticipation[],
    groupName: string,
): SchoolParticipation[] {
    return records.filter((s) => {
        const divs = s.schoolDivisions;
        if (groupName === "Unassigned") return !divs || divs.length === 0;
        return divs?.some((d) => normalizeDivision(d) === groupName) ?? false;
    });
}

/**
 * Get teacher participation records matching a division group.
 */
export function getTeacherRecordsInDivision(
    records: TeacherParticipation[],
    groupName: string,
): TeacherParticipation[] {
    return records.filter((t) => {
        const divs = t.schoolDivisions;
        if (groupName === "Unassigned") return !divs || divs.length === 0;
        return divs?.some((d) => normalizeDivision(d) === groupName) ?? false;
    });
}

/**
 * Build chart datasets from grouped projects.
 * Pass getSchoolRecordsInGroup / getTeacherRecordsInGroup to use participation
 * tables for school/city/teacher counts.
 * Pure function - no setState calls.
 */
export function buildDatasets(
    groups: string[],
    getProjectsInGroup: (groupName: string) => Project[],
    metric: MeasuredAs,
    allProjects: Project[],
    getSchoolRecordsInGroup?: (groupName: string) => SchoolParticipation[],
    getTeacherRecordsInGroup?: (groupName: string) => TeacherParticipation[],
): ChartDataset[] {
    const useSchoolRecords =
        getSchoolRecordsInGroup !== undefined &&
        (metric === "total-school-count" || metric === "total-city-count");
    const useTeacherRecords =
        getTeacherRecordsInGroup !== undefined &&
        metric === "total-teacher-count";

    return groups.map((groupName) => {
        const projectsInGroup = getProjectsInGroup(groupName);
        const schoolRecordsInGroup = useSchoolRecords
            ? getSchoolRecordsInGroup!(groupName)
            : undefined;
        const teacherRecordsInGroup = useTeacherRecords
            ? getTeacherRecordsInGroup!(groupName)
            : undefined;

        const projectsByYear: Record<number, Project[]> = {};
        for (const p of projectsInGroup) {
            if (!projectsByYear[p.year]) projectsByYear[p.year] = [];
            projectsByYear[p.year].push(p);
        }

        const schoolRecordsByYear: Record<number, SchoolParticipation[]> = {};
        if (schoolRecordsInGroup) {
            for (const s of schoolRecordsInGroup) {
                if (!schoolRecordsByYear[s.year])
                    schoolRecordsByYear[s.year] = [];
                schoolRecordsByYear[s.year].push(s);
            }
        }

        const teacherRecordsByYear: Record<number, TeacherParticipation[]> = {};
        if (teacherRecordsInGroup) {
            for (const t of teacherRecordsInGroup) {
                if (!teacherRecordsByYear[t.year])
                    teacherRecordsByYear[t.year] = [];
                teacherRecordsByYear[t.year].push(t);
            }
        }

        const allYears = new Set([
            ...Object.keys(projectsByYear).map(Number),
            ...(useSchoolRecords
                ? Object.keys(schoolRecordsByYear).map(Number)
                : []),
            ...(useTeacherRecords
                ? Object.keys(teacherRecordsByYear).map(Number)
                : []),
        ]);

        const dataPoints = Array.from(allYears)
            .map((year) => ({
                x: year,
                y: computeMetric(
                    projectsByYear[year] ?? [],
                    metric,
                    allProjects,
                    schoolRecordsByYear[year],
                    teacherRecordsByYear[year],
                ),
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

export type FilterPipelineStep = {
    /** Stable identifier for this step */
    id: string;
    /** Human-readable label */
    label: string;
    /** Projects remaining after this step is applied */
    projects: Project[];
};

/**
 * Apply filters one at a time, capturing intermediate project sets.
 * Steps are only included when the corresponding filter is active.
 * Always starts with year-range as the first step.
 */
export function buildFilterPipeline(
    allProjects: Project[],
    filters: Filters,
    yearRange: YearRange,
): FilterPipelineStep[] {
    const steps: FilterPipelineStep[] = [];

    // Pre-compute teacher years map once (needed for teacher-years step)
    const teacherYearsMap = filters.teacherYearsValue
        ? buildTeacherYearsMap(allProjects)
        : new Map<number, number>();

    // Step 1: Year range (always active)
    const afterYearRange = allProjects.filter(
        (p) => p.year >= yearRange.start && p.year <= yearRange.end,
    );
    steps.push({
        id: "year-range",
        label: `Year range: ${yearRange.start}–${yearRange.end}`,
        projects: afterYearRange,
    });

    let current = afterYearRange;

    // Step 2: Individual/Group scope (only when one is excluded)
    if (!(filters.individualProjects && filters.groupProjects)) {
        const label =
            filters.individualProjects && !filters.groupProjects
                ? "Individual projects only"
                : !filters.individualProjects && filters.groupProjects
                  ? "Group projects only"
                  : "No projects (conflicting scope)";
        current = current.filter((p) => {
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
            return true;
        });
        steps.push({ id: "project-scope", label, projects: current });
    }

    // Step 3: Gateway schools
    if (filters.onlyGatewaySchools) {
        current = current.filter((p) => p.gatewaySchool === "Gateway");
        steps.push({
            id: "gateway",
            label: "Gateway schools only",
            projects: current,
        });
    }

    // Step 4: Selected schools
    if (filters.selectedSchools.length > 0) {
        current = current.filter((p) =>
            filters.selectedSchools.some((v) => {
                const sep = v.indexOf("\x00");
                return sep === -1
                    ? v === p.schoolName
                    : v.slice(0, sep) === p.schoolName &&
                          v.slice(sep + 1) === p.schoolTown;
            }),
        );
        steps.push({
            id: "school",
            label: `School filter (${filters.selectedSchools.length} school${filters.selectedSchools.length > 1 ? "s" : ""})`,
            projects: current,
        });
    }

    // Step 5: Selected cities
    if (filters.selectedCities.length > 0) {
        current = current.filter((p) =>
            filters.selectedCities.includes(p.schoolTown),
        );
        steps.push({
            id: "city",
            label: `City filter (${filters.selectedCities.length} cit${filters.selectedCities.length > 1 ? "ies" : "y"})`,
            projects: current,
        });
    }

    // Step 6: Selected project types
    if (filters.selectedProjectTypes.length > 0) {
        current = current.filter((p) =>
            filters.selectedProjectTypes.includes(p.category),
        );
        steps.push({
            id: "project-type",
            label: `Project type filter (${filters.selectedProjectTypes.length} type${filters.selectedProjectTypes.length > 1 ? "s" : ""})`,
            projects: current,
        });
    }

    // Step 7: Selected divisions
    if (filters.selectedDivisions.length > 0) {
        const selected = filters.selectedDivisions;
        current = current.filter((p) => {
            const divs = p.schoolDivisions;
            if (!divs || divs.length === 0)
                return selected.includes("Unassigned");
            return divs.some((d) => selected.includes(normalizeDivision(d)));
        });
        steps.push({
            id: "division",
            label: `Division filter (${selected.length} division${selected.length > 1 ? "s" : ""})`,
            projects: current,
        });
    }

    // Step 8: Selected school types
    if (filters.selectedSchoolTypes.length > 0) {
        const selected = filters.selectedSchoolTypes;
        current = current.filter((p) =>
            selected.includes(p.schoolSchoolType || "Unassigned"),
        );
        steps.push({
            id: "school-type",
            label: `School type filter (${selected.length} type${selected.length > 1 ? "s" : ""})`,
            projects: current,
        });
    }

    // Step 9: Selected regions
    if (filters.selectedRegions.length > 0) {
        const selected = filters.selectedRegions;
        current = current.filter((p) =>
            selected.includes(p.schoolRegion || "Unassigned"),
        );
        steps.push({
            id: "region",
            label: `Region filter (${selected.length} region${selected.length > 1 ? "s" : ""})`,
            projects: current,
        });
    }

    // Step 10: Selected implementation types
    if (filters.selectedImplementationTypes.length > 0) {
        const selected = filters.selectedImplementationTypes;
        current = current.filter((p) =>
            selected.includes(p.schoolImplementationModel || "Unassigned"),
        );
        steps.push({
            id: "implementation-type",
            label: `Implementation model filter (${selected.length} type${selected.length > 1 ? "s" : ""})`,
            projects: current,
        });
    }

    // Step 11: Teacher years participation
    if (filters.teacherYearsValue) {
        const op = filters.teacherYearsOperator;
        const v1 = parseInt(filters.teacherYearsValue, 10);
        const v2 = filters.teacherYearsValue2
            ? parseInt(filters.teacherYearsValue2, 10)
            : 0;

        current = current.filter((p) => {
            const yearsActive = teacherYearsMap.get(p.teacherId) || 0;
            if (op === "=") return yearsActive === v1;
            if (op === ">") return yearsActive > v1;
            if (op === "<") return yearsActive < v1;
            if (op === "between") return yearsActive >= v1 && yearsActive <= v2;
            return true;
        });

        const opLabel =
            op === "between" ? `between ${v1}–${v2}` : `${op} ${v1}`;
        steps.push({
            id: "teacher-years",
            label: `Teacher participation: ${opLabel} years`,
            projects: current,
        });
    }

    return steps;
}

/**
 * Main entry point: compute chart datasets from projects and filters.
 * Returns both the datasets and the resolved metric.
 */
export function computeChartDatasets(
    allProjects: Project[],
    filters: Filters,
    yearRange: YearRange,
    allSchoolParticipations?: SchoolParticipation[],
    allTeacherParticipations?: TeacherParticipation[],
): { datasets: ChartDataset[]; metric: MeasuredAs } {
    if (!allProjects.length) {
        return { datasets: [], metric: filters.measuredAs };
    }

    const pipeline = buildFilterPipeline(allProjects, filters, yearRange);
    const filteredProjects = pipeline.at(-1)!.projects;

    const metric = filters.measuredAs;

    const filteredSchoolRecords = allSchoolParticipations
        ? filterSchoolParticipations(
              allSchoolParticipations,
              filters,
              yearRange.start,
              yearRange.end,
          )
        : undefined;

    const filteredTeacherRecords = allTeacherParticipations
        ? filterTeacherParticipations(
              allTeacherParticipations,
              filters,
              yearRange.start,
              yearRange.end,
          )
        : undefined;

    // Helper factories for grouping participation records
    const makeSchoolGroupFn =
        (keyFn: (s: SchoolParticipation) => string) =>
        (groupName: string): SchoolParticipation[] =>
            filteredSchoolRecords?.filter((s) => keyFn(s) === groupName) ?? [];

    const makeTeacherGroupFn =
        (keyFn: (t: TeacherParticipation) => string) =>
        (groupName: string): TeacherParticipation[] =>
            filteredTeacherRecords?.filter((t) => keyFn(t) === groupName) ?? [];

    // Division groupBy: special handling for array field
    if (filters.groupBy === "division") {
        const groups = getDivisionGroups(filteredProjects);
        const datasets = buildDatasets(
            groups,
            (groupName) => getProjectsInDivision(filteredProjects, groupName),
            metric,
            allProjects,
            filteredSchoolRecords
                ? (groupName) =>
                      getSchoolRecordsInDivision(
                          filteredSchoolRecords,
                          groupName,
                      )
                : undefined,
            filteredTeacherRecords
                ? (groupName) =>
                      getTeacherRecordsInDivision(
                          filteredTeacherRecords,
                          groupName,
                      )
                : undefined,
        );
        return { datasets, metric };
    }

    // For all other groupBy values, map to group-key functions
    type SchoolFn = (groupName: string) => SchoolParticipation[];
    type TeacherFn = (groupName: string) => TeacherParticipation[];
    let schoolGroupFn: SchoolFn | undefined;
    let teacherGroupFn: TeacherFn | undefined;

    switch (filters.groupBy) {
        case "none":
            schoolGroupFn = filteredSchoolRecords
                ? () => filteredSchoolRecords
                : undefined;
            teacherGroupFn = filteredTeacherRecords
                ? () => filteredTeacherRecords
                : undefined;
            break;
        case "region":
            schoolGroupFn = filteredSchoolRecords
                ? makeSchoolGroupFn((s) => s.schoolRegion || "Unassigned")
                : undefined;
            teacherGroupFn = filteredTeacherRecords
                ? makeTeacherGroupFn((t) => t.schoolRegion || "Unassigned")
                : undefined;
            break;
        case "school-type":
            schoolGroupFn = filteredSchoolRecords
                ? makeSchoolGroupFn((s) => s.schoolSchoolType || "Unassigned")
                : undefined;
            teacherGroupFn = filteredTeacherRecords
                ? makeTeacherGroupFn((t) => t.schoolSchoolType || "Unassigned")
                : undefined;
            break;
        case "implementation-model":
            schoolGroupFn = filteredSchoolRecords
                ? makeSchoolGroupFn(
                      (s) => s.schoolImplementationModel || "Unassigned",
                  )
                : undefined;
            teacherGroupFn = filteredTeacherRecords
                ? makeTeacherGroupFn(
                      (t) => t.schoolImplementationModel || "Unassigned",
                  )
                : undefined;
            break;
        case "gateway-school":
            schoolGroupFn = filteredSchoolRecords
                ? makeSchoolGroupFn((s) => s.gatewaySchool)
                : undefined;
            teacherGroupFn = filteredTeacherRecords
                ? makeTeacherGroupFn((t) => t.gatewaySchool)
                : undefined;
            break;
        default:
            // project-type: no participation-level equivalent
            break;
    }

    const groupKey = getGroupKey(filters.groupBy);
    const groups = getUniqueGroups(filteredProjects, groupKey);
    const datasets = buildDatasets(
        groups,
        (groupName) =>
            getProjectsInGroup(filteredProjects, groupKey, groupName),
        metric,
        allProjects,
        schoolGroupFn,
        teacherGroupFn,
    );

    return { datasets, metric };
}
