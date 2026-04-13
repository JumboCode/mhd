import { useEffect } from "react";

type HotkeyOptions = {
    /** Whether the hotkey should be disabled */
    disabled?: boolean;
    /** Prevent default browser behavior */
    preventDefault?: boolean;
    /** Require Cmd (Mac) / Ctrl (Windows/Linux) modifier */
    meta?: boolean;
};

/**
 * Hook to register a keyboard shortcut
 *
 * @param key - The key to listen for (case-insensitive, e.g., "b", "l", "Enter")
 * @param callback - Function to call when the key is pressed
 * @param options - Optional configuration
 *
 * @example
 * useHotkey("b", () => setChartType("bar"));
 * useHotkey("s", () => openExportDialog(), { meta: true });
 */
export function useHotkey(
    key: string,
    callback: () => void,
    options: HotkeyOptions = {},
) {
    const { disabled = false, preventDefault = true, meta = false } = options;

    useEffect(() => {
        if (disabled) return;

        const handler = (event: KeyboardEvent) => {
            // Ignore if user is typing in an input, textarea, or contenteditable
            const target = event.target as HTMLElement;
            if (
                target.isContentEditable ||
                target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA" ||
                target.tagName === "SELECT"
            ) {
                return;
            }

            const hasModifier = event.metaKey || event.ctrlKey;

            if (meta) {
                // Require modifier for meta hotkeys
                if (!hasModifier) return;
            } else {
                // Ignore modifier keys for plain hotkeys
                if (event.metaKey || event.ctrlKey || event.altKey) return;
            }

            if (event.key.toLowerCase() === key.toLowerCase()) {
                if (preventDefault) {
                    event.preventDefault();
                }
                callback();
            }
        };

        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [key, callback, disabled, preventDefault, meta]);
}
