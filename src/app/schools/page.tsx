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
import { SchoolsDataTable } from "@/components/DataTableSchools";
import { columns } from "@/components/Columns";
import YearDropdown from "@/components/YearDropdown";
import { MHDBreadcrumb } from "@/components/Breadcrumbs";
import SchoolSearchBar from "@/components/SchoolSearchbar";

export default function SchoolsPage() {
    const [schoolInfo, setSchoolInfo] = useState([]);
    const [year, setYear] = useState<number | null>(2018);
    const [search, setSearch] = useState("");

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
        <div className="font-sans mt-5">
            <div className="w-11/12 mx-auto">
                <div className="flex items-center font-bold">
                    {/*Table and charts need to be a toggle */}
                    <MHDBreadcrumb />
                    <div className="flex-1 text-center">
                        <h1 className="text-xl font-bold sm: pr-6">
                            {" "}
                            Schools{" "}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <YearDropdown
                            selectedYear={year}
                            onYearChange={setYear}
                        />
                        <SchoolSearchBar
                            search={search}
                            setSearch={setSearch}
                        />
                    </div>
                </div>

                <div className="mt-5 overflow-x-auto">
                    <SchoolsDataTable
                        columns={columns}
                        data={schoolInfo}
                        globalFilter={search}
                        setGlobalFilter={setSearch}
                    />
                </div>
            </div>
        </div>
    );
}
