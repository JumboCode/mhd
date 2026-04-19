/***************************************************************
 *
 *                SpreadsheetPreview.tsx
 *
 *         Author: Will O'Leary & Zander Barba
 *           Date: 11/14/2025
 *
 *        Summary: Given a xlsx file, give some information about
 *        the contents of the file and display a preview of the
 *        first 5 rows
 *
 **************************************************************/
"use client";

import { useState, useEffect } from "react";
import { DataTable } from "./DataTable";
import { CircleCheck, FileChartColumn } from "lucide-react";
import type { CellValue, SpreadsheetData } from "@/types/spreadsheet";
import { studentRequiredColumns } from "@/lib/required-spreadsheet-columns";

type PreviewProps = {
    fileName: string;
    numRows: number;
    spreadsheetData: SpreadsheetData;
    /** Column names to display. Defaults to the student spreadsheet columns. */
    columns?: string[];
};

export default function SpreadsheetPreview({
    fileName,
    numRows,
    spreadsheetData,
    columns = studentRequiredColumns,
}: PreviewProps) {
    const [cols, setCols] = useState<
        { id: string; accessorKey: string; header: string }[]
    >([]);
    const [rows, setRows] = useState<CellValue[][]>([]);
    const [numCols, setNumCols] = useState<number>(0);

    useEffect(() => {
        if (!spreadsheetData || spreadsheetData.length === 0) return;

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

        const getColumnIndex = (columnName: string): number | undefined =>
            headerMap.get(normalizeColumnName(columnName));

        const schoolNameIdx =
            getColumnIndex("schoolName") ?? getColumnIndex("School name");
        const schoolIdIdx = getColumnIndex("schoolId");
        const teacherIdIdx = getColumnIndex("teacherId");
        const teacherNameIdx = getColumnIndex("teacherName");
        const projectIdIdx = getColumnIndex("projectId");
        const projectTitleIdx = getColumnIndex("title");

        // Student spreadsheets include schoolName and can be aggregated into
        // top participating schools. Fall back to plain preview for others.
        if (schoolNameIdx !== undefined) {
            type SchoolStats = {
                schoolName: string;
                studentCount: number;
                teacherIds: Set<string>;
                projectIds: Set<string>;
            };

            const statsBySchool = new Map<string, SchoolStats>();
            const dataRows = spreadsheetData
                .slice(1)
                .filter((row) =>
                    row.some((value) => String(value ?? "").trim().length > 0),
                );

            dataRows.forEach((row) => {
                const schoolName = String(row[schoolNameIdx] ?? "").trim();
                if (!schoolName) return;

                const schoolId = String(
                    schoolIdIdx !== undefined ? (row[schoolIdIdx] ?? "") : "",
                ).trim();
                const schoolKey = schoolId || schoolName.toLowerCase();

                if (!statsBySchool.has(schoolKey)) {
                    statsBySchool.set(schoolKey, {
                        schoolName,
                        studentCount: 0,
                        teacherIds: new Set<string>(),
                        projectIds: new Set<string>(),
                    });
                }

                const stats = statsBySchool.get(schoolKey);
                if (!stats) return;

                stats.studentCount += 1;

                const teacherValue = String(
                    teacherIdIdx !== undefined
                        ? (row[teacherIdIdx] ?? "")
                        : teacherNameIdx !== undefined
                          ? (row[teacherNameIdx] ?? "")
                          : "",
                ).trim();
                if (teacherValue) stats.teacherIds.add(teacherValue);

                const projectValue = String(
                    projectIdIdx !== undefined
                        ? (row[projectIdIdx] ?? "")
                        : projectTitleIdx !== undefined
                          ? (row[projectTitleIdx] ?? "")
                          : "",
                ).trim();
                if (projectValue) stats.projectIds.add(projectValue);
            });

            const topSchools = Array.from(statsBySchool.values())
                .sort((a, b) => {
                    if (b.studentCount !== a.studentCount) {
                        return b.studentCount - a.studentCount;
                    }
                    if (b.teacherIds.size !== a.teacherIds.size) {
                        return b.teacherIds.size - a.teacherIds.size;
                    }
                    if (b.projectIds.size !== a.projectIds.size) {
                        return b.projectIds.size - a.projectIds.size;
                    }
                    return a.schoolName.localeCompare(b.schoolName);
                })
                .slice(0, 5);

            setCols([
                { id: "0", accessorKey: "0", header: "School Name" },
                { id: "1", accessorKey: "1", header: "Student Count" },
                { id: "2", accessorKey: "2", header: "Teacher Count" },
                { id: "3", accessorKey: "3", header: "Project Count" },
            ]);
            setRows(
                topSchools.map((school) => [
                    school.schoolName,
                    school.studentCount,
                    school.teacherIds.size,
                    school.projectIds.size,
                ]),
            );
            setNumCols(4);
            return;
        }

        // Fallback: original preview behavior for non-student spreadsheets.
        const columnMapping: { index: number; displayName: string }[] = [];
        columns.forEach((col: string) => {
            const columnIndex = getColumnIndex(col);
            if (columnIndex === undefined) return;
            const displayName = col
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str: string) => str.toUpperCase())
                .trim();
            columnMapping.push({
                index: columnIndex,
                displayName,
            });
        });

        setCols(
            columnMapping.map((col, arrayIndex) => ({
                id: String(arrayIndex),
                accessorKey: String(arrayIndex),
                header: col.displayName,
            })),
        );
        setRows(
            spreadsheetData
                .slice(1, 6)
                .map((row) => columnMapping.map((col) => row[col.index])),
        );
        setNumCols(columnMapping.length);
    }, [spreadsheetData, columns]);

    return (
        <>
            <div className="flex flex-col items-center gap-12">
                <div className="flex flex-col items-center">
                    <CircleCheck className="w-16 h-16 text-primary" />
                    <h2 className="text-xl font-bold mt-5">
                        Your file looks good
                    </h2>
                </div>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <div className="flex gap-4 items-center">
                            <p className="font-bold w-32">File</p>
                            <div className="bg-muted pl-1 pr-2 rounded border flex items-center gap-1">
                                <FileChartColumn className="h-4 text-muted-foreground" />
                                <p>{fileName}</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <p className="font-bold w-32">Rows Found</p>
                            <p>{numRows} rows</p>
                        </div>
                        <div className="flex gap-4">
                            <p className="font-bold w-32">Columns</p>
                            <p>
                                {numCols} required columns were found and mapped
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <h2 className="text-xl font-bold mt-5 ">
                            Top Participating Schools
                        </h2>
                        <p className="text-muted-foreground">
                            Here are the top 5 highest participating schools
                            from your file
                        </p>
                    </div>
                </div>
                <div className="whitespace-nowrap overflow-x-auto max-w-2xl mb-10">
                    <DataTable data={rows} columns={cols} />
                </div>
            </div>
        </>
    );
}
