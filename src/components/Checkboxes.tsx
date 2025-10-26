"use client";

import React, { useState } from "react";

interface CheckboxProps {
    label: string;
    onToggle?: (label: string, checked: boolean) => void;
}

function Checkbox({ label, onToggle }: CheckboxProps) {
    const [checked, setChecked] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        setChecked(isChecked);

        if (onToggle) onToggle(label, isChecked);
    };

    return (
        <label className="flex items-center space-x-3 relative cursor-pointer">
            {/* Checkbox box */}
            <input
                type="checkbox"
                checked={checked}
                onChange={handleChange}
                className="peer appearance-none w-6 h-6 border-2 border-gray-400 rounded transition-colors"
            />

            {/* X overlay */}
            <span className="absolute left-0 top-0 w-6 h-6 flex items-center justify-center text-sm text-blue-900 font-extrabold text-lg pointer-events-none peer-checked:flex hidden">
                ✕
            </span>

            {/* Label text */}
            <span>{label}</span>
        </label>
    );
}

export default function Checkboxes() {
    const [checkedItems, setCheckedItems] = useState<string[]>([]);

    const [jokeText, setJokeText] = useState<string>();

    function addCheckedItem(item: string) {
        setCheckedItems((prev) => [...prev, item]);
    }

    function removeCheckedItem(item: string) {
        setCheckedItems((prev) => prev.filter((i) => i !== item));
    }

    function checkboxToggled(label: string, checked: boolean) {
        if (checked) {
            addCheckedItem(label);
        } else {
            removeCheckedItem(label);
        }
    }

    async function fetchJoke() {
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
            console.error("Error fetching joke:", error);
            setJokeText("Failed to fetch joke");
        }
    }

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
