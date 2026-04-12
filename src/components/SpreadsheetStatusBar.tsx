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
    hasError = false,
}: StatusBarProps) {
    const progressMap: Record<number, number> = {
        0: 0,
        1: 0,
        2: 1,
        3: 1,
        4: 2,
        5: 3,
    };
    const visualStep = progressMap[tabIndex] ?? 0;
    const fillPercentage = (visualStep / 3) * 100;
    const barColor = hasError ? "bg-destructive" : "bg-primary";

    return (
        <div className="w-full h-1 bg-muted rounded-full">
            <div
                className={`h-1 ${barColor} rounded-full transition-all duration-300`}
                style={{ width: `${fillPercentage}%` }}
            />
        </div>
    );
}
