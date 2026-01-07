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
import type { SpreadsheetData, CellValue } from "@/types/spreadsheet";
import { requiredColumns } from "@/lib/required-spreadsheet-columns";

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

        // Get header row and normalize column names
        const headerRow = spreadsheetData[0];
        const normalizeColumnName = (name: CellValue): string => {
            return String(name || "")
                .toLowerCase()
                .replace(/\s+/g, "");
        };

        // Create a map of normalized header names to their column indices
        const headerMap = new Map<string, number>();
        headerRow.forEach((header, index) => {
            headerMap.set(normalizeColumnName(header), index);
        });

        // Helper function to find column index by name
        const getColumnIndex = (columnName: string): number | undefined => {
            return headerMap.get(normalizeColumnName(columnName));
        };

        // Remove header row and filter out empty rows
        const dataRows = spreadsheetData
            .slice(1)
            .filter((row) => row.length > 0);

        // Count number of rows for number of students
        setStudents(dataRows.length);

        // Count unique schools using schoolId
        const schoolIdIdx = getColumnIndex("schoolId");
        if (schoolIdIdx !== undefined) {
            const schools = dataRows
                .map((row) => row[schoolIdIdx])
                .filter(Boolean);
            const uniqueSchoolsSet = new Set(schools);
            setUniqueSchools(uniqueSchoolsSet.size);
        }

        // Count unique teachers using teacherId
        const teacherIdIdx = getColumnIndex("teacherId");
        if (teacherIdIdx !== undefined) {
            const teachers = dataRows
                .map((row) => row[teacherIdIdx])
                .filter(Boolean);
            const uniqueTeachersSet = new Set(teachers);
            setNumTeachers(uniqueTeachersSet.size);
        }

        // Count unique projects using projectId
        const projectIdIdx = getColumnIndex("projectId");
        if (projectIdIdx !== undefined) {
            const projects = dataRows
                .map((row) => row[projectIdIdx])
                .filter(Boolean);
            const uniqueProjectsSet = new Set(projects);
            setNumProjects(uniqueProjectsSet.size);
        }
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
