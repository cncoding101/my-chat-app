import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import preferArrowPlugin from 'eslint-plugin-prefer-arrow';
import prettierPlugin from 'eslint-plugin-prettier';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';
import { fileURLToPath } from 'node:url';
import svelteConfig from './svelte.config.js';

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

export default defineConfig(
	includeIgnoreFile(gitignorePath),
	{
		ignores: ['eslint.config.js']
	},
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	prettier,
	...svelte.configs.prettier,
	{
		languageOptions: {
			globals: { ...globals.browser, ...globals.node }
		},
		plugins: {
			import: importPlugin,
			'prefer-arrow': preferArrowPlugin,
			prettier: prettierPlugin
		},
		rules: {
			// Prettier integration
			'prettier/prettier': 'warn',
			// typescript-eslint strongly recommend that you do not use the no-undef lint rule on TypeScript projects.
			// see: https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
			'no-undef': 'off',
			// Import ordering
			'import/order': [
				1,
				{
					groups: ['external', 'builtin', 'internal', 'sibling', 'parent', 'index'],
					pathGroups: [
						{ pattern: '$lib/components/**', group: 'internal' },
						{ pattern: '$lib/stores/**', group: 'internal' },
						{ pattern: '$lib/services/**', group: 'internal' },
						{ pattern: '$lib/utils/**', group: 'internal', position: 'after' },
						{ pattern: '$lib/**', group: 'internal' }
					],
					pathGroupsExcludedImportTypes: ['internal'],
					alphabetize: { order: 'asc', caseInsensitive: true }
				}
			],
			// TypeScript naming conventions
			'@typescript-eslint/naming-convention': [
				'error',
				{
					format: ['camelCase', 'UPPER_CASE', 'snake_case'],
					leadingUnderscore: 'allow',
					selector: ['variable', 'parameter', 'method'],
					trailingUnderscore: 'forbid'
				},
				{
					filter: {
						match: false,
						regex: '^[a-zA-Z\\-]*$'
					},
					format: ['camelCase', 'UPPER_CASE', 'snake_case'],
					leadingUnderscore: 'allow',
					selector: 'property',
					trailingUnderscore: 'forbid'
				},
				{
					format: ['PascalCase', 'camelCase'],
					selector: 'typeLike'
				},
				{
					filter: {
						match: false,
						regex: '^[a-zA-Z\\-]*$'
					}, // filter out kebab-case, i.e. allow kebab-case
					format: ['camelCase', 'PascalCase', 'snake_case'],
					leadingUnderscore: 'allowSingleOrDouble',
					selector: 'typeProperty'
				}
			],
			'no-console': 'off',
			// General rules
			'no-duplicate-imports': 'off',
			'no-negated-condition': 'error',
			'no-param-reassign': [
				'error',
				{
					ignorePropertyModificationsForRegex: ['^draft', 'acc', 'req', 'request'],
					props: true
				}
			],
			'prefer-arrow/prefer-arrow-functions': [
				'error',
				{
					disallowPrototype: true,
					singleReturnOnly: false
				}
			],
			// Unused modules check (off by default, enable for cleanup)
			'import/no-unused-modules': [
				'off',
				{
					ignoreExports: [],
					unusedExports: true
				}
			]
		}
	},
	// TypeScript files with type-aware rules (only for src directory)
	{
		files: ['**/*.ts', '**/*.tsx'],
		languageOptions: {
			parserOptions: {
				projectService: true
			}
		},
		rules: {
			'@typescript-eslint/no-unnecessary-condition': 'warn',
			'@typescript-eslint/strict-boolean-expressions': 'off'
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser,
				svelteConfig
			}
		},
		rules: {
			// Disable svelte/no-navigation-without-resolve for component libraries
			// Generic UI components should accept any href without resolve()
			'svelte/no-navigation-without-resolve': 'off'
		}
	},
	// Config files exceptions
	{
		files: [
			'**/vitest.config*.js',
			'**/vitest.workspace.js',
			'**/webpack.config.js',
			'**/vite.config.js',
			'**/vite.config.ts',
			'**/svelte.config.js',
			'**/playwright.config.ts',
			'**/eslint.config.js'
		],
		rules: {
			'@typescript-eslint/no-var-requires': 'off',
			'@typescript-eslint/no-unnecessary-condition': 'off',
			'@typescript-eslint/strict-boolean-expressions': 'off',
			'import/no-extraneous-dependencies': 'off',
			'import/no-unresolved': 'off'
		}
	},
	{
		files: ['*.spec.{ts,tsx,js}', '**/*.test.{ts,tsx,js}', 'e2e/**/*.ts'],
		rules: {
			'@typescript-eslint/consistent-type-imports': 'off',
			'@typescript-eslint/no-unnecessary-condition': 'off',
			'@typescript-eslint/strict-boolean-expressions': 'off',
			'no-restricted-globals': 'off'
		}
	}
);
