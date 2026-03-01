/***************************************************************
 *
 *                YearsOfData.tsx
 *
 *         Author: Zander Barba & Anne Wu
 *           Date: 02/20/2026
 *
 *        Summary: Years of Data display for settings page,
 *        including options for deletion
 *
 **************************************************************/

"use client";

import { Button } from "./ui/button";
import YearDropdown from "./YearDropdown";

import { useState } from "react";
import { toast } from "sonner";
// import { Button } from "@/components/ui/button";

export default function YearsOfData() {
    const [yearToDelete, setYearToDelete] = useState<number | null>(null);

    return (
        <div className="flex gap-4">
            <YearDropdown
                onYearChange={setYearToDelete}
                showDataIndicator={true}
            />
            <Button
                className="bg-red-600 hover:bg-red-800"
                onClick={handleClick}
            >
                Delete Year Data
            </Button>
        </div>
    );

    function handleClick() {
        fetch(`/api/delete-year?year=${yearToDelete}`).then((response) => {
            if (!response.ok) {
                toast(`Failed to delete data.`);
            }
        });
    }
}
