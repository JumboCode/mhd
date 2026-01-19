import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginNext from "@next/eslint-plugin-next";
import eslintConfigPrettier from "eslint-config-prettier/flat";

export default [
    js.configs.recommended,
    ...tseslint.configs.recommended,
    pluginReact.configs.flat.recommended,
    eslintConfigPrettier,
    "prettier",
    {
        files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
    },
    {
        plugins: {
            "@next/next": pluginNext,
        },
        rules: {
            ...pluginNext.configs.recommended.rules,
            ...pluginNext.configs["core-web-vitals"].rules,
        },
    },
    {
        settings: {
            react: {
                version: "detect",
            },
        },
    },
    {
        rules: {
            "no-console": "warn",
            "no-var": "error",
            "semi": ["warn", "always"],
            "eqeqeq": ["error", "always"],
            "@next/next/no-img-element": "warn",
            "react/react-in-jsx-scope": "off",
            "react/prop-types": "off",
        },
    },
];
