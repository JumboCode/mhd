"use client";

import React, { useState, useEffect } from "react";
import Checkbox from "./Checkbox";
import * as XLSX from "xlsx";

type ConfirmationProps = {
    file?: File;
};

export default function SpreadsheetConfirmation({ file }: ConfirmationProps) {
    const [uniqueSchools, setUniqueSchools] = useState<number>(0);
    const [students, setStudents] = useState<number>(0);
    const [numTeachers, setNumTeachers] = useState<number>(0);
    const [numProjects, setNumProjects] = useState<number>(0);

    useEffect(() => {
        if (!file) return;

        const reader = new FileReader();

        reader.onload = function (e) {
            if (!e.target?.result) return;

            const data = new Uint8Array(e.target.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: "array" });

            const worksheet = workbook.Sheets[workbook.SheetNames[0]];

            // Convert sheet to JSON with headers
            const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, {
                header: 1,
                defval: "",
            });

            if (jsonData.length === 0) {
                setUniqueSchools(0);
                return;
            }

            const students = jsonData
                .slice(1)
                .map((row) => row[1])
                .filter((value) => value !== "");

            setStudents(students.length);

            const schools = jsonData.slice(1).map((row) => row[37]);
            const schoolSet = Array.from(new Set(schools));

            setUniqueSchools(schoolSet.length);

            const teachers = jsonData.slice(1).map((row) => row[21]);
            const teacherSet = Array.from(new Set(teachers));

            setNumTeachers(teacherSet.length);

            const projects = jsonData.slice(1).map((row) => row[23]);
            const projectSet = Array.from(new Set(projects));

            setNumProjects(projectSet.length);
        };

        reader.readAsArrayBuffer(file);
    }, [file]);

    return (
        <div>
            <div className="flex flex-col items-left justify-left p-8">
                <h1 className="text-2xl font-bold mt-8">Confirmation</h1>
                <p className="text-gray-600 my-5">
                    You are about to override data - are you sure you want to do
                    this? This action cannot be undone.
                </p>
                <ul className="ml-5 my-5">
                    <li>{uniqueSchools} schools</li>
                    <li>{students} students</li>
                    <li>{numTeachers} teachers</li>
                    <li>{numProjects} projects</li>
                </ul>
                <div className="mt-5"></div>
                <Checkbox label="I understand"></Checkbox>
            </div>
        </div>
    );
}
