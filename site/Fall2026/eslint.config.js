import eslint from "@eslint/js";
import jsdoc from "eslint-plugin-jsdoc";

const stylecopDocumentation = {
    rules: {
        "require-parameters-and-returns": {
            meta: {
                type: "problem",
                docs: {
                    description:
                        "Require StyleCop-like parameter and return descriptions."
                },
                schema: [],
                messages: {
                    parameters:
                        "Document function parameters with a Parameters: section.",
                    returns:
                        "Document function return values with a Returns: section."
                }
            },
            create(context) {
                const sourceCode = context.sourceCode;

                function hasValueReturn(node) {
                    if (node.type === "ReturnStatement") {
                        return node.argument !== null;
                    }

                    if (
                        node !== context.getAncestors().at(-1) &&
                        [
                            "FunctionDeclaration",
                            "FunctionExpression",
                            "ArrowFunctionExpression"
                        ].includes(node.type)
                    ) {
                        return false;
                    }

                    return Object.keys(node).some((key) => {
                        const child = node[key];

                        if (key === "parent" || child === null) {
                            return false;
                        }

                        if (Array.isArray(child)) {
                            return child.some(
                                (item) =>
                                    item &&
                                    typeof item.type === "string" &&
                                    hasValueReturn(item)
                            );
                        }

                        return (
                            typeof child === "object" &&
                            typeof child.type === "string" &&
                            hasValueReturn(child)
                        );
                    });
                }

                function getDocumentation(node) {
                    return sourceCode
                        .getCommentsBefore(node)
                        .filter((comment) => comment.type === "Block")
                        .map((comment) => comment.value)
                        .join("\n");
                }

                return {
                    FunctionDeclaration(node) {
                        const documentation = getDocumentation(node);

                        if (
                            node.params.length > 0 &&
                            !/\bParameters\s*:/u.test(documentation)
                        ) {
                            context.report({
                                node,
                                messageId: "parameters"
                            });
                        }

                        if (
                            hasValueReturn(node.body) &&
                            !/\bReturns\s*:/u.test(documentation)
                        ) {
                            context.report({
                                node,
                                messageId: "returns"
                            });
                        }
                    }
                };
            }
        }
    }
};

export default [
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
            jsdoc,
            stylecop: stylecopDocumentation
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
            "prefer-const": "off",

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

            // Require a description in JSDoc comments
            "jsdoc/require-description": "error",

            // Require StyleCop-like parameter and return descriptions
            "stylecop/require-parameters-and-returns": "error"
        }
    }
];
