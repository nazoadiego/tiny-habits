/// <reference types="vitest" />

import { configDefaults } from 'vitest/config'
import { defineConfig } from 'vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const platformPath = path.dirname(fileURLToPath(import.meta.url))

// Mirrors the bare imports that tsconfig's baseUrl allows (e.g. 'models/Habit').
const SOURCE_FOLDERS = ['app', 'components', 'models', 'platform', 'repositories', 'stores', 'UI']

export const sourceAliases = Object.fromEntries(
	SOURCE_FOLDERS.map(folder => [folder, path.resolve(platformPath, folder)])
)

export default defineConfig({
	resolve: {
		alias: sourceAliases
	},
	test: {
		globals: true,
		coverage: {
			provider: 'v8',
			enabled: true,
			exclude: [
				...configDefaults.exclude,
				'main.js',
				'version-bump.mjs',
				'**/*.config.*'
			]
		}
	}
})
