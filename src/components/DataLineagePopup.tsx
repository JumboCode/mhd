"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

export interface DataLineageItem {
    title: string;
    description: string;
}

export interface DataLineageSection {
    label: string;
    items: DataLineageItem[];
    color: "blue" | "orange";
}

export interface DataLineagePopupProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    metricTitle: string;
    metricDescription: string;
    sections: DataLineageSection[];
}

const colorClasses = {
    blue: "border-blue-500",
    orange: "border-orange-400",
};

const lineColorClasses = {
    blue: "bg-blue-200",
    orange: "bg-orange-200",
};

function StepItem({
    item,
    color,
    isLast,
}: {
    item: DataLineageItem;
    color: "blue" | "orange";
    isLast: boolean;
}) {
    return (
        <div className="flex gap-3">
            <div className="flex flex-col items-center shrink-0">
                <div
                    className={`w-5 h-5 rounded-full border-2 bg-white mt-0.5 shrink-0 ${colorClasses[color]}`}
                />
                {!isLast && (
                    <div
                        className={`w-px flex-1 my-1 ${lineColorClasses[color]}`}
                    />
                )}
            </div>
            <div className={`${isLast ? "pb-0" : "pb-4"}`}>
                <p className="text-sm font-semibold leading-snug">
                    {item.title}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5 leading-snug">
                    {item.description}
                </p>
            </div>
        </div>
    );
}

export function DataLineagePopup({
    open,
    onOpenChange,
    metricTitle,
    metricDescription,
    sections,
}: DataLineagePopupProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                        Data Lineage: {metricTitle}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        {metricDescription}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-5 mt-1">
                    {sections.map((section) => (
                        <div key={section.label}>
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                                {section.label}
                            </p>
                            <div>
                                {section.items.map((item, i) => (
                                    <StepItem
                                        key={i}
                                        item={item}
                                        color={section.color}
                                        isLast={i === section.items.length - 1}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
