const eslint = require('@eslint/js');
const globals = require('globals');
const tsEslint = require('typescript-eslint');
const eslintConfigPrettier = require('eslint-config-prettier');

module.exports = [
    {
        ignores: ['**/eslint.config.js'],
    },

    eslint.configs.recommended,
    ...tsEslint.configs.recommendedTypeChecked,
    ...tsEslint.configs.stylisticTypeChecked,
    eslintConfigPrettier,

    {
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.jest,
            },

            parser: tsEslint.parser,
            parserOptions: {
                projectService: true,
                tsconfigRootDir: __dirname,
            },
        },
        rules: {
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/interface-name-prefix': 'off',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/prefer-nullish-coalescing': 'off',
            '@typescript-eslint/no-empty-object-type': 'off',
            '@typescript-eslint/dot-notation': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off',
        },
    },
];
