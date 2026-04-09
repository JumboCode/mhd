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
    // Match status bar exactly to labels
    const fillPercentage =
        tabIndex === 1
            ? (tabIndex / maxTabs) * 100 + 1
            : tabIndex === 2
              ? (tabIndex / maxTabs) * 100 - 2
              : (tabIndex / maxTabs) * 100;
    const barColor = hasError ? "bg-destructive" : "bg-primary";

    return (
        <div className="relative w-full h-1 bg-muted rounded-full">
            <div
                className={`h-1 ${barColor} rounded-full transition-all duration-300`}
                style={{ width: `${fillPercentage}%` }}
            ></div>
            {tabIndex === 0 && (
                <div
                    className={`absolute -top-1 left-0 w-3 h-3 rounded-full border-2 border-white ${"bg-primary"}`}
                />
            )}
        </div>
    );
}
