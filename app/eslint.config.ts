import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import preferArrowPlugin from 'eslint-plugin-prefer-arrow';
import prettierPlugin from 'eslint-plugin-prettier';
import react from 'eslint-plugin-react';
import reactCompiler from 'eslint-plugin-react-compiler';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import ts from 'typescript-eslint';
import { fileURLToPath } from 'node:url';

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

export default defineConfig(
	includeIgnoreFile(gitignorePath),
	{
		ignores: ['src/api/generated/**']
	},
	js.configs.recommended,
	...ts.configs.recommended,
	prettier,
	reactHooks.configs.flat.recommended,
	reactCompiler.configs.recommended,
	{
		rules: {
			'react-hooks/exhaustive-deps': 'off'
		}
	},
	{
		languageOptions: {
			globals: { ...globals.browser, ...globals.node }
		},
		plugins: {
			import: importPlugin,
			'prefer-arrow': preferArrowPlugin,
			prettier: prettierPlugin,
			react
		},
		settings: {
			react: {
				version: 'detect'
			}
		},
		rules: {
			// Prettier integration
			'prettier/prettier': 'warn',
			// typescript-eslint strongly recommend that you do not use the no-undef lint rule on TypeScript projects.
			'no-undef': 'off',
			'react/react-in-jsx-scope': 'off',
			'react/prop-types': 'off',
			// Import ordering
			'import/order': [
				1,
				{
					groups: ['external', 'builtin', 'internal', 'sibling', 'parent', 'index'],
					pathGroups: [
						{ pattern: '@/components/**', group: 'internal' },
						{ pattern: '@/stores/**', group: 'internal' },
						{ pattern: '@/services/**', group: 'internal' },
						{ pattern: '@/utils/**', group: 'internal', position: 'after' },
						{ pattern: '@/**', group: 'internal' }
					],
					pathGroupsExcludedImportTypes: ['internal'],
					alphabetize: { order: 'asc', caseInsensitive: true }
				}
			],
			// TypeScript naming conventions
			'@typescript-eslint/naming-convention': [
				'error',
				{
					format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
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
					format: ['PascalCase', 'UPPER_CASE'],
					selector: 'typeLike'
				},
				{
					filter: {
						match: false,
						regex: '^[a-zA-Z\\-]*$'
					},
					format: ['camelCase', 'snake_case'],
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
	// TypeScript files with type-aware rules
	{
		files: ['**/*.ts', '**/*.tsx'],
		languageOptions: {
			parserOptions: {
				projectService: {
					allowDefaultProject: ['e2e/*.ts']
				}
			}
		},
		rules: {
			'@typescript-eslint/no-unnecessary-condition': 'warn',
			'@typescript-eslint/strict-boolean-expressions': 'off'
		}
	},
	// CommonJS files
	{
		files: ['**/*.cjs'],
		rules: {
			'@typescript-eslint/no-require-imports': 'off'
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
			'**/playwright.config.ts',
			'eslint.config.ts'
		],
		rules: {
			'@typescript-eslint/naming-convention': 'off',
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
