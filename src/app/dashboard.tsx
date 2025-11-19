/***************************************************************
 *
 *                dashboard.tsx
 *
 *         Author: Justin
 *           Date: 11/19/2025
 *
 *        Summary: Main dashboard page displaying yearly statistics
 *                 with layout and sidebar expansion animations
 *
 **************************************************************/

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useExpanded } from "@/context/ExpandedContext";

export default function Dashboard() {
    const { isExpanded } = useExpanded();
    const [year, setYear] = useState(2024);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    async function fetchStats(selectedYear: number) {
        setLoading(true);
        try {
            const res = await fetch(`/api/yearly-totals?year=${selectedYear}`);
            const data = await res.json();
            setStats(data);
        } catch (err) {
            console.error("fetchStats error:", err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchStats(year);
    }, [year]);

    return (
        <motion.div
            className="px-8 md:px-12 lg:px-16 py-16 md:py-20 lg:py-24"
            animate={{
                marginLeft: isExpanded ? 224 : 72,
                width: isExpanded ? "calc(100% - 224px)" : "calc(100% - 72px)",
                scale: isExpanded ? 0.95 : 1,
            }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
        >
            {/* Header and dropdown menu */}
            <motion.h1
                className="text-xl sm:text-xl md:text-2xl lg:text-3x1 font-semibold mb-4 md:mb-6"
                animate={{
                    opacity: isExpanded ? 0.9 : 1,
                }}
            >
                Overview Dashboard
            </motion.h1>
            <motion.div
                className="mb-3 md:mb-4"
                animate={{
                    opacity: isExpanded ? 0.85 : 1,
                }}
                transition={{ duration: 0.3 }}
            >
                {/*Dropdown menu*/}
                <div className="w-32 sm:w-36 md:w-40">
                    <select
                        value={year}
                        onChange={(e) => setYear(parseInt(e.target.value))}
                        className="border border-gray-300 rounded-lg px-3 md:px-4py-1.5 md:py-2 w-full text-sm md:text-base text-gray-700 shadow-sm"
                    >
                        {[2024, 2023, 2022, 2021].map((y) => (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        ))}
                    </select>
                </div>
            </motion.div>

            {loading && <p className="text-gray-500">Loading...</p>}

            {stats && !loading && (
                <motion.div
                    className="space-y-10"
                    animate={{
                        opacity: isExpanded ? 0.85 : 1,
                        scale: isExpanded ? 0.95 : 1,
                    }}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                >
                    <div className="grid grid-cols-3 sm:grid-cols-3 xl:grid-cols-3 gap-5">
                        <StatCard
                            label="Total # Projects"
                            value={stats.totals.total_projects}
                        />
                        <StatCard
                            label="Total # Teachers"
                            value={stats.totals.total_teachers}
                        />
                        <StatCard
                            label="Total # Students"
                            value={stats.totals.total_students}
                        />
                        <StatCard
                            label="# Schools"
                            value={stats.totals.total_schools}
                        />
                        <StatCard label="% Highschool" value={0} />
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}
{
    /*Statcard component used to display all totals*/
}
function StatCard({ label, value }: { label: string; value: number }) {
    return (
        <div className="bg-white border border-gray-200 rounded-lg md:rounded-xl shadow-sm p-3 md:p-5 text-center">
            <h3 className="text-black text-xs sm:text-sm md:text-sm mb-1 md:mb-2 font-medium">
                {label}
            </h3>
            <p className="text-2xl sm:text-2xl md:text-3xl font-sans font-bold tracking-tight text-black">
                {value.toLocaleString()}
            </p>
        </div>
    );
}
