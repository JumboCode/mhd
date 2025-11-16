/***************************************************************
 *
 *                preprocess.ts
 *
 *         Author: Jack Liu & Steven Bagade
 *           Date: 11/16/2025
 *
 *        Summary: Functions to preprocess and validate data
 *                 entries from the spreadsheet.
 *
 **************************************************************/

export function capitalization(name: string, delim: string): boolean {
    if (!name || typeof name !== "string") return false;

    const words = name.split(delim);
    for (const word of words) {
        // Skip empty strings from double delimiters or leading/trailing spaces
        if (word.length === 0) continue;

        if (!isUpper(word[0])) return false;
        for (let i = 1; i < word.length; i++) {
            if (!isLower(word[i])) return false;
        }
    }
    return true;
}

export function grade(g: number): boolean {
    if (g === null || g === undefined || typeof g !== "number" || isNaN(g)) {
        return false;
    }
    return 1 <= g && g <= 12;
}

export function zipcode(code: string): boolean {
    if (!code || typeof code !== "string") return false;

    if (code.length !== 5 && code.length !== 10) return false;

    for (let i = 0; i < 5; i++) {
        if (!isNum(code[i])) return false;
    }

    if (code.length === 10) {
        if (code[5] !== "-") return false;
        for (let i = 6; i < 10; i++) {
            if (!isNum(code[i])) return false;
        }
    }
    return true;
}

export function email(url: string): boolean {
    if (!url || typeof url !== "string") return false;

    // Regex, parses segments separated by @ and .
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return url.length <= 254 && pattern.test(url);
}

export function division(div: string): boolean {
    if (!div || typeof div !== "string") return false;

    return div === "Junior" || div === "Senior" || div === "Elementary";
}

export function gender(gender: string): boolean {
    if (!gender || typeof gender !== "string") return false;

    // Can be configured differently later (once we have full list)
    return (
        gender === "M" ||
        gender === "F" ||
        gender === "O" ||
        gender === "N" ||
        gender === "Z"
    );
}

export function team(t: string): boolean {
    if (!t || typeof t !== "string") return false;

    return t === "True" || t === "False";
}

export function release(t: string): boolean {
    if (!t || typeof t !== "string") return false;

    return t === "Yes" || t === "No";
}

// Helper exports
export function isUpper(c: string): boolean {
    return c >= "A" && c <= "Z";
}

export function isLower(c: string): boolean {
    return c >= "a" && c <= "z";
}

export function isNum(c: string): boolean {
    return c >= "0" && c <= "9";
}
