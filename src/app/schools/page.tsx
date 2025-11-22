/***************************************************************
 *
 *                schools/page.tsx
 *
 *         Author: Anne Wu & Justin Ngan
 *           Date: 11/16/2025
 *
 *        Summary: Page to display all school profiles
 *
 **************************************************************/

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { SchoolsDataTable } from "@/components/DataTableSchools";
import { columns } from "@/components/Columns";

export default function SchoolsPage() {
    const [schoolInfo, setSchoolInfo] = useState([]);

    useEffect(() => {
        fetch(`/api/schools`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch school data`);
                }
                return response.json();
            })
            .then((data) => {
                setSchoolInfo(data);
                //console.log(schoolInfo);
            })
            .catch((error) => {
                //setError(error.message);
            });
    }, []);

    // let schoolInfo = [
    //     {
    //         name: "School",
    //         city: "Boston",
    //         region: "na",
    //         instructionModel: "na",
    //         implementationModel: "na",
    //         numStudents: 0,
    //         numTeachers: 0
    //     }
    // ]

    return (
        <div className="font-sans ml-40 mt-15">
            <div className="font-bold">
                <h1 className=" text-xl">Schools</h1>
                <h2 className="text-xs mt-1">Table Charts</h2>
            </div>
            <div className="container mt-5 overflow-x-auto">
                <SchoolsDataTable columns={columns} data={schoolInfo} />
            </div>
        </div>
    );
}
