import React from "react";
import { CheckIcon, ChevronDown, XIcon } from "lucide-react";

export interface MultiSelectOption {
    label: string;
    value: string;
}

export interface MultiSelectProps {
    options: MultiSelectOption[];
    value?: string[];
    defaultValue?: string[];
    onValueChange: (v: string[]) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    searchable?: boolean;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
    options,
    value,
    defaultValue = [],
    onValueChange,
    placeholder = "Select options",
    className,
    disabled = false,
    searchable = true,
}) => {
    const isControlled = value !== undefined;
    const [internal, setInternal] = React.useState(defaultValue);
    const selected = isControlled ? value! : internal;

    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState("");

    const triggerRef = React.useRef<HTMLDivElement>(null);

    const setSelected = (vals: string[]) => {
        if (!isControlled) setInternal(vals);
        onValueChange(vals);
    };

    const toggle = (val: string) => {
        if (selected.includes(val)) {
            setSelected(selected.filter((x) => x !== val));
        } else {
            setSelected([...selected, val]);
        }
    };

    const clear = () => setSelected([]);

    const filtered = search
        ? options.filter((o) =>
              o.label.toLowerCase().includes(search.toLowerCase()),
          )
        : options;

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (
                triggerRef.current &&
                !triggerRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div className={className} ref={triggerRef}>
            {/* Trigger */}
            <div
                onClick={() => !disabled && setOpen(!open)}
                className={`
          border rounded px-3 py-2 flex items-center justify-between cursor-pointer 
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
            >
                {/* Selected Items */}
                {selected.length === 0 ? (
                    <span className="text-gray-500">{placeholder}</span>
                ) : (
                    <div className="flex flex-wrap gap-1">
                        {selected.map((val) => {
                            const opt = options.find((o) => o.value === val);
                            if (!opt) return null;

                            return (
                                <span
                                    key={val}
                                    className="flex items-center gap-1 bg-gray-200 px-2 py-1 rounded text-sm"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {opt.label}
                                    <XIcon
                                        className="h-3 w-3 cursor-pointer"
                                        onClick={() => toggle(val)}
                                    />
                                </span>
                            );
                        })}
                    </div>
                )}

                <ChevronDown className="w-4 h-4 text-gray-600" />
            </div>

            {/* Dropdown */}
            {open && (
                <div className="mt-1 w-full border rounded bg-white shadow p-2 absolute z-50">
                    {/* Search */}
                    {searchable && (
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search..."
                            className="w-full border rounded px-2 py-1 mb-2"
                        />
                    )}

                    <div className="max-h-60 overflow-auto space-y-1">
                        {/* Select All */}
                        <div
                            onClick={() =>
                                selected.length === options?.length
                                    ? clear()
                                    : setSelected(options?.map((o) => o.value))
                            }
                            className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 cursor-pointer"
                        >
                            <div
                                className={`w-4 h-4 border rounded flex items-center justify-center ${
                                    selected.length === options?.length
                                        ? "bg-blue-600 text-white"
                                        : "opacity-50"
                                }`}
                            >
                                <CheckIcon className="w-3 h-3" />
                            </div>
                            Select All
                        </div>

                        {/* Options */}
                        {filtered?.map((o) => {
                            const isSelected = selected.includes(o.value);

                            return (
                                <div
                                    key={o.value}
                                    className={`flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-gray-100 ${""}`}
                                    onClick={() => toggle(o.value)}
                                >
                                    <div
                                        className={`w-4 h-4 border rounded flex items-center justify-center ${
                                            isSelected
                                                ? "bg-blue-600 text-white"
                                                : "opacity-50"
                                        }`}
                                    >
                                        <CheckIcon className="w-3 h-3" />
                                    </div>
                                    {o.label}
                                </div>
                            );
                        })}

                        <hr className="my-2" />

                        {/* Clear */}
                        {selected.length > 0 && (
                            <div
                                className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                                onClick={clear}
                            >
                                Clear
                            </div>
                        )}

                        {/* Close */}
                        <div
                            className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                            onClick={() => setOpen(false)}
                        >
                            Close
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
