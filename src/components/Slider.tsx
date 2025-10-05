"use client";

import React from "react";

export default function Slider() {
    return (
        <div>
            <input type="range" min="1" max="10" />
            <p>Trivia will appear here</p>
        </div>
    );
}
