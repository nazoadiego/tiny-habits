import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { sourceAliases } from '../vite.config'

const developmentFolder = path.dirname(fileURLToPath(import.meta.url))

// The localhost dev page: the habit tables on an in-memory Platform, no Obsidian needed.
export default defineConfig({
	root: developmentFolder,
	plugins: [svelte({ configFile: false })],
	resolve: {
		alias: sourceAliases
	},
	server: {
		port: 5173
	}
})
