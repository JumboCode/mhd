"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

// interface such that data can be blank if API is loading
interface SchoolData {
    name: string;
    town: string;
    studentCount: string;
    teacherCount: string;
    projectCount: string;
    firstYear: string;
    instructionalModel: string;
}

export default function SchoolProfilePage() {
    const params = useParams();
    const schoolName = params.name as string;

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

    if (error) {
        return (
            <div className="min-h-screen bg-white p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg">
                        <h2 className="text-lg font-semibold mb-2">
                            Error Loading School Data
                        </h2>
                        <p>{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen bg-white"
            style={{
                paddingLeft: "calc(100vw / 6)",
                paddingRight: "calc(100vw / 6)",
            }}
        >
            <div className="flex flex-col gap-[10px] py-8">
                {/* header with school name */}
                <h1 className="text-4xl font-bold text-gray-900">
                    {schoolData.name}
                </h1>

                {/* data cards */}
                <div className="flex gap-[32px] mt-6 mb-4 w-full">
                    <div
                        className="flex flex-col items-center justify-center rounded-lg border flex-1"
                        style={{
                            padding: "24px 58px",
                            aspectRatio: "247 / 138",
                            gap: "20px",
                            borderColor: "rgba(0, 0, 0, 0.15)",
                        }}
                    >
                        <span style={{ fontSize: "14px" }}>
                            Total # Projects
                        </span>
                        <span
                            className="font-mono"
                            style={{
                                fontFamily: "MonoLisa, monospace",
                                fontSize: "56px",
                                lineHeight: "32px",
                                fontWeight: 700,
                            }}
                        >
                            {schoolData.projectCount}
                        </span>
                    </div>

                    <div
                        className="flex flex-col items-center justify-center rounded-lg border flex-1"
                        style={{
                            padding: "24px 58px",
                            aspectRatio: "247 / 138",
                            gap: "20px",
                            borderColor: "rgba(0, 0, 0, 0.15)",
                        }}
                    >
                        <span style={{ fontSize: "14px" }}>
                            Total # Teachers
                        </span>
                        <span
                            className="font-mono"
                            style={{
                                fontFamily: "MonoLisa, monospace",
                                fontSize: "56px",
                                lineHeight: "32px",
                                fontWeight: 700,
                            }}
                        >
                            {schoolData.teacherCount}
                        </span>
                    </div>

                    <div
                        className="flex flex-col items-center justify-center rounded-lg border flex-1"
                        style={{
                            padding: "24px 58px",
                            aspectRatio: "247 / 138",
                            gap: "20px",
                            borderColor: "rgba(0, 0, 0, 0.15)",
                        }}
                    >
                        <span style={{ fontSize: "14px" }}>
                            Total # Students
                        </span>
                        <span
                            className="font-mono"
                            style={{
                                fontFamily: "MonoLisa, monospace",
                                fontSize: "56px",
                                lineHeight: "32px",
                                fontWeight: 700,
                            }}
                        >
                            {schoolData.studentCount}
                        </span>
                    </div>
                </div>

                {/* additional info */}
                <div className="mb-8 space-y-1 text-base">
                    <div>
                        <span className="font-semibold">Town:</span>{" "}
                        <span>{schoolData.town}</span>
                    </div>
                    <div>
                        <span className="font-semibold">
                            Instruction Model:
                        </span>{" "}
                        <span>{schoolData.instructionalModel}</span>
                    </div>
                    <div>
                        <span className="font-semibold">
                            First Year Participating:
                        </span>{" "}
                        <span>{schoolData.firstYear}</span>
                    </div>
                </div>

                {/* placeholders */}
                <div className="flex gap-[32px] w-full mb-8">
                    <div
                        className="border rounded-lg p-6"
                        style={{
                            borderColor: "rgba(0, 0, 0, 0.15)",
                            width: "calc(66.666%)",
                        }}
                    >
                        <div className="h-48 flex items-center justify-center">
                            <div className="text-center">
                                <p
                                    style={{
                                        fontSize: "14px",
                                        fontWeight: 600,
                                    }}
                                >
                                    Region Distribution
                                </p>
                                <p
                                    style={{ fontSize: "14px" }}
                                    className="mt-2"
                                >
                                    placeholder
                                </p>
                            </div>
                        </div>
                    </div>
                    <div
                        className="border rounded-lg p-6 flex-1"
                        style={{ borderColor: "rgba(0, 0, 0, 0.15)" }}
                    >
                        <div className="h-48 flex items-center justify-center">
                            <div className="text-center">
                                <p
                                    style={{
                                        fontSize: "14px",
                                        fontWeight: 600,
                                    }}
                                >
                                    % Highschool
                                </p>
                                <p
                                    style={{ fontSize: "14px" }}
                                    className="mt-2"
                                >
                                    placeholder
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* placeholder */}
                <div
                    className="border rounded-lg p-6"
                    style={{ borderColor: "rgba(0, 0, 0, 0.15)" }}
                >
                    <h2 className="text-xl font-semibold mb-4 text-black-600 inline-block pb-1">
                        View and edit data
                    </h2>
                    <div className="mt-6">
                        <div className="h-48 flex items-center justify-center">
                            <p className="text-sm">placeholder</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
