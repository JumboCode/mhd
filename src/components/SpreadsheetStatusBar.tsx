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
    hasError?: boolean;
};

export default function StatusBar({
    tabIndex,
    maxTabs = 3,
    hasError = false,
}: StatusBarProps) {
    const fillPercentage = (tabIndex / maxTabs) * 100;
    const barColor = hasError ? "bg-destructive" : "bg-primary";

    return (
        <div className="w-full h-3 bg-muted rounded-full">
            <div
                className={`h-3 ${barColor} rounded-full transition-all duration-300`}
                style={{ width: `${fillPercentage}%` }}
            ></div>
        </div>
    );
}
