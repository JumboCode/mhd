"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { type Project } from "@/lib/compute-chart-data";
import { type YearRange } from "@/lib/chart-data-pipeline";

export type YearMetadata = {
    year: number;
    lastUpdatedAt: string | null;
};

export type UseChartDataReturn = {
    allProjects: Project[];
    gatewaySchools: string[];
    isLoaded: boolean;
    projectDataError: string | null;
    fetchProjects: () => Promise<void>;
    yearsMetadata: YearMetadata[];
    dataLastUpdated: Date | null;
};

export function useChartData(yearRange: YearRange): UseChartDataReturn {
    const [allProjects, setAllProjects] = useState<Project[]>([]);
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

    // Fetch all project data
    const fetchProjects = useCallback(async () => {
        setIsLoaded(false);
        setProjectDataError(null);
        try {
            const response = await fetch("/api/projects");
            if (!response.ok) throw new Error("Failed to load project data");

            const data = await response.json();

            const updatedProjects = data.map((p: Project) => ({
                ...p,
                gatewaySchool: gatewaySchools.includes(p.schoolName)
                    ? "Gateway"
                    : "Non-Gateway",
            }));

            setAllProjects(updatedProjects);
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
        gatewaySchools,
        isLoaded,
        projectDataError,
        fetchProjects,
        yearsMetadata,
        dataLastUpdated,
    };
}
