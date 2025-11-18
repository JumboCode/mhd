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

import React, { useState, useEffect } from "react";
import Checkbox from "./Checkbox";
import { School, GraduationCap, User, FolderOpenDot } from "lucide-react";
import type { SpreadsheetData } from "@/types/spreadsheet";

type ConfirmationProps = {
    year?: number | null;
    spreadsheetData: SpreadsheetData;
};

export default function SpreadsheetConfirmation({
    year,
    spreadsheetData,
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
        <div>
            <div className="flex flex-col items-left justify-left p-8">
                <h1 className="text-2xl font-bold mt-8">Confirmation</h1>
                <p className="text-gray-600 my-5">
                    You are about to override data for {year} - are you sure you
                    want to do this? This action cannot be undone.
                </p>
                <ul className="ml-5 my-5">
                    <li className="flex">
                        <School className="inline-block mr-2 mb-1" />
                        <p>{uniqueSchools} schools</p>
                    </li>
                    <li className="flex">
                        <GraduationCap className="inline-block mr-2 mb-1" />
                        <p>{students} students</p>
                    </li>
                    <li className="flex">
                        <User className="inline-block mr-2 mb-1" />
                        <p>{numTeachers} teachers</p>
                    </li>
                    <li className="flex">
                        <FolderOpenDot className="inline-block mr-2 mb-1" />
                        <p>{numProjects} projects</p>
                    </li>
                    <li className="mt-10">
                        <Checkbox label="I understand"></Checkbox>
                    </li>
                </ul>
                <div className="mt-5"></div>
            </div>
        </div>
    );
}
