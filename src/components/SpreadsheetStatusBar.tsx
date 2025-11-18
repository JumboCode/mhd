/***************************************************************
 *
 *                SpreadsheetStatusBar.tsx
 *
 *         Author: Will O'Leary & Zander Barba
 *           Date: 11/14/2025
 *
 *        Summary: Status bar for the spreadsheet upload pipeline
 *
 **************************************************************/

"use client";

import React from "react";

type StatusBarProps = {
    tabIndex: number;
    maxTabs?: number;
};

export default function StatusBar({ tabIndex, maxTabs = 3 }: StatusBarProps) {
    const fillPercentage = (tabIndex / maxTabs) * 100;

    return (
        <div className="w-full h-3 bg-gray-300 rounded-full">
            <div
                className="h-3 bg-blue-800 rounded-full transition-all duration-300"
                style={{ width: `${fillPercentage}%` }}
            ></div>
        </div>
    );
}
