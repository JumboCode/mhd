/***************************************************************
 *
 *                page.tsx
 *
 *         Author: Elki & Zander
 *           Date: 11/24/2025
 *
 *        Summary: Line graph visualization page with dynamic
 *        filtering for data analysis
 *
 **************************************************************/

"use client";

import { useState, useEffect } from "react";
import LineGraph from "@/components/LineGraph";
import FilterPanel, { Filters } from "@/components/FilterPanel";

type Project = {
    id: number;
    title: string;
    division: string;
    category: string;
    year: number;
    group: boolean;
    schoolId: number;
    schoolName: string;
    schoolTown: string;
    teacherId: number;
    teacherFirstName: string;
    teacherLastName: string;
};

export default function LineGraphPage() {
    const [allProjects, setAllProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<Filters | null>(null);

    // Fetch all projects data on mount
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                console.log("Fetching projects from /api/projects...");
                const response = await fetch("/api/projects");
                console.log("Response status:", response.status);
                if (!response.ok) throw new Error("Failed to fetch projects");
                const data = await response.json();
                console.log("Fetched projects:", data);
                console.log("Number of projects:", data.length);
                setAllProjects(data);
            } catch (error) {
                console.error("Error fetching projects:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    const schools = Array.from(
        new Set(allProjects.map((p) => p.schoolName)),
    ).sort();
    const cities = Array.from(
        new Set(allProjects.map((p) => p.schoolTown)),
    ).sort();

    const handleFiltersChange = (newFilters: Filters) => {
        console.log("Filters changed:", newFilters);
        setFilters(newFilters);
    };

    return (
        <div className="flex min-h-screen flex-col p-8">
            <h1 className="text-3xl font-bold mb-6">Line Graph</h1>

            <FilterPanel
                schools={schools}
                cities={cities}
                onFiltersChange={handleFiltersChange}
            />

            <div className="flex-1">{/* <LineGraph /> */}</div>
        </div>
    );
}
