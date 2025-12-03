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

export function standardize(name: string) {
    // Trim whitespace
    var school_name = name.trim();

    // Convert to lowercase
    school_name = school_name.toLowerCase();

    const words = school_name.split(" ");

    // Filtering out extraneous words referring to the array above
    // Remove the extraneous words
    const filtered = words.filter((word) => {
        return !words_to_remove.includes(word);
    });

    return filtered.join("");
}
