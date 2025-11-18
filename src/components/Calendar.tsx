/* MAKE SURE TO WRAP PAGE THAT INCLUDES CALENDAR IN MANTINE PROVIDER */

"use client";

import React from "react";
import { Calendar } from "@mantine/dates"; // Calendar from Mantine library
import dayjs from "dayjs";
import { useState } from "react";
import "@mantine/core/styles.css"; // Mantine library for styling purposes
import "@mantine/dates/styles.css"; // Another Mantine library for returning
// date values and formatting them in usable method.

export default function MHDCalendar() {
    // Returning dates for TV shows using dayjs and Mantine
    const [selectedDate, setSelectedDate] = useState<string[]>([]);
    const handleSelect = (date: string) => {
        const isSelected = selectedDate.some((s) =>
            dayjs(date).isSame(s, "date"),
        );
        if (isSelected) {
            setSelectedDate((current) =>
                current.filter((d) => !dayjs(d).isSame(date, "date")),
            );
        } else if (selectedDate.length < 3) {
            setSelectedDate((current) => [...current, date]);
        }
    };

    const [response, setResponse] = useState<string>("");

    const handleSubmit = async () => {
        if (!selectedDate) return;
        const res = await fetch(`/api/calendar?date=${selectedDate}`);
        const shows = await res.text();
        setResponse(shows);

        // Reset selected date after submitting
        setSelectedDate([]);
    };

    return (
        // Calendar Formatting using Mantine
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="w-full max-w-[340px]">
                <Calendar
                    getDayProps={(date) => ({
                        selected: selectedDate.some((s) =>
                            dayjs(date).isSame(s, "date"),
                        ),
                        onClick: () => handleSelect(date),
                    })}
                />
                <p className="mt-4 text-gray-600">
                    Selected: {selectedDate ? selectedDate : "None"}
                </p>

                <button
                    onClick={handleSubmit}
                    className="mt-2 px-4 py-2 bg-blue-500 text-white justify-center rounded-lg hover:bg-blue-600 transition"
                >
                    Submit
                </button>
                {response && <p className="mt-2 text-gray-700">{response}</p>}
            </div>
        </div>
    );
}
