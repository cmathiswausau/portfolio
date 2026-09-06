import eslint from "@eslint/js";
import jsdoc from "eslint-plugin-jsdoc";

export default [
        {
        ignores: ["site/Fall2026/**"]
    },
    eslint.configs.recommended,

    {
        languageOptions: {
            ecmaVersion: 2021,
            globals: {
                console: "readonly",
                document: "readonly"
            }
        },

        plugins: {
            jsdoc
        },

        rules: {
            // ========================================
            // Formatting
            // ========================================

            // Statements must end with semicolons
            semi: ["error", "always"],

            // Use double quotes
            quotes: ["error", "double"],

            // 4-space indentation
            indent: ["error", 4],

            // Require braces around blocks
            curly: ["error", "all"],

            // Space before function parentheses
            "space-before-function-paren": [
                "error",
                {
                    anonymous: "always",
                    named: "never",
                    asyncArrow: "always"
                }
            ],

            // Don't allow unnecessary trailing spaces
            "no-trailing-spaces": "error",

            // Require a newline at the end of the file
            "eol-last": ["error", "always"],

            // ========================================
            // Code Quality
            // ========================================

            // Don't use ==; use ===
            eqeqeq: ["error", "always"],

            // Don't leave unused variables around
            "no-unused-vars": ["error"],

            // Don't use var
            "no-var": "error",

            // Prefer const when a variable isn't reassigned
            "prefer-const": "error",

            // ========================================
            // JSDoc Documentation
            // ========================================

            // Require JSDoc comments on classes,
            // functions, and methods
            "jsdoc/require-jsdoc": [
                "error",
                {
                    require: {
                        ClassDeclaration: true,
                        FunctionDeclaration: true,
                        FunctionExpression: true,
                        MethodDefinition: true
                    }
                }
            ],

            // Require documentation for parameters
            "jsdoc/require-param": "error",

            // Require documentation for return values
            "jsdoc/require-returns": "error",

            // Require a description in JSDoc comments
            "jsdoc/require-description": "error"
        }
    }
];
