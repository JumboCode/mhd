/***************************************************************
 *
 *                schools/[name]/page.tsx
 *
 *         Author: Elki Laranas & Hansini Gundavarapu
 *           Date: 11/16/2025
 *
 *        Summary: Page to display individual school profiles
 *
 **************************************************************/

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

// interface such that data can be blank if API is loading
type SchoolData = {
    name: string;
    town: string;
    studentCount: string;
    teacherCount: string;
    projectCount: string;
    firstYear: string;
    instructionalModel: string;
};

export default function SchoolProfilePage() {
    const params = useParams();
    const schoolName = params.name as string;

    const router = useRouter();

    // while API is loading, still display something
    const [schoolData, setSchoolData] = useState<SchoolData>({
        name: "...",
        town: "...",
        studentCount: "...",
        teacherCount: "...",
        projectCount: "...",
        firstYear: "...",
        instructionalModel: "...",
    });

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch(`/api/schools/${schoolName}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch school data`);
                }
                return response.json();
            })
            .then((data) => {
                setSchoolData(data);
            })
            .catch((error) => {
                setError(error.message);
            });
    }, [schoolName]);

    // Redirect to schools page if school cannot be found
    if (error) {
        router.push("/schools");
    }

    return (
        <div className="min-h-screen bg-white px-[16.67vw] py-8">
            <div className="flex flex-col gap-8">
                {/* Header with school name */}
                <h1 className="text-2xl font-bold">{schoolData.name}</h1>

                {/* Stats cards */}
                <div className="grid grid-cols-3 gap-8">
                    <StatCard
                        label="Total # Projects"
                        value={schoolData.projectCount}
                    />
                    <StatCard
                        label="Total # Teachers"
                        value={schoolData.teacherCount}
                    />
                    <StatCard
                        label="Total # Students"
                        value={schoolData.studentCount}
                    />
                </div>

                {/* School information */}
                <div className="space-y-2 text-base">
                    <InfoRow label="Town" value={schoolData.town} />
                    <InfoRow
                        label="Instruction Model"
                        value={schoolData.instructionalModel}
                    />
                    <InfoRow
                        label="First Year Participating"
                        value={schoolData.firstYear}
                    />
                </div>

                {/* Placeholders for charts */}
                <div className="grid grid-cols-3 gap-8">
                    <PlaceholderCard
                        title="Region Distribution"
                        className="col-span-2"
                    />
                    <PlaceholderCard title="% Highschool" />
                </div>

                {/* Data table placeholder */}
                <div className="border border-gray-200 rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900">
                        View and edit data
                    </h2>
                    <div className="h-48 flex items-center justify-center bg-gray-50 rounded">
                        <p className="text-sm text-gray-500">
                            Data table placeholder
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Reusable stat card component
function StatCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 p-6 aspect-[247/138] gap-5">
            <span className="text-sm text-gray-600">{label}</span>
            <span className="font-mono text-5xl font-bold leading-none">
                {value}
            </span>
        </div>
    );
}

// Reusable info row component
function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <span className="font-semibold text-gray-900">{label}:</span>{" "}
            <span className="text-gray-700">{value}</span>
        </div>
    );
}

// Reusable placeholder card component
function PlaceholderCard({
    title,
    className = "",
}: {
    title: string;
    className?: string;
}) {
    return (
        <div className={`border border-gray-200 rounded-lg p-6 ${className}`}>
            <div className="h-48 flex items-center justify-center bg-gray-50 rounded">
                <div className="text-center">
                    <p className="text-sm font-semibold text-gray-900">
                        {title}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        Chart placeholder
                    </p>
                </div>
            </div>
        </div>
    );
}
