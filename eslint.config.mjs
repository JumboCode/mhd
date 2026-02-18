import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import tseslint from "typescript-eslint";
 
const eslintConfig = defineConfig([
    ...nextVitals,
    tseslint.configs.recommended,
    {
        rules: {
            "no-console": "warn",
            "no-var": "error",
            "semi": ["warn", "always"],
            "eqeqeq": ["error", "always"],
            "@next/next/no-img-element": "warn",
            "react/react-in-jsx-scope": "off",
            "react/prop-types": "off",
            "react-hooks/set-state-in-effect": "off",
            "react-hooks/exhaustive-deps": "off",
            "@typescript-eslint/no-unused-vars": ["error", { "caughtErrors": "none" }],
            "react-hooks/refs": "off",
            "react-hooks/preserve-manual-memoization": "off",
            "react-hooks/incompatible-library": "off",
        },
    },  
    // Override default ignores of eslint-config-next.
    globalIgnores([
        // Default ignores of eslint-config-next:
        '.next/**',
        'out/**',
        'build/**',
        'next-env.d.ts',
        '.vercel/**',
        '/node_modules/**'
    ]),
]);

export default eslintConfig;