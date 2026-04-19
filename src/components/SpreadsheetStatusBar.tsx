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

    const dotColor = hasError ? "bg-destructive" : "bg-primary";
    const dots = [0, 1, 2, 3];

    return (
        <div className="relative w-full">
            <div className="w-full h-0.5 bg-muted rounded-full">
                <div
                    className={`h-0.5 ${barColor} rounded-full transition-[width,background-color] duration-300`}
                    style={{ width: `${fillPercentage}%` }}
                />
            </div>
            {dots.map((step) => {
                const filled = visualStep >= step;
                return (
                    <div
                        key={step}
                        className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full border-2 transition-[background-color,border-color] duration-300 ${
                            filled
                                ? `${dotColor} border-transparent`
                                : "bg-background border-muted"
                        }`}
                        style={{ left: `${(step / 3) * 100}%` }}
                    />
                );
            })}
        </div>
    );
}
