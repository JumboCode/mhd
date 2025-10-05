module.exports = {
    purge: [],
    darkMode: false, // or 'media' or 'class'
    theme: {
        extend: {
            fontFamily: {
                sans: ["var(--font-interstate)"],
                serif: ["var(--font-miller-text)"],
                display: [
                    "var(--font-miller-display)",
                    "var(--font-miller-text)",
                ],
                banner: [
                    "var(--font-miller-banner)",
                    "var(--font-miller-text)",
                ],
            },
        },
    },
    variants: {
        extend: {},
    },
    plugins: [],
};
