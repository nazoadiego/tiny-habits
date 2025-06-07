import { includeIgnoreFile } from '@eslint/compat';
import { fileURLToPath } from 'node:url';
import globals from 'globals';
import svelteConfig from './svelte.config.js';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import ts from 'typescript-eslint';
import eslintPluginUnicorn from 'eslint-plugin-unicorn'
import { defineConfig, globalIgnores } from "eslint/config";

const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url));

export default defineConfig(
	includeIgnoreFile(gitignorePath),
	globalIgnores(['version-bump.mjs', 'esbuild.config.mjs']),
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
      "unicorn/filename-case": 'off',
			"unicorn/no-empty-file": 'warn',
      "unicorn/no-useless-undefined": 'off',
      "unicorn/prevent-abbreviations": [
        "error",
        {
          "replacements": {
            "props": {
              "properties": false
            },
          }
        }
      ]
    },
	},
	{
		files: [
			'**/*.svelte',
			'**/*.svelte.ts',
			'**/*.svelte.js'
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
