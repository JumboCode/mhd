"use client";

import { useState } from "react";
import { CircleQuestionMark } from "lucide-react";

export default function Tooltips({ text }: { text: string }) {
    const [isHover, setIsHover] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const handleOnFocus = () => {
        setIsFocused(true);
    };

    const handleOnBlur = () => {
        setIsFocused(false);
    };

    const handleOnMouseEnter = () => {
        setIsHover(true);
    };

    const handleOnMouseLeave = () => {
        setIsHover(false);
    };

    return (
        <div className="relative inline-block">
            <CircleQuestionMark
                className="m-1"
                // makes element focusable
                tabIndex={0}
                // supresses aria error (lucide icons have aria-hidden as true)
                aria-hidden={false}
                onFocus={handleOnFocus}
                onBlur={handleOnBlur}
                onMouseEnter={handleOnMouseEnter}
                onMouseLeave={handleOnMouseLeave}
            />
            {(isHover || isFocused) && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black text-white p-3 rounded-lg max-w-sm w-64 align-center">
                    <p style={{ textAlign: "center" }}>{text}</p>

                    <div
                        className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 
                                border-l-[10px] border-l-transparent 
                                border-r-[10px] border-r-transparent 
                                border-t-[10px] border-t-black -mb-2 
                                transform"
                    ></div>
                </div>
            )}
        </div>
    );
}
