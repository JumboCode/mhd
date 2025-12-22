"use client";

import type React from "react";
import { useState } from "react";

export default function Input() {
    const [numInput, setNumInput] = useState<number | null>(null);
    const [questionDisplay, setQuestionDisplay] = useState("");
    const [answerDisplay, setAnswerDisplay] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [buttonStyle, setButtonStyle] = useState(
        "bg-primary hover:bg-primary/90 text-primary-foreground rounded-md w-30 h-10 my-2 display-block",
    );

    // used to get rid of stuff like &quot; in the question string
    const decodeHtmlEntities = (str: string) => {
        const textarea = document.createElement("textarea");
        textarea.innerHTML = str;
        return textarea.value;
    };

    // doesn't allow user to enter non-digit values in the textbox
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const input = event.target;
        input.value = input.value.replace(/[^0-9.]/g, "");
        setNumInput(Number(input.value));
    };

    const styleClickedButton = () => {
        setButtonStyle(
            buttonStyle.replace(
                "bg-primary hover:bg-primary/90",
                "bg-primary/80",
            ),
        );
    };
    const revertClickedButtonStyle = () => {
        setButtonStyle(
            buttonStyle.replace(
                "bg-primary/80",
                "bg-primary hover:bg-primary/90",
            ),
        );
    };

    const handleSubmit = async () => {
        setQuestionDisplay("Loading...");
        setAnswerDisplay("");
        setError(null);
        try {
            const response = await fetch(`/api/input-field?input=` + numInput);
            const data = await response.json();
            const question = decodeHtmlEntities(data.results[0].question);
            const answer = decodeHtmlEntities(data.results[0].correct_answer);
            if (response.ok) {
                if (data.results[0].type === "boolean") {
                    setQuestionDisplay("True or False: " + question);
                } else {
                    setQuestionDisplay(question);
                }
                setAnswerDisplay(answer);
            } else {
                setError("Error with your input, please try again");
            }
        } catch (error) {
            setError(
                error instanceof Error
                    ? `Error with api response: ${error.message}`
                    : "Error with api response. Please try again.",
            );
        }
    };

    return (
        <div className="flex flex-col gap-5 items-center w-[250px]">
            <p className="font-bold w-full text-left">Type Something</p>
            <div className="w-full">
                <input
                    onChange={handleChange}
                    placeholder={"Input a number!"}
                    className={`w-full px-4 placeholder-[#9d9d9d] py-2 border-2 rounded-[5px] focus:outline-none focus:ring-3 focus:ring-[#457BAF]/43 ${
                        error
                            ? "border-destructive focus:border-destructive"
                            : "border-[#D0CECE] hover:border-[#22405D] focus:border-[#22405D]"
                    }`}
                    required
                    aria-invalid={error ? "true" : "false"}
                    aria-describedby={error ? "input-error" : undefined}
                />
                {error && (
                    <p
                        id="input-error"
                        className="mt-1 text-sm text-destructive"
                        role="alert"
                    >
                        {error}
                    </p>
                )}
            </div>

            <button
                type="button"
                className={buttonStyle}
                onMouseDown={styleClickedButton}
                onMouseUp={revertClickedButtonStyle}
                onClick={handleSubmit}
            >
                Submit
            </button>

            <p className="flex justify-center h-28 my-4 text-[#AF272F]">
                {questionDisplay}
            </p>

            <p className="flex justify-center h-4">{answerDisplay}</p>
        </div>
    );
}
