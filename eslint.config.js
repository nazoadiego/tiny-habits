import globals from 'globals';
import svelteConfig from './svelte.config.js';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import ts from 'typescript-eslint';
import eslintPluginUnicorn from 'eslint-plugin-unicorn'
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig(
	globalIgnores(['main.js', 'version-bump.mjs', 'esbuild.config.mjs', './coverage']),
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	eslintPluginUnicorn.configs.recommended,
	{
		languageOptions: {
			globals: { ...globals.browser, ...globals.node }
		},
		rules: { 
			// typescript-eslint strongly recommend that you do not use the no-undef lint rule on TypeScript projects.
			// see: https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
			"no-undef": 'off',
			"indent": ["error", "tab"],
			"array-bracket-newline": ["error", "consistent"],
			"block-spacing": ["error", "always"],
			"comma-dangle": ["error", "never"],
			"brace-style": ["error", "stroustrup", { "allowSingleLine": true }],
			"comma-spacing": ["error", { "before": false, "after": true }],
			"arrow-spacing": ["error", { "before": true, "after": true }],
			"max-statements-per-line": ["error", { "max": 1 }],
			"no-mixed-operators": "error",
			"object-curly-newline": ["error", { "consistent": true }],
			"object-curly-spacing": ["error", "always"],
			"unicorn/filename-case": 'off',
			"unicorn/no-empty-file": 'warn',
			"unicorn/no-useless-undefined": 'off',
			"unicorn/prevent-abbreviations": [
				"error",
				{
					"replacements": {
						"props": {
							"properties": false
						}
					}
				}
			]
		}
	},
	{
		files: [
			'**/*.svelte'
		],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser,
				svelteConfig
			}
		}
	})
