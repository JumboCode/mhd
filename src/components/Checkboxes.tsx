"use client";

import Checkbox from "@/components/Checkbox";
import React, { useState } from "react";

export default function Checkboxes() {
    const [checkedItems, setCheckedItems] = useState<string[]>([]);

    const [jokeText, setJokeText] = useState<string>();

    const addCheckedItem = (item: string) => {
        setCheckedItems((prev) => [...prev, item]);
    };

    const removeCheckedItem = (item: string) => {
        setCheckedItems((prev) => prev.filter((i) => i !== item));
    };

    const checkboxToggled = (label: string, checked: boolean) => {
        if (checked) {
            addCheckedItem(label);
        } else {
            removeCheckedItem(label);
        }
    };

    const fetchJoke = async () => {
        let selectedCategoriesString = "any";
        if (checkedItems.length !== 0) {
            selectedCategoriesString = checkedItems.join(",");
        }

        try {
            const response = await fetch(
                `/api/checkbox?categories=${encodeURIComponent(selectedCategoriesString)}`,
            );
            if (!response.ok) throw new Error("Network response was not ok");

            const data = await response.json();
            const joke = `${data.setup} ${data.delivery}`;
            setJokeText(joke);
        } catch (error) {
            setJokeText("Failed to fetch joke: " + error);
        }
    };

    return (
        <div>
            {/* Page Title */}
            <div className="flex flex-col items-center justify-center">
                <h1 className="text-4xl font-bold mt-8">Checkboxes</h1>
                <h2 className="text-2xl text-red-800 font-bold">
                    Zander & Justin
                </h2>
            </div>

            {/* Panel */}
            <div className="bg-white px-8 py-8 rounded-lg shadow-lg w-120 flex flex-col items-center space-y-4 m-8">
                <h2 className="text-xl font-bold mb-4">
                    Choose your favorite joke category
                </h2>

                {/* Vertical stack of checkboxes */}
                <div className="flex flex-col items-start space-y-2 w-full">
                    <Checkbox label="Programming" onToggle={checkboxToggled} />
                    <Checkbox label="Misc" onToggle={checkboxToggled} />
                    <Checkbox label="Dark" onToggle={checkboxToggled} />
                    <Checkbox label="Spooky" onToggle={checkboxToggled} />
                    <Checkbox label="Christmas" onToggle={checkboxToggled} />
                </div>

                {/* Submit button */}
                <button
                    type="submit"
                    onClick={fetchJoke}
                    className="mt-4 w-full bg-blue-900 text-white py-2 rounded-lg hover:bg-blue-950 transition-colors"
                >
                    Submit
                </button>

                {/* Joke Text */}
                <h2 className="text-xl m-4">{jokeText}</h2>
            </div>
        </div>
    );
}
