/***************************************************************
 *
 *         /src/lib/compute-chart-data.ts
 *
 *         Summary: Shared logic for filtering/grouping project
 *                  data into ChartDataset[] for bar and line graphs.
 *                  Used by chart page and cart export.
 *
 **************************************************************/

import { type ChartDataset } from "@/components/charts/chartTypes";
import { type Filters } from "@/components/GraphFilters/GraphFilters";

export type Project = {
    id: number;
    title: string;
    division: string;
    category: string;
    gatewaySchool: string;
    year: number;
    teamProject: boolean;
    schoolId: number;
    schoolName: string;
    standardizedSchoolName: string;
    schoolTown: string;
    schoolRegion: string;
    teacherId: number;
    teacherName: string;
    teacherEmail: string;
    numStudents: number;
    schoolCompetingStudents: number | null;
    schoolDivisions: string[] | null;
    schoolImplementationModel: string | null;
    schoolSchoolType: string | null;
};

/**
 * One record per (school, year) from yearlySchoolParticipation joined with schools.
 * Represents all participating schools, including those without any projects.
 */
export type SchoolParticipation = {
    schoolId: number;
    year: number;
    schoolName: string;
    standardizedSchoolName: string;
    schoolTown: string;
    schoolRegion: string;
    gatewaySchool: string; // "Gateway" | "Non-Gateway"
    schoolImplementationModel: string;
    schoolSchoolType: string;
    schoolDivisions: string[];
};

/**
 * One record per (teacher, school, year) from yearlyTeacherParticipation joined with schools.
 * Represents all participating teachers, including those without any projects.
 */
export type TeacherParticipation = {
    teacherId: number;
    year: number;
    schoolName: string;
    schoolTown: string;
    schoolRegion: string;
    gatewaySchool: string; // "Gateway" | "Non-Gateway"
    schoolImplementationModel: string;
    schoolSchoolType: string;
    schoolDivisions: string[];
};

/**
 * Filter teacher participation records by the same criteria as projects,
 * excluding project-specific filters (project type, individual/group, teacher years).
 */
export function filterTeacherParticipations(
    records: TeacherParticipation[],
    filters: Filters,
    yearStart: number,
    yearEnd: number,
): TeacherParticipation[] {
    return records.filter((t) => {
        if (t.year < yearStart || t.year > yearEnd) return false;

        if (filters.onlyGatewaySchools && t.gatewaySchool !== "Gateway")
            return false;

        if (filters.selectedSchools.length > 0) {
            const match = filters.selectedSchools.some((v) => {
                const sep = v.indexOf("\x00");
                return sep === -1
                    ? v === t.schoolName
                    : v.slice(0, sep) === t.schoolName &&
                          v.slice(sep + 1) === t.schoolTown;
            });
            if (!match) return false;
        }

        if (
            filters.selectedCities.length > 0 &&
            !filters.selectedCities.includes(t.schoolTown)
        )
            return false;

        if (filters.selectedDivisions && filters.selectedDivisions.length > 0) {
            const divs = t.schoolDivisions;
            if (!divs || divs.length === 0) {
                if (!filters.selectedDivisions.includes("Unassigned"))
                    return false;
            } else {
                const normalize = (d: string): string => {
                    const lower = d.toLowerCase();
                    if (lower.startsWith("junior")) return "Junior";
                    if (lower.startsWith("senior")) return "Senior";
                    if (lower.startsWith("young")) return "Young Historian";
                    return d;
                };
                if (
                    !divs
                        .map(normalize)
                        .some((d) => filters.selectedDivisions.includes(d))
                )
                    return false;
            }
        }

        if (
            filters.selectedSchoolTypes &&
            filters.selectedSchoolTypes.length > 0 &&
            !filters.selectedSchoolTypes.includes(
                t.schoolSchoolType || "Unassigned",
            )
        )
            return false;

        if (
            filters.selectedRegions &&
            filters.selectedRegions.length > 0 &&
            !filters.selectedRegions.includes(t.schoolRegion || "Unassigned")
        )
            return false;

        if (
            filters.selectedImplementationTypes &&
            filters.selectedImplementationTypes.length > 0 &&
            !filters.selectedImplementationTypes.includes(
                t.schoolImplementationModel || "Unassigned",
            )
        )
            return false;

        return true;
    });
}

