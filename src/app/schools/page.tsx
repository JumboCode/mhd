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
import YearDropdown from "@/components/YearDropdown";
import { MHDBreadcrumb } from "@/components/Breadcrumbs";
import SchoolSearchBar from "@/components/SchoolSearchbar";

export default function SchoolsPage() {
    const [schoolInfo, setSchoolInfo] = useState([]);
    const [year, setYear] = useState<number | null>(2018);

    useEffect(() => {
        fetch(`/api/schools?year=` + year)
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
                console.log(error);
            });
    }, [year]);

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
        <div className="font-sans ml-40 mt-5">
            <div className="flex items-center font-bold">
                {/*Table and charts need to be a toggle */}
                <MHDBreadcrumb />
                <div className="flex-1 text-center">
                    <h1 className="text-xl font-bold"> Schools </h1>
                </div>

                <div className="flex items-center gap-4">
                    <YearDropdown selectedYear={year} onYearChange={setYear} />
                    {/* I think we'd add the search bar here*/}
                    <SchoolSearchBar />
                </div>
            </div>

            <div className="container mt-5 overflow-x-auto">
                <SchoolsDataTable columns={columns} data={schoolInfo} />
            </div>
        </div>
    );
}
