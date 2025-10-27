import React, { useState } from "react";

type CheckboxProps = {
    label: string;
    onToggle?: (label: string, checked: boolean) => void;
};

export default function Checkbox({ label, onToggle }: CheckboxProps) {
    const [checked, setChecked] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        setChecked(isChecked);

        if (onToggle) onToggle(label, isChecked);
    };

    return (
        <label className="flex items-center space-x-3 relative cursor-pointer">
            {/* Checkbox box */}
            <input
                type="checkbox"
                checked={checked}
                onChange={handleChange}
                className="peer appearance-none w-6 h-6 border-2 border-gray-400 rounded transition-colors"
            />

            {/* X overlay */}
            <span className="absolute left-0 top-0 w-6 h-6 flex items-center justify-center text-sm text-blue-900 font-extrabold text-lg pointer-events-none peer-checked:flex hidden">
                ✕
            </span>

            {/* Label text */}
            <span>{label}</span>
        </label>
    );
}