/**
 * Filter school participation records by the same criteria as projects,
 * excluding project-specific filters (project type, individual/group, teacher years).
 */
export function filterSchoolParticipations(
    records: SchoolParticipation[],
    filters: Filters,
    yearStart: number,
    yearEnd: number,
): SchoolParticipation[] {
    return records.filter((s) => {
        if (s.year < yearStart || s.year > yearEnd) return false;

        if (filters.onlyGatewaySchools && s.gatewaySchool !== "Gateway")
            return false;

        if (filters.selectedSchools.length > 0) {
            const match = filters.selectedSchools.some((v) => {
                const sep = v.indexOf("\x00");
                return sep === -1
                    ? v === s.schoolName
                    : v.slice(0, sep) === s.schoolName &&
                          v.slice(sep + 1) === s.schoolTown;
            });
            if (!match) return false;
        }

        if (
            filters.selectedCities.length > 0 &&
            !filters.selectedCities.includes(s.schoolTown)
        )
            return false;

        if (filters.selectedDivisions && filters.selectedDivisions.length > 0) {
            const divs = s.schoolDivisions;
            if (!divs || divs.length === 0) {
                if (!filters.selectedDivisions.includes("Unassigned"))
                    return false;
            } else {
                const normalize = (d: string): string => {
                    const lower = d.toLowerCase();
                    if (lower.startsWith("junior")) return "Junior";
                    if (lower.startsWith("senior")) return "Senior";
                    if (lower.startsWith("young")) return "Young Historian";
                    return d;
                };
                if (
                    !divs
                        .map(normalize)
                        .some((d) => filters.selectedDivisions.includes(d))
                )
                    return false;
            }
        }

        if (
            filters.selectedSchoolTypes &&
            filters.selectedSchoolTypes.length > 0 &&
            !filters.selectedSchoolTypes.includes(
                s.schoolSchoolType || "Unassigned",
            )
        )
            return false;

        if (
            filters.selectedRegions &&
            filters.selectedRegions.length > 0 &&
            !filters.selectedRegions.includes(s.schoolRegion || "Unassigned")
        )
            return false;

        if (
            filters.selectedImplementationTypes &&
            filters.selectedImplementationTypes.length > 0 &&
            !filters.selectedImplementationTypes.includes(
                s.schoolImplementationModel || "Unassigned",
            )
        )
            return false;

        return true;
    });
}

export const measuredAsLabels: Record<string, string> = {
    "total-school-count": "Total Schools",
    "total-competing-student-count": "Total Competing Students",
    "total-participating-student-count": "Total Participating Students",
    // Legacy label kept for any stored URLs pointing at the old key.
    "total-student-count": "Total Students",
    "total-city-count": "Total Cities",
    "total-project-count": "Total Projects",
    "total-teacher-count": "Total Teachers",
    "school-return-rate": "School Return Rate",
};

/** Normalize legacy `total-student-count` to `total-participating-student-count`. */
export function normalizeMeasuredAs(metric: string): string {
    if (metric === "total-student-count") {
        return "total-participating-student-count";
    }
    return metric;
}

export const groupByLabels: Record<string, string> = {
    "none": "None",
    "region": "Region",
    "school-type": "School Type",
    "division": "Division",
    "implementation-model": "Implementation Model",
    "project-type": "Project Type",
    "gateway-school": "Schools Representing Gateway Cities",
};

/** The subset of Filters + year range needed to compute a chart dataset. */
export type ChartParams = {
    filters: Filters;
    yearStart: number;
    yearEnd: number;
    schoolParticipations?: SchoolParticipation[];
    teacherParticipations?: TeacherParticipation[];
};

