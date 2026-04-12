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
    schoolDivisions: string[] | null;
    schoolImplementationModel: string | null;
    schoolSchoolType: string | null;
};

export const measuredAsLabels: Record<string, string> = {
    "total-school-count": "Total Schools",
    "total-student-count": "Total Students",
    "total-city-count": "Total Cities",
    "total-project-count": "Total Projects",
    "total-teacher-count": "Total Teachers",
    "school-return-rate": "School Return Rate",
};

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
};

export function computeGraphDataset(
    allProjects: Project[],
    params: ChartParams,
): ChartDataset[] {
    const { filters, yearStart, yearEnd } = params;
    if (!allProjects.length) return [];

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
            !filters.selectedSchools.includes(p.schoolName)
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

    function computeMetric(projects: Project[], metric: string) {
        switch (metric) {
            case "total-project-count":
                return projects.length;
            case "total-school-count":
                return new Set(projects.map((p) => p.schoolName)).size;
            case "total-student-count":
                return projects.reduce(
                    (sum, p) => sum + (p.numStudents || 0),
                    0,
                );
            case "total-teacher-count":
                return new Set(projects.map((p) => p.teacherId)).size;
            case "total-city-count":
                return new Set(projects.map((p) => p.schoolTown)).size;
            case "school-return-rate": {
                const schoolsThisYear = new Set(
                    projects.map((p) => p.schoolId),
                );
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

        const dataPoints = Object.entries(projectsByYear)
            .map(([year, projs]) => ({
                x: Number(year),
                y: computeMetric(projs, metric),
            }))
            .sort((a, b) => a.x - b.x);

        return { label: groupName, data: dataPoints };
    });
}
