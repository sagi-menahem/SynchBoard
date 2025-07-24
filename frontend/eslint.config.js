// frontend/eslint.config.js
import eslintConfigPrettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y'; // For accessibility rules
import pluginReactConfig from 'eslint-plugin-react/configs/recommended.js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// This is the new, modern way to configure ESLint v9+
export default tseslint.config(
    // Apply recommended and strict rules to all files
    ...tseslint.configs.strict,
    ...tseslint.configs.stylistic,

    // Apply React specific rules
    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        ...pluginReactConfig,
        settings: {
            react: { version: 'detect' },
        },
    },

    // Apply accessibility rules to JSX/TSX files
    {
        files: ['**/*.{jsx,tsx}'],
        ...jsxA11y.configs.recommended,
    },

    // Custom rules, import order, and global settings
    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        languageOptions: {
            globals: { ...globals.browser, ...globals.node },
        },
        plugins: {
            import: importPlugin,
        },
        rules: {
            'react/react-in-jsx-scope': 'off', // Not needed with modern React/Vite
            'import/order': [
                'error',
                {
                    groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object'],
                    pathGroups: [
                        { pattern: 'react', group: 'external', position: 'before' },
                        { pattern: '{components,constants,context,hooks,pages,services,types}/**', group: 'internal' },
                    ],
                    pathGroupsExcludedImportTypes: ['react'],
                    'newlines-between': 'always',
                    alphabetize: { order: 'asc', caseInsensitive: true },
                },
            ],
        },
    },

    // This must be the VERY LAST configuration to disable styling rules
    eslintConfigPrettier
);
