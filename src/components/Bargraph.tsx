import React from "react";
import Bargraph from "@/components/Bargraph";

export type BarDataset = {
    label: string;
    data: { year: number; value: number }[];
};

export default function DashboardPage() {
    // return <Bargraph />;

    return (
        <div className="min-h-screen flex justify-center items-center">
            <Bargraph />
        </div>
    );
}