export function computeGraphDataset(
    allProjects: Project[],
    params: ChartParams,
): ChartDataset[] {
    const { filters, yearStart, yearEnd } = params;
    if (!allProjects.length) return [];

    const filteredSchoolRecords = params.schoolParticipations
        ? filterSchoolParticipations(
              params.schoolParticipations,
              filters,
              yearStart,
              yearEnd,
          )
        : undefined;

    const filteredTeacherRecords = params.teacherParticipations
        ? filterTeacherParticipations(
              params.teacherParticipations,
              filters,
              yearStart,
              yearEnd,
          )
        : undefined;

    // Pre-calculate teacher participation years if filter is active
    const teacherYearsMap = new Map<number, number>();
    if (filters.teacherYearsValue) {
        const tempMap: Record<number, Set<number>> = {};
        allProjects.forEach((p) => {
            if (!tempMap[p.teacherId]) tempMap[p.teacherId] = new Set();
            tempMap[p.teacherId].add(p.year);
        });
        Object.entries(tempMap).forEach(([tId, yearsSet]) => {
            teacherYearsMap.set(Number(tId), yearsSet.size);
        });
    }

    // Filter projects
    const filteredProjects = allProjects.filter((p) => {
        if (p.year < yearStart || p.year > yearEnd) return false;

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

        if (
            filters.selectedSchools.length > 0 &&
            !filters.selectedSchools.some((v) => {
                const sep = v.indexOf("\x00");
                return sep === -1
                    ? v === p.schoolName
                    : v.slice(0, sep) === p.schoolName &&
                          v.slice(sep + 1) === p.schoolTown;
            })
        )
            return false;

        if (filters.onlyGatewaySchools && p.gatewaySchool !== "Gateway")
            return false;

        if (
            filters.selectedCities.length > 0 &&
            !filters.selectedCities.includes(p.schoolTown)
        )
            return false;

        if (
            filters.selectedProjectTypes.length > 0 &&
            !filters.selectedProjectTypes.includes(p.category)
        )
            return false;

        // Selected Divisions (array field on project; match if ANY overlap)
        if (filters.selectedDivisions && filters.selectedDivisions.length > 0) {
            const divs = p.schoolDivisions;
            if (!divs || divs.length === 0) {
                if (!filters.selectedDivisions.includes("Unassigned"))
                    return false;
            } else {
                const normalize = (d: string): string => {
                    const lower = d.toLowerCase();
                    if (lower.startsWith("junior")) return "Junior";
                    if (lower.startsWith("senior")) return "Senior";
                    if (lower.startsWith("young")) return "Young Historian";
                    return d;
                };
                const normalized = divs.map(normalize);
                const hasMatch = normalized.some((d) =>
                    filters.selectedDivisions.includes(d),
                );
                if (!hasMatch) return false;
            }
        }

        if (
            filters.selectedSchoolTypes &&
            filters.selectedSchoolTypes.length > 0
        ) {
            const v = p.schoolSchoolType || "Unassigned";
            if (!filters.selectedSchoolTypes.includes(v)) return false;
        }

        if (filters.selectedRegions && filters.selectedRegions.length > 0) {
            const v = p.schoolRegion || "Unassigned";
            if (!filters.selectedRegions.includes(v)) return false;
        }

        if (
            filters.selectedImplementationTypes &&
            filters.selectedImplementationTypes.length > 0
        ) {
            const v = p.schoolImplementationModel || "Unassigned";
            if (!filters.selectedImplementationTypes.includes(v)) return false;
        }

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

    // Determine grouping key
    let groupKey: keyof Project | null = null;
    switch (filters.groupBy) {
        case "none":
            groupKey = null;
            break;
        case "division":
            groupKey = "division";
            break;
        case "project-type":
            groupKey = "category";
            break;
        case "region":
            groupKey = "schoolRegion";
            break;
        case "school-type":
            groupKey = "category";
            break;
        case "implementation-model":
            groupKey = "category";
            break;
        case "gateway-school":
            groupKey = "gatewaySchool";
            break;
    }

    const uniqueGroups =
        groupKey === null
            ? ["All"]
            : Array.from(
                  new Set(
                      filteredProjects.map((p) =>
                          String(p[groupKey] || "Unknown"),
                      ),
                  ),
              ).sort();

    // Map groupBy to group-key functions for school and teacher records.
    // null means "not applicable for this groupBy — fall back to project counts".
    type SchoolGroupFn = (s: SchoolParticipation) => string;
    type TeacherGroupFn = (t: TeacherParticipation) => string;
    let schoolGroupFn: SchoolGroupFn | null = null;
    let teacherGroupFn: TeacherGroupFn | null = null;
    let useSchoolRecordsForCount = filteredSchoolRecords !== undefined;
    let useTeacherRecordsForCount = filteredTeacherRecords !== undefined;

    switch (filters.groupBy) {
        case "none":
            break; // fns stay null → "All" bucket
        case "region":
            schoolGroupFn = (s) => s.schoolRegion || "Unknown";
            teacherGroupFn = (t) => t.schoolRegion || "Unknown";
            break;
        case "school-type":
            schoolGroupFn = (s) => s.schoolSchoolType || "Unknown";
            teacherGroupFn = (t) => t.schoolSchoolType || "Unknown";
            break;
        case "implementation-model":
            schoolGroupFn = (s) => s.schoolImplementationModel || "Unknown";
            teacherGroupFn = (t) => t.schoolImplementationModel || "Unknown";
            break;
        case "gateway-school":
            schoolGroupFn = (s) => s.gatewaySchool;
            teacherGroupFn = (t) => t.gatewaySchool;
            break;
        default:
            // project-type, division: no direct equivalent on participation records
            useSchoolRecordsForCount = false;
            useTeacherRecordsForCount = false;
    }

    // Index participation records by year → group for O(1) lookup
    const buildYearGroupIndex = <T extends { year: number }>(
        records: T[],
        keyFn: ((r: T) => string) | null,
    ): Map<number, Map<string, T[]>> => {
        const idx = new Map<number, Map<string, T[]>>();
        for (const r of records) {
            if (!idx.has(r.year)) idx.set(r.year, new Map());
            const byGroup = idx.get(r.year)!;
            const key = keyFn ? keyFn(r) : "All";
            if (!byGroup.has(key)) byGroup.set(key, []);
            byGroup.get(key)!.push(r);
        }
        return idx;
    };

    const schoolsByYearByGroup =
        useSchoolRecordsForCount && filteredSchoolRecords
            ? buildYearGroupIndex(filteredSchoolRecords, schoolGroupFn)
            : new Map<number, Map<string, SchoolParticipation[]>>();

    const teachersByYearByGroup =
        useTeacherRecordsForCount && filteredTeacherRecords
            ? buildYearGroupIndex(filteredTeacherRecords, teacherGroupFn)
            : new Map<number, Map<string, TeacherParticipation[]>>();

    function computeMetric(
        projects: Project[],
        metric: string,
        schoolRecords?: SchoolParticipation[],
        teacherRecords?: TeacherParticipation[],
    ) {
        switch (metric) {
            case "total-project-count":
                return projects.length;
            case "total-school-count":
                if (schoolRecords !== undefined)
                    return new Set(schoolRecords.map((s) => s.schoolId)).size;
                return new Set(projects.map((p) => p.schoolId)).size;
            case "total-student-count":
            case "total-participating-student-count":
                return projects.reduce(
                    (sum, p) => sum + (p.numStudents || 0),
                    0,
                );
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
                const schoolsThisYear = new Set(
                    projects.map((p) => p.schoolId),
                );
                const year = projects[0]?.year;
                if (!year) return 0;
                const priorParticipation = allProjects.filter(
                    (x) =>
                        schoolsThisYear.has(x.schoolId) && x.year === year - 1,
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

    const metric = filters.measuredAs || "total-school-count";

    return uniqueGroups.map((groupName) => {
        const projectsInGroup =
            groupKey === null
                ? filteredProjects
                : filteredProjects.filter(
                      (p) => String(p[groupKey] || "Unknown") === groupName,
                  );

        const projectsByYear: Record<number, Project[]> = {};
        projectsInGroup.forEach((p) => {
            if (!projectsByYear[p.year]) projectsByYear[p.year] = [];
            projectsByYear[p.year].push(p);
        });

        // Union years from projects and relevant participation records
        const allYears = new Set(Object.keys(projectsByYear).map(Number));
        if (useSchoolRecordsForCount && metric === "total-school-count")
            for (const y of schoolsByYearByGroup.keys()) allYears.add(y);
        if (useSchoolRecordsForCount && metric === "total-city-count")
            for (const y of schoolsByYearByGroup.keys()) allYears.add(y);
        if (useTeacherRecordsForCount && metric === "total-teacher-count")
            for (const y of teachersByYearByGroup.keys()) allYears.add(y);

        const dataPoints = Array.from(allYears)
            .map((year) => ({
                x: year,
                y: computeMetric(
                    projectsByYear[year] ?? [],
                    metric,
                    useSchoolRecordsForCount
                        ? (schoolsByYearByGroup.get(year)?.get(groupName) ?? [])
                        : undefined,
                    useTeacherRecordsForCount
                        ? (teachersByYearByGroup.get(year)?.get(groupName) ??
                              [])
                        : undefined,
                ),
            }))
            .sort((a, b) => a.x - b.x);

        return { label: groupName, data: dataPoints };
    });
}
