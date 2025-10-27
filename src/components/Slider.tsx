"use client";

import React from "react";
import { useState } from "react";

type SliderProps = {
    min: number;
    max: number;
};

type Character = {
    name: string;
    height: number;
    mass: number;
    hair_color: string;
    skin_color: string;
    eye_color: string;
    birth_year: string;
    gender: string;
};

export default function Slider({ min, max }: SliderProps) {
    const [value, setValue] = useState(min);
    const [display, setDisplay] = useState<Character>();
    const fillPercent = ((value - min) / (max - min)) * 100;

    async function fetchFromApi() {
        const response = await fetch(`/api/slider?characterID=${value}`);
        const data = await response.json();
        setDisplay(data);
    }

    return (
        <>
            <div className="flex gap-10 items-center flex-col">
                <h1 className="text-xl font-bold mb-2">
                    Drag and slide to reveal new characters
                </h1>
                <div className="flex">
                    <input
                        min={min}
                        max={max}
                        type="range"
                        onChange={(e) => setValue(Number(e.target.value))}
                        className="w-80 h-2 appearance-none rounded-lg cursor-pointer accent-gray-700 mb-5"
                        style={{
                            background: `linear-gradient(to right, 
                        rgb(45, 46, 48) 0%, 
                        rgb(45, 46, 48) ${fillPercent}%, 
                        rgb(209,213,219) ${fillPercent}%, 
                        rgb(209,213,219) 100%)`,
                        }}
                    />
                    <p className="ml-5">{value}</p>
                </div>

                <button
                    onClick={fetchFromApi}
                    className="rounded-lg h-12 w-40 bg-sky-900 m-2 flex items-center justify-center text-white text-lg m-4"
                >
                    Submit
                </button>
                <p>Character name: {display?.name}</p>
                <p>Character height: {display?.height}</p>
                <p>Birth year: {display?.birth_year}</p>
            </div>
        </>
    );
}
