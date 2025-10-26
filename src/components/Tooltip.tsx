"use client";

import { useState, useRef, useEffect } from "react";
import {
    useFloating,
    flip,
    shift,
    autoUpdate,
    arrow,
    offset,
} from "@floating-ui/react";
import { CircleQuestionMark } from "lucide-react";

export default function Tooltips() {
    // Visibility variables
    const [isHover, setIsHover] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    // Text from API fetch and timeout
    const [tooltipText, setTooltipText] = useState("");
    const showTimeout = useRef<NodeJS.Timeout | null>(null);

    // Ref for arrow element
    const arrowRef = useRef(null);

    // Floating UI setup, calculats positioning of tooltip
    // Referenced from floating UI code sandbox
    const { refs, floatingStyles, placement, middlewareData } = useFloating({
        open: isHover || isFocused,
        whileElementsMounted: autoUpdate,
        middleware: [
            offset(10), // Have tooltip 10px away from ? icon
            flip(), // Flip bottom/top on overflow
            shift({ padding: 8 }), // Slide left/right on overflow
            arrow({ element: arrowRef }), // Calculate where arrow should go
        ],
    });

    // Fetch tooltip text only if it is not currently focused and while hovering
    const fetchTooltip = () => {
        fetch("/api/tooltip")
            .then((res) => res.json())
            .then((data) => setTooltipText(data.text));
    };

    // Handles click logic
    const handleOnFocus = () => {
        setIsFocused(true);
    };

    // Handles click off logic
    const handleOnBlur = () => {
        setIsFocused(false);
    };

    // Handles mouse enter logic
    const handleOnMouseEnter = () => {
        if (!isFocused) fetchTooltip();
        showTimeout.current = setTimeout(() => setIsHover(true), 300);
    };

    // Handles mouse leave logic
    const handleOnMouseLeave = () => {
        setIsHover(false);
    };

    // Determines the side the arrow is on (for the speech box)
    const side = placement.split("-")[0] == "top" ? "bottom" : "top";

    return (
        <div className="fixed top-4 right-4 inline-block">
            <CircleQuestionMark
                ref={refs.setReference}
                className="m-1"
                tabIndex={0}
                aria-hidden={false}
                onFocus={handleOnFocus}
                onBlur={handleOnBlur}
                onMouseEnter={handleOnMouseEnter}
                onMouseLeave={handleOnMouseLeave}
            />
            <div
                ref={refs.setFloating}
                style={floatingStyles}
                className={`bg-black text-white p-3 rounded-lg w-64 break-words transition-all duration-300 transform ${
                    isHover || isFocused
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-1 pointer-events-none"
                }`}
            >
                <p className="text-center">{tooltipText}</p>
                <div
                    ref={arrowRef}
                    style={{
                        position: "absolute",
                        left: middlewareData.arrow?.x,
                        top: middlewareData.arrow?.y,
                        [side]: "-4px",
                    }}
                    className="w-2 h-2 rotate-45 bg-black"
                />
            </div>
        </div>
    );
}
