"use client";

import React from "react";
import { useState } from "react";

type SliderProps = {
    min: number;
    max: number;
};

export default function Slider({ min, max }: SliderProps) {
    const [value, setValue] = useState();
    const [display, setDisplay] = useState();

    function handleValue(e: React.ChangeEvent<any>) {
        setValue(e.target.value);
    }

    function updateValue() {
        setDisplay(value);
    }

    return (
        <>
            <div className="flex gap-10 items-center flex-col">
                <h1>Drag and slide to reveal new characters</h1>
                <input min={min} max={max} type="range" onInput={handleValue} />
                <button
                    onClick={updateValue}
                    className="rounded-xl h-12 w-20 bg-gray-300 m-2 flex items-center justify-center"
                >
                    Submit
                </button>
                <p>Current value: {display}</p>
            </div>
            s
        </>
    );
}
