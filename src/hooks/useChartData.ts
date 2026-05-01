"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
    type Project,
    type SchoolParticipation,
    type TeacherParticipation,
} from "@/lib/compute-chart-data";
import { type YearRange } from "@/lib/chart-data-pipeline";

export type YearMetadata = {
    year: number;
    lastUpdatedAt: string | null;
};

export type UseChartDataReturn = {
    allProjects: Project[];
    allSchoolParticipations: SchoolParticipation[];
    allTeacherParticipations: TeacherParticipation[];
    gatewaySchools: string[];
    isLoaded: boolean;
    projectDataError: string | null;
    fetchProjects: () => Promise<void>;
    yearsMetadata: YearMetadata[];
    dataLastUpdated: Date | null;
};

export function useChartData(yearRange: YearRange): UseChartDataReturn {
    const [allProjects, setAllProjects] = useState<Project[]>([]);
    const [allSchoolParticipations, setAllSchoolParticipations] = useState<
        SchoolParticipation[]
    >([]);
    const [allTeacherParticipations, setAllTeacherParticipations] = useState<
        TeacherParticipation[]
    >([]);
    const [gatewaySchools, setGatewaySchools] = useState<string[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [projectDataError, setProjectDataError] = useState<string | null>(
        null,
    );
    const [yearsMetadata, setYearsMetadata] = useState<YearMetadata[]>([]);

    // Fetch gateway schools
    useEffect(() => {
        fetch("/api/schools?gateway=true&list=true")
            .then((res) => res.json())
            .then((data) => {
                const schoolNames: string[] = data.map(
                    (school: { name: string }) => school.name,
                );
                setGatewaySchools(schoolNames);
            });
    }, []);

    // Fetch all project data and school participations
    const fetchProjects = useCallback(async () => {
        setIsLoaded(false);
        setProjectDataError(null);
        try {
            const [projectsRes, schoolRes, teacherRes] = await Promise.all([
                fetch("/api/projects"),
                fetch("/api/school-participations"),
                fetch("/api/teacher-participations"),
            ]);
            if (!projectsRes.ok) throw new Error("Failed to load project data");
            if (!schoolRes.ok)
                throw new Error("Failed to load school participation data");
            if (!teacherRes.ok)
                throw new Error("Failed to load teacher participation data");

            const [projectData, schoolData, teacherData] = await Promise.all([
                projectsRes.json(),
                schoolRes.json(),
                teacherRes.json(),
            ]);

            setAllProjects(
                projectData.map((p: Project) => ({
                    ...p,
                    gatewaySchool: gatewaySchools.includes(p.schoolName)
                        ? "Gateway"
                        : "Non-Gateway",
                })),
            );

            setAllSchoolParticipations(
                schoolData.map(
                    (s: SchoolParticipation & { gateway: boolean }) => ({
                        ...s,
                        gatewaySchool: s.gateway ? "Gateway" : "Non-Gateway",
                    }),
                ),
            );

            setAllTeacherParticipations(
                teacherData.map(
                    (t: TeacherParticipation & { gateway: boolean }) => ({
                        ...t,
                        gatewaySchool: t.gateway ? "Gateway" : "Non-Gateway",
                    }),
                ),
            );

            setProjectDataError(null);
        } catch (error) {
            setProjectDataError(
                error instanceof Error
                    ? error.message
                    : "Failed to load project data",
            );
        } finally {
            setIsLoaded(true);
        }
    }, [gatewaySchools]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    // Fetch year metadata
    useEffect(() => {
        fetch("/api/years-with-data")
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data.years)) {
                    setYearsMetadata(data.years);
                }
            })
            .catch(() => {});
    }, []);

    // Compute data last updated date
    const dataLastUpdated = useMemo(() => {
        const dates = yearsMetadata
            .filter(
                (m) =>
                    m.year >= yearRange.start &&
                    m.year <= yearRange.end &&
                    m.lastUpdatedAt !== null,
            )
            .map((m) => new Date(m.lastUpdatedAt!).getTime());
        if (dates.length === 0) return null;
        return new Date(Math.max(...dates));
    }, [yearsMetadata, yearRange]);

    return {
        allProjects,
        allSchoolParticipations,
        allTeacherParticipations,
        gatewaySchools,
        isLoaded,
        projectDataError,
        fetchProjects,
        yearsMetadata,
        dataLastUpdated,
    };
}
