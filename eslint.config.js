import globals from 'globals'
import svelteConfig from './svelte.config.js'
import js from '@eslint/js'
import svelte from 'eslint-plugin-svelte'
import ts from 'typescript-eslint'
import eslintPluginUnicorn from 'eslint-plugin-unicorn'
import { defineConfig, globalIgnores } from 'eslint/config'
import stylistic from '@stylistic/eslint-plugin'
import jsdoc from 'eslint-plugin-jsdoc'

export default defineConfig(

	globalIgnores(['main.js', 'version-bump.mjs', 'esbuild.config.mjs', './coverage']),
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	jsdoc.configs['flat/recommended-typescript'],
	jsdoc.configs['flat/stylistic-typescript'],
	eslintPluginUnicorn.configs.recommended,
	{
		plugins: {
			'@stylistic': stylistic,
			jsdoc
		},
		languageOptions: {
			globals: { ...globals.browser, ...globals.node }
		},
		rules: {
			/*
			 typescript-eslint strongly recommend that you do not use the no-undef lint rule on TypeScript projects.
			 see: https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
			*/
			'no-undef': 'off',

			'array-bracket-newline': ['error', 'consistent'],
			'block-spacing': ['error', 'always'],
			'comma-dangle': ['error', 'never'],
			'brace-style': ['error', 'stroustrup', { allowSingleLine: true }],
			'comma-spacing': ['error', { before: false, after: true }],
			'arrow-spacing': ['error', { before: true, after: true }],
			'max-statements-per-line': ['error', { max: 1 }],
			'no-mixed-operators': 'error',

			// Stylistic, source: https://eslint.style/
			'@stylistic/indent': ['error', 'tab'],
			'@stylistic/no-mixed-spaces-and-tabs': ['error', 'smart-tabs'],
			'@stylistic/no-trailing-spaces': 'error',
			'object-curly-newline': ['error', { consistent: true }],
			'object-curly-spacing': ['error', 'always'],
			'@stylistic/eol-last': ['error', 'always'],
			'@stylistic/function-call-argument-newline': ['error', 'consistent'],
			'@stylistic/multiline-comment-style': ['error', 'bare-block'],
			'@stylistic/spaced-comment': ['error', 'always', { block: { balanced: true } }],
			'@stylistic/quotes': ['error', 'single'],
			'@stylistic/semi': ['error', 'never'],
			'@stylistic/quote-props': ['error', 'as-needed'],


			// JSDoc
			'jsdoc/require-jsdoc': 'off',
			'jsdoc/require-param': 'off',
			'jsdoc/require-returns': 'off',
			'jsdoc/require-asterisk-prefix': ['error', 'never'],
			'jsdoc/check-alignment': 'off',

			// Linting
			'unicorn/filename-case': 'off',
			'unicorn/no-empty-file': 'warn',
			'unicorn/switch-case-braces': ['error', 'avoid'],
			'unicorn/no-useless-undefined': 'off',
			'unicorn/prevent-abbreviations': [
				'error',
				{
					replacements: {
						props: {
							properties: false
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
		},
		rules: {
			'svelte/indent': ['error', {
				indent: 'tab',
				alignAttributesVertically: true
			}]
		}
	})
