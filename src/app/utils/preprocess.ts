import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// Recreate __dirname and __filename in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function main() {
    try {
        const dataPath = path.join(
            __dirname,
            "../../../public/sample_data.json",
        );
        const raw = fs.readFileSync(dataPath, "utf-8");
        const data = JSON.parse(raw);

        let ret_data = [];
        // This is used in testing
        // let numValid = 0, total = data.length;
        for (const entry of data) {
            try {
                let valid = true;
                valid &&= capitalization(entry["City"], " ");
                valid &&= capitalization(entry["Teacher First"], " ");
                valid &&= capitalization(entry["Teacher Last"], " ");
                valid &&= grade(entry["Grade"]);
                valid &&= zipcode(entry["Zip"]);
                valid &&= division(entry["Division"]);
                valid &&= team(entry["Team Project"]);
                valid &&= gender(entry["Student Gender"]);
                valid &&= release(entry["Media Release Allowed"]);
                valid &&= email(entry["Teacher Email"]);

                // Ignores invalid data entries
                if (valid) {
                    ret_data.push(entry);
                    // numValid++;
                }

                // Allows us to see what failed & Why, used in testing
                // if (!valid) {
                //     console.log("Invalid Entry: ")
                //     console.log(entry["City"]);
                //     console.log(entry["Teacher First"]);
                //     console.log(entry["Teacher Last"]);
                //     console.log(entry["Grade"]);
                //     console.log(entry["Zip"]);
                //     console.log(entry["Division"]);
                // }
            } catch (e) {
                console.error("Unable to parse entry:");
                console.error(entry);
                console.error("Source:", e);
            }
        }

        // console.error(numValid + ", " + total);
        return ret_data;
    } catch (err) {
        console.error("Error loading or parsing file:", err);

        // Returns null because parsing failed
        return null;
    }
}

function capitalization(name: string, delim: string): boolean {
    const words = name.split(delim);
    for (const word of words) {
        if (!isUpper(word[0])) return false;
        for (let i = 1; i < word.length; i++) {
            if (!isLower(word[i])) return false;
        }
    }
    return true;
}

function grade(g: number): boolean {
    return 1 <= g && g <= 12;
}

function zipcode(code: string): boolean {
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

function email(url: string): boolean {
    // Regex, parses segments separated by @ and .
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return url.length <= 254 && pattern.test(url);
}

function division(div: string): boolean {
    return div === "Junior" || div === "Senior" || div === "Elementary";
}

function gender(gender: string): boolean {
    // Can be configured differently later (once we have full list)
    return (
        gender === "M" ||
        gender === "F" ||
        gender === "O" ||
        gender === "N" ||
        gender === "Z"
    );
}

function team(t: string): boolean {
    return t === "True" || t === "False";
}

function release(t: string): boolean {
    return t === "Yes" || t === "No";
}

// Helper functions
function isUpper(c: string): boolean {
    return c >= "A" && c <= "Z";
}

function isLower(c: string): boolean {
    return c >= "a" && c <= "z";
}

function isNum(c: string): boolean {
    return c >= "0" && c <= "9";
}

main();
