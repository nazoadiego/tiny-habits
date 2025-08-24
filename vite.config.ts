/// <reference types="vitest" />

import { configDefaults } from 'vitest/config'
import { defineConfig } from 'vite'

export default defineConfig({
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
