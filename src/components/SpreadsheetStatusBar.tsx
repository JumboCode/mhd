"use client";

import React from "react";

type StatusBarProps = {
    tabIndex: number;
    maxTabs?: number;
};

export default function StatusBar({ tabIndex, maxTabs = 3 }: StatusBarProps) {
    let fillPercentage = (tabIndex / maxTabs) * 100;

    return (
        <div className="w-full h-3 bg-gray-300 rounded-full">
            <div
                className="h-3 bg-blue-800 rounded-full transition-all duration-300"
                style={{ width: `${fillPercentage}%` }}
            ></div>
        </div>
    );
}
