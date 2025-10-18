"use client";

import React from "react";
import { useState } from "react";
import { useEffect } from "react";

export default function Input({}) {
    const [numInput, setNumInput] = useState<number | null>(null);
    const [apiResponse, setApiResponse] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const input = event.target;
        input.value = input.value.replace(/[^0-9.]/g, "");
        setNumInput(Number(input.value));
    };

    const handleSubmit = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const response = await fetch(`/api/input-field?input=` + numInput);
            const data = await response.json();
            if (response.ok) {
                setApiResponse(data);
            } else {
                setApiResponse("Error with your input, please try again");
            }
        } catch (error) {
            alert("error with api!");
        }
    };

    return (
        <div className="flex flex-col gap-[25px] items-center w-[250px]">
            <input
                onChange={handleChange}
                placeholder={"Input a number!"}
                className="w-full px-4 placeholder-[#9d9d9d] py-2 border-2 border-[#D0CECE] rounded-[5px] hover:border-[#22405D] focus:border-[#22405D] focus:outline-none focus:ring-3 focus:ring-[#457BAF]/43"
                required
            />

            <button
                type="button"
                className="bg-[#22405D] text-white rounded-[5px] w-[125px] h-[40px] hover:bg-[#457baf] display-block"
                onClick={handleSubmit}
            >
                Submit
            </button>

            <p>{JSON.stringify(apiResponse)}</p>
        </div>
    );
}
