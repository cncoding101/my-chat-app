import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import globals from 'globals';
import ts from 'typescript-eslint';

export default defineConfig(
	{
		ignores: ['dist/**', 'node_modules/**', 'eslint.config.ts']
	},
	js.configs.recommended,
	...ts.configs.recommended,
	prettier,
	{
		languageOptions: {
			globals: { ...globals.node }
		},
		plugins: {
			prettier: prettierPlugin
		},
		rules: {
			'prettier/prettier': 'warn',
			'no-undef': 'off',
			'no-console': 'off',
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
			]
		}
	},
	{
		files: ['**/*.ts'],
		languageOptions: {
			parserOptions: {
				projectService: {
					allowDefaultProject: ['*.ts', 'scripts/*.ts']
				}
			}
		}
	}
);
