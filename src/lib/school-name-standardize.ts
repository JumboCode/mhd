/***************************************************************
 *
 *                school-name-standardize.ts
 *
 *         Author: Will and Hansini
 *           Date: 12/6/2025
 *
 *        Summary: Standardizes a school's name by removing
 *        certain words, characters, and white space
 *
 **************************************************************/

const words_to_remove: string[] = [
    "public",
    "school",
    "schools",
    "district",
    "the",
    "of",
    "+",
    "-",
    "=",
    "and",
    "at",
    "!",
    "@",
    "#",
    "$",
    "%",
    "^",
    "&",
    "*",
    "(",
    ")",
    ".",
];

export function standardize(name: string): string {
    const words = name.trim().toLowerCase().split(" ");
    const filtered = words.filter((w) => !words_to_remove.includes(w));
    return filtered
        .join("-")
        .replace(/\//g, "-") // convert slashes to hyphens first
        .replace(/[^a-z0-9-]/g, "") // then strip remaining special chars
        .replace(/-+/g, "-") // collapse multiple hyphens
        .replace(/^-|-$/g, ""); // trim leading/trailing hyphens
}
