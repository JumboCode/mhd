"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function SchoolProfilePage() {
    // retrieves dynamic route from url
    const params = useParams();
    const schoolName = params.name as string;

    const [schoolData, setSchoolData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const displayName = schoolName
        ? schoolName
              .split("-")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")
        : "";

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
                setLoading(false);
            })
            .catch((error) => {
                setError(error.message);
                setLoading(false);
            });
    }, [schoolName]);

    return (
        <div>
            <h1>School Profile Page: {schoolName}</h1>
            <p>{JSON.stringify(schoolData)}</p>
        </div>
    );
}
