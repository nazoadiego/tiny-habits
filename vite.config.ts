/// <reference types="vitest" />

import { configDefaults } from 'vitest/config'
import { defineConfig } from 'vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const platformPath = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
	resolve: {
		alias: {
			models: path.resolve(platformPath, 'models'),
			UI: path.resolve(platformPath, 'UI')
		}
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
