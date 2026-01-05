/***************************************************************
 *
 *                SpreadsheetConfirmation.tsx
 *
 *         Author: Will O'Leary & Zander Barba
 *           Date: 11/14/2025
 *
 *        Summary: Confirm process for a user uploaded spreadsheet,
 *        displays some information about the data to be uploaded.
 *
 **************************************************************/
"use client";

import { FolderOpenDot, GraduationCap, School, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Checkbox } from "@/components/Checkbox";
import type { SpreadsheetData } from "@/types/spreadsheet";

type ConfirmationProps = {
    year?: number | null;
    spreadsheetData: SpreadsheetData;
    setConfirmed: (confirmed: boolean | null) => void;
    yearHasData: boolean;
};

export default function SpreadsheetConfirmation({
    year,
    spreadsheetData,
    setConfirmed,
    yearHasData,
}: ConfirmationProps) {
    const [uniqueSchools, setUniqueSchools] = useState<number>(0);
    const [students, setStudents] = useState<number>(0);
    const [numTeachers, setNumTeachers] = useState<number>(0);
    const [numProjects, setNumProjects] = useState<number>(0);

    useEffect(() => {
        if (!spreadsheetData || spreadsheetData.length === 0) {
            setUniqueSchools(0);
            setStudents(0);
            setNumTeachers(0);
            setNumProjects(0);
            return;
        }

        // Remove header row and filter out empty rows
        const dataRows = spreadsheetData
            .slice(1)
            .filter((row) => row.length > 0);

        // Count students (column 1)
        const studentsList = dataRows
            .map((row) => row[1])
            .filter((value) => value !== "" && value !== null);
        setStudents(studentsList.length);

        // Count unique schools (column 37)
        const schools = dataRows.map((row) => row[37]).filter(Boolean);
        const uniqueSchoolsSet = new Set(schools);
        setUniqueSchools(uniqueSchoolsSet.size);

        // Count unique teachers (column 21 - email)
        const teachers = dataRows.map((row) => row[21]).filter(Boolean);
        const uniqueTeachersSet = new Set(teachers);
        setNumTeachers(uniqueTeachersSet.size);

        // Count unique projects (column 23 - project ID)
        const projects = dataRows.map((row) => row[23]).filter(Boolean);
        const uniqueProjectsSet = new Set(projects);
        setNumProjects(uniqueProjectsSet.size);
    }, [spreadsheetData]);

    return (
        <div className="flex flex-col items-left justify-left max-w-lg">
            <h1 className="text-2xl font-bold mt-8">Confirmation</h1>
            <p className="text-muted-foreground my-5">
                You are about to {yearHasData ? "overwrite" : "add"} data for{" "}
                {year} - are you sure you want to do this? This action cannot be
                undone.
            </p>
            <div className="my-5 grid grid-cols-2 gap-4">
                <div className="flex flex-col justify-center items-center gap-2 border rounded-lg py-4">
                    <School className="inline-block mr-2 mb-1" />
                    <p>{uniqueSchools} schools</p>
                </div>
                <div className="flex flex-col justify-center items-center gap-2 border rounded-lg py-4">
                    <GraduationCap className="inline-block mr-2 mb-1" />
                    <p>{students} students</p>
                </div>
                <div className="flex flex-col justify-center items-center gap-2 border rounded-lg py-4">
                    <User className="inline-block mr-2 mb-1" />
                    <p>{numTeachers} teachers</p>
                </div>
                <div className="flex flex-col justify-center items-center gap-2 border rounded-lg py-4">
                    <FolderOpenDot className="inline-block mr-2 mb-1" />
                    <p>{numProjects} projects</p>
                </div>
            </div>
            <div className="mt-4 flex flex-row items-center gap-4">
                <Checkbox
                    onCheckedChange={(checked: boolean) =>
                        setConfirmed(checked)
                    }
                />
                <label htmlFor="confirmation-checkbox">
                    I understand this action may affect existing data
                </label>
            </div>
            <div className="mt-5"></div>
        </div>
    );
}
